from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from sqlalchemy.sql import func
from db import Base
from datetime import datetime

class Transaction(Base):
	__tablename__ = "transactions"
	id = Column(Integer, primary_key=True, index=True)
	date = Column(String)
	description = Column(String)
	amount = Column(Float, default=0)
	gst_rate = Column(Float, default=18)
	gst_amount = Column(Float, default=0)
	category = Column(String, default="General")
	is_anomaly = Column(Boolean, default=False)

class AuditLog(Base):
	__tablename__ = "audit_logs"
	id = Column(Integer, primary_key=True, index=True)
	action = Column(String)
	detail = Column(Text)
	timestamp = Column(String, default=lambda: datetime.now().isoformat())
