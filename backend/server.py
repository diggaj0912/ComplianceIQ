from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import json
import os
from datetime import datetime, date
from dotenv import load_dotenv
from db import get_db, engine
import models
from sqlalchemy.orm import Session
from fastapi import Depends
import io

load_dotenv()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ComplianceIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GST CONFIG ───────────────────────────────────────────
GST_RATES = {"0": 0, "5": 0.05, "12": 0.12, "18": 0.18, "28": 0.28}

# ─── SCHEMAS ──────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: Optional[list] = []

class BusinessContext(BaseModel):
    company_name: str
    gstin: str
    filing_period: str

# ─── HEALTH ───────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# ─── DASHBOARD ────────────────────────────────────────────
@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    total = len(transactions)
    total_amount = sum(t.amount for t in transactions)
    total_gst = sum(t.gst_amount for t in transactions)
    flagged = sum(1 for t in transactions if t.is_anomaly)
    
    risk_score = min(100, int((flagged / max(total, 1)) * 100) + 10)
    
    monthly = {}
    for t in transactions:
        month = t.date[:7] if t.date else "2025-01"
        if month not in monthly:
            monthly[month] = {"month": month, "amount": 0, "gst": 0, "count": 0}
        monthly[month]["amount"] += t.amount
        monthly[month]["gst"] += t.gst_amount
        monthly[month]["count"] += 1
    
    return {
        "total_transactions": total,
        "total_amount": round(total_amount, 2),
        "total_gst_liability": round(total_gst, 2),
        "flagged_transactions": flagged,
        "risk_score": risk_score,
        "compliance_status": "Healthy" if risk_score < 30 else "At Risk" if risk_score < 60 else "Critical",
        "monthly_data": sorted(monthly.values(), key=lambda x: x["month"])
    }

# ─── TRANSACTIONS ─────────────────────────────────────────
@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).order_by(models.Transaction.id.desc()).limit(100).all()
    return [{"id": t.id, "date": t.date, "description": t.description,
             "amount": t.amount, "gst_rate": t.gst_rate, "gst_amount": t.gst_amount,
             "category": t.category, "is_anomaly": t.is_anomaly} for t in txns]

@app.post("/api/transactions/upload")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only CSV files allowed")
    
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    df.columns = [c.strip().lower() for c in df.columns]
    
    added = 0
    for _, row in df.iterrows():
        amount = float(row.get("amount", row.get("value", 0)))
        gst_rate = float(row.get("gst_rate", row.get("tax_rate", 18)))
        gst_amount = amount * (gst_rate / 100)
        is_anomaly = amount > 500000 or amount < 0
        
        txn = models.Transaction(
            date=str(row.get("date", date.today())),
            description=str(row.get("description", row.get("desc", "Transaction"))),
            amount=amount,
            gst_rate=gst_rate,
            gst_amount=round(gst_amount, 2),
            category=str(row.get("category", "General")),
            is_anomaly=is_anomaly
        )
        db.add(txn)
        added += 1
    
    db.commit()
    
    audit = models.AuditLog(action=f"CSV Upload: {file.filename}", detail=f"{added} transactions imported")
    db.add(audit)
    db.commit()
    
    return {"message": f"Successfully imported {added} transactions", "count": added}

# ─── GST CENTRE ───────────────────────────────────────────
@app.get("/api/gst")
def gst_summary(db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).all()
    
    buckets = {"0": 0, "5": 0, "12": 0, "18": 0, "28": 0}
    total_gst = 0
    total_itc = 0
    
    for t in transactions:
        rate_key = str(int(t.gst_rate))
        if rate_key in buckets:
            buckets[rate_key] += t.gst_amount
        total_gst += t.gst_amount
        if t.category in ["Input", "Purchase", "Raw Material", "Office Supplies"]:
            total_itc += t.gst_amount
    
    net_payable = max(0, total_gst - total_itc)
    
    return {
        "total_gst_liability": round(total_gst, 2),
        "total_itc": round(total_itc, 2),
        "net_payable": round(net_payable, 2),
        "rate_buckets": {k: round(v, 2) for k, v in buckets.items()},
        "filing_due": "2025-07-20",
        "status": "Filed" if net_payable == 0 else "Pending"
    }

