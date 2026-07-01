import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useProducts, useSuppliers } from "@/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  ArrowRight, Download, Printer, Truck, CheckCircle2, Clock, XCircle, Filter, X, Pencil, Trash2, Eye, MoreHorizontal,
} from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ar-EG");
}

function exportCSV(orders: any[]) {
  const headers = ["رقم الطلب", "اسم العميل", "الهاتف", "كود العميل", "الكمية", "الإجمالي", "العمولة", "المورد", "طريقة الدفع", "حالة الدفع", "الشحن", "المكتب", "الدولة", "المحافظة", "المنطقة", "الحالة", "التاريخ"];
  const rows = orders.map(o => [
    o.id, o.customer, o.customerPhone, o.customerCode, o.quantity, o.total, o.commission, o.supplier, o.paymentMethod, o.paymentStatus, o.shippingCompany, o.shippingOffice, o.country, o.governorate, o.area, o.status, formatDate(o.date),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "supplier-orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(orders: any[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Orders Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Total: ${orders.length} orders`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [["ID", "Customer", "Phone", "Qty", "Total", "Commission", "Payment", "Status", "Date"]],
    body: orders.map(o => [
      o.id, o.customer, o.customerPhone, String(o.quantity), `${o.total}`, `${o.commission}`, o.paymentMethod, o.status, formatDate(o.date),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save("supplier-orders.pdf");
}

function exportExcel(orders: any[]) {
  const data = orders.map(o => ({
    "رقم الطلب": o.id,
    "اسم العميل": o.customer,
    "الهاتف": o.customerPhone,
    "كود العميل": o.customerCode,
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
  XLSX.writeFile(wb, "supplier-orders.xlsx");
}

async function exportPowerPoint(orders: any[]) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const titleSlide = pptx.addSlide();
  titleSlide.addText("تقرير الطلبات", {
    x: 0.5, y: 1.5, w: "90%", h: 1.5,
    fontSize: 36, bold: true, color: "3B82F6", align: "center",
  });
  titleSlide.addText(`التاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي: ${orders.length} طلب`, {
    x: 0.5, y: 3.2, w: "90%", h: 0.8,
    fontSize: 14, color: "666666", align: "center",
  });

  const statsSlide = pptx.addSlide();
  statsSlide.addText("الإحصائيات", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 20, bold: true, color: "1F2937",
  });

  const totalQty = orders.reduce((s, o) => s + o.quantity, 0);
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const totalComm = orders.reduce((s, o) => s + o.commission, 0);

  const statsData = [
    ["اجمالي الطلبات", String(orders.length)],
    ["الطلبات الجديدة", String(orders.filter(o => o.status === "pending").length)],
    ["الطلبات المجهزة", String(orders.filter(o => o.status === "processing").length)],
    ["الطلبات المكتملة", String(orders.filter(o => o.status === "delivered").length)],
    ["الطلبات الملغية", String(orders.filter(o => o.status === "cancelled").length)],
    ["اجمالي المنتجات", String(totalQty)],
    ["اجمالي المبيعات", `${totalSales.toLocaleString("ar-EG")} ج.م`],
    ["اجمالي العمولة", `${totalComm.toLocaleString("ar-EG")} ج.م`],
  ];

  statsSlide.addTable(
    statsData.map((row, i) => [
      { text: row[0], options: { bold: true, color: "374151", fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
      { text: row[1], options: { bold: true, color: "3B82F6", fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    ]),
    { x: 1.5, y: 1.2, w: 7, colW: [4, 3], fontSize: 12, border: { pt: 0.5, color: "E5E7EB" } }
  );

  const tableSlide = pptx.addSlide();
  tableSlide.addText("قائمة الطلبات", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 20, bold: true, color: "1F2937",
  });

  const headerRow = [
    { text: "رقم الطلب", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "العميل", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الكمية", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الإجمالي", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "العمولة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الدفع", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الحالة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "التاريخ", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
  ];

  const rows = orders.slice(0, 20).map((o, i) => [
    { text: o.id, options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: o.customer, options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: String(o.quantity), options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: `${o.total.toLocaleString("ar-EG")} ج.م`, options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: `${o.commission.toLocaleString("ar-EG")} ج.م`, options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: o.paymentMethod, options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: o.status === "pending" ? "جديدة" : o.status === "processing" ? "مجهزة" : o.status === "shipped" ? "مشحونة" : o.status === "delivered" ? "مكتملة" : "ملغية", options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
    { text: formatDate(o.date), options: { fill: { color: i % 2 === 0 ? "F9FAFB" : "FFFFFF" } } },
  ]);

  tableSlide.addTable([headerRow, ...rows], {
    x: 0.3, y: 1.0, w: 9.4,
    colW: [1.2, 1.3, 0.8, 1.2, 1.2, 1.2, 1.0, 1.5],
    fontSize: 8,
    border: { pt: 0.5, color: "E5E7EB" },
    autoPage: true,
    autoPageRepeatHeader: true,
  });

  await pptx.writeFile({ fileName: "supplier-orders.pptx" });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    processing: "bg-blue-50 text-blue-700 border border-blue-200",
    shipped: "bg-purple-50 text-purple-700 border border-purple-200",
    delivered: "bg-green-50 text-green-700 border border-green-200",
    cancelled: "bg-red-50 text-red-700 border border-red-200",
  };
  const labels: Record<string, string> = {
    pending: "جديدة",
    processing: "مجهزة",
    shipped: "مشحونة",
    delivered: "مكتملة",
    cancelled: "ملغية",
  };
  return <Badge className={`${styles[status]} text-[11px]`}>{labels[status]}</Badge>;
}

function getPaymentStatusBadge(status: string) {
  const styles: Record<string, string> = {
    "مدفوع": "bg-green-100 text-green-800",
    "غير مدفوع": "bg-red-100 text-red-800",
    "مدفوع جزئياً": "bg-yellow-100 text-yellow-800",
  };
  return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
}

function getPaymentMethodBadge(method: string) {
  const styles: Record<string, string> = {
    "كاش": "bg-green-100 text-green-800",
    "بطاقة ائتمان": "bg-blue-100 text-blue-800",
    "تحويل بنفي": "bg-purple-100 text-purple-800",
    "محفظة إلكترونية": "bg-orange-100 text-orange-800",
    "فودافون كاش": "bg-red-100 text-red-800",
  };
  return <Badge className={styles[method] || "bg-gray-100 text-gray-800"}>{method}</Badge>;
}

export default function SupplierOrders() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const suppliers = useSuppliers();
  const products = useProducts();
  const supplier = suppliers.find(s => s.id === Number(id));

  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [shippingCompany, setShippingCompany] = useState("all");
  const [shippingOffice, setShippingOffice] = useState("all");
  const [country, setCountry] = useState("all");
  const [governorate, setGovernorate] = useState("all");
  const [area, setArea] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  const [statusChangingOrder, setStatusChangingOrder] = useState<any>(null);
  const [shippingManifestImage, setShippingManifestImage] = useState<string | null>(null);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [showDailyOnly, setShowDailyOnly] = useState(false);
  const [editForm, setEditForm] = useState({
    customer: "",
    customerPhone: "",
    quantity: 1,
    total: 0,
    status: "",
    paymentMethod: "",
    paymentStatus: "",
  });

  const shippingCompanies = ["سمسا", "آرامكس", "فيديكس", "جانيت", "speedex"];
  const shippingOffices = ["مكتب المعادي", "مكتب الدقي", "مكتب مدينة نصر", "مكتب الإسكندرية", "مكتب المنصورة"];
  const paymentMethods = ["كاش", "بطاقة ائتمان", "تحويل بنفي", "محفظة إلكترونية", "فودافون كاش"];
  const paymentStatuses = ["مدفوع", "غير مدفوع", "مدفوع جزئياً"];
  const countries = ["مصر", "السعودية", "الإمارات", "الكويت", "قطر"];
  const governorates: Record<string, string[]> = {
    "مصر": ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحيرة", "المنوفية", "القليوبية"],
    "السعودية": ["الرياض", "جدة", "مكة", "المدينة", "الدمام"],
    "الإمارات": ["دبي", "أبو ظبي", "شارقة", "عجمان", "العين"],
    "الكويت": ["الكويت", "حولي", "الفروانية", "الأحمدي"],
    "قطر": ["الدوحة", "الخور", "الريان", "الوكرة"],
  };
  const areas: Record<string, string[]> = {
    "القاهرة": ["مدينة نصر", "مصر الجديدة", "المعادي", "الزمالك", "وسط البلد", "شبرا"],
    "الجيزة": ["الدقي", "المهندسين", "الهرم", "فيصل", "أكتوبر", "الشيخ زايد"],
    "الإسكندرية": ["سيدي جابر", "المحرم بك", "المندرة", "العطارين", "الجمرك"],
    "الرياض": ["العليا", "الملز", "النخيل", "حي الورود", "السليمانية"],
    "دبي": ["دبي مارينا", "البرشاء", "الديرة", "الكرامة"],
  };

  const orders = useMemo(() => {
    const customerNames = ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود", "نورا سعيد", "عمر حسين", "ريم عبد الله", "ياسر إبراهيم", "هدى عادل"];
    const egyptCities = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "المنوفية"];
    const egyptAreas: Record<string, string[]> = {
      "القاهرة": ["مدينة نصر", "المعادي", "الزمالك", "وسط البلد"],
      "الجيزة": ["الدقي", "المهندسين", "الهرم", "أكتوبر"],
      "الإسكندرية": ["سيدي جابر", "المحرم بك", "المندرة"],
      "الدقهلية": ["المنصورة", "طلخا", "ميت غمر"],
      "المنوفية": ["شبين الكوم", "السادات", "منوف"],
    };
    const saudiCities = ["الرياض", "جدة", "الدمام"];
    const saudiAreas: Record<string, string[] | undefined> = {
      "الرياض": ["العليا", "الملز", "النخيل", "السليمانية"],
      "جدة": ["الفيصلية", "الحمدانية", "أميرية", "الشاطئ"],
      "الدمام": ["الفيصلية", "الظهران", "الخبر", "المنطقة الصناعية"],
    };
    const uaeCities = ["دبي", "أبو ظبي", "شارقة"];
    const uaeAreas: Record<string, string[] | undefined> = {
      "دبي": ["دبي مارينا", "البرشاء", "الديرة", "الكرامة"],
      "أبو ظبي": ["البطين", "المصفاة", "الخالدية", "المرور"],
      "شارقة": ["القصباء", "المجاز", "اليرموك"],
    };
    const domesticCompanies = ["سمسا", "آرامكس", "فيديكس", "جانيت", "speedex"];
    const domesticOffices = ["مكتب المعادي", "مكتب الدقي", "مكتب مدينة نصر", "مكتب الإسكندرية", "مكتب المنصورة"];
    const internationalCompanies = ["DHL Express", "فيديكس الدولي", "أرامكس الدولي", "TNT", "يونايتد اكسبرس"];

    const mockOrders = products.slice(0, 50).map((product, index) => {
      const isDomestic = index % 2 === 0;
      const countryValue = isDomestic ? "مصر" : ["السعودية", "الإمارات"][index % 2];
      const cities = isDomestic ? egyptCities : countryValue === "السعودية" ? saudiCities : uaeCities;
      const areasMap = isDomestic ? egyptAreas : countryValue === "السعودية" ? saudiAreas : uaeAreas;
      const city = cities[index % cities.length];
      const cityAreas = areasMap[city] || [];
      const areaName = cityAreas[index % cityAreas.length] || city;

      return {
        id: `ORD-${1000 + index}`,
        customer: customerNames[index % customerNames.length],
        customerId: `USR-${4000 + index}`,
        customerCode: `CODE-${1000 + index}`,
        customerPhone: `0101234567${index % 10}`,
        product: product.name,
        supplier: product.supplier.name,
        supplierCode: `SUP-${2000 + index}`,
        supplierPhone: `011${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
        supplierEmail: `supplier${index + 1}@example.com`,
        supplierStatus: index % 3 === 0 ? "active" : "inactive",
        quantity: Math.floor(Math.random() * 5) + 1,
        total: product.price * (Math.floor(Math.random() * 5) + 1),
        commission: Math.floor(Math.random() * 500) + 50,
        status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)] as string,
        paymentStatus: ["مدفوع", "غير مدفوع", "مدفوع جزئياً"][Math.floor(Math.random() * 3)] as string,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ${Math.random() > 0.5 ? "ص" : "م"}`,
        deliveryDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        shippingCompany: isDomestic ? domesticCompanies[index % domesticCompanies.length] : internationalCompanies[index % internationalCompanies.length],
        shippingOffice: isDomestic ? domesticOffices[index % domesticOffices.length] : null,
        country: countryValue,
        governorate: city,
        area: areaName,
      };
    });

    return mockOrders;
  }, [products]);

  useEffect(() => {
    setOrdersList(orders);
  }, [orders]);

  const supplierOrders = useMemo(() => {
    if (!supplier) return [];
    return ordersList.filter(o => o.supplier === supplier.name);
  }, [ordersList, supplier]);

  const filteredOrders = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return supplierOrders.filter(o => {
      const matchesOrderId = !orderId || o.id.includes(orderId);
      const matchesCustomer = !customerName || o.customer.includes(customerName);
      const matchesCustomerId = !customerId || o.customerId.includes(customerId);
      const matchesCustomerCode = !customerCode || o.customerCode.includes(customerCode);
      const matchesCustomerPhone = !customerPhone || o.customerPhone.includes(customerPhone);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesDate = !dateFilter || new Date(o.date).toISOString().slice(0, 10) === dateFilter;
      const matchesTime = !timeFilter || o.time.includes(timeFilter);
      const matchesPrice = !priceFilter || o.total >= Number(priceFilter);
      const matchesPriceFrom = !priceFrom || o.total >= Number(priceFrom);
      const matchesPriceTo = !priceTo || o.total <= Number(priceTo);
      const matchesCompany = shippingCompany === "all" || o.shippingCompany === shippingCompany;
      const matchesOffice = shippingOffice === "all" || o.shippingOffice === shippingOffice || (!o.shippingOffice && shippingOffice === "all");
      const matchesCountry = country === "all" || o.country === country;
      const matchesGovernorate = governorate === "all" || o.governorate === governorate;
      const matchesArea = area === "all" || o.area === area;
      const matchesPaymentMethod = paymentMethod === "all" || o.paymentMethod === paymentMethod;
      const matchesPaymentStatus = paymentStatus === "all" || o.paymentStatus === paymentStatus;
      const matchesDaily = !showDailyOnly || new Date(o.date).toISOString().slice(0, 10) === today;

      return matchesOrderId && matchesCustomer && matchesCustomerId && matchesCustomerCode && matchesCustomerPhone &&
        matchesStatus && matchesDate && matchesTime && matchesPrice && matchesPriceFrom && matchesPriceTo && matchesCompany && matchesOffice &&
        matchesCountry && matchesGovernorate && matchesArea && matchesPaymentMethod && matchesPaymentStatus && matchesDaily;
    });
  }, [supplierOrders, orderId, customerName, customerId, customerCode, customerPhone, statusFilter, dateFilter, timeFilter, priceFilter, priceFrom, priceTo, shippingCompany, shippingOffice, country, governorate, area, paymentMethod, paymentStatus, showDailyOnly]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest_total": return b.total - a.total;
        case "lowest_total": return a.total - b.total;
        case "customer_az": return a.customer.localeCompare(b.customer, "ar");
        case "customer_za": return b.customer.localeCompare(a.customer, "ar");
        case "order_status": return a.status.localeCompare(b.status, "ar");
        case "payment_status": return a.paymentStatus.localeCompare(b.paymentStatus, "ar");
        case "delivery_date": return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
        case "last_updated": return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default: return 0;
      }
    });
  }, [filteredOrders, sortBy]);

  const stats = useMemo(() => ({
    total: sortedOrders.length,
    pending: sortedOrders.filter(o => o.status === "pending").length,
    processing: sortedOrders.filter(o => o.status === "processing").length,
    delivered: sortedOrders.filter(o => o.status === "delivered").length,
    cancelled: sortedOrders.filter(o => o.status === "cancelled").length,
    totalQuantity: sortedOrders.reduce((s, o) => s + o.quantity, 0),
    totalSales: sortedOrders.reduce((s, o) => s + o.total, 0),
    totalCommission: sortedOrders.reduce((s, o) => s + o.commission, 0),
  }), [sortedOrders]);

  const activeFilters = [orderId, customerName, customerId, customerCode, customerPhone, statusFilter !== "all" ? statusFilter : "", dateFilter, timeFilter, priceFilter, priceFrom, priceTo, shippingCompany !== "all" ? shippingCompany : "", shippingOffice !== "all" ? shippingOffice : "", country !== "all" ? country : "", governorate !== "all" ? governorate : "", area !== "all" ? area : "", paymentMethod !== "all" ? paymentMethod : "", paymentStatus !== "all" ? paymentStatus : "", showDailyOnly ? "daily" : ""].filter(Boolean).length;

  const clearAllFilters = () => {
    setOrderId("");
    setCustomerName("");
    setCustomerId("");
    setCustomerCode("");
    setCustomerPhone("");
    setStatusFilter("all");
    setDateFilter("");
    setTimeFilter("");
    setPriceFilter("");
    setPriceFrom("");
    setPriceTo("");
    setShippingCompany("all");
    setShippingOffice("all");
    setCountry("all");
    setGovernorate("all");
    setArea("all");
    setPaymentMethod("all");
    setPaymentStatus("all");
    setShowDailyOnly(false);
  };

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4" dir="rtl">
        <p className="text-muted-foreground">لم يتم العثور على المورد</p>
        <Button variant="outline" onClick={() => setLocation("/suppliers")}>
          <ArrowRight className="h-4 w-4 ml-2" /> العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => setLocation(`/suppliers/${supplier.id}`)} className="h-9 w-9 shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate">طلبات {supplier.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{supplier.companyName}</p>
          </div>
          {activeFilters > 0 && (
            <Badge className="bg-primary text-primary-foreground">{activeFilters} فلتر نشط</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showDailyOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDailyOnly(!showDailyOnly)}
          >
            <Clock className="h-4 w-4 ml-1.5" />
            الطلبات اليومية
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-1.5" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportCSV(sortedOrders)}>
                تصدير CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPDF(sortedOrders)}>
                تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportExcel(sortedOrders)}>
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPowerPoint(sortedOrders)}>
                تصدير PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 ml-1.5" />
            طباعة
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي الطلبات</span>
          <span className="text-xs font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <Clock className="h-3 w-3 text-yellow-500" />
          <span className="text-[10px] text-muted-foreground">الجديدة</span>
          <span className="text-xs font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <Truck className="h-3 w-3 text-blue-500" />
          <span className="text-[10px] text-muted-foreground">المجهزة</span>
          <span className="text-xs font-bold text-blue-500">{stats.processing}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          <span className="text-[10px] text-muted-foreground">المكتملة</span>
          <span className="text-xs font-bold text-green-500">{stats.delivered}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <XCircle className="h-3 w-3 text-red-500" />
          <span className="text-[10px] text-muted-foreground">الملغية</span>
          <span className="text-xs font-bold text-red-500">{stats.cancelled}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي المنتجات</span>
          <span className="text-xs font-bold text-blue-600">{stats.totalQuantity}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي المبيعات</span>
          <span className="text-xs font-bold text-emerald-600">{stats.totalSales.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-md px-2 py-1.5">
          <span className="text-[10px] text-muted-foreground">اجمالي العمولة</span>
          <span className="text-xs font-bold text-violet-600">{stats.totalCommission.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

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
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-5 text-[10px] px-1.5">
                <X className="h-2.5 w-2.5 ml-0.5" />
                مسح الكل
              </Button>
            )}
          </div>

          <div className="mb-1 rounded-md border bg-muted/20 px-2 py-1 text-[10px] text-muted-foreground">
            المورد الحالي: <span className="font-semibold text-foreground">{supplier.name}</span> - {supplier.companyName}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">رقم الطلب</label>
              <Input placeholder="ORD-XXXX" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">اسم العميل</label>
              <Input placeholder="أحمد محمد" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">هاتف العميل</label>
              <Input placeholder="010XXXXXXXX" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">كود العميل</label>
              <Input placeholder="CODE" value={customerCode} onChange={(e) => setCustomerCode(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">حالة الطلب</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">جديدة</SelectItem>
                  <SelectItem value="processing">مجهزة</SelectItem>
                  <SelectItem value="shipped">مشحونة</SelectItem>
                  <SelectItem value="delivered">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">تاريخ الطلب</label>
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">الوقت</label>
              <Input type="time" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">السعر من</label>
              <Input type="number" placeholder="0" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">السعر إلى</label>
              <Input type="number" placeholder="999999" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">شركة الشحن</label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {shippingCompanies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">مكتب الشحن</label>
              <Select value={shippingOffice} onValueChange={setShippingOffice}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {shippingOffices.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">الدولة</label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setGovernorate("all"); setArea("all"); }}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">المحافظة</label>
              <Select value={governorate} onValueChange={(v) => { setGovernorate(v); setArea("all"); }} disabled={country === "all"}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder={country === "all" ? "اختر الدولة" : "الكل"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {(governorates[country] || []).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">المنطقة</label>
              <Select value={area} onValueChange={setArea} disabled={governorate === "all"}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder={governorate === "all" ? "اختر المحافظة" : "الكل"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {(areas[governorate] || []).map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">طريقة الدفع</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8 text-[10px] px-2">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
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
                  {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                  <SelectItem value="delivery_date">حسب موعد التسليم</SelectItem>
                  <SelectItem value="last_updated">آخر تحديث</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">السعر الأدنى</label>
              <Input type="number" placeholder="0" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="h-8 text-[10px] px-2" />
            </div>
          </div>
        </CardContent>
      </Card>

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
                <TableHead className="text-center text-xs">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
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
                    <TableCell className="text-xs text-right">{new Date(order.date).toLocaleDateString("ar-EG")} {order.time}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => setLocation(`/orders/${order.id}?status=${order.status}`)}>
                            <Eye className="h-3.5 w-3.5 ml-1.5" />
                            تفاصيل الطلب
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingOrder(order);
                            setEditForm({
                              customer: order.customer,
                              customerPhone: order.customerPhone,
                              quantity: order.quantity,
                              total: order.total,
                              status: order.status,
                              paymentMethod: order.paymentMethod,
                              paymentStatus: order.paymentStatus,
                            });
                          }}>
                            <Pencil className="h-3.5 w-3.5 ml-1.5" />
                            تعديل الطلب
                          </DropdownMenuItem>
                          {order.status !== "delivered" && order.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => setStatusChangingOrder(order)}>
                              <Truck className="h-3.5 w-3.5 ml-1.5" />
                              {order.status === "shipped" ? "بوليصة الشحن" : "تغيير حالة الطلب"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-red-600">
                            <Trash2 className="h-3.5 w-3.5 ml-1.5" />
                            حذف الطلب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {sortedOrders.length > 0 && (
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
                <span className="text-[10px] text-muted-foreground">من {sortedOrders.length} طلب</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
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
                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="h-7 w-7 text-[10px] p-0" onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الطلب {editingOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم العميل</label>
              <Input value={editForm.customer} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">رقم الهاتف</label>
              <Input value={editForm.customerPhone} onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })} className="h-8 text-xs" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الكمية</label>
                <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الإجمالي</label>
                <Input type="number" value={editForm.total} onChange={(e) => setEditForm({ ...editForm, total: Number(e.target.value) })} className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حالة الطلب</label>
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">جديدة</SelectItem>
                  <SelectItem value="processing">مجهزة</SelectItem>
                  <SelectItem value="shipped">مشحونة</SelectItem>
                  <SelectItem value="delivered">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">طريقة الدفع</label>
                <Select value={editForm.paymentMethod} onValueChange={(v) => setEditForm({ ...editForm, paymentMethod: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">حالة الدفع</label>
                <Select value={editForm.paymentStatus} onValueChange={(v) => setEditForm({ ...editForm, paymentStatus: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingOrder(null)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              setOrdersList(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...editForm, lastUpdated: new Date().toISOString() } : o));
              setEditingOrder(null);
            }}>
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingOrder} onOpenChange={() => setDeletingOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف الطلب</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الطلب <span className="font-semibold">{deletingOrder?.id}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingOrder(null)}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              setOrdersList(prev => prev.filter(o => o.id !== deletingOrder.id));
              setDeletingOrder(null);
            }}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!statusChangingOrder} onOpenChange={() => { setStatusChangingOrder(null); setShippingManifestImage(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{statusChangingOrder?.status === "shipped" ? "بوليصة الشحن" : "تغيير حالة الطلب"}</DialogTitle>
          </DialogHeader>
          {statusChangingOrder?.status === "shipped" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                إصدار بوليصة الشحن للطلب <span className="font-semibold">{statusChangingOrder?.id}</span> سيُغيّر حالة الطلب إلى مكتملة.
              </p>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">صورة بوليصة الشحن</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {shippingManifestImage ? (
                    <div className="space-y-2">
                      <img src={shippingManifestImage} alt="بوليصة الشحن" className="max-h-40 mx-auto rounded" />
                      <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => setShippingManifestImage(null)}>
                        إزالة الصورة
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setShippingManifestImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <div className="space-y-1">
                        <Truck className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">اضغط لرفع صورة البوليصة</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {statusChangingOrder?.status === "pending" && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  setOrdersList(prev => prev.map(o => o.id === statusChangingOrder.id ? { ...o, status: "processing", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingOrder(null);
                }}>
                  <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-blue-500" />
                  مجهزة
                </Button>
              )}
              {statusChangingOrder?.status === "processing" && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  setOrdersList(prev => prev.map(o => o.id === statusChangingOrder.id ? { ...o, status: "shipped", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingOrder(null);
                }}>
                  <Truck className="h-3.5 w-3.5 ml-1.5 text-purple-500" />
                  مشحونة
                </Button>
              )}
              {statusChangingOrder?.status === "pending" && (
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600" onClick={() => {
                  setOrdersList(prev => prev.map(o => o.id === statusChangingOrder.id ? { ...o, status: "cancelled", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingOrder(null);
                }}>
                  <XCircle className="h-3.5 w-3.5 ml-1.5" />
                  ملغية
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStatusChangingOrder(null)}>إلغاء</Button>
            {statusChangingOrder?.status === "shipped" && (
              <Button size="sm" disabled={!shippingManifestImage} onClick={() => {
                setOrdersList(prev => prev.map(o => o.id === statusChangingOrder.id ? { ...o, status: "delivered", shippingManifest: shippingManifestImage, lastUpdated: new Date().toISOString() } : o));
                setShippingManifestImage(null);
                setStatusChangingOrder(null);
              }}>
                <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
                إرسال البوليصة
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}