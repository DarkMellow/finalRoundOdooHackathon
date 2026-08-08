import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Package,
  Plus,
  Search,
  List,
  LayoutGrid,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react"
import { Input } from "@/components/ui/input"

export interface VendorProduct {
  id: string
  name: string
  productType: "Goods" | "Service"
  quantityOnHand: number
  salesPrice: number
  costPrice: number
  isPublished: boolean
  periodicity: "Hours" | "Day" | "Night" | "Weekly"
  imageUrl: string
  attributesCount: number
}

const INITIAL_PRODUCTS: VendorProduct[] = [
  {
    id: "1",
    name: "Computers (Desktop Workstation)",
    productType: "Goods",
    quantityOnHand: 100.0,
    salesPrice: 1200.0,
    costPrice: 850.0,
    isPublished: true,
    periodicity: "Hours",
    imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80",
    attributesCount: 3,
  },
  {
    id: "2",
    name: "Smart TV 65\" 4K OLED",
    productType: "Goods",
    quantityOnHand: 45.0,
    salesPrice: 650.0,
    costPrice: 400.0,
    isPublished: true,
    periodicity: "Day",
    imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=400&q=80",
    attributesCount: 2,
  },
  {
    id: "3",
    name: "4K Cinema Projector Pro",
    productType: "Goods",
    quantityOnHand: 18.0,
    salesPrice: 950.0,
    costPrice: 600.0,
    isPublished: true,
    periodicity: "Hours",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80",
    attributesCount: 2,
  },
  {
    id: "4",
    name: "Security Deposit / Downpayment",
    productType: "Service",
    quantityOnHand: 0.0,
    salesPrice: 200.0,
    costPrice: 0.0,
    isPublished: true,
    periodicity: "Day",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    attributesCount: 1,
  },
  {
    id: "5",
    name: "Console Gaming Set (PS5 + VR)",
    productType: "Goods",
    quantityOnHand: 25.0,
    salesPrice: 450.0,
    costPrice: 300.0,
    isPublished: false,
    periodicity: "Hours",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    attributesCount: 4,
  },
  {
    id: "6",
    name: "Luxury SUV Rental Vehicle",
    productType: "Goods",
    quantityOnHand: 5.0,
    salesPrice: 5000.0,
    costPrice: 3500.0,
    isPublished: true,
    periodicity: "Weekly",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
    attributesCount: 3,
  },
]

export function VendorProductList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [typeFilter, setTypeFilter] = useState<"all" | "Goods" | "Service">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  // Filter products
  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || product.productType === typeFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && product.isPublished) ||
      (statusFilter === "draft" && !product.isPublished)

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
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
                onClick={() => navigate("/vendor/dashboard")}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vendor/dashboard"
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Orders</span>
            </Link>
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
              <span>Products Catalog</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your product catalog, prices, rental rules, deposit settings, and variants.
            </p>
          </div>

          {/* Primary CTA: Add New Product */}
          <button
            onClick={() => navigate("/vendor/products/new")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="size-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter Controls & View Switcher Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search products by name..."
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

        {/* LIST VIEW TABLE */}
        {viewMode === "list" ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Qty on Hand</th>
                    <th className="p-3.5">Sales Price</th>
                    <th className="p-3.5">Cost Price</th>
                    <th className="p-3.5">Periodicity</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                        No products match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {product.attributesCount} Variant Attributes
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              product.productType === "Goods"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {product.productType}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-medium text-slate-700">
                          {product.quantityOnHand.toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          ${product.salesPrice.toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          ${product.costPrice.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {product.periodicity}
                        </td>
                        <td className="p-3.5 text-center">
                          {product.isPublished ? (
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
                          <button
                            onClick={() => navigate("/vendor/products/new")}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-purple-300 hover:shadow-md transition-all shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs ${
                          product.productType === "Goods"
                            ? "bg-purple-600 text-white border-purple-700"
                            : "bg-amber-600 text-white border-amber-700"
                        }`}
                      >
                        {product.productType}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      {product.isPublished ? (
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
                    <span>Stock: <strong className="font-mono text-slate-800">{product.quantityOnHand}</strong></span>
                    <span>Rate: <strong className="font-semibold text-slate-800">{product.periodicity}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Sales Price</span>
                    <span className="font-mono font-extrabold text-slate-900 text-base">${product.salesPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => navigate("/vendor/products/new")}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
