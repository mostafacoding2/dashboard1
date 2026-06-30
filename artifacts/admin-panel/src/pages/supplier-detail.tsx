import { useParams, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useSuppliers, useProducts, adminStore } from "@/store";
import type { Product } from "@/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRight, Star, Phone, MessageCircle, Mail,
  Building2, Briefcase, Globe, Wallet, CreditCard, Calendar,
  PackageX, ShoppingCart, ClipboardList, TruckIcon, XCircle, RotateCcw, CheckCircle2, Package,
  MapPin, Clock, MessageSquare, ArrowLeft, Bell, Search, Eye, Edit, ChevronDown, X, Trash2, TrendingUp, Upload
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

function avgRating(reviews: { stars: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const suppliers = useSuppliers();
  const products = useProducts();
  const supplier = suppliers.find(s => s.id === Number(id));
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBusiness, setEditBusiness] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editCallNumber, setEditCallNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [editWorkingHours, setEditWorkingHours] = useState("");
  const [editWalletNumber, setEditWalletNumber] = useState("");
  const [editInstapay, setEditInstapay] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productSortBy, setProductSortBy] = useState("newest");

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

  const supplierProducts = products.filter(p => p.supplier.id === supplier.id);
  const activeCount = supplierProducts.filter(p => p.status === "active").length;
  const hiddenCount = supplierProducts.filter(p => p.status === "hidden").length;
  const outOfStock = supplierProducts.filter(p => p.quantity < 5).length;
  const lowStock = supplierProducts.filter(p => p.status === "active" && p.quantity >= 5 && p.quantity <= 15).length;
  const totalSold = supplierProducts.reduce((sum, p) => sum + (p.sales || 0), 0);
  const totalCommission = supplierProducts.reduce((sum, p) => sum + (p.commission || 0), 0);
  const isActive = supplier.status === 1;
  const totalProducts = supplierProducts.length;
  const totalOrders = supplier.newOrders + supplier.preparedOrders + supplier.deliveredOrders + supplier.cancelledOrders;

  const productsChartData = [
    { name: "نشطة", value: activeCount, color: "#22c55e" },
    { name: "غير نشطة", value: hiddenCount, color: "#94a3b8" },
    { name: "نفدت", value: outOfStock, color: "#ef4444" },
    { name: "وشك النفاذ", value: lowStock, color: "#f59e0b" },
  ];

  const ordersChartData = [
    { name: "جديدة", value: supplier.newOrders, color: "#3b82f6" },
    { name: "مجهزة", value: supplier.preparedOrders, color: "#a855f7" },
    { name: "مسلمة", value: supplier.deliveredOrders, color: "#10b981" },
    { name: "ملغية", value: supplier.cancelledOrders, color: "#ef4444" },
  ];

  const returnsChartData = [
    { name: "طلبات مرتجعة", value: supplier.returnedOrders, color: "#f97316" },
    { name: "منتجات مرتجعة", value: supplier.returnedPieces, color: "#fb923c" },
    { name: "منتجات مقبولة", value: supplier.acceptedReturns, color: "#10b981" },
    { name: "منتجات مرفوضة", value: supplier.rejectedReturns, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/suppliers")} className="h-9 w-9 shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{supplier.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{supplier.companyName}</p>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="px-4 py-2 bg-muted/30 border-t">
          <div className="flex items-center justify-around text-center">
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground">المنتجات</span>
              <span className="text-sm font-bold">{totalProducts}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs text-muted-foreground">الطلبات</span>
              <span className="text-sm font-bold">{totalOrders}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-xs text-muted-foreground">المرتجعات</span>
              <span className="text-sm font-bold">{supplier.returnedOrders}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">رصيد المبيعات</span>
              <span className="text-sm font-bold">{supplier.salesBalance.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span></span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs text-muted-foreground">رصيد المرتجعات</span>
              <span className="text-sm font-bold">{supplier.returnsBalance.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span></span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-muted-foreground">العمولة</span>
              <span className="text-sm font-bold text-emerald-700">{totalCommission.toLocaleString()} <span className="text-[10px] font-normal">ج.م</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Profile Card - Full Width */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg shrink-0">
                <AvatarImage src={supplier.image} alt={supplier.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">{supplier.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{supplier.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(supplier.averageRating) ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                      ))}
                      <span className="text-sm font-bold">{supplier.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isActive ? "default" : "destructive"}
                      className={`${isActive ? "bg-green-500 hover:bg-green-600" : ""} text-xs px-2 py-0.5`}>
                      {isActive ? "نشط" : "معطل"}
                    </Badge>
                    <Switch checked={isActive} onCheckedChange={() => adminStore.toggleSupplierStatus(supplier.id)} />
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditName(supplier.name);
                        setEditCompany(supplier.companyName);
                        setEditPhone(supplier.phone);
                        setEditEmail(supplier.email);
                        setEditAddress(supplier.address);
                        setEditBusiness(supplier.typeOfBusiness);
                        setEditImage(supplier.image);
                        setEditWhatsapp(supplier.whatsappNumber);
                        setEditCallNumber(supplier.callNumber);
                        setEditType(supplier.type);
                        setEditWorkingHours(supplier.workingHours);
                        setEditWalletNumber(supplier.walletNumber);
                        setEditInstapay(supplier.instapayNumber);
                        setEditOpen(true);
                      }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="destructive" size="sm" className="h-8 w-8 p-0"
                      onClick={() => {
                        if(confirm(`هل تريد حذف المورد "${supplier.name}" نهائياً؟ لن يمكن التراجع عن هذا الإجراء.`)) {
                          adminStore.removeSupplier(supplier.id);
                          setLocation("/suppliers");
                        }
                      }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate flex-1" dir="ltr">{supplier.phone}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف رقم الهاتف؟")) adminStore.updateSupplier(supplier.id, { phone: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.whatsappNumber && (
                    <div className="flex items-center gap-2 text-sm group">
                      <MessageCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="truncate flex-1" dir="ltr">{supplier.whatsappNumber}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف رقم الواتساب؟")) adminStore.updateSupplier(supplier.id, { whatsappNumber: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.email}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف البريد الإلكتروني؟")) adminStore.updateSupplier(supplier.id, { email: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.callNumber && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="truncate flex-1" dir="ltr">{supplier.callNumber}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف رقم الاتصال؟")) adminStore.updateSupplier(supplier.id, { callNumber: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.companyName && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.companyName}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف اسم الشركة؟")) adminStore.updateSupplier(supplier.id, { companyName: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.typeOfBusiness && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.typeOfBusiness}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف نوع النشاط؟")) adminStore.updateSupplier(supplier.id, { typeOfBusiness: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.type && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.type}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف النوع؟")) adminStore.updateSupplier(supplier.id, { type: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-sm group">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.address}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف العنوان؟")) adminStore.updateSupplier(supplier.id, { address: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.workingHours && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.workingHours}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف ساعات العمل؟")) adminStore.updateSupplier(supplier.id, { workingHours: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.walletNumber && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.walletNumber}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف رقم المحفظة؟")) adminStore.updateSupplier(supplier.id, { walletNumber: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.instapayNumber && (
                    <div className="flex items-center gap-2 text-sm group">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1" dir="ltr">{supplier.instapayNumber}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف رقم Instapay؟")) adminStore.updateSupplier(supplier.id, { instapayNumber: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {supplier.invitationCode && (
                    <div className="flex items-center gap-2 text-sm group">
                      <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1">{supplier.invitationCode}</span>
                      <button onClick={() => { if(confirm("هل تريد حذف كود الدعوة؟")) adminStore.updateSupplier(supplier.id, { invitationCode: "" }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Contact Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  {supplier.phone && (
                    <a href={`tel:${supplier.phone}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 h-9">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs">اتصال</span>
                      </Button>
                    </a>
                  )}
                  {supplier.whatsappNumber && (
                    <a href={`https://wa.me/${supplier.whatsappNumber?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 h-9 border-green-200 hover:bg-green-50 dark:border-green-800">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs">واتساب</span>
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 gap-2 h-9">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">محادثة</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2 h-9 border-amber-200 hover:bg-amber-50 dark:border-amber-800" onClick={() => setNotificationOpen(true)}>
                    <Bell className="h-4 w-4 text-amber-600" />
                    <span className="text-xs">إرسال إشعار</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Products Card */}
          <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation(`/suppliers/${supplier.id}/products`)}>
            <CardHeader className="p-3 pb-2 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">المنتجات</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700">نشطة</span>
                </div>
                <span className="text-sm font-bold text-green-800 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">{activeCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-xs text-slate-600">غير نشطة</span>
                </div>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded">{hiddenCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-600">نفدت</span>
                </div>
                <span className="text-sm font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">{outOfStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-amber-600">وشك النفاذ</span>
                </div>
                <span className="text-sm font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded">{lowStock}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sold Products Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-cyan-50 dark:bg-cyan-950/30 border-b border-cyan-100 dark:border-cyan-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-bold text-cyan-700">المنتجات المباعة</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-cyan-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-3 w-3 text-cyan-600" />
                  <span className="text-xs text-cyan-700">عدد القطع المباعة</span>
                </div>
                <span className="text-sm font-bold text-cyan-800 bg-cyan-100 dark:bg-cyan-900/50 px-2 py-0.5 rounded">{totalSold}</span>
              </div>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">الطلبات</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-700">جديدة</span>
                </div>
                <span className="text-sm font-bold text-blue-800 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">{supplier.newOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-purple-700">مجهزة</span>
                </div>
                <span className="text-sm font-bold text-purple-800 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">{supplier.preparedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-700">مسلمة</span>
                </div>
                <span className="text-sm font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">{supplier.deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">ملغية</span>
                </div>
                <span className="text-sm font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">{supplier.cancelledOrders}</span>
              </div>
            </CardContent>
          </Card>

          {/* Returns Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-700">المرتجعات</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-700">طلبات مرتجعة</span>
                </div>
                <span className="text-sm font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded">{supplier.returnedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageX className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-700">منتجات مرتجعة</span>
                </div>
                <span className="text-sm font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded">{supplier.returnedPieces}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-700">منتجات مقبولة</span>
                </div>
                <span className="text-sm font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">{supplier.acceptedReturns}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">منتجات مرفوضة</span>
                </div>
                <span className="text-sm font-bold text-red-700 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">{supplier.rejectedReturns}</span>
              </div>
            </CardContent>
          </Card>

          {/* Balances & Financial Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-primary">الرصيد والمالي</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary">مبيعات</span>
                </div>
                <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{supplier.salesBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600">مرتجعات</span>
                </div>
                <span className="text-sm font-bold text-orange-700 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded">{supplier.returnsBalance.toLocaleString()}</span>
              </div>
              {supplier.wallet !== undefined && supplier.wallet !== null && (
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-muted-foreground">المحفظة</span>
                  <span className="text-sm font-bold">{supplier.wallet.toLocaleString()} ج.م</span>
                </div>
              )}
              {supplier.points !== undefined && supplier.points !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">النقاط</span>
                  <span className="text-sm font-bold">{supplier.points.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-700">التواريخ</span>
                </div>
                <ArrowLeft className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {supplier.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">تاريخ الإنشاء</span>
                  <span className="text-xs font-bold">{new Date(supplier.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              )}
              {supplier.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">آخر تحديث</span>
                  <span className="text-xs font-bold">{new Date(supplier.updatedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Products Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">المنتجات</span>
                </div>
                <span className="text-xs font-bold text-green-800 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">{totalProducts}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productsChartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {productsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">الطلبات</span>
                </div>
                <span className="text-xs font-bold text-purple-800 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">{totalOrders}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35}>
                      {ordersChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Returns Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3 pb-2 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-bold text-orange-700">المرتجعات</span>
                </div>
                <span className="text-xs font-bold text-orange-800 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded">{supplier.returnedOrders}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={returnsChartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={35}>
                      {returnsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader className="p-3 pb-2 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">أحدث المنتجات</span>
                <span className="text-xs font-bold text-green-800 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded">{supplierProducts.length} منتج</span>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs"
                onClick={() => setLocation(`/suppliers/${supplier.id}/products`)}>
                عرض الكل
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="بحث بالاسم أو SKU..." value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)} className="pr-8 h-8 text-xs" />
              </div>
              <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="hidden">مخفي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={productSortBy} onValueChange={setProductSortBy}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="الترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="oldest">الأقدم</SelectItem>
                  <SelectItem value="price_high">الأعلى سعراً</SelectItem>
                  <SelectItem value="price_low">الأقل سعراً</SelectItem>
                  <SelectItem value="most_sales">الأكثر مبيعاً</SelectItem>
                </SelectContent>
              </Select>
              {(productSearch || productStatusFilter !== "all") && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1"
                  onClick={() => { setProductSearch(""); setProductStatusFilter("all"); }}>
                  <X className="h-3 w-3" />مسح
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {(() => {
              const filtered = supplierProducts.filter(p => {
                const matchesSearch = p.name.includes(productSearch) || p.sku.includes(productSearch);
                const matchesStatus = productStatusFilter === "all" || p.status === productStatusFilter;
                return matchesSearch && matchesStatus;
              }).sort((a, b) => {
                switch (productSortBy) {
                  case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  case "price_high": return b.price - a.price;
                  case "price_low": return a.price - b.price;
                  case "most_sales": return b.sales - a.sales;
                  default: return 0;
                }
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد منتجات مطابقة</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((product) => (
                    <div key={product.id}
                      className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setLocation(`/products/quick/${product.id}`)}>
                      <div className="flex items-start gap-3">
                        <img src={product.mainImage} alt={product.name} className="h-16 w-16 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm truncate">{product.name}</h4>
                            <Badge variant={product.status === "active" ? "default" : "secondary"}
                              className={`text-[10px] px-1.5 py-0 h-4 ${product.status === "active" ? "bg-green-500" : ""}`}>
                              {product.status === "active" ? "نشط" : "مخفي"}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{product.category} · {product.sku}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs">
                            <span className="font-bold text-primary">{product.price} ج.م</span>
                            <span className="text-muted-foreground">مخزون: <span className={product.quantity < 15 ? "text-destructive" : ""}>{product.quantity}</span></span>
                            <span className="text-muted-foreground">مبيعات: {product.sales}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-2.5 w-2.5 ${i < Math.round(avgRating(product.reviews)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                            ))}
                            <span className="text-[10px] text-muted-foreground mr-1">{avgRating(product.reviews).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Edit Supplier Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              تعديل بيانات المورد
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">صورة المورد</label>
              <div className="flex items-center gap-3">
                {editImage && (
                  <img src={editImage} alt="صورة المورد" className="h-14 w-14 rounded-lg object-cover border" />
                )}
                <label className="flex-1 flex items-center justify-center gap-2 h-14 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setEditImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">اختر صورة</span>
                </label>
                {editImage && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setEditImage("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">اسم المورد</label>
                <Input placeholder="اسم المورد" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">اسم الشركة</label>
                <Input placeholder="اسم الشركة" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">الهاتف</label>
                <Input placeholder="رقم الهاتف" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input placeholder="البريد الإلكتروني" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">واتساب</label>
                <Input placeholder="رقم الواتساب" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">رقم الاتصال</label>
                <Input placeholder="رقم الاتصال" value={editCallNumber} onChange={(e) => setEditCallNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input placeholder="العنوان" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">نوع النشاط</label>
                <Input placeholder="نوع النشاط" value={editBusiness} onChange={(e) => setEditBusiness(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">النوع</label>
                <Input placeholder="النوع" value={editType} onChange={(e) => setEditType(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">ساعات العمل</label>
                <Input placeholder="ساعات العمل" value={editWorkingHours} onChange={(e) => setEditWorkingHours(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">رقم المحفظة</label>
                <Input placeholder="رقم المحفظة" value={editWalletNumber} onChange={(e) => setEditWalletNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">رقم Instapay</label>
              <Input placeholder="رقم Instapay" value={editInstapay} onChange={(e) => setEditInstapay(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={() => {
              adminStore.updateSupplier(supplier.id, {
                name: editName,
                companyName: editCompany,
                phone: editPhone,
                email: editEmail,
                address: editAddress,
                typeOfBusiness: editBusiness,
                image: editImage,
                whatsappNumber: editWhatsapp,
                callNumber: editCallNumber,
                type: editType,
                workingHours: editWorkingHours,
                walletNumber: editWalletNumber,
                instapayNumber: editInstapay,
              });
              setEditOpen(false);
            }}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              إرسال إشعار
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input
                placeholder="أدخل عنوان الإشعار..."
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">الرسالة</label>
              <Textarea
                placeholder="أدخل نص الإشعار..."
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNotificationOpen(false)}>إلغاء</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => {
              console.log("Notification:", { title: notificationTitle, message: notificationMessage, supplierId: supplier.id });
              setNotificationOpen(false);
              setNotificationTitle("");
              setNotificationMessage("");
            }}>إرسال</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
