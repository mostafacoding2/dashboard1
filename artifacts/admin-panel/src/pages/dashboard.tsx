import { useProducts } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Activity, Eye, TrendingUp, AlertTriangle, ArchiveX, DollarSign, Star, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const products = useProducts();

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const hiddenProducts = products.filter(p => p.status === "hidden").length;
  const totalViews = products.reduce((acc, p) => acc + p.views, 0);
  const totalSales = products.reduce((acc, p) => acc + p.sales, 0);
  const lowStockProducts = products.filter(p => p.quantity < 15);
  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const avgPrice = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length)
    : 0;
  const totalReviews = products.reduce((acc, p) => acc + p.reviews.length, 0);

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(c => c.name === p.category);
    if (existing) { existing.count += 1; }
    else { acc.push({ name: p.category, count: 1 }); }
    return acc;
  }, [] as { name: string; count: number }[]);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">نظرة عامة</h1>

      {/* Row 1 KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-total-products">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">{activeProducts} نشط</span>
              {" • "}
              <span className="text-muted-foreground">{hiddenProducts} مخفي</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-total-views">
              {totalViews.toLocaleString("ar-EG")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">لجميع المنتجات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-total-sales">
              {totalSales.toLocaleString("ar-EG")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">وحدة مباعة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockProducts.length > 0 ? "text-destructive" : ""}`}
              data-testid="kpi-low-stock">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">منتج قارب على النفاذ</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المخزون</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-total-stock">
              {totalStock.toLocaleString("ar-EG")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الكميات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-avg-price">
              {avgPrice.toLocaleString("ar-EG")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">جنيه مصري</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              المنتجات المخفية
            </CardTitle>
            <ArchiveX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400"
              data-testid="kpi-hidden-products">
              {hiddenProducts}
            </div>
            <p className="text-xs text-orange-500/80 mt-1">
              {totalProducts > 0 ? Math.round((hiddenProducts / totalProducts) * 100) : 0}% من إجمالي المنتجات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التقييمات</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="kpi-total-reviews">
              {totalReviews.toLocaleString("ar-EG")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">تقييم من العملاء</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Recent */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>المنتجات حسب القسم</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tickLine={false} axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--popover-foreground))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="عدد المنتجات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>أحدث المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentProducts.map(product => (
                <div key={product.id} className="flex items-center">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted shrink-0">
                    <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="mr-4 space-y-0.5 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.category} • {product.sku}</p>
                  </div>
                  <div className="mr-auto font-medium text-sm shrink-0">{product.price} ج.م</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
