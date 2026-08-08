import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
  Check,
  Star,
} from "lucide-react"

interface Product {
  id: string
  title: string
  category: string
  brand: string
  image: string
  price: number
  billingPeriod: "per Month" | "per day" | "per hour"
  colorVariants?: string[] // hex values
  sizeVariants?: string[] // e.g. ["43\"", "55\"", "65\""]
  inStock: boolean
  rating: number
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Nordic Fabric 3-Seater Sofa",
    category: "Furniture",
    brand: "IKEA",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    price: 49,
    billingPeriod: "per Month",
    colorVariants: ["#3b82f6", "#eab308", "#64748b"],
    inStock: true,
    rating: 4.8,
  },
  {
    id: "p2",
    title: "Solid Teak Executive Workstation",
    category: "Furniture",
    brand: "Herman Miller",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80",
    price: 35,
    billingPeriod: "per Month",
    colorVariants: ["#78350f", "#1e293b"],
    inStock: true,
    rating: 4.9,
  },
  {
    id: "p3",
    title: "Ultra HD 4K Smart OLED TV",
    category: "Electronics",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
    price: 15,
    billingPeriod: "per day",
    colorVariants: ["#0f172a"],
    sizeVariants: ["43\"", "55\"", "65\""],
    inStock: true,
    rating: 4.7,
  },
  {
    id: "p4",
    title: "Pro Workstation Desktop PC",
    category: "Computers",
    brand: "Dell",
    image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80",
    price: 25,
    billingPeriod: "per day",
    colorVariants: ["#0f172a", "#475569"],
    inStock: true,
    rating: 4.6,
  },
  {
    id: "p5",
    title: "High Performance Gaming Laptop",
    category: "Computers",
    brand: "ASUS",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    price: 18,
    billingPeriod: "per day",
    colorVariants: ["#111827"],
    inStock: true,
    rating: 4.9,
  },
  {
    id: "p6",
    title: "Next-Gen Gaming Console",
    category: "Gaming",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    price: 5,
    billingPeriod: "per hour",
    colorVariants: ["#ffffff", "#000000"],
    inStock: true,
    rating: 4.9,
  },
  {
    id: "p7",
    title: "Luxury King Velvet Bed Set",
    category: "Furniture",
    brand: "Ashley",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80",
    price: 79,
    billingPeriod: "per Month",
    colorVariants: ["#6b7280", "#1e1b4b"],
    inStock: false,
    rating: 4.8,
  },
  {
    id: "p8",
    title: "Hi-Fi Studio Surround Sound",
    category: "Audio",
    brand: "Bose",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
    price: 12,
    billingPeriod: "per day",
    colorVariants: ["#18181b"],
    inStock: true,
    rating: 4.7,
  },
  {
    id: "p9",
    title: "Professional DSLR Mirrorless Camera",
    category: "Photography",
    brand: "Canon",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    price: 8,
    billingPeriod: "per hour",
    colorVariants: ["#09090b"],
    inStock: true,
    rating: 4.9,
  },
]

