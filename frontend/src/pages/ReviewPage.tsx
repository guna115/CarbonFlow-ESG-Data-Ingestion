import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Check, X, FileText, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

export default function ReviewPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('PENDING')

  const { data: records, isLoading } = useQuery({
    queryKey: ['records', filter],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const res = await axios.get(`${apiUrl}/api/emissions/records/?status=${filter === 'ALL' ? '' : filter}`)
      return res.data
    }
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number, action: 'APPROVE' | 'REJECT' }) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const res = await axios.post(`${apiUrl}/api/emissions/records/${id}/review/`, { action })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Review & Audit</h2>
          <p className="text-sm text-slate-400 mt-1">Review normalized emissions before locking for audit.</p>
        </div>
        
        <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                filter === f ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Source & Category</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Scope</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Emission Value</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dates</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading records...</td>
                </tr>
              ) : records?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : (
                records?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-start">
                        <FileText className="w-4 h-4 text-slate-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-200">{record.category}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Raw ID: {record.raw_record.id}</p>
                          {record.raw_record.validation_errors && (
                            <div className="flex items-center text-amber-500 text-xs mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Has warnings
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                        Scope {record.scope}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-100">{parseFloat(record.emission_value).toLocaleString()} <span className="text-slate-500 text-xs font-normal">{record.normalized_unit}</span></p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-slate-300">{record.date_start}</p>
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2 py-1 text-xs rounded-full border flex items-center w-max",
                        record.status === 'PENDING' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                        record.status === 'APPROVED' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                        record.status === 'REJECTED' && "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {record.status === 'PENDING' && (
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => reviewMutation.mutate({ id: record.id, action: 'APPROVE' })}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-md transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => reviewMutation.mutate({ id: record.id, action: 'REJECT' })}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-md transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {record.status !== 'PENDING' && (
                        <span className="text-xs text-slate-500 italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
