import { getAddressDisplay, type UserAddress } from "@/lib/profileFetcher"

interface AddressCardProps {
  addresses: UserAddress[]
}

export function AddressCard({ addresses }: AddressCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Home Address</p>
      {addresses.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium">No saved addresses</p>
      ) : (
        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
            >
              <span className="font-medium text-slate-800">{getAddressDisplay(address)}</span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {address.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
