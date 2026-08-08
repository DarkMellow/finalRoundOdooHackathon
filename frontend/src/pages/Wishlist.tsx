import { Heart, Star } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { fetchWishlistProducts, type WishlistProduct } from "@/lib/wishlistFetcher"

export function Wishlist() {
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const productCount = products.length

  const visibleProducts = useMemo(() => {
    return products
  }, [products])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center px-4 py-6">
      <section className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-[20px] font-bold text-slate-900">My Wishlist</h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                ({productCount} item{productCount === 1 ? "" : "s"})
              </span>
            </div>

          </div>
        </div>

        <div className="px-4 py-4">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                Loading wishlist...
              </div>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-500">
              <Heart className="size-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">Your wishlist is empty</p>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleProducts.map((item) => (
                <article key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {item.inStock ? (
                          <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            In Stock
                          </span>
                        ) : (
                          <span className="rounded-sm bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <h2 className="truncate text-[15px] font-semibold leading-6 text-slate-800">
                        {item.title}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-700">
                            {item.rating.toFixed(1)}
                          </span>
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span className="text-slate-500">({item.reviews})</span>
                        </div>

                        {item.assured && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                            Assured
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[14px] font-black text-slate-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>

                        {item.originalPrice && (
                          <>
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                            {item.discount && (
                              <span className="text-[11px] font-semibold text-blue-600">
                                {item.discount}% off
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.inStock ? (
                      <button className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 text-[11px] font-black uppercase text-white shadow-sm transition hover:opacity-90">
                        Add to Cart
                      </button>
                    ) : (
                      <button className="rounded-xl border border-blue-300 px-6 py-2 text-[11px] font-black uppercase text-blue-700">
                        Explore Similar
                      </button>
                    )}

                    <button className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-rose-500">
                      <Heart className="size-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Wishlist
