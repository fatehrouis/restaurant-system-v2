'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { currencies, translations, getSetting } from '../lib/settings'

export default function CashierPage() {
  const [tableNumber, setTableNumber] = useState('')
  const [bill, setBill] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [searched, setSearched] = useState(false)
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar')
  const [currency, setCurrency] = useState(currencies[0])

  const t = translations[lang]

  useEffect(() => {
    getSetting('language').then(val => {
      if (val) setLang(val as 'ar' | 'fr' | 'en')
    })
    getSetting('currency').then(val => {
      if (val) setCurrency(currencies.find(c => c.code === val) || currencies[0])
    })
  }, [])

  const convertPrice = (price: number) => {
    return (price * currency.rate).toFixed(currency.code === 'DZD' ? 0 : 2)
  }

  const getBill = async () => {
    const { data: table } = await supabase
      .from('tables').select('id').eq('table_number', tableNumber).single()
    if (!table) return alert(t.tableNotFound)

    const { data: orders } = await supabase
      .from('orders').select('id').eq('table_id', table.id).eq('status', 'completed')

    if (!orders?.length) return alert(t.noCompletedOrders)

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
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white text-center py-6 mb-6">
        <h1 className="text-3xl font-bold text-white">{t.cashier}</h1>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="flex gap-2 mb-6">
          <input
            type="number"
            placeholder={t.tablePlaceholder}
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            className="flex-1 border rounded-xl p-3 text-lg text-right text-gray-800"
          />
          <button onClick={getBill}
            className="bg-blue-500 text-white px-6 rounded-xl font-bold">
            {t.search}
          </button>
        </div>

        {searched && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {t.bill} - {t.tableNum} {tableNumber}
            </h2>
            {bill.map(item => (
              <div key={item.id} className="flex justify-between border-b py-2">
                <span className="text-gray-600">{convertPrice(item.price * item.quantity)} {currency.symbol}</span>
                <span className="font-medium text-gray-800">{item.menu_items?.name} × {item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between mt-4 text-xl font-bold">
              <span className="text-orange-500">{convertPrice(total)} {currency.symbol}</span>
              <span className="text-gray-800">{t.total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}