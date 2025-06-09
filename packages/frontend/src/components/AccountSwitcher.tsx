"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  User, 
  RefreshCw,
  LogOut,
  Settings,
  ChevronDown
} from "lucide-react"
import api from "@/lib/api"

interface DemoUser {
  id: number
  email: string
  full_name: string
  role: "doctor" | "patient"
  password?: string
}

export default function AccountSwitcher() {
  const { user, logout, login } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(false)
  const [switchingTo, setSwitchingTo] = useState<string | null>(null)

  useEffect(() => {
    fetchDemoUsers()
  }, [])

  const fetchDemoUsers = async () => {
    try {
      // Always use the public demo endpoint (no auth required, returns ALL users)
      const response = await api.get("/users/demo")
      const users = response.data.filter((u: any) => 
        u.role === "doctor" || u.role === "patient"
      )
      setDemoUsers(users)
      console.log(`Loaded ${users.length} demo users:`, users.map(u => u.full_name))
    } catch (error) {
      console.error("Failed to fetch demo users:", error)
      // Clear users list on error
      setDemoUsers([])
    }
  }

  const switchAccount = async (targetUser: DemoUser) => {
    if (!targetUser.email) return
    
    setSwitchingTo(targetUser.email)
    setLoading(true)
    
    try {
      console.log(`Attempting to switch to account: ${targetUser.email}`)
      
      // Use the AuthContext login function which handles everything properly
      // It will replace the current user and handle redirect
      await login(targetUser.email, "demo", targetUser.role)
      
      toast.success(`Switched to ${targetUser.full_name} (${targetUser.role})`)
      
    } catch (error: any) {
      console.error("Account switch failed:", error)
      console.error("Error details:", error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message || "Failed to switch account"
      toast.error(`Login failed: ${errorMessage}`)
    } finally {
      setLoading(false)
      setSwitchingTo(null)
      setIsOpen(false)
    }
  }

  const createDemoData = async () => {
    setLoading(true)
    try {
      const response = await api.post("/users/demo-setup")
      if (response.data.error) {
        toast.error(response.data.error)
      } else {
        toast.success("Demo data created successfully!")
        fetchDemoUsers()
      }
    } catch (error) {
      toast.error("Failed to create demo data")
    } finally {
      setLoading(false)
    }
  }

  const doctors = demoUsers.filter(u => u.role === "doctor")
  const patients = demoUsers.filter(u => u.role === "patient")

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 shadow-lg"
        disabled={loading}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Users className="h-4 w-4 mr-2" />
        )}
        Demo Accounts
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-80 shadow-xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Demo Account Switcher
            </CardTitle>
            <CardDescription className="text-xs">
              Switch between accounts for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current User */}
            {user && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  {user.role === "doctor" ? (
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                  <div>
                    <div className="font-medium text-blue-900">Current: {user.full_name}</div>
                    <div className="text-xs text-blue-700">{user.email} ({user.role})</div>
                  </div>
                </div>
              </div>
            )}

            {/* Doctors */}
            {doctors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Doctors ({doctors.length})
                </h4>
                <div className="space-y-1">
                  {doctors.map((doctor) => (
                    <Button
                      key={doctor.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => switchAccount(doctor)}
                      disabled={loading || user?.id === doctor.id}
                      className={`w-full justify-start text-left h-auto p-2 ${
                        user?.id === doctor.id ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {switchingTo === doctor.email ? (
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                        ) : user?.id === doctor.id ? (
                          <UserCheck className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Stethoscope className="h-3 w-3 text-green-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{doctor.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{doctor.email}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Patients */}
            {patients.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Patients ({patients.length})
                </h4>
                <div className="space-y-1">
                  {patients.map((patient) => (
                    <Button
                      key={patient.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => switchAccount(patient)}
                      disabled={loading || user?.id === patient.id}
                      className={`w-full justify-start text-left h-auto p-2 ${
                        user?.id === patient.id ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {switchingTo === patient.email ? (
                          <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
                        ) : user?.id === patient.id ? (
                          <UserCheck className="h-3 w-3 text-blue-600" />
                        ) : (
                          <User className="h-3 w-3 text-purple-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{patient.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{patient.email}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t space-y-2">
              {demoUsers.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createDemoData}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Create Demo Data
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDemoUsers}
                  disabled={loading}
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border">
              <strong>Demo Instructions:</strong><br />
              • Click any account to switch instantly<br />
              • All passwords are bypassed for demo purposes<br />
              • Create demo data if no accounts are shown<br />
              • Perfect for testing and demonstrations
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 