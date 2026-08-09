import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Building2,
  ShoppingCart,
  Heart,
  ChevronDown,
  User,
  Package,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getLoggedCustomer, type CustomerUser } from "@/lib/api"
import { fetchCartSummary } from "@/lib/cartCheckoutApi"
import { fetchWishlistProducts } from "@/lib/wishlistFetcher"
import { CartCheckout } from "@/pages/CartCheckout"
import { Wishlist } from "@/pages/Wishlist"

export function ContactUs() {
  const navigate = useNavigate()
  const [loggedCustomer, setLoggedCustomer] = useState<CustomerUser | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)

  // Form state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("General Inquiry")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load user & cart / wishlist counts
  useEffect(() => {
    const user = getLoggedCustomer()
    if (user) {
      setLoggedCustomer(user)
      setFullName(user.full_name || "")
      setEmail(user.email || "")
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 600)
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
              <Link
                to="/customer/catalog"
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Products
              </Link>
              <Link
                to="/customer/about"
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                About us
              </Link>
              <Link
                to="/customer/contact"
                className="px-3 py-2 rounded-lg bg-slate-100 text-blue-600 font-bold"
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
      <section className="bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 py-12 sm:py-16 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1.5 text-xs font-extrabold text-blue-800 border border-blue-200">
            <MessageSquare className="size-3.5 text-blue-600" />
            <span>Dedicated Customer Care</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Get in Touch with <span className="text-blue-600">EasyRental</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Have questions about equipment rental options, vendor partnerships, or an active booking? Our team is available to assist you.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONTACT FORM & INFO GRID */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16 mx-auto max-w-7xl px-4 sm:px-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: CONTACT FORM (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Send Us a Message</h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below and our support team will respond within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-3 animate-in fade-in">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you for reaching out, <span className="font-bold">{fullName}</span>. A copy of your inquiry has been sent to support, and our agent will follow up shortly via <span className="font-semibold">{email}</span>.
                </p>
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setMessage("")
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-lg font-bold text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <Input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 text-xs bg-slate-50/50 border-slate-300 focus-visible:ring-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <Input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-xs bg-slate-50/50 border-slate-300 focus-visible:ring-blue-500 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Inquiry Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50/50 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Rental Order Support">Rental Order Support & Active Rentals</option>
                    <option value="Vendor Partnership">Vendor Partnership & Listing Items</option>
                    <option value="Billing & Refund">Billing, Cards & Refunds</option>
                    <option value="Technical Issue">Technical & App Issue</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe how we can assist you with your equipment rental..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-98"
                >
                  <Send className="size-4 mr-2" />
                  {isSubmitting ? "Sending Inquiry..." : "Submit Message"}
                </Button>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: CONTACT CARDS & FAQ (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Details Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Contact Information
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Headquarters Address</p>
                    <p className="text-slate-600 leading-relaxed mt-0.5">
                      100 Tech Plaza, Suite 500<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Support Phone Line</p>
                    <p className="text-slate-600 mt-0.5">+1 (800) 555-RENT (7368)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Support Email</p>
                    <p className="text-slate-600 mt-0.5">support@easyrental.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Operating Hours</p>
                    <p className="text-slate-600 mt-0.5">Monday – Saturday: 8:00 AM – 8:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="size-4 text-blue-600" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">How is hourly rate calculated?</p>
                  <p className="text-slate-600 leading-relaxed">
                    The total rental period is converted into exact hours from start timestamp to end timestamp and multiplied by the product hourly rate.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Can I cancel an active rental order?</p>
                  <p className="text-slate-600 leading-relaxed">
                    Yes, you can cancel any order from the My Orders view before the pickup timestamp occurs.
                  </p>
                </div>
              </div>
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
            <Link to="/customer/about" className="hover:text-blue-600 transition-colors">About us</Link>
            <Link to="/customer/contact" className="hover:text-blue-600 transition-colors font-bold text-slate-900">Contact Us</Link>
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

export default ContactUs
