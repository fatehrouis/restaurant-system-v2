import Link from "next/link";
import { Utensils, QrCode, ChefHat, Wallet, ArrowLeft } from "lucide-react";

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/20 mb-6">
          <Utensils className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          RestoPro
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          نظام إدارة المطاعم الذكي - كل شيء تحت سيطرتك
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {cards.map((card, i) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
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

      {/* Footer */}
      <p className="text-gray-400 text-sm mt-12">
        © 2026 RestoPro - جميع الحقوق محفوظة
      </p>
    </div>
  );
}
