import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useProducts, adminStore, categoriesList, suppliersList } from "@/store";
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
import { Eye, Edit, Trash2, MoreHorizontal, Plus, Search, ChevronDown, X, Star } from "lucide-react";

const ALL_COLORS = [
  { name: "أحمر", code: "#ef4444" },
  { name: "أزرق", code: "#3b82f6" },
  { name: "أخضر", code: "#22c55e" },
  { name: "أسود", code: "#111827" },
  { name: "أبيض", code: "#e5e7eb" },
  { name: "بيج", code: "#d6c4a8" },
];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

function avgRating(reviews: { stars: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

export default function ProductsList() {
  const products = useProducts();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const effectiveMax = maxPrice || 1000;

  const subCategories = useMemo(() => {
    const base = categoryFilter === "all" ? products : products.filter(p => p.category === categoryFilter);
    return [...new Set(base.map(p => p.subCategory))].filter(Boolean);
  }, [products, categoryFilter]);

  const filteredAndSorted = useMemo(() => {
    let list = products.filter(p => {
      const matchesSearch = p.name.includes(search) || p.sku.includes(search);
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesSubCategory = subCategoryFilter === "all" || p.subCategory === subCategoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesSupplier = supplierFilter === "all" || p.supplier.id === supplierFilter;

      const hi = priceRange[1] === 0 ? effectiveMax : priceRange[1];
      const matchesPrice = p.price >= priceRange[0] && p.price <= hi;

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

      const matchesRating = minRating === 0 || avgRating(p.reviews) >= minRating;

      const created = new Date(p.createdAt).getTime();
      const matchesDateFrom = !dateFrom || created >= new Date(dateFrom).getTime();
      const matchesDateTo = !dateTo || created <= new Date(dateTo + "T23:59:59").getTime();

      return matchesSearch && matchesCategory && matchesSubCategory && matchesStatus &&
        matchesSupplier && matchesPrice && matchesColor && matchesSize && matchesRating &&
        matchesDateFrom && matchesDateTo;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_high": return b.price - a.price;
        case "price_low": return a.price - b.price;
        case "most_views": return b.views - a.views;
        case "most_sales": return b.sales - a.sales;
        case "highest_rating": return avgRating(b.reviews) - avgRating(a.reviews);
        default: return 0;
      }
    });

    return list;
  }, [products, search, categoryFilter, subCategoryFilter, statusFilter, supplierFilter,
    priceRange, effectiveMax, selectedColors, selectedSizes, minRating, dateFrom, dateTo, sortBy]);

  const toggleColor = (name: string) =>
    setSelectedColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0 ||
    priceRange[0] > 0 || priceRange[1] < effectiveMax || minRating > 0 ||
    dateFrom || dateTo || supplierFilter !== "all" || subCategoryFilter !== "all";

  const clearAllFilters = () => {
    setSearch(""); setCategoryFilter("all"); setSubCategoryFilter("all");
    setStatusFilter("all"); setSupplierFilter("all");
    setSelectedColors([]); setSelectedSizes([]);
    setPriceRange([0, effectiveMax]); setMinRating(0);
    setDateFrom(""); setDateTo(""); setSortBy("newest");
  };

  const confirmDelete = () => {
    if (deleteId) { adminStore.remove(deleteId); setDeleteId(null); }
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

          {/* Row 1: Search + Category + Sub-cat + Status + Supplier */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-search-products"
                placeholder="اسم المنتج أو رمز SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setSubCategoryFilter("all"); }}>
              <SelectTrigger data-testid="select-category-filter" className="w-[140px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقسام</SelectItem>
                {categoriesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter} disabled={subCategories.length === 0}>
              <SelectTrigger data-testid="select-subcategory-filter" className="w-[140px]">
                <SelectValue placeholder="القسم الفرعي" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفروع</SelectItem>
                {subCategories.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" className="w-[120px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="hidden">مخفي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger data-testid="select-supplier-filter" className="w-[160px]">
                <SelectValue placeholder="المورد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الموردين</SelectItem>
                {suppliersList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Colors + Sizes + Price + Date + Rating + Sort */}
          <div className="flex flex-wrap gap-3 items-center">

            {/* Colors */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-colors"
                  className={selectedColors.length > 0 ? "border-primary text-primary" : ""}>
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
                <p className="text-sm font-medium mb-3">تصفية بالألوان</p>
                <div className="space-y-2">
                  {ALL_COLORS.map(color => (
                    <div key={color.name} className="flex items-center gap-2">
                      <Checkbox id={`color-${color.name}`} checked={selectedColors.includes(color.name)}
                        onCheckedChange={() => toggleColor(color.name)} />
                      <span className="h-4 w-4 rounded-full border border-border flex-shrink-0"
                        style={{ backgroundColor: color.code }} />
                      <label htmlFor={`color-${color.name}`} className="text-sm cursor-pointer">{color.name}</label>
                    </div>
                  ))}
                </div>
                {selectedColors.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground"
                    onClick={() => setSelectedColors([])}>مسح الألوان</Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Sizes */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-sizes"
                  className={selectedSizes.length > 0 ? "border-primary text-primary" : ""}>
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
                <p className="text-sm font-medium mb-3">تصفية بالأحجام</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(size => (
                    <button key={size} data-testid={`button-size-${size}`} onClick={() => toggleSize(size)}
                      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${selectedSizes.includes(size)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:border-primary"}`}>
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground"
                    onClick={() => setSelectedSizes([])}>مسح الأحجام</Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Price */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-price"
                  className={(priceRange[0] > 0 || priceRange[1] < effectiveMax) ? "border-primary text-primary" : ""}>
                  السعر
                  {(priceRange[0] > 0 || priceRange[1] < effectiveMax) && (
                    <span className="mr-2 text-xs font-medium">{priceRange[0]}–{priceRange[1]}</span>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <p className="text-sm font-medium mb-4">نطاق السعر</p>
                <Slider min={0} max={effectiveMax} step={25}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(v) => setPriceRange([v[0], v[1]])}
                  className="mb-4" />
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">من</label>
                    <Input type="number" value={priceRange[0]} min={0} max={priceRange[1]}
                      onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                      className="h-8 text-sm" />
                  </div>
                  <span className="text-muted-foreground mt-4">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
                    <Input type="number" value={priceRange[1]} min={priceRange[0]} max={effectiveMax}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                      className="h-8 text-sm" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">{priceRange[0]} ج.م — {priceRange[1]} ج.م</p>
                {(priceRange[0] > 0 || priceRange[1] < effectiveMax) && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground"
                    onClick={() => setPriceRange([0, effectiveMax])}>مسح السعر</Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Date range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-date"
                  className={(dateFrom || dateTo) ? "border-primary text-primary" : ""}>
                  التاريخ
                  {(dateFrom || dateTo) && (
                    <span className="mr-2 text-xs font-medium">
                      {dateFrom || "..."} {dateTo ? `← ${dateTo}` : ""}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <p className="text-sm font-medium mb-3">فترة الإنشاء</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">من تاريخ</label>
                    <Input data-testid="input-date-from" type="date" value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">إلى تاريخ</label>
                    <Input data-testid="input-date-to" type="date" value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                {(dateFrom || dateTo) && (
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground"
                    onClick={() => { setDateFrom(""); setDateTo(""); }}>مسح التاريخ</Button>
                )}
              </PopoverContent>
            </Popover>

            {/* Rating */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" data-testid="button-filter-rating"
                  className={minRating > 0 ? "border-primary text-primary" : ""}>
                  التقييم
                  {minRating > 0 && (
                    <span className="mr-2 text-xs font-medium">{minRating}+ نجوم</span>
                  )}
                  <ChevronDown className="h-4 w-4 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" align="start">
                <p className="text-sm font-medium mb-3">الحد الأدنى للتقييم</p>
                <div className="space-y-1">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button key={n} data-testid={`button-rating-${n}`}
                      onClick={() => setMinRating(n)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors text-right ${minRating === n ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                      {n === 0 ? (
                        <span className="text-muted-foreground">كل التقييمات</span>
                      ) : (
                        <>
                          <span>{n}+ نجوم</span>
                          <span className="flex mr-auto">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                            ))}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort" className="w-[160px]">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                <SelectItem value="price_high">الأعلى سعراً</SelectItem>
                <SelectItem value="price_low">الأقل سعراً</SelectItem>
                <SelectItem value="most_views">الأكثر مشاهدة</SelectItem>
                <SelectItem value="most_sales">الأكثر مبيعاً</SelectItem>
                <SelectItem value="highest_rating">الأعلى تقييماً</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear + count */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" data-testid="button-clear-filters"
                onClick={clearAllFilters} className="text-muted-foreground gap-1">
                <X className="h-3.5 w-3.5" />
                مسح الكل
              </Button>
            )}
            <span className="text-sm text-muted-foreground mr-auto">
              {filteredAndSorted.length} منتج
            </span>
          </div>

          {/* Active filter chips */}
          {(selectedColors.length > 0 || selectedSizes.length > 0 || minRating > 0 || dateFrom || dateTo || subCategoryFilter !== "all" || supplierFilter !== "all") && (
            <div className="flex flex-wrap gap-2">
              {selectedColors.map(c => {
                const color = ALL_COLORS.find(col => col.name === c);
                return (
                  <Badge key={c} variant="secondary" className="gap-1.5 pr-1">
                    <span className="h-3 w-3 rounded-full inline-block border" style={{ backgroundColor: color?.code }} />
                    {c}
                    <button onClick={() => toggleColor(c)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                  </Badge>
                );
              })}
              {selectedSizes.map(s => (
                <Badge key={s} variant="secondary" className="gap-1.5 pr-1">
                  {s}
                  <button onClick={() => toggleSize(s)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  {minRating}+ نجوم
                  <button onClick={() => setMinRating(0)} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {subCategoryFilter !== "all" && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  {subCategoryFilter}
                  <button onClick={() => setSubCategoryFilter("all")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {supplierFilter !== "all" && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  {suppliersList.find(s => s.id === supplierFilter)?.name}
                  <button onClick={() => setSupplierFilter("all")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {dateFrom && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  من: {dateFrom}
                  <button onClick={() => setDateFrom("")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {dateTo && (
                <Badge variant="secondary" className="gap-1.5 pr-1">
                  إلى: {dateTo}
                  <button onClick={() => setDateTo("")} className="hover:text-foreground text-muted-foreground"><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">صورة</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>المبيعات</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      لا توجد منتجات مطابقة للفلاتر المحددة.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSorted.map((product) => {
                    const rating = avgRating(product.reviews);
                    return (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                            <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.subCategory}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{product.sku}</TableCell>
                        <TableCell className="text-sm">{product.category}</TableCell>
                        <TableCell className="font-medium">{product.price} ج.م</TableCell>
                        <TableCell>
                          <span className={product.quantity < 15 ? "text-destructive font-medium" : ""}>
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{product.sales}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{rating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.status === "active" ? "default" : "secondary"}
                            className={product.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                            data-testid={`status-product-${product.id}`}>
                            {product.status === "active" ? "نشط" : "مخفي"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`button-actions-${product.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <Link href={`/products/${product.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit className="h-4 w-4 ml-2" />تعديل
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
                                data-testid={`button-delete-${product.id}`}>
                                <Trash2 className="h-4 w-4 ml-2" />حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse sm:justify-start">
            <AlertDialogAction onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 mr-2">حذف</AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
