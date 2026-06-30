import { useMemo } from "react";
import { useLocation } from "wouter";
import { useSuppliers, useProducts } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

export default function SuppliersCharts() {
  const [, setLocation] = useLocation();
  const suppliers = useSuppliers();
  const products = useProducts();

  const data = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const suppliersPerMonth = months.map((name, i) => ({
      name,
      الموردون: suppliers.filter(s => new Date(s.createdAt).getMonth() === i).length,
    }));

    const topSuppliersBySales = [...suppliers]
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        مبيعات: products.filter(p => p.supplier.id === s.id).reduce((sum, p) => sum + p.sales, 0),
      }))
      .sort((a, b) => b.مبيعات - a.مبيعات)
      .slice(0, 10);

    const topSuppliersByCommission = [...suppliers]
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        عمولة: products.filter(p => p.supplier.id === s.id).reduce((sum, p) => sum + p.commission, 0),
      }))
      .sort((a, b) => b.عمولة - a.عمولة)
      .slice(0, 10);

    const statusData = [
      { name: "نشط", value: suppliers.filter(s => s.status === 1).length },
      { name: "معطّل", value: suppliers.filter(s => s.status === 0).length },
    ];

    const topSuppliersByProducts = [...suppliers]
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        منتجات: products.filter(p => p.supplier.id === s.id).length,
      }))
      .sort((a, b) => b.منتجات - a.منتجات)
      .slice(0, 10);

    const topSuppliersByRating = [...suppliers]
      .filter(s => s.averageRating > 0)
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        تقييم: s.averageRating,
      }))
      .sort((a, b) => b.تقييم - a.تقييم)
      .slice(0, 10);

    const topSuppliersByReturns = [...suppliers]
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        مرتجعات: s.returnedOrders,
      }))
      .sort((a, b) => b.مرتجعات - a.مرتجعات)
      .slice(0, 10);

    return { suppliersPerMonth, topSuppliersBySales, topSuppliersByCommission, statusData, topSuppliersByProducts, topSuppliersByRating, topSuppliersByReturns };
  }, [suppliers, products]);

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 1).length,
    inactive: suppliers.filter(s => s.status === 0).length,
    totalSales: products.reduce((s, p) => s + p.sales, 0),
    totalCommission: products.reduce((s, p) => s + p.commission, 0),
    totalProducts: products.length,
    totalReturns: suppliers.reduce((s, sup) => s + sup.returnedOrders, 0),
    avgRating: suppliers.length ? (suppliers.reduce((s, sup) => s + sup.averageRating, 0) / suppliers.length).toFixed(1) : "0",
  }), [suppliers, products]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/suppliers")} className="h-9 w-9">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">الرسوم البيانية للموردين</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الموردين</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">الموردون النشطون</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
              <p className="text-xs text-muted-foreground mt-1">الموردون المعطّلون</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{stats.totalSales.toLocaleString("ar-EG")}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المبيعات</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.totalCommission.toLocaleString("ar-EG")} ج.م</p>
              <p className="text-xs text-muted-foreground mt-1">العمولة الإجمالية</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-500">{stats.totalReturns}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المرتجعات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-500">{stats.avgRating}</p>
              <p className="text-xs text-muted-foreground mt-1">متوسط التقييم</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">حالة الموردين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                {data.statusData.map((item, i) => (
                  <div key={item.name} className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: i === 0 ? "#22c55e" : "#ef4444" }}>
                      {item.value}
                    </div>
                    <p className="text-sm mt-2 font-medium">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suppliers per Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الجدد شهرياً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.suppliersPerMonth}>
                  <defs>
                    <linearGradient id="colorSuppliers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="الموردون" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSuppliers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers by Sales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأعلى مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSuppliersBySales} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="مبيعات" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers by Commission */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأعلى عمولة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSuppliersByCommission} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="عمولة" fill="#8B5CF6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers by Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأعلى منتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSuppliersByProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="منتجات" fill="#F59E0B" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers by Rating */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأعلى تقييماً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSuppliersByRating} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="تقييم" fill="#f97316" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers by Returns */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأكثر مرتجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSuppliersByReturns} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="مرتجعات" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}