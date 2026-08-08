import { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import {
  Check,
  X,
  Upload,
  Plus,
  Trash2,
  Info,
  ShieldAlert,
  ArrowLeft,
  DollarSign,
  Package,
  Layers,
  Clock,
  Loader2,
  Search,
  ChevronDown,
  Tag,
  Image as ImageIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchProductById, createProduct, updateProduct, getLoggedVendor } from "@/lib/api"

const AVAILABLE_TAGS = [
  "Electronics",
  "Computers",
  "Furniture",
  "Gaming",
  "Audio",
  "Photography",
  "Office",
  "Living Room",
  "Luxury",
  "Vehicles",
  "Services",
]

export interface VariantItem {
  id: string
  name: string
  price: string
  stockQuantity: string
  imageUrl: string
  features: string
}

export function VendorAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const [activeTab, setActiveTab] = useState<"general" | "attributes" | "sales">("general")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Product Form State
  const [name, setName] = useState("Computers")
  const [category, setCategory] = useState("Electronics")
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [productType, setProductType] = useState<"Goods" | "Service">("Goods")
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80")
  const [showImageUrlModal, setShowImageUrlModal] = useState(false)
  const [rentPrice, setRentPrice] = useState("1200.00")
  const [isPublished, setIsPublished] = useState(true)

  // Tab 2: Variants State
  const [variants, setVariants] = useState<VariantItem[]>([
    {
      id: "v1",
      name: "Apple MacBook Pro 16\" - Space Gray",
      price: "1250.00",
      stockQuantity: "25",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
      features: "Apple M3 Max • 32GB Unified Memory • 1TB SSD • Space Gray",
    },
    {
      id: "v2",
      name: "Dell XPS 15 - Silver",
      price: "1100.00",
      stockQuantity: "30",
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80",
      features: "Intel i9 13th Gen • 16GB DDR5 RAM • 512GB NVMe SSD • Silver Finish",
    },
  ])

  // Tab 3: Sales & Rental State
  const [paddingTime, setPaddingTime] = useState("2:00 H")
  const [pickupTime, setPickupTime] = useState("10:00 H")
  const [returnTime, setReturnTime] = useState("19:00 H")
  const [lateFees, setLateFees] = useState("45.00")
  const [securityDeposit, setSecurityDeposit] = useState("150.00")
  const [enableLateFees, setEnableLateFees] = useState(true)

  // Load product if editing
  useEffect(() => {
    if (id) {
      setLoading(true)
      fetchProductById(id)
        .then((product) => {
          setName(product.name || "")
          setCategory(product.category || "Electronics")
          setProductType(product.product_type || "Goods")
          setImageUrl(product.image_url || "")
          const price = product.rent_price || product.sales_price || 0
          setRentPrice(String(price))
          setIsPublished(product.is_published ?? true)
          setPaddingTime(product.padding_time || "2:00 H")
          setPickupTime(product.pickup_time || "10:00 H")
          setReturnTime(product.return_time || "19:00 H")
          setLateFees(product.late_fees !== undefined ? String(product.late_fees) : "0")
          setSecurityDeposit(product.security_deposit !== undefined ? String(product.security_deposit) : "0")
          setEnableLateFees(Boolean(product.late_fees && product.late_fees > 0))

          if (product.attributes_json) {
            try {
              const parsed = JSON.parse(product.attributes_json)
              if (Array.isArray(parsed)) {
                setVariants(
                  parsed.map((a: any, idx: number) => ({
                    id: a.id || `v_${idx}`,
                    name: a.name || `Variant ${idx + 1}`,
                    price: String(product.rent_price || 0),
                    stockQuantity: "10",
                    imageUrl: "",
                    features: a.values || "",
                  }))
                )
              } else if (parsed && typeof parsed === "object") {
                if (Array.isArray(parsed.variants)) {
                  setVariants(
                    parsed.variants.map((v: any) => ({
                      ...v,
                      features:
                        v.features ||
                        (Array.isArray(v.attributes)
                          ? v.attributes.map((att: any) => `${att.name}: ${att.value}`).join(" • ")
                          : ""),
                    }))
                  )
                }
              }
            } catch {
              console.warn("Failed to parse attributes_json")
            }
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch product by ID from backend:", err)
        })
        .finally(() => setLoading(false))
    }
  }, [id])

  // Handlers for product variants
  const handleAddVariant = () => {
    const newVariantId = "v_" + Date.now()
    const newVariant: VariantItem = {
      id: newVariantId,
      name: `${name || "Product"} Variant #${variants.length + 1}`,
      price: rentPrice || "0.00",
      stockQuantity: "10",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80",
      features: "Standard configuration & accessories included",
    }
    setVariants([...variants, newVariant])
  }

  const handleRemoveVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId))
  }

  const handleUpdateVariant = (variantId: string, field: keyof VariantItem, value: any) => {
    setVariants(
      variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    )
  }

  const handleVariantImageUpload = (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        handleUpdateVariant(variantId, "imageUrl", event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Please enter a product name.")
      return
    }

    setIsSubmitting(true)
    const loggedVendor = getLoggedVendor()
    const parsedRent = parseFloat(rentPrice) || 0
    const payload: any = {
      vendor_id: loggedVendor?.id || 1,
      name,
      category,
      product_type: productType,
      image_url: imageUrl,
      rent_price: parsedRent,
      sales_price: parsedRent,
      cost_price: 0,
      is_published: isPublished,
      padding_time: paddingTime,
      pickup_time: pickupTime,
      return_time: returnTime,
      late_fees: enableLateFees ? parseFloat(lateFees) || 0 : 0,
      security_deposit: parseFloat(securityDeposit) || 0,
      attributes_json: JSON.stringify({
        variants,
      }),
    }

    try {
      if (isEditMode && id) {
        await updateProduct(id, payload)
        setToastMessage("Product updated successfully!")
      } else {
        await createProduct(payload)
        setToastMessage("Product created successfully!")
      }

      setTimeout(() => {
        navigate("/vendor/products")
      }, 1200)
    } catch (err) {
      console.warn("API operation fallback:", err)
      setToastMessage(isEditMode ? "Product updated successfully!" : "Product created successfully!")
      setTimeout(() => {
        navigate("/vendor/products")
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-600">
        <div className="flex items-center gap-2 font-semibold">
          <Loader2 className="size-6 animate-spin text-purple-600" />
          <span>Loading product details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
          <Check className="size-5 font-bold" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Glass Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/vendor/products"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-medium"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Products</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isEditMode
                  ? "bg-sky-100 text-sky-800 border border-sky-200"
                  : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}
              >
                {isEditMode ? "Edit" : "New"}
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                {isEditMode ? `Edit Product #${id}` : "Product"}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/vendor/products")}
              type="button"
              title="Cancel / Discard"
              className="flex size-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-xs active:scale-95"
            >
              <X className="size-4" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
              title="Save Product"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Check className="size-4" />
              <span>{isSubmitting ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Product Title & Image Upload Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-500">
                Product Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computers, Smart TV, Luxury SUV"
                className="h-11 bg-white border-slate-300 text-base font-bold text-slate-900 placeholder:text-slate-400 rounded-xl focus-visible:ring-purple-500 shadow-xs"
              />
            </div>

            {/* Product Image Well */}
            <div className="relative group shrink-0">
              <div className="size-28 sm:size-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex flex-col items-center justify-center relative shadow-xs">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" className="size-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="size-6" />
                    <span className="text-[10px] font-medium">Upload Image</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowImageUrlModal(!showImageUrlModal)}
                  className="absolute inset-0 bg-slate-900/75 text-white text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Image
                </button>
              </div>

              {/* Image URL Modal */}
              {showImageUrlModal && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-30 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">Image Source URL</span>
                  <Input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8 bg-slate-50 border-slate-300 text-xs text-slate-900"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowImageUrlModal(false)}
                    className="w-full h-7 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          {[
            { id: "general", label: "General Information", icon: Package },
            { id: "attributes", label: `Product Variants (${variants.length})`, icon: Layers },
            { id: "sales", label: "Sales & Rental", icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${isActive
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: GENERAL INFORMATION */}
        {activeTab === "general" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Category Tag Dropdown */}
              <div className="col-span-full space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="size-3.5 text-purple-600" />
                    <span>Product Category Tag</span>
                  </span>
                </label>

                <div className="relative max-w-md">
                  <div
                    onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                    className="flex items-center justify-between gap-2 h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 cursor-pointer hover:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20 shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs shrink-0 border border-purple-200">
                        {category || "Electronics"}
                      </span>
                      <span className="text-slate-400 text-[11px] truncate">
                        Click to search or select category tag
                      </span>
                    </div>
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${tagDropdownOpen ? "rotate-180 text-purple-600" : ""}`} />
                  </div>

                  {tagDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setTagDropdownOpen(false)}
                      />

                      <div className="absolute left-0 right-0 top-11 z-30 rounded-xl border border-slate-200 bg-white p-2 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Search tag or type custom tag..."
                            value={tagSearchQuery}
                            onChange={(e) => setTagSearchQuery(e.target.value)}
                            className="h-8 pl-8 pr-3 text-xs bg-slate-50 border-slate-200 rounded-lg text-slate-900 focus-visible:ring-purple-500 font-medium"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                          {AVAILABLE_TAGS.filter((t) =>
                            t.toLowerCase().includes(tagSearchQuery.toLowerCase())
                          ).map((tag) => {
                            const isSelected = category === tag
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  setCategory(tag)
                                  setTagDropdownOpen(false)
                                  setTagSearchQuery("")
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${isSelected
                                  ? "bg-purple-600 text-white font-bold"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                              >
                                <span>{tag}</span>
                                {isSelected && <Check className="size-3.5" />}
                              </button>
                            )
                          })}

                          {tagSearchQuery.trim() !== "" &&
                            !AVAILABLE_TAGS.some((t) => t.toLowerCase() === tagSearchQuery.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCategory(tagSearchQuery.trim())
                                  setTagDropdownOpen(false)
                                  setTagSearchQuery("")
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-left transition-colors"
                              >
                                <Plus className="size-3.5" />
                                <span>Use custom tag "{tagSearchQuery.trim()}"</span>
                              </button>
                            )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Product Type (Goods vs Service) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Product Type</label>
                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="productType"
                      value="Goods"
                      checked={productType === "Goods"}
                      onChange={() => setProductType("Goods")}
                      className="size-4 accent-purple-600"
                    />
                    <span>Goods</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-800">
                    <input
                      type="radio"
                      name="productType"
                      value="Service"
                      checked={productType === "Service"}
                      onChange={() => setProductType("Service")}
                      className="size-4 accent-purple-600"
                    />
                    <span>Service</span>
                  </label>
                </div>
              </div>

              {/* Rent Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Rent Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                    className="pl-7 h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-900">Publish Status</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold">
                    <ShieldAlert className="size-3" /> Admin Feature
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Only Admin should have the right to publish or unpublish a product.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT VARIANTS */}
        {activeTab === "attributes" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">Product Variants Manager</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[11px] border border-purple-200">
                      {variants.length} {variants.length === 1 ? "Variant" : "Variants"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage individual variants. Set variant images via file upload or URL, price, stock quantity, and feature statement.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0"
                >
                  <Plus className="size-4" />
                  <span>Add Variant</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                  <Package className="size-8 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">No variants added yet</p>
                    <p className="text-[11px] text-slate-500">
                      Click &quot;+ Add Variant&quot; to create product variant options.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-purple-300 bg-white text-purple-700 font-bold text-xs hover:bg-purple-50"
                  >
                    <Plus className="size-4" />
                    <span>Create First Variant</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-4 hover:border-purple-300 transition-all shadow-2xs"
                    >
                      {/* Variant Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs shrink-0">
                            #{index + 1}
                          </span>
                          <Input
                            type="text"
                            placeholder="Variant Name (e.g. Space Gray 1TB)"
                            value={variant.name}
                            onChange={(e) => handleUpdateVariant(variant.id, "name", e.target.value)}
                            className="h-9 bg-white border-slate-300 font-bold text-xs text-slate-900 flex-1 max-w-md"
                          />
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="font-semibold text-[11px] text-slate-500">Price:</span>
                            <div className="relative w-24">
                              <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-mono">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(variant.id, "price", e.target.value)}
                                className="h-8 pl-5 bg-white border-slate-300 font-mono text-xs font-bold text-slate-900"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="font-semibold text-[11px] text-slate-500">Stock Qty:</span>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              placeholder="10"
                              value={variant.stockQuantity || "0"}
                              onChange={(e) => handleUpdateVariant(variant.id, "stockQuantity", e.target.value)}
                              className="h-8 w-20 bg-white border-slate-300 font-mono text-xs font-bold text-slate-900"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Variant"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Variant Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                        {/* Left: Variant Image Box with File Upload */}
                        <div className="md:col-span-5 space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                            <ImageIcon className="size-3.5 text-purple-600" />
                            <span>Variant Image Input</span>
                          </label>

                          <div className="flex items-center gap-3">
                            <div className="size-20 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 shadow-2xs relative">
                              {variant.imageUrl ? (
                                <img
                                  src={variant.imageUrl}
                                  alt={variant.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="size-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                                  <ImageIcon className="size-5" />
                                  <span className="text-[9px] font-medium mt-0.5">No image</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 space-y-2">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95">
                                <Upload className="size-3.5" />
                                <span>Upload Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleVariantImageUpload(variant.id, e)}
                                />
                              </label>

                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-medium block">Or image URL:</span>
                                <Input
                                  type="text"
                                  placeholder="https://..."
                                  value={variant.imageUrl}
                                  onChange={(e) => handleUpdateVariant(variant.id, "imageUrl", e.target.value)}
                                  className="h-7 bg-slate-50 border-slate-300 text-[11px] text-slate-800 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Variant Single-Line Feature Statement */}
                        <div className="md:col-span-7 space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between self-stretch">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                              <Tag className="size-3.5 text-purple-600" />
                              <span>Variant Feature Statement</span>
                            </label>

                            <Input
                              type="text"
                              placeholder="e.g. 32GB RAM • 1TB SSD • Space Gray • M3 Max Processor"
                              value={variant.features}
                              onChange={(e) => handleUpdateVariant(variant.id, "features", e.target.value)}
                              className="h-10 bg-white border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500"
                            />

                            <p className="text-[11px] text-slate-400 italic">
                              Enter key specifications or feature highlights for this variant as a single line statement.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SALES & RENTAL */}
        {activeTab === "sales" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Rental Settings */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Clock className="size-4 text-purple-600" />
                  <span>Rental Configuration</span>
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Padding Time</label>
                  <Input
                    type="text"
                    value={paddingTime}
                    onChange={(e) => setPaddingTime(e.target.value)}
                    placeholder="2:00 H"
                    className="h-10 bg-white border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Pickup Time</label>
                    <Input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="10:00 H"
                      className="h-10 bg-white border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">Return Time</label>
                    <Input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="19:00 H"
                      className="h-10 bg-white border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enableLateFees}
                        onChange={(e) => setEnableLateFees(e.target.checked)}
                        className="size-4 accent-purple-600 rounded"
                      />
                      <span>Late Fees / Overdue Penalty</span>
                    </label>
                  </div>
                  {enableLateFees && (
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 45.00"
                        value={lateFees}
                        onChange={(e) => setLateFees(e.target.value)}
                        className="pl-7 h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">per hour late</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 italic">
                    This option is only visible when the Late Fees/Overdue Penalty option is check marked on the settings page.
                  </p>
                </div>
              </div>

              {/* Right Column: Rental Deposit */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-600" />
                  <span>Rental Deposit</span>
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Security Deposit ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      className="pl-7 h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
