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
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        const response = await api.get("/auth/me")
        setUser(response.data)
      }
    } catch (error) {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, role: string) => {
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    const response = await api.post("/auth/token", formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const { access_token } = response.data

    localStorage.setItem("token", access_token)
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

    const userResponse = await api.get("/auth/me")
    const userData = userResponse.data
    
    if (userData.role !== role) {
      throw new Error(`Invalid role. Expected ${role}, got ${userData.role}`)
    }
    
    setUser(userData)

    // Redirect based on role
    if (userData.role === "doctor") {
      router.push("/doctor/dashboard")
    } else {
      router.push("/patient/dashboard")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
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