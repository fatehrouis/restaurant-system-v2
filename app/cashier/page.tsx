'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Search, Wallet, Receipt, CheckCircle2, Printer, ArrowLeft,
  CreditCard, Banknote, Clock, AlertCircle, X 
} from 'lucide-react'

export default function CashierPage() {
  const [tableNumber, setTableNumber] = useState('')
  const [bill, setBill] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settled, setSettled] = useState(false)
  const [tableInfo, setTableInfo] = useState<any>(null)

  const getBill = async () => {
    if (!tableNumber) return
    setLoading(true)
    setSettled(false)

    const { data: table } = await supabase
      .from('tables').select('id, table_number').eq('table_number', parseInt(tableNumber)).single()

    if (!table) {
      alert('الطاولة غير موجودة')
      setLoading(false)
      return
    }

    setTableInfo(table)

    const { data: orders } = await supabase
      .from('orders').select('id').eq('table_id', table.id).eq('status', 'completed')

    if (!orders?.length) {
      alert('لا توجد طلبات مكتملة لهذه الطاولة')
      setLoading(false)
      setSearched(true)
      setBill([])
      setTotal(0)
      return
    }

    const orderIds = orders.map(o => o.id)
    const { data: items } = await supabase
      .from('order_items').select('*, menu_items(name)')
      .in('order_id', orderIds)

    if (items) {
      // Group same items
      const grouped = items.reduce((acc: any[], item: any) => {
        const existing = acc.find(i => i.menu_item_id === item.menu_item_id)
        if (existing) {
          existing.quantity += item.quantity
          existing.total += item.price * item.quantity
        } else {
          acc.push({
            ...item,
            total: item.price * item.quantity
          })
        }
        return acc
      }, [])

      setBill(grouped)
      setTotal(grouped.reduce((sum: number, i: any) => sum + i.total, 0))
      setSearched(true)
    }
    setLoading(false)
  }

  const settleBill = async () => {
    if (!tableInfo) return

    const { data: orders } = await supabase
      .from('orders').select('id').eq('table_id', tableInfo.id).eq('status', 'completed')

    if (orders) {
      const orderIds = orders.map(o => o.id)
      await supabase.from('orders')
        .update({ status: 'paid' })
        .in('id', orderIds)

      setSettled(true)
      setBill([])
      setTotal(0)
      setTableNumber('')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="p-2 hover:bg-gray-100 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </a>
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">الكاشير</h1>
                <p className="text-gray-400 text-sm">الفواتير والتسوية</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">رقم الطاولة</label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-300" />
              <input
                type="number"
                placeholder="أدخل رقم الطاولة..."
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && getBill()}
                className="w-full border border-gray-200 rounded-xl p-3.5 pr-10 text-gray-800 text-lg text-center font-bold focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition"
              />
            </div>
            <button 
              onClick={getBill}
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-8 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? '...' : <Search className="w-5 h-5" />}
              بحث
            </button>
          </div>
        </div>

        {/* Bill Result */}
        {searched && bill.length > 0 && !settled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-scale-in">
            {/* Bill Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">فاتورة الطاولة {tableNumber}</h2>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date().toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handlePrint}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bill Items */}
            <div className="p-6">
              <div className="space-y-3">
                {bill.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-gray-800">{item.menu_items?.name}</span>
                    </div>
                    <span className="font-bold text-gray-800">{item.total} ريال</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-200 my-4" />

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">الإجمالي</span>
                  <span className="text-2xl font-bold text-violet-600">{total} ريال</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-violet-500 transition">
                  <Banknote className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">نقدي</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-violet-500 transition">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">بطاقة</span>
                </button>
              </div>

              {/* Settle Button */}
              <button 
                onClick={settleBill}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                تم الدفع والتسوية
              </button>
            </div>
          </div>
        )}

        {/* Settled Success */}
        {settled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">تمت التسوية بنجاح!</h2>
            <p className="text-gray-500 mb-6">تم إغلاق فاتورة الطاولة {tableNumber}</p>
            <button 
              onClick={() => { setSettled(false); setSearched(false); setTableNumber('') }}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
            >
              فاتورة جديدة
            </button>
          </div>
        )}

        {/* No Orders */}
        {searched && bill.length === 0 && !settled && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <AlertCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">لا توجد طلبات</h2>
            <p className="text-gray-300">لا توجد طلبات مكتملة لهذه الطاولة</p>
          </div>
        )}
      </div>
    </div>
  )
}