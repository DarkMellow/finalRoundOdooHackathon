import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Building2,
  ShoppingCart,
  Heart,
  ChevronDown,
  User,
  Package,
  LogOut,
  ShieldCheck,
  Zap,
  Clock,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { getLoggedCustomer, type CustomerUser } from "@/lib/api"
import { fetchCartSummary } from "@/lib/cartCheckoutApi"
import { fetchWishlistProducts } from "@/lib/wishlistFetcher"
import { CartCheckout } from "@/pages/CartCheckout"
import { Wishlist } from "@/pages/Wishlist"

export function AboutUs() {
  const navigate = useNavigate()
  const [loggedCustomer, setLoggedCustomer] = useState<CustomerUser | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)

  // Load user & cart / wishlist counts
  useEffect(() => {
    const user = getLoggedCustomer()
    if (user) {
      setLoggedCustomer(user)
    }
    fetchCartSummary().then((cart) => setCartItemCount(cart.items.length))
    fetchWishlistProducts().then((items: any[]) => setWishlistCount(items.length))
  }, [])

  const userFullName = loggedCustomer?.full_name || "Customer"
  const userEmail = loggedCustomer?.email || ""
  const userInitials = userFullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "C"

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
              <Link
                to="/customer/catalog"
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Products
              </Link>
              <Link
                to="/customer/about"
                className="px-3 py-2 rounded-lg bg-slate-100 text-blue-600 font-bold"
              >
                About us
              </Link>
              <Link
                to="/customer/contact"
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Header Action Items (Wishlist, Cart, Profile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWishlistModalOpen(true)}
              className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-xs cursor-pointer"
              title="Wishlist"
            >
              <Heart className={`size-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[9px]">
                  {wishlistCount}
                </span>
              )}
            </button>

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
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        navigate("/customer/profile")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100/80 transition-colors font-medium text-left"
                    >
                      <User className="size-4 text-blue-600" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        navigate("/customer/profile")
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
                        setUserDropdownOpen(false)
                        navigate("/customer/signin")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 py-16 sm:py-24 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1.5 text-xs font-extrabold text-blue-800 border border-blue-200">
            <Sparkles className="size-3.5 text-blue-600" />
            <span>Redefining Equipment Access</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
            Rent Anything You Need, <span className="text-blue-600">Whenever You Need It</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            EasyRental bridges the gap between verified local equipment vendors and individuals or businesses seeking top-tier tech, tools, and appliances without hefty ownership costs.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              to="/customer/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/customer/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-sm shadow-xs hover:bg-slate-50 transition-all active:scale-95"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STATS BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono">10,000+</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Happy Renters</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-mono">500+</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verified Vendors</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">99.4%</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">On-Time Delivery</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-600 font-mono">24/7</p>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CORE VALUE PILLARS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Choose EasyRental?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Our platform is built around trust, convenience, and transparent hourly pricing for every rental product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Vendors</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every equipment supplier on our marketplace undergoes strict background checks and quality inspections to ensure pristine product condition.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hourly Flex Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pay only for the exact duration you use. Select start and end rental timestamps, and our engine dynamically calculates your exact rate.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Zap className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Instant Online Booking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select saved payment cards, choose pickup or delivery, and manage active equipment rentals right from your personal dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MISSION & VISION STATEMENT */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/60 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-700/50">
              <Award className="size-3.5" />
              <span>Our Mission</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Democratizing Access to Premium Technology & Tools
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We believe that high-quality tools, photography gear, audio visual setups, and work equipment should be accessible to everyone without requiring large capital investments.
            </p>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Zero hidden charges or unexpected damage fees</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Verified customer reviews and transparent ratings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <span>Dedicated support for hassle-free order cancellation & refunds</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="size-5 text-blue-400" />
              <span>Built for Customers & Local Vendors Alike</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              For vendors, EasyRental serves as a powerful sales engine allowing small businesses to list inventory, track active rentals on an interactive schedule calendar, and generate steady recurring revenue.
            </p>

            <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Join as a Vendor partner</p>
                <p className="text-[11px] text-slate-400">Expand your local rental business online</p>
              </div>

              <Link
                to="/vendor/signup"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Vendor Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Building2 className="size-4" />
            </div>
            <span className="font-bold text-sm text-slate-900">EasyRental</span>
            <span className="text-slate-400">• © {new Date().getFullYear()} EasyRental Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/customer/catalog" className="hover:text-blue-600 transition-colors">Products</Link>
            <Link to="/customer/about" className="hover:text-blue-600 transition-colors font-bold text-slate-900">About us</Link>
            <Link to="/customer/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link>
            <Link to="/customer/profile" className="hover:text-blue-600 transition-colors">My Profile</Link>
          </div>
        </div>
      </footer>

      {/* Modals Integration */}
      <CartCheckout isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
      <Wishlist isOpen={isWishlistModalOpen} onClose={() => setIsWishlistModalOpen(false)} />
    </div>
  )
}

export default AboutUs
