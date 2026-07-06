import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Building2, Upload, X } from "lucide-react";

export default function AddShippingCompany() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverage: "",
    notes: "",
  });
  const [logo, setLogo] = useState<string | null>(null);

  const handleSubmit = () => {
    // TODO: API call to save
    setLocation("/shipping-companies");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/shipping-companies")} className="h-9 w-9">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">إضافة شركة شحن جديدة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            بيانات شركة الشحن
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم الشركة *</label>
              <Input
                placeholder="شركة سمسا"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">البريد الإلكتروني</label>
              <Input
                placeholder="info@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-9 text-xs"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">رقم الهاتف *</label>
              <Input
                placeholder="01012345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-9 text-xs"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">التغطية</label>
              <Input
                placeholder="جميع المحافظات"
                value={form.coverage}
                onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">شعار الشركة</label>
              <div className="border-2 border-dashed rounded-lg h-9 flex items-center justify-center">
                {logo ? (
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="logo" className="h-6 w-6 rounded object-cover" />
                    <span className="text-[10px] text-muted-foreground">تم الرفع</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setLogo(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">رفع صورة</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">ملاحظات</label>
              <Textarea
                placeholder="أي ملاحظات إضافية..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="h-16 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setLocation("/shipping-companies")}>
          إلغاء
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          <Building2 className="h-3.5 w-3.5 ml-1.5" />
          إضافة الشركة
        </Button>
      </div>
    </div>
  );
}
