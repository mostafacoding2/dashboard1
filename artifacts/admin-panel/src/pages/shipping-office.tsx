import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, Truck, Package, MapPin, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ShippingOffice() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const shipments = useMemo(() => {
    const mockShipments = Array.from({ length: 30 }, (_, i) => ({
      id: `SHP-${5000 + i}`,
      orderNo: `ORD-${1000 + (i % 50)}`,
      customer: `عميل ${(i % 20) + 1}`,
      address: `${["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية"][i % 4]} - شارع ${i + 1}`,
      status: ["pending", "picked", "in_transit", "delivered", "returned"][Math.floor(Math.random() * 5)] as string,
      company: ["سمسا", "آرامكس", "فيديكس", "DHL"][Math.floor(Math.random() * 4)],
      date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      cost: Math.floor(Math.random() * 50) + 20,
    }));

    return mockShipments.filter(s => {
      const matchesSearch = !search || s.customer.includes(search) || s.orderNo.includes(search) || s.id.includes(search);
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: shipments.length,
    pending: shipments.filter(s => s.status === "pending").length,
    picked: shipments.filter(s => s.status === "picked").length,
    inTransit: shipments.filter(s => s.status === "in_transit").length,
    delivered: shipments.filter(s => s.status === "delivered").length,
    returned: shipments.filter(s => s.status === "returned").length,
    totalCost: shipments.reduce((s, sh) => s + sh.cost, 0),
  }), [shipments]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      picked: "bg-blue-100 text-blue-800",
      in_transit: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      returned: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      picked: "تم الاستلام",
      in_transit: "في الطريق",
      delivered: "تم التوصيل",
      returned: "مرتجع",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">مكتب الشحن</h1>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي الشحنات</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">قيد الانتظار</span>
          <span className="text-base font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Package className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">تم الاستلام</span>
          <span className="text-base font-bold text-blue-500">{stats.picked}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Truck className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs text-muted-foreground">في الطريق</span>
          <span className="text-base font-bold text-purple-500">{stats.inTransit}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <MapPin className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">تم التوصيل</span>
          <span className="text-base font-bold text-green-500">{stats.delivered}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Package className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">مرتجع</span>
          <span className="text-base font-bold text-red-500">{stats.returned}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-xs text-muted-foreground">إجمالي التكلفة</span>
          <span className="text-base font-bold text-primary">{stats.totalCost} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالعميل أو رقم الطلب..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="picked">تم الاستلام</SelectItem>
                <SelectItem value="in_transit">في الطريق</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="returned">مرتجع</SelectItem>
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
                <TableHead className="text-right">رقم الشحنة</TableHead>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">شركة الشحن</TableHead>
                <TableHead className="text-right">التكلفة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-sm">{shipment.id}</TableCell>
                  <TableCell className="font-mono text-sm">{shipment.orderNo}</TableCell>
                  <TableCell>{shipment.customer}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{shipment.address}</TableCell>
                  <TableCell>{shipment.company}</TableCell>
                  <TableCell className="font-bold">{shipment.cost} ج.م</TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(shipment.date).toLocaleDateString("ar-EG")}
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