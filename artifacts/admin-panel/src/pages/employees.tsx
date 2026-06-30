import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Printer, Users, UserCheck, UserX, DollarSign, Shield, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Employees() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const employees = useMemo(() => {
    const roles = ["مدير", "محاسب", "مشرف مخزن", "خدمة عملاء", "مشرف طلبات", "مسوق"];
    const departments = ["الإدارة", "المالية", "المخازن", "خدمة العملاء", "التسويق", "التوصيل"];
    const mockEmployees = Array.from({ length: 15 }, (_, i) => ({
      id: `EMP-${7000 + i}`,
      name: `موظف ${i + 1}`,
      email: `employee${i + 1}@example.com`,
      phone: `0101234567${i}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      salary: Math.floor(Math.random() * 15000) + 5000,
      status: Math.random() > 0.1 ? "active" : "inactive",
      joinDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 3) * 24 * 60 * 60 * 1000).toISOString(),
      permissions: ["view", "edit", "delete", "export"][Math.floor(Math.random() * 4)],
    }));

    return mockEmployees.filter(e => {
      const matchesSearch = !search || e.name.includes(search) || e.email.includes(search) || e.id.includes(search);
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesRole = roleFilter === "all" || e.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    inactive: employees.filter(e => e.status === "inactive").length,
    totalSalary: employees.reduce((s, e) => s + e.salary, 0),
    avgSalary: employees.length ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length) : 0,
  }), [employees]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">إدارة الموظفين</h1>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">إجمالي الموظفين</span>
          <span className="text-base font-bold">{stats.total}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <UserCheck className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs text-muted-foreground">النشطون</span>
          <span className="text-base font-bold text-green-500">{stats.active}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <UserX className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs text-muted-foreground">المعطّلون</span>
          <span className="text-base font-bold text-red-500">{stats.inactive}</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">إجمالي الرواتب</span>
          <span className="text-base font-bold text-primary">{stats.totalSalary.toLocaleString("ar-EG")} ج.م</span>
        </div>
        <div className="flex items-center gap-2.5 bg-card border border-border rounded-lg px-4 py-2.5">
          <DollarSign className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">متوسط الراتب</span>
          <span className="text-base font-bold text-amber-500">{stats.avgSalary.toLocaleString("ar-EG")} ج.م</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو البريد الإلكتروني..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="pr-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">معطّل</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="مدير">مدير</SelectItem>
                <SelectItem value="محاسب">محاسب</SelectItem>
                <SelectItem value="مشرف مخزن">مشرف مخزن</SelectItem>
                <SelectItem value="خدمة عملاء">خدمة عملاء</SelectItem>
                <SelectItem value="مشرف طلبات">مشرف طلبات</SelectItem>
                <SelectItem value="مسوق">مسوق</SelectItem>
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
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الراتب</TableHead>
                <TableHead className="text-right">الصلاحية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ التعيين</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {employee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{employee.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                  <TableCell className="font-mono" dir="ltr">{employee.phone}</TableCell>
                  <TableCell>
                    <Badge className="bg-primary/10 text-primary">{employee.role}</Badge>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell className="font-bold">{employee.salary.toLocaleString("ar-EG")} ج.م</TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Shield className="h-3 w-3 ml-1" />
                      {employee.permissions}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={employee.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {employee.status === "active" ? "نشط" : "معطّل"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(employee.joinDate).toLocaleDateString("ar-EG")}
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