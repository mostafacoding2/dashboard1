import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useProducts } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowRight, Truck, CheckCircle2, Clock, XCircle, CreditCard, MapPin, User, Package, Image, Copy, Phone, Mail, MessageCircle, MessageSquare, Pencil, Trash2, Download, Share2, Printer, Maximize2, AlertTriangle, FileImage, Send, ArrowUpDown, Building2 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "جديدة", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
  processing: { label: "مجهزة", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Package },
  shipped: { label: "مشحونة", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Truck },
  delivered: { label: "مكتملة", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "ملغية", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "مدفوع", color: "text-green-700", bg: "bg-green-100" },
  unpaid: { label: "غير مدفوع", color: "text-red-700", bg: "bg-red-100" },
  partial: { label: "مدفوع جزئياً", color: "text-yellow-700", bg: "bg-yellow-100" },
};

const paymentMethodLabels: Record<string, string> = {
  cash: "كاش",
  credit_card: "بطاقة ائتمان",
  bank_transfer: "تحويل بنفي",
  wallet: "محفظة إلكترونية",
  vodafone_cash: "فودافون كاش",
};

// OrderDetailsItemEntity
interface OrderDetailsItemEntity {
  id: number | null;
  productId: number | null;
  name: string | null;
  image: string | null;
  quantity: number | null;
  price: string | null;
  color: string | null;
  size: string | null;
  supplier: SupplierEntity | null;
}

// UserAddressEntity
interface UserAddressEntity {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
}

// ShippingCompanyOrderEntity
interface ShippingCompanyOrderEntity {
  id: number | null;
  type: "domestic" | "international";
  name: string | null;
  office: string | null;
  phone: string | null;
  location: string | null;
  shippingCost: number | null;
  officeShippingCost: number | null;
  logo: string | null;
}

// Supplier Entity
interface SupplierEntity {
  id: number | null;
  name: string | null;
  phone: string | null;
  businessName: string | null;
  code: string | null;
  logo: string | null;
}

// OrderDetailsDataEntity
interface OrderDetailsDataEntity {
  id: number | null;
  status: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  shipping: number | null;
  subtotal: number | null;
  total: number | null;
  totalCountryTax: number | null;
  refoundMoney: number | null;
  discount: number | null;
  currency: string | null;
  waybill_image_url: string | null;
  deliveryTime: string | null;
  createdAt: string | null;
  userAddress: UserAddressEntity | null;
  shippingCompany: ShippingCompanyOrderEntity | null;
  orderItems: OrderDetailsItemEntity[] | null;
}

// OrderDetailsEntity
interface OrderDetailsEntity {
  statusCode: number | null;
  message: string | null;
  order: OrderDetailsDataEntity | null;
}

