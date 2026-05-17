'use client'

import { useEffect, useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'
import { Plus, Printer, ExternalLink, Trash2, QrCode, ArrowLeft, Download } from 'lucide-react'

export default function QRPage() {
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const siteUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/menu` 
    : 'http://localhost:3000/menu'

  const fetchTables = async () => {
    const { data } = await supabase.from('tables').select('*').order('table_number')
    if (data) setTables(data)
  }

  useEffect(() => { fetchTables() }, [])

  const addTable = async () => {
    setLoading(true)
    const next = tables.length > 0 
      ? Math.max(...tables.map(t => t.table_number)) + 1 
      : 1
    await supabase.from('tables').insert({
      restaurant_id: '11111111-1111-1111-1111-111111111111',
      table_number: next
    })
    setLoading(false)
    fetchTables()
  }

  const deleteTable = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الطاولة؟')) return
    await supabase.from('tables').delete().eq('id', id)
    fetchTables()
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return
    
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/admin" className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </a>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">رموز QR للطاولات</h1>
                <p className="text-gray-400 text-sm">إنشاء وطباعة رموز الطاولات</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">طباعة الكل</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={addTable}
          disabled={loading}
          className="w-full mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'جاري الإضافة...' : 'إضافة طاولة جديدة'}
        </button>

        {tables.length === 0 ? (
          <div className="text-center py-16">
            <QrCode className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد طاولات</p>
            <p className="text-gray-300 text-sm mt-1">أضف طاولة جديدة للبدء</p>
          </div>
        ) : (
          <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tables.map((table, index) => {
              const url = `${siteUrl}?table=${table.id}`
              return (
                <div
                  key={table.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-800 text-xl">طاولة {table.table_number}</h2>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-4 inline-block">
                    <QRCodeSVG 
                      value={url} 
                      size={180} 
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-4 truncate px-4">{url}</p>
                  
                  <div className="flex gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium text-sm hover:bg-blue-100 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                      اختبار
                    </a>
                    <button
                      onClick={() => {
                        const svgElement = document.querySelector(`#qr-${table.id}`)
                        if (svgElement) {
                          const svgData = new XMLSerializer().serializeToString(svgElement)
                          const canvas = document.createElement('canvas')
                          const ctx = canvas.getContext('2d')
                          const img = new Image()
                          img.onload = () => {
                            canvas.width = img.width
                            canvas.height = img.height
                            ctx?.drawImage(img, 0, 0)
                            const link = document.createElement('a')
                            link.download = `table-${table.table_number}-qr.png`
                            link.href = canvas.toDataURL()
                            link.click()
                          }
                          img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-100 transition"
                    >
                      <Download className="w-4 h-4" />
                      تحميل
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}