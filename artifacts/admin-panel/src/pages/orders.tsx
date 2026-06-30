import { useState, useMemo } from "react";
import { useProducts, useSuppliers } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, FileText, FileSpreadsheet, Presentation, Sheet as SheetIcon, Printer, Eye, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Orders() {
  const products = useProducts();
  const suppliers = useSuppliers();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const orders = useMemo(() => {
    const mockOrders = products.slice(0, 50).map((p, i) => ({
      id: `ORD-${1000 + i}`,
      customer: `عميل ${i + 1}`,
      product: p.name,
      supplier: p.supplier.name,
      quantity: Math.floor(Math.random() * 5) + 1,
      total: p.price * (Math.floor(Math.random() * 5) + 1),
      status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)] as string,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return mockOrders.filter(o => {
      const matchesSearch = !search || o.customer.includes(search) || o.product.includes(search) || o.id.includes(search);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalSales: orders.reduce((s, o) => s + o.total, 0),
  }), [orders]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">الطلبات</h1>
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
          <span className="text-xs text-muted-foreground">إجمالي الطلبات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">قيد الانتظار</span>
          <span className="text-base font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Truck className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">قيد المعالجة</span>
          <span className="text-base font-bold text-blue-500">{stats.processing}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Truck className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs text-muted-foreground">تم الشحن</span>
          <span className="text-base font-bold text-purple-500">{stats.shipped}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">تم التوصيل</span>
          <span className="text-base font-bold text-green-500">{stats.delivered}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">ملغي</span>
          <span className="text-base font-bold text-red-500">{stats.cancelled}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو رقم الطلب..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="shipped">تم الشحن</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.slice(0, 20).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell className="font-bold">{order.total.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(order.date).toLocaleDateString("ar-EG")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}