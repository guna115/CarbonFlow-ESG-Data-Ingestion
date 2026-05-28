import { Link, Outlet, useLocation } from 'react-router-dom'
import { Activity, UploadCloud, CheckSquare, LayoutDashboard } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Data', icon: UploadCloud },
  { path: '/review', label: 'Review & Audit', icon: CheckSquare },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Activity className="w-6 h-6 text-emerald-500 mr-2" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
            CarbonFlow
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={clsx(
                      'flex items-center px-3 py-2 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                    )}
                  >
                    <Icon className={clsx("w-5 h-5 mr-3 transition-colors", isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800 text-sm text-slate-500">
          <p>Tenant: Breathe ESG Test Corp</p>
          <p className="mt-1 text-xs">Analyst View</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <h1 className="text-lg font-medium text-slate-200">
            {navItems.find((i) => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
