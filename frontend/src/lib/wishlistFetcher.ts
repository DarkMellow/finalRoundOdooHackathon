export interface WishlistProduct {
  id: string
  title: string
  image: string
  inStock: boolean
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviews: number
  assured: boolean
  stockText: string
}

export const wishlistProducts: WishlistProduct[] = []

export async function fetchWishlistProducts(): Promise<WishlistProduct[]> {
  const API_BASE_URL =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  let userId: number | undefined
  try {
    const stored = localStorage.getItem("user") || localStorage.getItem("customer_user")
    if (stored) {
      userId = JSON.parse(stored).id
    }
  } catch {}

  try {
    const userParam = userId ? `?user_id=${userId}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/wishlist${userParam}`)
    if (res.ok) {
      const data: WishlistProduct[] = await res.json()
      return data
    }
  } catch (err) {
    console.warn("Failed to fetch wishlist from backend:", err)
  }
  return []
}

export async function toggleWishlistApi(
  productId: string,
  item?: WishlistProduct
): Promise<WishlistProduct[]> {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  let userId: number | undefined
  try {
    const stored = localStorage.getItem("user") || localStorage.getItem("customer_user")
    if (stored) {
      userId = JSON.parse(stored).id
    }
  } catch {}

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/wishlist/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        productId,
        item: item || undefined,
      }),
    })
    if (res.ok) {
      const data: WishlistProduct[] = await res.json()
      return data
    }
  } catch (err) {
    console.warn("Failed to toggle wishlist item on backend:", err)
  }
  return []
}

export async function removeWishlistApi(productId: string): Promise<WishlistProduct[]> {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  let userId: number | undefined
  try {
    const stored = localStorage.getItem("user") || localStorage.getItem("customer_user")
    if (stored) {
      userId = JSON.parse(stored).id
    }
  } catch {}

  try {
    const userParam = userId ? `?user_id=${userId}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/wishlist/items/${productId}${userParam}`, {
      method: "DELETE",
    })
    if (res.ok) {
      const data: WishlistProduct[] = await res.json()
      return data
    }
  } catch (err) {
    console.warn("Failed to remove wishlist item on backend:", err)
  }
  return []
}


