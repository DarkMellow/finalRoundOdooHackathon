import { useState, useEffect } from "react"
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  Package,
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

  // Load product details using API mimicking function
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
          const firstVariant = data.variants[0]
          setSelectedVariant(firstVariant)
          const initialQtyCap = firstVariant.stockQuantity > 0 ? Math.min(1, firstVariant.stockQuantity) : 0
          setQuantity(initialQtyCap)
        } else {
          setSelectedVariant(null)
          setQuantity(data.stockQuantity > 0 ? 1 : 0)
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

  // Handle selecting a specific variant
  const handleVariantSelect = (v: ProductVariant) => {
    setSelectedVariant(v)

    // Switch hero image if variant has its own custom image
    if (v.imageUrl && product) {
      const existingIndex = product.images.findIndex((img) => img === v.imageUrl)
      if (existingIndex !== -1) {
        setSelectedImageIndex(existingIndex)
      } else {
        // Prepend image if not present and switch to index 0
        setProduct((prev) => (prev ? { ...prev, images: [v.imageUrl!, ...prev.images] } : prev))
        setSelectedImageIndex(0)
      }
    }

    // Cap quantity count according to selected variant's stock
    const maxStock = v.stockQuantity
    if (maxStock > 0) {
      setQuantity((q) => Math.min(Math.max(1, q), maxStock))
    } else {
      setQuantity(0)
    }
  }

  // Handle clicking an image thumbnail (selects relevant variant if matched)
  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index)
    if (!product || !product.images[index]) return
    const clickedImgUrl = product.images[index]

    if (product.variants && product.variants.length > 0) {
      const matchingVariant = product.variants.find((v) => v.imageUrl === clickedImgUrl)
      if (matchingVariant) {
        setSelectedVariant(matchingVariant)
        const maxStock = matchingVariant.stockQuantity
        if (maxStock > 0) {
          setQuantity((q) => Math.min(Math.max(1, q), maxStock))
        } else {
          setQuantity(0)
        }
      }
    }
  }

  const activePrice = selectedVariant ? selectedVariant.rentPrice : product?.rentPrice || 0
  const activeBillingPeriod = selectedVariant ? selectedVariant.billingPeriod : product?.billingPeriod || "per Month"
  const activeInStock = selectedVariant ? selectedVariant.inStock : product?.inStock || false
  const activeStockQty = selectedVariant ? selectedVariant.stockQuantity : product?.stockQuantity || 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      {/* Light Theme Modal Container */}
      <div
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/90">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
            <Sparkles className="size-4 text-purple-600" />
            <span>Product Expansion View</span>
          </div>

          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
              <Loader2 className="size-8 animate-spin text-purple-600" />
              <p className="text-sm font-medium">Fetching product details...</p>
            </div>
          ) : !product ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <AlertCircle className="size-12 text-rose-500 mb-2" />
              <h3 className="text-lg font-bold text-slate-900">Product Not Found</h3>
              <p className="text-sm text-slate-500 mt-1">
                The requested product expansion view could not be loaded.
              </p>
              <Button onClick={onClose} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                Close View
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: IMAGES GALLERY */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Main Hero Image Frame */}
                <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                  <img
                    src={product.images[selectedImageIndex] || product.images[0]}
                    alt={product.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* WISHLIST BUTTON OVERLAY */}
                  <button
                    onClick={handleWishlistClick}
                    className={`absolute top-4 right-4 flex size-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all ${localWishlist
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-white/90 border-slate-200 text-slate-700 hover:bg-white hover:text-rose-600"
                      }`}
                    title={localWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`size-5 transition-transform active:scale-125 ${localWishlist ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>

                  {/* Category Pill Tag Overlay */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <Tag className="size-3 text-purple-400" />
                    <span>{product.category}</span>
                  </div>
                </div>

                {/* Thumbnails Carousel Row */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {product.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleImageSelect(idx)}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === idx
                          ? "border-purple-600 ring-2 ring-purple-500/20 scale-105"
                          : "border-slate-200 opacity-75 hover:opacity-100"
                          }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: PRODUCT DETAILS & VARIANTS SELECTION */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                {/* Header Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1 text-amber-700 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                    </div>
                  </div>

                  {/* PRODUCT NAME */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
                    {product.title}
                  </h1>

                  {/* Vendor / Stock Badge reflecting Selected Variant Stock */}
                  <div className="flex items-center gap-3 text-xs pt-1">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      <PackageCheck className="size-4 text-purple-600" />
                      {product.vendorName}
                    </span>
                    <span className="text-slate-300">•</span>
                    {activeInStock ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="size-3.5" /> In Stock ({activeStockQty} available)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing Banner */}
                <div className="flex items-baseline gap-2 p-4 rounded-xl bg-purple-50/80 border border-purple-100">
                  <span className="text-3xl font-black text-purple-700">${activePrice}</span>
                  <span className="text-sm font-semibold text-slate-600">{activeBillingPeriod}</span>
                  {product.securityDeposit && product.securityDeposit > 0 ? (
                    <span className="ml-auto text-xs text-slate-500 font-medium">
                      +${product.securityDeposit} deposit
                    </span>
                  ) : null}
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Description
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* VARIANTS BOX */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Select Variant Option
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {product.variants.length} available options
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-2xs">
                      {product.variants.map((v, index) => {
                        const isSelected = selectedVariant?.id === v.id
                        return (
                          <div
                            key={v.id}
                            onClick={() => handleVariantSelect(v)}
                            className={`flex items-center justify-between gap-3 p-3.5 cursor-pointer transition-colors ${isSelected
                              ? "bg-purple-50/80 font-semibold text-slate-900 border-l-4 border-l-purple-600"
                              : "hover:bg-slate-50 text-slate-800"
                              }`}
                          >
                            {/* Left Side: Number + Title & Specs */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`flex size-5 items-center justify-center rounded-full border text-[11px] font-bold shrink-0 ${isSelected
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-slate-300 text-slate-400"
                                  }`}
                              >
                                {index + 1}
                              </div>
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {v.name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal truncate">
                                  {v.specifications}
                                </span>
                              </div>
                            </div>

                            {/* Right Side: Stock Badge + Price & Period */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <span
                                className={`whitespace-nowrap px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${v.inStock
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                              >
                                {v.inStock ? `${v.stockQuantity} in stock` : "Out of stock"}
                              </span>
                              <div className="flex flex-col items-end min-w-[55px] shrink-0">
                                <span className="text-sm font-extrabold text-purple-700 whitespace-nowrap">
                                  ${v.rentPrice}
                                </span>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {v.billingPeriod}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Rental Policy Pills */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <Clock className="size-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Late Return Fee</p>
                      <p className="text-[11px] text-slate-500">
                        {product.lateFees ? `$${product.lateFees}/day` : "Standard Policy"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    {product.productType === "Service" ? (
                      <Sparkles className="size-4 text-amber-600 shrink-0" />
                    ) : (
                      <Package className="size-4 text-purple-600 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">Item Type</p>
                      <span
                        className={`inline-flex items-center rounded font-bold mt-0.5 ${product.productType === "Service"
                          ? "text-amber-800"
                          : "text-purple-800"
                          }`}
                      >
                        {product.productType || "Goods"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Row: Capped Quantity Selector + Add To Cart CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Selector Capped by Selected Variant's Stock */}
                  <div className="flex items-center justify-between sm:justify-start border border-slate-200 rounded-full px-3.5 py-1.5 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || activeStockQty === 0}
                        className="size-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-800 disabled:opacity-40 font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-bold font-mono text-slate-900">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(activeStockQty, q + 1))}
                        disabled={quantity >= activeStockQty || activeStockQty === 0}
                        className="size-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-800 disabled:opacity-40 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add To Cart Button */}
                  <Button
                    onClick={handleAddToCartClick}
                    disabled={!activeInStock || activeStockQty === 0 || quantity === 0}
                    size="lg"
                    className="flex-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <ShoppingCart className="size-5 mr-2" />
                    {!activeInStock || activeStockQty === 0
                      ? "Out of Stock"
                      : `Add To Cart • $${(activePrice * quantity).toFixed(2)}`}
                  </Button>
                </div>

                {/* Toast Notification */}
                {addedToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
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
