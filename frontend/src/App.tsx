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
import { AboutUs } from "@/pages/AboutUs"
import { ContactUs } from "@/pages/ContactUs"
import { VendorProfile } from "@/pages/VendorProfilePage"
import { AdminSignIn } from "@/pages/AdminSignIn"
import { AdminDashboard } from "@/pages/AdminDashboard"


function AppRoutes() {
  const location = useLocation()
  const isStandalonePage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/vendor/dashboard") ||
    location.pathname.startsWith("/vendor/products") ||
    location.pathname.startsWith("/vendor/settings") ||
    location.pathname.startsWith("/vendor/profile") ||
    location.pathname.startsWith("/customer/catalog") ||
    location.pathname.startsWith("/customer/about") ||
    location.pathname.startsWith("/customer/contact") ||
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
          <Route path="/customer/about" element={<AboutUs />} />
          <Route path="/customer/contact" element={<ContactUs />} />
          <Route path="/customer/wishlist" element={<Wishlist />} />
          <Route path="/customer/profile" element={<Profile />} />
          <Route path="/vendor/signin" element={<VendorSignIn />} />
          <Route path="/vendor/signup" element={<VendorSignUp />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProductList />} />
          <Route path="/vendor/products/new" element={<VendorAddProduct />} />
          <Route path="/vendor/products/edit/:id" element={<VendorAddProduct />} />
          <Route path="/vendor/settings" element={<VendorProfile />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
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
