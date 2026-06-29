import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Truck, Menu, Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/products", label: "المنتجات", icon: Package },
  { href: "/suppliers", label: "الموردون", icon: Truck },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center">
          <Package className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 right-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:mr-64">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64 border-l-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex-1 flex items-center gap-4 md:gap-8">
            <div className="relative flex-1 md:w-96 md:flex-initial">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="بحث..."
                className="w-full bg-background pr-9 md:w-[300px] lg:w-[400px]"
              />
            </div>
            <div className="mr-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-muted">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}