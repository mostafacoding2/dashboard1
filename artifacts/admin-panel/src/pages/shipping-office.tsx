import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Building2, MapPin, Phone, MapPinned, ExternalLink, Pencil, Trash2, Copy, Download, Printer, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    id: "OFF-001",
    officeName: "مكتب المعادي",
    location: "https://maps.google.com/?q=29.9582,31.2523",
    address: "شارع النيل، المعادي، القاهرة",
    managerName: "أحمد محمد",
    managerPhone: "01012345671",
    internalShipping: 25,
    branches: [
      { name: "فرع المعادي", phone: "01012345672" },
      { name: "فرع حلوان", phone: "01012345673" },
    ],
    logo: "https://picsum.photos/seed/office-mokattam/200/200",
    notes: "مكتب رئيسي - يخدم منطقة جنوب القاهرة",
    status: "active",
  },
  {
    id: "OFF-002",
    officeName: "مكتب الدقي",
    location: "https://maps.google.com/?q=30.0468,31.2098",
    address: "شارع مصطفى النحاس، الدقي، الجيزة",
    managerName: "خالد محمود",
    managerPhone: "01012345674",
    internalShipping: 15,
    branches: [
      { name: "فرع الدقي", phone: "01012345675" },
    ],
    logo: "https://picsum.photos/seed/office-doqqi/200/200",
    notes: "",
    status: "active",
  },
  {
    id: "OFF-003",
    officeName: "مكتب مدينة نصر",
    location: "",
    address: "شارع عبد اللطيف بغدادي، مدينة نصر، القاهرة",
    managerName: "سارة أحمد",
    managerPhone: "01012345676",
    internalShipping: 20,
    branches: [
      { name: "فرع مدينة نصر", phone: "01012345677" },
      { name: "فرع مصر الجديدة", phone: "01012345678" },
      { name: "فرع العباسية", phone: "01012345679" },
    ],
    logo: "https://picsum.photos/seed/office-nasr/200/200",
    notes: "يوجد خدمة توصيل للمناطق القريبة",
    status: "active",
  },
  {
    id: "OFF-004",
    officeName: "مكتب الإسكندرية",
    location: "https://maps.google.com/?q=31.2001,29.9187",
    address: "شارع سيدي جابر، الإسكندرية",
    managerName: "محمد حسن",
    managerPhone: "01012345680",
    internalShipping: 30,
    branches: [
      { name: "فرع سيدي جابر", phone: "01012345681" },
    ],
    logo: "https://picsum.photos/seed/office-alex/200/200",
    notes: "يغلق يوم الجمعة",
    status: "inactive",
  },
  {
    id: "OFF-005",
    officeName: "مكتب المنصورة",
    location: "",
    address: "شارع الجيش، المنصورة، الدقهلية",
    managerName: "فاطمة علي",
    managerPhone: "01012345682",
    internalShipping: 10,
    branches: [
      { name: "فرع المنصورة", phone: "01012345683" },
      { name: "فرع طلخا", phone: "01012345684" },
    ],
    logo: "https://picsum.photos/seed/office-mansoura/200/200",
    notes: "",
    status: "active",
  },
];

