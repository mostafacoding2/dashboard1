import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Package, AlertTriangle, User, Truck, MessageSquare, CheckCircle2, Trash2, CheckCheck } from "lucide-react";

type Notification = {
  id: string;
  type: "order" | "product" | "complaint" | "customer" | "shipping" | "chat";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "order", title: "طلب جديد", message: "تم استلام طلب جديد #ORD-1001 من عميل أحمد محمد", time: "منذ 5 دقائق", read: false },
    { id: "2", type: "product", title: "منتج منخفض المخزون", message: "المنتج 'سماعة بلوتوث لاسلكية' مخزونه أقل من 5 وحدات", time: "منذ 15 دقيقة", read: false },
    { id: "3", type: "complaint", title: "شكوى جديدة", message: "تم استلام شكوى من العميل سعيد علي بشأن تأخر الشحنة", time: "منذ 30 دقيقة", read: false },
    { id: "4", type: "shipping", title: "شحنة في الطريق", message: "شحنة #SHP-5012 في طريقها للعميل محمد حسن", time: "منذ 45 دقيقة", read: true },
    { id: "5", type: "chat", title: "رسالة جديدة", message: "العميل فاطمة أحمد أرسلت رسالة استفسار", time: "منذ ساعة", read: true },
    { id: "6", type: "customer", title: "عميل جديد", message: "تم تسجيل عميل جديد: خالد محمود", time: "منذ ساعتين", read: true },
    { id: "7", type: "order", title: "تم تأكيد الطلب", message: "تم تأكيد الطلب #ORD-1045 وبدأ في المعالجة", time: "منذ 3 ساعات", read: true },
    { id: "8", type: "product", title: "منتج جديد", message: "تم إضافة منتج جديد 'حقيبة ظهر رياضية' من المورد سمسا", time: "منذ 5 ساعات", read: true },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = useMemo(() => {
    return filter === "unread" ? notifications.filter(n => !n.read) : notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      order: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      product: <Package className="h-4 w-4 text-amber-500" />,
      complaint: <AlertTriangle className="h-4 w-4 text-red-500" />,
      customer: <User className="h-4 w-4 text-green-500" />,
      shipping: <Truck className="h-4 w-4 text-purple-500" />,
      chat: <MessageSquare className="h-4 w-4 text-cyan-500" />,
    };
    return icons[type] || <Bell className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">الاشعارات</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount} جديد</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 ml-1.5" />
            قراءة الكل
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          الكل ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          غير مقروء ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد اشعارات</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}