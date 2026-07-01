import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useProducts, useSuppliers } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

function ScrollableChart({ children, title }: { children: React.ReactNode; title: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({
        left: direction === "right" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => scroll("right")}>
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => scroll("left")}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="overflow-x-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersCharts() {
  const [, setLocation] = useLocation();
  const products = useProducts();
  const suppliers = useSuppliers();
  const [ordersList, setOrdersList] = useState<any[]>([]);

  const paymentMethods = ["كاش", "بطاقة ائتمان", "تحويل بنفي", "محفظة إلكترونية", "فودافون كاش"];
  const shippingCompanies = ["سمسا", "آرامكس", "فيديكس", "DHL", "جانيت"];
  const countries = ["مصر", "السعودية", "الإمارات", "الكويت", "قطر"];
  const cities = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية"];
  const customerNames = ["أحمد محمد", "فاطمة علي", "محمد حسن", "سارة أحمد", "خالد محمود", "نورا سعيد", "عمر حسين", "ريم عبد الله", "ياسر إبراهيم", "هدى عادل"];

  useEffect(() => {
    const mockOrders = products.slice(0, 50).map((p, i) => ({
      id: `ORD-${1000 + i}`,
      customer: customerNames[i % customerNames.length],
      quantity: Math.floor(Math.random() * 5) + 1,
      total: p.price * (Math.floor(Math.random() * 5) + 1),
      commission: Math.floor(Math.random() * 500) + 50,
      status: ["pending", "processing", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      shippingCompany: shippingCompanies[Math.floor(Math.random() * shippingCompanies.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      governorate: cities[i % cities.length],
      supplier: p.supplier.name,
    }));
    setOrdersList(mockOrders);
  }, [products]);

  const data = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const ordersPerMonth = months.map((name, i) => ({
      name,
      الطلبات: ordersList.filter(o => new Date(o.date).getMonth() === i).length,
    }));

    const statusData = [
      { name: "جديدة", value: ordersList.filter(o => o.status === "pending").length },
      { name: "مجهزة", value: ordersList.filter(o => o.status === "processing").length },
      { name: "مشحونة", value: ordersList.filter(o => o.status === "shipped").length },
      { name: "مكتملة", value: ordersList.filter(o => o.status === "delivered").length },
      { name: "ملغية", value: ordersList.filter(o => o.status === "cancelled").length },
    ];

    const paymentData = paymentMethods.map(name => ({
      name,
      الطلبات: ordersList.filter(o => o.paymentMethod === name).length,
    }));

    const shippingData = shippingCompanies.map(name => ({
      name,
      الطلبات: ordersList.filter(o => o.shippingCompany === name).length,
    }));

    const salesPerMonth = months.map((name, i) => ({
      name,
      المبيعات: ordersList.filter(o => new Date(o.date).getMonth() === i).reduce((s, o) => s + o.total, 0),
      العمولة: ordersList.filter(o => new Date(o.date).getMonth() === i).reduce((s, o) => s + o.commission, 0),
    }));

    const governorateData = [...new Set(ordersList.map(o => o.governorate))].map(name => ({
      name,
      الطلبات: ordersList.filter(o => o.governorate === name).length,
    }));

    const countryData = countries.map(name => ({
      name,
      الطلبات: ordersList.filter(o => o.country === name).length,
      المبيعات: ordersList.filter(o => o.country === name).reduce((s, o) => s + o.total, 0),
    }));

    const supplierData = [...new Set(ordersList.map(o => o.supplier))].map(name => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      الطلبات: ordersList.filter(o => o.supplier === name).length,
      المبيعات: ordersList.filter(o => o.supplier === name).reduce((s, o) => s + o.total, 0),
      العمولة: ordersList.filter(o => o.supplier === name).reduce((s, o) => s + o.commission, 0),
    })).sort((a, b) => b.الطلبات - a.الطلبات);

    return { ordersPerMonth, statusData, paymentData, shippingData, salesPerMonth, governorateData, countryData, supplierData };
  }, [ordersList]);

  const stats = useMemo(() => ({
    total: ordersList.length,
    pending: ordersList.filter(o => o.status === "pending").length,
    processing: ordersList.filter(o => o.status === "processing").length,
    delivered: ordersList.filter(o => o.status === "delivered").length,
    cancelled: ordersList.filter(o => o.status === "cancelled").length,
    totalQuantity: ordersList.reduce((s, o) => s + o.quantity, 0),
    totalSales: ordersList.reduce((s, o) => s + o.total, 0),
    totalCommission: ordersList.reduce((s, o) => s + o.commission, 0),
    totalSuppliers: [...new Set(ordersList.map(o => o.supplier))].length,
    totalCountries: [...new Set(ordersList.map(o => o.country))].length,
  }), [ordersList]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/orders")} className="h-9 w-9">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">الرسوم البيانية للطلبات</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status */}
          <Card className="h-fit">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">حالات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="flex items-center justify-between gap-3">
                {data.statusData.map((item, i) => (
                  <div key={item.name} className="flex-1 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: ["#eab308", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444"][i] }}>
                      {item.value}
                    </div>
                    <p className="text-[10px] mt-1 font-medium">{item.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground mt-1">اجمالي الطلبات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-yellow-500">{stats.pending}</p>
                <p className="text-[10px] text-muted-foreground mt-1">الجديدة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-blue-500">{stats.processing}</p>
                <p className="text-[10px] text-muted-foreground mt-1">المجهزة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-green-500">{stats.delivered}</p>
                <p className="text-[10px] text-muted-foreground mt-1">المكتملة</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-red-500">{stats.cancelled}</p>
                <p className="text-[10px] text-muted-foreground mt-1">الملغية</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{stats.totalQuantity}</p>
                <p className="text-[10px] text-muted-foreground mt-1">اجمالي المنتجات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-emerald-600">{stats.totalSales.toLocaleString("ar-EG")} ج.م</p>
                <p className="text-[10px] text-muted-foreground mt-1">اجمالي المبيعات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-violet-600">{stats.totalCommission.toLocaleString("ar-EG")} ج.م</p>
                <p className="text-[10px] text-muted-foreground mt-1">اجمالي العمولة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-orange-500">{stats.totalSuppliers}</p>
              <p className="text-xs text-muted-foreground mt-1">الموردون</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-cyan-500">{stats.totalCountries}</p>
              <p className="text-xs text-muted-foreground mt-1">الدول</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders per Month */}
          <ScrollableChart title="الطلبات شهرياً">
            <div style={{ width: "1200px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.ordersPerMonth}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="الطلبات" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Payment Methods */}
          <ScrollableChart title="طرق الدفع">
            <div style={{ width: "800px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.paymentData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Shipping Companies */}
          <ScrollableChart title="شركات الشحن">
            <div style={{ width: "800px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.shippingData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Sales & Commission per Month */}
          <ScrollableChart title="المبيعات والعمولة شهرياً">
            <div style={{ width: "1200px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="المبيعات" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="العمولة" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Orders by Governorate */}
          <ScrollableChart title="الطلبات حسب المحافظة">
            <div style={{ width: "800px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.governorateData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Orders by Country */}
          <ScrollableChart title="الطلبات حسب الدولة">
            <div style={{ width: "800px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.countryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Sales by Country */}
          <ScrollableChart title="المبيعات حسب الدولة">
            <div style={{ width: "800px", height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.countryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="المبيعات" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Top Suppliers by Orders */}
          <ScrollableChart title="الموردون الأعلى طلبات">
            <div style={{ width: "1000px", height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.supplierData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="الطلبات" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Top Suppliers by Sales */}
          <ScrollableChart title="الموردون الأعلى مبيعاً">
            <div style={{ width: "1000px", height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.supplierData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="المبيعات" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>

          {/* Top Suppliers by Commission */}
          <ScrollableChart title="الموردون الأعلى عمولة">
            <div style={{ width: "1000px", height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.supplierData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="العمولة" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollableChart>
        </div>
      </div>
    </div>
  );
}
