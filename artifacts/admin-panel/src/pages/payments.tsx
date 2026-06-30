import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, DollarSign, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, XCircle, Banknote, Building2 } from "lucide-react";

export default function Payments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const payments = useMemo(() => {
    const types = ["دفع", "سحب", "تحويل", "استرداد"];
    const methods = ["نقدي", "بطاقة ائتمان", "تحويل بنكي", "محفظة إلكترونية", "فودافون كاش"];
    const mockPayments = Array.from({ length: 30 }, (_, i) => ({
      id: `PAY-${8000 + i}`,
      customer: `عميل ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      amount: Math.floor(Math.random() * 10000) + 100,
      status: ["completed", "pending", "failed", "refunded"][Math.floor(Math.random() * 4)] as string,
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      reference: `REF-${Math.floor(Math.random() * 999999)}`,
    }));

    return mockPayments.filter(p => {
      const matchesSearch = !search || p.customer.includes(search) || p.id.includes(search) || p.reference.includes(search);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: payments.length,
    completed: payments.filter(p => p.status === "completed").length,
    pending: payments.filter(p => p.status === "pending").length,
    failed: payments.filter(p => p.status === "failed").length,
    refunded: payments.filter(p => p.status === "refunded").length,
    totalAmount: payments.reduce((s, p) => s + p.amount, 0),
    income: payments.filter(p => p.type === "دفع").reduce((s, p) => s + p.amount, 0),
    withdrawals: payments.filter(p => p.type === "سحب").reduce((s, p) => s + p.amount, 0),
  }), [payments]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-blue-100 text-blue-800",
    };
    const labels: Record<string, string> = {
      completed: "مكتمل",
      pending: "قيد المراجعة",
      failed: "فشل",
      refunded: "مسترد",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      "دفع": <ArrowDownRight className="h-4 w-4 text-green-500" />,
      "سحب": <ArrowUpRight className="h-4 w-4 text-red-500" />,
      "تحويل": <ArrowUpRight className="h-4 w-4 text-blue-500" />,
      "استرداد": <ArrowDownRight className="h-4 w-4 text-amber-500" />,
    };
    return icons[type] || <DollarSign className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">إدارة المدفوعات</h1>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي المعاملات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">المكتملة</span>
          <span className="text-base font-bold text-green-500">{stats.completed}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">قيد المراجعة</span>
          <span className="text-base font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">فشلت</span>
          <span className="text-base font-bold text-red-500">{stats.failed}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Banknote className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">الإيرادات</span>
          <span className="text-base font-bold text-green-500">{stats.income.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">السحب</span>
          <span className="text-base font-bold text-red-500">{stats.withdrawals.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CreditCard className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">المسترد</span>
          <span className="text-base font-bold text-blue-500">{stats.refunded}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">صافي المبلغ</span>
          <span className="text-base font-bold text-primary">{(stats.income - stats.withdrawals).toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالعميل أو رقم المعاملة..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
                <SelectItem value="refunded">مسترد</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="دفع">دفع</SelectItem>
                <SelectItem value="سحب">سحب</SelectItem>
                <SelectItem value="تحويل">تحويل</SelectItem>
                <SelectItem value="استرداد">استرداد</SelectItem>
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
                <TableHead className="text-right">رقم المعاملة</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">طريقة الدفع</TableHead>
                <TableHead className="text-right">رقم المرجع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <span>{payment.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{payment.amount.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <Badge className="bg-muted text-muted-foreground">{payment.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{payment.reference}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(payment.date).toLocaleDateString("ar-EG")}
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