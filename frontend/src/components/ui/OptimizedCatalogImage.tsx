import { useState, useEffect } from "react"
import { ImageOff } from "lucide-react"

interface OptimizedCatalogImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  fallbackSrc?: string
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80"

// Cache set for image URLs that have already loaded in browser memory
const preloadedImageCache = new Set<string>()

/**
 * Preloads an image URL into browser memory cache.
 */
export function preloadImage(src: string): Promise<void> {
  if (!src || preloadedImageCache.has(src)) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      preloadedImageCache.add(src)
      resolve()
    }
    img.onerror = () => {
      resolve()
    }
    img.src = src
  })
}

/**
 * Batch preloads an array of image URLs.
 */
export function preloadImages(urls: string[]) {
  urls.forEach((url) => {
    if (url) preloadImage(url)
  })
}

export function OptimizedCatalogImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc = DEFAULT_FALLBACK,
}: OptimizedCatalogImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const isAlreadyLoaded = preloadedImageCache.has(src)
  const [isLoaded, setIsLoaded] = useState(isAlreadyLoaded)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setCurrentSrc(src)
    if (preloadedImageCache.has(src)) {
      setIsLoaded(true)
      setHasError(false)
      return
    }

    setIsLoaded(false)
    setHasError(false)

    let isSubscribed = true
    preloadImage(src).then(() => {
      if (isSubscribed) {
        setIsLoaded(true)
      }
    })

    return () => {
      isSubscribed = false
    }
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setCurrentSrc(fallbackSrc)
    }
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}>
      {/* Skeleton Pulse Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-10 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
        </div>
      )}

      {/* Error State Fallback */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
          <ImageOff className="size-6 mb-1 text-slate-300" />
          <span className="text-[10px] font-medium">Image unavailable</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading="eager"
          decoding="async"
          onLoad={() => {
            preloadedImageCache.add(currentSrc)
            setIsLoaded(true)
          }}
          onError={handleError}
          className={`h-full w-full object-cover transition-all duration-300 ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } ${className}`}
        />
      )}
    </div>
  )
}
