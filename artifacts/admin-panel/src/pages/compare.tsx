import { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/store";
import { useSearch } from "wouter";
import type { Product } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Star, X, Plus, TrendingUp, Eye, Package, ShoppingCart,
  CheckCircle2, XCircle, ArrowUpDown, Trophy, AlertTriangle,
} from "lucide-react";

const MAX_COMPARE = 4;

function avgRating(reviews: { stars: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
}

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
        ))}
      </div>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

type WinnerMap = Record<string, string | null>;

function computeWinners(products: Product[]): WinnerMap {
  if (products.length < 2) return {};
  const winners: WinnerMap = {};

  const lowestPrice = Math.min(...products.map(p => p.price));
  const lowestPriceIds = products.filter(p => p.price === lowestPrice).map(p => p.id);
  winners.price = lowestPriceIds.length === 1 ? lowestPriceIds[0] : null;

  const highestStock = Math.max(...products.map(p => p.quantity));
  const highestStockIds = products.filter(p => p.quantity === highestStock).map(p => p.id);
  winners.stock = highestStockIds.length === 1 ? highestStockIds[0] : null;

  const highestSales = Math.max(...products.map(p => p.sales));
  const highestSalesIds = products.filter(p => p.sales === highestSales).map(p => p.id);
  winners.sales = highestSalesIds.length === 1 ? highestSalesIds[0] : null;

  const highestViews = Math.max(...products.map(p => p.views));
  const highestViewsIds = products.filter(p => p.views === highestViews).map(p => p.id);
  winners.views = highestViewsIds.length === 1 ? highestViewsIds[0] : null;

  const ratings = products.map(p => ({ id: p.id, r: avgRating(p.reviews) }));
  const highestRating = Math.max(...ratings.map(r => r.r));
  const highestRatingIds = ratings.filter(r => r.r === highestRating).map(r => r.id);
  winners.rating = highestRatingIds.length === 1 ? highestRatingIds[0] : null;

  return winners;
}

function WinnerBadge({ isWinner }: { isWinner: boolean }) {
  if (!isWinner) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
      <Trophy className="h-3 w-3" />
      الأفضل
    </span>
  );
}

