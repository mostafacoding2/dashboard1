import { useSyncExternalStore } from "react";

export type ProductStatus = "active" | "hidden";
export type AttributeType = "none" | "colors" | "sizes" | "both";

export interface ColorAttr {
  id: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
}
export interface SizeAttr {
  id: string;
  size: string;
  price: number;
  quantity: number;
}
export interface ComboAttr {
  id: string;
  color: string;
  colorCode: string;
  size: string;
  price: number;
  quantity: number;
}
export interface CustomAttr {
  id: string;
  name: string;
  value: string;
}

export interface Supplier {
  id: number;
  name: string;
  type: string;
  loginType: string;
  image: string;
  logo: string;
  fcm: string;
  status: number;
  email: string;
  phone: string;
  walletNumber: string;
  instapayNumber: string;
  whatsappNumber: string;
  callNumber: string;
  emailVerifiedAt: string;
  invitationCode: string;
  marketerInvitationCode: string;
  points: number;
  wallet: number;
  salesBalance: number;
  returnsBalance: number;
  isFirstOrder: number;
  countryId: number;
  cityId: number;
  note: string;
  howKnowUs: string;
  companyName: string;
  typeOfBusiness: string;
  address: string;
  workingHours: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  newOrders: number;
  preparedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  returnedPieces: number;
  acceptedReturns: number;
  rejectedReturns: number;
}

export interface Review {
  id: string;
  customerName: string;
  stars: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  status: ProductStatus;
  mainImage: string;
  gallery: string[];
  category: string;
  subCategory: string;
  weight: number;
  length: number;
  width: number;
  minOrder: number;
  factoryName: string;
  material: string;
  videoUrl?: string;
  attributeType: AttributeType;
  colors: ColorAttr[];
  sizes: SizeAttr[];
  combos: ComboAttr[];
  customAttrs: CustomAttr[];
  supplier: Supplier;
  views: number;
  sales: number;
  favoritesCount: number;
  commission: number;
  createdAt: string;
  reviews: Review[];
}

