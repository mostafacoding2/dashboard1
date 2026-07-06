import { useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ArrowRight, Building2, MapPin, Phone, Mail, Package,
  Pencil, DollarSign, Globe, CheckCircle2, XCircle, ExternalLink,
  Eye, MapPinned, MessageCircle, Search, Filter, X, Download, Printer,
  Clock, Truck, ShoppingCart,
} from "lucide-react";

interface Governorate {
  name: string;
  areas: { name: string; price: number }[];
}

interface Branch {
  name: string;
  phone: string;
  country: string;
  governorate: string;
  address: string;
}

interface CompanyData {
  id: string;
  name: string;
  phone: string;
  orders: number;
  revenue: number;
  status: "active" | "inactive";
  coverage: string;
  managerName: string;
  managerPhone: string;
  country: string;
  logo: string | null;
  governorates: Governorate[];
  address: string | null;
  latitude?: number;
  longitude?: number;
  branches: Branch[];
}

const mockCompanies: CompanyData[] = [
  { id: "SHP-001", name: "شركة سمسا", phone: "01012345678", orders: 150, revenue: 25000, status: "active", coverage: "جميع المحافظات", managerName: "أحمد محمد", managerPhone: "01011111111", country: "مصر", logo: "https://ui-avatars.com/api/?name=سمسا&background=0369a1&color=fff&bold=true&size=128", governorates: [{ name: "القاهرة", areas: [{ name: "مدينة نصر", price: 30 }, { name: "المعادي", price: 25 }, { name: "الزمالك", price: 20 }, { name: "وسط البلد", price: 22 }] }, { name: "الجيزة", areas: [{ name: "الدقي", price: 25 }, { name: "المهندسين", price: 20 }, { name: "الهرم", price: 28 }] }, { name: "الإسكندرية", areas: [{ name: "سيدي جابر", price: 35 }, { name: "المحرم بك", price: 30 }] }, { name: "الدقهلية", areas: [{ name: "المنصورة", price: 20 }] }, { name: "المنوفية", areas: [{ name: "شبين الكوم", price: 18 }] }], address: "شارع النيل - مبنى الإذاعة والتلفزيون، القاهرة", latitude: 30.0444, longitude: 31.2357, branches: [{ name: "فرع القاهرة الرئيسي", phone: "01012345678", country: "مصر", governorate: "القاهرة", address: "شارع النيل - مبنى ١٢" }, { name: "فرع الجيزة", phone: "01012345679", country: "مصر", governorate: "الجيزة", address: "شارع الهرم - مبنى ٨" }, { name: "فرع الإسكندرية", phone: "01012345680", country: "مصر", governorate: "الإسكندرية", address: "شارع البحر - مبنى ٥" }, { name: "فرع الرياض", phone: "01012345681", country: "السعودية", governorate: "الرياض", address: "طريق الملك فهد - حي العليا" }, { name: "فرع جدة", phone: "01012345682", country: "السعودية", governorate: "جدة", address: "شارع التحلية - مبنى ٢٠" }, { name: "فرع المنصورة", phone: "01012345683", country: "مصر", governorate: "الدقهلية", address: "شارع الجيش - المنصورة" }, { name: "فرع شبين الكوم", phone: "01012345684", country: "مصر", governorate: "المنوفية", address: "شارع سعد زغلول - شبين الكوم" }, { name: "فرع أكتوبر", phone: "01012345685", country: "مصر", governorate: "الجيزة", address: "حي أكتوبر - المجاورة الأولى" }] },
  { id: "SHP-002", name: "شركة آرامكس", phone: "01098765432", orders: 120, revenue: 20000, status: "active", coverage: "القاهرة والجيزة", managerName: "خالد محمود", managerPhone: "01022222222", country: "مصر", logo: "https://ui-avatars.com/api/?name=آرامكس&background=16a34a&color=fff&bold=true&size=128", governorates: [{ name: "القاهرة", areas: [{ name: "مدينة نصر", price: 25 }, { name: "المعادي", price: 20 }] }, { name: "الجيزة", areas: [{ name: "الدقي", price: 22 }, { name: "المهندسين", price: 18 }] }], address: "شارع مصطفى النحاس، الدقي، الجيزة", latitude: 30.0468, longitude: 31.2098, branches: [{ name: "فرع الدقي", phone: "01098765432", country: "مصر", governorate: "الجيزة", address: "شارع مصطفى النحاس" }, { name: "فرع المهندسين", phone: "01098765433", country: "مصر", governorate: "الجيزة", address: "شارع جامعة الدول" }, { name: "فرع مدينة نصر", phone: "01098765434", country: "مصر", governorate: "القاهرة", address: "شارع عباس العقاد" }, { name: "فرع المعادي", phone: "01098765435", country: "مصر", governorate: "القاهرة", address: "شارع ٢٥٧ - المعادي" }] },
  { id: "SHP-003", name: "شركة فيديكس", phone: "01055555555", orders: 80, revenue: 15000, status: "active", coverage: "الإسكندرية", managerName: "سارة أحمد", managerPhone: "01033333333", country: "مصر", logo: "https://ui-avatars.com/api/?name=فيديكس&background=7c3aed&color=fff&bold=true&size=128", governorates: [{ name: "الإسكندرية", areas: [{ name: "سيدي جابر", price: 30 }, { name: "المحرم بك", price: 25 }] }, { name: "البحيرة", areas: [{ name: "دمنهور", price: 20 }] }], address: "شارع سيدي جابر، الإسكندرية", latitude: 31.2001, longitude: 29.9187, branches: [{ name: "فرع سيدي جابر", phone: "01055555555", country: "مصر", governorate: "الإسكندرية", address: "شارع سيدي جابر" }, { name: "فرع المحرم بك", phone: "01055555556", country: "مصر", governorate: "الإسكندرية", address: "شارع المحرم بك" }, { name: "فرع دمنهور", phone: "01055555557", country: "مصر", governorate: "البحيرة", address: "شارع الجمهورية - دمنهور" }, { name: "فرع كفر الدوار", phone: "01055555558", country: "مصر", governorate: "البحيرة", address: "شارع السوق - كفر الدوار" }] },
  { id: "SHP-004", name: "شركة DHL", phone: "01066666666", orders: 95, revenue: 18000, status: "inactive", coverage: "جميع المحافظات", managerName: "محمد حسن", managerPhone: "01044444444", country: "ألمانيا", logo: "https://ui-avatars.com/api/?name=DHL&background=dc2626&color=fff&bold=true&size=128", governorates: [{ name: "الرياض", areas: [{ name: "حي العليا", price: 40 }, { name: "الملز", price: 35 }] }, { name: "جدة", areas: [{ name: "شارع التحلية", price: 38 }] }, { name: "الدمام", areas: [{ name: "الخبر", price: 32 }] }], address: "شارع الملك فهد، الرياض", latitude: 24.7136, longitude: 46.6753, branches: [{ name: "فرع الرياض", phone: "01066666666", country: "السعودية", governorate: "الرياض", address: "شارع الملك فهد" }, { name: "فرع جدة", phone: "01066666667", country: "السعودية", governorate: "جدة", address: "شارع التحلية" }, { name: "فرع الدمام", phone: "01066666668", country: "السعودية", governorate: "الدمام", address: "شارع الظهران" }] },
  { id: "SHP-005", name: "شركة جانيت", phone: "01077777777", orders: 60, revenue: 10000, status: "active", coverage: "الدقهلية", managerName: "فاطمة علي", managerPhone: "01055555555", country: "مصر", logo: "https://ui-avatars.com/api/?name=جانيت&background=ea580c&color=fff&bold=true&size=128", governorates: [{ name: "الدقهلية", areas: [{ name: "المنصورة", price: 15 }, { name: "طلخا", price: 12 }] }, { name: "الغربية", areas: [{ name: "طنطا", price: 18 }] }], address: "شارع الجيش، المنصورة", latitude: 31.0409, longitude: 31.3785, branches: [{ name: "فرع المنصورة", phone: "01077777777", country: "مصر", governorate: "الدقهلية", address: "شارع الجيش" }, { name: "فرع طلخا", phone: "01077777778", country: "مصر", governorate: "الدقهلية", address: "شارع السوق - طلخا" }, { name: "فرع طنطا", phone: "01077777779", country: "مصر", governorate: "الغربية", address: "شارع البحر - طنطا" }, { name: "فرع المحلة", phone: "01077777780", country: "مصر", governorate: "الغربية", address: "شارع شكري القوتلي - المحلة" }] },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-EG");
}

