'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { currencies, translations, getSetting, saveSetting } from '../lib/settings'

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'ar' | 'fr' | 'en'>('ar')
  const [currency, setCurrency] = useState(currencies[0])
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'menu' | 'settings'>('menu')

  const t = translations[lang]
  const restaurantId = '11111111-1111-1111-1111-111111111111'

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
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addItem = async () => {
    if (!name || !price) return alert(t.itemName)
    setLoading(true)
    await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      name, price: parseFloat(price), category, available: true
    })
    setName(''); setPrice(''); setCategory('')
    setLoading(false)
    fetchItems()
  }

  const deleteItem = async (id: string) => {
    if (!confirm(t.delete + '?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    fetchItems()
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    await supabase.from('menu_items').update({ available: !current }).eq('id', id)
    fetchItems()
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white text-center py-6 mb-6">
        <h1 className="text-3xl font-bold text-white">{t.admin}</h1>
      </div>

      <div className="flex max-w-2xl mx-auto px-4 gap-2 mb-4">
        <button onClick={() => setTab('menu')}
          className={`flex-1 py-2 rounded-xl font-bold ${tab === 'menu' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 shadow'}`}>
          {t.currentItems}
        </button>
        <button onClick={() => setTab('settings')}
          className={`flex-1 py-2 rounded-xl font-bold ${tab === 'settings' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 shadow'}`}>
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
                  className={`flex-1 py-3 rounded-xl font-bold text-lg ${lang === l ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {l === 'ar' ? 'عربي' : l === 'fr' ? 'Français' : 'English'}
                </button>
              ))}
            </div>

            <p className="font-bold text-gray-700 mb-2">{t.saveCurrency}:</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {currencies.map(c => (
                <button key={c.code} onClick={() => setCurrency(c)}
                  className={`py-2 px-1 rounded-xl text-sm font-bold flex flex-col items-center gap-1 ${currency.code === c.code ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <span className="text-xl">{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="text-xs">{c.symbol}</span>
                </button>
              ))}
            </div>

            <button onClick={saveSettings}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-xl">
              {saved ? '✓ ' + t.saved : t.saveCurrency + ' & ' + t.saveLanguage}
            </button>
          </div>
        )}

        {tab === 'menu' && (
          <>
            <div className="bg-white rounded-2xl shadow p-5 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t.addItem}</h2>
              <input placeholder={t.itemName} value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-xl p-3 mb-3 text-gray-800 text-right" />
              <input placeholder={t.price} type="number" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border rounded-xl p-3 mb-3 text-gray-800 text-right" />
              <input placeholder={t.category} value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border rounded-xl p-3 mb-4 text-gray-800 text-right" />
              <button onClick={addItem} disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg">
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
                  <button onClick={() => toggleAvailable(item.id, item.available)}
                    className={`px-3 py-1 rounded-xl font-bold text-sm ${item.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {item.available ? t.available : t.unavailable}
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    className="px-3 py-1 rounded-xl font-bold text-sm bg-red-100 text-red-500">
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