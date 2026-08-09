import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, CreditCard, Trash2, PlusCircle } from "lucide-react"
import { ProfileSidebar } from "@/components/profile/ProfileSidebar"
import { InfoSection } from "@/components/profile/InfoSection"
import { AddressCard } from "@/components/profile/AddressCard"
import { ActivitySection } from "@/components/profile/ActivitySection"
import { ItemCard } from "@/components/profile/ItemCard"
import { ProfileItemsModal } from "@/components/profile/ProfileItemsModal"
import {
  fetchCustomerProfile,
  mockCustomerProfile,
  type CustomerProfileData,
  type PaymentMethod,
} from "@/lib/profileFetcher"
import {
  saveNewCard,
  deleteSavedCard,
} from "@/lib/cartCheckoutApi"

const RENTED_PAGE_SIZE = 4
const HISTORY_PAGE_SIZE = 2
const INVOICE_PREVIEW_SIZE = 2

type ProfileModalType = "rented" | "history" | "invoices" | null

function PaymentMethodsList({
  methods,
  onRefresh,
}: {
  methods: PaymentMethod[]
  onRefresh: () => void
}) {
  const [addingCard, setAddingCard] = useState<boolean>(false)

  // Add fields
  const [newName, setNewName] = useState("")
  const [newNumber, setNewNumber] = useState("")
  const [newExpiry, setNewExpiry] = useState("")
  const [newBrand, setNewBrand] = useState("Visa")

  const handleDelete = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return
    try {
      await deleteSavedCard(cardId)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddCard = async () => {
    if (!newNumber) {
      alert("Please enter a card number")
      return
    }
    try {
      await saveNewCard({
        cardholderName: newName || "Cardholder",
        cardNumber: newNumber,
        expiry: newExpiry || "12/28",
        brand: newBrand as "Visa" | "Mastercard" | "Amex",
        isDefault: false,
      })
      setNewName("")
      setNewNumber("")
      setNewExpiry("")
      setAddingCard(false)
      onRefresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing List */}
      {methods.length > 0 && (
        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
          {methods.map((method) => {
            return (
              <div key={method.id} className="p-3 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <CreditCard className="size-4 shrink-0 text-slate-400" />
                    <span className="font-semibold text-slate-800 truncate">
                      {method.type} – {method.maskedNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add New Section */}
      {addingCard ? (
        <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Add Card Details</p>
          <input
            type="text"
            placeholder="Card Number"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cardholder Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
            />
            <input
              type="text"
              placeholder="MM/YY"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-center"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <select
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs"
            >
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="Amex">Amex</option>
            </select>
            <div className="flex gap-1.5">
              <button
                onClick={handleAddCard}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              >
                Save Card
              </button>
              <button
                onClick={() => setAddingCard(false)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCard(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-all"
        >
          <PlusCircle className="size-4 text-slate-400" />
          <span>Add Credit Card</span>
        </button>
      )}
    </div>
  )
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  )
}

export function Profile() {
  const [profile, setProfile] = useState<CustomerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rentedVisible, setRentedVisible] = useState(RENTED_PAGE_SIZE)
  const [historyVisible, setHistoryVisible] = useState(HISTORY_PAGE_SIZE)
  const [loadingMoreRented, setLoadingMoreRented] = useState(false)
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false)
  const [activeModal, setActiveModal] = useState<ProfileModalType>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchCustomerProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("Unable to load profile", err)
        setError("Could not load profile. Showing sample data.")
        setProfile(mockCustomerProfile)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLoadMoreRented = () => {
    if (!profile) return
    setLoadingMoreRented(true)
    setTimeout(() => {
      setRentedVisible((prev) => Math.min(prev + RENTED_PAGE_SIZE, profile.currentlyRented.length))
      setLoadingMoreRented(false)
    }, 300)
  }

  const handleLoadMoreHistory = () => {
    if (!profile) return
    setLoadingMoreHistory(true)
    setTimeout(() => {
      setHistoryVisible((prev) => Math.min(prev + HISTORY_PAGE_SIZE, profile.rentingHistory.length))
      setLoadingMoreHistory(false)
    }, 300)
  }

  const handleEditDetails = () => {
    // Backend engineer: navigate to edit form or open modal
    alert("Edit profile — connect to PUT /api/v1/customer/profile")
  }

  const handleRefreshProfile = () => {
    fetchCustomerProfile()
      .then(setProfile)
      .catch((err) => {
        console.error("Unable to reload profile", err)
      })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          Loading profile...
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <p className="text-sm font-semibold">{error ?? "Profile unavailable."}</p>
        <Link to="/customer/catalog" className="text-xs font-bold text-blue-600 hover:underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  const visibleRented = profile.currentlyRented.slice(0, rentedVisible)
  const visibleHistory = profile.rentingHistory.slice(0, historyVisible)
  const visibleInvoices = profile.invoices.slice(0, INVOICE_PREVIEW_SIZE)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Link
            to="/customer/catalog"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
          <h1 className="text-lg font-bold text-slate-900">My Profile</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left column — personal info */}
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <ProfileSidebar user={profile.user} />
            </div>

            <InfoSection title="User Details" onEdit={handleEditDetails}>
              <div className="space-y-4">
                <AddressCard addresses={profile.addresses} />
                <div className="space-y-2.5 border-t border-slate-100 pt-4">
                  <ContactRow label="Email ID" value={profile.user.email} />
                  <ContactRow label="Phone Number" value={profile.user.phone} />
                </div>
              </div>
            </InfoSection>

            <InfoSection title="Card and Payment">
              <PaymentMethodsList methods={profile.paymentMethods} onRefresh={handleRefreshProfile} />
            </InfoSection>
          </aside>

          {/* Right column — activity & history */}
          <div className="space-y-5">
            <ActivitySection
              title="Currently Rented Items"
              gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
              showLoadMore={rentedVisible < profile.currentlyRented.length}
              onLoadMore={handleLoadMoreRented}
              loadingMore={loadingMoreRented}
              showViewAll={profile.currentlyRented.length > 0}
              onViewAll={() => setActiveModal("rented")}
            >
              {visibleRented.length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-slate-500">
                  No active rentals.
                </p>
              ) : (
                visibleRented.map((item) => (
                  <ItemCard key={item.id} variant="rental" item={item} />
                ))
              )}
            </ActivitySection>

            <ActivitySection
              title="Renting History"
              gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
              showLoadMore={historyVisible < profile.rentingHistory.length}
              onLoadMore={handleLoadMoreHistory}
              loadingMore={loadingMoreHistory}
              showViewAll={profile.rentingHistory.length > 0}
              onViewAll={() => setActiveModal("history")}
            >
              {visibleHistory.length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-slate-500">
                  No rental history yet.
                </p>
              ) : (
                visibleHistory.map((item) => (
                  <ItemCard key={item.id} variant="rental" item={item} />
                ))
              )}
            </ActivitySection>

            <ActivitySection
              title="Invoices Received"
              gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
              showViewAll={profile.invoices.length > 0}
              onViewAll={() => setActiveModal("invoices")}
            >
              {visibleInvoices.length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-slate-500">
                  No invoices yet.
                </p>
              ) : (
                visibleInvoices.map((invoice) => (
                  <ItemCard key={invoice.id} variant="invoice" item={invoice} />
                ))
              )}
            </ActivitySection>
          </div>
        </div>
      </div>

      {activeModal === "rented" && (
        <ProfileItemsModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Currently Rented Items"
          variant="rental"
          items={profile.currentlyRented}
        />
      )}

      {activeModal === "history" && (
        <ProfileItemsModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Renting History"
          variant="rental"
          items={profile.rentingHistory}
        />
      )}

      {activeModal === "invoices" && (
        <ProfileItemsModal
          isOpen
          onClose={() => setActiveModal(null)}
          title="Invoices Received"
          variant="invoice"
          items={profile.invoices}
        />
      )}
    </div>
  )
}

export default Profile
