import { useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useProducts } from "@/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  ArrowRight, Building2, MapPin, Phone, MapPinned, ExternalLink,
  Pencil, Package, Clock, CheckCircle2, XCircle, Truck, Search,
  ShoppingCart, DollarSign, Filter, X, Eye, Download, Printer, MessageCircle,
} from "lucide-react";

interface Branch {
  name: string;
  phone: string;
}

interface ShippingOfficeData {
  id: string;
  officeName: string;
  location: string;
  address: string;
  managerName: string;
  managerPhone: string;
  internalShipping: number;
  branches: Branch[];
  logo: string | null;
  notes: string;
  status: "active" | "inactive";
}

const mockOffices: ShippingOfficeData[] = [
  {
    id: "OFF-001", officeName: "مكتب المعادي",
    location: "https://maps.google.com/?q=29.9582,31.2523",
    address: "شارع النيل، المعادي، القاهرة",
    managerName: "أحمد محمد", managerPhone: "01012345671",
    internalShipping: 25,
    branches: [{ name: "فرع المعادي", phone: "01012345672" }, { name: "فرع حلوان", phone: "01012345673" }],
    logo: "https://picsum.photos/seed/office-mokattam/200/200",
    notes: "مكتب رئيسي - يخدم منطقة جنوب القاهرة", status: "active",
  },
  {
    id: "OFF-002", officeName: "مكتب الدقي",
    location: "https://maps.google.com/?q=30.0468,31.2098",
    address: "شارع مصطفى النحاس، الدقي، الجيزة",
    managerName: "خالد محمود", managerPhone: "01012345674",
    internalShipping: 15,
    branches: [{ name: "فرع الدقي", phone: "01012345675" }],
    logo: "https://picsum.photos/seed/office-doqqi/200/200",
    notes: "", status: "active",
  },
  {
    id: "OFF-003", officeName: "مكتب مدينة نصر",
    location: "",
    address: "شارع عبد اللطيف بغدادي، مدينة نصر، القاهرة",
    managerName: "سارة أحمد", managerPhone: "01012345676",
    internalShipping: 20,
    branches: [{ name: "فرع مدينة نصر", phone: "01012345677" }, { name: "فرع مصر الجديدة", phone: "01012345678" }, { name: "فرع العباسية", phone: "01012345679" }],
    logo: "https://picsum.photos/seed/office-nasr/200/200",
    notes: "يوجد خدمة توصيل للمناطق القريبة", status: "active",
  },
  {
    id: "OFF-004", officeName: "مكتب الإسكندرية",
    location: "https://maps.google.com/?q=31.2001,29.9187",
    address: "شارع سيدي جابر، الإسكندرية",
    managerName: "محمد حسن", managerPhone: "01012345680",
    internalShipping: 30,
    branches: [{ name: "فرع سيدي جابر", phone: "01012345681" }],
    logo: "https://picsum.photos/seed/office-alex/200/200",
    notes: "يغلق يوم الجمعة", status: "inactive",
  },
  {
    id: "OFF-005", officeName: "مكتب المنصورة",
    location: "",
    address: "شارع الجيش، المنصورة، الدقهلية",
    managerName: "فاطمة علي", managerPhone: "01012345682",
    internalShipping: 10,
    branches: [{ name: "فرع المنصورة", phone: "01012345683" }, { name: "فرع طلخا", phone: "01012345684" }],
    logo: "https://picsum.photos/seed/office-mansoura/200/200",
    notes: "", status: "active",
  },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-EG");
}

