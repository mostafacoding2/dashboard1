import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import ProductsList from "@/pages/products";
import ProductsCharts from "@/pages/products-charts";
import { ProductQuickView } from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Suppliers from "@/pages/suppliers";
import SuppliersCharts from "@/pages/suppliers-charts";
import SupplierDetail from "@/pages/supplier-detail";
import SupplierOrders from "@/pages/supplier-orders";
import SupplierProducts from "@/pages/supplier-products";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import OrdersCharts from "@/pages/orders-charts";
import OrderDetail from "@/pages/order-detail";
import Returns from "@/pages/returns";
import Marketers from "@/pages/marketers";
import ShippingCompanies from "@/pages/shipping-companies";
import ShippingOffice from "@/pages/shipping-office";
import Chat from "@/pages/chat";
import Complaints from "@/pages/complaints";
import Notifications from "@/pages/notifications";
import Employees from "@/pages/employees";
import Payments from "@/pages/payments";
import ActivityLog from "@/pages/activity-log";
import Statistics from "@/pages/statistics";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/products" component={ProductsList} />
      <Route path="/products/charts" component={ProductsCharts} />
      <Route path="/products/quick/:id" component={ProductQuickView} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/suppliers-charts" component={SuppliersCharts} />
      <Route path="/suppliers/:id/products" component={SupplierProducts} />
      <Route path="/suppliers/:id/orders" component={SupplierOrders} />
      <Route path="/suppliers/:id" component={SupplierDetail} />
      <Route path="/customers" component={Customers} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders-charts" component={OrdersCharts} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/returns" component={Returns} />
      <Route path="/marketers" component={Marketers} />
      <Route path="/shipping-companies" component={ShippingCompanies} />
      <Route path="/shipping-office" component={ShippingOffice} />
      <Route path="/employees" component={Employees} />
      <Route path="/payments" component={Payments} />
      <Route path="/activity-log" component={ActivityLog} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/chat" component={Chat} />
      <Route path="/complaints" component={Complaints} />
      <Route path="/notifications" component={Notifications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;