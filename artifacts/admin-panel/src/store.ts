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
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  commercialRegister: string;
  rating: number;
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
    id: "s1",
    name: "شركة النسيج الذهبي",
    phone: "+20 100 123 4567",
    email: "info@golden-textile.com",
    address: "القاهرة، مصر - شارع التحرير 25",
    commercialRegister: "CR-1024587",
    rating: 4.7,
  },
  {
    id: "s2",
    name: "مؤسسة الفجر للتجارة",
    phone: "+966 55 987 6543",
    email: "sales@fajr-trade.sa",
    address: "الرياض - حي العليا",
    commercialRegister: "CR-7745120",
    rating: 4.3,
  },
  {
    id: "s3",
    name: "مصانع الأمل المتحدة",
    phone: "+971 50 234 5678",
    email: "contact@alamal.ae",
    address: "دبي - منطقة ديرة",
    commercialRegister: "CR-3398251",
    rating: 4.9,
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
    createdAt: i < 3 ? new Date().toISOString() : new Date(2025, (i % 6) + 1, (i % 27) + 1).toISOString(),
    reviews,
  };
}

let products: Product[] = Array.from({ length: 24 }).map((_, i) => makeProduct(i));
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
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
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useProducts() {
  return useSyncExternalStore(
    adminStore.subscribe,
    adminStore.getAll,
    adminStore.getAll,
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