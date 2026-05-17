'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Plus, Trash2, ToggleLeft, ToggleRight, ChefHat, QrCode, 
  Search, Filter, ArrowUpDown, Utensils, Tag, DollarSign 
} from 'lucide-react'

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  const restaurantId = '11111111-1111-1111-1111-111111111111'

  const fetchItems = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('category')
    if (data) {
      setItems(data)
      setFilteredItems(data)
      const cats = [...new Set(data.map((item: any) => item.category).filter(Boolean))]
      setCategories(cats as string[])
    }
  }

  useEffect(() => {
    fetchItems()
    const channel = supabase.channel('menu').on('postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items' }, fetchItems).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    let filtered = items
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, items])

  const addItem = async () => {
    if (!name || !price) return alert('ادخل الاسم والسعر')
    setLoading(true)
    await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      name,
      price: parseFloat(price),
      category: category || 'عام',
      available: true
    })
    setName('')
    setPrice('')
    setCategory('')
    setLoading(false)
    setShowAddForm(false)
    fetchItems()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الصنف؟')) return
    await supabase.from('menu_items').delete().eq('id', id)
    fetchItems()
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    fetchItems()
  }

  const totalItems = items.length
  const availableItems = items.filter(i => i.available).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-400 text-sm">إدارة المنيو والأصناف</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/admin/qr" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition text-sm font-medium">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">رموز QR</span>
              </a>
              <a href="/kitchen" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition text-sm font-medium">
                <ChefHat className="w-4 h-4" />
                <span className="hidden sm:inline">المطبخ</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm mb-1">إجمالي الأصناف</p>
            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm mb-1">متاحة</p>
            <p className="text-2xl font-bold text-emerald-600">{availableItems}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm mb-1">غير متاحة</p>
            <p className="text-2xl font-bold text-red-500">{totalItems - availableItems}</p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showAddForm ? 'إلغاء' : 'إضافة صنف جديد'}
        </button>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 animate-scale-in">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              صنف جديد
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Tag className="absolute right-3 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  placeholder="اسم الصنف"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 pr-10 text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                />
              </div>
              <div className="relative">
                <DollarSign className="absolute right-3 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  placeholder="السعر (ريال)"
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 pr-10 text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                />
              </div>
              <div className="relative">
                <Filter className="absolute right-3 top-3.5 w-5 h-5 text-gray-300" />
                <input
                  placeholder="الفئة (مثال: مشروبات)"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 pr-10 text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                />
              </div>
            </div>
            <button
              onClick={addItem}
              disabled={loading}
              className="mt-4 w-full md:w-auto px-8 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الصنف'}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 w-5 h-5 text-gray-300" />
            <input
              placeholder="البحث في الأصناف..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 pr-10 text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition bg-white"
          >
            <option value="all">جميع الفئات</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Utensils className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لا توجد أصناف</p>
              <p className="text-gray-300 text-sm mt-1">أضف صنفاً جديداً للبدء</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-all animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    item.available 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-orange-500 font-bold">{item.price} ريال</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400 text-sm bg-gray-50 px-2 py-0.5 rounded-lg">{item.category || 'عام'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailable(item.id, item.available)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition ${
                      item.available 
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {item.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {item.available ? 'متاح' : 'متوقف'}
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}