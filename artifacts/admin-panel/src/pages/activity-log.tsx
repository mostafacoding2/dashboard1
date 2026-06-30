import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Printer, Activity, User, Package, ShoppingCart, DollarSign, Settings, Edit, Trash2, Eye, Plus, LogOut, LogIn, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ActivityLog = {
  id: string;
  employee: string;
  action: string;
  type: "product" | "order" | "payment" | "customer" | "settings" | "auth" | "other";
  details: string;
  timestamp: string;
  ip: string;
};

export default function ActivityLog() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const logs = useMemo(() => {
    const actions = [
      { action: "إضافة منتج جديد", type: "product" as const, details: "تم إضافة منتج 'سماعة بلوتوث'" },
      { action: "تعديل منتج", type: "product" as const, details: "تم تعديل سعر المنتج 'حقيبة ظهر'" },
      { action: "حذف منتج", type: "product" as const, details: "تم حذف المنتج 'ساعة يد'" },
      { action: "عرض تفاصيل منتج", type: "product" as const, details: "تم عرض تفاصيل المنتج 'موبايل Samsung'" },
      { action: "تأكيد طلب", type: "order" as const, details: "تم تأكيد الطلب #ORD-1001" },
      { action: "شحن طلب", type: "order" as const, details: "تم شحن الطلب #ORD-1005" },
      { action: "إلغاء طلب", type: "order" as const, details: "تم إلغاء الطلب #ORD-1010" },
      { action: "معالجة دفعة", type: "payment" as const, details: "تم استلام دفعة 5000 ج.م" },
      { action: "سحب مبلغ", type: "payment" as const, details: "تم سحب 2000 ج.م" },
      { action: "إضافة عميل", type: "customer" as const, details: "تم تسجيل عميل جديد 'أحمد محمد'" },
      { action: "تعديل بيانات عميل", type: "customer" as const, details: "تم تعديل بيانات العميل 'فاطمة علي'" },
      { action: "تعديل إعدادات", type: "settings" as const, details: "تم تعديل إعدادات النظام" },
      { action: "تسجيل دخول", type: "auth" as const, details: "تم تسجيل الدخول بنجاح" },
      { action: "تسجيل خروج", type: "auth" as const, details: "تم تسجيل الخروج" },
      { action: "تصدير تقرير", type: "other" as const, details: "تم تصدير تقرير المبيعات" },
    ];

    const employees = ["أحمد مدير", "محمد محاسب", "سارة مشرفة", "خالد مسوّق", "فاطمة خدمة"];

    const mockLogs: ActivityLog[] = Array.from({ length: 50 }, (_, i) => {
      const actionData = actions[Math.floor(Math.random() * actions.length)];
      return {
        id: `LOG-${9000 + i}`,
        employee: employees[Math.floor(Math.random() * employees.length)],
        action: actionData.action,
        type: actionData.type,
        details: actionData.details,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      };
    });

    return mockLogs.filter(l => {
      const matchesSearch = !search || l.employee.includes(search) || l.action.includes(search) || l.details.includes(search);
      const matchesType = typeFilter === "all" || l.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [search, typeFilter]);

  const stats = useMemo(() => ({
    total: logs.length,
    products: logs.filter(l => l.type === "product").length,
    orders: logs.filter(l => l.type === "order").length,
    payments: logs.filter(l => l.type === "payment").length,
    customers: logs.filter(l => l.type === "customer").length,
    auth: logs.filter(l => l.type === "auth").length,
  }), [logs]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      product: <Package className="h-4 w-4 text-amber-500" />,
      order: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      payment: <DollarSign className="h-4 w-4 text-green-500" />,
      customer: <User className="h-4 w-4 text-purple-500" />,
      settings: <Settings className="h-4 w-4 text-gray-500" />,
      auth: <LogIn className="h-4 w-4 text-cyan-500" />,
      other: <Activity className="h-4 w-4 text-orange-500" />,
    };
    return icons[type] || <Activity className="h-4 w-4" />;
  };

  const getActionIcon = (action: string) => {
    if (action.includes("إضافة") || action.includes("تسجيل دخول")) return <Plus className="h-3 w-3 text-green-500" />;
    if (action.includes("تعديل")) return <Edit className="h-3 w-3 text-blue-500" />;
    if (action.includes("حذف") || action.includes("إلغاء")) return <Trash2 className="h-3 w-3 text-red-500" />;
    if (action.includes("عرض")) return <Eye className="h-3 w-3 text-gray-500" />;
    if (action.includes("خروج")) return <LogOut className="h-3 w-3 text-orange-500" />;
    return <Activity className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">سجل نشاطات الموظفين</h1>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي النشاطات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Package className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">المنتجات</span>
          <span className="text-base font-bold text-amber-500">{stats.products}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">الطلبات</span>
          <span className="text-base font-bold text-blue-500">{stats.orders}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">المدفوعات</span>
          <span className="text-base font-bold text-green-500">{stats.payments}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <User className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs text-muted-foreground">العملاء</span>
          <span className="text-base font-bold text-purple-500">{stats.customers}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <LogIn className="h-3.5 w-3.5 text-cyan-500" />
          <span className="text-xs text-muted-foreground">تسجيل الدخول</span>
          <span className="text-base font-bold text-cyan-500">{stats.auth}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالموظف أو النشاط..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="product">المنتجات</SelectItem>
                <SelectItem value="order">الطلبات</SelectItem>
                <SelectItem value="payment">المدفوعات</SelectItem>
                <SelectItem value="customer">العملاء</SelectItem>
                <SelectItem value="settings">الإعدادات</SelectItem>
                <SelectItem value="auth">تسجيل الدخول</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {log.employee.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    {getTypeIcon(log.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{log.employee}</span>
                    {getActionIcon(log.action)}
                    <span className="text-sm">{log.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString("ar-EG")}
                    </span>
                    <span className="text-xs text-muted-foreground">IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}