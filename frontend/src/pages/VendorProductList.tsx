import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Package,
  Plus,
  Search,
  List,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Building2,
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchProducts, deleteProduct, createProduct, getLoggedVendor, type ApiProduct, type VendorUser } from "@/lib/api"

export function VendorProductList() {
  const navigate = useNavigate()
  const [loggedVendor, setLoggedVendor] = useState<VendorUser | null>(null)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [typeFilter, setTypeFilter] = useState<"all" | "Goods" | "Service">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  // Load active logged vendor
  useEffect(() => {
    const vendor = getLoggedVendor()
    setLoggedVendor(vendor)
  }, [])

  // Load products from backend database filtered by logged vendor ID
  const loadProducts = async () => {
    setLoading(true)
    try {
      const vendor = getLoggedVendor()
      const data = await fetchProducts(vendor?.id)
      setProducts(data)
    } catch (err) {
      console.warn("Failed to load products from database:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Delete product handler
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await deleteProduct(id)
      setToastMessage(`Product "${name}" deleted.`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(`Failed to delete product: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  // Extract list of individual variants with stock quantities
  const getProductVariantsList = (product: ApiProduct): { id?: string; name: string; stockQuantity: number }[] => {
    if (product.attributes_json) {
      try {
        const parsed = JSON.parse(product.attributes_json)
        if (parsed && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          return parsed.variants.map((v: any, idx: number) => ({
            id: v.id || `v_${idx}`,
            name: v.name || `Variant #${idx + 1}`,
            stockQuantity: parseInt(v.stockQuantity || "0", 10) || 0,
          }))
        }
      } catch {
        // Fallback
      }
    }
    return []
  }

  // Calculate starting display price for a product from its variants
  const getProductDisplayPrice = (product: ApiProduct): number => {
    if (product.attributes_json) {
      try {
        const parsed = JSON.parse(product.attributes_json)
        if (parsed && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
          const firstPrice = parseFloat(parsed.variants[0].price)
          if (!isNaN(firstPrice) && firstPrice > 0) return firstPrice
        }
      } catch {
        // Fallback
      }
    }
    return product.sales_price || 0
  }

  // Extract cover image from the first variant that has an image
  const getProductCoverImage = (product: ApiProduct): string => {
    if (product.attributes_json) {
      try {
        const parsed = JSON.parse(product.attributes_json)
        if (parsed && Array.isArray(parsed.variants)) {
          const firstWithImg = parsed.variants.find((v: any) => v.imageUrl && v.imageUrl.trim() !== "")
          if (firstWithImg) return firstWithImg.imageUrl
        }
      } catch {
        // Fallback
      }
    }
    return ""
  }

  // Calculate total variant stock for a product
  const getProductTotalStock = (product: ApiProduct): number => {
    const list = getProductVariantsList(product)
    return list.reduce((sum, v) => sum + v.stockQuantity, 0)
  }

  // Seed demo products if database is empty for this vendor
  const handleSeedDemoProducts = async () => {
    setIsSeeding(true)
    const vendorId = loggedVendor?.id || 1
    const seedData = [
      {
        vendor_id: vendorId,
        name: "Computers (Desktop Workstation)",
        product_type: "Goods",
        image_url: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80",
        sales_price: 1200.0,
        cost_price: 0.0,
        is_published: true,
        padding_time: "2:00 H",
        pickup_time: "10:00 H",
        return_time: "19:00 H",
        late_fees: 45.0,
        security_deposit: 150.0,
        attributes_json: JSON.stringify({
          variants: [
            {
              id: "v1",
              name: "MacBook Pro 16\" M3 Max",
              price: "1250.00",
              stockQuantity: "25",
              imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
              features: "Apple M3 Max • 32GB RAM • 1TB SSD • Space Gray",
            },
            {
              id: "v2",
              name: "Dell XPS 15 Silver",
              price: "1100.00",
              stockQuantity: "30",
              imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80",
              features: "Intel i9 13th Gen • 16GB DDR5 RAM • 512GB SSD",
            },
          ],
        }),
      },
      {
        vendor_id: vendorId,
        name: "Smart TV 65\" 4K OLED",
        product_type: "Goods",
        image_url: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80",
        sales_price: 650.0,
        cost_price: 0.0,
        is_published: true,
        padding_time: "1:00 H",
        pickup_time: "10:00 H",
        return_time: "18:00 H",
        late_fees: 25.0,
        security_deposit: 100.0,
        attributes_json: JSON.stringify({
          variants: [
            {
              id: "v2",
              name: "Sony 65\" Bravia XR",
              price: "650.00",
              stockQuantity: "20",
              imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80",
              features: "4K HDR OLED • Google TV • 120Hz Refresh Rate",
            },
          ],
        }),
      },
      {
        vendor_id: vendorId,
        name: "Security Deposit / Downpayment",
        product_type: "Service",
        image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
        sales_price: 200.0,
        cost_price: 0.0,
        is_published: true,
        padding_time: "0:00 H",
        pickup_time: "09:00 H",
        return_time: "18:00 H",
        late_fees: 0.0,
        security_deposit: 0.0,
        attributes_json: JSON.stringify({ variants: [] }),
      },
    ]

    try {
      for (const item of seedData) {
        await createProduct(item as any)
      }
      setToastMessage("Demo products seeded successfully!")
      await loadProducts()
    } catch (err) {
      console.warn("Seeding error:", err)
    } finally {
      setIsSeeding(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || product.product_type === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && product.is_published) ||
      (statusFilter === "draft" && !product.is_published)

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="size-5 font-bold" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/vendor/dashboard" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">EasyRental</span>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-medium">
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
              >
                Dashboard
              </button>
              <Link
                to="/vendor/products"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-bold transition-colors"
              >
                Products
              </Link>
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-colors"
              >
                Reports
              </button>
            </nav>
          </div>

          {/* Right Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2.5 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                {loggedVendor?.full_name ? loggedVendor.full_name.slice(0, 2).toUpperCase() : "VD"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {loggedVendor?.vendor_profile?.company_name || loggedVendor?.full_name || "Vendor Admin"}
              </span>
              <ChevronDown className="size-3.5 text-slate-500" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">{loggedVendor?.full_name || "Vendor Admin"}</p>
                  <p className="text-[11px] text-slate-500">{loggedVendor?.email || "vendor@easyrental.com"}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      alert("Vendor settings page")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
                  >
                    <SettingsIcon className="size-4 text-slate-500" />
                    <span>Store Settings</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      navigate("/vendor/signin")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Products & Rental Catalog</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                {products.length} Items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create, view, edit, or publish rental products and equipment for your vendor store.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDemoProducts}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
              title="Populate demo products into database"
            >
              {isSeeding ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5 text-amber-500" />}
              <span>{isSeeding ? "Seeding..." : "Seed Products"}</span>
            </button>

            <button
              onClick={loadProducts}
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title="Refresh Products"
            >
              <RefreshCw className="size-4" />
            </button>

            <Link
              to="/vendor/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Plus className="size-4" />
              <span>New Product</span>
            </Link>
          </div>
        </div>

        {/* Toolbar & Filter Options */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search product name, category, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg focus-visible:ring-purple-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Product Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <span className="text-[10px] text-slate-500 px-2 uppercase font-semibold">Type</span>
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  typeFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("Goods")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  typeFilter === "Goods" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Goods
              </button>
              <button
                onClick={() => setTypeFilter("Service")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  typeFilter === "Service" ? "bg-white text-amber-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Service
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <span className="text-[10px] text-slate-500 px-2 uppercase font-semibold">Status</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === "published" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === "draft" ? "bg-white text-slate-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Draft
              </button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-purple-600 text-white font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Spinner State */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2">
            <Loader2 className="size-6 animate-spin text-purple-600" />
            <span className="text-xs font-semibold">Fetching products from database...</span>
          </div>
        ) : (
          <>
            {/* LIST VIEW TABLE */}
            {viewMode === "list" ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider">
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Variant Quantities</th>
                        <th className="p-3.5">Rent Price</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-sans space-y-2">
                            <p>No products found in database matching your query.</p>
                            {products.length === 0 && (
                              <button
                                onClick={handleSeedDemoProducts}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
                              >
                                Populate Seed Products
                              </button>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const displayRentPrice = getProductDisplayPrice(product)
                          const coverImage = getProductCoverImage(product)
                          const variantsList = getProductVariantsList(product)
                          const totalStock = getProductTotalStock(product)
                          return (
                            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    {coverImage ? (
                                      <img
                                        src={coverImage}
                                        alt={product.name}
                                        className="size-full object-cover"
                                      />
                                    ) : (
                                      <div className="size-full flex items-center justify-center text-slate-400">
                                        <Package className="size-5" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block text-xs">
                                      {product.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      ID #{product.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                    product.product_type === "Goods"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-amber-50 text-amber-800 border-amber-200"
                                  }`}
                                >
                                  {product.product_type}
                                </span>
                              </td>

                              {/* VARIANT INDIVIDUAL QUANTITIES CELL */}
                              <td className="p-3.5">
                                {variantsList.length > 0 ? (
                                  <div className="space-y-1.5 max-w-[220px]">
                                    {variantsList.map((v, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between gap-2 text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-200"
                                      >
                                        <span className="font-medium text-slate-800 truncate" title={v.name}>
                                          {v.name}
                                        </span>
                                        <span
                                          className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                                            v.stockQuantity > 0
                                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                              : "bg-rose-100 text-rose-800 border border-rose-200"
                                          }`}
                                        >
                                          {v.stockQuantity} Qty
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <Layers className="size-3 text-slate-400" />
                                    <span>Total: <strong className="font-mono text-slate-800">{totalStock} units</strong></span>
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5 font-mono font-extrabold text-slate-900">
                                ${displayRentPrice.toFixed(2)}
                              </td>
                              <td className="p-3.5 text-center">
                                {product.is_published ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <CheckCircle2 className="size-3" /> Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                    <XCircle className="size-3" /> Draft
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 transition-colors border border-slate-200"
                                    title="Edit Product"
                                  >
                                    <Edit className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    disabled={deletingId === product.id}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 disabled:opacity-50"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const displayRentPrice = getProductDisplayPrice(product)
                  const coverImage = getProductCoverImage(product)
                  const variantsList = getProductVariantsList(product)
                  const totalStock = getProductTotalStock(product)
                  return (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-purple-300 hover:shadow-md transition-all shadow-xs group flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={product.name}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-slate-400">
                              <Package className="size-8" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs ${
                                product.product_type === "Goods"
                                  ? "bg-purple-600 text-white border-purple-700"
                                  : "bg-amber-600 text-white border-amber-700"
                              }`}
                            >
                              {product.product_type}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            {product.is_published ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                Published
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white shadow-xs">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h3>

                        {/* GRID VIEW INDIVIDUAL VARIANT STOCKS */}
                        <div className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Variant Stock Quantities
                          </span>
                          {variantsList.length > 0 ? (
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {variantsList.map((v, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200"
                                >
                                  <span className="text-slate-700 truncate font-medium max-w-[150px]" title={v.name}>
                                    {v.name}
                                  </span>
                                  <span
                                    className={`font-mono font-bold text-[10px] ${
                                      v.stockQuantity > 0 ? "text-emerald-700" : "text-rose-600"
                                    }`}
                                  >
                                    {v.stockQuantity} Qty
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Total Stock: <strong>{totalStock} units</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Rent Price</span>
                          <span className="font-mono font-extrabold text-slate-900 text-base">${displayRentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/vendor/products/edit/${product.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200 disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
