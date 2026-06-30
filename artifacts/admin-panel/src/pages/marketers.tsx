import { useState, useMemo } from "react";
import { useProducts } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, Users, TrendingUp, DollarSign, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Marketers() {
  const products = useProducts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const marketers = useMemo(() => {
    const mockMarketers = Array.from({ length: 20 }, (_, i) => ({
      id: `MKT-${3000 + i}`,
      name: `مسوق ${i + 1}`,
      email: `marketer${i + 1}@example.com`,
      phone: `0101234567${i}`,
      commission: Math.floor(Math.random() * 5000) + 500,
      sales: Math.floor(Math.random() * 100) + 10,
      rating: (Math.random() * 2 + 3).toFixed(1),
      status: Math.random() > 0.2 ? "active" : "inactive",
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return mockMarketers.filter(m => {
      const matchesSearch = !search || m.name.includes(search) || m.email.includes(search) || m.id.includes(search);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: marketers.length,
    active: marketers.filter(m => m.status === "active").length,
    inactive: marketers.filter(m => m.status === "inactive").length,
    totalCommission: marketers.reduce((s, m) => s + m.commission, 0),
    totalSales: marketers.reduce((s, m) => s + m.sales, 0),
    avgRating: (marketers.reduce((s, m) => s + Number(m.rating), 0) / marketers.length).toFixed(1),
  }), [marketers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">المسوقين</h1>
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
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي المسوقين</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">النشطون</span>
          <span className="text-base font-bold text-green-500">{stats.active}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">المعطّلون</span>
          <span className="text-base font-bold text-red-500">{stats.inactive}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">العمولة الإجمالية</span>
          <span className="text-base font-bold text-primary">{stats.totalCommission.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">إجمالي المبيعات</span>
          <span className="text-base font-bold text-blue-500">{stats.totalSales}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">متوسط التقييم</span>
          <span className="text-base font-bold text-amber-500">{stats.avgRating}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو البريد الإلكتروني..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">معطّل</SelectItem>
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
                <TableHead className="text-right">المسوق</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">المبيعات</TableHead>
                <TableHead className="text-right">العمولة</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketers.map((marketer) => (
                <TableRow key={marketer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {marketer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{marketer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{marketer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{marketer.email}</TableCell>
                  <TableCell className="font-mono" dir="ltr">{marketer.phone}</TableCell>
                  <TableCell className="font-bold">{marketer.sales}</TableCell>
                  <TableCell className="font-bold text-primary">{marketer.commission.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{marketer.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={marketer.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {marketer.status === "active" ? "نشط" : "معطّل"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(marketer.joinDate).toLocaleDateString("ar-EG")}
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