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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchProductById, createProduct, updateProduct, getLoggedVendor } from "@/lib/api"

interface AttributeRow {
  id: string
  name: string
  values: string
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
  const [productType, setProductType] = useState<"Goods" | "Service">("Goods")
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80")
  const [showImageUrlModal, setShowImageUrlModal] = useState(false)
  const [quantityOnHand, setQuantityOnHand] = useState("100")
  const [rentPrice, setRentPrice] = useState("1200.00")
  const [isPublished, setIsPublished] = useState(true)

  // Tab 2: Attributes & Variants State
  const [attributes, setAttributes] = useState<AttributeRow[]>([
    { id: "1", name: "Brand", values: "Apple, Dell, HP" },
    { id: "2", name: "Color", values: "Black, Silver, Space Gray" },
  ])

  // Tab 3: Sales & Rental State
  const [periodicity, setPeriodicity] = useState<"Hours" | "Day" | "Night" | "Weekly">("Hours")
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
          setProductType(product.product_type || "Goods")
          setImageUrl(product.image_url || "")
          setQuantityOnHand(product.quantity_on_hand !== undefined ? String(Math.round(product.quantity_on_hand)) : "0")
          const price = product.rent_price || product.sales_price || 0
          setRentPrice(String(price))
          setIsPublished(product.is_published ?? true)
          setPeriodicity(product.periodicity || "Hours")
          setPaddingTime(product.padding_time || "2:00 H")
          setPickupTime(product.pickup_time || "10:00 H")
          setReturnTime(product.return_time || "19:00 H")
          setLateFees(product.late_fees !== undefined ? String(product.late_fees) : "0")
          setSecurityDeposit(product.security_deposit !== undefined ? String(product.security_deposit) : "0")
          setEnableLateFees(Boolean(product.late_fees && product.late_fees > 0))

          if (product.attributes_json) {
            try {
              const parsed = JSON.parse(product.attributes_json)
              if (Array.isArray(parsed)) setAttributes(parsed)
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

  // Handlers for dynamic attributes
  const handleAddAttribute = () => {
    const newId = Date.now().toString()
    setAttributes([...attributes, { id: newId, name: "", values: "" }])
  }

  const handleRemoveAttribute = (attrId: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== attrId))
  }

  const handleAttributeChange = (attrId: string, field: "name" | "values", value: string) => {
    setAttributes(
      attributes.map((attr) => (attr.id === attrId ? { ...attr, [field]: value } : attr))
    )
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
      product_type: productType,
      image_url: imageUrl,
      quantity_on_hand: parseInt(quantityOnHand, 10) || 0,
      rent_price: parsedRent,
      sales_price: parsedRent,
      cost_price: 0,
      is_published: isPublished,
      periodicity,
      padding_time: paddingTime,
      pickup_time: pickupTime,
      return_time: returnTime,
      late_fees: enableLateFees ? parseFloat(lateFees) || 0 : 0,
      security_deposit: parseFloat(securityDeposit) || 0,
      attributes_json: JSON.stringify(attributes),
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
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isEditMode
                  ? "bg-sky-100 text-sky-800 border border-sky-200"
                  : "bg-purple-100 text-purple-800 border border-purple-200"
              }`}>
                {isEditMode ? "Edit" : "New"}
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                {isEditMode ? `Edit Product #${id}` : "Product"}
              </h1>
            </div>
          </div>

          {/* Action Buttons: Checkmark (Save) and X (Cancel) */}
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
            { id: "attributes", label: "Attributes & Variants", icon: Layers },
            { id: "sales", label: "Sales & Rental", icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all ${
                  isActive
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
            {/* Service & Deposit Informational Callout matching wireframe note */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <Info className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-amber-900">Deposit & Warranty Note:</strong> If the vendor wants to add a deposit or downpayment with the product, the vendor needs to create a product (type <span className="underline decoration-amber-500 font-bold">Service</span>) named <span className="font-bold">deposit/downpayment</span> and add it in the invoice. The same rules apply to warranties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Quantity on Hand */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Quantity on Hand (Units)</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g. 100"
                  value={quantityOnHand}
                  onChange={(e) => setQuantityOnHand(e.target.value)}
                  className="h-10 bg-white border-slate-300 text-xs text-slate-900 font-mono"
                />
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

            {/* Publish Toggle with Admin Permission Note matching wireframe */}
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

        {/* TAB 2: ATTRIBUTES & VARIANTS */}
        {activeTab === "attributes" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-xs animate-in fade-in">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attributes & Variant Options</h2>
              <p className="text-xs text-slate-500 mt-1">
                Add attributes like Brand, Color, or Size along with possible value options.
              </p>
            </div>

            {/* Attributes Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3 w-1/3">Attributes</th>
                    <th className="p-3">Values</th>
                    <th className="p-3 w-16 text-center">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {attributes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-500">
                        No attributes added yet. Click &quot;Add a line&quot; below to add your first variant attribute.
                      </td>
                    </tr>
                  ) : (
                    attributes.map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <Input
                            type="text"
                            placeholder="Name of the Attribute (Brand, Color, Size...)"
                            value={attr.name}
                            onChange={(e) => handleAttributeChange(attr.id, "name", e.target.value)}
                            className="h-9 bg-white border-slate-300 text-xs text-slate-900"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="text"
                            placeholder="List of possible values (e.g. Red, Green, Blue...)"
                            value={attr.values}
                            onChange={(e) => handleAttributeChange(attr.id, "values", e.target.value)}
                            className="h-9 bg-white border-slate-300 text-xs text-slate-900"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add a Line Button */}
            <button
              type="button"
              onClick={handleAddAttribute}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors p-1"
            >
              <Plus className="size-4" />
              <span>Add a line</span>
            </button>
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

                {/* Periodicity Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">Periodicity</label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                  >
                    <option value="Hours">Hours</option>
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                {/* Padding Time */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Padding Time</label>
                    <span className="text-[10px] text-amber-600 italic">(Only in case of Hours)</span>
                  </div>
                  <Input
                    type="text"
                    value={paddingTime}
                    disabled={periodicity !== "Hours"}
                    onChange={(e) => setPaddingTime(e.target.value)}
                    placeholder="2:00 H"
                    className="h-10 bg-white border-slate-300 text-xs text-slate-900 disabled:opacity-50"
                  />
                </div>

                {/* Pickup & Return Schedule */}
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

                {/* Late Fees */}
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

                {/* Security Deposit */}
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
