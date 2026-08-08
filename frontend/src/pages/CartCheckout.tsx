import { useState, useEffect } from "react"
import {
  X,
  ShoppingCart,
  Trash2,
  Bookmark,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Plus,
  Home,
  Briefcase,
  QrCode,
  Banknote,
  Check,
} from "lucide-react"
import {
  fetchCartSummary,
  updateRentalPeriod,
  updateCartItemQuantity,
  removeCartItem,
  toggleSaveForLater,
  applyCouponCode,
  fetchSavedAddresses,
  saveDeliveryAddress,
  fetchSavedCards,
  saveNewCard,
  processFinalOrder,
  type CartSummary,
  type DeliveryAddress,
  type SavedCard,
  type PaymentDetails,
} from "@/lib/cartCheckoutApi"
import { Button } from "@/components/ui/button"

interface CartCheckoutProps {
  isOpen: boolean
  onClose: () => void
}

export function CartCheckout({ isOpen, onClose }: CartCheckoutProps) {
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<"cart" | "address" | "payment" | "confirmed">("cart")

  // Rental Period state
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Coupon state
  const [couponInput, setCouponInput] = useState<string>("")
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; text: string } | null>(null)

  // Address state
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false)
  const [newAddrFullName, setNewAddrFullName] = useState<string>("")
  const [newAddrStreet, setNewAddrStreet] = useState<string>("")
  const [newAddrCity, setNewAddrCity] = useState<string>("")
  const [newAddrState, setNewAddrState] = useState<string>("")
  const [newAddrZip, setNewAddrZip] = useState<string>("")
  const [newAddrPhone, setNewAddrPhone] = useState<string>("")
  const [newAddrLabel, setNewAddrLabel] = useState<"Home" | "Work" | "Other">("Home")

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card")

  // Saved Cards state
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string>("")
  const [showNewCardForm, setShowNewCardForm] = useState<boolean>(false)
  const [newCardName, setNewCardName] = useState<string>("")
  const [newCardNumber, setNewCardNumber] = useState<string>("")
  const [newCardExpiry, setNewCardExpiry] = useState<string>("")
  const [newCardCvv, setNewCardCvv] = useState<string>("")

  const [upiId, setUpiId] = useState<string>("janedoe@upi")

  // Order Success state
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; message: string } | null>(null)

  // Load initial cart summary, addresses, and saved cards
  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setOrderSuccess(null)
    setCouponMessage(null)
    setActiveStep("cart")
    setShowNewAddressForm(false)
    setShowNewCardForm(false)

    Promise.all([fetchCartSummary(), fetchSavedAddresses(), fetchSavedCards()])
      .then(([cartData, addrData, cardData]) => {
        setCartSummary(cartData)
        setStartDate(cartData.startDate)
        setEndDate(cartData.endDate)

        setAddresses(addrData)
        if (addrData.length > 0) {
          const defaultAddr = addrData.find((a) => a.isDefault) || addrData[0]
          setSelectedAddressId(defaultAddr.id)
        }

        setSavedCards(cardData)
        if (cardData.length > 0) {
          const defaultCard = cardData.find((c) => c.isDefault) || cardData[0]
          setSelectedCardId(defaultCard.id)
        } else {
          setSelectedCardId("")
        }
      })
      .catch((err) => {
        console.error("Failed to load checkout data:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen])

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Handle Rental Period Date Changes
  const handleDatesChange = async (newStart: string, newEnd: string) => {
    setStartDate(newStart)
    setEndDate(newEnd)
    setActionLoading(true)
    try {
      const updated = await updateRentalPeriod(newStart, newEnd)
      setCartSummary(updated)
    } catch (err) {
      console.error("Failed to update rental period:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Item Quantity Adjustment
  const handleQuantityChange = async (itemId: string, newQty: number) => {
    setActionLoading(true)
    try {
      const updated = await updateCartItemQuantity(itemId, newQty)
      setCartSummary(updated)
    } catch (err) {
      console.error("Failed to update quantity:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Item Removal
  const handleRemoveItem = async (itemId: string) => {
    setActionLoading(true)
    try {
      const updated = await removeCartItem(itemId)
      setCartSummary(updated)
    } catch (err) {
      console.error("Failed to remove item:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Save for Later
  const handleSaveForLater = async (itemId: string) => {
    setActionLoading(true)
    try {
      const updated = await toggleSaveForLater(itemId)
      setCartSummary(updated)
    } catch (err) {
      console.error("Failed to toggle save for later:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setActionLoading(true)
    try {
      const res = await applyCouponCode(couponInput)
      setCouponMessage({ success: res.success, text: res.message })
      setCartSummary(res.summary)
    } catch (err) {
      console.error("Failed to apply coupon:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Adding New Address
  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddrFullName || !newAddrStreet || !newAddrCity) return

    setActionLoading(true)
    try {
      const updatedList = await saveDeliveryAddress({
        fullName: newAddrFullName,
        street: newAddrStreet,
        city: newAddrCity,
        state: newAddrState || "IL",
        zipCode: newAddrZip || "60601",
        phone: newAddrPhone || "+1 (555) 000-1122",
        label: newAddrLabel,
        isDefault: false,
      })
      setAddresses(updatedList)
      setSelectedAddressId(updatedList[0].id)
      setShowNewAddressForm(false)
      // Reset form
      setNewAddrFullName("")
      setNewAddrStreet("")
      setNewAddrCity("")
      setNewAddrState("")
      setNewAddrZip("")
      setNewAddrPhone("")
    } catch (err) {
      console.error("Failed to save new address:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Adding New Card
  const handleAddNewCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardName || !newCardNumber) return

    setActionLoading(true)
    try {
      const updatedCards = await saveNewCard({
        cardholderName: newCardName,
        cardNumber: newCardNumber,
        expiry: newCardExpiry || "12/28",
        brand: "Visa",
      })
      setSavedCards(updatedCards)
      setSelectedCardId(updatedCards[0].id)
      setShowNewCardForm(false)
      // Reset form
      setNewCardName("")
      setNewCardNumber("")
      setNewCardExpiry("")
      setNewCardCvv("")
    } catch (err) {
      console.error("Failed to save new card:", err)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Final Order Placement
  const handleFinalOrderSubmit = async () => {
    if (!selectedAddressId) return
    setActionLoading(true)

    const selectedCard = savedCards.find((c) => c.id === selectedCardId)

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      cardId: selectedCardId,
      cardName: selectedCard?.cardholderName,
      cardNumber: selectedCard ? `•••• ${selectedCard.cardNumberLast4}` : undefined,
      upiId,
    }

    try {
      const res = await processFinalOrder(selectedAddressId, paymentDetails)
      setOrderSuccess({ orderId: res.orderId, message: res.message })
      setActiveStep("confirmed")
    } catch (err) {
      console.error("Order placement failed:", err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Window Container */}
      <div
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Header with Breadcrumbs (Add to Cart > Address > Payment) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            {/* Step 1: Add to Cart */}
            <button
              onClick={() => setActiveStep("cart")}
              className={`flex items-center gap-1.5 transition-colors ${
                activeStep === "cart"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingCart className="size-4" />
              <span>Add to Cart</span>
            </button>

            <ChevronRight className="size-3.5 text-muted-foreground/60" />

            {/* Step 2: Address */}
            <button
              onClick={() => setActiveStep("address")}
              disabled={!cartSummary || cartSummary.items.length === 0}
              className={`flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
                activeStep === "address"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="size-4" />
              <span>Address</span>
            </button>

            <ChevronRight className="size-3.5 text-muted-foreground/60" />

            {/* Step 3: Payment */}
            <button
              onClick={() => setActiveStep("payment")}
              disabled={!selectedAddressId || !cartSummary || cartSummary.items.length === 0}
              className={`flex items-center gap-1.5 transition-colors disabled:opacity-40 ${
                activeStep === "payment"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="size-4" />
              <span>Payment</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[380px] gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading checkout portal...</p>
            </div>
          ) : activeStep === "confirmed" && orderSuccess ? (
            /* ======================================================== */
            /* STEP 4: ORDER CONFIRMED VIEW                             */
            /* ======================================================== */
            <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-6 space-y-4">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="size-10" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Order Confirmed!</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {orderSuccess.message}
              </p>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 font-mono text-xs text-foreground">
                Order Reference ID: <span className="font-bold text-primary">{orderSuccess.orderId}</span>
              </div>
              <Button onClick={onClose} size="lg" className="rounded-full mt-2 font-bold">
                Return to Catalog
              </Button>
            </div>
          ) : !cartSummary ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <AlertCircle className="size-12 text-destructive mb-2" />
              <h3 className="text-lg font-bold">Cart Unavailable</h3>
              <Button onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : activeStep === "cart" ? (
            /* ======================================================== */
            /* STEP 1: CART VIEW (ORDER SUMMARY & RENTAL PERIOD)         */
            /* ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Items Summary */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <span>Order Summary</span>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                      {cartSummary.items.length} items
                    </span>
                  </h2>

                  {actionLoading && <Loader2 className="size-4 animate-spin text-primary" />}
                </div>

                {cartSummary.items.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-border/80 text-muted-foreground">
                    <p className="text-sm font-medium">Your rental cart is currently empty.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartSummary.items.map((item) => {
                      const itemTotal = (item.hourlyRate * cartSummary.totalHours * item.quantity).toFixed(2)
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-xs gap-4 transition-all hover:border-slate-300"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              <img src={item.image} alt={item.title} className="size-full object-cover" />
                            </div>

                            <div className="flex flex-col min-w-0 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {item.brand}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {item.title}
                              </h4>
                              {item.variantName && (
                                <span className="text-[11px] text-slate-500 font-medium truncate">
                                  {item.variantName}
                                </span>
                              )}

                              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                                <span className="font-bold text-slate-900">${item.hourlyRate}/hr</span>
                                <span className="text-slate-400">×</span>
                                <span className="font-semibold text-slate-700">{cartSummary.totalHours} hrs</span>
                                <span className="text-slate-400">=</span>
                                <span className="font-black text-slate-900">${itemTotal}</span>
                              </div>

                              <div className="flex items-center gap-3 pt-1 text-xs">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-rose-600 hover:text-rose-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="size-3" />
                                  <span>Remove</span>
                                </button>
                                <span className="text-slate-200">|</span>
                                <button
                                  onClick={() => handleSaveForLater(item.id)}
                                  className="text-slate-500 hover:text-slate-800 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Bookmark className="size-3" />
                                  <span>Save for Later</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center border border-slate-200 rounded-full px-3 py-1 bg-slate-50 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="size-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="size-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full py-6 rounded-xl border-border/80 font-bold text-sm hover:bg-muted/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Continue Shopping</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Right Column: Rental Period & Proceed Button */}
              <div className="lg:col-span-5 flex flex-col space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="size-4 text-slate-700" />
                      <span>Rental Period</span>
                    </h3>
                    <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Clock className="size-3 text-slate-500" />
                      <span>{cartSummary.totalHours} Hours</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">
                        From (Rental Start):
                      </label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => handleDatesChange(e.target.value, endDate)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 block">
                        To (Rental End):
                      </label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => handleDatesChange(startDate, e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Sub Total</span>
                      <span className="font-mono font-bold text-slate-900">${cartSummary.subtotal.toFixed(2)}</span>
                    </div>

                    {cartSummary.discount > 0 && (
                      <div className="flex items-center justify-between text-emerald-600">
                        <span>Coupon Discount ({cartSummary.couponCode})</span>
                        <span className="font-mono font-bold">-${cartSummary.discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span className="text-base font-bold">Total</span>
                      <span className="font-mono text-xl font-black text-slate-900">${cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Coupon Box */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code (e.g. RENTAL10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      Apply Coupon
                    </button>
                  </div>

                  {couponMessage && (
                    <p
                      className={`text-xs font-semibold px-2 ${
                        couponMessage.success ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                {/* Proceed to Address Button */}
                <button
                  onClick={() => setActiveStep("address")}
                  disabled={cartSummary.items.length === 0 || actionLoading}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Proceed to Address</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : activeStep === "address" ? (
            /* ======================================================== */
            /* STEP 2: ADDRESS SELECTION & ADD NEW ADDRESS VIEW         */
            /* ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Select Saved Address */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <MapPin className="size-5 text-slate-900" />
                    <span>Select Delivery Address</span>
                  </h2>

                  <button
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>{showNewAddressForm ? "Cancel Form" : "Add New Address"}</span>
                  </button>
                </div>

                {/* New Address Form */}
                {showNewAddressForm ? (
                  <form onSubmit={handleAddNewAddress} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Add New Delivery Location
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newAddrFullName}
                        onChange={(e) => setNewAddrFullName(e.target.value)}
                        required
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number *"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        required
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Street Address *"
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        required
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={newAddrState}
                        onChange={(e) => setNewAddrState(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Zip Code *"
                        value={newAddrZip}
                        onChange={(e) => setNewAddrZip(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span className="font-semibold text-slate-600">Label:</span>
                      {(["Home", "Work", "Other"] as const).map((lbl) => (
                        <button
                          type="button"
                          key={lbl}
                          onClick={() => setNewAddrLabel(lbl)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            newAddrLabel === lbl
                              ? "bg-slate-900 text-white"
                              : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        Cancel
                      </Button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Save & Select Address
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  /* Empty state when user has no saved addresses */
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
                      <MapPin className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">No saved addresses found</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You haven't added any delivery locations yet. Add an address to proceed with your rental booking.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                ) : (
                  /* Saved Addresses Cards Grid */
                  <div className="space-y-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`flex items-start justify-between p-4.5 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-2 border-slate-900 bg-white shadow-xs"
                              : "border border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`mt-0.5 flex size-5 items-center justify-center rounded-full transition-colors ${
                                isSelected
                                  ? "bg-slate-900 text-white"
                                  : "border border-slate-300 text-transparent"
                              }`}
                            >
                              <Check className="size-3 stroke-[3]" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {addr.fullName}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                                  {addr.label === "Home" ? (
                                    <Home className="size-3 text-slate-500" />
                                  ) : (
                                    <Briefcase className="size-3 text-slate-500" />
                                  )}
                                  {addr.label}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Phone: {addr.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Back / Continue Action Row */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveStep("cart")}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back to Cart</span>
                  </button>

                  <button
                    onClick={() => setActiveStep("payment")}
                    disabled={!selectedAddressId}
                    className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary Brief */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                    Checkout Summary
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Total Items</span>
                      <span className="font-bold text-slate-900">{cartSummary.items.length}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Rental Duration</span>
                      <span className="font-mono font-bold text-slate-900">{cartSummary.totalHours} Hours</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
                      <span>Total Payable</span>
                      <span className="font-mono text-base font-extrabold text-slate-900">${cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* STEP 3: PAYMENT METHOD & SAVED CARDS SELECTION VIEW      */
            /* ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Payment Options & Selectable Saved Cards */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <CreditCard className="size-5 text-slate-900" />
                    <span>Select Payment Method</span>
                  </h2>

                  {paymentMethod === "card" && (
                    <button
                      onClick={() => setShowNewCardForm(!showNewCardForm)}
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>{showNewCardForm ? "Cancel Form" : "Add New Card"}</span>
                    </button>
                  )}
                </div>

                {/* Payment Option Tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-xs font-bold gap-2 cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-2 border-slate-900 bg-slate-100/90 text-slate-900 shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard className="size-5" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-xs font-bold gap-2 cursor-pointer ${
                      paymentMethod === "upi"
                        ? "border-2 border-slate-900 bg-slate-100/90 text-slate-900 shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <QrCode className="size-5" />
                    <span>UPI / Wallet</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-xs font-bold gap-2 cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-2 border-slate-900 bg-slate-100/90 text-slate-900 shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Banknote className="size-5" />
                    <span>Pay on Pickup</span>
                  </button>
                </div>

                {/* Payment Method Details Form / Selectable Cards */}
                <div className="space-y-4">
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      {/* Add New Card Form */}
                      {showNewCardForm ? (
                        <form
                          onSubmit={handleAddNewCard}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                        >
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Add New Card Information
                          </h3>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              placeholder="Jane Doe"
                              value={newCardName}
                              onChange={(e) => setNewCardName(e.target.value)}
                              required
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">
                              Card Number *
                            </label>
                            <input
                              type="text"
                              placeholder="4242 4242 4242 4242"
                              value={newCardNumber}
                              onChange={(e) => setNewCardNumber(e.target.value)}
                              required
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600">
                                Expiry (MM/YY) *
                              </label>
                              <input
                                type="text"
                                placeholder="12/28"
                                value={newCardExpiry}
                                onChange={(e) => setNewCardExpiry(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-600">
                                CVV *
                              </label>
                              <input
                                type="password"
                                placeholder="123"
                                value={newCardCvv}
                                onChange={(e) => setNewCardCvv(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewCardForm(false)}
                            >
                              Cancel
                            </Button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Save & Select Card
                            </button>
                          </div>
                        </form>
                      ) : savedCards.length === 0 ? (
                        /* Empty state when user has no saved cards */
                        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">
                            <CreditCard className="size-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-800">No saved cards found</p>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                              You haven't saved any credit or debit cards yet. Add a card to pay for your rental.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowNewCardForm(true)}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="size-3.5" />
                            <span>Add New Card</span>
                          </button>
                        </div>
                      ) : (
                        /* Selectable Saved Cards Grid */
                        <div className="space-y-3">
                          <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                            SAVED CARDS
                          </h3>
                          {savedCards.map((card) => {
                            const isSelected = selectedCardId === card.id
                            return (
                              <div
                                key={card.id}
                                onClick={() => setSelectedCardId(card.id)}
                                className={`flex items-center justify-between p-4.5 rounded-2xl cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-2 border-slate-900 bg-white shadow-xs"
                                    : "border border-slate-200 bg-white hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-3.5">
                                  <div
                                    className={`flex size-5 items-center justify-center rounded-full transition-colors ${
                                      isSelected
                                        ? "bg-slate-900 text-white"
                                        : "border border-slate-300 text-transparent"
                                    }`}
                                  >
                                    <Check className="size-3 stroke-[3]" />
                                  </div>

                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-900 tracking-wide">
                                        •••• •••• •••• {card.cardNumberLast4}
                                      </span>
                                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                        {card.brand}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {card.cardholderName} • Expires {card.expiry}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-xs">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        UPI ID / VPA
                      </h3>
                      <input
                        type="text"
                        placeholder="username@bank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-1 text-xs text-slate-600 shadow-xs">
                      <p className="font-bold text-slate-900">Pay on Pickup / Cash on Delivery</p>
                      <p>You can pay via Cash, Card, or UPI upon receiving or picking up your equipment.</p>
                    </div>
                  )}
                </div>

                {/* Back to Address Button on the Bottom Left */}
                <div className="pt-2">
                  <button
                    onClick={() => setActiveStep("address")}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back to Address</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Final Order Details & Confirm Button */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                    Final Order Details
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Items Count</span>
                      <span className="font-bold text-slate-900">{cartSummary.items.length} items</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-medium">
                      <span>Rental Duration</span>
                      <span className="font-mono font-bold text-slate-900">{cartSummary.totalHours} Hours</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-900 text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono text-base font-extrabold text-slate-900">${cartSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm & Pay Button Repositioned Under Final Order Details */}
                <button
                  onClick={handleFinalOrderSubmit}
                  disabled={actionLoading || (paymentMethod === "card" && !selectedCardId && !showNewCardForm)}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="size-4" />
                  <span>Confirm & Pay ${cartSummary.total.toFixed(2)}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
