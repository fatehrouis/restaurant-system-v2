'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { translations, getSetting } from '../lib/settings'

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar')

  const t = translations[lang]

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, tables(table_number), order_items(*, menu_items(name))')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (data) setOrders(data)
  }

  useEffect(() => {
    getSetting('language').then(val => {
      if (val) setLang(val as 'ar' | 'fr' | 'en')
    })
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  const completeOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', id)
    fetchOrders()
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-white text-center mb-6">{t.kitchen}</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-400 text-xl">{t.noOrders}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{t.tableNum} {order.tables?.table_number}</h2>
              <ul className="mb-4">
                {order.order_items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between border-b py-1">
                    <span className="text-gray-800">{item.menu_items?.name}</span>
                    <span className="font-bold text-gray-800">× {item.quantity}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => completeOrder(order.id)}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-bold">
                {t.done2}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}