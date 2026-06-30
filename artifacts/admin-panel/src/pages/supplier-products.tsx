import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";
import { useSuppliers, useProducts, adminStore, categoriesList } from "@/store";
import type { Product } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Eye, EyeOff, Edit, Trash2, MoreHorizontal, Plus, Search,
  ChevronDown, X, Star, Download, ChevronRight, ChevronLeft,
  Package, TrendingUp, BarChart2, Layers, CalendarDays, Phone,
  MessageSquare, Building2, MapPin, FileText, Check,
  AlertTriangle, ImageOff, Ban, Heart, Video, Crop,
  FileSpreadsheet, Presentation, Sheet as SheetIcon, ArrowRight,
} from "lucide-react";
import ImageEditor from "@/components/image-editor";

const ALL_COLORS = [
  { name: "أحمر", code: "#ef4444" },
  { name: "أزرق", code: "#3b82f6" },
  { name: "أخضر", code: "#22c55e" },
  { name: "أسود", code: "#111827" },
  { name: "أبيض", code: "#e5e7eb" },
  { name: "بيج", code: "#d6c4a8" },
];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
const PAGE_SIZE = 10;

function avgRating(reviews: { stars: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function exportCSV(products: Product[]) {
  const headers = ["الاسم", "SKU", "القسم", "القسم الفرعي", "السعر", "المخزون", "المبيعات", "الحالة", "تاريخ الإضافة"];
  const rows = products.map(p => [
    p.name, p.sku, p.category, p.subCategory, p.price, p.quantity, p.sales,
    p.status === "active" ? "نشط" : "مخفي", formatDate(p.createdAt),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "products.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(products: Product[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Products Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Total: ${products.length} products`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [["Name", "SKU", "Category", "Sub", "Price", "Stock", "Sales", "Status", "Date"]],
    body: products.map(p => [
      p.name, p.sku, p.category, p.subCategory, `$${p.price}`, String(p.quantity), String(p.sales),
      p.status === "active" ? "Active" : "Hidden", formatDate(p.createdAt),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save("products.pdf");
}

function exportExcel(products: Product[]) {
  const data = products.map(p => ({
    "الاسم": p.name,
    "SKU": p.sku,
    "القسم": p.category,
    "القسم الفرعي": p.subCategory,
    "السعر": p.price,
    "المخزون": p.quantity,
    "المبيعات": p.sales,
    "الحالة": p.status === "active" ? "نشط" : "مخفي",
    "تاريخ الإضافة": formatDate(p.createdAt),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, "products.xlsx");
}

async function exportPowerPoint(products: Product[]) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const fetchImage = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  const titleSlide = pptx.addSlide();
  titleSlide.addText("تقرير المنتجات", {
    x: 0.5, y: 1.5, w: "90%", h: 1.5,
    fontSize: 36, bold: true, color: "3B82F6", align: "center",
  });
  titleSlide.addText(`التاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي: ${products.length} منتج`, {
    x: 0.5, y: 3.2, w: "90%", h: 0.8,
    fontSize: 14, color: "666666", align: "center",
  });

  const imageMap = new Map<string, string>();
  await Promise.all(
    products.slice(0, 30).map(async (p) => {
      const dataUrl = await fetchImage(p.mainImage);
      if (dataUrl) imageMap.set(p.id, dataUrl);
    })
  );

  const chunks = products.slice(0, 30).reduce<Product[][]>((acc, p, i) => {
    if (i % 3 === 0) acc.push([]);
    acc[acc.length - 1].push(p);
    return acc;
  }, []);

  chunks.forEach((chunk) => {
    const slide = pptx.addSlide();
    chunk.forEach((p, i) => {
      const x = 0.3 + i * 3.1;
      const imgData = imageMap.get(p.id);

      if (imgData) {
        slide.addImage({ data: imgData, x, y: 0.4, w: 2.8, h: 2.0, rounding: true });
      } else {
        slide.addShape("roundRect" as any, {
          x, y: 0.4, w: 2.8, h: 2.0, fill: { color: "F3F4F6" }, rectRadius: 0.1,
        });
        slide.addText("لا توجد صورة", {
          x, y: 1.1, w: 2.8, h: 0.5,
          fontSize: 10, color: "9CA3AF", align: "center",
        });
      }

      slide.addText(p.name, {
        x, y: 2.5, w: 2.8, h: 0.4,
        fontSize: 11, bold: true, color: "1F2937", align: "center",
      });
      slide.addText(`$${p.price} | مخزون: ${p.quantity} | مبيعات: ${p.sales}`, {
        x, y: 2.9, w: 2.8, h: 0.35,
        fontSize: 9, color: "6B7280", align: "center",
      });
    });
  });

  const tableSlide = pptx.addSlide();
  tableSlide.addText("قائمة المنتجات", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 20, bold: true, color: "1F2937",
  });

  const headerRow = [
    { text: "الصورة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الاسم", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "SKU", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "القسم", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "السعر", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "المخزون", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "المبيعات", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الحالة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
  ];

  const rows = products.slice(0, 20).map(p => {
    const imgData = imageMap.get(p.id);
    const cells: { text: string; options?: Record<string, unknown> }[] = [];
    if (imgData) {
      cells.push({ text: "", options: { image: imgData } });
    } else {
      cells.push({ text: "" });
    }
    cells.push({ text: p.name });
    cells.push({ text: p.sku });
    cells.push({ text: p.category });
    cells.push({ text: `$${p.price}` });
    cells.push({ text: String(p.quantity) });
    cells.push({ text: String(p.sales) });
    cells.push({ text: p.status === "active" ? "نشط" : "مخفي" });
    return cells;
  });

  tableSlide.addTable([headerRow, ...rows], {
    x: 0.2, y: 1.0, w: 9.6,
    fontSize: 9,
    border: { type: "solid", pt: 0.5, color: "D1D5DB" },
    colW: [0.8, 2, 1.1, 1.3, 0.9, 0.9, 0.9, 0.9],
    autoPage: false,
    rowH: 0.5,
  });

  const summarySlide = pptx.addSlide();
  const active = products.filter(p => p.status === "active").length;
  const totalSales = products.reduce((s, p) => s + p.sales, 0);
  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);

  summarySlide.addText("ملخص", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 24, bold: true, color: "1F2937",
  });

  const stats = [
    { label: "إجمالي المنتجات", value: String(products.length), color: "3B82F6" },
    { label: "المنتجات النشطة", value: String(active), color: "22C55E" },
    { label: "إجمالي المبيعات", value: totalSales.toLocaleString(), color: "F59E0B" },
    { label: "قيمة المخزون", value: `$${totalValue.toLocaleString()}`, color: "8B5CF6" },
  ];

  stats.forEach((s, i) => {
    const x = 0.5 + i * 2.3;
    summarySlide.addShape("roundRect" as any, {
      x, y: 1.2, w: 2.1, h: 1.8, fill: { color: s.color }, rectRadius: 0.1,
    });
    summarySlide.addText(s.value, {
      x, y: 1.4, w: 2.1, h: 0.8,
      fontSize: 28, bold: true, color: "FFFFFF", align: "center",
    });
    summarySlide.addText(s.label, {
      x, y: 2.2, w: 2.1, h: 0.5,
      fontSize: 11, color: "FFFFFF", align: "center",
    });
  });

  await pptx.writeFile({ fileName: "products.pptx" });
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

function toLocalDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function TodayProductsDrawer({ onClose, supplierId }: { onClose: () => void; supplierId: number }) {
  const products = useProducts();
  const [, setLocation] = useLocation();

  const [selectedDate, setSelectedDate] = useState(toLocalDateInput(new Date()));

  const filteredProducts = products.filter((p) => {
    const pDate = toLocalDateInput(new Date(p.createdAt));
    return pDate === selectedDate && p.supplier.id === supplierId;
  });

  const [editingImg, setEditingImg] = useState<{ productId: string; index: number | "main"; url: string } | null>(null);

  function deleteGalleryImg(productId: string, index: number) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const newGallery = p.gallery.filter((_, i) => i !== index);
    adminStore.update(productId, { gallery: newGallery });
  }

  function deleteMainImg(productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p || p.gallery.length === 0) return;
    adminStore.update(productId, { mainImage: p.gallery[0], gallery: p.gallery.slice(1) });
  }

  function saveEditImg(productId: string, index: number | "main", url: string) {
    const p = products.find((x) => x.id === productId);
    if (!p || !url.trim()) return;
    if (index === "main") {
      adminStore.update(productId, { mainImage: url.trim() });
    } else {
      const newGallery = [...p.gallery];
      newGallery[index] = url.trim();
      adminStore.update(productId, { gallery: newGallery });
    }
    setEditingImg(null);
  }

  function waLink(phone: string) {
    const digits = phone.replace(/\D/g, "");
    return `https://wa.me/${digits}`;
  }

  const [selectedImgs, setSelectedImgs] = useState<Record<string, Set<string>>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{ productId: string; index: number | "main"; url: string } | null>(null);

  function toggleImgSelect(productId: string, key: string) {
    setSelectedImgs(prev => {
      const next = { ...prev };
      if (!next[productId]) next[productId] = new Set();
      else next[productId] = new Set(next[productId]);
      if (next[productId].has(key)) next[productId].delete(key); else next[productId].add(key);
      return next;
    });
  }

  function toggleAllImgs(productId: string, allKeys: string[]) {
    setSelectedImgs(prev => {
      const next = { ...prev };
      if (!next[productId]) next[productId] = new Set();
      else next[productId] = new Set(next[productId]);
      if (next[productId].size === allKeys.length) { next[productId] = new Set(); }
      else { next[productId] = new Set(allKeys); }
      return next;
    });
  }

  async function downloadImg(url: string, name: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, "_blank"); }
  }

  async function downloadAllProductImages(product: Product) {
    const all = [product.mainImage, ...product.gallery];
    for (let i = 0; i < all.length; i++) {
      await downloadImg(all[i], `${product.name}_${i}.jpg`);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  async function downloadSelectedProductImages(product: Product) {
    const keys = selectedImgs[product.id];
    if (!keys || keys.size === 0) return;
    const all = [{ url: product.mainImage, key: "main" }, ...product.gallery.map((url, i) => ({ url, key: String(i) }))];
    for (const img of all) {
      if (keys.has(img.key)) {
        await downloadImg(img.url, `${product.name}_${img.key}.jpg`);
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  function deleteSelectedProductImages(product: Product) {
    const keys = selectedImgs[product.id];
    if (!keys || keys.size === 0) return;
    let mainImg = product.mainImage;
    let gallery = [...product.gallery];
    const sortedKeys = [...keys].sort((a, b) => a === "main" ? -1 : b === "main" ? 1 : Number(a) - Number(b));
    for (const k of sortedKeys) {
      if (k === "main") {
        if (gallery.length > 0) { mainImg = gallery[0]; gallery = gallery.slice(1); }
      } else {
        gallery = gallery.filter((_, i) => i !== Number(k));
      }
    }
    adminStore.update(product.id, { mainImage: mainImg, gallery });
    setSelectedImgs(prev => { const n = { ...prev }; delete n[product.id]; return n; });
  }

  function saveEditorImage(newUrl: string) {
    if (!editorState) return;
    const { productId, index } = editorState;
    if (index === "main") {
      adminStore.update(productId, { mainImage: newUrl });
    } else {
      const p = products.find(x => x.id === productId);
      if (p) {
        const newGallery = [...p.gallery];
        newGallery[index] = newUrl;
        adminStore.update(productId, { gallery: newGallery });
      }
    }
    setEditorState(null);
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-[560px] p-0 overflow-y-auto flex flex-col">
        <div className="flex flex-col gap-3 p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">منتجات اليوم</h2>
              <Badge className="bg-primary text-primary-foreground">{filteredProducts.length}</Badge>
            </div>
            {selectedDate !== toLocalDateInput(new Date()) && (
              <button
                onClick={() => setSelectedDate(toLocalDateInput(new Date()))}
                className="text-xs text-primary underline underline-offset-2 hover:no-underline">
                العودة لليوم
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground whitespace-nowrap">اختر التاريخ:</label>
            <Input
              type="date"
              value={selectedDate}
              max={toLocalDateInput(new Date())}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ar-EG", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">لا توجد منتجات أُضيفت في هذا التاريخ</p>
            <button onClick={() => setSelectedDate(toLocalDateInput(new Date()))} className="text-xs text-primary underline">
              عرض منتجات اليوم
            </button>
          </div>
        ) : (
          <div className="flex-1 divide-y">
            {filteredProducts.map((product) => {
              const rating = avgRating(product.reviews);
              const allImages: { url: string; index: number | "main" }[] = [
                { url: product.mainImage, index: "main" },
                ...product.gallery.map((url, i) => ({ url, index: i })),
              ];
              return (
                <div key={product.id} className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <img src={product.mainImage} alt={product.name}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0 border border-border" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base">{product.name}</span>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}
                          className={`text-xs ${product.status === "active" ? "bg-green-500" : ""}`}>
                          {product.status === "active" ? "نشط" : "مخفي"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.category} · {product.subCategory} · {product.sku}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-sm font-semibold">{product.price} ج.م</span>
                        <span className="text-xs text-muted-foreground">مخزون: <span className={product.quantity < 15 ? "text-destructive font-medium" : ""}>{product.quantity}</span></span>
                        <span className="text-xs text-muted-foreground">مبيعات: {product.sales}</span>
                        <span className="text-xs font-medium text-primary">عمولة: {product.commission} ج.م</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="flex-shrink-0 text-xs"
                      onClick={() => { onClose(); setLocation(`/products/${product.id}`); }}>
                      <Edit className="h-3 w-3 ml-1" />تعديل
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 bg-muted/40 rounded-md px-3 py-2">
                    {product.description}
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        معرض الصور
                        <span className="font-normal">({allImages.length} صورة)</span>
                      </p>
                      <div className="flex items-center gap-1.5">
                        {(selectedImgs[product.id]?.size ?? 0) > 0 && (
                          <>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
                              onClick={() => downloadSelectedProductImages(product)}>
                              <Download className="h-3 w-3 ml-0.5" />تحميل ({selectedImgs[product.id].size})
                            </Button>
                            <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2"
                              onClick={() => deleteSelectedProductImages(product)}>
                              <Trash2 className="h-3 w-3 ml-0.5" />حذف
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                          onClick={() => toggleAllImgs(product.id, allImages.map(img => String(img.index)))}>
                          {(selectedImgs[product.id]?.size ?? 0) === allImages.length ? "إلغاء" : "تحديد الكل"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                          onClick={() => downloadAllProductImages(product)}>
                          <Download className="h-3 w-3 ml-0.5" />تحميل الكل
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allImages.map(({ url, index }) => {
                        const isEditing = editingImg?.productId === product.id && editingImg.index === index;
                        const isSelected = selectedImgs[product.id]?.has(String(index)) ?? false;
                        return (
                          <div key={String(index)} className="relative group">
                            <div className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${index === "main" ? "border-primary" : isSelected ? "border-blue-500" : "border-border"} cursor-pointer`}
                              onClick={() => setLightboxUrl(url)}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                            {index === "main" && (
                              <span className="absolute -top-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded px-1 leading-4">رئيسية</span>
                            )}
                            <div className="absolute top-0.5 left-0.5">
                              <Checkbox checked={isSelected} onCheckedChange={() => toggleImgSelect(product.id, String(index))}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white/80 data-[state=checked]:bg-blue-500 h-3.5 w-3.5" />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); setLightboxUrl(url); }}
                                className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center">
                                <Eye className="h-3 w-3 text-white" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); downloadImg(url, `${product.name}_${index}.jpg`); }}
                                className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center">
                                <Download className="h-3 w-3 text-white" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditorState({ productId: product.id, index, url }); }}
                                className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center">
                                <Crop className="h-3 w-3 text-white" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingImg({ productId: product.id, index, url }); }}
                                className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center">
                                <Edit className="h-3 w-3 text-white" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); index === "main" ? deleteMainImg(product.id) : deleteGalleryImg(product.id, index as number); }}
                                className="h-6 w-6 rounded bg-red-500/80 hover:bg-red-600 flex items-center justify-center">
                                <Trash2 className="h-3 w-3 text-white" />
                              </button>
                            </div>
                            {isEditing && (
                              <div className="absolute top-full right-0 mt-1 z-20 bg-background border border-border rounded-lg shadow-lg p-2 w-56">
                                <p className="text-xs font-medium mb-1.5">رابط الصورة الجديدة</p>
                                <Input
                                  className="h-7 text-xs mb-1.5"
                                  defaultValue={url}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEditImg(product.id, index, (e.target as HTMLInputElement).value);
                                    if (e.key === "Escape") setEditingImg(null);
                                  }}
                                  autoFocus
                                  id={`edit-img-${product.id}-${index}`}
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" className="h-6 text-xs flex-1"
                                    onClick={() => {
                                      const el = document.getElementById(`edit-img-${product.id}-${index}`) as HTMLInputElement;
                                      if (el) saveEditImg(product.id, index, el.value);
                                    }}>
                                    <Check className="h-3 w-3 ml-1" />حفظ
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditingImg(null)}>إلغاء</Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {product.videoUrl && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" /> فيديو المنتج
                        </p>
                        <div className="aspect-video rounded-md overflow-hidden border bg-black">
                          {product.videoUrl.includes("youtube.com") || product.videoUrl.includes("youtu.be") ? (
                            <iframe src={product.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                          ) : (
                            <video src={product.videoUrl} controls className="w-full h-full" />
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="bg-muted/30 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">بيانات المورد</p>
                      <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 text-destructive hover:bg-destructive/10"
                        onClick={() => { if (confirm("هل تريد حذف هذا المورد من المنتج؟")) { adminStore.update(product.id, { supplier: { ...product.supplier, name: "", phone: "", email: "", address: "", companyName: "", averageRating: 0, type: "", loginType: "", image: "", logo: "", fcm: "", status: 0, walletNumber: "", instapayNumber: "", whatsappNumber: "", callNumber: "", emailVerifiedAt: "", invitationCode: "", marketerInvitationCode: "", points: 0, wallet: 0, isFirstOrder: 0, countryId: 0, cityId: 0, note: "", howKnowUs: "", typeOfBusiness: "", workingHours: "", createdAt: "", updatedAt: "" } }); } }}>
                        <Trash2 className="h-2.5 w-2.5 ml-0.5" /> حذف
                      </Button>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm">{product.supplier.name}</p>
                      <span className="text-[10px] text-muted-foreground">({product.supplier.companyName})</span>
                      <button onClick={() => { navigator.clipboard.writeText(product.supplier.name); }}
                        className="text-muted-foreground hover:text-foreground transition-colors" title="نسخ الاسم">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.round(product.supplier.averageRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground mr-1">{product.supplier.averageRating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">ID: {product.supplier.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{product.supplier.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>السجل: <span className="font-medium text-foreground">{product.supplier.typeOfBusiness}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{product.supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        <span dir="ltr">{product.supplier.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <a href={`tel:${product.supplier.phone}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-green-200 text-green-700 hover:bg-green-50">
                          <Phone className="h-3.5 w-3.5" />
                          {product.supplier.phone}
                        </Button>
                      </a>
                      <a href={waLink(product.supplier.phone)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          واتساب
                        </Button>
                      </a>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                        <MessageSquare className="h-3.5 w-3.5" />
                        چات
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {editorState && (
          <ImageEditor src={editorState.url} onSave={saveEditorImage} onClose={() => setEditorState(null)} />
        )}

        {lightboxUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
            <button className="absolute top-4 left-4 text-white/80 hover:text-white" onClick={() => setLightboxUrl(null)}>
              <X className="h-8 w-8" />
            </button>
            <img src={lightboxUrl} alt="عرض كامل" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function SupplierProducts() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const suppliers = useSuppliers();
  const products = useProducts();
  const supplier = suppliers.find(s => s.id === Number(id));

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRangeMode, setDateRangeMode] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [todayOpen, setTodayOpen] = useState(false);
  const todayCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return products.filter(p => new Date(p.createdAt).toDateString() === todayStr && p.supplier.id === Number(id)).length;
  }, [products, id]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [priceFilter, setPriceFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [weightFilter, setWeightFilter] = useState("");
  const [widthFilter, setWidthFilter] = useState("");
  const [lengthFilter, setLengthFilter] = useState("");

  const subCategories = useMemo(() => {
    const base = categoryFilter === "all"
      ? products.filter(p => p.supplier.id === Number(id))
      : products.filter(p => p.supplier.id === Number(id) && p.category === categoryFilter);
    return [...new Set(base.map(p => p.subCategory))].filter(Boolean);
  }, [products, categoryFilter, id]);

  const filteredAndSorted = useMemo(() => {
    let list = products.filter(p => {
      if (p.supplier.id !== Number(id)) return false;
      const matchesSearch = p.name.includes(search) || p.sku.includes(search);
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesSubCategory = subCategoryFilter === "all" || p.subCategory === subCategoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesPrice = !priceFilter || p.price === Number(priceFilter);
      const matchesMaterial = !materialFilter || p.material.toLowerCase().includes(materialFilter.toLowerCase());
      const matchesWeight = !weightFilter || String(p.weight).includes(weightFilter);
      const matchesWidth = !widthFilter || String(p.width).includes(widthFilter);
      const matchesLength = !lengthFilter || String(p.length).includes(lengthFilter);
      const matchesColor = selectedColors.length === 0 || (() => {
        if (p.attributeType === "colors") return p.colors.some(c => selectedColors.includes(c.name));
        if (p.attributeType === "both") return p.combos.some(c => selectedColors.includes(c.color));
        return false;
      })();
      const matchesSize = selectedSizes.length === 0 || (() => {
        if (p.attributeType === "sizes") return p.sizes.some(s => selectedSizes.includes(s.size));
        if (p.attributeType === "both") return p.combos.some(c => selectedSizes.includes(c.size));
        return false;
      })();
      const matchesRating = minRating === 0 || avgRating(p.reviews) >= minRating;
      const created = new Date(p.createdAt).getTime();
      const matchesDateFrom = !dateFrom || created >= new Date(dateFrom).getTime();
      const matchesDateTo = !dateTo || created <= new Date(dateTo + "T23:59:59").getTime();
      return matchesSearch && matchesCategory && matchesSubCategory && matchesStatus &&
        matchesPrice && matchesMaterial && matchesWeight && matchesWidth && matchesLength &&
        matchesColor && matchesSize && matchesRating && matchesDateFrom && matchesDateTo;
    });
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_high": return b.price - a.price;
        case "price_low": return a.price - b.price;
        case "most_views": return b.views - a.views;
        case "most_sales": return b.sales - a.sales;
        case "highest_rating": return avgRating(b.reviews) - avgRating(a.reviews);
        default: return 0;
      }
    });
    return list;
  }, [products, id, search, categoryFilter, subCategoryFilter, statusFilter,
    priceFilter, materialFilter, weightFilter, widthFilter, lengthFilter,
    selectedColors, selectedSizes, minRating, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = useMemo(() => {
    const sp = products.filter(p => p.supplier.id === Number(id));
    return {
      total: sp.length,
      active: sp.filter(p => p.status === "active").length,
      hidden: sp.filter(p => p.status === "hidden").length,
      totalStock: sp.reduce((s, p) => s + p.quantity, 0),
      totalViews: sp.reduce((s, p) => s + p.views, 0),
      totalSales: sp.reduce((s, p) => s + p.sales, 0),
      unsold: sp.filter(p => p.sales === 0).length,
      totalReviews: sp.reduce((s, p) => s + p.reviews.length, 0),
      favorites: sp.reduce((s, p) => s + p.favoritesCount, 0),
    };
  }, [products, id]);

  const toggleColor = (name: string) =>
    setSelectedColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0 ||
    !!priceFilter || !!materialFilter || !!weightFilter || !!widthFilter || !!lengthFilter || minRating > 0 ||
    !!dateFrom || !!dateTo || subCategoryFilter !== "all";

  const clearAllFilters = () => {
    setSearch(""); setCategoryFilter("all"); setSubCategoryFilter("all");
    setStatusFilter("all");
    setSelectedColors([]); setSelectedSizes([]);
    setPriceFilter(""); setMaterialFilter(""); setWeightFilter(""); setWidthFilter(""); setLengthFilter(""); setMinRating(0);
    setDateFrom(""); setDateTo(""); setDateRangeMode(false); setSortBy("newest"); setPage(1);
  };

  const confirmDelete = () => {
    if (deleteId) { adminStore.remove(deleteId); setDeleteId(null); }
  };

  const allPageSelected = paginated.length > 0 && paginated.every(p => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds(prev => { const n = new Set(prev); paginated.forEach(p => n.delete(p.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); paginated.forEach(p => n.add(p.id)); return n; });
    }
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const bulkActivate = () => { selectedIds.forEach(id => { const p = products.find(x => x.id === id); if (p?.status === "hidden") adminStore.toggleStatus(id); }); setSelectedIds(new Set()); };
  const bulkHide = () => { selectedIds.forEach(id => { const p = products.find(x => x.id === id); if (p?.status === "active") adminStore.toggleStatus(id); }); setSelectedIds(new Set()); };
  const bulkDelete = () => { selectedIds.forEach(id => adminStore.remove(id)); setSelectedIds(new Set()); setBulkDeleteOpen(false); };

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">لم يتم العثور على المورد</p>
        <Button variant="outline" onClick={() => setLocation("/suppliers")}>
          <ArrowRight className="h-4 w-4 ml-2" /> العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Supplier Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg shrink-0">
              <AvatarImage src={supplier.image} alt={supplier.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{supplier.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold truncate">{supplier.name}</h1>
                <Badge variant={supplier.status === 1 ? "default" : "destructive"}
                  className={`${supplier.status === 1 ? "bg-green-500" : ""} shrink-0`}>
                  {supplier.status === 1 ? "نشط" : "معطل"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{supplier.companyName}</p>
              <div className="flex items-center gap-2 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(supplier.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                ))}
                <span className="text-sm font-bold">{supplier.averageRating}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation(`/suppliers/${supplier.id}`)}>
              <ArrowRight className="h-4 w-4 ml-1" />
              العودة للتفاصيل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">منتجات المورد</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-1.5" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportCSV(filteredAndSorted)}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPDF(filteredAndSorted)}>
                <FileText className="h-4 w-4 ml-2" />
                تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportExcel(filteredAndSorted)}>
                <SheetIcon className="h-4 w-4 ml-2" />
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPowerPoint(filteredAndSorted)}>
                <Presentation className="h-4 w-4 ml-2" />
                تصدير PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="relative" onClick={() => setTodayOpen(true)}>
            <CalendarDays className="h-4 w-4 ml-1.5" />
            منتجات اليوم
            {todayCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {todayCount}
              </span>
            )}
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "إجمالي المنتجات", value: stats.total, color: "text-foreground", icon: <Package className="h-3.5 w-3.5" /> },
            { label: "المفعّل", value: stats.active, color: "text-green-500", icon: <TrendingUp className="h-3.5 w-3.5" /> },
            { label: "الغير مفعّل", value: stats.hidden, color: "text-orange-400", icon: <EyeOff className="h-3.5 w-3.5" /> },
            { label: "المخزون الكلي", value: stats.totalStock.toLocaleString("ar-EG"), color: "text-foreground", icon: <Layers className="h-3.5 w-3.5" /> },
            { label: "إجمالي الزيارات", value: stats.totalViews.toLocaleString("ar-EG"), color: "text-foreground", icon: <Eye className="h-3.5 w-3.5" /> },
            { label: "المبيعات", value: stats.totalSales.toLocaleString("ar-EG"), color: "text-foreground", icon: <BarChart2 className="h-3.5 w-3.5" /> },
            { label: "بدون مبيعات", value: stats.unsold, color: stats.unsold > 0 ? "text-destructive" : "text-foreground", icon: <Package className="h-3.5 w-3.5" /> },
            { label: "التقييمات", value: stats.totalReviews.toLocaleString("ar-EG"), color: "text-foreground", icon: <Star className="h-3.5 w-3.5" /> },
            { label: "المفضلة", value: stats.favorites, color: "text-pink-500", icon: <Heart className="h-3.5 w-3.5" /> },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
              <span className="text-muted-foreground">{s.icon}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
              <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
          <span className="text-sm font-medium text-primary">{selectedIds.size} منتج محدد</span>
          <div className="flex gap-2 mr-auto flex-wrap">
            <Button size="sm" variant="outline" onClick={bulkActivate}>تنشيط الكل</Button>
            <Button size="sm" variant="outline" onClick={bulkHide}>إخفاء الكل</Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5 ml-1" />
              حذف المحدد
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>إلغاء</Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Row 1: Search + Category + Sub-cat + Status */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="اسم المنتج أو رمز SKU..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-9" />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSubCategoryFilter("all"); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {categoriesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subCategoryFilter} onValueChange={(v) => { setSubCategoryFilter(v); setPage(1); }} disabled={subCategories.length === 0}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="القسم الفرعي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفروع</SelectItem>
                {subCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="hidden">مخفي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: advanced filters + sort */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Colors */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"
                  className={selectedColors.length > 0 ? "border-primary text-primary" : ""}>
                  الألوان
                  {selectedColors.length > 0 && <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">{selectedColors.length}</Badge>}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" align="start">
                <p className="text-sm font-medium mb-3">تصفية بالألوان</p>
                <div className="space-y-2">
                  {ALL_COLORS.map(color => (
                    <div key={color.name} className="flex items-center gap-2">
                      <Checkbox id={`color-${color.name}`} checked={selectedColors.includes(color.name)} onCheckedChange={() => toggleColor(color.name)} />
                      <span className="h-4 w-4 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: color.code }} />
                      <label htmlFor={`color-${color.name}`} className="text-sm cursor-pointer">{color.name}</label>
                    </div>
                  ))}
                </div>
                {selectedColors.length > 0 && <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => setSelectedColors([])}>مسح الألوان</Button>}
              </PopoverContent>
            </Popover>

            {/* Sizes */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"
                  className={selectedSizes.length > 0 ? "border-primary text-primary" : ""}>
                  الأحجام
                  {selectedSizes.length > 0 && <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">{selectedSizes.length}</Badge>}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-3" align="start">
                <p className="text-sm font-medium mb-3">تصفية بالأحجام</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(size => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${selectedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"}`}>
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => setSelectedSizes([])}>مسح الأحجام</Button>}
              </PopoverContent>
            </Popover>

            {/* Price */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">السعر</label>
              <Input type="number" placeholder="سعر المنتج"
                value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}
                className={`w-28 h-9 ${priceFilter ? "border-primary text-primary" : ""}`} />
            </div>

            {/* Attributes */}
            <div className="flex items-center gap-2">
              <Input type="text" placeholder="الخامة"
                value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)}
                className={`w-24 h-9 ${materialFilter ? "border-primary text-primary" : ""}`} />
              <Input type="number" placeholder="الوزن"
                value={weightFilter} onChange={(e) => setWeightFilter(e.target.value)}
                className={`w-20 h-9 ${weightFilter ? "border-primary text-primary" : ""}`} />
              <Input type="number" placeholder="العرض"
                value={widthFilter} onChange={(e) => setWidthFilter(e.target.value)}
                className={`w-20 h-9 ${widthFilter ? "border-primary text-primary" : ""}`} />
              <Input type="number" placeholder="الطول"
                value={lengthFilter} onChange={(e) => setLengthFilter(e.target.value)}
                className={`w-20 h-9 ${lengthFilter ? "border-primary text-primary" : ""}`} />
            </div>

            {/* Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"
                  className={(dateFrom || dateTo) ? "border-primary text-primary" : ""}>
                  التاريخ
                  {(dateFrom || dateTo) && <span className="mr-2 text-xs font-medium">{dateFrom || "..."}{dateTo ? ` ← ${dateTo}` : ""}</span>}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">تاريخ الإنشاء</p>
                  <button type="button" onClick={() => { setDateRangeMode(!dateRangeMode); if (dateRangeMode) setDateTo(""); }}
                    className="text-xs text-primary hover:underline">
                    {dateRangeMode ? "تاريخ واحد" : "فترة"}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{dateRangeMode ? "من تاريخ" : "التاريخ"}</label>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-sm" />
                  </div>
                  {dateRangeMode && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">إلى تاريخ</label>
                      <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-sm" />
                    </div>
                  )}
                </div>
                {(dateFrom || dateTo) && <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => { setDateFrom(""); setDateTo(""); }}>مسح التاريخ</Button>}
              </PopoverContent>
            </Popover>

            {/* Rating */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"
                  className={minRating > 0 ? "border-primary text-primary" : ""}>
                  التقييم
                  {minRating > 0 && <span className="mr-2 text-xs font-medium">{minRating}+ نجوم</span>}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" align="start">
                <p className="text-sm font-medium mb-3">الحد الأدنى للتقييم</p>
                <div className="space-y-1">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setMinRating(n)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-right ${minRating === n ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                      {n === 0 ? <span className="text-muted-foreground">كل التقييمات</span> : (
                        <>
                          <span>{n}+ نجوم</span>
                          <span className="flex mr-auto">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                <SelectItem value="price_high">الأعلى سعراً</SelectItem>
                <SelectItem value="price_low">الأقل سعراً</SelectItem>
                <SelectItem value="most_views">الأكثر مشاهدة</SelectItem>
                <SelectItem value="most_sales">الأكثر مبيعاً</SelectItem>
                <SelectItem value="highest_rating">الأعلى تقييماً</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground gap-1">
                <X className="h-3.5 w-3.5" />مسح الكل
              </Button>
            )}
            <span className="text-sm text-muted-foreground mr-auto">
              {filteredAndSorted.length} منتج
            </span>
          </div>

          {/* Active chips */}
          {(selectedColors.length > 0 || selectedSizes.length > 0 || minRating > 0 || dateFrom || dateTo || subCategoryFilter !== "all") && (
            <div className="flex flex-wrap gap-2">
              {selectedColors.map(c => {
                const color = ALL_COLORS.find(col => col.name === c);
                return <Badge key={c} variant="secondary" className="gap-1.5 pr-1">
                  <span className="h-3 w-3 rounded-full inline-block border" style={{ backgroundColor: color?.code }} />
                  {c}
                  <button onClick={() => toggleColor(c)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>;
              })}
              {selectedSizes.map(s => <Badge key={s} variant="secondary" className="gap-1.5 pr-1">{s}<button onClick={() => toggleSize(s)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button></Badge>)}
              {minRating > 0 && <Badge variant="secondary" className="gap-1.5 pr-1">{minRating}+ نجوم<button onClick={() => setMinRating(0)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button></Badge>}
              {subCategoryFilter !== "all" && <Badge variant="secondary" className="gap-1.5 pr-1">{subCategoryFilter}<button onClick={() => setSubCategoryFilter("all")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button></Badge>}
              {dateFrom && <Badge variant="secondary" className="gap-1.5 pr-1">من: {dateFrom}<button onClick={() => setDateFrom("")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button></Badge>}
              {dateTo && <Badge variant="secondary" className="gap-1.5 pr-1">إلى: {dateTo}<button onClick={() => setDateTo("")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button></Badge>}
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[40px] text-center">
                    <Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead className="w-[52px]">صورة</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>المبيعات</TableHead>
                  <TableHead>العمولة</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإضافة</TableHead>
                  <TableHead className="text-left w-[52px]">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      لا توجد منتجات مطابقة للفلاتر المحددة.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((product) => {
                    const rating = avgRating(product.reviews);
                    const isSelected = selectedIds.has(product.id);
                    return (
                      <TableRow key={product.id}
                        className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => setLocation(`/products/quick/${product.id}`)}>
                        <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(product.id)} />
                        </TableCell>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                            <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {product.category}{product.subCategory && <span> · {product.subCategory}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{product.sku}</TableCell>
                        <TableCell className="text-right font-medium">{product.price} ج.م</TableCell>
                        <TableCell className="text-right">
                          <span className={product.quantity < 15 ? "text-destructive font-medium" : ""}>{product.quantity}</span>
                        </TableCell>
                        <TableCell className="text-right text-sm">{product.sales}</TableCell>
                        <TableCell className="text-right text-sm font-medium text-primary">{product.commission} ج.م</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={product.status === "active" ? "default" : "secondary"}
                            className={product.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}>
                            {product.status === "active" ? "نشط" : "مخفي"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell className="text-left" onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation(`/products/quick/${product.id}`)}>
                                <Eye className="h-4 w-4 ml-2" />عرض سريع
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => setLocation(`/products/${product.id}`)}>
                                <Edit className="h-4 w-4 ml-2" />تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adminStore.toggleStatus(product.id)}>
                                <Eye className="h-4 w-4 ml-2" />
                                {product.status === "active" ? "إخفاء" : "تنشيط"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => setDeleteId(product.id)}>
                                <Trash2 className="h-4 w-4 ml-2" />حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                صفحة {safePage} من {totalPages} · {filteredAndSorted.length} منتج
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(1)}>
                  <ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -mr-2" />
                </Button>
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pg = Math.max(1, Math.min(totalPages - 4, safePage - 2)) + i;
                  return (
                    <Button key={pg} variant={safePage === pg ? "default" : "outline"} size="sm"
                      className="min-w-[32px]" onClick={() => setPage(pg)}>
                      {pg}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(totalPages)}>
                  <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today Products Drawer */}
      {todayOpen && <TodayProductsDrawer onClose={() => setTodayOpen(false)} supplierId={Number(id)} />}

      {/* Delete single */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start">
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mr-2">حذف</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selectedIds.size} منتج؟</AlertDialogTitle>
            <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع المنتجات المحددة نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start">
            <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mr-2">حذف الكل</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
