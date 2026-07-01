import { useParams, useLocation } from "wouter";
import { useEffect, useState, useMemo } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  ArrowRight, Star, Phone, MessageCircle, Mail,
  Building2, Briefcase, Globe, Wallet, CreditCard, Calendar,
  PackageX, ShoppingCart, ClipboardList, TruckIcon, XCircle, RotateCcw, CheckCircle2, Package,
  MapPin, Clock, MessageSquare, ArrowLeft, Bell, Search, Eye, Edit, ChevronDown, X, Trash2, TrendingUp, Upload, MoreHorizontal
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

  // Order filter states
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentStatus, setOrderPaymentStatus] = useState("all");
  const [orderSortBy, setOrderSortBy] = useState("newest");
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderItemsPerPage, setOrderItemsPerPage] = useState(10);
  const [supplierOrdersList, setSupplierOrdersList] = useState<any[]>([]);
  const [editingSupplierOrder, setEditingSupplierOrder] = useState<any>(null);
  const [deletingSupplierOrder, setDeletingSupplierOrder] = useState<any>(null);
  const [statusChangingSupplierOrder, setStatusChangingSupplierOrder] = useState<any>(null);
  const [shippingManifestImage, setShippingManifestImage] = useState<string | null>(null);
  const [editSupplierOrderForm, setEditSupplierOrderForm] = useState({
    customer: "",
    customerPhone: "",
    quantity: 1,
    total: 0,
    status: "",
    paymentMethod: "",
    paymentStatus: "",
  });

  const getStatusBadge = (status: string) => {
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
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "مدفوع": "bg-green-100 text-green-800",
      "غير مدفوع": "bg-red-100 text-red-800",
      "مدفوع جزئياً": "bg-yellow-100 text-yellow-800",
    };
    return <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
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

  const paymentMethods = ["كاش", "بطاقة ائتمان", "تحويل بنفي", "محفظة إلكترونية", "فودافون كاش"];
  const paymentStatuses = ["مدفوع", "غير مدفوع", "مدفوع جزئياً"];
  const customerNames = ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود", "نورا سعيد", "عمر حسين", "ريم عبد الله", "ياسر إبراهيم", "هدى عادل"];

  const supplierProducts = useMemo(
    () => (supplier ? products.filter(p => p.supplier.id === supplier.id) : []),
    [products, supplier?.id]
  );

  const supplierOrders = useMemo(() => {
    if (supplierProducts.length === 0) return [];
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const paymentStatuses = ["مدفوع", "غير مدفوع", "مدفوع جزئياً"];
    return supplierProducts.slice(0, 20).map((p, i) => {
      const qty = Math.floor(Math.random() * 5) + 1;
      return {
        id: `ORD-${1000 + i}`,
        customer: customerNames[i % customerNames.length],
        customerPhone: `0101234567${i % 10}`,
        product: p.name,
        quantity: qty,
        total: p.price * qty,
        commission: Math.floor(Math.random() * 500) + 50,
        status: statuses[i % statuses.length],
        paymentStatus: paymentStatuses[i % paymentStatuses.length],
        paymentMethod: paymentMethods[i % paymentMethods.length],
        shippingCompany: ["سمسا", "آرامكس", "فيديكس", "جانيت"][i % 4],
        country: "مصر",
        governorate: ["القاهرة", "الجيزة", "الإسكندرية"][i % 3],
        area: ["مدينة نصر", "المعادي", "الزمالك"][i % 3],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        time: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")} ${Math.random() > 0.5 ? "ص" : "م"}`,
      };
    });
  }, [supplierProducts]);

  useEffect(() => {
    setSupplierOrdersList(supplierOrders);
  }, [supplierOrders]);

  const filteredSupplierOrders = useMemo(() => {
    return supplierOrdersList.filter(o => {
      const matchesSearch = !orderSearch || o.id.includes(orderSearch) || o.customer.includes(orderSearch) || o.product.includes(orderSearch);
      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchesPayment = orderPaymentStatus === "all" || o.paymentStatus === orderPaymentStatus;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [supplierOrdersList, orderSearch, orderStatusFilter, orderPaymentStatus]);

  const sortedSupplierOrders = useMemo(() => {
    return [...filteredSupplierOrders].sort((a, b) => {
      switch (orderSortBy) {
        case "newest": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest": return b.total - a.total;
        case "lowest": return a.total - b.total;
        default: return 0;
      }
    });
  }, [filteredSupplierOrders, orderSortBy]);

  const orderTotalPages = Math.ceil(sortedSupplierOrders.length / orderItemsPerPage);
  const paginatedSupplierOrders = sortedSupplierOrders.slice((orderCurrentPage - 1) * orderItemsPerPage, orderCurrentPage * orderItemsPerPage);

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-100/70"
                  onClick={() => setLocation(`/suppliers/${supplier.id}/orders`)}
                  aria-label="عرض طلبات المورد"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
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

      {/* Orders Section */}
      <Card>
        <CardHeader className="p-3 pb-2 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">طلبات المورد - {supplier.name}</span>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">{filteredSupplierOrders.length} طلب</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setLocation(`/suppliers/${supplier.id}/orders`)}
            >
              كل الطلبات
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="بحث برقم الطلب أو اسم العميل أو المنتج..." value={orderSearch}
                onChange={(e) => { setOrderSearch(e.target.value); setOrderCurrentPage(1); }} className="pr-8 h-8 text-xs" />
            </div>
            <Select value={orderStatusFilter} onValueChange={(v) => { setOrderStatusFilter(v); setOrderCurrentPage(1); }}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="الحالة" />
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
            <Select value={orderPaymentStatus} onValueChange={(v) => { setOrderPaymentStatus(v); setOrderCurrentPage(1); }}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="مدفوع">مدفوع</SelectItem>
                <SelectItem value="غير مدفوع">غير مدفوع</SelectItem>
                <SelectItem value="مدفوع جزئياً">مدفوع جزئياً</SelectItem>
              </SelectContent>
            </Select>
            <Select value={orderSortBy} onValueChange={setOrderSortBy}>
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="oldest">الأقدم</SelectItem>
                <SelectItem value="highest">الأعلى سعراً</SelectItem>
                <SelectItem value="lowest">الأقل سعراً</SelectItem>
              </SelectContent>
            </Select>
            {(orderSearch || orderStatusFilter !== "all" || orderPaymentStatus !== "all") && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground gap-1"
                onClick={() => { setOrderSearch(""); setOrderStatusFilter("all"); setOrderPaymentStatus("all"); setOrderCurrentPage(1); }}>
                <X className="h-3 w-3" />مسح
              </Button>
            )}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right text-xs">رقم الطلب</TableHead>
                  <TableHead className="text-right text-xs">اسم العميل</TableHead>
                  <TableHead className="text-right text-xs">رقم الهاتف</TableHead>
                  <TableHead className="text-center text-xs">الكمية</TableHead>
                  <TableHead className="text-right text-xs">الإجمالي</TableHead>
                  <TableHead className="text-right text-xs">العمولة</TableHead>
                  <TableHead className="text-right text-xs">طريقة الدفع</TableHead>
                  <TableHead className="text-right text-xs">حالة الدفع</TableHead>
                  <TableHead className="text-right text-xs">الشحن</TableHead>
                  <TableHead className="text-right text-xs">الموقع</TableHead>
                  <TableHead className="text-right text-xs">الحالة</TableHead>
                  <TableHead className="text-right text-xs">التاريخ</TableHead>
                  <TableHead className="text-center text-xs">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSupplierOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا توجد طلبات مطابقة</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSupplierOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setLocation(`/orders/${order.id}?status=${order.status}`)}>
                      <TableCell className="font-mono text-xs text-right">{order.id}</TableCell>
                      <TableCell className="text-xs text-right">{order.customer}</TableCell>
                      <TableCell className="text-xs text-right" dir="ltr">+20 {order.customerPhone}</TableCell>
                      <TableCell className="text-xs text-center font-semibold text-blue-600">{order.quantity}</TableCell>
                      <TableCell className="text-xs text-right font-semibold text-emerald-600">{order.total.toLocaleString("ar-EG")} ج.م</TableCell>
                      <TableCell className="text-xs text-right font-semibold text-violet-600">{order.commission.toLocaleString("ar-EG")} ج.م</TableCell>
                      <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell className="text-xs text-right leading-tight">
                        <div className="text-amber-800 font-semibold">{order.shippingCompany}</div>
                      </TableCell>
                      <TableCell className="text-xs text-right leading-tight">
                        <div className="text-cyan-800 font-semibold">{order.country}</div>
                        <div className="text-cyan-600">{order.governorate} - {order.area}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-xs text-right">{new Date(order.date).toLocaleDateString("ar-EG")} {order.time}</TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
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
                              setEditingSupplierOrder(order);
                              setEditSupplierOrderForm({
                                customer: order.customer,
                                customerPhone: order.customerPhone,
                                quantity: order.quantity,
                                total: order.total,
                                status: order.status,
                                paymentMethod: order.paymentMethod,
                                paymentStatus: order.paymentStatus,
                              });
                            }}>
                              <Edit className="h-3.5 w-3.5 ml-1.5" />
                              تعديل الطلب
                            </DropdownMenuItem>
                            {order.status !== "delivered" && order.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => setStatusChangingSupplierOrder(order)}>
                                <TruckIcon className="h-3.5 w-3.5 ml-1.5" />
                                {order.status === "shipped" ? "بوليصة الشحن" : "تغيير حالة الطلب"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeletingSupplierOrder(order)} className="text-red-600">
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
          </div>

          {/* Pagination */}
          {sortedSupplierOrders.length > 0 && (
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">عرض</span>
                <Select value={String(orderItemsPerPage)} onValueChange={(v) => { setOrderItemsPerPage(Number(v)); setOrderCurrentPage(1); }}>
                  <SelectTrigger className="w-[65px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  من أصل {filteredSupplierOrders.length} طلب
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs"
                  disabled={orderCurrentPage === 1} onClick={() => setOrderCurrentPage(p => Math.max(1, p - 1))}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: Math.min(orderTotalPages, 5) }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button key={page} variant={orderCurrentPage === page ? "default" : "outline"} size="sm"
                      className="h-7 w-7 p-0 text-xs" onClick={() => setOrderCurrentPage(page)}>
                      {page}
                    </Button>
                  );
                })}
                <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs"
                  disabled={orderCurrentPage === orderTotalPages} onClick={() => setOrderCurrentPage(p => Math.min(orderTotalPages, p + 1))}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSupplierOrder} onOpenChange={() => setEditingSupplierOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الطلب {editingSupplierOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم العميل</label>
              <Input value={editSupplierOrderForm.customer} onChange={(e) => setEditSupplierOrderForm({ ...editSupplierOrderForm, customer: e.target.value })} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">رقم الهاتف</label>
              <Input value={editSupplierOrderForm.customerPhone} onChange={(e) => setEditSupplierOrderForm({ ...editSupplierOrderForm, customerPhone: e.target.value })} className="h-8 text-xs" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الكمية</label>
                <Input type="number" value={editSupplierOrderForm.quantity} onChange={(e) => setEditSupplierOrderForm({ ...editSupplierOrderForm, quantity: Number(e.target.value) })} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الإجمالي</label>
                <Input type="number" value={editSupplierOrderForm.total} onChange={(e) => setEditSupplierOrderForm({ ...editSupplierOrderForm, total: Number(e.target.value) })} className="h-8 text-xs" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حالة الطلب</label>
              <Select value={editSupplierOrderForm.status} onValueChange={(v) => setEditSupplierOrderForm({ ...editSupplierOrderForm, status: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                <Select value={editSupplierOrderForm.paymentMethod} onValueChange={(v) => setEditSupplierOrderForm({ ...editSupplierOrderForm, paymentMethod: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">حالة الدفع</label>
                <Select value={editSupplierOrderForm.paymentStatus} onValueChange={(v) => setEditSupplierOrderForm({ ...editSupplierOrderForm, paymentStatus: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditingSupplierOrder(null)}>إلغاء</Button>
            <Button size="sm" onClick={() => {
              setSupplierOrdersList(prev => prev.map(o => o.id === editingSupplierOrder.id ? { ...o, ...editSupplierOrderForm, lastUpdated: new Date().toISOString() } : o));
              setEditingSupplierOrder(null);
            }}>حفظ التعديلات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingSupplierOrder} onOpenChange={() => setDeletingSupplierOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف الطلب</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الطلب <span className="font-semibold">{deletingSupplierOrder?.id}</span>؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletingSupplierOrder(null)}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              setSupplierOrdersList(prev => prev.filter(o => o.id !== deletingSupplierOrder.id));
              setDeletingSupplierOrder(null);
            }}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={!!statusChangingSupplierOrder} onOpenChange={() => { setStatusChangingSupplierOrder(null); setShippingManifestImage(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{statusChangingSupplierOrder?.status === "shipped" ? "بوليصة الشحن" : "تغيير حالة الطلب"}</DialogTitle>
          </DialogHeader>
          {statusChangingSupplierOrder?.status === "shipped" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                إصدار بوليصة الشحن للطلب <span className="font-semibold">{statusChangingSupplierOrder?.id}</span> سيُغيّر حالة الطلب إلى مكتملة.
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
                        <TruckIcon className="h-6 w-6 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">اضغط لرفع صورة البوليصة</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {statusChangingSupplierOrder?.status === "pending" && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  setSupplierOrdersList(prev => prev.map(o => o.id === statusChangingSupplierOrder.id ? { ...o, status: "processing", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingSupplierOrder(null);
                }}>
                  <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-blue-500" />
                  مجهزة
                </Button>
              )}
              {statusChangingSupplierOrder?.status === "processing" && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => {
                  setSupplierOrdersList(prev => prev.map(o => o.id === statusChangingSupplierOrder.id ? { ...o, status: "shipped", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingSupplierOrder(null);
                }}>
                  <TruckIcon className="h-3.5 w-3.5 ml-1.5 text-purple-500" />
                  مشحونة
                </Button>
              )}
              {statusChangingSupplierOrder?.status === "pending" && (
                <Button variant="outline" size="sm" className="w-full justify-start text-red-600" onClick={() => {
                  setSupplierOrdersList(prev => prev.map(o => o.id === statusChangingSupplierOrder.id ? { ...o, status: "cancelled", lastUpdated: new Date().toISOString() } : o));
                  setStatusChangingSupplierOrder(null);
                }}>
                  <XCircle className="h-3.5 w-3.5 ml-1.5" />
                  ملغية
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStatusChangingSupplierOrder(null)}>إلغاء</Button>
            {statusChangingSupplierOrder?.status === "shipped" && (
              <Button size="sm" disabled={!shippingManifestImage} onClick={() => {
                setSupplierOrdersList(prev => prev.map(o => o.id === statusChangingSupplierOrder.id ? { ...o, status: "delivered", shippingManifest: shippingManifestImage, lastUpdated: new Date().toISOString() } : o));
                setShippingManifestImage(null);
                setStatusChangingSupplierOrder(null);
              }}>
                <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />
                إرسال البوليصة
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
