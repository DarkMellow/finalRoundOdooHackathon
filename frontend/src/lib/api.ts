const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export interface ApiError {
  detail: string
}

export interface CustomerUser {
  id: number
  full_name: str
  email: string
  phone_number?: string
  role: "customer"
  is_active: boolean
  created_at: string
}

export interface AdminUser {
  id: number
  full_name: string
  email: string
  role: "admin"
  is_active: boolean
  created_at: string
  admin_profile?: {
    department: string
    is_superadmin: boolean
    access_level: number
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An unexpected error occurred."
    try {
      const errorData: ApiError = await response.json()
      if (errorData.detail) {
        errorMessage = errorData.detail
      }
    } catch {
      errorMessage = `Server error: ${response.statusText} (${response.status})`
    }
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function customerSignUp(data: {
  full_name: string
  email: string
  password: string
  phone_number?: string
}): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/customer/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<CustomerUser>(res)
}

export async function customerSignIn(data: {
  email: string
  password: string
}): Promise<CustomerUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/customer/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<CustomerUser>(res)
}

export async function adminSignUp(data: {
  full_name: string
  email: string
  password: string
  department?: string
}): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<AdminUser>(res)
}

export async function adminSignIn(data: {
  email: string
  password: string
}): Promise<AdminUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/admin/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<AdminUser>(res)
}
