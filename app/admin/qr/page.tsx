'use client'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../../lib/supabase'

export default function QRPage() {
  const [tables, setTables] = useState<any[]>([])

  const fetchTables = async () => {
    const { data } = await supabase.from('tables').select('*').order('table_number')
    if (data) setTables(data)
  }

  useEffect(() => { fetchTables() }, [])

  const addTable = async () => {
    const next = tables.length + 1
    await supabase.from('tables').insert({
      restaurant_id: '11111111-1111-1111-1111-111111111111',
      table_number: next
    })
    fetchTables()
  }

  const siteUrl = 'https://restaurant-system-v2-f1qveguz0-rouisfateh83-8649s-projects.vercel.app'

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white text-center py-6 mb-6">
        <h1 className="text-3xl font-bold text-white">رموز QR للطاولات</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <button onClick={addTable}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg mb-6">
          + اضف طاولة جديدة
        </button>

        <div className="grid grid-cols-2 gap-4">
          {tables.map(table => {
            const url = `${siteUrl}/menu?table=${table.id}`
            return (
              <div key={table.id} className="bg-white rounded-2xl shadow p-4 text-center">
                <h2 className="font-bold text-gray-800 text-xl mb-3">طاولة {table.table_number}</h2>
                <div className="flex justify-center mb-3">
                  <QRCodeSVG value={url} size={150} />
                </div>
                <a href={url} target="_blank"
                  className="block w-full bg-blue-500 text-white py-2 rounded-xl font-bold text-sm">
                  اختبر الرابط
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}