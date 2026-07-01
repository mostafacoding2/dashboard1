import { useState, useMemo } from "react";
import { useSuppliers, useProducts, adminStore } from "@/store";
import type { Supplier } from "@/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MapPin, Star, ArrowLeft, MessageCircle, Phone, PhoneCall, PackageX, ShoppingCart,
  ClipboardList, TruckIcon, XCircle, RotateCcw, CheckCircle2, Wallet, Package, Search, X,
  TrendingUp, Download, FileText, FileSpreadsheet, Presentation, Sheet as SheetIcon,
  BarChart2, ChevronDown, Printer
} from "lucide-react";
import { Link, useLocation } from "wouter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

function exportCSV(suppliers: Supplier[], products: ReturnType<typeof useProducts>) {
  const headers = ["ID", "الاسم", "الشركة", "الهاتف", "البريد", "التقييم", "المنتجات", "المبيعات", "المرتجعات", "العمولة", "الحالة", "تاريخ الإنشاء"];
  const rows = suppliers.map(s => {
    const sp = products.filter(p => p.supplier.id === s.id);
    const totalSold = sp.reduce((sum, p) => sum + p.sales, 0);
    const totalCommission = sp.reduce((sum, p) => sum + p.commission, 0);
    return [
      s.id, s.name, s.companyName, s.phone, s.email, s.averageRating,
      sp.length, totalSold, s.returnedOrders, totalCommission,
      s.status === 1 ? "نشط" : "معطل", formatDate(s.createdAt),
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "suppliers.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(suppliers: Supplier[], products: ReturnType<typeof useProducts>) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Suppliers Report", 14, 20);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Total: ${suppliers.length} suppliers`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [["ID", "Name", "Company", "Phone", "Rating", "Products", "Sales", "Returns", "Commission", "Status", "Date"]],
    body: suppliers.map(s => {
      const sp = products.filter(p => p.supplier.id === s.id);
      const totalSold = sp.reduce((sum, p) => sum + p.sales, 0);
      const totalCommission = sp.reduce((sum, p) => sum + p.commission, 0);
      return [
        String(s.id), s.name, s.companyName, s.phone, String(s.averageRating),
        String(sp.length), String(totalSold), String(s.returnedOrders),
        `$${totalCommission}`, s.status === 1 ? "Active" : "Inactive", formatDate(s.createdAt),
      ];
    }),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  doc.save("suppliers.pdf");
}

function exportExcel(suppliers: Supplier[], products: ReturnType<typeof useProducts>) {
  const data = suppliers.map(s => {
    const sp = products.filter(p => p.supplier.id === s.id);
    const totalSold = sp.reduce((sum, p) => sum + p.sales, 0);
    const totalCommission = sp.reduce((sum, p) => sum + p.commission, 0);
    return {
      "ID": s.id,
      "الاسم": s.name,
      "الشركة": s.companyName,
      "الهاتف": s.phone,
      "البريد": s.email,
      "التقييم": s.averageRating,
      "المنتجات": sp.length,
      "المبيعات": totalSold,
      "المرتجعات": s.returnedOrders,
      "العمولة": totalCommission,
      "الحالة": s.status === 1 ? "نشط" : "معطل",
      "تاريخ الإنشاء": formatDate(s.createdAt),
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
  XLSX.writeFile(wb, "suppliers.xlsx");
}

async function exportPowerPoint(suppliers: Supplier[], products: ReturnType<typeof useProducts>) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  const titleSlide = pptx.addSlide();
  titleSlide.addText("تقرير الموردين", {
    x: 0.5, y: 1.5, w: "90%", h: 1.5,
    fontSize: 36, bold: true, color: "3B82F6", align: "center",
  });
  titleSlide.addText(`التاريخ: ${new Date().toLocaleDateString("ar-EG")} | إجمالي: ${suppliers.length} مورد`, {
    x: 0.5, y: 3.2, w: "90%", h: 0.8,
    fontSize: 14, color: "666666", align: "center",
  });

  const tableSlide = pptx.addSlide();
  tableSlide.addText("قائمة الموردين", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 20, bold: true, color: "1F2937",
  });

  const headerRow = [
    { text: "ID", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الاسم", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الشركة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "التقييم", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "المنتجات", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "المبيعات", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "المرتجعات", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "العمولة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
    { text: "الحالة", options: { bold: true, color: "FFFFFF", fill: { color: "3B82F6" } } },
  ];

  const rows = suppliers.slice(0, 20).map(s => {
    const sp = products.filter(p => p.supplier.id === s.id);
    const totalSold = sp.reduce((sum, p) => sum + p.sales, 0);
    const totalCommission = sp.reduce((sum, p) => sum + p.commission, 0);
    return [
      { text: String(s.id) },
      { text: s.name },
      { text: s.companyName },
      { text: String(s.averageRating) },
      { text: String(sp.length) },
      { text: String(totalSold) },
      { text: String(s.returnedOrders) },
      { text: `$${totalCommission}` },
      { text: s.status === 1 ? "نشط" : "معطل" },
    ];
  });

  tableSlide.addTable([headerRow, ...rows], {
    x: 0.2, y: 1.0, w: 9.6,
    fontSize: 9,
    border: { type: "solid", pt: 0.5, color: "D1D5DB" },
    colW: [0.6, 1.5, 1.5, 0.8, 0.8, 0.8, 0.8, 1, 0.8],
    autoPage: false,
    rowH: 0.5,
  });

  const summarySlide = pptx.addSlide();
  const active = suppliers.filter(s => s.status === 1).length;
  const totalSales = suppliers.reduce((sum, s) => {
    const sp = products.filter(p => p.supplier.id === s.id);
    return sum + sp.reduce((s2, p) => s2 + p.sales, 0);
  }, 0);
  const totalCommission = suppliers.reduce((sum, s) => {
    const sp = products.filter(p => p.supplier.id === s.id);
    return sum + sp.reduce((s2, p) => s2 + p.commission, 0);
  }, 0);

  summarySlide.addText("ملخص", {
    x: 0.5, y: 0.3, w: "90%", h: 0.6,
    fontSize: 24, bold: true, color: "1F2937",
  });

  const stats = [
    { label: "إجمالي الموردين", value: String(suppliers.length), color: "3B82F6" },
    { label: "الموردون النشطون", value: String(active), color: "22C55E" },
    { label: "إجمالي المبيعات", value: totalSales.toLocaleString(), color: "F59E0B" },
    { label: "العمولة الإجمالية", value: `$${totalCommission.toLocaleString()}`, color: "8B5CF6" },
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

  await pptx.writeFile({ fileName: "suppliers.pptx" });
}

export default function Suppliers() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessFilter, setBusinessFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRangeMode, setDateRangeMode] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let list = suppliers.filter(s => {
      const matchesSearch = s.name.includes(search) || String(s.id).includes(search) || s.companyName.includes(search);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && s.status === 1) || (statusFilter === "inactive" && s.status === 0);
      const matchesBusiness = !businessFilter || s.typeOfBusiness.includes(businessFilter);
      const created = new Date(s.createdAt).getTime();
      const matchesDateFrom = !dateFrom || created >= new Date(dateFrom).getTime();
      const matchesDateTo = !dateTo || created <= new Date(dateTo + "T23:59:59").getTime();
      return matchesSearch && matchesStatus && matchesBusiness && matchesDateFrom && matchesDateTo;
    });

    list = [...list].sort((a, b) => {
      const aProducts = products.filter(p => p.supplier.id === a.id);
      const bProducts = products.filter(p => p.supplier.id === b.id);
      const aSold = aProducts.reduce((s, p) => s + p.sales, 0);
      const bSold = bProducts.reduce((s, p) => s + p.sales, 0);
      const aStock = aProducts.reduce((s, p) => s + p.quantity, 0);
      const bStock = bProducts.reduce((s, p) => s + p.quantity, 0);
      const aReturns = a.returnedOrders;
      const bReturns = b.returnedOrders;
      const aRating = a.averageRating;
      const bRating = b.averageRating;
      const aTotalProducts = aProducts.length;
      const bTotalProducts = bProducts.length;

      switch (sortBy) {
        case "most_sold": return bSold - aSold;
        case "most_preferred": return bRating - aRating;
        case "highest_stock": return bStock - aStock;
        case "highest_returns": return bReturns - aReturns;
        case "lowest_returns": return aReturns - bReturns;
        case "most_products": return bTotalProducts - aTotalProducts;
        case "highest_commission": {
          const aComm = aProducts.reduce((s, p) => s + p.commission, 0);
          const bComm = bProducts.reduce((s, p) => s + p.commission, 0);
          return bComm - aComm;
        }
        case "lowest_commission": {
          const aComm = aProducts.reduce((s, p) => s + p.commission, 0);
          const bComm = bProducts.reduce((s, p) => s + p.commission, 0);
          return aComm - bComm;
        }
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: return 0;
      }
    });

    return list;
  }, [suppliers, products, search, statusFilter, businessFilter, sortBy, dateFrom, dateTo]);

  const hasActiveFilters = search || statusFilter !== "all" || businessFilter || dateFrom || dateTo;

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setBusinessFilter("");
    setSortBy("newest");
    setDateFrom("");
    setDateTo("");
    setDateRangeMode(false);
  };

  const stats = useMemo(() => {
    const allProducts = products;
    const totalSales = allProducts.reduce((s, p) => s + p.sales, 0);
    const totalCommission = allProducts.reduce((s, p) => s + p.commission, 0);
    const activeSuppliers = suppliers.filter(s => s.status === 1).length;
    const inactiveSuppliers = suppliers.filter(s => s.status === 0).length;
    return { totalSales, totalCommission, activeSuppliers, inactiveSuppliers };
  }, [suppliers, products]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">الموردون</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-1.5" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportCSV(filteredAndSorted, products)}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير CSV
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPDF(filteredAndSorted, products)}>
                <FileText className="h-4 w-4 ml-2" />
                تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportExcel(filteredAndSorted, products)}>
                <SheetIcon className="h-4 w-4 ml-2" />
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => exportPowerPoint(filteredAndSorted, products)}>
                <Presentation className="h-4 w-4 ml-2" />
                تصدير PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 ml-1.5" />
            طباعة
          </Button>
          <Link href="/suppliers-charts">
            <Button variant="outline" size="sm">
              <BarChart2 className="h-4 w-4 ml-1.5" />
              الرسم البياني
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "إجمالي الموردين", value: filteredAndSorted.length, color: "text-foreground", icon: <Package className="h-3.5 w-3.5" /> },
          { label: "النشطون", value: stats.activeSuppliers, color: "text-green-500", icon: <TrendingUp className="h-3.5 w-3.5" /> },
          { label: "المعطّلون", value: stats.inactiveSuppliers, color: "text-red-500", icon: <XCircle className="h-3.5 w-3.5" /> },
          { label: "إجمالي المبيعات", value: stats.totalSales.toLocaleString("ar-EG"), color: "text-foreground", icon: <BarChart2 className="h-3.5 w-3.5" /> },
          { label: "العمولة الإجمالية", value: `${stats.totalCommission.toLocaleString("ar-EG")} ج.م`, color: "text-primary", icon: <Wallet className="h-3.5 w-3.5" /> },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
            <span className="text-muted-foreground">{s.icon}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
            <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو ID أو الشركة..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">معطّل</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[180px] max-w-[200px]">
              <Input placeholder="نوع النشاط..." value={businessFilter}
                onChange={(e) => setBusinessFilter(e.target.value)} />
            </div>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="oldest">الأقدم</SelectItem>
                <SelectItem value="most_sold">الأكثر مبيعاً</SelectItem>
                <SelectItem value="most_preferred">الأعلى تقييماً</SelectItem>
                <SelectItem value="highest_stock">الأعلى مخزوناً</SelectItem>
                <SelectItem value="highest_returns">الأكثر مرتجعات</SelectItem>
                <SelectItem value="lowest_returns">الأقل مرتجعات</SelectItem>
                <SelectItem value="most_products">الأكثر منتجات</SelectItem>
                <SelectItem value="highest_commission">الأعلى عمولة</SelectItem>
                <SelectItem value="lowest_commission">الأقل عمولة</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground gap-1">
                <X className="h-3.5 w-3.5" />مسح الفلاتر
              </Button>
            )}
            <span className="text-sm text-muted-foreground mr-auto">
              {filteredAndSorted.length} مورد
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAndSorted.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا يوجد موردون مطابقون للفلاتر المحددة</p>
          </div>
        ) : (
          filteredAndSorted.map((supplier) => {
            const supplierProducts = products.filter(p => p.supplier.id === supplier.id);
            const activeCount = supplierProducts.filter(p => p.status === "active").length;
            const hiddenCount = supplierProducts.filter(p => p.status === "hidden").length;
            const outOfStock = supplierProducts.filter(p => p.quantity < 5).length;
            const lowStock = supplierProducts.filter(p => p.status === "active" && p.quantity >= 5 && p.quantity <= 15).length;
            const totalSold = supplierProducts.reduce((sum, p) => sum + (p.sales || 0), 0);
            const totalCommission = supplierProducts.reduce((sum, p) => sum + (p.commission || 0), 0);
            const isActive = supplier.status === 1;

            return (
              <Card key={supplier.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={supplier.image} alt={supplier.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{supplier.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="font-bold text-sm truncate">{supplier.name}</h3>
                        <Badge variant={isActive ? "default" : "destructive"}
                          className={`${isActive ? "bg-green-500 hover:bg-green-600" : ""} shrink-0 text-[10px] px-1.5 py-0 h-4`}>
                          {isActive ? "نشط" : "معطل"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{supplier.companyName}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0 space-y-2">
                  {/* Commission Card */}
                  <div className="bg-gradient-to-l from-emerald-500 to-green-500 rounded-lg p-3 text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium opacity-80">العمولة</p>
                        <p className="text-lg font-bold">{totalCommission.toLocaleString()} <span className="text-xs font-normal">ج.م</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.round(supplier.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium">{supplier.averageRating}</span>
                    <span className="text-[10px] text-muted-foreground mr-auto">{totalSold} مبيعة</span>
                  </div>

                  {/* Products */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">المنتجات</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded px-2 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                        <span className="text-[10px] text-green-700 font-medium">نشطة</span>
                        <span className="mr-auto text-[11px] font-bold text-green-800 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">{activeCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-600 font-medium">غير نشطة</span>
                        <span className="mr-auto text-[11px] font-bold text-slate-700 bg-slate-100 dark:bg-slate-800/50 px-1.5 py-0.5 rounded">{hiddenCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded px-2 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-[10px] text-red-600 font-medium">نفدت</span>
                        <span className="mr-auto text-[11px] font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">{outOfStock}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded px-2 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[10px] text-amber-600 font-medium">وشك النفاذ</span>
                        <span className="mr-auto text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">{lowStock}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sold Products */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">المنتجات المباعة</p>
                    <div className="flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 rounded px-2 py-1.5">
                      <Package className="h-3 w-3 text-cyan-500 shrink-0" />
                      <span className="text-[10px] text-cyan-700 font-medium">عدد القطع المباعة</span>
                      <span className="mr-auto text-[11px] font-bold text-cyan-800 bg-cyan-100 dark:bg-cyan-900/50 px-1.5 py-0.5 rounded">{totalSold}</span>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">الطلبات</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded px-2 py-1.5">
                        <ShoppingCart className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="text-[10px] text-blue-700 font-medium">جديدة</span>
                        <span className="mr-auto text-[11px] font-bold text-blue-800 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">{supplier.newOrders}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded px-2 py-1.5">
                        <ClipboardList className="h-3 w-3 text-purple-500 shrink-0" />
                        <span className="text-[10px] text-purple-700 font-medium">مجهزة</span>
                        <span className="mr-auto text-[11px] font-bold text-purple-800 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded">{supplier.preparedOrders}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded px-2 py-1.5">
                        <TruckIcon className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-emerald-700 font-medium">مسلمة</span>
                        <span className="mr-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">{supplier.deliveredOrders}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded px-2 py-1.5">
                        <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                        <span className="text-[10px] text-red-600 font-medium">ملغية</span>
                        <span className="mr-auto text-[11px] font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">{supplier.cancelledOrders}</span>
                      </div>
                    </div>
                  </div>

                  {/* Returns */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">المرتجعات</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded px-2 py-1.5">
                        <RotateCcw className="h-3 w-3 text-orange-500 shrink-0" />
                        <span className="text-[10px] text-orange-700 font-medium">طلبات مرتجعة</span>
                        <span className="mr-auto text-[11px] font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded">{supplier.returnedOrders}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded px-2 py-1.5">
                        <PackageX className="h-3 w-3 text-orange-500 shrink-0" />
                        <span className="text-[10px] text-orange-700 font-medium">منتجات مرتجعة</span>
                        <span className="mr-auto text-[11px] font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded">{supplier.returnedPieces}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded px-2 py-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="text-[10px] text-emerald-700 font-medium">منتجات مقبولة</span>
                        <span className="mr-auto text-[11px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded">{supplier.acceptedReturns}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded px-2 py-1.5">
                        <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                        <span className="text-[10px] text-red-600 font-medium">منتجات مرفوضة</span>
                        <span className="mr-auto text-[11px] font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">{supplier.rejectedReturns}</span>
                      </div>
                    </div>
                  </div>

                  {/* Balances */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">الرصيد</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 rounded px-2 py-1.5">
                        <Wallet className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-[10px] text-primary font-medium">رصيد مبيعات</span>
                        <span className="mr-auto text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{supplier.salesBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded px-2 py-1.5">
                        <RotateCcw className="h-3 w-3 text-orange-500 shrink-0" />
                        <span className="text-[10px] text-orange-600 font-medium">رصيد المرتجعات</span>
                        <span className="mr-auto text-[11px] font-bold text-orange-700 bg-orange-100 dark:bg-orange-900/50 px-1.5 py-0.5 rounded">{supplier.returnsBalance.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div className="flex gap-1.5">
                    <a href={`tel:${supplier.phone}`}
                      className="flex-1 flex items-center justify-center h-7 rounded-md border bg-background hover:bg-muted transition-colors">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${supplier.whatsappNumber?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center h-7 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(supplier.companyName)}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center h-7 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors">
                      <PhoneCall className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Switch + Detail */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Switch checked={isActive} onCheckedChange={() => adminStore.toggleSupplierStatus(supplier.id)} />
                      <span className="text-[10px] text-muted-foreground">{isActive ? "مفعّل" : "معطّل"}</span>
                    </div>
                    <div className="flex-1" />
                    <Link href={`/suppliers/${supplier.id}`}>
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline cursor-pointer">
                        التفاصيل <ArrowLeft className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
