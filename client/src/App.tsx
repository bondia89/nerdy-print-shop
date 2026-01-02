import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import QRCode3D from "./pages/QRCode3D";
import ImageTo3D from "./pages/ImageTo3D";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCoupons from "./pages/admin/Coupons";
import AdminPermissions from "./pages/admin/Permissions";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalogo" component={Catalog} />
      <Route path="/produto/:slug" component={ProductDetail} />
      <Route path="/carrinho" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/pedidos" component={Orders} />
      <Route path="/pedido/:id" component={OrderDetail} />
      <Route path="/perfil" component={Profile} />
      <Route path="/qrcode-3d" component={QRCode3D} />
      <Route path="/imagem-para-3d" component={ImageTo3D} />
      <Route path="/admin/produtos" component={AdminProducts} />
      <Route path="/admin/pedidos" component={AdminOrders} />
      <Route path="/admin/cupons" component={AdminCoupons} />
      <Route path="/admin/permissoes" component={AdminPermissions} />
      <Route path="/lista-desejos" component={Wishlist} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
