import { useMemo } from "react";
import { useProducts, useSuppliers } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, Truck, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";

export default function Statistics() {
  const products = useProducts();
  const suppliers = useSuppliers();

  const data = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const salesPerMonth = months.map((name, i) => ({
      name,
      المبيعات: Math.floor(Math.random() * 50000) + 10000,
      الإيرادات: Math.floor(Math.random() * 30000) + 5000,
    }));

    const ordersPerMonth = months.map((name, i) => ({
      name,
      الطلبات: Math.floor(Math.random() * 200) + 50,
      المرتجعات: Math.floor(Math.random() * 30) + 5,
    }));

    const topProducts = [...products]
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
        المبيعات: p.sales,
      }));

    const topSuppliers = [...suppliers]
      .map(s => ({
        name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
        المنتجات: products.filter(p => p.supplier.id === s.id).length,
      }))
      .sort((a, b) => b.المنتجات - a.المنتجات)
      .slice(0, 10);

    const salesByCategory = ["إلكترونيات", "ملابس", "أزياء", "منزل ومطبخ", "رياضة", "جمال وعناية"].map(cat => ({
      name: cat,
      المبيعات: Math.floor(Math.random() * 100000) + 10000,
    }));

    const profitData = months.map((name, i) => ({
      name,
      الإيرادات: Math.floor(Math.random() * 50000) + 20000,
      التكاليف: Math.floor(Math.random() * 30000) + 10000,
      الربح: Math.floor(Math.random() * 20000) + 5000,
    }));

    return { salesPerMonth, ordersPerMonth, topProducts, topSuppliers, salesByCategory, profitData };
  }, [products, suppliers]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalSuppliers: suppliers.length,
    totalSales: products.reduce((s, p) => s + p.sales, 0),
    totalRevenue: products.reduce((s, p) => s + p.sales * p.price, 0),
    avgOrderValue: products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0,
    totalCommission: products.reduce((s, p) => s + p.commission, 0),
  }), [products, suppliers]);

  const COLORS = ["hsl(var(--primary))", "#22c55e", "#eab308", "#a855f7", "#06b6d4", "#f97316", "#ec4899", "#ef4444"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center justify-between px-6 py-3">
          <h1 className="text-lg font-bold">الإحصائيات والتقارير</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1.5" />
              تصدير التقرير
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 ml-1.5" />
              طباعة
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-500">{stats.totalSuppliers}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الموردين</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-500">{stats.totalSales.toLocaleString("ar-EG")}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المبيعات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-500">{stats.totalRevenue.toLocaleString("ar-EG")} ج.م</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي الإيرادات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-500">{stats.avgOrderValue.toLocaleString("ar-EG")} ج.م</p>
              <p className="text-xs text-muted-foreground mt-1">متوسط سعر البيع</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-cyan-500">{stats.totalCommission.toLocaleString("ar-EG")} ج.م</p>
              <p className="text-xs text-muted-foreground mt-1">العمولات الإجمالية</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm"> trend المبيعات شهرياً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.salesPerMonth}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="المبيعات" stroke="#22c55e" fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="الإيرادات" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders vs Returns */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الطلبات مقابل المرتجعات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ordersPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="الطلبات" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="المرتجعات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المنتجات الأكثر مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="المبيعات" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Suppliers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الموردون الأعلى منتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.topSuppliers} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="المنتجات" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المبيعات حسب التصنيف</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.salesByCategory} dataKey="المبيعات" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">تحليل الأرباح</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.profitData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="الإيرادات" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="التكاليف" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="الربح" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}