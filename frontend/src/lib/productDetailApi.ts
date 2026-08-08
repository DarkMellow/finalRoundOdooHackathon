import { fetchProductById } from "./api"

export interface ProductVariant {
  id: string
  name: string
  specifications: string
  rentPrice: number
  billingPeriod: "per day" | "per hour" | "per Month" | "per week"
  inStock: boolean
  stockQuantity: number
  imageUrl?: string
}

export interface ProductDetail {
  id: string
  title: string
  brand: string
  category: string
  description: string
  images: string[]
  tags: string[]
  rentPrice: number
  billingPeriod: "per day" | "per hour" | "per Month" | "per week"
  salesPrice?: number
  securityDeposit?: number
  lateFees?: number
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  vendorName: string
  vendorId?: number
  variants: ProductVariant[]
}

// Mock database for rich details & variants when viewing any product
const MOCK_PRODUCT_DETAILS_MAP: Record<string, ProductDetail> = {
  default: {
    id: "p1",
    title: "Ergonomic Mesh Executive Chair",
    brand: "Herman Miller Spec",
    category: "Furniture",
    description:
      "Engineered for high performance, maximum airflow, and long working hours. Features customizable lumbar support, 3D armrests, dynamic recline tension, and heavy-duty smooth rolling casters.",
    images: [
      "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
    ],
    tags: ["Office", "Ergonomic", "Furniture", "Executive"],
    rentPrice: 45,
    billingPeriod: "per Month",
    salesPrice: 499,
    securityDeposit: 50,
    lateFees: 10,
    inStock: true,
    stockQuantity: 12,
    rating: 4.8,
    reviewCount: 34,
    vendorName: "FurniFlex Solutions",
    variants: [
      {
        id: "v1",
        name: "Standard Mesh (Black / Silver Frame)",
        specifications: "Standard Height Adjust • Nylon Base",
        rentPrice: 45,
        billingPeriod: "per Month",
        inStock: true,
        stockQuantity: 8,
      },
      {
        id: "v2",
        name: "Pro Mesh + Headrest (Dark Graphite)",
        specifications: "Adjustable Headrest • Aluminum Base",
        rentPrice: 55,
        billingPeriod: "per Month",
        inStock: true,
        stockQuantity: 4,
      },
      {
        id: "v3",
        name: "Leatherette Edition (Midnight Black)",
        specifications: "Memory Foam Cushion • Polished Chrome",
        rentPrice: 65,
        billingPeriod: "per Month",
        inStock: false,
        stockQuantity: 0,
      },
    ],
  },
}

/**
 * MIMICKING API FUNCTION
 * 
 * This function mimics a async backend API endpoint call (e.g. GET /api/v1/products/:id/details).
 * When the backend API is implemented, backend engineers can simply swap out the internal body of
 * this function to fetch from the actual API endpoint without breaking the frontend components.
 */
