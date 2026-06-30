import { useEffect, useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProduct, adminStore, categoriesList } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Save, Star, Trash2, Link as LinkIcon, Image as ImageIcon, Download, Eye, Edit, X, Play, Video, Building2, MapPin, FileText, MessageSquare, Phone, Crop, Heart } from "lucide-react";
import ImageEditor from "@/components/image-editor";

const formSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  description: z.string().min(10, "الوصف مطلوب"),
  price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
  quantity: z.coerce.number().min(0, "الكمية يجب أن تكون رقماً موجباً"),
  sku: z.string().min(1, "رمز SKU مطلوب"),
  status: z.enum(["active", "hidden"]),
  category: z.string().min(1, "القسم مطلوب"),
  subCategory: z.string().min(1, "القسم الفرعي مطلوب"),
  weight: z.coerce.number().min(0),
  length: z.coerce.number().min(0),
  width: z.coerce.number().min(0),
  minOrder: z.coerce.number().min(1),
  factoryName: z.string().min(1, "اسم المصنع مطلوب"),
  material: z.string().min(1, "الخامة مطلوبة"),
  commission: z.coerce.number().min(0).max(100),
  videoUrl: z.string().url("رابط غير صحيح").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const product = useProduct(id || "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      sku: "",
      status: "active",
      category: "",
      subCategory: "",
      weight: 0,
      length: 0,
      width: 0,
      minOrder: 1,
      factoryName: "",
      material: "",
      commission: 0,
      videoUrl: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        sku: product.sku,
        status: product.status,
        category: product.category,
        subCategory: product.subCategory,
        weight: product.weight,
        length: product.length,
        width: product.width,
        minOrder: product.minOrder,
        factoryName: product.factoryName,
        material: product.material,
        commission: product.commission,
        videoUrl: product.videoUrl || "",
      });
    }
  }, [product, form]);

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [editingImg, setEditingImg] = useState<{ index: number | "main"; url: string } | null>(null);
  const [editorImg, setEditorImg] = useState<{ index: number | "main"; url: string } | null>(null);

  const allImages = useMemo(() => {
    if (!product) return [];
    return [
      { url: product.mainImage, index: "main" as const, label: "الصورة الرئيسية" },
      ...product.gallery.map((url, i) => ({ url, index: i, label: `صورة ${i + 1}` })),
    ];
  }, [product]);

  const toggleImageSelect = (key: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const selectAllImages = () => {
    if (selectedImages.size === allImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(allImages.map(img => String(img.index))));
    }
  };

  const downloadImage = async (url: string, name: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, "_blank"); }
  };

  const downloadAllImages = async () => {
    for (const img of allImages) {
      await downloadImage(img.url, `${product!.name}_${img.index}.jpg`);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const downloadSelectedImages = async () => {
    const toDownload = allImages.filter(img => selectedImages.has(String(img.index)));
    for (const img of toDownload) {
      await downloadImage(img.url, `${product!.name}_${img.index}.jpg`);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const deleteImage = (index: number | "main") => {
    if (!product) return;
    if (index === "main") {
      if (product.gallery.length === 0) return;
      adminStore.update(product.id, { mainImage: product.gallery[0], gallery: product.gallery.slice(1) });
    } else {
      adminStore.update(product.id, { gallery: product.gallery.filter((_, i) => i !== index) });
    }
    setSelectedImages(prev => { const n = new Set(prev); n.delete(String(index)); return n; });
  };

  const deleteSelectedImages = () => {
    if (!product) return;
    const indices = [...selectedImages].map(s => s === "main" ? "main" : Number(s)).sort((a, b) => a === "main" ? -1 : b === "main" ? 1 : (Number(a) - Number(b)));
    let mainImg = product.mainImage;
    let gallery = [...product.gallery];
    for (const idx of indices) {
      if (idx === "main") {
        if (gallery.length > 0) { mainImg = gallery[0]; gallery = gallery.slice(1); }
      } else {
        gallery = gallery.filter((_, i) => i !== idx);
      }
    }
    adminStore.update(product.id, { mainImage: mainImg, gallery });
    setSelectedImages(new Set());
  };

  const saveEditImage = (index: number | "main", url: string) => {
    if (!product || !url.trim()) return;
    if (index === "main") {
      adminStore.update(product.id, { mainImage: url.trim() });
    } else {
      const newGallery = [...product.gallery];
      newGallery[index] = url.trim();
      adminStore.update(product.id, { gallery: newGallery });
    }
    setEditingImg(null);
  };

  const saveEditorImage = (newUrl: string) => {
    if (!product || !editorImg) return;
    if (editorImg.index === "main") {
      adminStore.update(product.id, { mainImage: newUrl });
    } else {
      const newGallery = [...product.gallery];
      newGallery[editorImg.index] = newUrl;
      adminStore.update(product.id, { gallery: newGallery });
    }
    setEditorImg(null);
    toast({ title: "تم التعديل", description: "تم تعديل الصورة بنجاح" });
  };

  const deleteVideo = () => {
    if (!product) return;
    adminStore.update(product.id, { videoUrl: undefined });
    form.setValue("videoUrl", "");
  };

  if (!product) {
    return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>;
  }

  const onSubmit = (data: FormValues) => {
    adminStore.update(product.id, {
      ...data,
      videoUrl: data.videoUrl || undefined,
    });
    toast({
      title: "تم الحفظ",
      description: "تم تحديث بيانات المنتج بنجاح",
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    adminStore.deleteReview(product.id, reviewId);
    toast({
      title: "تم الحذف",
      description: "تم حذف التقييم بنجاح",
    });
  };

  return (
    <div className="space-y-0 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")} className="h-9 w-9">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{product.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{product.sku}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{product.category} / {product.subCategory}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={product.status === "active" ? "default" : "secondary"}
              className={`${product.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}`}>
              {product.status === "active" ? "نشط" : "مخفي"}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-pink-500 bg-pink-50 dark:bg-pink-950/30 rounded-full px-2 py-0.5">
                <Heart className="h-3 w-3 fill-pink-500" />
                <span className="text-xs font-bold">{product.favoritesCount}</span>
              </div>
              <div className="flex items-center gap-1 text-primary bg-primary/5 rounded-full px-2 py-0.5">
                <span className="text-xs font-bold">{product.commission} ج.م</span>
                <span className="text-[10px] text-muted-foreground">عمولة</span>
              </div>
            </div>
            <div className="text-left border-r pr-3">
              <div className="text-lg font-bold text-primary">{product.price} ج.م</div>
              <div className="text-[10px] text-muted-foreground">مخزون: {product.quantity}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-0 border-l">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0" id="product-form">

              {/* Basic Info */}
              <div className="p-6 border-b">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">المعلومات الأساسية</h2>
                <div className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem><FormLabel>السعر (ج.م)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>الكمية</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="sku" render={({ field }) => (
                      <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>الحالة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="hidden">مخفي</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>القسم</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر القسم" /></SelectTrigger></FormControl>
                          <SelectContent>{categoriesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="subCategory" render={({ field }) => (
                      <FormItem><FormLabel>القسم الفرعي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="p-6 border-b">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">المواصفات والشحن</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>الوزن (كجم)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="length" render={({ field }) => (
                    <FormItem><FormLabel>الطول (سم)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="width" render={({ field }) => (
                    <FormItem><FormLabel>العرض (سم)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="minOrder" render={({ field }) => (
                    <FormItem><FormLabel>الحد الأدنى للطلب</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem><FormLabel>الخامة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="factoryName" render={({ field }) => (
                    <FormItem><FormLabel>اسم المصنع</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="commission" render={({ field }) => (
                    <FormItem><FormLabel>العمولة (ج.م)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="mt-4">
                  <FormField control={form.control} name="videoUrl" render={({ field }) => (
                    <FormItem><FormLabel>رابط الفيديو (اختياري)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pr-9" placeholder="https://youtube.com/..." {...field} />
                        </div>
                      </FormControl><FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

            </form>
          </Form>

          {/* Variants */}
          <div className="p-6 border-b">
            <Tabs defaultValue="variants" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-10">
                <TabsTrigger value="variants" className="text-xs">المتغيرات ({product.attributeType})</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs">مواصفات إضافية</TabsTrigger>
              </TabsList>
              <TabsContent value="variants" className="mt-4">
                {product.attributeType === "none" && <div className="text-center py-8 text-muted-foreground text-sm">لا توجد متغيرات</div>}
                {product.attributeType === "colors" && (
                  <Table><TableHeader><TableRow><TableHead>اللون</TableHead><TableHead>السعر</TableHead><TableHead>الكمية</TableHead></TableRow></TableHeader>
                    <TableBody>{product.colors.map(c => <TableRow key={c.id}><TableCell className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: c.code }} />{c.name}</TableCell><TableCell>{c.price} ج.م</TableCell><TableCell>{c.quantity}</TableCell></TableRow>)}</TableBody>
                  </Table>
                )}
                {product.attributeType === "sizes" && (
                  <Table><TableHeader><TableRow><TableHead>المقاس</TableHead><TableHead>السعر</TableHead><TableHead>الكمية</TableHead></TableRow></TableHeader>
                    <TableBody>{product.sizes.map(s => <TableRow key={s.id}><TableCell className="font-bold">{s.size}</TableCell><TableCell>{s.price} ج.م</TableCell><TableCell>{s.quantity}</TableCell></TableRow>)}</TableBody>
                  </Table>
                )}
                {product.attributeType === "both" && (
                  <Table><TableHeader><TableRow><TableHead>اللون</TableHead><TableHead>المقاس</TableHead><TableHead>السعر</TableHead><TableHead>الكمية</TableHead></TableRow></TableHeader>
                    <TableBody>{product.combos.map(c => <TableRow key={c.id}><TableCell className="flex items-center gap-2"><div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: c.colorCode }} />{c.color}</TableCell><TableCell className="font-bold">{c.size}</TableCell><TableCell>{c.price} ج.م</TableCell><TableCell>{c.quantity}</TableCell></TableRow>)}</TableBody>
                  </Table>
                )}
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                {product.customAttrs.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">لا توجد مواصفات إضافية</div> : (
                  <Table><TableHeader><TableRow><TableHead>الخاصية</TableHead><TableHead>القيمة</TableHead></TableRow></TableHeader>
                    <TableBody>{product.customAttrs.map(attr => <TableRow key={attr.id}><TableCell className="font-medium">{attr.name}</TableCell><TableCell>{attr.value}</TableCell></TableRow>)}</TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Reviews */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">التقييمات والمراجعات</h2>
              <Badge variant="secondary">{product.reviews.length}</Badge>
            </div>
            {product.reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">لا توجد تقييمات</div>
            ) : (
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">{review.customerName}</div>
                        <div className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < review.stars ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />)}</div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, i) => <div key={i} className="h-14 w-14 rounded overflow-hidden border"><img src={img} alt="" className="h-full w-full object-cover" /></div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-0">
          {/* Images */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold flex items-center gap-1.5"><ImageIcon className="h-4 w-4" /> الصور <Badge variant="secondary" className="text-xs h-5">{allImages.length}</Badge></h3>
              <div className="flex items-center gap-1">
                {selectedImages.size > 0 && (
                  <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={deleteSelectedImages}>
                    <Trash2 className="h-3 w-3 ml-0.5" /> حذف ({selectedImages.size})
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={selectAllImages}>
                  {selectedImages.size === allImages.length ? "إلغاء" : "تحديد"}
                </Button>
              </div>
            </div>

            {/* Main image */}
            <div className="aspect-square rounded-lg border overflow-hidden relative group cursor-pointer mb-3" onClick={() => setLightboxImg(product.mainImage)}>
              <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); setLightboxImg(product.mainImage); }}>
                  <Eye className="h-3.5 w-3.5 ml-1" />عرض
                </Button>
                <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); downloadImage(product.mainImage, `${product.name}_main.jpg`); }}>
                  <Download className="h-3.5 w-3.5 ml-1" />تحميل
                </Button>
                <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); setEditorImg({ index: "main", url: product.mainImage }); }}>
                  <Crop className="h-3.5 w-3.5 ml-1" />تعديل
                </Button>
              </div>
              <div className="absolute top-2 right-2">
                <Checkbox checked={selectedImages.has("main")} onCheckedChange={() => toggleImageSelect("main")}
                  onClick={(e) => e.stopPropagation()} className="bg-white/80 data-[state=checked]:bg-primary h-4 w-4" />
              </div>
            </div>

            {/* Gallery grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {product.gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-md border overflow-hidden relative group cursor-pointer" onClick={() => setLightboxImg(img)}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5">
                    <button onClick={(e) => { e.stopPropagation(); setLightboxImg(img); }} className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"><Eye className="h-3 w-3 text-white" /></button>
                    <button onClick={(e) => { e.stopPropagation(); downloadImage(img, `${product.name}_${i}.jpg`); }} className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"><Download className="h-3 w-3 text-white" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditorImg({ index: i, url: img }); }} className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"><Crop className="h-3 w-3 text-white" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingImg({ index: i, url: img }); }} className="h-6 w-6 rounded bg-white/20 hover:bg-white/40 flex items-center justify-center"><Edit className="h-3 w-3 text-white" /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteImage(i); }} className="h-6 w-6 rounded bg-red-500/80 hover:bg-red-600 flex items-center justify-center"><Trash2 className="h-3 w-3 text-white" /></button>
                  </div>
                  <div className="absolute top-0.5 left-0.5">
                    <Checkbox checked={selectedImages.has(String(i))} onCheckedChange={() => toggleImageSelect(String(i))}
                      onClick={(e) => e.stopPropagation()} className="bg-white/80 data-[state=checked]:bg-blue-500 h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
              <button className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 mt-3">
              <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px]" onClick={downloadAllImages}>
                <Download className="h-3 w-3 ml-0.5" /> تحميل الكل
              </Button>
              {selectedImages.size > 0 && (
                <Button size="sm" variant="outline" className="flex-1 h-8 text-[10px]" onClick={downloadSelectedImages}>
                  <Download className="h-3 w-3 ml-0.5" /> تحميل المحدد
                </Button>
              )}
            </div>

            {/* Inline edit */}
            {editingImg && (
              <div className="flex items-center gap-1.5 mt-3 p-2 bg-muted/50 rounded-lg">
                <Input defaultValue={editingImg.url} id="edit-sidebar-img" className="flex-1 h-7 text-xs"
                  onKeyDown={(e) => { if (e.key === "Enter") saveEditImage(editingImg.index, (e.target as HTMLInputElement).value); if (e.key === "Escape") setEditingImg(null); }} autoFocus />
                <Button size="sm" className="h-7 text-[10px] px-2" onClick={() => { const el = document.getElementById("edit-sidebar-img") as HTMLInputElement; if (el) saveEditImage(editingImg.index, el.value); }}>حفظ</Button>
                <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => setEditingImg(null)}>إلغاء</Button>
              </div>
            )}
          </div>

          {/* Video */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3"><Video className="h-4 w-4" /> الفيديو</h3>
            {product.videoUrl ? (
              <div className="space-y-2">
                <div className="aspect-video rounded-lg overflow-hidden border bg-black">
                  {product.videoUrl.includes("youtube.com") || product.videoUrl.includes("youtu.be") ? (
                    <iframe src={product.videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                  ) : product.videoUrl.includes("vimeo.com") ? (
                    <iframe src={product.videoUrl.replace("vimeo.com/", "player.vimeo.com/video/")} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video src={product.videoUrl} controls className="w-full h-full" />
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => window.open(product.videoUrl, "_blank")}>
                    <Eye className="h-3 w-3 ml-0.5" /> فتح
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px]" onClick={() => downloadImage(product.videoUrl!, `${product.name}_video.mp4`)}>
                    <Download className="h-3 w-3 ml-0.5" /> تحميل
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={deleteVideo}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                <Play className="h-8 w-8 mb-1 opacity-30" />
                <p className="text-[10px]">لا يوجد فيديو</p>
              </div>
            )}
          </div>

          {/* Supplier */}
          <div className="p-4">
            <div className="bg-muted/30 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5"><Building2 className="h-4 w-4" /> بيانات المورد</h3>
                <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 text-destructive hover:bg-destructive/10"
                  onClick={() => { if (confirm("هل تريد حذف هذا المورد من المنتج؟")) { adminStore.update(product.id, { supplier: { ...product.supplier, name: "", phone: "", email: "", address: "", companyName: "", averageRating: 0, type: "", loginType: "", image: "", logo: "", fcm: "", status: 0, walletNumber: "", instapayNumber: "", whatsappNumber: "", callNumber: "", emailVerifiedAt: "", invitationCode: "", marketerInvitationCode: "", points: 0, wallet: 0, isFirstOrder: 0, countryId: 0, cityId: 0, note: "", howKnowUs: "", typeOfBusiness: "", workingHours: "", createdAt: "", updatedAt: "" } }); toast({ title: "تم الحذف", description: "تم حذف بيانات المورد" }); } }}>
                  <Trash2 className="h-2.5 w-2.5 ml-0.5" /> حذف
                </Button>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm truncate">{product.supplier.name}</p>
                    <span className="text-[10px] text-muted-foreground">({product.supplier.companyName})</span>
                    <button onClick={() => { navigator.clipboard.writeText(product.supplier.name); toast({ title: "تم النسخ", description: "تم نسخ اسم المورد" }); }}
                      className="text-muted-foreground hover:text-foreground transition-colors" title="نسخ الاسم">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < Math.round(product.supplier.averageRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}
                    <span className="text-xs text-muted-foreground mr-1">{product.supplier.averageRating}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">ID: {product.supplier.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{product.supplier.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>النوع: <span className="font-medium text-foreground">{product.supplier.typeOfBusiness}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{product.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span dir="ltr">{product.supplier.phone}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <a href={`tel:${product.supplier.phone}`} className="flex-1"><Button variant="outline" size="sm" className="w-full text-[10px] h-7 gap-1"><Phone className="h-3 w-3" /> اتصال</Button></a>
                <a href={`https://wa.me/${product.supplier.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1 border-emerald-300 text-emerald-700">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    واتساب
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Editor */}
      {editorImg && (
        <ImageEditor src={editorImg.url} onSave={saveEditorImage} onClose={() => setEditorImg(null)} />
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 left-4 text-white/80 hover:text-white" onClick={() => setLightboxImg(null)}><X className="h-8 w-8" /></button>
          <img src={lightboxImg} alt="عرض كامل" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:right-64 p-3 bg-background/95 backdrop-blur border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-end z-30">
        <Button size="sm" type="submit" form="product-form" className="px-6 h-9">
          <Save className="mr-2 h-4 w-4" /> حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}