const categories = ["ملابس", "أحذية", "إكسسوارات", "حقائب", "ساعات"];
const subCats: Record<string, string[]> = {
  "ملابس": ["قميص", "بنطلون", "فستان", "جاكيت"],
  "أحذية": ["رياضي", "كلاسيكي", "صندل"],
  "إكسسوارات": ["نظارات", "أحزمة", "قبعات"],
  "حقائب": ["ظهر", "يد", "سفر"],
  "ساعات": ["رجالي", "نسائي", "ذكية"],
};
const suppliers: Supplier[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    type: "supplier",
    loginType: "email",
    image: "https://picsum.photos/seed/avatar-1/200/200",
    logo: "https://picsum.photos/seed/logo-1/400/400",
    fcm: "fcm_token_123",
    status: 1,
    email: "ahmed@golden-textile.com",
    phone: "+201001234567",
    walletNumber: "W1024587",
    instapayNumber: "01001234567",
    whatsappNumber: "+201001234567",
    callNumber: "+201001234567",
    emailVerifiedAt: "2025-01-15T10:00:00Z",
    invitationCode: "INV-GT-001",
    marketerInvitationCode: "MKT-GT-001",
    points: 2450,
    wallet: 15750.50,
    salesBalance: 12500.00,
    returnsBalance: 3250.50,
    isFirstOrder: 0,
    countryId: 1,
    cityId: 1,
    note: "مورد موثوق - يتميز بالجودة العالية",
    howKnowUs: "إعلانات فيسبوك",
    companyName: "شركة النسيج الذهبي",
    typeOfBusiness: "ملابس وأزياء",
    address: "القاهرة، مصر - شارع التحرير 25",
    workingHours: "السبت - الخميس: 9 ص - 6 م",
    createdAt: "2024-06-15T08:30:00Z",
    updatedAt: "2025-06-20T14:22:00Z",
    averageRating: 4.7,
    newOrders: 12,
    preparedOrders: 8,
    deliveredOrders: 145,
    cancelledOrders: 3,
    returnedOrders: 5,
    returnedPieces: 12,
    acceptedReturns: 8,
    rejectedReturns: 4,
  },
  {
    id: 2,
    name: "خالد عبدالرحمن",
    type: "supplier",
    loginType: "phone",
    image: "https://picsum.photos/seed/avatar-2/200/200",
    logo: "https://picsum.photos/seed/logo-2/400/400",
    fcm: "fcm_token_456",
    status: 1,
    email: "khalid@fajr-trade.sa",
    phone: "+966559876543",
    walletNumber: "W7745120",
    instapayNumber: "0559876543",
    whatsappNumber: "+966559876543",
    callNumber: "+966559876543",
    emailVerifiedAt: "2025-02-20T12:00:00Z",
    invitationCode: "INV-FT-002",
    marketerInvitationCode: "MKT-FT-002",
    points: 1830,
    wallet: 8920.00,
    salesBalance: 7200.00,
    returnsBalance: 1720.00,
    isFirstOrder: 0,
    countryId: 2,
    cityId: 5,
    note: "مورد جديد - يحتاج متابعة",
    howKnowUs: "بحث جوجل",
    companyName: "مؤسسة الفجر للتجارة",
    typeOfBusiness: "إكسسوارات",
    address: "الرياض - حي العليا",
    workingHours: "الأحد - الخميس: 10 ص - 8 م",
    createdAt: "2024-09-01T09:15:00Z",
    updatedAt: "2025-06-18T11:45:00Z",
    averageRating: 4.3,
    newOrders: 5,
    preparedOrders: 3,
    deliveredOrders: 87,
    cancelledOrders: 7,
    returnedOrders: 2,
    returnedPieces: 4,
    acceptedReturns: 3,
    rejectedReturns: 1,
  },
  {
    id: 3,
    name: "سعيد الحربي",
    type: "moderator",
    loginType: "email",
    image: "https://picsum.photos/seed/avatar-3/200/200",
    logo: "https://picsum.photos/seed/logo-3/400/400",
    fcm: "fcm_token_789",
    status: 1,
    email: "saeed@alamal.ae",
    phone: "+971502345678",
    walletNumber: "W3398251",
    instapayNumber: "0502345678",
    whatsappNumber: "+971502345678",
    callNumber: "+971502345678",
    emailVerifiedAt: "2025-03-10T14:00:00Z",
    invitationCode: "INV-AM-003",
    marketerInvitationCode: "MKT-AM-003",
    points: 3200,
    wallet: 22500.75,
    salesBalance: 18900.00,
    returnsBalance: 3600.75,
    isFirstOrder: 0,
    countryId: 3,
    cityId: 12,
    note: "مورد ممتاز - أكبر الموردين حجمًا",
    howKnowUs: "ترشيح من عميل",
    companyName: "مصانع الأمل المتحدة",
    typeOfBusiness: "ملابس وأزياء",
    address: "دبي - منطقة ديرة",
    workingHours: "السبت - الخميس: 8 ص - 5 م",
    createdAt: "2024-03-20T07:00:00Z",
    updatedAt: "2025-06-22T16:30:00Z",
    averageRating: 4.9,
    newOrders: 20,
    preparedOrders: 15,
    deliveredOrders: 312,
    cancelledOrders: 1,
    returnedOrders: 8,
    returnedPieces: 25,
    acceptedReturns: 18,
    rejectedReturns: 7,
  },
];

const colorPalette = [
  { name: "أحمر", code: "#ef4444" },
  { name: "أزرق", code: "#3b82f6" },
  { name: "أخضر", code: "#22c55e" },
  { name: "أسود", code: "#111827" },
  { name: "أبيض", code: "#f3f4f6" },
  { name: "بيج", code: "#d6c4a8" },
];
const sizesList = ["S", "M", "L", "XL", "XXL"];

