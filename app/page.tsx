'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { Utensils, QrCode, ChefHat, Wallet, ArrowLeft } from "lucide-react";
import { currencies, getSetting, saveSetting } from "./lib/settings";

export default function Home() {
  const [currency, setCurrency] = useState(currencies[0])
  const [saved, setSaved] = useState(false)
  const [showCurrencies, setShowCurrencies] = useState(false)

  useEffect(() => {
    getSetting('currency').then(val => {
      if (val) setCurrency(currencies.find(c => c.code === val) || currencies[0])
    })
  }, [])

  const saveCurrency = async (c: typeof currencies[0]) => {
    setCurrency(c)
    await saveSetting('currency', c.code)
    setSaved(true)
    setShowCurrencies(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const cards = [
    {
      href: "/admin",
      icon: Utensils,
      title: "لوحة التحكم",
      desc: "إدارة المنيو والأصناف",
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      href: "/admin/qr",
      icon: QrCode,
      title: "رموز QR",
      desc: "إنشاء وطباعة رموز الطاولات",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      href: "/kitchen",
      icon: ChefHat,
      title: "شاشة المطبخ",
      desc: "متابعة وإدارة الطلبات",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      href: "/cashier",
      icon: Wallet,
      title: "الكاشير",
      desc: "الفواتير والتسوية",
      color: "bg-violet-500",
      lightColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 flex flex-col items-center justify-center p-6">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/20 mb-6">
          <Utensils className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          RestoPro
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          نظام إدارة المطاعم الذكي - كل شيء تحت سيطرتك
        </p>

        {/* زر العملة */}
        <div className="relative inline-block mt-4">
          <button onClick={() => setShowCurrencies(!showCurrencies)}
            className="bg-white border border-gray-200 shadow px-4 py-2 rounded-xl font-bold text-gray-700 flex items-center gap-2 mx-auto">
            <span className="text-xl">{currency.flag}</span>
            <span>{currency.code}</span>
            <span className="text-gray-400">▼</span>
          </button>

          {showCurrencies && (
            <div className="absolute top-12 right-1/2 translate-x-1/2 bg-white rounded-2xl shadow-xl z-50 p-3 w-64 border border-gray-100">
              <p className="text-gray-500 text-sm mb-2 text-center">اختر عملة المطعم</p>
              <div className="grid grid-cols-2 gap-2">
                {currencies.map(c => (
                  <button key={c.code} onClick={() => saveCurrency(c)}
                    className={`py-2 px-3 rounded-xl text-sm font-bold flex items-center gap-2 ${currency.code === c.code ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-xs mr-auto">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {saved && (
          <p className="text-green-500 font-bold mt-2">✓ تم حفظ العملة!</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={`${card.lightColor} p-3 rounded-xl`}>
                <card.icon className={`w-7 h-7 ${card.textColor}`} />
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:-translate-x-1 transition-all" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mt-4 mb-1">{card.title}</h2>
            <p className="text-gray-400 text-sm">{card.desc}</p>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
          </Link>
        ))}
      </div>

      <p className="text-gray-400 text-sm mt-12">
        © 2026 RestoPro - جميع الحقوق محفوظة
      </p>
    </div>
  );
}
