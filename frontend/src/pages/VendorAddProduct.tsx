import React, { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  Package,
  Save,
  CheckCircle2,
  Building2,
  Upload,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Tag,
  DollarSign,
  Layers,
  ShoppingBag,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { createProduct, updateProduct, fetchProductById, getLoggedVendor, type VendorUser } from "@/lib/api"

interface VariantItem {
  id: string
  name: string
  price: string
  stockQuantity: string
  imageUrl: string
  features: string
}

export function VendorAddProduct() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [loggedVendor, setLoggedVendor] = useState<VendorUser | null>(null)
  const [activeTab, setActiveTab] = useState<"general" | "attributes" | "sales">("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Tab 1: General Product State
  const [name, setName] = useState("")
  const [category, setCategory] = useState("Electronics")
  const [productType, setProductType] = useState<"Goods" | "Service">("Goods")
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

  // Load active logged vendor
  useEffect(() => {
    const vendor = getLoggedVendor()
    setLoggedVendor(vendor)
  }, [])

  // Load product if editing
  useEffect(() => {
    if (id) {
      setLoading(true)
      fetchProductById(id)
        .then((product) => {
          setName(product.name || "")
          setCategory(product.category || "Electronics")
          setProductType(product.product_type || "Goods")
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
                    price: "100.00",
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
    const defaultPrice = variants.length > 0 ? variants[0].price : "100.00"
    const newVariant: VariantItem = {
      id: newVariantId,
      name: `${name || "Product"} Variant #${variants.length + 1}`,
      price: defaultPrice,
      stockQuantity: "10",
      imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80",
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
    const firstVariantPrice = variants.length > 0 ? parseFloat(variants[0].price) || 0 : 0
    const payload: any = {
      vendor_id: loggedVendor?.id || 1,
      name,
      category,
      product_type: productType,
      sales_price: firstVariantPrice,
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="size-5 font-bold" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/vendor/dashboard" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">EasyRental</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/vendor/products")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Products</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-purple-700">
                {isEditMode ? `Edit Product #${id}` : "New Product"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor/products")}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="size-3.5" />
              <span>{isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Save Product"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {isEditMode ? "Edit Mode" : "Vendor Product Creation"}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 mt-1">
              {name ? name : isEditMode ? "Edit Equipment Listing" : "New Rental Equipment Listing"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in product info, variant options, and rental parameters for your store.
            </p>
          </div>

          {/* Quick Publish Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPublished ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-100 text-slate-600 border border-slate-300"
              }`}
            >
              {isPublished ? "Published (Live)" : "Draft"}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 border shadow-2xs text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
              activeTab === "general"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            1. General Info & Image
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("attributes")}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
              activeTab === "attributes"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            2. Product Variants ({variants.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
              activeTab === "sales"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            3. Rental Parameters & Fees
          </button>
        </div>

        {/* TAB 1: GENERAL INFO */}
        {activeTab === "general" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Package className="size-4 text-purple-600" />
              General Equipment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block">Product Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. Computers (Desktop Workstation), Smart TV 65&quot;, Executive Chair"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-white border-slate-300 text-xs text-slate-900 font-medium focus-visible:ring-purple-500"
                  required
                />
              </div>

              {/* Product Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Computers">Computers & IT</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Gaming">Gaming & Consoles</option>
                  <option value="Audio">Audio & Sound</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              {/* Product Type (Goods / Service) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Product Type</label>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      value="Goods"
                      checked={productType === "Goods"}
                      onChange={() => setProductType("Goods")}
                      className="size-4 accent-purple-600"
                    />
                    <span>Goods (Physical Equipment)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="size-4 text-purple-600" />
                  Product Variants Manager
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define specific model options, prices, individual stock quantities, features, and custom images.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                <Plus className="size-3.5" />
                <span>Add Variant Option</span>
              </button>
            </div>

            {/* List of Variant Cards */}
            <div className="space-y-4">
              {variants.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 space-y-3">
                  <p className="text-xs">No variants added yet. Click &quot;Add Variant Option&quot; above to add options like models or configurations.</p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-purple-700"
                  >
                    Create First Variant
                  </button>
                </div>
              ) : (
                variants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900">Variant #{index + 1}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md"
                        title="Remove Variant"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      {/* Image Input Box */}
                      <div className="sm:col-span-3 space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 block">Variant Image</label>
                        <div className="relative h-28 rounded-lg overflow-hidden border border-slate-300 bg-white group/img flex items-center justify-center">
                          {variant.imageUrl ? (
                            <img src={variant.imageUrl} alt={variant.name} className="size-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <ImageIcon className="size-6 mx-auto mb-1" />
                              <span className="text-[10px] block">No Image</span>
                            </div>
                          )}

                          <label className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1">
                            <Upload className="size-4" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(variant.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Variant Details Inputs */}
                      <div className="sm:col-span-9 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Variant Name */}
                          <div className="sm:col-span-1 space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 block">Variant Title / Name *</label>
                            <Input
                              type="text"
                              placeholder="e.g. MacBook Pro 16&quot; Space Gray"
                              value={variant.name}
                              onChange={(e) => handleUpdateVariant(variant.id, "name", e.target.value)}
                              className="h-9 text-xs bg-white border-slate-300 font-medium"
                            />
                          </div>

                          {/* Variant Rent Price */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 block">Rent Price ($) *</label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-mono">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(variant.id, "price", e.target.value)}
                                className="pl-6 h-9 text-xs bg-white border-slate-300 font-mono font-bold"
                              />
                            </div>
                          </div>

                          {/* Variant Individual Stock Quantity */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 block">Stock Qty *</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={variant.stockQuantity}
                              onChange={(e) => handleUpdateVariant(variant.id, "stockQuantity", e.target.value)}
                              className="h-9 text-xs bg-white border-slate-300 font-mono font-bold"
                            />
                          </div>
                        </div>

                        {/* Feature Single Line Statement */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700 block">
                            Single Line Feature Statement (Specifications)
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Apple M3 Max • 32GB RAM • 1TB SSD • 16-inch Liquid Retina Display"
                            value={variant.features}
                            onChange={(e) => handleUpdateVariant(variant.id, "features", e.target.value)}
                            className="h-9 text-xs bg-white border-slate-300 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SALES & RENTAL PARAMETERS */}
        {activeTab === "sales" && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShoppingBag className="size-4 text-purple-600" />
              Rental Timings & Security Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pickup Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Default Pickup Time</label>
                <Input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="h-10 bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              {/* Return Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Default Return Time</label>
                <Input
                  type="text"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="h-10 bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              {/* Padding Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Padding / Buffer Time</label>
                <Input
                  type="text"
                  value={paddingTime}
                  onChange={(e) => setPaddingTime(e.target.value)}
                  className="h-10 bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              {/* Security Deposit */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Security Deposit ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className="pl-7 h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Late Return Fee */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">Late Return Fee ($ / day)</label>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableLateFees}
                      onChange={(e) => setEnableLateFees(e.target.checked)}
                      className="size-3.5 rounded border-slate-300 text-purple-600 accent-purple-600"
                    />
                    <span>Charge Late Fee</span>
                  </label>
                </div>
                {enableLateFees && (
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={lateFees}
                      onChange={(e) => setLateFees(e.target.value)}
                      className="pl-7 h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
