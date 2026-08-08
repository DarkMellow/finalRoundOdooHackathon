import { useState, useEffect, useMemo } from "react"
import { Heart, Star, X, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react"
import {
  fetchWishlistProducts,
  removeWishlistApi,
  type WishlistProduct,
} from "@/lib/wishlistFetcher"
import { addItemToCart } from "@/lib/cartCheckoutApi"

interface WishlistProps {
  isOpen?: boolean
  onClose?: () => void
  onSelectProduct?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

export function Wishlist({
  isOpen = true,
  onClose,
  onSelectProduct,
  onAddToCart,
}: WishlistProps) {
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [addedCartIds, setAddedCartIds] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    fetchWishlistProducts()
      .then((items) => {
        setProducts(items)
      })
      .catch((error) => {
        console.error("Unable to load wishlist products", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen])

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose()
      }
    }
    if (isOpen && onClose) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      if (onClose) window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleRemoveItem = async (id: string) => {
    // Optimistic UI update
    setProducts((prev) => prev.filter((p) => p.id !== id))
    try {
      const updated = await removeWishlistApi(id)
      setProducts(updated)
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err)
    }
  }

  const handleAddToCartClick = async (product: WishlistProduct) => {
    setAddedCartIds((prev) => [...prev, product.id])
    if (onAddToCart) {
      onAddToCart(product.id)
    }
    try {
      await addItemToCart({
        productId: product.id,
        variantId: `${product.id}-default`,
        quantity: 1,
        title: product.title,
        brand: "Verified Equipment",
        image: product.image,
        hourlyRate: Math.max(1, Math.round(product.price / 24)),
        variantName: "Standard",
      })
    } catch (err) {
      console.warn("Failed to add wishlisted item to cart:", err)
    }

    setTimeout(() => {
      setAddedCartIds((prev) => prev.filter((id) => id !== product.id))
    }, 2500)
  }

  const productCount = products.length
  const visibleProducts = useMemo(() => products, [products])

  if (!isOpen) return null

  const contentMarkup = (
    <section className="w-full rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <Heart className="size-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>My Wishlist</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {productCount} items
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Saved items ready for rental reservation
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="size-8 animate-spin text-slate-900" />
            <p className="text-sm font-medium">Loading your wishlist items...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center p-6 text-slate-500">
            <div className="size-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1">
              <Heart className="size-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs max-w-xs text-slate-500">
              Explore our rental catalog and save your favorite items here for easy access.
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-full px-5 py-2 mt-2 bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Browse Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {visibleProducts.map((item) => {
              const isAdded = addedCartIds.includes(item.id)
              return (
                <article
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 gap-4 transition-all hover:border-slate-300 shadow-2xs"
                >
                  {/* Left Product Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      onClick={() => onSelectProduct && onSelectProduct(item.id)}
                      className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 cursor-pointer group"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.inStock ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                            IN STOCK
                          </span>
                        ) : (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                            OUT OF STOCK
                          </span>
                        )}
                        {item.assured && (
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            Verified Equipment
                          </span>
                        )}
                      </div>

                      <h2
                        onClick={() => onSelectProduct && onSelectProduct(item.id)}
                        className="truncate text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h2>

                      <div className="flex items-center gap-2.5 text-xs flex-wrap">
                        <div className="flex items-center gap-1 font-semibold">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-amber-500">{item.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({item.reviews})</span>
                        </div>

                        <span className="text-slate-300">•</span>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-[11px] font-bold text-emerald-600">
                              {item.discount}% off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    {item.inStock ? (
                      <button
                        onClick={() => handleAddToCartClick(item)}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-400 font-semibold text-xs cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Heart className="size-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )

  // If onClose prop is provided, render as modal overlay
  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {contentMarkup}
        </div>
      </div>
    )
  }

  // Standalone page fallback
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl">{contentMarkup}</div>
    </div>
  )
}

export default Wishlist

