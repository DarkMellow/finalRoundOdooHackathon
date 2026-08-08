import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { fetchProducts, getLoggedCustomer, type CustomerUser } from "@/lib/api"
import { ProductExpansionView } from "@/pages/ProductExpansionView"
import { CartCheckout } from "@/pages/CartCheckout"
import { Wishlist } from "@/pages/Wishlist"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  User,
  Package,
  Settings as SettingsIcon,
  LogOut,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
} from "lucide-react"

interface Product {
  id: string
  title: string
  description: string
  category: string // Primary Tag / Class
  brand: string
  image: string
  price: number
  billingPeriod: "per Month" | "per day" | "per hour"
  sizeVariants?: string[] // e.g. ["43\"", "55\"", "65\""]
  tags: string[]
  inStock: boolean
  rating: number
}

const ALL_CATALOG_TAGS = [
  "All Tags",
  "Furniture",
  "Electronics",
  "Computers",
  "Gaming",
  "Audio",
  "Photography",
]
export function CustomerCatalog() {
  const navigate = useNavigate()
  const [loggedCustomer, setLoggedCustomer] = useState<CustomerUser | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("All Tags")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [priceMax, setPriceMax] = useState<number>(2000)

  const [wishlist, setWishlist] = useState<string[]>([])
  const [cart] = useState<{ id: string; quantity: number }[]>([
    { id: "p1", quantity: 1 },
  ])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null)
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false)

  // Load logged customer user
  useEffect(() => {
    const user = getLoggedCustomer()
    setLoggedCustomer(user)
  }, [])

  const userFullName = loggedCustomer?.full_name || "Jane Doe"
  const userEmail = loggedCustomer?.email || "jane.doe@example.com"
  const userInitials = userFullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "JD"

  // Load live database products from all vendors
  useEffect(() => {
    setLoading(true)
    fetchProducts()
      .then((items) => {
        // Filter only published products for customer catalog
        const publishedItems = items.filter((item) => item.is_published !== false)
        const mapped: Product[] = publishedItems.map((item) => {
          let hasStock = true
          let price = item.sales_price || 0
          let coverImg = "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80"
          if (item.attributes_json) {
            try {
              const parsed = JSON.parse(item.attributes_json)
              if (parsed && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
                hasStock = parsed.variants.some((v: any) => (parseInt(v.stockQuantity || "0", 10) || 0) > 0)
                const firstPrice = parseFloat(parsed.variants[0].price)
                if (!isNaN(firstPrice) && firstPrice > 0) price = firstPrice
                const variantWithImg = parsed.variants.find((v: any) => v.imageUrl && v.imageUrl.trim() !== "")
                if (variantWithImg) coverImg = variantWithImg.imageUrl
              }
            } catch {
              // Ignore
            }
          }
          const brandName = item.vendor_brand || item.vendor_name || `Vendor #${item.vendor_id}`
          return {
            id: `db-${item.id}`,
            title: item.name,
            description: `${brandName} • ${item.product_type}`,
            category: item.category || (item.product_type === "Goods" ? "Electronics" : "Services"),
            brand: brandName,
            image: coverImg,
            price: price,
            billingPeriod: "per Month",
            tags: [item.category || "Electronics", item.product_type, brandName],
            inStock: hasStock,
            rating: 5.0,
          }
        })
        setDbProducts(mapped)
      })
      .catch((err) => {
        console.warn("Could not fetch database products for catalog:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  // Only display actual products from database across all vendors
  const allProducts = dbProducts

  // Toggle wishlist
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id))
    } else {
      setWishlist([...wishlist, id])
    }
  }

  // Filter products by search query, brand, price, AND primary tag / category
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    // Primary tag / class filter matching
    if (selectedTag !== "All Tags") {
      const isMatch =
        product.category.toLowerCase() === selectedTag.toLowerCase() ||
        product.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      if (!isMatch) return false
    }

    if (selectedBrand !== "all" && product.brand !== selectedBrand) return false
    if (product.price > priceMax && priceMax < 2000) return false

    return true
  })

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTag, selectedBrand, priceMax])

  // Pagination calculation
  const ITEMS_PER_PAGE = 6
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* ========================================================================= */}
      {/* HEADER NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          {/* Brand Logo & Main Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/customer/catalog" className="flex items-center gap-2 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="size-5" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-900">EasyRental</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
              <Link to="/customer/catalog" className="px-3 py-2 rounded-lg bg-slate-100 text-blue-600 font-bold">
                Products
              </Link>
              <a href="#about" onClick={(e) => e.preventDefault()} className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                About us
              </a>
              <a href="#contact" onClick={(e) => e.preventDefault()} className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                Contact Us
              </a>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Input
              type="text"
              placeholder="Search products, catalog tags, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-3 h-9 bg-slate-100/70 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 rounded-lg focus-visible:ring-blue-500"
            />
            <div className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-md bg-white text-slate-600 border border-slate-200">
              <Search className="size-3.5" />
            </div>
          </div>

          {/* Header Action Items (Wishlist, Cart, Profile) */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistModalOpen(true)}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs cursor-pointer"
              title="Wishlist"
            >
              <Heart className={`size-4 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[9px]">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartModalOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-300 transition-colors shadow-xs cursor-pointer"
              title="Cart"
            >
              <ShoppingCart className="size-4 text-blue-600" />
              <span className="flex size-4 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[9px]">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2.5 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs">
                  {userInitials}
                </div>
                <ChevronDown className="size-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 text-sm">{userFullName}</p>
                    <p className="text-[11px] text-slate-500">{userEmail}</p>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        alert(`Account / Profile for ${userFullName}`)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left"
                    >
                      <User className="size-4 text-blue-600" />
                      <span>My account / My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        alert("Navigating to My Orders")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left"
                    >
                      <Package className="size-4 text-purple-600" />
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        alert("Settings clicked")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left"
                    >
                      <SettingsIcon className="size-4 text-slate-500" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        localStorage.removeItem("user")
                        localStorage.removeItem("customer_user")
                        setLoggedCustomer(null)
                        setUserDropdownOpen(false)
                        navigate("/customer/signin")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-rose-600 font-bold hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="size-4 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CATALOG CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR FILTERS */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-blue-600" />
              <span>Catalog Filters</span>
            </h2>
            <button
              onClick={() => {
                setSelectedTag("All Tags")
                setSelectedBrand("all")
                setPriceMax(100)
                setSearchQuery("")
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* TOP LEFT CATALOG TAG FILTER */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="size-3.5 text-blue-600" />
                <span>Catalog Tag / Class</span>
              </label>
              {selectedTag !== "All Tags" && (
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>

            {/* Catalog Tag Selector Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ALL_CATALOG_TAGS.map((tag) => {
                const isActive = selectedTag === tag
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isActive ? "All Tags" : tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2" />

          {/* 1. Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Brands</option>
              {Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean))).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Price Range Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider">Price Range</span>
              <span className="font-mono font-bold text-blue-600">${priceMax}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$5</span>
              <span>$100</span>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT PRODUCT GRID (Main catalog grid) */}
        {/* ========================================================================= */}
        <section className="flex-1 space-y-6">
          {/* Top Bar Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Featured Products ({filteredProducts.length})
              </h1>
              {selectedTag !== "All Tags" && (
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1">
                  <Tag className="size-3" />
                  <span>{selectedTag}</span>
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span> ({filteredProducts.length} total)
            </span>
          </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading ? (
                <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 font-semibold">
                  Loading products from database...
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No products match your selected catalog tag or filter criteria.
                </div>
              ) : (
                paginatedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProductIdForModal(product.id)}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* TOP LEFT PRIMARY CATALOG TAG / CLASS BADGE */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <button
                          onClick={() => setSelectedTag(product.category)}
                          className="px-2.5 py-1 rounded-md bg-slate-900/85 hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md shadow-xs transition-colors border border-white/20"
                        >
                          {product.category}
                        </button>
                      </div>

                      {/* Wishlist Button Overlay */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2.5 right-2.5 size-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors shadow-xs z-10"
                      >
                        <Heart
                          className={`size-4 ${
                            isWishlisted ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {/* Out of Stock Overlay Badge */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-20">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-700">
                            Out of stock
                          </span>
                        </div>
                      )}

                      {/* Size Variants Badge */}
                      {product.sizeVariants && (
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 z-10">
                          {product.sizeVariants.map((size, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-mono backdrop-blur-xs"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>{product.brand}</span>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-700">{product.rating}</span>
                          </div>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                          {product.title}
                        </h3>

                        {/* Product Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      </div>

                      {/* Price & Billing Period */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                        <div>
                          <span className="font-mono text-base font-extrabold text-slate-900">
                            ${product.price}
                          </span>
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            / {product.billingPeriod}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ========================================================================= */}
          {/* PAGINATION CONTROLS */}
          {/* ========================================================================= */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - currentPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="text-slate-400 font-mono text-xs px-1">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                const isActive = currentPage === pageNum
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`size-8 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Product Expansion View Modal */}
      {selectedProductIdForModal && (
        <ProductExpansionView
          productId={selectedProductIdForModal}
          isOpen={Boolean(selectedProductIdForModal)}
          onClose={() => setSelectedProductIdForModal(null)}
          isWishlisted={wishlist.includes(selectedProductIdForModal)}
          onToggleWishlist={(id) => {
            setWishlist((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            )
          }}
        />
      )}

      {/* Cart Checkout Modal */}
      <CartCheckout
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />

      {/* Wishlist Modal */}
      <Wishlist
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSelectProduct={(id) => setSelectedProductIdForModal(id)}
      />
    </div>
  )
}