export async function fetchProductDetails(productId: string): Promise<ProductDetail> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250))

  // If productId starts with "db-", it originated from backend products API
  if (productId.startsWith("db-")) {
    const rawId = productId.replace("db-", "")
    try {
      const realProduct = await fetchProductById(rawId)
      let parsedAttr: { variants?: any[] } = {}
      if (realProduct.attributes_json) {
        try {
          parsedAttr = JSON.parse(realProduct.attributes_json)
        } catch {
          // Ignore JSON parse error if invalid
        }
      }

      const variantImages: string[] = []
      if (Array.isArray(parsedAttr.variants)) {
        parsedAttr.variants.forEach((v) => {
          if (v.imageUrl && !variantImages.includes(v.imageUrl)) {
            variantImages.push(v.imageUrl)
          }
        })
      }

      return {
        id: productId,
        title: realProduct.name,
        brand: `Vendor #${realProduct.vendor_id}`,
        category: realProduct.category || "General",
        description: `High-quality ${realProduct.product_type.toLowerCase()} listing from Vendor #${realProduct.vendor_id}. Available for immediate flexible rental reservation with complete support and quality guarantee.`,
        images: [
          realProduct.image_url ||
            "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1000&q=80",
          ...variantImages,
        ],
        tags: [
          realProduct.category || "Rental",
          realProduct.product_type,
        ],
        rentPrice: realProduct.rent_price || 0,
        billingPeriod: "per Month",
        salesPrice: realProduct.sales_price,
        securityDeposit: realProduct.security_deposit || 0,
        lateFees: realProduct.late_fees || 0,
        inStock: Array.isArray(parsedAttr.variants) && parsedAttr.variants.length > 0
          ? parsedAttr.variants.some((v: any) => (parseInt(v.stockQuantity || "0", 10) || 0) > 0)
          : true,
        stockQuantity: Array.isArray(parsedAttr.variants)
          ? parsedAttr.variants.reduce((sum: number, v: any) => sum + (parseInt(v.stockQuantity || "0", 10) || 0), 0)
          : 10,
        rating: 4.9,
        reviewCount: 18,
        vendorName: `Vendor Partner #${realProduct.vendor_id}`,
        vendorId: realProduct.vendor_id,
        variants: Array.isArray(parsedAttr.variants) && parsedAttr.variants.length > 0
          ? parsedAttr.variants.map((v: any, idx: number) => {
              const qty = parseInt(v.stockQuantity || "10", 10) || 0
              return {
                id: v.id || `v-${realProduct.id}-${idx}`,
                name: v.name || `${realProduct.name} Variant ${idx + 1}`,
                specifications:
                  v.features ||
                  v.specifications ||
                  (Array.isArray(v.attributes)
                    ? v.attributes.map((a: any) => `${a.name}: ${a.value}`).join(" • ")
                    : "Standard rental configuration"),
                rentPrice: parseFloat(v.price) || realProduct.rent_price || 0,
                billingPeriod: "per Month",
                inStock: qty > 0,
                stockQuantity: qty,
                imageUrl: v.imageUrl || "",
              }
            })
          : [
              {
                id: `v-${realProduct.id}-1`,
                name: `${realProduct.name} - Standard Package`,
                specifications: "Standard rental configuration",
                rentPrice: realProduct.rent_price || 0,
                billingPeriod: "per Month",
                inStock: true,
                stockQuantity: 15,
              },
              {
                id: `v-${realProduct.id}-2`,
                name: `${realProduct.name} - Deluxe Package`,
                specifications: `Includes priority maintenance & extra accessories`,
                rentPrice: Math.round((realProduct.rent_price || 10) * 1.25),
                billingPeriod: "per Month",
                inStock: true,
                stockQuantity: 10,
              },
            ],
      }
    } catch (err) {
      console.warn("Could not fetch real product, falling back to mock:", err)
    }
  }

  // Check mock store or return rich structured fallback product
  if (MOCK_PRODUCT_DETAILS_MAP[productId]) {
    return MOCK_PRODUCT_DETAILS_MAP[productId]
  }

  return {
    id: productId,
    title: `Premium Rental Unit (${productId.toUpperCase()})`,
    brand: "EasyRental Certified",
    category: "Electronics",
    description:
      "Top-grade equipment thoroughly sanitized, tested, and ready for deployment. Offers seamless setup, versatile operation, and flexible rental return options.",
    images: [
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=1000&q=80",
    ],
    tags: ["Verified", "Fast Delivery", "Top Rated"],
    rentPrice: 65,
    billingPeriod: "per Month",
    salesPrice: 799,
    securityDeposit: 100,
    lateFees: 15,
    inStock: true,
    stockQuantity: 8,
    rating: 4.9,
    reviewCount: 42,
    vendorName: "EasyRental Partner Direct",
    variants: [
      {
        id: "v-def-1",
        name: "Standard Base Edition",
        specifications: "Full standard equipment kit",
        rentPrice: 65,
        billingPeriod: "per Month",
        inStock: true,
        stockQuantity: 5,
      },
      {
        id: "v-def-2",
        name: "Pro Performance Edition",
        specifications: "Enhanced specs + premium bundle",
        rentPrice: 85,
        billingPeriod: "per Month",
        inStock: true,
        stockQuantity: 3,
      },
    ],
  }
}
