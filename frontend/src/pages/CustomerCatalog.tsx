import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getLoggedCustomer, type CustomerUser } from "@/lib/api"
import { fetchCartSummary } from "@/lib/cartCheckoutApi"
import { fetchWishlistProducts, toggleWishlistApi } from "@/lib/wishlistFetcher"
import { ProductExpansionView } from "@/pages/ProductExpansionView"
import { CartCheckout } from "@/pages/CartCheckout"
import { Wishlist } from "@/pages/Wishlist"
import { CustomerOrdersView } from "@/pages/CustomerOrdersView"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import { OptimizedCatalogImage } from "@/components/ui/OptimizedCatalogImage"
import { useCatalogPrefetch } from "@/hooks/useCatalogPrefetch"
import {
  Building2,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  User,
  Package,
  LogOut,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  Tag,
} from "lucide-react"

function CatalogCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between animate-pulse">
      <div className="relative aspect-4/3 w-full bg-slate-200" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded-md" />
            <div className="h-3 w-8 bg-slate-200 rounded-md" />
          </div>
          <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-3 w-full bg-slate-200 rounded-md" />
          <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <div className="h-5 w-20 bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  )
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
  const debouncedSearchQuery = useDebounce(searchQuery, 400)
  const [selectedTag, setSelectedTag] = useState<string>("All Tags")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [priceMax, setPriceMax] = useState<number>(2000)

  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartItemCount, setCartItemCount] = useState<number>(0)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [selectedProductIdForModal, setSelectedProductIdForModal] = useState<string | null>(null)
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState<boolean>(false)
  const [isMyOrdersModalOpen, setIsMyOrdersModalOpen] = useState<boolean>(false)

  const ITEMS_PER_PAGE = 6

  // React-based smart prefetching hook: loads Page 1, Page N (last page), and Page +/- 1, 2 in background
  const {
    currentPage,
    setCurrentPage,
    products: paginatedProducts,
    totalCount: totalCountToDisplay,
    totalPages,
    initialLoading,
    pageLoading,
  } = useCatalogPrefetch({
    itemsPerPage: ITEMS_PER_PAGE,
    searchQuery: debouncedSearchQuery,
    selectedTag,
    selectedBrand,
    priceMax,
  })

  const refreshCartCount = () => {
    fetchCartSummary()
      .then((summary) => {
        const totalCount = summary.items.reduce((sum, item) => sum + item.quantity, 0)
        setCartItemCount(totalCount)
      })
      .catch((err) => console.warn("Failed to load cart summary:", err))
  }

  const userFullName = loggedCustomer?.full_name || "Customer"
  const userEmail = loggedCustomer?.email || ""
  const userInitials = userFullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "C"

  // Initial customer auth check, wishlist & cart summary loading
  useEffect(() => {
    const user = getLoggedCustomer()
    if (!user) {
      navigate("/customer/signin")
      return
    }
    setLoggedCustomer(user)

    Promise.all([
      fetchWishlistProducts().catch(() => []),
      fetchCartSummary().catch(() => null),
    ]).then(([wishlistItems, cartSummary]) => {
      if (wishlistItems) setWishlist(wishlistItems.map((i: any) => i.id))
      if (cartSummary && Array.isArray(cartSummary.items)) {
        const totalCount = cartSummary.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartItemCount(totalCount)
      }
    })
  }, [navigate])

  // Toggle wishlist
  const toggleWishlist = async (id: string) => {
    const prod = paginatedProducts.find((p) => p.id === id)
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id))
    } else {
      setWishlist([...wishlist, id])
    }
    try {
      const updated = await toggleWishlistApi(
        id,
        prod
          ? {
              id: prod.id,
              title: prod.title,
              image: prod.image,
              inStock: prod.inStock,
              price: prod.price,
              rating: prod.rating || 4.5,
              reviews: 15,
              assured: true,
              stockText: prod.inStock ? "In Stock" : "Out of Stock",
            }
          : undefined
      )
      setWishlist(updated.map((i) => i.id))
    } catch (err) {
      console.warn("Failed to sync wishlist toggle with backend:", err)
    }
  }

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
              <Link to="/customer/about" className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                About us
              </Link>
              <Link to="/customer/contact" className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                Contact Us
              </Link>
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
                {cartItemCount}
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
                  <div
                    onClick={() => {
                      setUserDropdownOpen(false)
                      navigate("/customer/profile")
                    }}
                    className="px-3 py-2 border-b border-slate-100 mb-1 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl"
                  >
                    <p className="font-bold text-slate-900 text-sm">{userFullName}</p>
                    <p className="text-[11px] text-slate-500">{userEmail}</p>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        navigate("/customer/profile")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left cursor-pointer"
                    >
                      <User className="size-4 text-blue-600" />
                      <span>My account / My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        setIsMyOrdersModalOpen(true)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left"
                    >
                      <Package className="size-4 text-purple-600" />
                      <span>My Orders</span>
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
              {Array.from(new Set(paginatedProducts.map((p) => p.brand).filter(Boolean))).map((brand) => (
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
        {/* ========================================================================= */}
        {/* RIGHT PRODUCT GRID (Main catalog grid) */}
        {/* ========================================================================= */}
        <section id="catalog-grid-header" className="flex-1 space-y-6 scroll-mt-20">
          {/* Top Bar Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Featured Products ({totalCountToDisplay})
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
              <span className="font-bold text-slate-800">{totalPages}</span> ({totalCountToDisplay} total)
            </span>
          </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {initialLoading || pageLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <CatalogCardSkeleton key={idx} />
                ))
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
                      <OptimizedCatalogImage
                        src={product.image}
                        alt={product.title}
                        containerClassName="h-full w-full"
                        className="group-hover:scale-105"
                      />

                      {/* TOP LEFT PRIMARY CATALOG TAG / CLASS BADGE */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTag(product.category)
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-900/85 hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md shadow-xs transition-colors border border-white/20 cursor-pointer"
                        >
                          {product.category}
                        </button>
                      </div>

                      {/* Wishlist Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWishlist(product.id)
                        }}
                        className="absolute top-2.5 right-2.5 size-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors shadow-xs z-10 cursor-pointer"
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
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

                      {/* Active Discount Badge */}
                      {product.discount && product.discount > 0 && (
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] font-mono shadow-md flex items-center gap-1">
                            <Tag className="size-2.5" />
                            -{product.discount}%
                          </span>
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
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-base font-extrabold text-slate-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="font-mono text-xs text-slate-400 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
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
                onClick={() => {
                  const targetPage = Math.max(1, currentPage - 1)
                  setCurrentPage(targetPage)
                  document.getElementById("catalog-grid-header")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
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
                    onClick={() => {
                      setCurrentPage(pageNum)
                      document.getElementById("catalog-grid-header")?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
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
                onClick={() => {
                  const targetPage = Math.min(totalPages, currentPage + 1)
                  setCurrentPage(targetPage)
                  document.getElementById("catalog-grid-header")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }}
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
          onAddToCart={() => refreshCartCount()}
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
        onClose={() => {
          setIsCartModalOpen(false)
          refreshCartCount()
        }}
      />

      {/* Wishlist Modal */}
      <Wishlist
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onSelectProduct={(id) => setSelectedProductIdForModal(id)}
      />

      {/* My Orders Modal */}
      <CustomerOrdersView
        isOpen={isMyOrdersModalOpen}
        onClose={() => setIsMyOrdersModalOpen(false)}
        onSelectProduct={(id) => setSelectedProductIdForModal(id)}
      />
    </div>
  )
}
