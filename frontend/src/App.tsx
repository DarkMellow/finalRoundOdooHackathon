import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { CustomerSignIn } from "@/pages/CustomerSignIn"
import { CustomerSignUp } from "@/pages/CustomerSignUp"
import { CustomerCatalog } from "@/pages/CustomerCatalog"
import { VendorSignIn } from "@/pages/VendorSignIn"
import { VendorSignUp } from "@/pages/VendorSignUp"
import { VendorDashboard } from "@/pages/VendorDashboard"
import { VendorAddProduct } from "@/pages/VendorAddProduct"
import { VendorProductList } from "@/pages/VendorProductList"
import { Wishlist } from "@/pages/Wishlist"
import { Profile } from "@/pages/Profile"


function AppRoutes() {
  const location = useLocation()
  const isStandalonePage =
    location.pathname.startsWith("/vendor/dashboard") ||
    location.pathname.startsWith("/vendor/products") ||
    location.pathname.startsWith("/customer/catalog") ||
    location.pathname.startsWith("/customer/wishlist") ||
    location.pathname.startsWith("/customer/profile")

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {!isStandalonePage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/customer/signin" replace />} />
          <Route path="/customer/signin" element={<CustomerSignIn />} />
          <Route path="/customer/signup" element={<CustomerSignUp />} />
          <Route path="/customer/catalog" element={<CustomerCatalog />} />
          <Route path="/customer/wishlist" element={<Wishlist />} />
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/vendor/signin" element={<VendorSignIn />} />
          <Route path="/vendor/signup" element={<VendorSignUp />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProductList />} />
          <Route path="/vendor/products/new" element={<VendorAddProduct />} />
          <Route path="/vendor/products/edit/:id" element={<VendorAddProduct />} />
          {/* Legacy redirects */}
          <Route path="/admin/*" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/customer/signin" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
