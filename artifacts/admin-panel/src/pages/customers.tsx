import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, Users, ShoppingCart, DollarSign, Star, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const customers = useMemo(() => {
    const mockCustomers = Array.from({ length: 25 }, (_, i) => ({
      id: `USR-${4000 + i}`,
      name: `عميل ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `0101234567${i}`,
      orders: Math.floor(Math.random() * 20) + 1,
      totalSpent: Math.floor(Math.random() * 10000) + 500,
      rating: (Math.random() * 2 + 3).toFixed(1),
      status: Math.random() > 0.15 ? "active" : "inactive",
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
      city: ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحيرة"][Math.floor(Math.random() * 5)],
    }));

    return mockCustomers.filter(c => {
      const matchesSearch = !search || c.name.includes(search) || c.email.includes(search) || c.id.includes(search) || c.phone.includes(search);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    inactive: customers.filter(c => c.status === "inactive").length,
    totalSpent: customers.reduce((s, c) => s + c.totalSpent, 0),
    totalOrders: customers.reduce((s, c) => s + c.orders, 0),
    avgSpent: customers.length ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length) : 0,
  }), [customers]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">العملاء</h1>
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
          <span className="text-xs text-muted-foreground">إجمالي العملاء</span>
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
          <ShoppingCart className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">إجمالي الطلبات</span>
          <span className="text-base font-bold text-blue-500">{stats.totalOrders}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">إجمالي المشتريات</span>
          <span className="text-base font-bold text-primary">{stats.totalSpent.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">متوسط المشتريات</span>
          <span className="text-base font-bold text-amber-500">{stats.avgSpent.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو البريد أو الهاتف..." value={search}
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
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">المدينة</TableHead>
                <TableHead className="text-right">الطلبات</TableHead>
                <TableHead className="text-right">إجمالي المشتريات</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="font-mono" dir="ltr">{customer.phone}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell className="font-bold">{customer.orders}</TableCell>
                  <TableCell className="font-bold text-primary">{customer.totalSpent.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{customer.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={customer.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {customer.status === "active" ? "نشط" : "معطّل"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(customer.joinDate).toLocaleDateString("ar-EG")}
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