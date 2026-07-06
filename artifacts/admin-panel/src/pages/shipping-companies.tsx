import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Download, Printer, Building2, Truck, Package, DollarSign, Plus, Pencil, Eye, Trash2, AlertTriangle, MapPinned, Phone, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ShippingCompanies() {
  const [, setLocation] = useLocation();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deletingCompany, setDeletingCompany] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", managerName: "", managerPhone: "", coverage: "", country: "", address: "", latitude: "", longitude: "" });

  const [companiesList, setCompaniesList] = useState([
    { id: "SHP-001", name: "شركة سمسا", phone: "01012345678", orders: 150, revenue: 25000, status: "active", coverage: "جميع المحافظات", managerName: "أحمد محمد", managerPhone: "01011111111", country: "مصر", logo: "https://ui-avatars.com/api/?name=سمسا&background=0369a1&color=fff&bold=true&size=128", address: "شارع النيل - مبنى الإذاعة والتلفزيون، القاهرة", latitude: 30.0444, longitude: 31.2357, governorates: [{ name: "القاهرة", areas: [{ name: "مدينة نصر", price: 30 }, { name: "المعادي", price: 25 }, { name: "الزمالك", price: 20 }, { name: "وسط البلد", price: 22 }] }, { name: "الجيزة", areas: [{ name: "الدقي", price: 25 }, { name: "المهندسين", price: 20 }, { name: "الهرم", price: 28 }] }, { name: "الإسكندرية", areas: [{ name: "سيدي جابر", price: 35 }, { name: "المحرم بك", price: 30 }] }, { name: "الدقهلية", areas: [{ name: "المنصورة", price: 20 }] }, { name: "المنوفية", areas: [{ name: "شبين الكوم", price: 18 }] }], branches: [{ name: "فرع القاهرة الرئيسي", phone: "01012345678", country: "مصر", governorate: "القاهرة", address: "شارع النيل - مبنى ١٢" }, { name: "فرع الجيزة", phone: "01012345679", country: "مصر", governorate: "الجيزة", address: "شارع الهرم - مبنى ٨" }, { name: "فرع الإسكندرية", phone: "01012345680", country: "مصر", governorate: "الإسكندرية", address: "شارع البحر - مبنى ٥" }, { name: "فرع الرياض", phone: "01012345681", country: "السعودية", governorate: "الرياض", address: "طريق الملك فهد - حي العليا" }, { name: "فرع جدة", phone: "01012345682", country: "السعودية", governorate: "جدة", address: "شارع التحلية - مبنى ٢٠" }, { name: "فرع المنصورة", phone: "01012345683", country: "مصر", governorate: "الدقهلية", address: "شارع الجيش - المنصورة" }, { name: "فرع شبين الكوم", phone: "01012345684", country: "مصر", governorate: "المنوفية", address: "شارع سعد زغلول - شبين الكوم" }, { name: "فرع أكتوبر", phone: "01012345685", country: "مصر", governorate: "الجيزة", address: "حي أكتوبر - المجاورة الأولى" }] },
    { id: "SHP-002", name: "شركة آرامكس", phone: "01098765432", orders: 120, revenue: 20000, status: "active", coverage: "القاهرة والجيزة", managerName: "خالد محمود", managerPhone: "01022222222", country: "مصر", logo: "https://ui-avatars.com/api/?name=آرامكس&background=16a34a&color=fff&bold=true&size=128", governorates: [{ name: "القاهرة", areas: [{ name: "مدينة نصر", price: 25 }, { name: "المعادي", price: 20 }] }, { name: "الجيزة", areas: [{ name: "الدقي", price: 22 }, { name: "المهندسين", price: 18 }] }], branches: [{ name: "فرع الدقي", phone: "01098765432", country: "مصر", governorate: "الجيزة", address: "شارع مصطفى النحاس" }, { name: "فرع المهندسين", phone: "01098765433", country: "مصر", governorate: "الجيزة", address: "شارع جامعة الدول" }, { name: "فرع مدينة نصر", phone: "01098765434", country: "مصر", governorate: "القاهرة", address: "شارع عباس العقاد" }, { name: "فرع المعادي", phone: "01098765435", country: "مصر", governorate: "القاهرة", address: "شارع ٢٥٧ - المعادي" }] },
    { id: "SHP-003", name: "شركة فيديكس", phone: "01055555555", orders: 80, revenue: 15000, status: "active", coverage: "الإسكندرية", managerName: "سارة أحمد", managerPhone: "01033333333", country: "مصر", logo: "https://ui-avatars.com/api/?name=فيديكس&background=7c3aed&color=fff&bold=true&size=128", governorates: [{ name: "الإسكندرية", areas: [{ name: "سيدي جابر", price: 30 }, { name: "المحرم بك", price: 25 }] }, { name: "البحيرة", areas: [{ name: "دمنهور", price: 20 }] }], branches: [{ name: "فرع سيدي جابر", phone: "01055555555", country: "مصر", governorate: "الإسكندرية", address: "شارع سيدي جابر" }, { name: "فرع المحرم بك", phone: "01055555556", country: "مصر", governorate: "الإسكندرية", address: "شارع المحرم بك" }, { name: "فرع دمنهور", phone: "01055555557", country: "مصر", governorate: "البحيرة", address: "شارع الجمهورية - دمنهور" }, { name: "فرع كفر الدوار", phone: "01055555558", country: "مصر", governorate: "البحيرة", address: "شارع السوق - كفر الدوار" }] },
    { id: "SHP-004", name: "شركة DHL", phone: "01066666666", orders: 95, revenue: 18000, status: "inactive", coverage: "جميع المحافظات", managerName: "محمد حسن", managerPhone: "01044444444", country: "ألمانيا", logo: "https://ui-avatars.com/api/?name=DHL&background=dc2626&color=fff&bold=true&size=128", governorates: [{ name: "الرياض", areas: [{ name: "حي العليا", price: 40 }, { name: "الملز", price: 35 }] }, { name: "جدة", areas: [{ name: "شارع التحلية", price: 38 }] }, { name: "الدمام", areas: [{ name: "الخبر", price: 32 }] }], branches: [{ name: "فرع الرياض", phone: "01066666666", country: "السعودية", governorate: "الرياض", address: "شارع الملك فهد" }, { name: "فرع جدة", phone: "01066666667", country: "السعودية", governorate: "جدة", address: "شارع التحلية" }, { name: "فرع الدمام", phone: "01066666668", country: "السعودية", governorate: "الدمام", address: "شارع الظهران" }] },
    { id: "SHP-005", name: "شركة جانيت", phone: "01077777777", orders: 60, revenue: 10000, status: "active", coverage: "الدقهلية", managerName: "فاطمة علي", managerPhone: "01055555555", country: "مصر", logo: "https://ui-avatars.com/api/?name=جانيت&background=ea580c&color=fff&bold=true&size=128", governorates: [{ name: "الدقهلية", areas: [{ name: "المنصورة", price: 15 }, { name: "طلخا", price: 12 }] }, { name: "الغربية", areas: [{ name: "طنطا", price: 18 }] }], branches: [{ name: "فرع المنصورة", phone: "01077777777", country: "مصر", governorate: "الدقهلية", address: "شارع الجيش" }, { name: "فرع طلخا", phone: "01077777778", country: "مصر", governorate: "الدقهلية", address: "شارع السوق - طلخا" }, { name: "فرع طنطا", phone: "01077777779", country: "مصر", governorate: "الغربية", address: "شارع البحر - طنطا" }, { name: "فرع المحلة", phone: "01077777780", country: "مصر", governorate: "الغربية", address: "شارع شكري القوتلي - المحلة" }] },
  ]);

  const toggleStatus = (id: string) => {
    setCompaniesList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
  };

  const companies = useMemo(() => {
    return companiesList.filter(c => {
      const matchesSearch = !search || c.name.includes(search) || c.id.includes(search);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesManager = !managerFilter || c.managerName.includes(managerFilter);
      const matchesPhone = !phoneFilter || c.managerPhone.includes(phoneFilter);
      const matchesCountry = countryFilter === "all" || c.country === countryFilter;
      return matchesSearch && matchesStatus && matchesManager && matchesPhone && matchesCountry;
    }).sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name, "ar");
        case "orders": return b.orders - a.orders;
        case "revenue": return b.revenue - a.revenue;
        default: return 0;
      }
    });
  }, [search, statusFilter, managerFilter, phoneFilter, countryFilter, sortBy]);

  const stats = useMemo(() => ({
    total: companies.length,
    active: companies.filter(c => c.status === "active").length,
    inactive: companies.filter(c => c.status === "inactive").length,
    totalOrders: companies.reduce((s, c) => s + c.orders, 0),
    totalRevenue: companies.reduce((s, c) => s + c.revenue, 0),
  }), [companies]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">شركات الشحن</h1>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => setLocation("/shipping-companies/add")}>
            <Plus className="h-4 w-4 ml-1.5" />
            إضافة شركة
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1.5" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1.5" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي الشركات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">النشطة</span>
          <span className="text-base font-bold text-green-500">{stats.active}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">المعطّلة</span>
          <span className="text-base font-bold text-red-500">{stats.inactive}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Package className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">إجمالي الطلبات</span>
          <span className="text-base font-bold text-blue-500">{stats.totalOrders}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">إجمالي الإيرادات</span>
          <span className="text-base font-bold text-primary">{stats.totalRevenue.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">الفلاتر</span>
            {(statusFilter !== "all" || search || managerFilter || phoneFilter || countryFilter !== "all") && (
              <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 text-red-500" onClick={() => {
                setSearch(""); setStatusFilter("all"); setManagerFilter(""); setPhoneFilter(""); setCountryFilter("all"); setSortBy("name");
              }}>
                مسح الكل
              </Button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">بحث</label>
              <div className="relative">
                <Search className="absolute right-2 top-2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="بالاسم..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="pr-7 h-8 text-[10px]" />
              </div>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">اسم المدير</label>
              <Input placeholder="أدخل اسم المدير" value={managerFilter}
                onChange={(e) => setManagerFilter(e.target.value)} className="h-8 text-[10px]" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">رقم المدير</label>
              <Input placeholder="رقم المدير" value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)} className="h-8 text-[10px]" dir="ltr" />
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">الدولة</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="مصر">مصر</SelectItem>
                  <SelectItem value="ألمانيا">ألمانيا</SelectItem>
                  <SelectItem value="السعودية">السعودية</SelectItem>
                  <SelectItem value="الإمارات">الإمارات</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">الحالة</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">معطّل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[8px] text-muted-foreground mb-0.5 block">ترتيب</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-[10px]">
                  <SelectValue placeholder="ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="orders">الأكثر طلباً</SelectItem>
                  <SelectItem value="revenue">الأعلى إيرادات</SelectItem>
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
                <TableHead className="text-right">الشركة</TableHead>
                <TableHead className="text-right">المدير</TableHead>
                <TableHead className="text-right">رقم المدير</TableHead>
                <TableHead className="text-right">الطلبات</TableHead>
                <TableHead className="text-right">الإيرادات</TableHead>
                <TableHead className="text-right">المحافظات والمناطق</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setLocation(`/shipping-companies/${company.id}`)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 rounded-lg">
                        {company.logo && !imgErrors[company.id] ? (
                          <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-lg" onError={() => setImgErrors(prev => ({ ...prev, [company.id]: true }))} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs rounded-lg">
                            {company.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{company.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{company.id}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{company.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold">{company.managerName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-mono">{company.managerPhone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-bold text-blue-600">{company.orders}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-bold text-primary">{company.revenue.toLocaleString("ar-EG")} ج.م</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {company.branches ? company.branches.slice(0, 3).map((b: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                          {b.governorate}
                        </Badge>
                      )) : company.governorates?.slice(0, 4).map((g: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 px-1.5 py-0">
                          {typeof g === "string" ? g : g.name}
                        </Badge>
                      ))}
                      {((company.branches?.length || company.governorates?.length) > 3) && (
                        <span className="text-[9px] text-muted-foreground">+{((company.branches?.length || company.governorates?.length) - 3)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleStatus(company.id); }}
                        className={`relative h-6 w-10 rounded-full transition-colors ${
                          company.status === "active" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm border transition-transform ${
                          company.status === "active" ? "translate-x-4 border-green-600" : "translate-x-0 border-gray-400"
                        }`} />
                      </button>
                      <span className={`text-[11px] font-semibold min-w-[48px] ${company.status === "active" ? "text-green-600" : "text-red-600"}`}>
                        {company.status === "active" ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" onClick={(e) => { e.stopPropagation(); setLocation(`/shipping-companies/${company.id}`); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => {
                        e.stopPropagation();
                        setEditingCompany(company);
                        setEditForm({
                          name: company.name, phone: company.phone,
                          managerName: company.managerName, managerPhone: company.managerPhone,
                          coverage: company.coverage, country: company.country,
                          address: company.address || "", latitude: company.latitude?.toString() || "", longitude: company.longitude?.toString() || "",
                        });
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={(e) => { e.stopPropagation(); setDeletingCompany(company); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Detail Card */}
      {selectedCompany && (
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <CardContent className="p-0">
            <div className="bg-gradient-to-l from-primary to-primary/80 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-xl border-2 border-white/30 flex-shrink-0">
                  {selectedCompany.logo && !imgErrors[selectedCompany.id] ? (
                    <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-full h-full object-cover rounded-xl" onError={() => setImgErrors(prev => ({ ...prev, [selectedCompany.id]: true }))} />
                  ) : (
                    <AvatarFallback className="bg-white/20 text-white font-bold rounded-xl text-lg">{selectedCompany.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold truncate">{selectedCompany.name}</h3>
                  <p className="text-xs text-white/70">{selectedCompany.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8 text-xs gap-1" onClick={() => { setEditingCompany(selectedCompany); setEditForm({
                  name: selectedCompany.name, phone: selectedCompany.phone,
                  managerName: selectedCompany.managerName, managerPhone: selectedCompany.managerPhone,
                  coverage: selectedCompany.coverage, country: selectedCompany.country,
                  address: selectedCompany.address || "", latitude: selectedCompany.latitude?.toString() || "", longitude: selectedCompany.longitude?.toString() || "",
                }); }}>
                  <Pencil className="h-4 w-4" />
                  تعديل
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-red-500/30 h-8 text-xs gap-1" onClick={() => setDeletingCompany(selectedCompany)}>
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Manager Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1.5">المدير</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-semibold">{selectedCompany.managerName}</span>
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1.5">رقم المدير</p>
                  <div className="flex items-center gap-2" dir="ltr">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base font-semibold">{selectedCompany.managerPhone}</span>
                    <a href={`tel:${selectedCompany.managerPhone}`} className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="اتصال">
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <a href={`https://wa.me/${selectedCompany.managerPhone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="واتساب">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Address & Location */}
              <div className="bg-card border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1.5">العنوان التفصيلي</p>
                <p className="text-base mb-2">{selectedCompany.address || "—"}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{selectedCompany.country}</span>
                  </div>
                  {selectedCompany.latitude && selectedCompany.longitude && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <a href={`https://maps.google.com/?q=${selectedCompany.latitude},${selectedCompany.longitude}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="فتح الموقع">
                        <MapPinned className="h-4 w-4" />
                      </a>
                      <span className="text-xs font-mono text-muted-foreground" dir="ltr">{selectedCompany.latitude}، {selectedCompany.longitude}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Governorates with Areas & Prices */}
              {selectedCompany.governorates && selectedCompany.governorates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">المحافظات والمناطق والأسعار</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedCompany.governorates.map((g: any, i: number) => {
                      const govName = typeof g === "string" ? g : g.name;
                      const areas = typeof g === "string" ? [] : g.areas || [];
                      return (
                        <div key={i} className="border rounded-xl p-4 bg-card">
                          <p className="text-sm font-bold text-blue-700 mb-2">{govName}</p>
                          {areas.length > 0 ? (
                            <div className="space-y-1.5">
                              {areas.map((a: any, j: number) => (
                                <div key={j} className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{a.name}</span>
                                  <span className="font-semibold text-primary">{a.price} ج.م</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">—</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Branches */}
              {selectedCompany.branches && selectedCompany.branches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">الفروع ({selectedCompany.branches.length})</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCompany.branches.map((b: any, i: number) => (
                      <div key={i} className="border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          {b.phone && (
                            <div className="flex items-center gap-0.5">
                              <a href={`tel:${b.phone}`} className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="اتصال">
                                <Phone className="h-3 w-3" />
                              </a>
                              <a href={`https://wa.me/${b.phone.replace(/^\+?0/, '20')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="واتساب">
                                <MessageCircle className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.address}</p>
                        {b.phone && <p className="text-xs font-mono text-muted-foreground mt-1" dir="ltr">{b.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">الحالة:</span>
                <button
                  type="button"
                  onClick={() => { toggleStatus(selectedCompany.id); setSelectedCompany((prev: any) => prev ? { ...prev, status: prev.status === "active" ? "inactive" : "active" } : null); }}
                  className={`relative h-6 w-10 rounded-full transition-colors ${selectedCompany.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm border transition-transform ${selectedCompany.status === "active" ? "translate-x-4 border-green-600" : "translate-x-0 border-gray-400"}`} />
                </button>
                <span className={`text-sm font-semibold ${selectedCompany.status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {selectedCompany.status === "active" ? "نشط" : "غير نشط"}
                </span>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deletingCompany} onOpenChange={() => setDeletingCompany(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف شركة الشحن</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              هل أنت متأكد من حذف الشركة <span className="font-semibold">{deletingCompany?.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingCompany(null)}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              if (deletingCompany) {
                setCompaniesList(prev => prev.filter(c => c.id !== deletingCompany.id));
                setSelectedCompany((prev: any) => prev?.id === deletingCompany.id ? null : prev);
                setDeletingCompany(null);
              }
            }}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">خط العرض (Latitude)</label>
                <Input value={editForm.latitude} onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })} className="h-8 text-xs" dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">خط الطول (Longitude)</label>
                <Input value={editForm.longitude} onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })} className="h-8 text-xs" dir="ltr" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingCompany(null)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              if (editingCompany) {
                const updated: any = { ...editForm, ...(editForm.latitude ? { latitude: Number(editForm.latitude) } : {}), ...(editForm.longitude ? { longitude: Number(editForm.longitude) } : {}) };
                setCompaniesList(prev => prev.map(c =>
                  c.id === editingCompany.id ? { ...c, ...updated } : c
                ));
                setSelectedCompany((prev: any) => prev?.id === editingCompany.id ? { ...prev, ...updated } : prev);
                setEditingCompany(null);
              }
            }}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}