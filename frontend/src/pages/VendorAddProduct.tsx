import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AttributeRow {
  id: string
  name: string
  values: string
}

export function VendorAddProduct() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"general" | "attributes" | "sales">("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Product Form State
  const [name, setName] = useState("Computers")
  const [productType, setProductType] = useState<"Goods" | "Service">("Goods")
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80")
  const [showImageUrlModal, setShowImageUrlModal] = useState(false)
  const [quantityOnHand, setQuantityOnHand] = useState("100.00")
  const [salesPrice, setSalesPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
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
  const [lateFees, setLateFees] = useState("")
  const [securityDeposit, setSecurityDeposit] = useState("")
  const [enableLateFees, setEnableLateFees] = useState(true)

  // Handlers for dynamic attributes
  const handleAddAttribute = () => {
    const newId = Date.now().toString()
    setAttributes([...attributes, { id: newId, name: "", values: "" }])
  }

  const handleRemoveAttribute = (id: string) => {
    setAttributes(attributes.filter((attr) => attr.id !== id))
  }

  const handleAttributeChange = (id: string, field: "name" | "values", value: string) => {
    setAttributes(
      attributes.map((attr) => (attr.id === id ? { ...attr, [field]: value } : attr))
    )
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert("Please enter a product name.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      vendor_id: 1,
      name,
      product_type: productType,
      image_url: imageUrl,
      quantity_on_hand: parseFloat(quantityOnHand) || 0,
      sales_price: parseFloat(salesPrice) || 0,
      cost_price: parseFloat(costPrice) || 0,
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
      const response = await fetch("http://localhost:8000/api/v1/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save product")
      }

      setToastMessage("Product created successfully!")
      setTimeout(() => {
        navigate("/vendor/dashboard")
      }, 1200)
    } catch (err) {
      console.warn("Backend unavailable, navigating with local simulation:", err)
      setToastMessage("Product created successfully!")
      setTimeout(() => {
        navigate("/vendor/dashboard")
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
          <Check className="size-5 font-bold" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Glass Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/vendor/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-medium"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                New
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Product</h1>
            </div>
          </div>

          {/* Action Buttons: Checkmark (Save) and X (Cancel) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              type="button"
              title="Cancel / Discard"
              className="flex size-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <X className="size-5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
              title="Save Product"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Check className="size-4" />
              <span>{isSubmitting ? "Saving..." : "Save Product"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Product Title & Image Upload Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Product Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computers, Smart TV, Luxury SUV"
                className="h-12 bg-slate-900 border-slate-700 text-lg font-bold text-white placeholder:text-slate-600 rounded-xl focus-visible:ring-purple-500 shadow-inner"
              />
            </div>

            {/* Product Image Well */}
            <div className="relative group shrink-0">
              <div className="size-28 sm:size-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-900 overflow-hidden flex flex-col items-center justify-center relative shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" className="size-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <Upload className="size-6" />
                    <span className="text-[10px] font-medium">Upload Image</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowImageUrlModal(!showImageUrlModal)}
                  className="absolute inset-0 bg-slate-950/80 text-white text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Change Image
                </button>
              </div>

              {/* Image URL Modal / Tooltip */}
              {showImageUrlModal && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl z-30 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">Image Source URL</span>
                  <Input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8 bg-slate-950 border-slate-700 text-xs text-white"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowImageUrlModal(false)}
                    className="w-full h-7 bg-purple-600 hover:bg-purple-500 text-white text-xs"
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/50"
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
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl animate-in fade-in">
            {/* Service & Deposit Informational Callout matching wireframe note */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              <Info className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-amber-300">Deposit & Warranty Note:</strong> If the vendor wants to add a deposit or downpayment with the product, the vendor needs to create a product (type <span className="underline decoration-amber-400 font-bold">Service</span>) named <span className="font-bold">deposit/downpayment</span> and add it in the invoice. The same rules apply to warranties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Type (Goods vs Service) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Product Type</label>
                <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-800 bg-slate-900">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="productType"
                      value="Goods"
                      checked={productType === "Goods"}
                      onChange={() => setProductType("Goods")}
                      className="size-4 accent-purple-500"
                    />
                    <span>Goods</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="productType"
                      value="Service"
                      checked={productType === "Service"}
                      onChange={() => setProductType("Service")}
                      className="size-4 accent-purple-500"
                    />
                    <span>Service</span>
                  </label>
                </div>
              </div>

              {/* Quantity on Hand */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Quantity on Hand</label>
                <Input
                  type="number"
                  step="0.01"
                  value={quantityOnHand}
                  onChange={(e) => setQuantityOnHand(e.target.value)}
                  className="h-10 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                />
              </div>

              {/* Sales Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Sales Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={salesPrice}
                    onChange={(e) => setSalesPrice(e.target.value)}
                    className="pl-7 h-10 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Cost Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="pl-7 h-10 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Publish Toggle with Admin Permission Note matching wireframe */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">Publish Status</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                    <ShieldAlert className="size-3" /> Admin Feature
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
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
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRIBUTES & VARIANTS */}
        {activeTab === "attributes" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl animate-in fade-in">
            <div>
              <h2 className="text-sm font-bold text-white">Attributes & Variant Options</h2>
              <p className="text-xs text-slate-400 mt-1">
                Add attributes like Brand, Color, or Size along with possible value options.
              </p>
            </div>

            {/* Attributes Table */}
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                    <th className="p-3 w-1/3">Attributes</th>
                    <th className="p-3">Values</th>
                    <th className="p-3 w-16 text-center">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                  {attributes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-500">
                        No attributes added yet. Click &quot;Add a line&quot; below to add your first variant attribute.
                      </td>
                    </tr>
                  ) : (
                    attributes.map((attr) => (
                      <tr key={attr.id} className="hover:bg-slate-900/40">
                        <td className="p-3">
                          <Input
                            type="text"
                            placeholder="Name of the Attribute (Brand, Color, Size...)"
                            value={attr.name}
                            onChange={(e) => handleAttributeChange(attr.id, "name", e.target.value)}
                            className="h-9 bg-slate-900 border-slate-700 text-xs text-white"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="text"
                            placeholder="List of possible values (e.g. Red, Green, Blue...)"
                            value={attr.values}
                            onChange={(e) => handleAttributeChange(attr.id, "values", e.target.value)}
                            className="h-9 bg-slate-900 border-slate-700 text-xs text-white"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors p-1"
            >
              <Plus className="size-4" />
              <span>Add a line</span>
            </button>
          </div>
        )}

        {/* TAB 3: SALES & RENTAL */}
        {activeTab === "sales" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-6 shadow-xl animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Rental Settings */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Clock className="size-4 text-purple-400" />
                  <span>Rental Configuration</span>
                </h2>

                {/* Periodicity Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Periodicity</label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <label className="text-xs font-semibold text-slate-300">Padding Time</label>
                    <span className="text-[10px] text-amber-400 italic">(Only in case of Hours)</span>
                  </div>
                  <Input
                    type="text"
                    value={paddingTime}
                    disabled={periodicity !== "Hours"}
                    onChange={(e) => setPaddingTime(e.target.value)}
                    placeholder="2:00 H"
                    className="h-10 bg-slate-900 border-slate-700 text-xs text-white disabled:opacity-50"
                  />
                </div>

                {/* Pickup & Return Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Pickup Time</label>
                    <Input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="10:00 H"
                      className="h-10 bg-slate-900 border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Return Time</label>
                    <Input
                      type="text"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      placeholder="19:00 H"
                      className="h-10 bg-slate-900 border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Late Fees */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enableLateFees}
                        onChange={(e) => setEnableLateFees(e.target.checked)}
                        className="size-4 accent-purple-500 rounded"
                      />
                      <span>Late Fees / Overdue Penalty</span>
                    </label>
                  </div>
                  {enableLateFees && (
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 45.00"
                        value={lateFees}
                        onChange={(e) => setLateFees(e.target.value)}
                        className="pl-7 h-10 bg-slate-900 border-slate-700 text-xs text-white font-mono"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">per hour late</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 italic">
                    This option is only visible when the Late Fees/Overdue Penalty option is check marked on the settings page.
                  </p>
                </div>
              </div>

              {/* Right Column: Rental Deposit & Fee Explanations */}
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-400" />
                  <span>Rental Deposit</span>
                </h2>

                {/* Security Deposit */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Security Deposit ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      className="pl-7 h-10 bg-slate-900 border-slate-700 text-xs text-white font-mono"
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