export default function ComparePage() {
  const products = useProducts();
  const search = useSearch();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const params = new URLSearchParams(search);
    const ids = params.get("ids");
    return ids ? ids.split(",").filter(Boolean) : [];
  });
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const [pickerValue, setPickerValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ids = params.get("ids");
    if (ids) {
      setSelectedIds(ids.split(",").filter(Boolean));
    }
  }, [search]);

  const selected = useMemo(
    () => selectedIds.map(id => products.find(p => p.id === id)!).filter(Boolean),
    [selectedIds, products]
  );

  const winners = useMemo(() => computeWinners(selected), [selected]);

  const availableToAdd = products.filter(p => !selectedIds.includes(p.id));

  const addProduct = (id: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id]);
    }
    setAddingSlot(null);
    setPickerValue("");
  };

  const removeProduct = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const slots = Array.from({ length: Math.min(MAX_COMPARE, selected.length + (selected.length < MAX_COMPARE ? 1 : 0)) });

  const rows: { label: string; key: string; render: (p: Product) => React.ReactNode }[] = [
    {
      label: "الحالة",
      key: "status",
      render: (p) => (
        <Badge variant={p.status === "active" ? "default" : "secondary"}
          className={p.status === "active" ? "bg-green-500" : ""}>
          {p.status === "active" ? "نشط" : "مخفي"}
        </Badge>
      ),
    },
    {
      label: "السعر",
      key: "price",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">{p.price} ج.م</span>
          <WinnerBadge isWinner={winners.price === p.id} />
        </div>
      ),
    },
    {
      label: "المخزون",
      key: "stock",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`text-lg font-bold ${p.quantity < 15 ? "text-destructive" : ""}`}>
            {p.quantity}
            {p.quantity < 15 && <AlertTriangle className="h-3.5 w-3.5 inline mr-1 text-destructive" />}
          </span>
          <WinnerBadge isWinner={winners.stock === p.id} />
        </div>
      ),
    },
    {
      label: "المبيعات",
      key: "sales",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">{p.sales}</span>
          <WinnerBadge isWinner={winners.sales === p.id} />
        </div>
      ),
    },
    {
      label: "المشاهدات",
      key: "views",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">{p.views.toLocaleString("ar-EG")}</span>
          <WinnerBadge isWinner={winners.views === p.id} />
        </div>
      ),
    },
    {
      label: "التقييم",
      key: "rating",
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <StarDisplay rating={avgRating(p.reviews)} count={p.reviews.length} />
          <WinnerBadge isWinner={winners.rating === p.id} />
        </div>
      ),
    },
    {
      label: "القسم",
      key: "category",
      render: (p) => (
        <div className="text-center text-sm">
          <div className="font-medium">{p.category}</div>
          <div className="text-xs text-muted-foreground">{p.subCategory}</div>
        </div>
      ),
    },
    {
      label: "الخامة",
      key: "material",
      render: (p) => <span className="text-sm text-center block">{p.material}</span>,
    },
    {
      label: "المصنع",
      key: "factory",
      render: (p) => <span className="text-sm text-center block">{p.factoryName}</span>,
    },
    {
      label: "الوزن",
      key: "weight",
      render: (p) => <span className="text-sm text-center block">{p.weight} كجم</span>,
    },
    {
      label: "الأبعاد",
      key: "dims",
      render: (p) => <span className="text-sm text-center block">{p.length}×{p.width} سم</span>,
    },
    {
      label: "الحد الأدنى للطلب",
      key: "minOrder",
      render: (p) => <span className="text-sm text-center block">{p.minOrder}</span>,
    },
    {
      label: "المورد",
      key: "supplier",
      render: (p) => (
        <div className="text-center text-sm">
          <div className="font-medium">{p.supplier.name}</div>
          <div className="flex justify-center items-center gap-0.5 mt-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{p.supplier.rating}</span>
          </div>
        </div>
      ),
    },
    {
      label: "الألوان",
      key: "colors",
      render: (p) => {
        if (p.attributeType === "none" || (p.attributeType === "sizes" && p.colors.length === 0)) {
          return <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
        }
        const colors = p.attributeType === "colors" ? p.colors :
          p.attributeType === "both" ? p.combos.map(c => ({ name: c.color, code: c.colorCode, id: c.id })) : [];
        const unique = [...new Map(colors.map(c => [c.name, c])).values()];
        if (!unique.length) return <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {unique.slice(0, 6).map(c => (
              <span key={c.id} title={c.name}
                className="h-5 w-5 rounded-full border border-border inline-block"
                style={{ backgroundColor: c.code }} />
            ))}
          </div>
        );
      },
    },
    {
      label: "المقاسات",
      key: "sizes",
      render: (p) => {
        const sizes = p.attributeType === "sizes" ? p.sizes :
          p.attributeType === "both" ? p.combos.map(c => ({ size: c.size, id: c.id })) : [];
        const unique = [...new Set(sizes.map(s => s.size))];
        if (!unique.length) return <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {unique.map(s => (
              <span key={s} className="text-xs px-1.5 py-0.5 bg-muted rounded border border-border font-medium">{s}</span>
            ))}
          </div>
        );
      },
    },
    {
      label: "صور المنتج",
      key: "gallery",
      render: (p) => (
        <div className="flex items-center justify-center gap-1">
          {p.gallery.length > 0
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
          <span className="text-xs text-muted-foreground">{p.gallery.length + 1} صورة</span>
        </div>
      ),
    },
    {
      label: "فيديو",
      key: "video",
      render: (p) => p.videoUrl
        ? <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
        : <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">جدول البينيه</h1>
          <p className="text-muted-foreground text-sm mt-1">قارن بين المنتجات جنباً إلى جنب</p>
        </div>
        {selected.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
            <X className="h-4 w-4 ml-1" />
            مسح الكل
          </Button>
        )}
      </div>

      {/* Empty state */}
      {selected.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <ArrowUpDown className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">ابدأ بإضافة منتجات للمقارنة</p>
              <p className="text-sm text-muted-foreground mt-1">يمكنك مقارنة حتى {MAX_COMPARE} منتجات جنباً إلى جنب</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {products.slice(0, 4).map(p => (
                <Button key={p.id} variant="outline" size="sm" onClick={() => addProduct(p.id)}>
                  <Plus className="h-3.5 w-3.5 ml-1" />
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison table */}
      {selected.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Product header cards */}
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `200px repeat(${selected.length + (selected.length < MAX_COMPARE ? 1 : 0)}, 1fr)` }}>
              {/* Label column header */}
              <div className="flex items-end pb-2">
                <span className="text-sm font-medium text-muted-foreground">المواصفة</span>
              </div>

              {/* Selected products */}
              {selected.map((product) => {
                const rating = avgRating(product.reviews);
                return (
                  <Card key={product.id} className="relative overflow-hidden">
                    <Button variant="ghost" size="icon"
                      className="absolute top-2 left-2 h-7 w-7 text-muted-foreground hover:text-foreground z-10"
                      onClick={() => removeProduct(product.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <CardContent className="p-3 text-center space-y-2">
                      <div className="aspect-square w-full max-w-[120px] mx-auto rounded-lg overflow-hidden bg-muted">
                        <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
                      </div>
                      <StarDisplay rating={rating} count={product.reviews.length} />
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add product slot */}
              {selected.length < MAX_COMPARE && (
                <Card className="border-dashed bg-muted/20">
                  <CardContent className="p-3 flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                    {addingSlot !== null ? (
                      <div className="w-full space-y-2">
                        <p className="text-xs text-center text-muted-foreground">اختر منتجاً</p>
                        <Select value={pickerValue} onValueChange={(v) => { setPickerValue(v); addProduct(v); }}>
                          <SelectTrigger className="w-full text-xs h-8">
                            <SelectValue placeholder="المنتجات..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableToAdd.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                <div className="flex items-center gap-2">
                                  <img src={p.mainImage} alt={p.name} className="h-5 w-5 rounded object-cover" />
                                  <span className="text-xs">{p.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setAddingSlot(null)}>إلغاء</Button>
                      </div>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">أضف منتجاً للمقارنة</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setAddingSlot(selected.length)}>
                          <Plus className="h-3.5 w-3.5 ml-1" />
                          إضافة
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Comparison rows */}
            <Card>
              <CardContent className="p-0">
                {rows.map((row, rowIdx) => (
                  <div key={row.key}>
                    <div className="grid items-center py-3 px-4" style={{ gridTemplateColumns: `200px repeat(${selected.length + (selected.length < MAX_COMPARE ? 1 : 0)}, 1fr)` }}>
                      {/* Row label */}
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        {row.label}
                      </div>
                      {/* Values */}
                      {selected.map((product) => (
                        <div key={product.id} className="flex items-center justify-center px-2 py-1">
                          {row.render(product)}
                        </div>
                      ))}
                      {/* Empty slot filler */}
                      {selected.length < MAX_COMPARE && <div />}
                    </div>
                    {rowIdx < rows.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Summary score */}
            {selected.length >= 2 && (
              <Card className="mt-4 bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    ملخص المقارنة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                    <div className="text-sm font-medium text-muted-foreground self-center">النقاط الإجمالية</div>
                    {selected.map((product) => {
                      const score = [
                        winners.price === product.id,
                        winners.stock === product.id,
                        winners.sales === product.id,
                        winners.views === product.id,
                        winners.rating === product.id,
                      ].filter(Boolean).length;
                      return (
                        <div key={product.id} className="text-center">
                          <div className="text-3xl font-bold text-primary">{score}</div>
                          <div className="text-xs text-muted-foreground">من 5 نقاط</div>
                          {score >= 3 && (
                            <Badge className="mt-1 bg-amber-500 text-white text-xs">
                              <Trophy className="h-3 w-3 ml-1" />
                              الفائز
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Quick add from all products */}
      {selected.length > 0 && selected.length < MAX_COMPARE && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">إضافة سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.slice(0, 8).map(p => (
                <button key={p.id} onClick={() => addProduct(p.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm">
                  <img src={p.mainImage} alt={p.name} className="h-6 w-6 rounded object-cover" />
                  <span>{p.name}</span>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
