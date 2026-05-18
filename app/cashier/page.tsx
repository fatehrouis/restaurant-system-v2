'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const currencies = [
  { code: 'SAR', symbol: 'ريال', rate: 1, flag: '🇸🇦' },
  { code: 'DZD', symbol: 'دج', rate: 35.5, flag: '🇩🇿' },
  { code: 'USD', symbol: '$', rate: 0.27, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.25, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.21, flag: '🇬🇧' },
  { code: 'MAD', symbol: 'د.م', rate: 2.7, flag: '🇲🇦' },
  { code: 'TND', symbol: 'د.ت', rate: 0.83, flag: '🇹🇳' },
  { code: 'AED', symbol: 'د.إ', rate: 0.98, flag: '🇦🇪' },
]

export default function CashierPage() {
  const [tableNumber, setTableNumber] = useState('')
  const [bill, setBill] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [searched, setSearched] = useState(false)
  const [currency, setCurrency] = useState(currencies[0])

  const convertPrice = (price: number) => {
    return (price * currency.rate).toFixed(currency.code === 'DZD' ? 0 : 2)
  }

  const getBill = async () => {
    const { data: table } = await supabase
      .from('tables').select('id').eq('table_number', tableNumber).single()
    if (!table) return alert('الطاولة غير موجودة')

    const { data: orders } = await supabase
      .from('orders').select('id').eq('table_id', table.id).eq('status', 'completed')

    if (!orders?.length) return alert('لا توجد طلبات مكتملة لهذه الطاولة')

    const orderIds = orders.map(o => o.id)
    const { data: items } = await supabase
      .from('order_items').select('*, menu_items(name)')
      .in('order_id', orderIds)

    if (items) {
      setBill(items)
      setTotal(items.reduce((sum, i) => sum + i.price * i.quantity, 0))
      setSearched(true)
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white text-center py-6 mb-6">
        <h1 className="text-3xl font-bold text-white">الكاشير</h1>
      </div>

      <div className="max-w-md mx-auto px-4">

        {/* اختيار العملة */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <p className="font-bold text-gray-700 mb-2">اختر العملة:</p>
          <div className="flex flex-wrap gap-2">
            {currencies.map(c => (
              <button key={c.code} onClick={() => setCurrency(c)}
                className={`px-3 py-1 rounded-full text-sm font-bold ${currency.code === c.code ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* البحث */}
        <div className="flex gap-2 mb-6">
          <input
            type="number"
            placeholder="رقم الطاولة"
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            className="flex-1 border rounded-xl p-3 text-lg text-right text-gray-800"
          />
          <button onClick={getBill}
            className="bg-blue-500 text-white px-6 rounded-xl font-bold">
            بحث
          </button>
        </div>

        {/* الفاتورة */}
        {searched && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-right">
              الفاتورة - طاولة {tableNumber}
            </h2>
            {bill.map(item => (
              <div key={item.id} className="flex justify-between border-b py-2">
                <span className="text-gray-600">{convertPrice(item.price * item.quantity)} {currency.symbol}</span>
                <span className="font-medium text-gray-800">{item.menu_items?.name} × {item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between mt-4 text-xl font-bold">
              <span className="text-orange-500">{convertPrice(total)} {currency.symbol}</span>
              <span className="text-gray-800">الاجمالي</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}