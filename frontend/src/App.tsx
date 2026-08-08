import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { CustomerSignIn } from "@/pages/CustomerSignIn"
import { CustomerSignUp } from "@/pages/CustomerSignUp"
import { CustomerCatalog } from "@/pages/CustomerCatalog"
import { AdminSignIn } from "@/pages/AdminSignIn"
import { AdminSignUp } from "@/pages/AdminSignUp"
import { AdminDashboard } from "@/pages/AdminDashboard"

function AppRoutes() {
  const location = useLocation()
  const isStandalonePage =
    location.pathname.startsWith("/admin/dashboard") ||
    location.pathname.startsWith("/customer/catalog")

  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {!isStandalonePage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/customer/catalog" replace />} />
          <Route path="/customer/signin" element={<CustomerSignIn />} />
          <Route path="/customer/signup" element={<CustomerSignUp />} />
          <Route path="/customer/catalog" element={<CustomerCatalog />} />
          <Route path="/admin/signin" element={<AdminSignIn />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/customer/catalog" replace />} />
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
