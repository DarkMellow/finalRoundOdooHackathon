export const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_API_URL ||
  "http://10.119.37.110:8000"

export interface ApiError {
  detail: string
}

export interface CustomerUser {
  id: number
  full_name: string
  email: string
  phone_number?: string
  role: "customer"
  is_active: boolean
  created_at: string
}

export interface VendorUser {
  id: number
  full_name: string
  email: string
  role: "vendor"
  is_active: boolean
  created_at: string
  vendor_profile?: {
    company_name?: string
    category: string
    is_verified: boolean
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

export async function vendorSignUp(data: {
  full_name: string
  email: string
  password: string
  company_name?: string
}): Promise<VendorUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/vendor/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<VendorUser>(res)
}

export async function vendorSignIn(data: {
  email: string
  password: string
}): Promise<VendorUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/vendor/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<VendorUser>(res)
}
