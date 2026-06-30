import { useState, useMemo } from "react";
import { useProducts, useSuppliers } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, RotateCcw, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function Returns() {
  const products = useProducts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const returns = useMemo(() => {
    const mockReturns = products.slice(0, 30).map((p, i) => ({
      id: `RET-${2000 + i}`,
      customer: `عميل ${i + 1}`,
      product: p.name,
      supplier: p.supplier.name,
      reason: ["منتج معيب", "لا يطابق الوصف", "تلف أثناء الشحن", "تغيير رأي العميل"][Math.floor(Math.random() * 4)],
      status: ["pending", "approved", "rejected", "completed"][Math.floor(Math.random() * 4)] as string,
      date: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
      amount: p.price,
    }));

    return mockReturns.filter(r => {
      const matchesSearch = !search || r.customer.includes(search) || r.product.includes(search) || r.id.includes(search);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  const stats = useMemo(() => ({
    total: returns.length,
    pending: returns.filter(r => r.status === "pending").length,
    approved: returns.filter(r => r.status === "approved").length,
    rejected: returns.filter(r => r.status === "rejected").length,
    completed: returns.filter(r => r.status === "completed").length,
    totalAmount: returns.reduce((s, r) => s + r.amount, 0),
  }), [returns]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    const labels: Record<string, string> = {
      pending: "قيد المراجعة",
      approved: "تمت الموافقة",
      rejected: "مرفوض",
      completed: "تمت المعالجة",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">المرتجعات</h1>
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
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي المرتجعات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">قيد المراجعة</span>
          <span className="text-base font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">تمت الموافقة</span>
          <span className="text-base font-bold text-green-500">{stats.approved}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">مرفوض</span>
          <span className="text-base font-bold text-red-500">{stats.rejected}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">تمت المعالجة</span>
          <span className="text-base font-bold text-blue-500">{stats.completed}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">إجمالي المبالغ</span>
          <span className="text-base font-bold text-primary">{stats.totalAmount.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو رقم المرتجع..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="approved">تمت الموافقة</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="completed">تمت المعالجة</SelectItem>
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
                <TableHead className="text-right">رقم المرتجع</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">سبب المرتجع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono text-sm">{ret.id}</TableCell>
                  <TableCell>{ret.customer}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ret.product}</TableCell>
                  <TableCell>{ret.supplier}</TableCell>
                  <TableCell>{ret.reason}</TableCell>
                  <TableCell className="font-bold">{ret.amount.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>{getStatusBadge(ret.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(ret.date).toLocaleDateString("ar-EG")}
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