import { User } from "lucide-react"
import type { CustomerProfileUser } from "@/lib/profileFetcher"

interface ProfileSidebarProps {
  user: CustomerProfileUser
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="size-36 rounded-full border-2 border-slate-200 object-cover shadow-sm"
          />
        ) : (
          <div className="flex size-36 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
            <User className="size-16 stroke-[1.5]" />
          </div>
        )}
      </div>
      <h2 className="text-lg font-bold text-slate-900">{user.username}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{user.fullName}</p>
    </div>
  )
}
