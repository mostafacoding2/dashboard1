import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, Building2, Truck, Package, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ShippingCompanies() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const companies = useMemo(() => {
    const mockCompanies = [
      { id: "SHP-001", name: "شركة سمسا", phone: "01012345678", email: "smsa@example.com", orders: 150, revenue: 25000, status: "active", coverage: "جميع المحافظات" },
      { id: "SHP-002", name: "شركة آرامكس", phone: "01098765432", email: "aramex@example.com", orders: 120, revenue: 20000, status: "active", coverage: "القاهرة والجيزة" },
      { id: "SHP-003", name: "شركة فيديكس", phone: "01055555555", email: "fedex@example.com", orders: 80, revenue: 15000, status: "active", coverage: "الإسكندرية" },
      { id: "SHP-004", name: "شركة DHL", phone: "01066666666", email: "dhl@example.com", orders: 95, revenue: 18000, status: "inactive", coverage: "جميع المحافظات" },
      { id: "SHP-005", name: "شركة جانيت", phone: "01077777777", email: "jneet@example.com", orders: 60, revenue: 10000, status: "active", coverage: "الدقهلية" },
    ];

    return mockCompanies.filter(c => {
      const matchesSearch = !search || c.name.includes(search) || c.email.includes(search) || c.id.includes(search);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

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
                <TableHead className="text-right">الشركة</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الطلبات</TableHead>
                <TableHead className="text-right">الإيرادات</TableHead>
                <TableHead className="text-right">التغطية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{company.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{company.email}</TableCell>
                  <TableCell className="font-mono" dir="ltr">{company.phone}</TableCell>
                  <TableCell className="font-bold">{company.orders}</TableCell>
                  <TableCell className="font-bold text-primary">{company.revenue.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>{company.coverage}</TableCell>
                  <TableCell>
                    <Badge className={company.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {company.status === "active" ? "نشط" : "معطّل"}
                    </Badge>
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