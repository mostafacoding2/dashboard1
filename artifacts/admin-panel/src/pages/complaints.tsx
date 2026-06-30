import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, AlertTriangle, MessageSquare, Clock, CheckCircle2, XCircle, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Complaints() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const complaints = useMemo(() => {
    const types = ["شكوى", "بلاغ", "استفسار", "اقتراح"];
    const reasons = ["تأخر التوصيل", "منتج معيب", "لا يطابق الوصف", "خدمة العملاء", "مشكلة في الدفع", "إرجاع المنتج"];
    const mockComplaints = Array.from({ length: 20 }, (_, i) => ({
      id: `CMP-${6000 + i}`,
      customer: `عميل ${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      message: `أريد الإبلاغ عن مشكلة تتعلق بـ ${reasons[Math.floor(Math.random() * reasons.length)]}`,
      status: ["pending", "in_progress", "resolved", "rejected"][Math.floor(Math.random() * 4)] as string,
      priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as string,
      date: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return mockComplaints.filter(c => {
      const matchesSearch = !search || c.customer.includes(search) || c.reason.includes(search) || c.id.includes(search);
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    rejected: complaints.filter(c => c.status === "rejected").length,
    highPriority: complaints.filter(c => c.priority === "high").length,
  }), [complaints]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      pending: "قيد المراجعة",
      in_progress: "قيد المعالجة",
      resolved: "تم الحل",
      rejected: "مرفوض",
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-orange-100 text-orange-800",
      high: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
    };
    return <Badge className={styles[priority]}>{labels[priority]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">الشكاوي والبلاغات</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-1.5" />
            تصدير
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1.5" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي الشكاوي</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Clock className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-xs text-muted-foreground">قيد المراجعة</span>
          <span className="text-base font-bold text-yellow-500">{stats.pending}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs text-muted-foreground">قيد المعالجة</span>
          <span className="text-base font-bold text-blue-500">{stats.inProgress}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">تم الحل</span>
          <span className="text-base font-bold text-green-500">{stats.resolved}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">مرفوض</span>
          <span className="text-base font-bold text-red-500">{stats.rejected}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">أولوية عالية</span>
          <span className="text-base font-bold text-red-500">{stats.highPriority}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالعميل أو السبب..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="resolved">تم الحل</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="شكوى">شكوى</SelectItem>
                <SelectItem value="بلاغ">بلاغ</SelectItem>
                <SelectItem value="استفسار">استفسار</SelectItem>
                <SelectItem value="اقتراح">اقتراح</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم البلاغ</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">السبب</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-mono text-sm">{complaint.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {complaint.customer.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{complaint.customer}</span>
                    </div>
                  </TableCell>
                  <TableCell>{complaint.type}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{complaint.reason}</TableCell>
                  <TableCell>{getPriorityBadge(complaint.priority)}</TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(complaint.date).toLocaleDateString("ar-EG")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}