const productNames = [
  "قميص قطني كلاسيكي",
  "حذاء رياضي خفيف",
  "نظارة شمسية أنيقة",
  "حقيبة ظهر عملية",
  "ساعة يد ذكية",
  "فستان سهرة طويل",
  "بنطلون جينز عصري",
  "جاكيت جلد طبيعي",
  "حزام جلدي فاخر",
  "قبعة صيفية قطنية",
  "صندل صيفي مريح",
  "حقيبة يد جلدية",
];

function rand<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function makeProduct(i: number): Product {
  const cat = rand(categories, i);
  const sub = rand(subCats[cat], i + 1);
  const sup = rand(suppliers, i);
  const type: AttributeType = (["colors", "sizes", "both", "none"] as AttributeType[])[i % 4];
  const colors: ColorAttr[] =
    type === "colors"
      ? colorPalette.slice(0, 3 + (i % 3)).map((c, idx) => ({
          id: `c${i}-${idx}`,
          code: c.code,
          name: c.name,
          price: 150 + idx * 10,
          quantity: 20 + idx * 5,
        }))
      : [];
  const sizes: SizeAttr[] =
    type === "sizes"
      ? sizesList.slice(0, 3 + (i % 3)).map((s, idx) => ({
          id: `s${i}-${idx}`,
          size: s,
          price: 200 + idx * 15,
          quantity: 15 + idx * 4,
        }))
      : [];
  const combos: ComboAttr[] =
    type === "both"
      ? colorPalette.slice(0, 2).flatMap((c, ci) =>
          sizesList.slice(0, 3).map((s, si) => ({
            id: `cb${i}-${ci}-${si}`,
            color: c.name,
            colorCode: c.code,
            size: s,
            price: 180 + ci * 20 + si * 10,
            quantity: 10 + ci * 3 + si * 2,
          })),
        )
      : [];
  const reviews: Review[] = Array.from({ length: 3 + (i % 5) }).map((_, idx) => ({
    id: `r${i}-${idx}`,
    customerName: ["محمد علي", "سارة أحمد", "خالد يوسف", "ليلى حسن", "عمر طارق"][idx % 5],
    stars: 3 + ((i + idx) % 3),
    comment: [
      "منتج رائع وجودة ممتازة، أنصح بشرائه.",
      "وصل بسرعة والتغليف ممتاز، شكراً لكم.",
      "السعر مناسب جداً مقارنة بالجودة.",
      "المقاس كان مظبوط والخامة فاخرة.",
      "تجربة شراء ممتازة، سأكرر الطلب.",
    ][idx % 5],
    date: new Date(2025, 4 + (idx % 3), 5 + idx).toISOString(),
    images: idx % 3 === 0
      ? [`https://picsum.photos/seed/rev-${i}-${idx}/300/300`]
      : undefined,
  }));

  return {
    id: `p${i + 1}`,
    name: productNames[i % productNames.length] + (i >= productNames.length ? ` ${i + 1}` : ""),
    description:
      "منتج عالي الجودة مصنوع من أفضل الخامات الطبيعية، يتميز بتصميم عصري وأنيق يناسب جميع المناسبات. مصمم ليدوم طويلاً مع الحفاظ على مظهره الجذاب.",
    price: 150 + i * 25,
    quantity: 12 + (i * 7) % 80,
    sku: `SKU-${1000 + i}`,
    status: i % 5 === 0 ? "hidden" : "active",
    mainImage: `https://picsum.photos/seed/prod-${i}/800/800`,
    gallery: [1, 2, 3, 4].map((n) => `https://picsum.photos/seed/prod-${i}-${n}/600/600`),
    category: cat,
    subCategory: sub,
    weight: 0.3 + (i % 5) * 0.2,
    length: 20 + (i % 10),
    width: 15 + (i % 8),
    minOrder: 1 + (i % 5),
    factoryName: `مصنع ${["النور", "الصفا", "الإبداع", "المستقبل"][i % 4]}`,
    material: ["قطن 100%", "جلد طبيعي", "بوليستر", "صوف", "حرير"][i % 5],
    videoUrl: i % 3 === 0 ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
    attributeType: type,
    colors,
    sizes,
    combos,
    customAttrs:
      i % 2 === 0
        ? [
            { id: `ca${i}-1`, name: "بلد المنشأ", value: "مصر" },
            { id: `ca${i}-2`, name: "الضمان", value: "سنة كاملة" },
          ]
        : [],
    supplier: sup,
    views: 200 + i * 47,
    sales: 10 + i * 5,
    favoritesCount: Math.floor(Math.random() * 50),
    commission: Math.floor(Math.random() * 50) + 5,
    createdAt: i < 3 ? new Date().toISOString() : new Date(2025, (i % 6) + 1, (i % 27) + 1).toISOString(),
    reviews,
  };
}