function exportOrdersPDF(orders: any[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("تقرير الطلبات - شركات الشحن", 14, 20);
  doc.setFontSize(10);
  doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي: ${orders.length} طلب`, 14, 28);
  autoTable(doc, {
    startY: 36,
    head: [["رقم الطلب", "العميل", "الهاتف", "الكمية", "الإجمالي", "تكلفة الشحن", "العمولة", "طريقة الدفع", "حالة الدفع", "الموقع", "الحالة", "التاريخ"]],
    body: orders.map(o => [
      o.id, o.customer, o.customerPhone, String(o.quantity), `${o.total} ج.م`, `${o.shippingCost} ج.م`, `${o.commission} ج.م`, o.paymentMethod, o.paymentStatus, `${o.governorate} - ${o.area}`, o.status, formatDate(o.date),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  doc.save("shipping-company-orders.pdf");
}

function exportOrdersExcel(orders: any[]) {
  const data = orders.map(o => ({
    "رقم الطلب": o.id,
    "اسم العميل": o.customer,
    "الهاتف": o.customerPhone,
    "الكمية": o.quantity,
    "الإجمالي": o.total,
    "تكلفة الشحن": o.shippingCost,
    "العمولة": o.commission,
    "طريقة الدفع": o.paymentMethod,
    "حالة الدفع": o.paymentStatus,
    "شركة الشحن": o.shippingCompany,
    "الدولة": o.country,
    "المحافظة": o.governorate,
    "المنطقة": o.area,
    "الحالة": o.status,
    "التاريخ": formatDate(o.date),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "shipping-company-orders.xlsx");
}

export default function ShippingCompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const company = mockCompanies.find(c => c.id === id);

  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", phone: "", managerName: "", managerPhone: "",
    coverage: "", country: "", address: "",
  });
  const [companiesList, setCompaniesList] = useState(mockCompanies);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">لم يتم العثور على الشركة</p>
        <Button variant="outline" onClick={() => setLocation("/shipping-companies")}>
          <ArrowRight className="h-4 w-4 ml-2" /> العودة
        </Button>
      </div>
    );
  }

  const currentCompany = companiesList.find(c => c.id === id) || company;

  // Orders state
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paymentMethods = ["كاش", "بطاقة ائتمان", "تحويل بنفي", "محفظة إلكترونية", "فودافون كاش"];
  const paymentStatuses = ["مدفوع", "غير مدفوع", "مدفوع جزئياً"];
  const statusLabels: Record<string, string> = { pending: "جديدة", processing: "مجهزة", shipped: "مشحونة", delivered: "مكتملة", cancelled: "ملغية" };
  const statusStyles: Record<string, string> = { pending: "bg-yellow-50 text-yellow-700 border border-yellow-200", processing: "bg-blue-50 text-blue-700 border border-blue-200", shipped: "bg-purple-50 text-purple-700 border border-purple-200", delivered: "bg-green-50 text-green-700 border border-green-200", cancelled: "bg-red-50 text-red-700 border border-red-200" };

  const orders = useMemo(() => {
    const customerNames = ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود"];
    const cities = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "المنوفية"];
    const areasByCity: Record<string, string[]> = { "القاهرة": ["مدينة نصر", "المعادي", "الزمالك"], "الجيزة": ["الدقي", "المهندسين", "الهرم"], "الإسكندرية": ["سيدي جابر", "المحرم بك"], "الدقهلية": ["المنصورة", "طلخا"], "المنوفية": ["شبين الكوم", "منوف"] };
    const statuses = ["shipped", "delivered"];
    return Array.from({ length: 18 }, (_, i) => {
      const city = cities[i % cities.length];
      const areas = areasByCity[city] || [];
      return {
        id: `ORD-${2000 + i}`, customer: customerNames[i % customerNames.length],
        customerPhone: `010${String(10000000 + i * 1111111).slice(0, 8)}`,
        customerCode: `CODE-${1000 + i}`,
        quantity: Math.floor(Math.random() * 5) + 1, total: Math.floor(Math.random() * 2000) + 200,
        commission: Math.floor(Math.random() * 500) + 50, shippingCost: Math.floor(Math.random() * 100) + 20, status: statuses[i % statuses.length],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ${Math.random() > 0.5 ? "ص" : "م"}`,
        shippingCompany: currentCompany.name, country: "مصر", governorate: city, area: areas[i % areas.length] || city,
      };
    });
  }, [currentCompany]);

  const filteredOrders = useMemo(() => orders.filter(o => {
    return (!orderSearch || o.id.includes(orderSearch) || o.customer.includes(orderSearch) || o.customerPhone.includes(orderSearch)) &&
      (statusFilter === "all" || o.status === statusFilter) && (!supplierFilter || (o as any).supplier?.includes(supplierFilter)) &&
      (!dateFilter || new Date(o.date).toISOString().slice(0, 10) === dateFilter) &&
      (paymentMethod === "all" || o.paymentMethod === paymentMethod) &&
      (paymentStatus === "all" || o.paymentStatus === paymentStatus);
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "highest_total": return b.total - a.total;
      case "lowest_total": return a.total - b.total;
      default: return 0;
    }
  }), [orders, orderSearch, statusFilter, supplierFilter, dateFilter, paymentMethod, paymentStatus, sortBy]);

  const orderStats = useMemo(() => ({
    total: filteredOrders.length,
    shipped: filteredOrders.filter(o => o.status === "shipped").length,
    delivered: filteredOrders.filter(o => o.status === "delivered").length,
    totalRevenue: filteredOrders.reduce((s, o) => s + o.total, 0),
    totalShipping: filteredOrders.reduce((s, o) => s + (o as any).shippingCost, 0),
    totalCommission: filteredOrders.reduce((s, o) => s + o.commission, 0),
  }), [filteredOrders]);

  const activeFilters = [orderSearch, statusFilter !== "all" ? statusFilter : "", supplierFilter, dateFilter, paymentMethod !== "all" ? paymentMethod : "", paymentStatus !== "all" ? paymentStatus : ""].filter(Boolean).length;
  const clearFilters = () => { setOrderSearch(""); setStatusFilter("all"); setSupplierFilter(""); setDateFilter(""); setPaymentMethod("all"); setPaymentStatus("all"); };
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: string) => <Badge className={`${statusStyles[status]} text-[11px]`}>{statusLabels[status]}</Badge>;
  const getPaymentStatusBadge = (s: string) => {
    const styles: Record<string, string> = { "مدفوع": "bg-green-100 text-green-800", "غير مدفوع": "bg-red-100 text-red-800", "مدفوع جزئياً": "bg-yellow-100 text-yellow-800" };
    return <Badge className={styles[s] || "bg-gray-100 text-gray-800"}>{s}</Badge>;
  };
  const getPaymentMethodBadge = (method: string) => {
    const styles: Record<string, string> = { "كاش": "bg-green-100 text-green-800", "بطاقة ائتمان": "bg-blue-100 text-blue-800", "تحويل بنفي": "bg-purple-100 text-purple-800", "محفظة إلكترونية": "bg-orange-100 text-orange-800", "فودافون كاش": "bg-red-100 text-red-800" };
    return <Badge className={styles[method] || "bg-gray-100 text-gray-800"}>{method}</Badge>;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/shipping-companies")} className="h-9 w-9 shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10 rounded-xl flex-shrink-0">
            {currentCompany.logo ? (
              <img src={currentCompany.logo} alt={currentCompany.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <AvatarFallback className="bg-amber-100 text-amber-700 font-bold rounded-xl">{currentCompany.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{currentCompany.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{currentCompany.id}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
            setEditingCompany(currentCompany);
            setEditForm({
              name: currentCompany.name, phone: currentCompany.phone,
              managerName: currentCompany.managerName, managerPhone: currentCompany.managerPhone,
              coverage: currentCompany.coverage, country: currentCompany.country,
              address: currentCompany.address || "",
            });
          }}>
            <Pencil className="h-3.5 w-3.5" />
            تعديل
          </Button>
        </div>
        <div className="px-4 py-2 bg-muted/30 border-t">
          <div className="flex items-center justify-around text-center">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-muted-foreground">الطلبات</span>
              <span className="text-sm font-bold">{currentCompany.orders}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">الإيرادات</span>
              <span className="text-sm font-bold text-primary">{currentCompany.revenue.toLocaleString("ar-EG")} ج.م</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-muted-foreground">الفروع</span>
              <span className="text-sm font-bold">{currentCompany.branches.length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs text-muted-foreground">المحافظات</span>
              <span className="text-sm font-bold">{currentCompany.governorates.length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              {currentCompany.status === "active" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-600" />
              )}
              <span className="text-xs text-muted-foreground">الحالة</span>
              <span className={`text-sm font-bold ${currentCompany.status === "active" ? "text-green-600" : "text-red-600"}`}>
                {currentCompany.status === "active" ? "نشط" : "غير نشط"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3">

        {/* Manager & Contact */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-xl">
                {currentCompany.logo ? (
                  <img src={currentCompany.logo} alt={currentCompany.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-bold rounded-xl">{currentCompany.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-base font-bold">{currentCompany.name}</h2>
                <p className="text-[10px] text-muted-foreground font-mono">{currentCompany.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">المدير</p>
                <p className="text-xs font-semibold">{currentCompany.managerName}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right" dir="ltr">
                <p className="text-[10px] text-muted-foreground">رقم الهاتف</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">{currentCompany.managerPhone}</span>
                  <a href={`tel:${currentCompany.managerPhone}`} className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" title="اتصال">
                    <Phone className="h-2.5 w-2.5" />
                  </a>
                  <a href={`https://wa.me/${currentCompany.managerPhone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-50 text-green-600 hover:bg-green-100" title="واتساب">
                    <MessageCircle className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">الحالة</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = currentCompany.status === "active" ? "inactive" : "active";
                      setCompaniesList(prev => prev.map(c => c.id === currentCompany.id ? { ...c, status: newStatus } : c));
                    }}
                    className={`relative h-4 w-7 rounded-full transition-colors ${currentCompany.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm border transition-transform ${currentCompany.status === "active" ? "translate-x-3 border-green-600" : "translate-x-0 border-gray-400"}`} />
                  </button>
                  <span className={`text-[10px] font-semibold ${currentCompany.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {currentCompany.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address & Location */}
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPinned className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">العنوان التفصيلي</p>
                <p className="text-xs">{currentCompany.address || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">الدولة</p>
                <p className="text-xs font-semibold">{currentCompany.country}</p>
              </div>
              {currentCompany.latitude && currentCompany.longitude && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <a href={`https://maps.google.com/?q=${currentCompany.latitude},${currentCompany.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" title="فتح الموقع">
                    <MapPinned className="h-3 w-3" />
                  </a>
                  <span className="text-[9px] font-mono text-muted-foreground" dir="ltr">{currentCompany.latitude}، {currentCompany.longitude}</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Governorates with Areas & Prices */}
        {currentCompany.governorates.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">المحافظات والمناطق والأسعار</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                {currentCompany.governorates.map((g, i) => (
                  <div key={i} className="border rounded-md p-1.5 bg-card">
                    <p className="text-[10px] font-bold text-blue-700 mb-0.5">{g.name}</p>
                    {g.areas.length > 0 ? (
                      <div className="space-y-0.5">
                        {g.areas.map((a, j) => (
                          <div key={j} className="flex items-center justify-between text-[8px]">
                            <span className="text-muted-foreground">{a.name}</span>
                            <span className="font-semibold text-primary">{a.price} ج.م</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[8px] text-muted-foreground">—</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branches */}
        {currentCompany.branches.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-muted-foreground">الفروع ({currentCompany.branches.length})</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {currentCompany.branches.map((b, i) => (
                  <div key={i} className="border rounded-md p-1.5 bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-0.5">
                      <p className="text-[10px] font-semibold">{b.name}</p>
                      {b.phone && (
                        <div className="flex items-center gap-0.5">
                          <a href={`tel:${b.phone}`} className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" title="اتصال">
                            <Phone className="h-2 w-2" />
                          </a>
                          <a href={`https://wa.me/${b.phone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100" title="واتساب">
                            <MessageCircle className="h-2 w-2" />
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] text-muted-foreground">{b.address}</p>
                    {b.phone && <p className="text-[8px] font-mono text-muted-foreground" dir="ltr">{b.phone}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Orders Section */}
      <div className="space-y-3">

        {/* Order Stats Cards */}
        <div className="grid grid-cols-6 gap-2">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
            <ShoppingCart className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] text-muted-foreground">الطلبات</span>
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
            <DollarSign className="h-3 w-3 text-emerald-500" />
            <span className="text-[10px] text-muted-foreground">المبيعات</span>
            <span className="text-xs font-bold text-emerald-600">{orderStats.totalRevenue.toLocaleString("ar-EG")} ج.م</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
            <Truck className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-muted-foreground">الشحن</span>
            <span className="text-xs font-bold text-amber-600">{orderStats.totalShipping.toLocaleString("ar-EG")} ج.م</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
            <DollarSign className="h-3 w-3 text-violet-500" />
            <span className="text-[10px] text-muted-foreground">العمولة</span>
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
                {activeFilters > 0 && <Badge className="bg-primary text-primary-foreground h-3.5 text-[9px] px-1">{activeFilters}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-5 text-[10px] px-1.5">
                    <X className="h-2.5 w-2.5 ml-0.5" /> مسح الكل
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
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">رقم الطلب / العميل</label>
                <Input placeholder="ORD-XXXX" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="h-8 text-[10px] px-2" />
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">حالة الطلب</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-[10px] px-2"><SelectValue placeholder="الكل" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="shipped">مشحونة</SelectItem>
                    <SelectItem value="delivered">مكتملة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">التاريخ</label>
                <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 text-[10px] px-2" />
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">طريقة الدفع</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-8 text-[10px] px-2"><SelectValue placeholder="الكل" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">حالة الدفع</label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="h-8 text-[10px] px-2"><SelectValue placeholder="الكل" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground mb-0.5 block">ترتيب حسب</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-[10px] px-2"><SelectValue placeholder="الترتيب" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث أولاً</SelectItem>
                    <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                    <SelectItem value="highest_total">أعلى قيمة</SelectItem>
                    <SelectItem value="lowest_total">أقل قيمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-xs">رقم الطلب</TableHead>
                  <TableHead className="text-right text-xs">العميل</TableHead>
                  <TableHead className="text-right text-xs">رقم الهاتف</TableHead>
                  <TableHead className="text-center text-xs">الكمية</TableHead>
                  <TableHead className="text-right text-xs">الإجمالي</TableHead>
                  <TableHead className="text-right text-xs">تكلفة الشحن</TableHead>
                  <TableHead className="text-right text-xs">العمولة</TableHead>
                  <TableHead className="text-right text-xs">طريقة الدفع</TableHead>
                  <TableHead className="text-right text-xs">حالة الدفع</TableHead>
                  <TableHead className="text-right text-xs">الموقع</TableHead>
                  <TableHead className="text-right text-xs">الحالة</TableHead>
                  <TableHead className="text-right text-xs">التاريخ</TableHead>
                  <TableHead className="text-center text-xs">عرض</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={13} className="text-center py-8 text-muted-foreground">لا توجد طلبات</TableCell></TableRow>
                ) : paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell className="text-xs">{order.customer}</TableCell>
                    <TableCell className="text-xs" dir="ltr">+20 {order.customerPhone}</TableCell>
                    <TableCell className="text-xs text-center font-semibold text-blue-600">{order.quantity}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">{order.total.toLocaleString("ar-EG")} ج.م</TableCell>
                    <TableCell className="text-xs font-semibold text-amber-600">{order.shippingCost} ج.م</TableCell>
                    <TableCell className="text-xs font-semibold text-violet-600">{order.commission.toLocaleString("ar-EG")} ج.م</TableCell>
                    <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-xs leading-tight">
                      <div className="text-cyan-800 font-semibold">{order.country}</div>
                      <div className="text-cyan-600">{order.governorate} - {order.area}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-xs">{new Date(order.date).toLocaleDateString("ar-EG")} {order.time}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" onClick={() => setLocation(`/shipping-order-detail/${order.id}?back=/shipping-companies/${currentCompany.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">عرض</span>
                  <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-7 w-16 text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] text-muted-foreground">من {filteredOrders.length} طلب</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>السابق</Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    return <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-7 w-7 text-[10px] p-0" onClick={() => setCurrentPage(page)}>{page}</Button>;
                  })}
                  <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>التالي</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل شركة الشحن</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم الشركة</label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الهاتف</label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-8 text-xs" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">اسم المدير</label>
                <Input value={editForm.managerName} onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">رقم المدير</label>
                <Input value={editForm.managerPhone} onChange={(e) => setEditForm({ ...editForm, managerPhone: e.target.value })} className="h-8 text-xs" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">التغطية</label>
                <Input value={editForm.coverage} onChange={(e) => setEditForm({ ...editForm, coverage: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الدولة</label>
                <Input value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">العنوان التفصيلي</label>
                <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingCompany(null)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              if (editingCompany) {
                setCompaniesList(prev => prev.map(c =>
                  c.id === editingCompany.id ? { ...c, ...editForm } : c
                ));
                setEditingCompany(null);
              }
            }}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
