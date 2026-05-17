'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { 
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, CheckCircle2, 
  Utensils, Clock, MapPin, ChevronLeft, X, Sparkles 
} from 'lucide-react'

function MenuContent() {
  const searchParams = useSearchParams()
  const tableId = searchParams.get('table')
  const [items, setItems] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [page, setPage] = useState<'menu' | 'cart' | 'done'>('menu')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase.from('menu_items').select('*').eq('available', true)
      if (data) {
        setItems(data)
        const cats = [...new Set(data.map((item: any) => item.category).filter(Boolean))]
        setCategories(cats as string[])
      }
    }
    fetchItems()
    const interval = setInterval(fetchItems, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const addToCart = (item: any) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const changeQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0)

  const placeOrder = async () => {
    if (!tableId) return alert('رقم الطاولة غير محدد')
    const { data: order } = await supabase.from('orders').insert({ 
      table_id: tableId,
      status: 'pending'
    }).select().single()
    if (order) {
      await supabase.from('order_items').insert(
        cart.map(i => ({ 
          order_id: order.id, 
          menu_item_id: i.id, 
          quantity: i.qty, 
          price: i.price 
        }))
      )
      setCart([])
      setPage('done')
    }
  }

  if (page === 'done') return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full animate-scale-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">تم إرسال طلبك!</h1>
        <p className="text-gray-500 text-lg mb-2">سيصل طلبك قريباً</p>
        <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl py-3 px-4 mt-6">
          <Clock className="w-5 h-5" />
          <span className="font-medium">وقت التحضير: 15-20 دقيقة</span>
        </div>
        <button 
          onClick={() => setPage('menu')}
          className="mt-6 w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition"
        >
          طلب جديد
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-30 shadow-lg shadow-orange-500/20">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">المنيو</h1>
                <div className="flex items-center gap-1 text-orange-100 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>طاولة رقم {tableId || '?'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white/20 p-2.5 rounded-xl hover:bg-white/30 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col hover:shadow-lg transition-all animate-fade-in"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="w-full h-32 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl mb-3 flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
              <h2 className="font-bold text-gray-800 text-base text-center mb-1">{item.name}</h2>
              <p className="text-orange-500 font-bold text-center text-lg mb-3">{item.price} ريال</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-auto w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </button>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد أصناف في هذه الفئة</p>
          </div>
        )}
      </div>

      {/* Cart Slide Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  <h2 className="text-xl font-bold">سلة الطلبات</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ShoppingCart className="w-16 h-16 mb-4 text-gray-200" />
                    <p className="text-lg">السلة فارغة</p>
                    <p className="text-sm mt-1">أضف بعض الأصناف</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{item.name}</p>
                          <p className="text-orange-500 font-bold">{item.price * item.qty} ريال</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(item.id, -1)}
                            className="bg-white text-gray-600 w-8 h-8 rounded-lg shadow-sm hover:shadow transition flex items-center justify-center">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg text-gray-800 w-6 text-center">{item.qty}</span>
                          <button onClick={() => changeQty(item.id, 1)}
                            className="bg-orange-500 text-white w-8 h-8 rounded-lg shadow-sm hover:shadow transition flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)}
                            className="bg-red-50 text-red-400 w-8 h-8 rounded-lg hover:bg-red-100 transition flex items-center justify-center mr-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-4 bg-white">
                  <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-800">الإجمالي</span>
                      <span className="text-orange-500">{total} ريال</span>
                    </div>
                  </div>
                  <button onClick={placeOrder}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    تأكيد الطلب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100">
          <button onClick={() => setIsCartOpen(true)}
            className="max-w-2xl mx-auto w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            عرض السلة ({totalItems} عناصر) - {total} ريال
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}