const getApiBaseUrl = () => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000`
  }
  return "http://localhost:8000"
}

export const API_BASE_URL = getApiBaseUrl()

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

// ==========================================
// PRODUCT API FUNCTIONS & VARIANTS SCHEMA
// ==========================================

export interface ProductVariantItem {
  id: string
  name: string
  price: string
  stockQuantity: string
  imageUrl: string
  features: string
}

export interface ProductAttributesJson {
  variants?: ProductVariantItem[]
}

export interface ApiProduct {
  id: number
  vendor_id: number
  name: string
  category?: string
  product_type: "Goods" | "Service"
  sales_price?: number
  cost_price?: number
  is_published: boolean
  padding_time?: string
  pickup_time?: string
  return_time?: string
  late_fees?: number
  security_deposit?: number
  attributes_json?: string
  created_at: string
  vendor_name?: string
  vendor_brand?: string
}

export function getLoggedVendor(): VendorUser | null {
  try {
    const data = localStorage.getItem("vendor_user")
    if (data) {
      return JSON.parse(data)
    }
  } catch (err) {
    console.warn("Failed to parse vendor_user from localStorage:", err)
  }
  return null
}

export function getLoggedCustomer(): CustomerUser | null {
  try {
    const data = localStorage.getItem("user") || localStorage.getItem("customer_user")
    if (data) {
      return JSON.parse(data)
    }
  } catch (err) {
    console.warn("Failed to parse user from localStorage:", err)
  }
  return null
}

export async function fetchProducts(vendorId?: number): Promise<ApiProduct[]> {
  const url = vendorId
    ? `${API_BASE_URL}/api/v1/products?vendor_id=${vendorId}`
    : `${API_BASE_URL}/api/v1/products`
  const res = await fetch(url)
  return handleResponse<ApiProduct[]>(res)
}

export async function fetchProductById(id: number | string): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products/${id}`)
  return handleResponse<ApiProduct>(res)
}

export async function createProduct(data: Partial<ApiProduct>): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<ApiProduct>(res)
}

export async function updateProduct(id: number | string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return handleResponse<ApiProduct>(res)
}

export async function deleteProduct(id: number | string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
    method: "DELETE",
  })
  return handleResponse<{ status: string; message: string }>(res)
}
