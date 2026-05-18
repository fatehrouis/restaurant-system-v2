import { supabase } from './supabase'

export const currencies = [
  { code: 'SAR', symbol: 'ريال', rate: 1, flag: '🇸🇦' },
  { code: 'DZD', symbol: 'دج', rate: 35.5, flag: '🇩🇿' },
  { code: 'USD', symbol: '$', rate: 0.27, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.25, flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.21, flag: '🇬🇧' },
  { code: 'MAD', symbol: 'د.م', rate: 2.7, flag: '🇲🇦' },
  { code: 'TND', symbol: 'د.ت', rate: 0.83, flag: '🇹🇳' },
  { code: 'AED', symbol: 'د.إ', rate: 0.98, flag: '🇦🇪' },
]

export const translations = {
  ar: {
    menu: 'المنيو', table: 'طاولة رقم', add: '+ اضف',
    cart: 'سلة الطلبات', total: 'الاجمالي', confirm: 'تاكيد الطلب',
    empty: 'السلة فارغة', done: 'تم ارسال طلبك!', soon: 'سيصل طلبك قريبا',
    viewCart: 'عرض السلة', items: 'عناصر', kitchen: 'شاشة المطبخ',
    noOrders: 'لا توجد طلبات جديدة', tableNum: 'طاولة', done2: 'تم التحضير',
    cashier: 'الكاشير', search: 'بحث', bill: 'الفاتورة', tableNotFound: 'الطاولة غير موجودة',
    noCompletedOrders: 'لا توجد طلبات مكتملة', admin: 'لوحة التحكم',
    addItem: 'اضافة اكلة جديدة', itemName: 'اسم الاكلة', price: 'السعر',
    category: 'الفئة', addBtn: '+ اضف الاكلة', available: 'متاح',
    unavailable: 'متوقف', delete: 'حذف', currentItems: 'الاكلات الحالية',
    settings: 'الاعدادات', saveCurrency: 'حفظ العملة', saveLanguage: 'حفظ اللغة',
    saved: 'تم الحفظ!', tablePlaceholder: 'رقم الطاولة', adding: 'جاري الاضافة...',
  },
  fr: {
    menu: 'Menu', table: 'Table numéro', add: '+ Ajouter',
    cart: 'Panier', total: 'Total', confirm: 'Confirmer',
    empty: 'Panier vide', done: 'Commande envoyée!', soon: 'Votre commande arrive bientôt',
    viewCart: 'Voir panier', items: 'articles', kitchen: 'Cuisine',
    noOrders: 'Aucune commande', tableNum: 'Table', done2: 'Prêt',
    cashier: 'Caisse', search: 'Chercher', bill: 'Facture', tableNotFound: 'Table introuvable',
    noCompletedOrders: 'Aucune commande complète', admin: 'Tableau de bord',
    addItem: 'Ajouter un plat', itemName: 'Nom du plat', price: 'Prix',
    category: 'Catégorie', addBtn: '+ Ajouter', available: 'Disponible',
    unavailable: 'Indisponible', delete: 'Supprimer', currentItems: 'Plats actuels',
    settings: 'Paramètres', saveCurrency: 'Enregistrer devise', saveLanguage: 'Enregistrer langue',
    saved: 'Enregistré!', tablePlaceholder: 'Numéro de table', adding: 'Ajout en cours...',
  },
  en: {
    menu: 'Menu', table: 'Table number', add: '+ Add',
    cart: 'Cart', total: 'Total', confirm: 'Place Order',
    empty: 'Cart is empty', done: 'Order placed!', soon: 'Your order is on its way',
    viewCart: 'View Cart', items: 'items', kitchen: 'Kitchen',
    noOrders: 'No new orders', tableNum: 'Table', done2: 'Done',
    cashier: 'Cashier', search: 'Search', bill: 'Bill', tableNotFound: 'Table not found',
    noCompletedOrders: 'No completed orders', admin: 'Dashboard',
    addItem: 'Add new item', itemName: 'Item name', price: 'Price',
    category: 'Category', addBtn: '+ Add item', available: 'Available',
    unavailable: 'Unavailable', delete: 'Delete', currentItems: 'Current items',
    settings: 'Settings', saveCurrency: 'Save currency', saveLanguage: 'Save language',
    saved: 'Saved!', tablePlaceholder: 'Table number', adding: 'Adding...',
  }
}

export async function getSetting(key: string) {
  const { data } = await supabase.from('settings').select('value').eq('id', key).single()
  return data?.value
}

export async function saveSetting(key: string, value: string) {
  await supabase.from('settings').upsert({ id: key, value })
}