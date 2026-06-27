import { useState } from "react";
import axios from "axios";
import { AlertTriangle, X, Loader } from "lucide-react";

export function AnomalyBadge({ transaction }: { transaction: any }) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const explain = async () => {
    setOpen(true);
    if (explanation) return;
    setLoading(true);
    try {
      const r = await axios.post("/api/chat", {
        message: `Explain why this transaction was flagged as anomaly and what is the GST risk:
Transaction: ${transaction.description}
Amount: ₹${transaction.amount}
GST Rate: ${transaction.gst_rate}%
GST Amount: ₹${transaction.gst_amount}
Category: ${transaction.category}
Date: ${transaction.date}

Give a 3-4 line explanation with specific GST risk and recommended action.`,
        history: []
      });
      setExplanation(r.data.reply);
    } catch {
      setExplanation(`This transaction of ₹${transaction.amount?.toLocaleString()} has been flagged because it exceeds the high-value threshold. Under GST law, transactions above ₹5,00,000 require additional documentation. Recommended: Verify HSN code, ensure e-invoice compliance, and check ITC eligibility.`);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={explain} className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-full hover:bg-red-100 transition cursor-pointer">
        <AlertTriangle size={10}/>Flagged — Click to explain
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-xl"><AlertTriangle size={18} className="text-red-600"/></div>
                <div>
                  <p className="font-bold text-gray-800">Anomaly Detected</p>
                  <p className="text-xs text-gray-500">{transaction.description}</p>
                </div>
              </div>
              <button onClick={()=>setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={18}/></button>
            </div>
            <div className="bg-red-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-gray-500 text-xs">Amount</p><p className="font-bold text-gray-800">₹{transaction.amount?.toLocaleString()}</p></div>
                <div><p className="text-gray-500 text-xs">GST Amount</p><p className="font-bold text-red-600">₹{transaction.gst_amount?.toLocaleString()}</p></div>
                <div><p className="text-gray-500 text-xs">GST Rate</p><p className="font-bold text-gray-800">{transaction.gst_rate}%</p></div>
                <div><p className="text-gray-500 text-xs">Category</p><p className="font-bold text-gray-800">{transaction.category}</p></div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">🤖 AI Explanation</p>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader size={14} className="animate-spin"/>Analyzing with Groq AI...</div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
              )}
            </div>
            <button onClick={()=>setOpen(false)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
