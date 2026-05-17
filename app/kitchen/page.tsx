'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  ChefHat, CheckCircle2, Clock, Flame, AlertCircle, 
  ArrowLeft, RefreshCw, UtensilsCrossed 
} from 'lucide-react'

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, tables(table_number), order_items(*, menu_items(name, price))')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const channel = supabase.channel('orders').on('postgres_changes',
      { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const completeOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'completed' }).eq('id', id)
    fetchOrders()
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000 / 60)
    if (diff < 1) return 'الآن'
    if (diff < 60) return `منذ ${diff} دقيقة`
    return `منذ ${Math.floor(diff / 60)} ساعة`
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="p-2 hover:bg-gray-700 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </a>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">شاشة المطبخ</h1>
                <p className="text-gray-400 text-sm">متابعة الطلبات الجديدة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-gray-700 px-4 py-2 rounded-xl">
                <span className="text-gray-300 text-sm">طلبات قيد الانتظار: </span>
                <span className="text-white font-bold">{orders.length}</span>
              </div>
              <button 
                onClick={fetchOrders}
                className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition"
              >
                <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <UtensilsCrossed className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">لا توجد طلبات جديدة</h2>
            <p className="text-gray-500">ستظهر الطلبات الجديدة هنا تلقائياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order, index) => {
              const totalItems = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
              const totalPrice = order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
              const timeAgo = getTimeAgo(order.created_at)
              const isUrgent = new Date(order.created_at).getTime() < Date.now() - 10 * 60 * 1000

              return (
                <div
                  key={order.id}
                  className={`bg-gray-800 rounded-2xl border overflow-hidden animate-fade-in ${
                    isUrgent ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-gray-700'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Order Header */}
                  <div className={`p-5 ${isUrgent ? 'bg-red-500/10' : 'bg-gray-750'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-700 p-2 rounded-lg">
                          <Flame className={`w-5 h-5 ${isUrgent ? 'text-red-400' : 'text-orange-400'}`} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">طاولة {order.tables?.table_number}</h2>
                          <p className="text-gray-400 text-xs">#{order.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                        isUrgent 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {timeAgo}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-4 h-4" />
                        {totalItems} صنف
                      </span>
                      <span>|</span>
                      <span className="text-orange-400 font-bold">{totalPrice} ريال</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-700/50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-sm font-bold text-gray-300">
                            {item.quantity}
                          </div>
                          <span className="text-gray-200 font-medium">{item.menu_items?.name}</span>
                        </div>
                        <span className="text-gray-400 text-sm">{item.price * item.quantity} ريال</span>
                      </div>
                    ))}
                  </div>

                  {/* Complete Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      تم التحضير
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