function exportOrderPDF(order: any) {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF({ orientation: "portrait" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text(`Order #${order.id}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Status: ${order.status}`, 14, 28);
  doc.text(`Total: ${order.total} ${order.currency}`, 14, 34);
  doc.text(`Customer: ${order.userAddress?.name || ""}`, 14, 40);
  doc.text(`Phone: ${order.userAddress?.phone || ""}`, 14, 46);
  doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}`, 14, 52);
  doc.save(`order-${order.id}.pdf`);
}

function printOrder(order: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const items = order.orderItems?.map((item: any) =>
    `<tr><td>${item.name}</td><td>${item.color || ""}</td><td>${item.size || ""}</td><td>${item.quantity}</td><td>${item.price} ${order.currency}</td></tr>`
  ).join("") || "";
  printWindow.document.write(`
    <html dir="rtl"><head><title>طلب #${order.id}</title>
    <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5}</style>
    </head><body>
    <h1>طلب رقم #${order.id}</h1>
    <p>الحالة: ${order.status} | التاريخ: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : ""}</p>
    <p>العميل: ${order.userAddress?.name || ""} | الهاتف: ${order.userAddress?.phone || ""}</p>
    <h3>المنتجات</h3>
    <table><tr><th>المنتج</th><th>اللون</th><th>المقاس</th><th>الكمية</th><th>السعر</th></tr>${items}</table>
    <h3>الإجمالي: ${order.total?.toLocaleString("ar-EG")} ${order.currency}</h3>
    </body></html>`);
  printWindow.document.close();
  printWindow.print();
}

export default function ShippingOrderDetail() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const orderId = params.id;
  const urlParams = new URLSearchParams(window.location.search);
  const navStatus = urlParams.get("status");
  const isReadOnly = true;
  const backTo = urlParams.get("back") || "/shipping-office";
  const products = useProducts();
  const [response, setResponse] = useState<OrderDetailsEntity | null>(null);
  const [editingItem, setEditingItem] = useState<OrderDetailsItemEntity | null>(null);
  const [deletingItem, setDeletingItem] = useState<OrderDetailsItemEntity | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 1, color: "", size: "" });
  const [manifestImage, setManifestImage] = useState<string | null>(null);
  const [editingManifest, setEditingManifest] = useState(false);
  const [deletingManifest, setDeletingManifest] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [manifestFileName, setManifestFileName] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    const rawIdx = Number(orderId?.replace("ORD-", "")) - 1000;
    const idx = rawIdx >= 0 ? rawIdx % products.length : 0;
    if (products.length > 0) {
      const p = products[idx];
      const mockResponse: OrderDetailsEntity = {
        statusCode: 200,
        message: "success",
        order: {
          id: 1000 + idx,
          status: navStatus || ["pending", "processing", "shipped", "delivered", "cancelled"][idx % 5],
          paymentStatus: ["paid", "unpaid", "partial"][idx % 3],
          paymentMethod: ["cash", "credit_card", "bank_transfer", "wallet", "vodafone_cash"][idx % 5],
          currency: "EGP",
          subtotal: p.price * ((idx % 5) + 1),
          totalCountryTax: Math.floor(p.price * ((idx % 5) + 1) * 0.14),
          refoundMoney: idx % 7 === 0 ? Math.floor(p.price * ((idx % 5) + 1) * 0.5) : 0,
          discount: idx % 4 === 0 ? Math.floor(p.price * ((idx % 5) + 1) * 0.1) : 0,
          waybill_image_url: (navStatus || ["pending", "processing", "shipped", "delivered", "cancelled"][idx % 5]) === "delivered" ? "https://placehold.co/800x600/f0fdf4/166534?text=%D8%A8%D9%88%D9%84%D9%8A%D8%B5%D8%A9+%D8%A7%D9%84%D8%B4%D8%AD%D9%86%0A%0A%D8%B1%D9%82%D9%85+%D8%A7%D9%84%D8%B7%D9%84%D8%A8+%23100" + (idx + 1) : "",
          deliveryTime: `${3 + (idx % 5)} أيام عمل`,
          createdAt: new Date(Date.now() - (idx * 24 * 60 * 60 * 1000)).toISOString(),
          userAddress: {
            name: ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود"][idx % 5],
            email: `user${idx + 1}@example.com`,
            phone: `0101234567${idx % 10}`,
            address: `${["شارع النيل", "شارع مصطفى النحاس", "شارع الجيش", "شارع الحرفيين", "شارع المستشفى"][idx % 5]} ${10 + idx}`,
            country: idx % 2 === 0 ? "مصر" : "السعودية",
            city: idx % 2 === 0 ? ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "المنوفية"][idx % 5] : ["الرياض", "جدة", "الدمام"][idx % 3],
            state: idx % 2 === 0 ? ["مدينة نصر", "المعادي", "الدقي", "سيدي جابر", "المنصورة"][idx % 5] : ["حي العليا", "حي الحمراء", "حي الفيصلية"][idx % 3],
            notes: ["التوصيل بعد العصر", "مفيش ملاحظات", "محتاج ألوان تانية", "التوصيل في الصبح بس", "يرجى الاتصال قبل التوصيل"][idx % 5],
          },
          shippingCompany: {
            id: idx % 5 + 1,
            type: idx % 2 === 0 ? "domestic" : "international",
            name: idx % 2 === 0
              ? ["سمسا", "آرامكس", "فيديكس", "جانيت", "speedex"][idx % 5]
              : ["DHL Express", "فيديكس الدولي", "أرامكس الدولي", "TNT", "يونايتد اكسبرس"][idx % 5],
            office: idx % 2 === 0
              ? ["مكتب المعادي", "مكتب الدقي", "مكتب مدينة نصر", "مكتب الإسكندرية", "مكتب المنصورة"][idx % 5]
              : ["مكتب الرياض", "مكتب جدة", "مكتب الدمام"][idx % 3],
            phone: idx % 2 === 0
              ? `02${String(20000000 + (idx * 3) % 90000000)}`
              : `+966${String(500000000 + (idx * 3) % 500000000)}`,
            location: idx % 2 === 0
              ? ["المعادي، القاهرة", "الدقي، الجيزة", "مدينة نصر، القاهرة", "سيدي جابر، الإسكندرية", "المنصورة، الدقهلية"][idx % 5]
              : ["الرياض، السعودية", "جدة، السعودية", "الدمام، السعودية"][idx % 3],
            shippingCost: idx % 2 === 0 ? 50 + (idx * 13) % 200 : 200 + (idx * 17) % 500,
            officeShippingCost: idx % 2 === 0 ? 15 + (idx * 7) % 50 : null,
            logo: idx % 2 === 0
              ? ["https://ui-avatars.com/api/?name=سمسا&background=0369a1&color=fff&bold=true", "https://ui-avatars.com/api/?name=آرامكس&background=16a34a&color=fff&bold=true", "https://ui-avatars.com/api/?name=فيديكس&background=7c3aed&color=fff&bold=true", "https://ui-avatars.com/api/?name=جانيت&background=ea580c&color=fff&bold=true", "https://ui-avatars.com/api/?name=speedex&background=dc2626&color=fff&bold=true"][idx % 5]
              : ["https://ui-avatars.com/api/?name=DHL&background=dc2626&color=fff&bold=true", "https://ui-avatars.com/api/?name=فيديكس&background=7c3aed&color=fff&bold=true", "https://ui-avatars.com/api/?name=أرامكس&background=16a34a&color=fff&bold=true", "https://ui-avatars.com/api/?name=TNT&background=ea580c&color=fff&bold=true", "https://ui-avatars.com/api/?name=يونايتد&background=0369a1&color=fff&bold=true"][idx % 5],
          },
          shipping: idx % 3 === 0 ? 200 + (idx * 17) % 500 : 50 + (idx * 13) % 200,
          total: p.price * ((idx % 5) + 1) + (idx % 3 === 0 ? 200 + (idx * 17) % 500 : 50 + (idx * 13) % 200),
          orderItems: [
            {
              id: idx + 1,
              productId: idx + 100,
              name: p.name,
              image: p.mainImage || "",
              quantity: (idx % 5) + 1,
              price: String(p.price),
              color: ["أسود", "أبيض", "أزرق", "أحمر", "أخضر"][idx % 5],
              size: ["S", "M", "L", "XL", "XXL"][idx % 5],
              supplier: {
                id: idx + 1,
                name: ["مصنع النيل", "شركة الرياض", "مؤسسة الإبداع", "مصنع مصر", "شركة الخليج"][idx % 5],
                phone: `011${String(10000000 + (idx * 7) % 90000000)}`,
                businessName: ["ملابس وإكسسوارات", "إلكترونيات", "أثاث منزلي", "موضة وملابس", "أجهزة منزلية"][idx % 5],
                code: `SUP-${2000 + idx}`,
                logo: ["https://ui-avatars.com/api/?name=مصنع+النيل&background=1e40af&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الرياض&background=059669&color=fff&bold=true", "https://ui-avatars.com/api/?name=مؤسسة+الإبداع&background=9333ea&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+مصر&background=dc2626&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الخليج&background=ea580c&color=fff&bold=true"][idx % 5],
              },
            },
            {
              id: idx + 2,
              productId: idx + 200,
              name: products[(idx + 1) % products.length]?.name || "تيشيرت بولو",
              image: products[(idx + 1) % products.length]?.mainImage || "",
              quantity: ((idx + 1) % 3) + 1,
              price: String(products[(idx + 1) % products.length]?.price || 299),
              color: ["أبيض", "أزرق", "أحمر", "أسود", "رمادي"][idx % 5],
              size: ["M", "L", "XL", "S", "XXL"][idx % 5],
              supplier: {
                id: idx + 2,
                name: ["شركة الخليج", "مصنع النيل", "شركة الرياض", "مؤسسة الإبداع", "مصنع مصر"][idx % 5],
                phone: `012${String(10000000 + (idx * 11) % 90000000)}`,
                businessName: ["أجهزة منزلية", "ملابس وإكسسوارات", "إلكترونيات", "أثاث منزلي", "موضة وملابس"][idx % 5],
                code: `SUP-${2100 + idx}`,
                logo: ["https://ui-avatars.com/api/?name=شركة+الخليج&background=ea580c&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+النيل&background=1e40af&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الرياض&background=059669&color=fff&bold=true", "https://ui-avatars.com/api/?name=مؤسسة+الإبداع&background=9333ea&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+مصر&background=dc2626&color=fff&bold=true"][idx % 5],
              },
            },
            {
              id: idx + 3,
              productId: idx + 300,
              name: products[(idx + 2) % products.length]?.name || "بنطلون جينز",
              image: products[(idx + 2) % products.length]?.mainImage || "",
              quantity: ((idx + 2) % 4) + 1,
              price: String(products[(idx + 2) % products.length]?.price || 450),
              color: ["أزرق", "أسود", "رمادي", "أبيض", "أحمر"][idx % 5],
              size: ["L", "XL", "M", "XXL", "S"][idx % 5],
              supplier: {
                id: idx + 3,
                name: ["مؤسسة الإبداع", "مصنع مصر", "شركة الخليج", "مصنع النيل", "شركة الرياض"][idx % 5],
                phone: `015${String(10000000 + (idx * 13) % 90000000)}`,
                businessName: ["موضة وملابس", "أجهزة منزلية", "ملابس وإكسسوارات", "إلكترونيات", "أثاث منزلي"][idx % 5],
                code: `SUP-${2200 + idx}`,
                logo: ["https://ui-avatars.com/api/?name=مؤسسة+الإبداع&background=9333ea&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+مصر&background=dc2626&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الخليج&background=ea580c&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+النيل&background=1e40af&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الرياض&background=059669&color=fff&bold=true"][idx % 5],
              },
            },
            {
              id: idx + 4,
              productId: idx + 400,
              name: products[(idx + 3) % products.length]?.name || "جاكيت شتوي",
              image: products[(idx + 3) % products.length]?.mainImage || "",
              quantity: ((idx + 3) % 3) + 1,
              price: String(products[(idx + 3) % products.length]?.price || 750),
              color: ["أسود", "أحمر", "أزرق", "أخضر", "أبيض"][idx % 5],
              size: ["XL", "L", "XXL", "S", "M"][idx % 5],
              supplier: {
                id: idx + 4,
                name: ["مصنع مصر", "مؤسسة الإبداع", "مصنع النيل", "شركة الخليج", "شركة الرياض"][idx % 5],
                phone: `010${String(10000000 + (idx * 17) % 90000000)}`,
                businessName: ["إلكترونيات", "موضة وملابس", "ملابس وإكسسوارات", "أثاث منزلي", "أجهزة منزلية"][idx % 5],
                code: `SUP-${2300 + idx}`,
                logo: ["https://ui-avatars.com/api/?name=مصنع+مصر&background=dc2626&color=fff&bold=true", "https://ui-avatars.com/api/?name=مؤسسة+الإبداع&background=9333ea&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+النيل&background=1e40af&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الخليج&background=ea580c&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الرياض&background=059669&color=fff&bold=true"][idx % 5],
              },
            },
            {
              id: idx + 5,
              productId: idx + 500,
              name: products[(idx + 4) % products.length]?.name || "حذاء رياضي",
              image: products[(idx + 4) % products.length]?.mainImage || "",
              quantity: 1,
              price: String(products[(idx + 4) % products.length]?.price || 599),
              color: ["أبيض", "أسود", "أزرق", "رمادي", "أحمر"][idx % 5],
              size: ["42", "43", "44", "41", "40"][idx % 5],
              supplier: {
                id: idx + 5,
                name: ["شركة الرياض", "مصنع النيل", "مصنع مصر", "مؤسسة الإبداع", "شركة الخليج"][idx % 5],
                phone: `011${String(10000000 + (idx * 19) % 90000000)}`,
                businessName: ["أثاث منزلي", "إلكترونيات", "موضة وملابس", "ملابس وإكسسوارات", "أجهزة منزلية"][idx % 5],
                code: `SUP-${2400 + idx}`,
                logo: ["https://ui-avatars.com/api/?name=شركة+الرياض&background=059669&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+النيل&background=1e40af&color=fff&bold=true", "https://ui-avatars.com/api/?name=مصنع+مصر&background=dc2626&color=fff&bold=true", "https://ui-avatars.com/api/?name=مؤسسة+الإبداع&background=9333ea&color=fff&bold=true", "https://ui-avatars.com/api/?name=شركة+الخليج&background=ea580c&color=fff&bold=true"][idx % 5],
              },
            },
          ],
        },
      };
      setResponse(mockResponse);
      if (mockResponse.order?.waybill_image_url) {
        setManifestImage(mockResponse.order.waybill_image_url);
        setManifestFileName(`waybill-${mockResponse.order.id}.png`);
      }
    }
  }, [orderId, products]);

  if (!response?.order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  const order = response.order;
  const status = statusConfig[order.status || "pending"] || statusConfig.pending;
  const payStatus = paymentStatusConfig[order.paymentStatus || "paid"] || paymentStatusConfig.paid;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b backdrop-blur-sm bg-background/95">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation(backTo)} className="h-9 w-9">
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">طلب رقم <span className="text-primary">#{order.id}</span></h1>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigator.clipboard.writeText(String(order.id))}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Badge className={`${status.bg} ${status.color} border`}>
                <StatusIcon className="h-3 w-3 ml-1" />
                {status.label}
              </Badge>
              {!isReadOnly && (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => {
                  setSelectedStatus(order.status || "pending");
                  setUpdatingStatus(true);
                }}>
                  <ArrowUpDown className="h-3 w-3" />
                  تغيير الحالة
                </Button>
              )}
            </div>
          </div>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="h-3.5 w-3.5 ml-1.5" />
                  تصدير / طباعة
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem className="cursor-pointer" onClick={() => printOrder(order)}>
                  <Printer className="h-3.5 w-3.5 ml-1.5" />
                  طباعة الطلب
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => exportOrderPDF(order)}>
                  <Download className="h-3.5 w-3.5 ml-1.5" />
                  تصدير PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <div className="py-3 px-4 space-y-3">
        {/* Shipping Manifest */}
        {(order.status === "shipped" || order.status === "delivered") && (
            <Card className="overflow-hidden">
              <CardHeader className={`pb-3 ${order.status === "delivered" ? "bg-gradient-to-l from-emerald-500 to-emerald-600" : "bg-gradient-to-l from-purple-500 to-purple-600"} text-white`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {order.status === "delivered" ? <CheckCircle2 className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    بوليصة الشحن
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {!isReadOnly && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={() => setEditingManifest(true)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                    {manifestImage && (
                      <>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={() => setFullscreenImage(true)}>
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={() => {
                          const a = document.createElement("a");
                          a.href = manifestImage;
                          a.download = manifestFileName || `manifest-${order.id}.png`;
                          a.click();
                        }}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={async () => {
                          if (navigator.share) {
                            try {
                              const r = await fetch(manifestImage);
                              const blob = await r.blob();
                              const file = new File([blob], manifestFileName || `manifest-${order.id}.png`, { type: "image/png" });
                              await navigator.share({ files: [file], title: `بوليصة الشحن - طلب #${order.id}` });
                            } catch {}
                          }
                        }}>
                          <Share2 className="h-3 w-3" />
                        </Button>
                        {!isReadOnly && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20" onClick={() => setDeletingManifest(true)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {manifestImage ? (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border cursor-pointer" onClick={() => setFullscreenImage(true)}>
                      <img src={manifestImage} alt="بوليصة الشحن" className="w-full max-h-64 object-contain bg-muted" />
                    </div>
                    {manifestFileName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileImage className="h-3 w-3" />
                        <span>{manifestFileName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {!isReadOnly && (
                        <Button size="sm" className="gap-1.5 flex-1 bg-green-600 hover:bg-green-700" onClick={async () => {
                          if (navigator.share) {
                            try {
                              const r = await fetch(manifestImage);
                              const blob = await r.blob();
                              const file = new File([blob], manifestFileName || `waybill-${order.id}.png`, { type: "image/png" });
                              await navigator.share({ files: [file], title: `بوليصة الشحن - طلب #${order.id}` });
                            } catch {}
                          } else {
                            const a = document.createElement("a");
                            a.href = manifestImage;
                            a.download = manifestFileName || `waybill-${order.id}.png`;
                            a.click();
                          }
                        }}>
                          <Send className="h-3.5 w-3.5" />
                          إرسال بوليصة الشحن للعميل
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">تاريخ الإنشاء</p>
                        <p className="text-xs font-semibold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : ""}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">أرسلها</p>
                        <p className="text-xs font-semibold">المدير</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground">وقت الإرسال</p>
                        <p className="text-xs font-semibold">{new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                      <Image className="h-7 w-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">لم تُرفع بوليصة شحن بعد</p>
                    <p className="text-xs text-muted-foreground/70 mb-3">ارفع صورة بوليصة الشحن لإتمام الشحن</p>
                    {!isReadOnly && (
                      <Button size="sm" className="gap-1.5" onClick={() => setEditingManifest(true)}>
                        <Image className="h-3.5 w-3.5" />
                        رفع بوليصة الشحن
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-white rounded-xl border p-2 text-center">
            <p className="text-xl font-bold text-foreground">{order.orderItems?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">عدد المنتجات</p>
          </div>
          <div className="bg-white rounded-xl border p-2 text-center">
            <p className="text-xl font-bold text-blue-600">{new Set(order.orderItems?.map(i => i.supplier?.id).filter(Boolean)).size || 0}</p>
            <p className="text-[10px] text-muted-foreground">عدد الموردين</p>
          </div>
          <div className="bg-white rounded-xl border p-2 text-center">
            <p className="text-xl font-bold text-foreground">{order.total?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></p>
            <p className="text-[10px] text-muted-foreground">السعر الكلي</p>
          </div>
          <div className="bg-white rounded-xl border p-2 text-center">
            <p className="text-xl font-bold text-amber-600">{order.paymentStatus === "paid" ? order.total?.toLocaleString("ar-EG") : order.paymentStatus === "partial" ? Math.floor((order.total || 0) / 2).toLocaleString("ar-EG") : "0"} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></p>
            <p className="text-[10px] text-muted-foreground">العربون المدفوع</p>
          </div>
          <div className="bg-white rounded-xl border p-2 text-center">
            <p className="text-xl font-bold text-blue-600">{order.shippingCompany?.shippingCost?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></p>
            <p className="text-[10px] text-muted-foreground">الشحن</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-3">
            {/* Products - Full Width */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                المنتجات ({order.orderItems?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="grid grid-cols-2 gap-3">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="border rounded-xl overflow-hidden bg-card shadow-sm">
                  {/* Product Details - Top */}
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm">{item.name}</p>
                            {!isReadOnly && (
                              <>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600" onClick={() => {
                                  setEditingItem(item);
                                  setEditForm({ quantity: item.quantity || 1, color: item.color || "", size: item.size || "" });
                                }}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-600" onClick={() => setDeletingItem(item)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">كود:</span>
                            <span className="text-[10px] font-mono bg-muted px-1 py-0.5 rounded">#{item.productId}</span>
                            <Button variant="ghost" size="sm" className="h-3.5 w-3.5 p-0" onClick={() => navigator.clipboard.writeText(String(item.productId))}>
                              <Copy className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-extrabold text-lg text-primary">{Number(item.price)?.toLocaleString("ar-EG")}</p>
                          <p className="text-[10px] text-muted-foreground">{order.currency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full border-2 bg-gray-800" />
                          <span className="text-xs">{item.color}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{item.size}</Badge>
                        <div className="flex items-center gap-0.5">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold">{item.quantity} قطعة</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Info - Bottom */}
                  {item.supplier && (
                    <div className="border-t bg-gradient-to-r from-blue-50/80 to-blue-50/40 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border">
                            {item.supplier.logo ? (
                              <img src={item.supplier.logo} alt={item.supplier.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                                <span className="text-sm font-bold">{item.supplier.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-xs text-blue-900">{item.supplier.name}</p>
                              <span className="text-[10px] text-blue-500">({item.supplier.businessName})</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-blue-400" />
                                <span className="text-[11px] font-mono text-blue-700" dir="ltr">+20 {item.supplier.phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-blue-400">كود:</span>
                                <span className="text-[11px] font-mono font-bold text-blue-700">{item.supplier.code}</span>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => navigator.clipboard.writeText(item.supplier?.code || "")}>
                                  <Copy className="h-3 w-3 text-blue-400" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                            <MessageCircle className="h-3 w-3 text-green-500" />
                            شات
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                            <Phone className="h-3 w-3 text-blue-500" />
                            اتصال
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                            <MessageSquare className="h-3 w-3 text-green-500" />
                            واتساب
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping - Below Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-blue-500 to-blue-600 text-white pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold text-blue-600">{order.userAddress?.name?.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{order.userAddress?.name}</p>
                    <p className="text-xs text-muted-foreground">عميل</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span dir="ltr" className="font-mono">+20 {order.userAddress?.phone}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => navigator.clipboard.writeText(order.userAddress?.phone || "")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground text-xs">كود العميل:</span>
                      <span className="font-mono font-medium text-xs">CUST-{order.id}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => navigator.clipboard.writeText(`CUST-${order.id}`)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1 h-8 gap-1 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                    <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                    شات
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 gap-1 text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                    اتصال
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 gap-1 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                    <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                    واتساب
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-emerald-500 to-emerald-600 text-white pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  العنوان
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4 space-y-3">
                {order.shippingCompany?.type === "domestic" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">{order.userAddress?.country}</Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{order.userAddress?.city}</Badge>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">المنطقة:</p>
                      <p className="text-sm font-medium">{order.userAddress?.state}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">العنوان التفصيلي:</p>
                      <p className="text-sm">{order.userAddress?.address}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">ملاحظات العميل:</p>
                      <p className="text-sm">{order.userAddress?.notes || "بدون ملاحظات"}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">العنوان التفصيلي:</p>
                      <p className="text-sm">{order.userAddress?.address}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">ملاحظات العميل:</p>
                      <p className="text-sm">{order.userAddress?.notes || "بدون ملاحظات"}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Shipping Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-l from-amber-500 to-amber-600 text-white pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  الشحن
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4 space-y-3">
                {/* Company Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border">
                    {order.shippingCompany?.logo ? (
                      <img src={order.shippingCompany.logo} alt={order.shippingCompany.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                        <Truck className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{order.shippingCompany?.name}</p>
                    <Badge variant="outline" className={`text-[10px] mt-0.5 ${order.shippingCompany?.type === "domestic" ? "bg-green-50 text-green-700 border-green-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                      {order.shippingCompany?.type === "domestic" ? "شركة شحن" : "مكتب شحن"}
                    </Badge>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  {order.shippingCompany?.type === "domestic" ? (
                    <>
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-0.5">فرع شركة الشحن:</p>
                        <p className="text-sm font-medium">{order.shippingCompany?.office}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-0.5">مكان الفرع:</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{order.shippingCompany?.location}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-0.5">مكتب الشحن:</p>
                        <p className="text-sm font-medium">{order.shippingCompany?.office}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground mb-0.5">مكان المكتب:</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{order.shippingCompany?.location}</span>
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">{order.shippingCompany?.type === "domestic" ? "هاتف الشركة:" : "هاتف المكتب:"}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono" dir="ltr">{order.shippingCompany?.phone}</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => navigator.clipboard.writeText(order.shippingCompany?.phone || "")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                      <Phone className="h-3 w-3 text-blue-500" />
                      اتصال
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px] flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                      <MessageSquare className="h-3 w-3 text-green-500" />
                      واتساب
                    </Button>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground mb-0.5">مدة التوصيل:</p>
                    <p className="text-sm">{order.deliveryTime}</p>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تكلفة الشحن:</span>
                    <span className="font-bold text-sm text-blue-600">{order.shippingCompany?.shippingCost?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></span>
                  </div>
                  {order.shippingCompany?.officeShippingCost != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">الشحن الداخلي:</span>
                      <span className="font-bold text-sm text-emerald-600">{order.shippingCompany?.officeShippingCost?.toLocaleString("ar-EG")} <span className="text-xs font-normal text-muted-foreground">{order.currency}</span></span>
                    </div>
                  )}
                </div>
                {!isReadOnly && (
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => setLocation("/shipping-office/add")}>
                    <Building2 className="h-3.5 w-3.5" />
                    إضافة مكتب شحن
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-l from-violet-500 to-violet-600 text-white pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">طريقة الدفع:</span>
                    <Badge variant="outline" className="text-[11px]">{paymentMethodLabels[order.paymentMethod || "cash"] || order.paymentMethod}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">حالة الدفع:</span>
                    <Badge className={`${payStatus.bg} ${payStatus.color} text-[11px]`}>{payStatus.label}</Badge>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">المبلغ المدفوع:</span>
                      <span className="font-bold text-sm text-green-600">
                        {order.paymentStatus === "paid" ? order.total?.toLocaleString("ar-EG") :
                         order.paymentStatus === "partial" ? Math.floor((order.total || 0) / 2).toLocaleString("ar-EG") : "0"} {order.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">العربون:</span>
                      <span className="font-bold text-sm text-amber-600">
                        {order.paymentStatus === "partial" ? Math.floor((order.total || 0) / 2).toLocaleString("ar-EG") : "0"} {order.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">المتبقي:</span>
                      <span className="font-bold text-sm text-red-600">
                        {order.paymentStatus === "paid" ? "0" :
                         order.paymentStatus === "partial" ? Math.floor((order.total || 0) / 2).toLocaleString("ar-EG") : order.total?.toLocaleString("ar-EG")} {order.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">تاريخ ووقت الدفع:</span>
                      <span className="text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-EG") : ""} - {order.createdAt ? new Date(order.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-l from-cyan-500 to-cyan-600 text-white pb-3">
                  <CardTitle className="text-sm">تتبع الطلب</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-4">
                  {(() => {
                    const steps = [
                      { key: "pending", label: "جديدة", time: "09:00 ص" },
                      { key: "processing", label: "جاري التجهيز", time: "11:30 ص" },
                      { key: "shipped", label: "تم الشحن", time: "02:00 م" },
                      { key: "delivered", label: "تم التوصيل", time: "04:30 م" },
                    ];
                    const statusOrder = ["pending", "processing", "shipped", "delivered"];
                    const currentIdx = statusOrder.indexOf(order.status || "pending");
                    const isCancelled = order.status === "cancelled";

                    return (
                      <div className="flex items-start">
                        {steps.map((step, i) => {
                          const isCompleted = isCancelled ? false : currentIdx >= i;
                          const isCurrent = step.key === order.status;

                          return (
                            <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                              <div className="flex items-center w-full">
                                {/* Line before */}
                                <div className={`flex-1 h-[3px] rounded-full ${i === 0 ? "bg-transparent" : isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
                                {/* Circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                                  isCancelled ? "border-gray-300 bg-gray-100" :
                                  isCompleted ? "border-green-500 bg-green-500" :
                                  isCurrent ? "border-blue-500 bg-blue-500" :
                                  "border-gray-300 bg-gray-100"
                                }`}>
                                  {isCancelled ? (
                                    <span className="text-[10px] text-gray-400">✕</span>
                                  ) : isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-400">{i + 1}</span>
                                  )}
                                </div>
                                {/* Line after */}
                                <div className={`flex-1 h-[3px] rounded-full ${i === 3 ? "bg-transparent" : isCompleted && !isCancelled ? "bg-green-500" : "bg-gray-200"}`} />
                              </div>
                              <p className={`text-[10px] font-medium mt-1.5 text-center ${isCompleted && !isCancelled ? "text-green-600 font-semibold" : isCurrent ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              {isCompleted && !isCancelled && (
                                <p className="text-[9px] text-muted-foreground mt-0.5">{step.time}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {order.status === "cancelled" && (
                    <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-red-200 bg-red-50 rounded-lg p-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <p className="text-xs font-semibold text-red-600">تم الإلغاء</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      {/* Status Change Dialog */}
      <Dialog open={updatingStatus} onOpenChange={() => setUpdatingStatus(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تغيير حالة الطلب #{order.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(order.status === "pending" || order.status === "processing") && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => {
                if (response?.order) {
                  const nextStatus = order.status === "pending" ? "processing" : "shipped";
                  setResponse({
                    ...response,
                    order: { ...response.order!, status: nextStatus }
                  });
                }
                setUpdatingStatus(false);
              }}>
                {order.status === "pending" ? (
                  <><Package className="h-4 w-4 text-blue-500" /> تجهيز الطلب</>
                ) : (
                  <><Truck className="h-4 w-4 text-purple-500" /> شحن الطلب</>
                )}
              </Button>
            )}
            {order.status === "shipped" && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => {
                setUpdatingStatus(false);
                setEditingManifest(true);
              }}>
                <Image className="h-4 w-4 text-emerald-500" />
                رفع بوليصة الشحن وإتمام الطلب
              </Button>
            )}
            {(order.status === "pending") && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-red-600 hover:text-red-600" onClick={() => {
                if (response?.order) {
                  setResponse({
                    ...response,
                    order: { ...response.order!, status: "cancelled" }
                  });
                }
                setUpdatingStatus(false);
              }}>
                <XCircle className="h-4 w-4" />
                إلغاء الطلب
              </Button>
            )}
            {order.status === "delivered" && (
              <p className="text-sm text-muted-foreground text-center py-4">الطلب مكتمل ولا يمكن تغيير حالته</p>
            )}
            {order.status === "cancelled" && (
              <p className="text-sm text-muted-foreground text-center py-4">الطلب ملغي ولا يمكن تغيير حالته</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUpdatingStatus(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اللون</label>
              <Select value={editForm.color} onValueChange={(v) => setEditForm({ ...editForm, color: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  {["أسود", "أبيض", "أزرق", "أحمر", "أخضر", "رمادي"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المقاس</label>
              <Select value={editForm.size} onValueChange={(v) => setEditForm({ ...editForm, size: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="اختر المقاس" />
                </SelectTrigger>
                <SelectContent>
                  {["S", "M", "L", "XL", "XXL", "40", "41", "42", "43", "44"].map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الكمية</label>
              <Input
                type="number"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>إلغاء</Button>
            <Button
              size="sm"
              onClick={() => {
                if (response?.order?.orderItems && editingItem) {
                  const updatedItems = response.order.orderItems.map(item =>
                    item.id === editingItem.id
                      ? { ...item, quantity: editForm.quantity, color: editForm.color, size: editForm.size }
                      : item
                  );
                  setResponse({ ...response, order: { ...response.order!, orderItems: updatedItems } });
                }
                setEditingItem(null);
              }}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Product Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف المنتج</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف المنتج <span className="font-semibold">{deletingItem?.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingItem(null)}>إلغاء</Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (response?.order?.orderItems && deletingItem) {
                  const updatedItems = response.order.orderItems.filter(item => item.id !== deletingItem.id);
                  setResponse({ ...response, order: { ...response.order!, orderItems: updatedItems } });
                }
                setDeletingItem(null);
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Manifest Dialog */}
      <Dialog open={editingManifest} onOpenChange={() => setEditingManifest(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{manifestImage ? "تعديل بوليصة الشحن" : "رفع بوليصة الشحن"}</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {manifestImage ? (
              <div className="space-y-2">
                <img src={manifestImage} alt="بوليصة الشحن" className="max-h-40 mx-auto rounded" />
                <label className="cursor-pointer text-xs text-primary underline">
                  تغيير الصورة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setManifestFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = () => setManifestImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setManifestFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = () => setManifestImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
                <div className="space-y-1">
                  <Image className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">اضغط لرفع صورة البوليصة</p>
                </div>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingManifest(false)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              if (order.status === "shipped" && manifestImage && response?.order) {
                setResponse({
                  ...response,
                  order: { ...response.order!, status: "delivered", waybill_image_url: manifestImage }
                });
              }
              setEditingManifest(false);
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Manifest Confirmation Dialog */}
      <Dialog open={deletingManifest} onOpenChange={() => setDeletingManifest(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف بوليصة الشحن</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              هل أنت متأكد من حذف بوليصة الشحن للطلب <span className="font-semibold">#{order.id}</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingManifest(false)}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              setManifestImage(null);
              setManifestFileName("");
              setDeletingManifest(false);
            }}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Dialog */}
      <Dialog open={fullscreenImage} onOpenChange={() => setFullscreenImage(false)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader>
            <DialogTitle>بوليصة الشحن - طلب #{order.id}</DialogTitle>
          </DialogHeader>
          {manifestImage && (
            <img src={manifestImage} alt="بوليصة الشحن" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
      </div>
  );
}
