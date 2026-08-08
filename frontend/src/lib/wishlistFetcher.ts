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

export const wishlistProducts: WishlistProduct[] = [
  {
    id: "p-001",
    title: "JBL FLIP 3 Portable Bluetooth Mobile/Table Speaker (SQUAD, 2.0 Channel)",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80",
    inStock: true,
    price: 9975,
    originalPrice: 11999,
    discount: 16,
    rating: 4.0,
    reviews: 21,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-002",
    title: "Chevron Screen Guard for Apple iPhone 6",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80",
    inStock: false,
    price: 399,
    originalPrice: 845,
    discount: 11,
    rating: 4.5,
    reviews: 11,
    assured: false,
    stockText: "Out of Stock",
  },
  {
    id: "p-003",
    title: "Zotac NVIDIA GeForce GT 610 Synergy Edition 2 GB DDR3 Graphics Card",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80",
    inStock: true,
    price: 3999,
    originalPrice: 4990,
    discount: 5,
    rating: 4.3,
    reviews: 733,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-004",
    title: "GoPro Daydream View VR Headset with Controller (Slate)",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80",
    inStock: true,
    price: 6499,
    originalPrice: undefined,
    discount: undefined,
    rating: 4.4,
    reviews: 194,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-005",
    title: "Apple Watch Series 1 - 38 mm Silver Aluminium Case with White Sport Band",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80",
    inStock: true,
    price: 2200,
    originalPrice: 3290,
    discount: 4,
    rating: 4.3,
    reviews: 60,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-006",
    title: "Sony Wireless Headphones WH-1000XM4",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80",
    inStock: true,
    price: 17990,
    originalPrice: 24990,
    discount: 28,
    rating: 4.8,
    reviews: 980,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-007",
    title: "Canon EOS 1500D DSLR Camera Kit",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80",
    inStock: true,
    price: 34990,
    originalPrice: 42900,
    discount: 19,
    rating: 4.7,
    reviews: 405,
    assured: true,
    stockText: "In Stock",
  },
  {
    id: "p-008",
    title: "Acer Aspire 5 Thin and Light Laptop",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3c7b5?auto=format&fit=crop&q=80",
    inStock: true,
    price: 48990,
    originalPrice: 56990,
    discount: 14,
    rating: 4.2,
    reviews: 120,
    assured: false,
    stockText: "In Stock",
  },
]

export async function fetchWishlistProducts(): Promise<WishlistProduct[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(wishlistProducts)
    }, 300)
  })
}
