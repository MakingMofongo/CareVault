"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Eye, EyeOff, Zap } from "lucide-react"
import api from "@/lib/api"

export default function NewPatient() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    date_of_birth: "",
    phone_number: ""
  })

  // Demo prefill functions
  const prefillJohnDoe = () => {
    setFormData({
      full_name: "John Doe",
      email: "john.doe@example.com",
      password: "patient123",
      date_of_birth: "1985-03-15",
      phone_number: "(555) 123-4567"
    })
    toast.success("John Doe data filled!")
  }

  const prefillJaneSmith = () => {
    setFormData({
      full_name: "Jane Smith",
      email: "jane.smith@example.com", 
      password: "patient123",
      date_of_birth: "1992-08-22",
      phone_number: "(555) 987-6543"
    })
    toast.success("Jane Smith data filled!")
  }

  const prefillRandomPatient = () => {
    const firstNames = ["Alex", "Morgan", "Taylor", "Jordan", "Casey", "Riley"]
    const lastNames = ["Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson"]
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    setFormData({
      full_name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      password: "patient123",
      date_of_birth: "1990-01-01", 
      phone_number: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    })
    toast.success("Random patient data filled!")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Creating patient with data:", {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: "patient",
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number
      })
      
      const response = await api.post("/users", {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: "patient",
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number
      })

      console.log("Patient creation response:", response.data)
      toast.success("Patient created successfully!")
      router.push("/doctor/dashboard")
    } catch (error: any) {
      console.error("Patient creation error:", error)
      let errorMessage = "Failed to create patient"
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(", ")
        }
      }
      
      console.error("Error message:", errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Header with demo buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create New Patient</h1>
          <p className="text-muted-foreground">Add a new patient to the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prefillJohnDoe}>
            <Zap className="mr-2 h-4 w-4" />
            John Doe
          </Button>
          <Button variant="outline" size="sm" onClick={prefillJaneSmith}>
            <Zap className="mr-2 h-4 w-4" />
            Jane Smith
          </Button>
          <Button variant="outline" size="sm" onClick={prefillRandomPatient}>
            <Zap className="mr-2 h-4 w-4" />
            Random
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Enter the new patient's details and create a temporary password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Patient's full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a temporary password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  The patient can change this password after their first login
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    placeholder="(555) 123-4567"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Patient..." : "Create Patient"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/doctor/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}