const COLOR_OPTIONS = [
  { name: "Teal", hex: "#0d9488" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Brown", hex: "#78350f" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Black", hex: "#0f172a" },
]

export function CustomerCatalog() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string>("All Duration")
  const [priceMax, setPriceMax] = useState<number>(100)

  const [wishlist, setWishlist] = useState<string[]>([])
  const [cart, setCart] = useState<{ id: string; quantity: number }[]>([
    { id: "p1", quantity: 1 },
  ])
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Toggle wishlist
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id))
    } else {
      setWishlist([...wishlist, id])
    }
  }

  // Toggle cart
  const addToCart = (id: string) => {
    const existing = cart.find((item) => item.id === id)
    if (existing) {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { id, quantity: 1 }])
    }
  }

  // Filter products
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (selectedBrand !== "all" && product.brand !== selectedBrand) return false
    if (product.price > priceMax) return false

    return true
  })

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
              <span className="font-bold text-base tracking-tight text-slate-900">Your Logo</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
              <Link to="/customer/catalog" className="px-3 py-2 rounded-lg bg-slate-100 text-blue-600 font-bold">
                Products
              </Link>
              <a href="#terms" onClick={(e) => e.preventDefault()} className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                Terms & Condition
              </a>
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
              placeholder="Search products, brands..."
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
              onClick={() => alert(`Wishlist contains ${wishlist.length} saved items`)}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs"
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
              onClick={() => alert(`Cart contains ${cart.reduce((a, b) => a + b.quantity, 0)} items`)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-300 transition-colors shadow-xs"
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
                  JD
                </div>
                <ChevronDown className="size-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900">Jane Doe</p>
                    <p className="text-[10px] text-slate-500">jane.doe@example.com</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      alert("My Profile clicked")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="size-3.5 text-blue-600" />
                    <span>My account / My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      alert("My Orders clicked")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Package className="size-3.5 text-indigo-600" />
                    <span>My Orders</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false)
                      alert("Settings clicked")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <SettingsIcon className="size-3.5 text-slate-500" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      localStorage.removeItem("user")
                      navigate("/customer/signin")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    <LogOut className="size-3.5" />
                    <span>Logout</span>
                  </button>
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
        {/* LEFT SIDEBAR FILTERS (Wireframe matching: Brand, Color, Duration, Price Range) */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-blue-600" />
              <span>Filters</span>
            </h2>
            <button
              onClick={() => {
                setSelectedBrand("all")
                setSelectedColor(null)
                setSelectedDuration("All Duration")
                setPriceMax(100)
                setSearchQuery("")
              }}
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              Reset All
            </button>
          </div>

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
              <option value="IKEA">IKEA</option>
              <option value="Sony">Sony</option>
              <option value="Dell">Dell</option>
              <option value="ASUS">ASUS</option>
              <option value="Bose">Bose</option>
              <option value="Herman Miller">Herman Miller</option>
            </select>
          </div>

          {/* 2. Color Swatches Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => {
                const isSelected = selectedColor === color.hex
                return (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(isSelected ? null : color.hex)}
                    style={{ backgroundColor: color.hex }}
                    className={`size-7 rounded-full transition-transform flex items-center justify-center shadow-xs ${
                      isSelected ? "ring-2 ring-blue-600 ring-offset-2 scale-110" : "hover:scale-105"
                    }`}
                    title={color.name}
                  >
                    {isSelected && <Check className="size-3.5 text-white drop-shadow-md" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Duration Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All Duration">All Duration</option>
              <option value="1 Month">1 Month</option>
              <option value="6 Month">6 Month</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
            </select>
          </div>

          {/* 4. Price Range Filter */}
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Featured Products ({filteredProducts.length})
            </h1>
            <span className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">1</span> of 1
            </span>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                No products match your selected filter criteria.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id)
                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Wishlist Button Overlay */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2.5 right-2.5 size-8 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors shadow-xs"
                      >
                        <Heart
                          className={`size-4 ${
                            isWishlisted ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>

                      {/* Out of Stock Overlay Badge */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-slate-700">
                            Out of stock
                          </span>
                        </div>
                      )}

                      {/* Size Variants Badge (Wireframe annotation: 36, 42 & 55 inch TV) */}
                      {product.sizeVariants && (
                        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
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
                      <div className="space-y-1">
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
                      </div>

                      {/* Color Swatches (Wireframe matching: Show variant images / color dots) */}
                      {product.colorVariants && (
                        <div className="flex items-center gap-1.5 pt-1">
                          {product.colorVariants.map((hex, idx) => (
                            <div
                              key={idx}
                              style={{ backgroundColor: hex }}
                              className="size-3.5 rounded-full border border-slate-300"
                            />
                          ))}
                        </div>
                      )}

                      {/* Price & Billing Period (Wireframe matching: Rs. xx / per Month, per day, per hour) */}
                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="font-mono text-base font-extrabold text-slate-900">
                            ${product.price}
                          </span>
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            / {product.billingPeriod}
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={!product.inStock}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-colors"
                        >
                          Rent Now
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ========================================================================= */}
          {/* PAGINATION CONTROLS (Wireframe matching: [<] [1] [2] ... [>]) */}
          {/* ========================================================================= */}
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={() => setCurrentPage(1)}
              className={`size-8 rounded-xl font-semibold text-xs transition-colors ${
                currentPage === 1
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              1
            </button>

            <button
              onClick={() => setCurrentPage(2)}
              className={`size-8 rounded-xl font-semibold text-xs transition-colors ${
                currentPage === 2
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              2
            </button>

            <span className="text-slate-400 font-mono text-xs px-1">...</span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