# ─── CALENDAR ─────────────────────────────────────────────
@app.get("/api/calendar")
def compliance_calendar():
    return {"deadlines": [
        {"id": 1, "title": "GSTR-1 Filing", "due_date": "2025-07-11", "status": "Upcoming", "type": "GST"},
        {"id": 2, "title": "GSTR-3B Filing", "due_date": "2025-07-20", "status": "Upcoming", "type": "GST"},
        {"id": 3, "title": "TDS Payment", "due_date": "2025-07-07", "status": "Upcoming", "type": "TDS"},
        {"id": 4, "title": "Advance Tax Q1", "due_date": "2025-06-15", "status": "Completed", "type": "Income Tax"},
        {"id": 5, "title": "GSTR-1 (May)", "due_date": "2025-06-11", "status": "Completed", "type": "GST"},
        {"id": 6, "title": "GSTR-9 Annual", "due_date": "2025-12-31", "status": "Upcoming", "type": "GST"},
    ]}

# ─── AUDIT TRAIL ──────────────────────────────────────────
@app.get("/api/audit")
def audit_trail(db: Session = Depends(get_db)):
    logs = db.query(models.AuditLog).order_by(models.AuditLog.id.desc()).limit(50).all()
    return [{"id": l.id, "action": l.action, "detail": l.detail, "timestamp": l.timestamp} for l in logs]

# ─── AI CHAT ──────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest, db: Session = Depends(get_db)):
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        txns = db.query(models.Transaction).count()
        total_gst = sum(t.gst_amount for t in db.query(models.Transaction).all())
        flagged = db.query(models.Transaction).filter(models.Transaction.is_anomaly == True).count()
        
        system_prompt = f"""You are ComplianceIQ, an expert AI assistant for Indian GST and corporate tax compliance.

Current business data:
- Total transactions: {txns}
- Total GST liability: ₹{round(total_gst, 2)}
- Flagged anomalies: {flagged}
- Filing period: July 2025

You help with:
- GST calculations (CGST, SGST, IGST)
- ITC (Input Tax Credit) optimization
- GSTR-1, GSTR-3B filing guidance
- Tax deadline reminders
- Anomaly explanation

Always respond in a professional but friendly tone. Use ₹ for amounts. Be specific and actionable."""

        messages = [{"role": "system", "content": system_prompt}]
        for h in req.history[-6:]:
            messages.append(h)
        messages.append({"role": "user", "content": req.message})
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        
        audit = models.AuditLog(action="AI Chat Query", detail=req.message[:100])
        db.add(audit)
        db.commit()
        
        return {"reply": reply, "model": "llama-3.3-70b-versatile", "provider": "groq"}
    
    except Exception as e:
        return {"reply": f"I'm here to help with your GST compliance. Based on your data, you have {db.query(models.Transaction).count()} transactions recorded. How can I assist you?", "provider": "mock"}

# ─── REPORTS ──────────────────────────────────────────────
@app.get("/api/reports/summary")
def reports_summary(db: Session = Depends(get_db)):
    txns = db.query(models.Transaction).all()
    total = sum(t.amount for t in txns)
    gst = sum(t.gst_amount for t in txns)
    
    by_category = {}
    for t in txns:
        if t.category not in by_category:
            by_category[t.category] = {"amount": 0, "gst": 0, "count": 0}
        by_category[t.category]["amount"] += t.amount
        by_category[t.category]["gst"] += t.gst_amount
        by_category[t.category]["count"] += 1
    
    return {
        "period": "2025-26",
        "total_revenue": round(total, 2),
        "total_gst": round(gst, 2),
        "effective_rate": round((gst/total*100) if total > 0 else 0, 2),
        "by_category": by_category,
        "generated_at": datetime.now().isoformat()
    }
