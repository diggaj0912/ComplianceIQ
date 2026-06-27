import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Calendar,
  MessageSquare,
  Shield,
  BarChart2,
  Upload,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const API = '/api'
const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}

function StatCard({ title, value, icon: Icon, color, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

function Dashboard() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    axios
      .get(`${API}/dashboard`)
      .then((r) => setData(r.data))
      .catch(() => {
        setData({
          total_transactions: 142,
          total_amount: 2450000,
          total_gst_liability: 441000,
          flagged_transactions: 3,
          risk_score: 18,
          compliance_status: 'Healthy',
          monthly_data: [
            { month: 'Jan', amount: 320000, gst: 57600 },
            { month: 'Feb', amount: 410000, gst: 73800 },
            { month: 'Mar', amount: 380000, gst: 68400 },
            { month: 'Apr', amount: 520000, gst: 93600 },
            { month: 'May', amount: 460000, gst: 82800 },
            { month: 'Jun', amount: 360000, gst: 64800 },
          ],
        })
      })
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-500 text-sm">Real-time GST compliance overview</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            data.compliance_status === 'Healthy' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}
        >
          {data.compliance_status}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Transactions" value={data.total_transactions} icon={FileText} color="bg-indigo-500" />
        <StatCard title="Total Revenue" value={`₹${(data.total_amount / 100000).toFixed(1)}L`} icon={TrendingUp} color="bg-violet-500" />
        <StatCard title="GST Liability" value={`₹${(data.total_gst_liability / 100000).toFixed(1)}L`} icon={Calculator} color="bg-purple-500" />
        <StatCard
          title="Risk Score"
          value={`${data.risk_score}/100`}
          icon={Shield}
          color={data.risk_score < 30 ? 'bg-green-500' : 'bg-red-500'}
          sub={`${data.flagged_transactions} flagged`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Monthly Revenue vs GST</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => `₹${(v / 1000).toFixed(0)}K`} />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="gst" fill="#a78bfa" radius={[4, 4, 0, 0]} name="GST" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">GST Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => `₹${(v / 1000).toFixed(0)}K`} />
              <Line type="monotone" dataKey="gst" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="GST" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Transactions() {
  const [txns, setTxns] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    axios
      .get(`${API}/transactions`)
      .then((r) => setTxns(r.data))
      .catch(() => {
        setTxns([
          { id: 1, date: '2025-06-01', description: 'Office Supplies', amount: 25000, gst_rate: 18, gst_amount: 4500, category: 'Office', is_anomaly: false },
          { id: 2, date: '2025-06-05', description: 'Raw Material Import', amount: 750000, gst_rate: 12, gst_amount: 90000, category: 'Raw Material', is_anomaly: true },
          { id: 3, date: '2025-06-10', description: 'Software Subscription', amount: 12000, gst_rate: 18, gst_amount: 2160, category: 'Services', is_anomaly: false },
        ])
      })
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const r = await axios.post(`${API}/transactions/upload`, fd)
      setMsg(r.data.message)
      const res = await axios.get(`${API}/transactions`)
      setTxns(res.data)
    } catch {
      setMsg('Upload failed')
    }

    setUploading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm">Upload and manage GST transactions</p>
        </div>
        <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl cursor-pointer hover:bg-indigo-700 transition">
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload CSV'}
          <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{msg}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Date', 'Description', 'Amount', 'GST Rate', 'GST Amount', 'Category', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {txns.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-600">{t.date}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{t.description}</td>
                <td className="px-4 py-3">₹{t.amount?.toLocaleString()}</td>
                <td className="px-4 py-3">{t.gst_rate}%</td>
                <td className="px-4 py-3 text-indigo-600 font-medium">₹{t.gst_amount?.toLocaleString()}</td>
                <td className="px-4 py-3">{t.category}</td>
                <td className="px-4 py-3">
                  {t.is_anomaly ? (
                    <span className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertTriangle size={12} />
                      Flagged
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle size={12} />
                      Clear
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GSTCentre() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    axios
      .get(`${API}/gst`)
      .then((r) => setData(r.data))
      .catch(() => {
        setData({
          total_gst_liability: 441000,
          total_itc: 180000,
          net_payable: 261000,
          filing_due: '2025-07-20',
          status: 'Pending',
          rate_buckets: { '0': 0, '5': 45000, '12': 98000, '18': 210000, '28': 88000 },
        })
      })
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const pieData = Object.entries(data.rate_buckets)
    .filter(([, v]: any) => v > 0)
    .map(([k, v]) => ({ name: `${k}% GST`, value: v }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GST Centre</h1>
        <p className="text-gray-500 text-sm">Automated GST liability & ITC optimization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-sm text-indigo-600 font-medium">Total GST Liability</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">₹{data.total_gst_liability?.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <p className="text-sm text-green-600 font-medium">Input Tax Credit (ITC)</p>
          <p className="text-3xl font-bold text-green-700 mt-1">₹{data.total_itc?.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
          <p className="text-sm text-purple-600 font-medium">Net Payable</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">₹{data.net_payable?.toLocaleString()}</p>
          <p className="text-xs text-purple-500 mt-1">Due: {data.filing_due}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">GST Rate Bucket Distribution</h3>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {Object.entries(data.rate_buckets).map(([rate, amount]: any) => (
              <div key={rate} className="flex items-center justify-between gap-8">
                <span className="text-sm text-gray-600">{rate}% Slab</span>
                <span className="font-semibold text-gray-800">₹{amount?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComplianceCalendar() {
  const [deadlines, setDeadlines] = useState<any[]>([])

  useEffect(() => {
    axios
      .get(`${API}/calendar`)
      .then((r) => setDeadlines(r.data.deadlines))
      .catch(() => {
        setDeadlines([
          { id: 1, title: 'GSTR-1 Filing', due_date: '2025-07-11', status: 'Upcoming', type: 'GST' },
          { id: 2, title: 'GSTR-3B Filing', due_date: '2025-07-20', status: 'Upcoming', type: 'GST' },
          { id: 3, title: 'TDS Payment', due_date: '2025-07-07', status: 'Upcoming', type: 'TDS' },
          { id: 4, title: 'Advance Tax Q1', due_date: '2025-06-15', status: 'Completed', type: 'Income Tax' },
        ])
      })
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
        <p className="text-gray-500 text-sm">Track all filing deadlines</p>
      </div>

      <div className="grid gap-3">
        {deadlines.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${d.status === 'Completed' ? 'bg-green-100' : 'bg-amber-100'}`}>
                {d.status === 'Completed' ? <CheckCircle size={20} className="text-green-600" /> : <Clock size={20} className="text-amber-600" />}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{d.title}</p>
                <p className="text-sm text-gray-500">Due: {d.due_date}</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Namaste! I'm your ComplianceIQ AI Agent. Ask me anything about GST, ITC optimization, filing deadlines, or your transaction data! 🇮🇳" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const r = await axios.post(`${API}/chat`, { message: input, history })
      setMessages((prev) => [...prev, { role: 'assistant', content: r.data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection error. Please check backend.' }])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Compliance Agent</h1>
        <p className="text-gray-500 text-sm">Powered by Groq LLM</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 flex gap-3">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"
            placeholder="Ask about GST, ITC, filing deadlines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={send} className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    axios
      .get(`${API}/audit`)
      .then((r) => setLogs(r.data))
      .catch(() => {
        setLogs([
          { id: 1, action: 'CSV Upload', detail: 'transactions_june.csv — 45 records imported', timestamp: new Date().toISOString() },
          { id: 2, action: 'AI Chat Query', detail: 'What is my net GST payable?', timestamp: new Date().toISOString() },
          { id: 3, action: 'GST Calculation', detail: 'ITC optimization run — saved ₹24,000', timestamp: new Date().toISOString() },
        ])
      })
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-gray-500 text-sm">Immutable log of all system actions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {logs.map((l) => (
            <div key={l.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition">
              <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{l.action}</p>
                <p className="text-gray-500 text-xs mt-0.5">{l.detail}</p>
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0">{new Date(l.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'gst', label: 'GST Centre', icon: Calculator },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'chat', label: 'AI Agent', icon: MessageSquare },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
]

export default function App() {
  const [page, setPage] = useState('dashboard')

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <Transactions />
      case 'gst':
        return <GSTCentre />
      case 'calendar':
        return <ComplianceCalendar />
      case 'chat':
        return <AIChat />
      case 'audit':
        return <AuditTrail />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">ComplianceIQ</p>
              <p className="text-xs text-gray-400">AI Tax Assistant</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                page === n.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <n.icon size={17} />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Alpha Coders © 2025</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
    </div>
  )
}