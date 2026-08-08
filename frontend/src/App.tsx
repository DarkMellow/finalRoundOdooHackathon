import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { CustomerSignIn } from "@/pages/CustomerSignIn"
import { CustomerSignUp } from "@/pages/CustomerSignUp"
import { AdminSignIn } from "@/pages/AdminSignIn"
import { AdminSignUp } from "@/pages/AdminSignUp"

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/customer/signin" replace />} />
            <Route path="/customer/signin" element={<CustomerSignIn />} />
            <Route path="/customer/signup" element={<CustomerSignUp />} />
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route path="/admin/signup" element={<AdminSignUp />} />
            <Route path="*" element={<Navigate to="/customer/signin" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
