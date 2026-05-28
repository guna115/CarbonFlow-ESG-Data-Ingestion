
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

// Dummy stats for prototype dashboard
const stats = [
  { name: 'Pending Reviews', value: '12', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { name: 'Approved Records', value: '435', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Anomalies Detected', value: '3', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { name: 'Total Emissions (tCO2e)', value: '1,204.5', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 group hover:border-slate-700 transition-colors shadow-lg">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-slate-100 mt-1">{stat.value}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm text-slate-200">SAP Fuel Export uploaded</p>
                <p className="text-xs text-slate-500">2 hours ago by Analyst</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">Success</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div>
                <p className="text-sm text-slate-200">Utility Bill (Green Button) processed</p>
                <p className="text-xs text-slate-500">5 hours ago by Auto-sync</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/20">Needs Review</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-lg flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-200">Ready to normalize more data?</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-sm">Head over to the upload tab to ingest SAP, Utility, or Travel records.</p>
        </div>
      </div>
    </div>
  )
}
