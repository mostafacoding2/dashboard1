import { useMemo } from "react";
import { useLocation } from "wouter";
import { useProducts, categoriesList } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#06b6d4", "#f97316", "#ec4899"];

export default function ProductsCharts() {
  const [, setLocation] = useLocation();
  const products = useProducts();

  const data = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const productsPerMonth = months.map((name, i) => ({
      name,
      المنتجات: products.filter(p => new Date(p.createdAt).getMonth() === i).length,
    }));

    const salesByCategory = categoriesList.map(cat => ({
      name: cat,
      المبيعات: products.filter(p => p.category === cat).reduce((s, p) => s + p.sales, 0),
    })).filter(d => d.المبيعات > 0);

    const topSales = [...products].sort((a, b) => b.sales - a.sales).slice(0, 10).map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
      المبيعات: p.sales,
    }));

    const topViews = [...products].sort((a, b) => b.views - a.views).slice(0, 10).map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
      المشاهدات: p.views,
    }));

    const priceDistribution = [
      { range: "0-50", count: products.filter(p => p.price <= 50).length },
      { range: "50-100", count: products.filter(p => p.price > 50 && p.price <= 100).length },
      { range: "100-200", count: products.filter(p => p.price > 100 && p.price <= 200).length },
      { range: "200-500", count: products.filter(p => p.price > 200 && p.price <= 500).length },
      { range: "500+", count: products.filter(p => p.price > 500).length },
    ].map(d => ({ name: `${d.range} ج.م`, المنتجات: d.count }));

    const statusData = [
      { name: "نشط", value: products.filter(p => p.status === "active").length },
      { name: "مخفي", value: products.filter(p => p.status === "hidden").length },
    ];

    const topRated = [...products].filter(p => p.reviews.length > 0).sort((a, b) => {
      const avgA = a.reviews.reduce((s, r) => s + r.stars, 0) / a.reviews.length;
      const avgB = b.reviews.reduce((s, r) => s + r.stars, 0) / b.reviews.length;
      return avgB - avgA;
    }).slice(0, 10).map(p => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
      التقييم: Number((p.reviews.reduce((s, r) => s + r.stars, 0) / p.reviews.length).toFixed(1)),
    }));

    return { productsPerMonth, salesByCategory, topSales, topViews, priceDistribution, statusData, topRated };
  }, [products]);

  const stats = useMemo(() => ({
    total: products.length,
    totalSales: products.reduce((s, p) => s + p.sales, 0),
    totalViews: products.reduce((s, p) => s + p.views, 0),
    avgPrice: products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0,
  }), [products]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")} className="h-9 w-9">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">الرسوم البيانية للمنتجات</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{stats.totalSales.toLocaleString("ar-EG")}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المبيعات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.totalViews.toLocaleString("ar-EG")}</p>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المشاهدات</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{stats.avgPrice} ج.م</p>
              <p className="text-xs text-muted-foreground mt-1">متوسط السعر</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products per Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المنتجات المضافة شهرياً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.productsPerMonth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="المنتجات" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المبيعات حسب التصنيف</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
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

          {/* Top Sales */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المنتجات الأكثر مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topSales} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="المبيعات" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Views */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">المنتجات الأكثر مشاهدة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.topViews} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="المشاهدات" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">توزيع الأسعار</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="المنتجات" fill="#eab308" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Rated */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">الأعلى تقييماً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.topRated} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="التقييم" fill="#f97316" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">توزيع حالات المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              {data.statusData.map((item, i) => (
                <div key={item.name} className="text-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: i === 0 ? "#22c55e" : "#94a3b8" }}>
                    {item.value}
                  </div>
                  <p className="text-sm mt-2 font-medium">{item.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
