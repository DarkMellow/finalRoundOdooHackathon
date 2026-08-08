import { useState, useEffect, useMemo } from "react"
import { Heart, Star, X, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react"
import { fetchWishlistProducts, type WishlistProduct } from "@/lib/wishlistFetcher"
import { Button } from "@/components/ui/button"

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

  const handleRemoveItem = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleAddToCartClick = (productId: string) => {
    setAddedCartIds((prev) => [...prev, productId])
    if (onAddToCart) {
      onAddToCart(productId)
    }
    setTimeout(() => {
      setAddedCartIds((prev) => prev.filter((id) => id !== productId))
    }, 2500)
  }

  const productCount = products.length
  const visibleProducts = useMemo(() => products, [products])

  if (!isOpen) return null

  const contentMarkup = (
    <section className="w-full rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
            <Heart className="size-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <span>My Wishlist</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {productCount} item{productCount === 1 ? "" : "s"}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Saved items ready for rental reservation
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your wishlist items...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center p-6 text-muted-foreground">
            <div className="size-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-1">
              <Heart className="size-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Your Wishlist is Empty</h3>
            <p className="text-xs max-w-xs">
              Explore our rental catalog and save your favorite items here for easy access.
            </p>
            {onClose && (
              <Button onClick={onClose} className="rounded-full mt-2 font-bold">
                Browse Catalog
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {visibleProducts.map((item) => {
              const isAdded = addedCartIds.includes(item.id)
              return (
                <article
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-border/60 bg-card p-4 gap-4 transition-all hover:border-border"
                >
                  {/* Left Product Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      onClick={() => onSelectProduct && onSelectProduct(item.id)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30 cursor-pointer group"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {item.inStock ? (
                          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            In Stock
                          </span>
                        ) : (
                          <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                            Out of Stock
                          </span>
                        )}
                        {item.assured && (
                          <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            Verified Equipment
                          </span>
                        )}
                      </div>

                      <h2
                        onClick={() => onSelectProduct && onSelectProduct(item.id)}
                        className="truncate text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h2>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="size-3.5 fill-amber-500" />
                          <span>{item.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground font-normal">({item.reviews})</span>
                        </div>

                        <span className="text-border">•</span>

                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-foreground">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          {item.discount && (
                            <span className="text-[10px] font-bold text-emerald-600">
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
                      <Button
                        onClick={() => handleAddToCartClick(item.id)}
                        size="sm"
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs"
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="size-3.5 mr-1 text-emerald-300" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="size-3.5 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="rounded-full text-xs font-semibold"
                      >
                        Out of Stock
                      </Button>
                    )}

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
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
