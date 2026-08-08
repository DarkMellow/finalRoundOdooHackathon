import { useState, useEffect } from "react"
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
  Shield,
  Clock,
  PackageCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react"
import { fetchProductDetails, type ProductDetail, type ProductVariant } from "@/lib/productDetailApi"
import { Button } from "@/components/ui/button"

interface ProductExpansionViewProps {
  productId: string
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (productId: string, variantId?: string, quantity?: number) => void
  onToggleWishlist?: (productId: string) => void
  isWishlisted?: boolean
}

export function ProductExpansionView({
  productId,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductExpansionViewProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [localWishlist, setLocalWishlist] = useState<boolean>(isWishlisted)
  const [addedToast, setAddedToast] = useState<boolean>(false)

  // Sync wishlist prop
  useEffect(() => {
    setLocalWishlist(isWishlisted)
  }, [isWishlisted])

  // Load product details using the API mimicking function
  useEffect(() => {
    if (!isOpen || !productId) return

    setLoading(true)
    setSelectedImageIndex(0)
    setQuantity(1)
    setAddedToast(false)

    fetchProductDetails(productId)
      .then((data) => {
        setProduct(data)
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0])
        } else {
          setSelectedVariant(null)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product details:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [productId, isOpen])

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

  const handleWishlistClick = () => {
    setLocalWishlist((prev) => !prev)
    if (onToggleWishlist && product) {
      onToggleWishlist(product.id)
    }
  }

  const handleAddToCartClick = () => {
    if (!product) return
    if (onAddToCart) {
      onAddToCart(product.id, selectedVariant?.id, quantity)
    }
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  const activePrice = selectedVariant ? selectedVariant.rentPrice : product?.rentPrice || 0
  const activeBillingPeriod = selectedVariant ? selectedVariant.billingPeriod : product?.billingPeriod || "per Month"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container (Discord Settings / Notion Design System inspired) */}
      <div
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Close Button */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="size-4 text-primary" />
            <span>Product Expansion View</span>
          </div>

          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Fetching product details...</p>
            </div>
          ) : !product ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <AlertCircle className="size-12 text-destructive mb-2" />
              <h3 className="text-lg font-bold">Product Not Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The requested product expansion view could not be loaded.
              </p>
              <Button onClick={onClose} className="mt-4">
                Close View
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ======================================================== */}
              {/* LEFT COLUMN: IMAGES GALLERY & WISHLIST OVERLAY            */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Main Hero Image Frame */}
                <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 group">
                  <img
                    src={product.images[selectedImageIndex] || product.images[0]}
                    alt={product.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* WISHLIST BUTTON OVERLAY (Top-Right of Image - matching Wireframe) */}
                  <button
                    onClick={handleWishlistClick}
                    className={`absolute top-4 right-4 flex size-11 items-center justify-center rounded-full border shadow-md backdrop-blur-md transition-all ${
                      localWishlist
                        ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/80 dark:border-rose-800"
                        : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:text-rose-600 dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200"
                    }`}
                    title={localWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`size-5 transition-transform active:scale-125 ${localWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>

                  {/* Category Pill Tag Overlay (Top-Left of Image) */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <Tag className="size-3 text-primary" />
                    <span>{product.category}</span>
                  </div>
                </div>

                {/* Thumbnails Carousel Row */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {product.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === idx
                            ? "border-primary ring-2 ring-primary/20 scale-105"
                            : "border-border/60 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* RIGHT COLUMN: PRODUCT DETAILS & VARIANTS SELECTION        */}
              {/* ======================================================== */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                {/* Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Star className="size-3.5 fill-amber-500" />
                      <span>{product.rating}</span>
                      <span className="text-muted-foreground font-normal">({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* PRODUCT NAME */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
                    {product.title}
                  </h1>

                  {/* Vendor / Stock Badge */}
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                      <PackageCheck className="size-4 text-primary" />
                      {product.vendorName}
                    </span>
                    <span className="text-border">•</span>
                    {product.inStock ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> In Stock ({product.stockQuantity} available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing Banner */}
                <div className="flex items-baseline gap-2 p-4 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-3xl font-black text-primary">${activePrice}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{activeBillingPeriod}</span>
                  {product.securityDeposit && product.securityDeposit > 0 ? (
                    <span className="ml-auto text-xs text-muted-foreground font-medium">
                      +${product.securityDeposit} deposit
                    </span>
                  ) : null}
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* VARIANTS BOX (Matching Wireframe Layout) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Variants Options
                      </h3>
                      <span className="text-[11px] text-muted-foreground">
                        {product.variants.length} available
                      </span>
                    </div>

                    {/* Wireframe Variant Box Container */}
                    <div className="rounded-xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-xs">
                      {product.variants.map((v, index) => {
                        const isSelected = selectedVariant?.id === v.id
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-primary/10 font-semibold"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex size-5 items-center justify-center rounded-full border text-[11px] font-bold ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/40 text-muted-foreground"
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-foreground">{v.name}</span>
                                <span className="text-[11px] text-muted-foreground font-normal">
                                  {v.specifications}
                                </span>
                              </div>
                            </div>

                            {/* COST */}
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-primary">
                                ${v.rentPrice}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {v.billingPeriod}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Rental Parameters & Policy Pills */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                    <Clock className="size-4 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Late Return Fee</p>
                      <p className="text-[11px] text-muted-foreground">
                        {product.lateFees ? `$${product.lateFees}/day` : "Standard Policy"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                    <Shield className="size-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Insurance & Safety</p>
                      <p className="text-[11px] text-muted-foreground">Verified Hardware</p>
                    </div>
                  </div>
                </div>

                {/* Action Row: Quantity + Add To Cart CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between sm:justify-start border border-border/80 rounded-full px-3 py-1.5 bg-muted/30">
                    <span className="text-xs font-semibold text-muted-foreground mr-2 sm:hidden">
                      Qty:
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="size-7 flex items-center justify-center rounded-full hover:bg-muted disabled:opacity-40 text-foreground font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="size-7 flex items-center justify-center rounded-full hover:bg-muted text-foreground font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <Button
                    onClick={handleAddToCartClick}
                    disabled={!product.inStock}
                    size="lg"
                    className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="size-5 mr-2" />
                    Add To Cart • ${(activePrice * quantity).toFixed(2)}
                  </Button>
                </div>

                {/* Toast Notification */}
                {addedToast && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Item added to cart successfully!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
