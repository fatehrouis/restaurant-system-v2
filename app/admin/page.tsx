'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { currencies, translations, getSetting, saveSetting } from '../lib/settings'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar')
  const [currency, setCurrency] = useState(currencies[0])
  const [tab, setTab] = useState<'menu' | 'settings'>('menu')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const t = translations[lang]
  const restaurantId = '11111111-1111-1111-1111-111111111111'
  const isFormValid = name.trim() !== '' && price.trim() !== '' && category.trim() !== ''

  const fetchItems = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('category')
    if (data) setItems(data)
  }

  useEffect(() => {
    fetchItems()
    getSetting('currency').then(val => {
      if (val) setCurrency(currencies.find(c => c.code === val) || currencies[0])
    })
    getSetting('language').then(val => {
      if (val) setLang(val as 'ar' | 'fr' | 'en')
    })
  }, [])

  const saveSettings = async () => {
    await saveSetting('currency', currency.code)
    await saveSetting('language', lang)
    toast.success(t.saved)
  }

  const addItem = async () => {
    if (!isFormValid) return
    setLoading(true)
    const { error } = await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      name: name.trim(),
      price: parseFloat(price),
      category: category.trim(),
      available: true
    })
    if (error) {
      toast.error('حدث خطأ!')
    } else {
      toast.success('تمت الاضافة بنجاح!')
      setName(''); setPrice(''); setCategory('')
      fetchItems()
    }
    setLoading(false)
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) {
      toast.error('حدث خطأ!')
    } else {
      toast.success('تم الحذف!')
      fetchItems()
    }
    setDeleteConfirm(null)
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    fetchItems()
    toast.success(current ? 'تم ايقاف الاكلة' : 'تم تفعيل الاكلة')
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">تاكيد الحذف</h3>
            <p className="text-gray-500 text-center mb-6">هل انت متاكد من حذف هذه الاكلة؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteItem(deleteConfirm)}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform">
                حذف
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                الغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-orange-500 text-white text-center py-6 mb-6">
        <h1 className="text-3xl font-bold text-white">{t.admin}</h1>
      </div>

      <div className="flex max-w-2xl mx-auto px-4 gap-2 mb-4">
        <button onClick={() => setTab('menu')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${tab === 'menu' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-600 shadow'}`}>
          {t.currentItems}
        </button>
        <button onClick={() => setTab('settings')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 ${tab === 'settings' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-gray-600 shadow'}`}>
          {t.settings}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {tab === 'settings' && (
          <div className="bg-white rounded-2xl shadow p-5 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{t.settings}</h2>

            <p className="font-bold text-gray-700 mb-2">{t.saveLanguage}:</p>
            <div className="flex gap-2 mb-6">
              {(['ar', 'fr', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${lang === l ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {l === 'ar' ? 'عربي' : l === 'fr' ? 'Français' : 'English'}
                </button>
              ))}
            </div>

            <p className="font-bold text-gray-700 mb-2">{t.saveCurrency}:</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {currencies.map(c => (
                <button key={c.code} onClick={() => setCurrency(c)}
                  className={`py-3 px-1 rounded-xl text-sm font-bold flex flex-col items-center gap-1 transition-all active:scale-95 ${currency.code === c.code ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  <span className="text-xl">{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="text-xs">{c.symbol}</span>
                </button>
              ))}
            </div>

            <button onClick={saveSettings}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-lg shadow-green-500/20">
              حفظ الاعدادات
            </button>
          </div>
        )}

        {tab === 'menu' && (
          <>
            <div className="bg-white rounded-2xl shadow p-5 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t.addItem}</h2>

              <input
                placeholder={t.itemName}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 mb-3 text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <input
                placeholder={t.price}
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 mb-3 text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <input
                placeholder={t.category}
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 text-gray-800 text-right focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />

              <button
                onClick={addItem}
                disabled={loading || !isFormValid}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all active:scale-95 ${isFormValid && !loading ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {loading ? t.adding : t.addBtn}
              </button>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-3">{t.currentItems}</h2>
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow p-4 mb-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                  <p className="text-orange-500 font-bold">{item.price} {currency.symbol}</p>
                  <p className="text-gray-400 text-sm">{item.category}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleAvailable(item.id, item.available)}
                    className={`px-3 py-1 rounded-xl font-bold text-sm transition-all active:scale-95 ${item.available ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {item.available ? t.available : t.unavailable}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="px-3 py-1 rounded-xl font-bold text-sm bg-red-100 text-red-500 hover:bg-red-200 transition-all active:scale-95">
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}