import { useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Save, Star, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

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
        videoUrl: product.videoUrl || "",
      });
    }
  }, [product, form]);

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
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/products")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">تعديل المنتج</h1>
        <div className="mr-auto">
          <Badge variant={product.status === "active" ? "default" : "secondary"} className={`text-sm py-1 px-3 ${product.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}`}>
            {product.status === "active" ? "نشط" : "مخفي"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="product-form">
              <Card>
                <CardHeader>
                  <CardTitle>المعلومات الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المنتج</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوصف</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر (ج.م)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الكمية المتاحة</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رمز التخزين (SKU)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حالة المنتج</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">نشط</SelectItem>
                              <SelectItem value="hidden">مخفي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>القسم</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر القسم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoriesList.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>القسم الفرعي</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المواصفات والشحن</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوزن (كجم)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الطول (سم)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العرض (سم)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأدنى للطلب</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الخامة</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="factoryName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المصنع</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط فيديو المنتج (اختياري)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input className="pr-9" placeholder="https://..." {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

            </form>
          </Form>

          <Tabs defaultValue="variants" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="variants">المتغيرات ({product.attributeType})</TabsTrigger>
              <TabsTrigger value="custom">مواصفات إضافية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="variants" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {product.attributeType === "none" && (
                    <div className="text-center py-8 text-muted-foreground">لا توجد متغيرات لهذا المنتج</div>
                  )}
                  
                  {product.attributeType === "colors" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اللون</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>الكمية</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.colors.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: c.code }}></div>
                              {c.name}
                            </TableCell>
                            <TableCell>{c.price} ج.م</TableCell>
                            <TableCell>{c.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {product.attributeType === "sizes" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>المقاس</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>الكمية</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.sizes.map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="font-bold">{s.size}</TableCell>
                            <TableCell>{s.price} ج.م</TableCell>
                            <TableCell>{s.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {product.attributeType === "both" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اللون</TableHead>
                          <TableHead>المقاس</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>الكمية</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.combos.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: c.colorCode }}></div>
                              {c.color}
                            </TableCell>
                            <TableCell className="font-bold">{c.size}</TableCell>
                            <TableCell>{c.price} ج.م</TableCell>
                            <TableCell>{c.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {product.customAttrs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">لا توجد مواصفات إضافية</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الخاصية</TableHead>
                          <TableHead>القيمة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.customAttrs.map(attr => (
                          <TableRow key={attr.id}>
                            <TableCell className="font-medium">{attr.name}</TableCell>
                            <TableCell>{attr.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>التقييمات والمراجعات</CardTitle>
            </CardHeader>
            <CardContent>
              {product.reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد تقييمات لهذا المنتج</div>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{review.customerName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {new Date(review.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8" onClick={() => handleDeleteReview(review.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.stars ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                        ))}
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, i) => (
                            <div key={i} className="h-16 w-16 rounded overflow-hidden border">
                              <img src={img} alt="مرفق التقييم" className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">صور المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-md border overflow-hidden relative group">
                <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button variant="secondary" size="sm">تغيير الصورة</Button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.gallery.map((img, i) => (
                  <div key={i} className="aspect-square rounded-md border overflow-hidden">
                    <img src={img} alt={`${product.name} - صورة ${i+1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <button className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                  <ImageIcon className="h-6 w-6 mb-1" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 bg-muted/30">
              <CardTitle className="text-lg">معلومات المورد</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">الاسم</div>
                <div className="font-medium">{product.supplier.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">الهاتف</div>
                <div className="font-medium" dir="ltr">{product.supplier.phone}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</div>
                <div className="font-medium text-sm">{product.supplier.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">التقييم</div>
                <div className="flex items-center gap-1 font-medium">
                  {product.supplier.rating} <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:right-64 p-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end z-30">
        <Button size="lg" type="submit" form="product-form" className="px-8">
          <Save className="mr-2 h-5 w-5 ml-2" />
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}