export default function ShippingOffice() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("status");
  const [minBranches, setMinBranches] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [phoneFilter, setPhoneFilter] = useState<string>("");
  const [deletingOffice, setDeletingOffice] = useState<ShippingOfficeData | null>(null);
  const [editingOffice, setEditingOffice] = useState<ShippingOfficeData | null>(null);
  const [offices, setOffices] = useState<ShippingOfficeData[]>(mockOffices);

  const toggleStatus = (id: string) => {
    setOffices(prev => prev.map(o => o.id === id ? { ...o, status: o.status === "active" ? "inactive" : "active" } : o));
  };

  const filteredOffices = useMemo(() => {
    return offices.filter(o => {
      const matchesSearch = !search || o.officeName.includes(search) || o.managerName.includes(search) || o.address.includes(search) || o.id.includes(search);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      const matchesManager = !managerFilter || o.managerName.includes(managerFilter);
      const matchesPhone = !phoneFilter || o.managerPhone.includes(phoneFilter) || o.branches.some(b => b.phone.includes(phoneFilter));
      const matchesBranches = !minBranches || o.branches.length >= Number(minBranches);
      return matchesSearch && matchesStatus && matchesManager && matchesPhone && matchesBranches;
    }).sort((a, b) => {
      switch (sortBy) {
        case "status": return a.status === "active" ? -1 : 1;
        case "branches": return b.branches.length - a.branches.length;
        default: return 0;
      }
    });
  }, [search, statusFilter, sortBy, minBranches, managerFilter, phoneFilter, offices]);

  const stats = useMemo(() => ({
    total: offices.length,
    totalBranches: offices.reduce((s, o) => s + o.branches.length, 0),
    active: offices.filter(o => o.status === "active").length,
    inactive: offices.filter(o => o.status === "inactive").length,
  }), [offices]);

  const exportToExcel = () => {
    const data = filteredOffices.map(o => ({
      "الكود": o.id,
      "اسم المكتب": o.officeName,
      "العنوان": o.address,
      "المدير": o.managerName,
      "رقم المدير": o.managerPhone,
      "الشحن الداخلي": o.internalShipping,
      "عدد الفروع": o.branches.length,
      "الحالة": o.status === "active" ? "نشط" : "غير نشط",
      "ملاحظات": o.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "مكاتب الشحن");
    XLSX.writeFile(wb, "shipping-offices.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Shipping Offices Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 28);
    autoTable(doc, {
      startY: 35,
      head: [["ID", "Office Name", "Address", "Manager", "Phone", "Internal Shipping", "Branches", "Status", "Notes"]],
      body: filteredOffices.map(o => [
        o.id,
        o.officeName,
        o.address,
        o.managerName,
        o.managerPhone,
        `${o.internalShipping} EGP`,
        o.branches.length.toString(),
        o.status === "active" ? "Active" : "Inactive",
        o.notes,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
    doc.save("shipping-offices.pdf");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">مكاتب الشحن</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => setLocation("/shipping-office/add")}>
            <Plus className="h-4 w-4 ml-1.5" />
            إضافة مكتب
          </Button>
          <Button variant="outline" size="sm" onClick={exportToExcel}>
            <Download className="h-4 w-4 ml-1.5" />
            تصدير Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Printer className="h-4 w-4 ml-1.5" />
            تصدير PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المكاتب</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الفروع</p>
              <p className="text-lg font-bold">{stats.totalBranches}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">نشط</p>
              <p className="text-lg font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">غير نشط</p>
              <p className="text-lg font-bold text-red-600">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">الفلاتر</span>
            {(statusFilter !== "all" || search || managerFilter || phoneFilter || minBranches) && (
              <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 text-red-500" onClick={() => {
                setSearch(""); setStatusFilter("all"); setSortBy("status"); setMinBranches(""); setManagerFilter(""); setPhoneFilter("");
              }}>
                مسح الكل
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9 h-8 text-xs" />
            </div>
            <Input placeholder="اسم المدير" value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)} className="w-[120px] h-8 text-xs" />
            <Input placeholder="رقم الهاتف" value={phoneFilter}
              onChange={(e) => setPhoneFilter(e.target.value)} className="w-[120px] h-8 text-xs" dir="ltr" />
            <Input type="number" placeholder="اقل عدد فروع" value={minBranches}
              onChange={(e) => setMinBranches(e.target.value)} className="w-[120px] h-8 text-xs" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">الحالة</SelectItem>
                <SelectItem value="branches">عدد الفروع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offices List */}
      <div className="space-y-3">
        {filteredOffices.map((office) => (
          <Card key={office.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-4">
                <Avatar className="h-14 w-14 rounded-xl flex-shrink-0">
                  {office.logo ? (
                    <img src={office.logo} alt={office.officeName} className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-lg rounded-xl">
                      {office.officeName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base">{office.officeName}</h3>
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">{office.id}</Badge>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => navigator.clipboard.writeText(office.id)}>
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{office.managerName}</span>
                        </div>
                        <div className="flex items-center gap-1" dir="ltr">
                          <Phone className="h-3 w-3" />
                          <span>{office.managerPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(office.id)}
                          className={`relative h-6 w-10 rounded-full transition-colors ${
                            office.status === "active" ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm border transition-transform ${
                            office.status === "active" ? "translate-x-4 border-green-600" : "translate-x-0 border-gray-400"
                          }`} />
                        </button>
                        <span className={`text-[11px] font-semibold min-w-[48px] ${office.status === "active" ? "text-green-600" : "text-red-600"}`}>
                          {office.status === "active" ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" onClick={() => setLocation(`/shipping-office/${office.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500" onClick={() => setEditingOffice(office)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDeletingOffice(office)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {office.address && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{office.address}</span>
                      </div>
                    )}
                    {office.location && (
                      <a href={office.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                        <MapPinned className="h-3 w-3 flex-shrink-0" />
                        <span>الموقع الجغرافي</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {office.internalShipping > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="text-[10px]">الشحن الداخلي:</span>
                      <span className="font-semibold text-amber-600">{office.internalShipping} ج.م</span>
                    </div>
                  )}
                  {office.branches.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {office.branches.map((b, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" />
                          {b.name}
                          <span dir="ltr" className="font-mono">{b.phone}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {office.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">"{office.notes}"</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredOffices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
            <p>لا توجد مكاتب شحن</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOffice} onOpenChange={() => setEditingOffice(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تعديل المكتب</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                {editingOffice?.logo ? (
                  <img src={editingOffice.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                    {editingOffice?.officeName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold">{editingOffice?.officeName}</p>
                <p className="text-xs text-muted-foreground font-mono">{editingOffice?.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted rounded-lg p-2">
                <p className="text-muted-foreground">المدير</p>
                <p className="font-semibold">{editingOffice?.managerName}</p>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-muted-foreground">رقم المدير</p>
                <p className="font-semibold" dir="ltr">{editingOffice?.managerPhone}</p>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-muted-foreground">الحالة</p>
                <p className={`font-semibold ${editingOffice?.status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {editingOffice?.status === "active" ? "نشط" : "غير نشط"}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-muted-foreground">الفروع</p>
                <p className="font-semibold">{editingOffice?.branches.length}</p>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-muted-foreground">الشحن الداخلي</p>
                <p className="font-semibold text-amber-600">{editingOffice?.internalShipping} ج.م</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingOffice(null)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              setEditingOffice(null);
              setLocation(`/shipping-office/edit/${editingOffice?.id}`);
            }}>
              <Pencil className="h-3.5 w-3.5 ml-1.5" />
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingOffice} onOpenChange={() => setDeletingOffice(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف المكتب</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف <span className="font-semibold">{deletingOffice?.officeName}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingOffice(null)}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              setOffices(prev => prev.filter(o => o.id !== deletingOffice?.id));
              setDeletingOffice(null);
            }}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