function exportOrdersPDF(orders: any[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("تقرير الطلبات", 14, 20);
  doc.setFontSize(10);
  doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي: ${orders.length} طلب`, 14, 28);

  autoTable(doc, {
    startY: 36,
    head: [["رقم الطلب", "العميل", "الهاتف", "الكمية", "الإجمالي", "العمولة", "الدفع", "الحالة", "التاريخ"]],
    body: orders.map(o => [
      o.id, o.customer, o.customerPhone, String(o.quantity), `${o.total} ج.م`, `${o.commission} ج.م`, o.paymentMethod, o.status, formatDate(o.date),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save("shipping-office-orders.pdf");
}

function exportOrdersExcel(orders: any[]) {
  const data = orders.map(o => ({
    "رقم الطلب": o.id,
    "اسم العميل": o.customer,
    "الهاتف": o.customerPhone,
    "الكمية": o.quantity,
    "الإجمالي": o.total,
    "العمولة": o.commission,
    "المورد": o.supplier,
    "طريقة الدفع": o.paymentMethod,
    "حالة الدفع": o.paymentStatus,
    "الشحن": o.shippingCompany,
    "المكتب": o.shippingOffice,
    "الدولة": o.country,
    "المحافظة": o.governorate,
    "المنطقة": o.area,
    "الحالة": o.status,
    "التاريخ": formatDate(o.date),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "shipping-office-orders.xlsx");
}

export default function ShippingOfficeDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const products = useProducts();

  const office = mockOffices.find(o => o.id === id);

  // Filter states (matching orders.tsx)
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [governorate, setGovernorate] = useState("all");
  const [area, setArea] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paymentMethods = ["كاش", "بطاقة ائتمان", "تحويل بنفي", "محفظة إلكترونية", "فودافون كاش"];
  const paymentStatuses = ["مدفوع", "غير مدفوع", "مدفوع جزئياً"];
  const statusLabels: Record<string, string> = {
    pending: "جديدة", processing: "مجهزة", shipped: "مشحونة", delivered: "مكتملة", cancelled: "ملغية",
  };
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border border-purple-200",
    delivered: "bg-green-50 text-green-700 border border-green-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
  };

  // Orders data (enriched with same fields as orders.tsx)
  const orders = useMemo(() => {
    if (!office) return [];
    const customerNames = ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود", "نورا سعيد", "عمر حسين", "ريم عبد الله", "ياسر إبراهيم", "هدى عادل"];
    const egyptCities = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "المنوفية"];
    const egyptAreas: Record<string, string[]> = {
      "القاهرة": ["مدينة نصر", "المعادي", "الزمالك", "وسط البلد"],
      "الجيزة": ["الدقي", "المهندسين", "الهرم", "أكتوبر"],
      "الإسكندرية": ["سيدي جابر", "المحرم بك", "المندرة"],
      "الدقهلية": ["المنصورة", "طلخا", "ميت غمر"],
      "المنوفية": ["شبين الكوم", "السادات", "منوف"],
    };
    const statuses = ["shipped", "delivered"];

    return Array.from({ length: 18 }, (_, i) => {
      const city = egyptCities[i % egyptCities.length];
      const cityAreas = egyptAreas[city] || [];
      const areaName = cityAreas[i % cityAreas.length] || city;
      return {
        id: `ORD-${2000 + i}`,
        customer: customerNames[i % customerNames.length],
        customerId: `USR-${4000 + i}`,
        customerCode: `CODE-${1000 + i}`,
        customerPhone: `010${String(10000000 + i * 1111111).slice(0, 8)}`,
        product: i < products.length ? products[i].name : ["منتج أ", "منتج ب", "منتج ج", "منتج د", "منتج هـ"][i % 5],
        supplier: i < products.length ? products[i].supplier.name : `مورد ${i + 1}`,
        supplierCode: `SUP-${2000 + i}`,
        supplierPhone: `011${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
        quantity: Math.floor(Math.random() * 5) + 1,
        total: Math.floor(Math.random() * 2000) + 200,
        commission: Math.floor(Math.random() * 500) + 50,
        status: statuses[i % statuses.length],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ${Math.random() > 0.5 ? "ص" : "م"}`,
        deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        shippingCompany: ["سمسا", "آرامكس", "فيديكس", "جانيت", "speedex"][i % 5],
        shippingOffice: office.officeName,
        country: "مصر",
        governorate: city,
        area: areaName,
      };
    });
  }, [office, products]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = !orderSearch || o.id.includes(orderSearch) || o.customer.includes(orderSearch) || o.product.includes(orderSearch) || o.customerPhone.includes(orderSearch);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesSupplier = !supplierFilter || o.supplier.includes(supplierFilter);
      const matchesDate = !dateFilter || new Date(o.date).toISOString().slice(0, 10) === dateFilter;
      const matchesPaymentMethod = paymentMethod === "all" || o.paymentMethod === paymentMethod;
      const matchesPaymentStatus = paymentStatus === "all" || o.paymentStatus === paymentStatus;
      const matchesCountry = country === "all" || o.country === country;
      const matchesGovernorate = governorate === "all" || o.governorate === governorate;
      const matchesArea = area === "all" || o.area === area;
      return matchesSearch && matchesStatus && matchesSupplier && matchesDate && matchesPaymentMethod && matchesPaymentStatus && matchesCountry && matchesGovernorate && matchesArea;
    }).sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest_total": return b.total - a.total;
        case "lowest_total": return a.total - b.total;
        case "customer_az": return a.customer.localeCompare(b.customer, "ar");
        case "customer_za": return b.customer.localeCompare(a.customer, "ar");
        case "order_status": return a.status.localeCompare(b.status, "ar");
        case "payment_status": return a.paymentStatus.localeCompare(b.paymentStatus, "ar");
        default: return 0;
      }
    });
  }, [orders, orderSearch, statusFilter, supplierFilter, dateFilter, paymentMethod, paymentStatus, country, governorate, area, sortBy]);

  const orderStats = useMemo(() => ({
    total: filteredOrders.length,
    shipped: filteredOrders.filter(o => o.status === "shipped").length,
    delivered: filteredOrders.filter(o => o.status === "delivered").length,
    totalQuantity: filteredOrders.reduce((s, o) => s + o.quantity, 0),
    totalRevenue: filteredOrders.reduce((s, o) => s + o.total, 0),
    totalCommission: filteredOrders.reduce((s, o) => s + o.commission, 0),
  }), [filteredOrders]);

  const activeFilters = [orderSearch, statusFilter !== "all" ? statusFilter : "", supplierFilter, dateFilter, paymentMethod !== "all" ? paymentMethod : "", paymentStatus !== "all" ? paymentStatus : "", country !== "all" ? country : "", governorate !== "all" ? governorate : "", area !== "all" ? area : ""].filter(Boolean).length;

  const clearFilters = () => {
    setOrderSearch("");
    setStatusFilter("all");
    setSupplierFilter("");
    setDateFilter("");
    setPaymentMethod("all");
    setPaymentStatus("all");
    setCountry("all");
    setGovernorate("all");
    setArea("all");
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => (
    <Badge className={`${statusStyles[status]} text-[11px]`}>{statusLabels[status]}</Badge>
  );

  const getPaymentStatusBadge = (s: string) => {
    const styles: Record<string, string> = {
      "مدفوع": "bg-green-100 text-green-800",
      "غير مدفوع": "bg-red-100 text-red-800",
      "مدفوع جزئياً": "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={styles[s] || "bg-gray-100 text-gray-800"}>{s}</Badge>;
  };

  const getPaymentMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      "كاش": "bg-green-100 text-green-800",
      "بطاقة ائتمان": "bg-blue-100 text-blue-800",
      "تحويل بنفي": "bg-purple-100 text-purple-800",
      "محفظة إلكترونية": "bg-orange-100 text-orange-800",
      "فودافون كاش": "bg-red-100 text-red-800",
    };
    return <Badge className={styles[method] || "bg-gray-100 text-gray-800"}>{method}</Badge>;
  };

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">لم يتم العثور على المكتب</p>
        <Button variant="outline" onClick={() => setLocation("/shipping-office")}>
          <ArrowRight className="h-4 w-4 ml-2" /> العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/shipping-office")} className="h-9 w-9 shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
            {office.logo ? (
              <img src={office.logo} alt={office.officeName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <AvatarFallback className="bg-amber-100 text-amber-700 font-bold rounded-xl">{office.officeName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{office.officeName}</h1>
            <p className="text-xs text-muted-foreground truncate">{office.id}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setLocation(`/shipping-office/edit/${office.id}`)}>
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Button>
        </div>
        <div className="px-4 py-2 bg-muted/30 border-t">
          <div className="flex items-center justify-around text-center">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-muted-foreground">الطلبات</span>
              <span className="text-sm font-bold">{orderStats.total}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs text-muted-foreground">مشحونة</span>
              <span className="text-sm font-bold text-purple-600">{orderStats.shipped}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">مكتملة</span>
              <span className="text-sm font-bold text-green-600">{orderStats.delivered}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">الإيرادات</span>
              <span className="text-sm font-bold text-primary">{orderStats.totalRevenue.toLocaleString("ar-EG")} ج.م</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-muted-foreground">الفروع</span>
              <span className="text-sm font-bold">{office.branches.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Office Info */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">المدير</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{office.managerName}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">رقم المدير</p>
              <div className="flex items-center gap-2" dir="ltr">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold">{office.managerPhone}</span>
                <div className="flex items-center gap-1 mr-2">
                  <a href={`tel:${office.managerPhone}`} className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="اتصال">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <a href={`https://wa.me/${office.managerPhone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="واتساب">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الشحن الداخلي</p>
              <span className="text-sm font-semibold text-amber-600">{office.internalShipping} ج.م</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الحالة</p>
              <Badge className={office.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {office.status === "active" ? "نشط" : "غير نشط"}
              </Badge>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-1">العنوان</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{office.address}</span>
              </div>
            </div>
            {office.location && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">الموقع الجغرافي</p>
                <div className="flex items-center gap-2">
                  <a href={office.location} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="فتح الموقع">
                    <MapPinned className="h-4 w-4" />
                  </a>
                  <span className="text-xs font-mono text-muted-foreground" dir="ltr">
                    {office.location.match(/q=([^&]+)/)?.[1]?.replace(/,/, '، ')}
                  </span>
                </div>
              </div>
            )}
            {office.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm italic text-muted-foreground">"{office.notes}"</p>
              </div>
            )}
          </div>
          {office.branches.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">الفروع ({office.branches.length})</p>
              <div className="flex flex-wrap gap-2">
                {office.branches.map((b, i) => (
                  <Badge key={i} variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                    <Building2 className="h-2.5 w-2.5" />
                    {b.name}
                    <span dir="ltr" className="font-mono">{b.phone}</span>
                    <div className="flex items-center gap-0.5 mr-1">
                      <a href={`tel:${b.phone}`} className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="اتصال">
                        <Phone className="h-2.5 w-2.5" />
                      </a>
                      <a href={`https://wa.me/${b.phone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="واتساب">
                        <MessageCircle className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Stats Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 gap-2">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي الطلبات</span>
          <span className="text-xs font-bold">{orderStats.total}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <Truck className="h-3 w-3 text-purple-500" />
          <span className="text-[10px] text-muted-foreground">المشحونة</span>
          <span className="text-xs font-bold text-purple-500">{orderStats.shipped}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="text-[10px] text-muted-foreground">المكتملة</span>
          <span className="text-xs font-bold text-green-500">{orderStats.delivered}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي المبيعات</span>
          <span className="text-xs font-bold text-emerald-600">{orderStats.totalRevenue.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي العمولة</span>
          <span className="text-xs font-bold text-violet-600">{orderStats.totalCommission.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">الفلاتر</span>
              {activeFilters > 0 && (
                <Badge className="bg-primary text-primary-foreground h-3.5 text-[9px] px-1">{activeFilters}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-5 text-[10px] px-1.5">
                  <X className="h-2.5 w-2.5 ml-0.5" />
                  مسح الكل
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
                    <Download className="h-3 w-3 ml-1" />
                    تصدير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => exportOrdersPDF(filteredOrders)}>
                    تصدير PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => exportOrdersExcel(filteredOrders)}>
                    تصدير Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => window.print()}>
                <Printer className="h-3 w-3 ml-1" />
                طباعة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">رقم الطلب / العميل</label>
              <Input placeholder="ORD-XXXX" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">حالة الطلب</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="shipped">مشحونة</SelectItem>
                    <SelectItem value="delivered">مكتملة</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">اسم المورد</label>
              <Input placeholder="مورد" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">التاريخ</label>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">طريقة الدفع</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {paymentMethods.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">حالة الدفع</label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {paymentStatuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">ترتيب حسب</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="highest_total">أعلى قيمة طلب</SelectItem>
                  <SelectItem value="lowest_total">أقل قيمة طلب</SelectItem>
                  <SelectItem value="customer_az">اسم العميل من A إلى Z</SelectItem>
                  <SelectItem value="customer_za">اسم العميل من Z إلى A</SelectItem>
                  <SelectItem value="order_status">حسب حالة الطلب</SelectItem>
                  <SelectItem value="payment_status">حسب حالة الدفع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs">رقم الطلب</TableHead>
                <TableHead className="text-right text-xs">اسم العميل</TableHead>
                <TableHead className="text-right text-xs">رقم الهاتف</TableHead>
                <TableHead className="text-right text-xs">كود العميل</TableHead>
                <TableHead className="text-center text-xs">الكمية</TableHead>
                <TableHead className="text-right text-xs">الإجمالي</TableHead>
                <TableHead className="text-right text-xs">العمولة</TableHead>
                <TableHead className="text-right text-xs">طريقة الدفع</TableHead>
                <TableHead className="text-right text-xs">حالة الدفع</TableHead>
                <TableHead className="text-right text-xs">الشحن</TableHead>
                <TableHead className="text-right text-xs">الموقع</TableHead>
                <TableHead className="text-right text-xs">الحالة</TableHead>
                <TableHead className="text-right text-xs">التاريخ والوقت</TableHead>
                <TableHead className="text-center text-xs">عرض</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات مطابقة للفلاتر
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs text-right">{order.id}</TableCell>
                    <TableCell className="text-xs text-right">{order.customer}</TableCell>
                    <TableCell className="text-xs text-right" dir="ltr">+20 {order.customerPhone}</TableCell>
                    <TableCell className="font-mono text-xs text-right">{order.customerCode}</TableCell>
                    <TableCell className="text-xs text-center font-semibold text-blue-600">{order.quantity}</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-emerald-600">{order.total.toLocaleString("ar-EG")} ج.م</TableCell>
                    <TableCell className="text-xs text-right font-semibold text-violet-600">{order.commission.toLocaleString("ar-EG")} ج.م</TableCell>
                    <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-xs text-right leading-tight">
                      <div className="text-amber-800 font-semibold">{order.shippingCompany}</div>
                      {order.shippingOffice && <div className="text-amber-600">{order.shippingOffice}</div>}
                    </TableCell>
                    <TableCell className="text-xs text-right leading-tight">
                      <div className="text-cyan-800 font-semibold">{order.country}</div>
                      <div className="text-cyan-600">{order.governorate} - {order.area}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-xs text-right">{formatDate(order.date)} {order.time}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" onClick={() => setLocation(`/shipping-order-detail/${order.id}?back=/shipping-office/${office.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">عرض</span>
                <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-7 w-16 text-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-muted-foreground">من {filteredOrders.length} طلب</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm" className="h-7 text-[10px] px-2"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm" className="h-7 w-7 text-[10px] p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline" size="sm" className="h-7 text-[10px] px-2"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
