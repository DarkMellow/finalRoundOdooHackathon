import { useState, useEffect, useCallback, useRef } from "react"
import { fetchProductsPaginated, type ApiProduct } from "@/lib/api"
import { preloadImages } from "@/components/ui/OptimizedCatalogImage"

export interface Product {
  id: string
  title: string
  description: string
  category: string
  brand: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  discountName?: string
  billingPeriod: "per Month" | "per day" | "per hour"
  sizeVariants?: string[]
  tags: string[]
  inStock: boolean
  rating: number
}

function mapApiProductToProduct(item: ApiProduct): Product {
  let hasStock = true
  let price = item.sales_price || 0
  let coverImg = "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80"
  if (item.attributes_json) {
    try {
      const parsed = JSON.parse(item.attributes_json)
      if (parsed && Array.isArray(parsed.variants) && parsed.variants.length > 0) {
        hasStock = parsed.variants.some((v: any) => (parseInt(v.stockQuantity || "0", 10) || 0) > 0)
        const firstPrice = parseFloat(parsed.variants[0].price)
        if (!isNaN(firstPrice) && firstPrice > 0) price = firstPrice
        const variantWithImg = parsed.variants.find((v: any) => v.imageUrl && v.imageUrl.trim() !== "")
        if (variantWithImg) coverImg = variantWithImg.imageUrl
      }
    } catch {
      // Ignore JSON parse errors
    }
  }
  const brandName = item.vendor_brand || item.vendor_name || `Vendor #${item.vendor_id}`
  return {
    id: `db-${item.id}`,
    title: item.name,
    description: `${brandName} • ${item.product_type}`,
    category: item.category || (item.product_type === "Goods" ? "Electronics" : "Services"),
    brand: brandName,
    image: coverImg,
    price: item.discounted_price || price,
    originalPrice: item.discount_percent && item.discount_percent > 0 ? (item.sales_price || price) : undefined,
    discount: item.discount_percent || undefined,
    discountName: item.discount_name || undefined,
    billingPeriod: "per Month",
    tags: [item.category || "Electronics", item.product_type, brandName],
    inStock: hasStock,
    rating: 5.0,
  }
}

interface UseCatalogPrefetchOptions {
  itemsPerPage?: number
  searchQuery?: string
  selectedTag?: string
  selectedBrand?: string
  priceMax?: number
}

export function useCatalogPrefetch({
  itemsPerPage = 6,
  searchQuery = "",
  selectedTag = "All Tags",
  selectedBrand = "all",
  priceMax = 2000,
}: UseCatalogPrefetchOptions = {}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCache, setPageCache] = useState<Record<number, Product[]>>({})
  const [totalCount, setTotalCount] = useState<number>(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)

  // Track active fetching requests to avoid duplicate parallel requests
  const fetchingRef = useRef<Set<number>>(new Set())

  // Calculate total pages based on catalog count
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / itemsPerPage))

  /**
   * Helper to fetch a single page slice from backend using current filter parameters.
   */
  const fetchPageData = useCallback(
    async (pageToFetch: number): Promise<{ products: Product[]; total: number }> => {
      if (fetchingRef.current.has(pageToFetch)) {
        return { products: [], total: 0 }
      }
      fetchingRef.current.add(pageToFetch)

      try {
        const skip = (pageToFetch - 1) * itemsPerPage
        const response = await fetchProductsPaginated(
          undefined,
          skip,
          itemsPerPage,
          searchQuery,
          selectedTag,
          selectedBrand,
          priceMax
        )
        const { items, total } = response

        const publishedItems = items.filter((item) => item.is_published !== false)
        const mappedProducts = publishedItems.map(mapApiProductToProduct)

        // Preload image assets for all products on this page immediately
        const imageUrls = mappedProducts.map((p) => p.image).filter(Boolean)
        preloadImages(imageUrls)

        setTotalCount(total)
        setPageCache((prev) => ({
          ...prev,
          [pageToFetch]: mappedProducts,
        }))

        return { products: mappedProducts, total }
      } catch (err) {
        console.warn(`Failed to fetch catalog page ${pageToFetch}:`, err)
        return { products: [], total: 0 }
      } finally {
        fetchingRef.current.delete(pageToFetch)
      }
    },
    [itemsPerPage, searchQuery, selectedTag, selectedBrand, priceMax]
  )

  /**
   * Calculates target pages that should be pre-cached:
   * 1. First Page (Page 1)
   * 2. Very Last Page (Page totalPages)
   * 3. Next 2 pages (currentPage + 1, currentPage + 2)
   * 4. Previous 2 pages (currentPage - 1, currentPage - 2)
   */
  const getTargetPagesToCache = useCallback(
    (page: number, maxPages: number): number[] => {
      const targets = new Set<number>()
      targets.add(1)
      if (maxPages >= 1) targets.add(maxPages)

      if (page >= 1 && page <= maxPages) targets.add(page)
      if (page + 1 <= maxPages) targets.add(page + 1)
      if (page + 2 <= maxPages) targets.add(page + 2)
      if (page - 1 >= 1) targets.add(page - 1)
      if (page - 2 >= 1) targets.add(page - 2)

      return Array.from(targets).sort((a, b) => a - b)
    },
    []
  )

  // 1. Initial Page 1 fetch when filter choices change
  useEffect(() => {
    let isSubscribed = true
    setInitialLoading(true)
    setPageCache({})
    setCurrentPage(1)
    fetchingRef.current.clear()

    fetchPageData(1).then(({ total }) => {
      if (!isSubscribed) return
      setInitialLoading(false)

      const calcTotalPages = Math.max(1, Math.ceil(total / itemsPerPage))
      const targets = getTargetPagesToCache(1, calcTotalPages)
      targets.forEach((targetPage) => {
        if (targetPage !== 1 && !fetchingRef.current.has(targetPage)) {
          fetchPageData(targetPage)
        }
      })
    })

    return () => {
      isSubscribed = false
    }
  }, [searchQuery, selectedTag, selectedBrand, priceMax, itemsPerPage, fetchPageData, getTargetPagesToCache])

  // 2. Handle page navigation & background prefetching for adjacent/last pages
  useEffect(() => {
    if (initialLoading) return

    // If current page is not cached yet, mark pageLoading true and fetch it
    if (!pageCache[currentPage] && !fetchingRef.current.has(currentPage)) {
      setPageLoading(true)
      fetchPageData(currentPage).finally(() => setPageLoading(false))
    }

    // Trigger non-blocking background prefetch for target window
    const targetPages = getTargetPagesToCache(currentPage, totalPages)
    targetPages.forEach((targetPage) => {
      if (!pageCache[targetPage] && !fetchingRef.current.has(targetPage)) {
        fetchPageData(targetPage)
      }
    })
  }, [currentPage, totalPages, pageCache, initialLoading, fetchPageData, getTargetPagesToCache])

  const currentPageProducts = pageCache[currentPage] || []

  // Set current page helper
  const handleSetCurrentPage = (pageOrFn: number | ((prev: number) => number)) => {
    setCurrentPage(pageOrFn)
  }

  return {
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    products: currentPageProducts,
    totalCount,
    totalPages,
    initialLoading,
    pageLoading,
    cachedPagesCount: Object.keys(pageCache).length,
  }
}
