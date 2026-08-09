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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { fetchProducts, deleteProduct, createProduct, getLoggedVendor, type ApiProduct, type VendorUser } from "@/lib/api"

export function VendorProductList() {
  const navigate = useNavigate()
  const [loggedVendor, setLoggedVendor] = useState<VendorUser | null>(null)
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
        quantity_on_hand: 100,
        rent_price: 1200.0,
        sales_price: 1200.0,
        cost_price: 0.0,
        is_published: true,
        periodicity: "Hours",
        padding_time: "2:00 H",
        pickup_time: "10:00 H",
        return_time: "19:00 H",
        late_fees: 45.0,
        security_deposit: 150.0,
        attributes_json: JSON.stringify([
          { id: "1", name: "Brand", values: "Apple, Dell, HP" },
          { id: "2", name: "RAM", values: "32GB, 64GB" },
        ]),
      },
      {
        vendor_id: vendorId,
        name: "Smart TV 65\" 4K OLED",
        product_type: "Goods",
        image_url: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80",
        quantity_on_hand: 45,
        rent_price: 650.0,
        sales_price: 650.0,
        cost_price: 0.0,
        is_published: true,
        periodicity: "Day",
        padding_time: "1:00 H",
        pickup_time: "10:00 H",
        return_time: "18:00 H",
        late_fees: 25.0,
        security_deposit: 100.0,
        attributes_json: JSON.stringify([
          { id: "1", name: "Brand", values: "Sony, LG, Samsung" },
        ]),
      },
      {
        vendor_id: vendorId,
        name: "Security Deposit / Downpayment",
        product_type: "Service",
        image_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
        quantity_on_hand: 0,
        rent_price: 200.0,
        sales_price: 200.0,
        cost_price: 0.0,
        is_published: true,
        periodicity: "Day",
        padding_time: "0:00 H",
        pickup_time: "09:00 H",
        return_time: "18:00 H",
        late_fees: 0.0,
        security_deposit: 0.0,
        attributes_json: JSON.stringify([]),
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
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Orders
              </button>
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Schedule
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-bold transition-colors">
                Products
              </button>
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Reports
              </button>
              <button
                onClick={() => navigate("/vendor/profile")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadProducts}
              title="Refresh Products from DB"
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium p-1.5 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
              <span>Refresh</span>
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs">
              <span className="font-semibold text-slate-900">
                {loggedVendor?.vendor_profile?.company_name || loggedVendor?.full_name || "Apex Rentals"}
              </span>
              <div className="flex size-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs uppercase">
                {(loggedVendor?.full_name || "A").charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Title + Add Product Button + Search Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="size-6 text-purple-600" />
              <span>Database Products Catalog</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage live rental products stored in your MariaDB database.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {products.length === 0 && (
              <button
                onClick={handleSeedDemoProducts}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs shadow-xs transition-all"
              >
                <Sparkles className="size-3.5 text-purple-600" />
                <span>{isSeeding ? "Seeding..." : "Seed Demo Products"}</span>
              </button>
            )}

            {/* Primary CTA: Add New Product */}
            <button
              onClick={() => navigate("/vendor/products/new")}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all transform active:scale-95 shrink-0"
            >
              <Plus className="size-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & View Switcher Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search database products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 pl-3 h-9 bg-slate-50 border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 rounded-lg focus-visible:ring-purple-500 shadow-xs"
            />
            <div className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-md text-slate-400">
              <Search className="size-3.5" />
            </div>
          </div>

          {/* Filters & View Switches */}
          <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
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
                        <th className="p-3.5">Quantity (Units)</th>
                        <th className="p-3.5">Rent Price</th>
                        <th className="p-3.5">Periodicity</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-sans space-y-2">
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
                          const displayRentPrice = product.rent_price || product.sales_price || 0
                          const displayQty = Math.round(product.quantity_on_hand || 0)
                          return (
                            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                    {product.image_url ? (
                                      <img
                                        src={product.image_url}
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
                              <td className="p-3.5 font-mono font-bold text-slate-800">
                                {displayQty}
                              </td>
                              <td className="p-3.5 font-mono font-extrabold text-slate-900">
                                ${displayRentPrice.toFixed(2)}
                              </td>
                              <td className="p-3.5 text-slate-600 font-medium">
                                {product.periodicity}
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
                  const displayRentPrice = product.rent_price || product.sales_price || 0
                  const displayQty = Math.round(product.quantity_on_hand || 0)
                  return (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-purple-300 hover:shadow-md transition-all shadow-xs group flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
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
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                          <span>Stock: <strong className="font-mono text-slate-800">{displayQty} units</strong></span>
                          <span>Rate: <strong className="font-semibold text-slate-800">{product.periodicity}</strong></span>
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
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200"
                          >
                            <Trash2 className="size-4" />
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
