import { useState, useRef } from 'react'
import axios from 'axios'
import { UploadCloud, FileType, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [sourceType, setSourceType] = useState('SAP')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{success: boolean, message: string, rows?: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('source_type', sourceType)
    formData.append('tenant_id', '1') // Hardcoded for prototype

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/ingestion/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult({ success: true, message: response.data.message, rows: response.data.rows_processed })
      setFile(null)
    } catch (error: any) {
      setResult({ success: false, message: error.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center">
          <UploadCloud className="mr-3 text-emerald-500" />
          Ingest Data
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Data Source Type</label>
            <div className="grid grid-cols-3 gap-4">
              {['SAP', 'UTILITY', 'TRAVEL'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type)}
                  className={clsx(
                    'px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                    sourceType === type
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  )}
                >
                  {type === 'SAP' ? 'SAP Export' : type === 'UTILITY' ? 'Utility Bill' : 'Corporate Travel'}
                </button>
              ))}
            </div>
          </div>

          <div
            className={clsx(
              'border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer',
              isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-700 hover:border-slate-600 bg-slate-950/50',
              file && !isDragging && 'border-emerald-500/30 bg-emerald-500/5'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={(e) => {
              if (e.target.files) { setFile(e.target.files[0]); setResult(null); }
            }} />
            
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <FileType className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-medium">{file.name}</p>
                <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-sm text-slate-400 hover:text-rose-400"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-300 font-medium">Drag & drop your file here</p>
                <p className="text-slate-500 text-sm mt-2">Supports CSV and XLSX formats</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={clsx(
                "px-6 py-2.5 rounded-lg font-medium flex items-center transition-all",
                !file || uploading 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
              )}
            >
              {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploading ? 'Processing...' : 'Upload & Normalize'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className={clsx(
          "p-4 rounded-xl border flex items-start space-x-3 shadow-lg",
          result.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        )}>
          {result.success ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <div>
            <h4 className="font-medium">{result.success ? 'Success' : 'Upload Error'}</h4>
            <p className="text-sm opacity-90 mt-1">{result.message}</p>
            {result.rows && <p className="text-sm opacity-80 mt-1">Rows processed: {result.rows}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
