import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  ShieldCheck,
  Package,
  Users,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  LogOut,
  ExternalLink,
} from "lucide-react"

interface AdminStats {
  total_products: number
  active_products: number
  disabled_products: number
  total_consumers: number
  active_consumers: number
  disabled_consumers: number
  total_vendors: number
  active_vendors: number
  disabled_vendors: number
  total_orders: number
}

interface AdminProduct {
  id: number
  name: string
  category: string
  product_type: string
  sales_price: number
  cost_price: number
  is_published: boolean
  attributes_json?: string
  vendor_id: number
  vendor_name: string
  vendor_email: string
  vendor_active: boolean
  created_at: string
}

interface AdminConsumer {
  id: number
  full_name: string
  email: string
  phone_number?: string
  is_active: boolean
  created_at: string
  order_count: number
  city?: string
  state?: string
}

interface AdminVendor {
  id: number
  full_name: string
  email: string
  company_name: string
  category: string
  is_verified: boolean
  is_active: boolean
  product_count: number
  created_at: string
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"products" | "consumers" | "vendors">("products")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [consumers, setConsumers] = useState<AdminConsumer[]>([])
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const API_BASE_URL =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  // Check auth
  useEffect(() => {
    const adminUser = localStorage.getItem("admin_user")
    if (!adminUser) {
      navigate("/admin/signin")
    }
  }, [navigate])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [sRes, pRes, cRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/stats`),
        fetch(`${API_BASE_URL}/api/v1/admin/products`),
        fetch(`${API_BASE_URL}/api/v1/admin/consumers`),
        fetch(`${API_BASE_URL}/api/v1/admin/vendors`),
      ])

      if (sRes.ok) setStats(await sRes.json())
      if (pRes.ok) setProducts(await pRes.json())
      if (cRes.ok) setConsumers(await cRes.json())
      if (vRes.ok) setVendors(await vRes.json())
    } catch (err) {
      console.error("Failed to load admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Toggle Product Status
  const handleToggleProduct = async (id: number) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/products/${id}/toggle-status`, {
        method: "PUT",
      })
      if (res.ok) {
        const data = await res.json()
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_published: data.is_published } : p))
        )
        showToast(data.message)
        const sRes = await fetch(`${API_BASE_URL}/api/v1/admin/stats`)
        if (sRes.ok) setStats(await sRes.json())
      }
    } catch (err) {
      console.error("Failed to toggle product status:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Toggle Consumer Status
  const handleToggleConsumer = async (id: number) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/consumers/${id}/toggle-status`, {
        method: "PUT",
      })
      if (res.ok) {
        const data = await res.json()
        setConsumers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: data.is_active } : c))
        )
        showToast(data.message)
        const sRes = await fetch(`${API_BASE_URL}/api/v1/admin/stats`)
        if (sRes.ok) setStats(await sRes.json())
      }
    } catch (err) {
      console.error("Failed to toggle consumer status:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Toggle Vendor Status
  const handleToggleVendor = async (id: number) => {
    setActionLoadingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/vendors/${id}/toggle-status`, {
        method: "PUT",
      })
      if (res.ok) {
        const data = await res.json()
        setVendors((prev) =>
          prev.map((v) => (v.id === id ? { ...v, is_active: data.is_active } : v))
        )
        showToast(data.message)
        const sRes = await fetch(`${API_BASE_URL}/api/v1/admin/stats`)
        if (sRes.ok) setStats(await sRes.json())
      }
    } catch (err) {
      console.error("Failed to toggle vendor status:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_user")
    navigate("/admin/signin")
  }

  // Filtered lists with statusFilter applied
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === "active") return p.is_published
    if (statusFilter === "suspended") return !p.is_published
    return true
  })

  const filteredConsumers = consumers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === "active") return c.is_active
    if (statusFilter === "suspended") return !c.is_active
    return true
  })

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (statusFilter === "active") return v.is_active
    if (statusFilter === "suspended") return !v.is_active
    return true
  })

  // Dynamic counts for status filter tabs
  const currentTotal =
    activeTab === "products"
      ? products.length
      : activeTab === "consumers"
      ? consumers.length
      : vendors.length

  const currentActive =
    activeTab === "products"
      ? products.filter((p) => p.is_published).length
      : activeTab === "consumers"
      ? consumers.filter((c) => c.is_active).length
      : vendors.filter((v) => v.is_active).length

  const currentSuspended =
    activeTab === "products"
      ? products.filter((p) => !p.is_published).length
      : activeTab === "consumers"
      ? consumers.filter((c) => !c.is_active).length
      : vendors.filter((v) => !v.is_active).length

  // Helper to extract the actual variant image or contextual fallback
  const getProductImage = (product: AdminProduct): string => {
    if (product.attributes_json) {
      try {
        const parsed = JSON.parse(product.attributes_json)
        if (parsed && Array.isArray(parsed.variants)) {
          const firstWithImg = parsed.variants.find(
            (v: any) => v.imageUrl && v.imageUrl.trim() !== ""
          )
          if (firstWithImg) return firstWithImg.imageUrl
        }
      } catch {
        // Fallback
      }
    }

    const name = (product.name || "").toLowerCase()
    const cat = (product.category || "").toLowerCase()

    if (name.includes("tv") || name.includes("oled") || name.includes("screen")) {
      return "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("desktop") || name.includes("workstation") || name.includes("computer")) {
      return "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("monitor") || name.includes("display")) {
      return "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("laptop") || name.includes("aspire") || name.includes("macbook") || name.includes("dell")) {
      return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("dustbin") || name.includes("trash") || name.includes("bin") || name.includes("cleaning")) {
      return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("security") || name.includes("deposit") || name.includes("payment") || name.includes("downpayment") || product.product_type === "Services") {
      return "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("camera") || name.includes("dslr") || name.includes("lens")) {
      return "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("chair") || name.includes("sofa") || name.includes("table") || name.includes("furniture") || cat.includes("furniture")) {
      return "https://images.unsplash.com/photo-1580481077114-16a707a2a61a?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("audio") || name.includes("speaker") || name.includes("headphone") || name.includes("mic")) {
      return "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=200&q=80"
    }
    if (name.includes("car") || name.includes("vehicle") || name.includes("bike")) {
      return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=200&q=80"
    }

    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80"
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl bg-indigo-600 text-white px-5 py-3 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3.5 shadow-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">EasyRental Admin Console</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-200">
                  ROOT
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Platform Governance & Security Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAllData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
            <Link
              to="/catalog"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <span>Live Store</span>
              <ExternalLink className="size-3 text-slate-500" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Products Metric Card */}
          <div
            onClick={() => {
              setActiveTab("products")
              setSearchQuery("")
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "products"
                ? "bg-white border-indigo-600 ring-2 ring-indigo-600/15 shadow-md shadow-indigo-100"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Package className="size-5" />
              </div>
              <span className="text-2xl font-mono font-black text-slate-900">{stats?.total_products ?? 0}</span>
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-slate-800">Catalog Products</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-bold">{stats?.active_products ?? 0} Active</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">{stats?.disabled_products ?? 0} Disabled</span>
              </div>
            </div>
          </div>

          {/* Consumers Metric Card */}
          <div
            onClick={() => {
              setActiveTab("consumers")
              setSearchQuery("")
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "consumers"
                ? "bg-white border-indigo-600 ring-2 ring-indigo-600/15 shadow-md shadow-indigo-100"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <Users className="size-5" />
              </div>
              <span className="text-2xl font-mono font-black text-slate-900">{stats?.total_consumers ?? 0}</span>
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-slate-800">Registered Consumers</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-bold">{stats?.active_consumers ?? 0} Active</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">{stats?.disabled_consumers ?? 0} Suspended</span>
              </div>
            </div>
          </div>

          {/* Vendors Metric Card */}
          <div
            onClick={() => {
              setActiveTab("vendors")
              setSearchQuery("")
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "vendors"
                ? "bg-white border-indigo-600 ring-2 ring-indigo-600/15 shadow-md shadow-indigo-100"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Building2 className="size-5" />
              </div>
              <span className="text-2xl font-mono font-black text-slate-900">{stats?.total_vendors ?? 0}</span>
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-slate-800">Store Vendors</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-bold">{stats?.active_vendors ?? 0} Active</span>
                <span>•</span>
                <span className="text-rose-600 font-bold">{stats?.disabled_vendors ?? 0} Suspended</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>All</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                statusFilter === "all" ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-300/60 text-slate-600"
              }`}>
                {currentTotal}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-sm border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Active</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                statusFilter === "active" ? "bg-emerald-100 text-emerald-800 font-bold" : "bg-slate-300/60 text-slate-600"
              }`}>
                {currentActive}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("suspended")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === "suspended"
                  ? "bg-white text-rose-700 shadow-sm border border-rose-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <XCircle className="size-3.5 text-rose-600" />
              <span>{activeTab === "products" ? "Disabled" : "Suspended"}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                statusFilter === "suspended" ? "bg-rose-100 text-rose-800 font-bold" : "bg-slate-300/60 text-slate-600"
              }`}>
                {currentSuspended}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full rounded-xl bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Content Table Views */}
        {loading ? (
          <div className="py-20 text-center text-xs font-semibold text-slate-500">
            Loading platform records...
          </div>
        ) : activeTab === "products" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>All Catalog Products</span>
                <span className="text-xs text-slate-500 font-normal">({filteredProducts.length} items)</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Disabling a product immediately removes it from the customer store catalog.
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs bg-white">
                No products found matching your search query.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Listing Info</th>
                      <th className="p-3.5">Vendor Provider</th>
                      <th className="p-3.5">Category & Type</th>
                      <th className="p-3.5">Rental Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredProducts.map((p) => {
                      const isActioning = actionLoadingId === p.id
                      const prodImage = getProductImage(p)
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 overflow-hidden border border-slate-200">
                                {prodImage ? (
                                  <img
                                    src={prodImage}
                                    alt={p.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      ;(e.currentTarget as HTMLImageElement).src =
                                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80"
                                    }}
                                  />
                                ) : (
                                  <Package className="size-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{p.name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">Product ID: #{p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{p.vendor_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{p.vendor_email}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                                {p.category || "General"}
                              </span>
                              <span className="text-[10px] text-slate-500">• {p.product_type}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono font-extrabold text-slate-900 text-sm">
                            ₹{Math.round(p.sales_price)}/hr
                          </td>
                          <td className="p-3.5">
                            {p.is_published ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Disabled / Hidden
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleProduct(p.id)}
                              disabled={isActioning}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                                p.is_published
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <Power className="size-3.5" />
                              <span>{p.is_published ? "Disable Product" : "Enable Product"}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "consumers" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>All Registered Consumers</span>
                <span className="text-xs text-slate-500 font-normal">({filteredConsumers.length} customers)</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Disabling a consumer revokes their access and prevents them from signing into the platform.
              </span>
            </div>

            {filteredConsumers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs bg-white">
                No consumers found matching your search query.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Contact Email</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Total Orders</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredConsumers.map((c) => {
                      const isActioning = actionLoadingId === c.id
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                                {c.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{c.full_name}</div>
                                <div className="text-[11px] text-slate-500 font-mono">User #{c.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">{c.email}</td>
                          <td className="p-3.5 text-slate-600">
                            {c.city ? `${c.city}, ${c.state || ""}` : "Not specified"}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {c.order_count} bookings
                          </td>
                          <td className="p-3.5">
                            {c.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Suspended / Disabled
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleConsumer(c.id)}
                              disabled={isActioning}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                                c.is_active
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <Power className="size-3.5" />
                              <span>{c.is_active ? "Disable Consumer" : "Activate Consumer"}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>All Store Vendors</span>
                <span className="text-xs text-slate-500 font-normal">({filteredVendors.length} vendors)</span>
              </h2>
              <span className="text-[11px] text-slate-500">
                Disabling a vendor suspends their store login and hides all their product listings immediately.
              </span>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs bg-white">
                No vendors found matching your search query.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="p-3.5">Vendor / Store</th>
                      <th className="p-3.5">Contact Email</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Listings Count</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredVendors.map((v) => {
                      const isActioning = actionLoadingId === v.id
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-xs border border-purple-200">
                                <Building2 className="size-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm">{v.company_name || v.full_name}</div>
                                <div className="text-[11px] text-slate-500">Representative: {v.full_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">{v.email}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                              {v.category || "General Rental"}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {v.product_count} listings
                          </td>
                          <td className="p-3.5">
                            {v.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Active Store
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Suspended / Disabled
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleToggleVendor(v.id)}
                              disabled={isActioning}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                                v.is_active
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <Power className="size-3.5" />
                              <span>{v.is_active ? "Disable Vendor" : "Activate Vendor"}</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
