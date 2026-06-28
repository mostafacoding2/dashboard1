import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useProducts, adminStore, categoriesList } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Eye, Edit, Trash2, MoreHorizontal, Plus, Search, ChevronDown, X } from "lucide-react";

const ALL_COLORS = [
  { name: "أحمر", code: "#ef4444" },
  { name: "أزرق", code: "#3b82f6" },
  { name: "أخضر", code: "#22c55e" },
  { name: "أسود", code: "#111827" },
  { name: "أبيض", code: "#e5e7eb" },
  { name: "بيج", code: "#d6c4a8" },
];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductsList() {
  const products = useProducts();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);

  const effectiveMax = maxPrice || 1000;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(search) || p.sku.includes(search);
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    const effectivePrice = p.price;
    const matchesPrice = effectivePrice >= priceRange[0] && effectivePrice <= (priceRange[1] === 0 ? effectiveMax : priceRange[1]);

    const matchesColor = selectedColors.length === 0 || (() => {
      if (p.attributeType === "colors") return p.colors.some(c => selectedColors.includes(c.name));
      if (p.attributeType === "both") return p.combos.some(c => selectedColors.includes(c.color));
      return false;
    })();

    const matchesSize = selectedSizes.length === 0 || (() => {
      if (p.attributeType === "sizes") return p.sizes.some(s => selectedSizes.includes(s.size));
      if (p.attributeType === "both") return p.combos.some(c => selectedSizes.includes(c.size));
      return false;
    })();

    return matchesSearch && matchesCategory && matchesStatus && matchesPrice && matchesColor && matchesSize;
  });

  const toggleColor = (name: string) => {
    setSelectedColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < effectiveMax;

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, effectiveMax]);
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  const confirmDelete = () => {
    if (deleteId) {
      adminStore.remove(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">المنتجات</h1>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Row 1: Search + Category + Status */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-search-products"
                placeholder="ابحث بالاسم أو رمز SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter" className="w-full sm:w-[160px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {categoriesList.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" className="w-full sm:w-[140px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="hidden">مخفي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Color + Size + Price filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Color filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="button-filter-colors"
                  className={selectedColors.length > 0 ? "border-primary text-primary" : ""}
                >
                  الألوان
                  {selectedColors.length > 0 && (
                    <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {selectedColors.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" align="start">
                <p className="text-sm font-medium mb-3 text-foreground">تصفية بالألوان</p>
                <div className="space-y-2">
                  {ALL_COLORS.map(color => (
                    <div key={color.name} className="flex items-center gap-2">
                      <Checkbox
                        id={`color-${color.name}`}
                        data-testid={`checkbox-color-${color.name}`}
                        checked={selectedColors.includes(color.name)}
                        onCheckedChange={() => toggleColor(color.name)}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: color.code }}
                      />
                      <label htmlFor={`color-${color.name}`} className="text-sm cursor-pointer">
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedColors.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => setSelectedColors([])}>
                    مسح الألوان
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Size filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="button-filter-sizes"
                  className={selectedSizes.length > 0 ? "border-primary text-primary" : ""}
                >
                  الأحجام
                  {selectedSizes.length > 0 && (
                    <Badge className="mr-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {selectedSizes.length}
                    </Badge>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-3" align="start">
                <p className="text-sm font-medium mb-3 text-foreground">تصفية بالأحجام</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(size => (
                    <button
                      key={size}
                      data-testid={`button-size-${size}`}
                      onClick={() => toggleSize(size)}
                      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground" onClick={() => setSelectedSizes([])}>
                    مسح الأحجام
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Price range filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="button-filter-price"
                  className={(priceRange[0] > 0 || priceRange[1] < effectiveMax) ? "border-primary text-primary" : ""}
                >
                  السعر
                  {(priceRange[0] > 0 || priceRange[1] < effectiveMax) && (
                    <span className="mr-2 text-xs font-medium">
                      {priceRange[0]}–{priceRange[1]} ج.م
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <p className="text-sm font-medium mb-4 text-foreground">نطاق السعر</p>
                <Slider
                  data-testid="slider-price-range"
                  min={0}
                  max={effectiveMax}
                  step={25}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(v) => setPriceRange([v[0], v[1]])}
                  className="mb-4"
                />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">من</label>
                    <Input
                      data-testid="input-price-min"
                      type="number"
                      value={priceRange[0]}
                      min={0}
                      max={priceRange[1]}
                      onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                      className="h-8 text-sm"
                    />
                  </div>
                  <span className="text-muted-foreground mt-4">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
                    <Input
                      data-testid="input-price-max"
                      type="number"
                      value={priceRange[1]}
                      min={priceRange[0]}
                      max={effectiveMax}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {priceRange[0]} ج.م — {priceRange[1]} ج.م
                </p>
                {(priceRange[0] > 0 || priceRange[1] < effectiveMax) && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" onClick={() => setPriceRange([0, effectiveMax])}>
                    مسح السعر
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Clear all */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-clear-filters"
                onClick={clearAllFilters}
                className="text-muted-foreground gap-1"
              >
                <X className="h-3.5 w-3.5" />
                مسح الكل
              </Button>
            )}

            {/* Result count */}
            <span className="text-sm text-muted-foreground mr-auto">
              {filteredProducts.length} منتج
            </span>
          </div>

          {/* Active filter chips */}
          {(selectedColors.length > 0 || selectedSizes.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedColors.map(c => {
                const color = ALL_COLORS.find(col => col.name === c);
                return (
                  <Badge key={c} variant="secondary" className="gap-1.5 pr-1">
                    <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: color?.code }} />
                    {c}
                    <button onClick={() => toggleColor(c)} className="hover:text-foreground text-muted-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {selectedSizes.map(s => (
                <Badge key={s} variant="secondary" className="gap-1.5 pr-1">
                  {s}
                  <button onClick={() => toggleSize(s)} className="hover:text-foreground text-muted-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">صورة</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>رمز SKU</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      لا توجد منتجات مطابقة للفلاتر المحددة.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                          <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price} ج.م</TableCell>
                      <TableCell>
                        <span className={product.quantity < 15 ? "text-destructive font-medium" : ""}>
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.status === "active" ? "default" : "secondary"}
                          className={product.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                          data-testid={`status-product-${product.id}`}
                        >
                          {product.status === "active" ? "نشط" : "مخفي"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${product.id}`}>
                              <span className="sr-only">فتح القائمة</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <Link href={`/products/${product.id}`}>
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="h-4 w-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => adminStore.toggleStatus(product.id)}>
                              <Eye className="h-4 w-4 ml-2" />
                              {product.status === "active" ? "إخفاء" : "تنشيط"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => setDeleteId(product.id)}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج نهائياً من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start">
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mr-2"
            >
              حذف
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