let products: Product[] = Array.from({ length: 24 }).map((_, i) => makeProduct(i));
let suppliersData: Supplier[] = [...suppliers];
const listeners = new Set<() => void>();
const supplierListeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function emitSuppliers() {
  supplierListeners.forEach((l) => l());
}

export const adminStore = {
  getAll: () => products,
  get: (id: string) => products.find((p) => p.id === id),
  update: (id: string, patch: Partial<Product>) => {
    products = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
    emit();
  },
  remove: (id: string) => {
    products = products.filter((p) => p.id !== id);
    emit();
  },
  toggleStatus: (id: string) => {
    products = products.map((p) =>
      p.id === id ? { ...p, status: p.status === "active" ? "hidden" : "active" } : p,
    );
    emit();
  },
  deleteReview: (productId: string, reviewId: string) => {
    products = products.map((p) =>
      p.id === productId ? { ...p, reviews: p.reviews.filter((r) => r.id !== reviewId) } : p,
    );
    emit();
  },
  toggleSupplierStatus: (supplierId: number) => {
    suppliersData = suppliersData.map((s) =>
      s.id === supplierId ? { ...s, status: s.status === 1 ? 0 : 1 } : s,
    );
    products = products.map((p) =>
      p.supplier.id === supplierId
        ? { ...p, supplier: { ...p.supplier, status: p.supplier.status === 1 ? 0 : 1 } }
        : p,
    );
    emit();
    emitSuppliers();
  },
  updateSupplier: (supplierId: number, patch: Partial<Supplier>) => {
    suppliersData = suppliersData.map((s) =>
      s.id === supplierId ? { ...s, ...patch } : s,
    );
    products = products.map((p) =>
      p.supplier.id === supplierId
        ? { ...p, supplier: { ...p.supplier, ...patch } }
        : p,
    );
    emit();
    emitSuppliers();
  },
  removeSupplier: (supplierId: number) => {
    suppliersData = suppliersData.filter((s) => s.id !== supplierId);
    products = products.filter((p) => p.supplier.id !== supplierId);
    emit();
    emitSuppliers();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const supplierStore = {
  getAll: () => suppliersData,
  get: (id: number) => suppliersData.find((s) => s.id === id),
  subscribe: (l: () => void) => {
    supplierListeners.add(l);
    return () => supplierListeners.delete(l);
  },
};

export function useProducts() {
  return useSyncExternalStore(
    adminStore.subscribe,
    adminStore.getAll,
    adminStore.getAll,
  );
}

export function useSuppliers() {
  return useSyncExternalStore(
    supplierStore.subscribe,
    supplierStore.getAll,
    supplierStore.getAll,
  );
}

export function useProduct(id: string) {
  return useSyncExternalStore(
    adminStore.subscribe,
    () => adminStore.get(id),
    () => adminStore.get(id),
  );
}

export const categoriesList = categories;
export const suppliersList = suppliers;