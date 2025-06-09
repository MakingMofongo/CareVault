"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

interface User {
  id: number
  email: string
  full_name: string
  role: "doctor" | "patient"
  is_active: boolean
  created_at: string
  license_number?: string
  specialization?: string
  date_of_birth?: string
  phone_number?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      
      console.log("Auth check - token:", !!token, "userData:", !!userData)
      
      if (token && userData) {
        // Try to use stored user data first
        const storedUser = JSON.parse(userData)
        console.log("Loading user from localStorage:", storedUser)
        setUser(storedUser)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      } else if (token) {
        // Fallback to API call if no stored user data
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const response = await api.get("/auth/me")
        setUser(response.data)
        localStorage.setItem("user", JSON.stringify(response.data))
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      delete api.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, role: string) => {
    console.log(`Auth context login attempt: ${email} with role ${role}`)
    
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const response = await api.post("/auth/token", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    console.log("Auth login response:", response.data)
    const { access_token, user } = response.data

    localStorage.setItem("token", access_token)
    localStorage.setItem("user", JSON.stringify(user))
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

    // Use user data directly from login response (no need for /auth/me call)
    console.log("User data from login:", user)
    
    setUser(user)

    // Redirect based on actual user role, not requested role
    console.log(`Redirecting user with role: ${user.role}`)
    
    // Use window.location.href for more reliable redirect
    setTimeout(() => {
      if (user.role === "doctor") {
        console.log("Redirecting to doctor dashboard...")
        window.location.href = "/doctor/dashboard"
      } else if (user.role === "patient") {
        console.log("Redirecting to patient dashboard...")
        window.location.href = "/patient/dashboard"
      } else {
        console.error(`Unknown user role: ${user.role}`)
        throw new Error(`Unknown user role: ${user.role}`)
      }
    }, 100) // Small delay to ensure user state is set
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}