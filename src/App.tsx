import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServerStatus } from "./components/ServerStatus";
import OAuthHandler from "./components/OAuthHandler";

import Index from "./pages/Index";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import SupplierProfile from "./pages/SupplierProfile";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import UserTypeSelection from "./pages/UserTypeSelection";

import SupplierLogin from "./pages/SupplierLogin";
import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierHome from "./pages/SupplierHome";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import SupplierProductPreview from "./pages/SupplierProductPreview";
import BuyerDashboard from "./pages/BuyerDashboard";
import Messages from "./pages/Messages";
import SupplierMessagesPage from "./pages/SupplierMessagesPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthErrorHandler from "./components/auth/AuthErrorHandler";
import PublicRoute from "./components/auth/PublicRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/AdminSettings";
import SupplierRegister from "./pages/SupplierRegister";
import EditCompanyInfo from "./pages/EditCompanyInfo";
import Favorites from "./pages/Favorites";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RegisterWithVerification from "./pages/RegisterWithVerification";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Search from "./pages/Search";


import ErrorBoundary from "./components/ui/error-boundary";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0, // Remplace cacheTime dans React Query v5
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthErrorHandler />
      <Toaster />
      <Sonner />
      <ServerStatus />
        <ErrorBoundary>
          <BrowserRouter>
            <OAuthHandler />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<Search />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/suppliers/:id" element={<SupplierProfile />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/supplier/login" element={
              <PublicRoute>
                <SupplierLogin />
              </PublicRoute>
            } />
            <Route path="/supplier/register" element={
              <PublicRoute>
                <SupplierRegister />
              </PublicRoute>
            } />
            <Route path="/user-type" element={
              <PublicRoute>
                <UserTypeSelection />
              </PublicRoute>
            } />

            {/* Routes protégées */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/messages/:conversationId" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/supplier/messages" element={
              <ProtectedRoute requiredRole={2}>
                <SupplierMessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/supplier/messages/:conversationId" element={
              <ProtectedRoute requiredRole={2}>
                <SupplierMessagesPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/supplier/dashboard" element={
              <ProtectedRoute requiredRole={2}>
                <SupplierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/buyer/dashboard" element={
              <ProtectedRoute requiredRole={1}>
                <BuyerDashboard />
              </ProtectedRoute>
            } />
            {/* Page d'accueil fournisseur */}
            <Route path="/supplier" element={<SupplierHome />} />
            <Route path="/supplier/products/add" element={
              <ProtectedRoute requiredRole={2}>
                <AddProduct />
              </ProtectedRoute>
            } />
            <Route path="/supplier/products/edit/:id" element={
              <ProtectedRoute requiredRole={2}>
                <EditProduct />
              </ProtectedRoute>
            } />
            <Route path="/supplier/products/preview/:id" element={
              <ProtectedRoute requiredRole={2}>
                <SupplierProductPreview />
              </ProtectedRoute>
            } />
            <Route path="/supplier/company-info" element={
              <ProtectedRoute requiredRole={2}>
                <EditCompanyInfo />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            {/* Routes Admin */}
            <Route path="/admin/login" element={
              <PublicRoute>
                <AdminLogin />
              </PublicRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={3}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole={3}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole={3}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute requiredRole={3}>
                <AdminProfile />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole={3}>
                <AdminSettings />
              </ProtectedRoute>
            } />

            {/* Pages acheteur */}
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />

            {/* Pages d'authentification */}
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/supplier/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/register-verification" element={
              <PublicRoute>
                <RegisterWithVerification />
              </PublicRoute>
            } />

            {/* Pages légales */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
                      </Routes>
          </BrowserRouter>
        </ErrorBoundary>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
