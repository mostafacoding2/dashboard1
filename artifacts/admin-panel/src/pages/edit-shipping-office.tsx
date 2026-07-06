import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Building2, Upload, X, Plus, Trash2 } from "lucide-react";

interface Branch {
  name: string;
  phone: string;
}

interface ShippingOfficeData {
  id: string;
  officeName: string;
  location: string;
  address: string;
  managerName: string;
  managerPhone: string;
  internalShipping: number;
  branches: Branch[];
  logo: string | null;
  notes: string;
  status: "active" | "inactive";
}

const mockOffices: ShippingOfficeData[] = [
  {
    id: "OFF-001",
    officeName: "مكتب المعادي",
    location: "https://maps.google.com/?q=29.9582,31.2523",
    address: "شارع النيل، المعادي، القاهرة",
    managerName: "أحمد محمد",
    managerPhone: "01012345671",
    internalShipping: 25,
    branches: [
      { name: "فرع المعادي", phone: "01012345672" },
      { name: "فرع حلوان", phone: "01012345673" },
    ],
    logo: "https://picsum.photos/seed/office-mokattam/200/200",
    notes: "مكتب رئيسي - يخدم منطقة جنوب القاهرة",
    status: "active",
  },
  {
    id: "OFF-002",
    officeName: "مكتب الدقي",
    location: "https://maps.google.com/?q=30.0468,31.2098",
    address: "شارع مصطفى النحاس، الدقي، الجيزة",
    managerName: "خالد محمود",
    managerPhone: "01012345674",
    internalShipping: 15,
    branches: [
      { name: "فرع الدقي", phone: "01012345675" },
    ],
    logo: "https://picsum.photos/seed/office-doqqi/200/200",
    notes: "",
    status: "active",
  },
  {
    id: "OFF-003",
    officeName: "مكتب مدينة نصر",
    location: "",
    address: "شارع عبد اللطيف بغدادي، مدينة نصر، القاهرة",
    managerName: "سارة أحمد",
    managerPhone: "01012345676",
    internalShipping: 20,
    branches: [
      { name: "فرع مدينة نصر", phone: "01012345677" },
      { name: "فرع مصر الجديدة", phone: "01012345678" },
      { name: "فرع العباسية", phone: "01012345679" },
    ],
    logo: "https://picsum.photos/seed/office-nasr/200/200",
    notes: "يوجد خدمة توصيل للمناطق القريبة",
    status: "active",
  },
  {
    id: "OFF-004",
    officeName: "مكتب الإسكندرية",
    location: "https://maps.google.com/?q=31.2001,29.9187",
    address: "شارع سيدي جابر، الإسكندرية",
    managerName: "محمد حسن",
    managerPhone: "01012345680",
    internalShipping: 30,
    branches: [
      { name: "فرع سيدي جابر", phone: "01012345681" },
    ],
    logo: "https://picsum.photos/seed/office-alex/200/200",
    notes: "يغلق يوم الجمعة",
    status: "inactive",
  },
  {
    id: "OFF-005",
    officeName: "مكتب المنصورة",
    location: "",
    address: "شارع الجيش، المنصورة، الدقهلية",
    managerName: "فاطمة علي",
    managerPhone: "01012345682",
    internalShipping: 10,
    branches: [
      { name: "فرع المنصورة", phone: "01012345683" },
      { name: "فرع طلخا", phone: "01012345684" },
    ],
    logo: "https://picsum.photos/seed/office-mansoura/200/200",
    notes: "",
    status: "active",
  },
];

export default function EditShippingOffice() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const officeId = params.id;

  const [form, setForm] = useState({
    officeName: "",
    location: "",
    address: "",
    managerName: "",
    managerPhone: "",
    internalShipping: "",
    notes: "",
  });
  const [branches, setBranches] = useState<{ name: string; phone: string }[]>([]);
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const office = mockOffices.find(o => o.id === officeId);
    if (office) {
      setForm({
        officeName: office.officeName,
        location: office.location,
        address: office.address,
        managerName: office.managerName,
        managerPhone: office.managerPhone,
        internalShipping: String(office.internalShipping || ""),
        notes: office.notes,
      });
      setBranches(office.branches.length > 0 ? office.branches : [{ name: "", phone: "" }]);
      setLogo(office.logo);
    }
  }, [officeId]);

  const addBranch = () => setBranches([...branches, { name: "", phone: "" }]);
  const removeBranch = (i: number) => setBranches(branches.filter((_, idx) => idx !== i));
  const updateBranch = (i: number, field: "name" | "phone", v: string) => {
    const updated = [...branches];
    updated[i][field] = v;
    setBranches(updated);
  };

  const handleSubmit = () => {
    // TODO: API call to save
    setLocation("/shipping-office");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/shipping-office")} className="h-9 w-9">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">تعديل مكتب الشحن</h1>
        {officeId && (
          <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{officeId}</span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            بيانات مكتب الشحن
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم المكتب *</label>
              <Input
                placeholder="مكتب المعادي"
                value={form.officeName}
                onChange={(e) => setForm({ ...form, officeName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">الموقع الجغرافي (لينك)</label>
              <Input
                placeholder="https://maps.google.com/?q=..."
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="h-9 text-xs"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">العنوان التفصيلي</label>
              <Textarea
                placeholder="شارع النيل، بجوار البنك الأهلي"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-16 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اسم المدير *</label>
              <Input
                placeholder="أحمد محمد"
                value={form.managerName}
                onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">رقم هاتف المدير *</label>
              <Input
                placeholder="01012345678"
                value={form.managerPhone}
                onChange={(e) => setForm({ ...form, managerPhone: e.target.value })}
                className="h-9 text-xs"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">قيمة الشحن الداخلي</label>
              <Input
                type="number"
                placeholder="0"
                value={form.internalShipping}
                onChange={(e) => setForm({ ...form, internalShipping: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">شعار المكتب</label>
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
              <label className="text-xs text-muted-foreground mb-1 block">الفروع *</label>
              <div className="space-y-2">
                {branches.map((branch, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 border rounded-lg">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        placeholder="اسم الفرع"
                        value={branch.name}
                        onChange={(e) => updateBranch(i, "name", e.target.value)}
                        className="h-9 text-xs"
                      />
                      <Input
                        placeholder="رقم الهاتف"
                        value={branch.phone}
                        onChange={(e) => updateBranch(i, "phone", e.target.value)}
                        className="h-9 text-xs"
                        dir="ltr"
                      />
                    </div>
                    {branches.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 flex-shrink-0" onClick={() => removeBranch(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addBranch}>
                  <Plus className="h-3.5 w-3.5" />
                  إضافة فرع آخر
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">ملاحظات عن المكتب</label>
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
        <Button variant="outline" size="sm" onClick={() => setLocation("/shipping-office")}>
          إلغاء
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          <Building2 className="h-3.5 w-3.5 ml-1.5" />
          حفظ التعديلات
        </Button>
      </div>
    </div>
  );
}
