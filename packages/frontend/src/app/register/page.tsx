"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, User, Stethoscope, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import api from "@/lib/api"

type UserRole = "doctor" | "patient"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "patient" as UserRole,
    license_number: "",
    specialization: "",
    date_of_birth: "",
    phone_number: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        ...(formData.role === "doctor" && {
          license_number: formData.license_number,
          specialization: formData.specialization
        }),
        ...(formData.role === "patient" && {
          date_of_birth: formData.date_of_birth,
          phone_number: formData.phone_number
        })
      }

      await api.post("/users", registrationData)
      
      toast.success("Registration successful! Please login to continue.")
      router.push("/login")
    } catch (error: any) {
      let errorMessage = "Registration failed"
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(", ")
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center mb-8">
              <Shield className="h-12 w-12 text-primary" />
              <span className="ml-3 text-3xl font-bold gradient-text">CareVault</span>
            </Link>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground mt-2">
              Join CareVault to manage your healthcare digitally
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign up</CardTitle>
              <CardDescription>
                Choose your role and fill in your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role selector */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={formData.role === "doctor" ? "default" : "outline"}
                      className="relative h-20 flex-col space-y-2"
                      onClick={() => handleInputChange("role", "doctor")}
                    >
                      <Stethoscope className="h-6 w-6" />
                      <span>Doctor</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === "patient" ? "default" : "outline"}
                      className="relative h-20 flex-col space-y-2"
                      onClick={() => handleInputChange("role", "patient")}
                    >
                      <User className="h-6 w-6" />
                      <span>Patient</span>
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Role-specific fields */}
                {formData.role === "doctor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        placeholder="Enter your medical license number"
                        value={formData.license_number}
                        onChange={(e) => handleInputChange("license_number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        placeholder="e.g., Cardiology, General Practice"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {formData.role === "patient" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        placeholder="Enter your phone number"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Image/gradient */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary via-secondary to-primary">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Join the Future of Healthcare
          </h1>
          <p className="text-xl text-center max-w-md opacity-90">
            Whether you're a healthcare provider or patient, CareVault provides
            secure, AI-powered tools for better health outcomes.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">Secure & Private</div>
              <div className="opacity-80">Your health data is encrypted and protected</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">AI-Powered</div>
              <div className="opacity-80">Smart drug interaction checking and insights</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="font-semibold mb-1">Easy Sharing</div>
              <div className="opacity-80">Share prescriptions securely with QR codes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}