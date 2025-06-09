"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Calendar, Clock, User, Plus, AlertCircle, Zap } from "lucide-react"
import api from "@/lib/api"

interface Patient {
  id: number
  email: string
  full_name: string
  phone_number?: string
}

// Helper function to extract error message from various error formats
const getErrorMessage = (error: any): string => {
  if (!error.response) {
    return "Network error occurred"
  }
  
  const data = error.response.data
  
  // Handle string error messages
  if (typeof data === "string") {
    return data
  }
  
  // Handle detail field (common in FastAPI)
  if (data?.detail) {
    // If detail is a string, return it
    if (typeof data.detail === "string") {
      return data.detail
    }
    
    // If detail is an array of validation errors
    if (Array.isArray(data.detail)) {
      return data.detail.map((err: any) => err.msg || err.message || "Validation error").join(", ")
    }
    
    // If detail is an object
    if (typeof data.detail === "object") {
      return JSON.stringify(data.detail)
    }
  }
  
  // Handle validation errors directly in data
  if (Array.isArray(data)) {
    return data.map((err: any) => err.msg || err.message || "Validation error").join(", ")
  }
  
  // Handle message field
  if (data?.message) {
    return data.message
  }
  
  // Handle error field
  if (data?.error) {
    return data.error
  }
  
  // Fallback
  return `Error ${error.response.status}: ${error.response.statusText || "Something went wrong"}`
}

export default function NewAppointment() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [showCreatePatient, setShowCreatePatient] = useState(false)
  const [creatingPatient, setCreatingPatient] = useState(false)
  const [formData, setFormData] = useState({
    selectedPatientId: "",
    selectedPatientEmail: "",
    selectedPatientName: "",
    date: "",
    time: "",
    reason: ""
  })
  const [patientFormData, setPatientFormData] = useState({
    full_name: "",
    email: "",
    date_of_birth: "",
    phone_number: "",
    password: ""
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await api.get("/users")
      const patientsOnly = response.data.filter((u: any) => u.role === "patient")
      setPatients(patientsOnly)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setLoadingPatients(false)
    }
  }

  const createPatient = async () => {
    setCreatingPatient(true)
    try {
      await api.post("/users", {
        email: patientFormData.email,
        password: patientFormData.password,
        full_name: patientFormData.full_name,
        role: "patient",
        date_of_birth: patientFormData.date_of_birth,
        phone_number: patientFormData.phone_number
      })

      toast.success("Patient created successfully!")
      setShowCreatePatient(false)
      
      // Set the newly created patient's info in the form
      setFormData(prev => ({
        ...prev,
        selectedPatientEmail: patientFormData.email,
        selectedPatientName: patientFormData.full_name
      }))
      
      // Now try creating the appointment again
      await createAppointment()
    } catch (error: any) {
      console.error("Create patient error:", error)
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setCreatingPatient(false)
    }
  }

  const createAppointment = async () => {
    try {
      const appointmentDateTime = `${formData.date}T${formData.time}:00`
      const response = await api.post("/appointments", {
        patient_name: formData.selectedPatientName,
        patient_email: formData.selectedPatientEmail,
        appointment_date: appointmentDateTime,
        reason: formData.reason,
        status: "scheduled"
      })

      toast.success("Appointment created successfully!")
      router.push("/doctor/dashboard")
    } catch (error: any) {
      throw error
    }
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id.toString() === patientId)
    if (patient) {
      setFormData(prev => ({
        ...prev,
        selectedPatientId: patientId,
        selectedPatientEmail: patient.email,
        selectedPatientName: patient.full_name
      }))
    }
  }

  // Demo prefill functions
  const prefillDemo = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    
    setFormData(prev => ({
      ...prev,
      date: dateStr,
      time: "10:30",
      reason: "Regular checkup and health assessment"
    }))
    
    // Select first patient if available
    if (patients.length > 0) {
      handlePatientSelect(patients[0].id.toString())
    }
    
    toast.success("Demo data filled!")
  }

  const prefillUrgent = () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    
    setFormData(prev => ({
      ...prev,
      date: dateStr,
      time: "14:00",
      reason: "Urgent consultation - chest pain"
    }))
    
    if (patients.length > 0) {
      handlePatientSelect(patients[0].id.toString())
    }
    
    toast.success("Urgent appointment data filled!")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.selectedPatientEmail || !formData.selectedPatientName) {
      toast.error("Please select a patient")
      return
    }
    
    if (!formData.date || !formData.time) {
      toast.error("Please select date and time")
      return
    }
    
    if (!formData.reason.trim()) {
      toast.error("Please enter a reason for the appointment")
      return
    }
    
    setLoading(true)

    try {
      await createAppointment()
    } catch (error: any) {
      console.error("Create appointment error:", error)
      console.error("Error response data:", error.response?.data)
      const errorMessage = getErrorMessage(error)
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

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientFormData({
      ...patientFormData,
      [e.target.name]: e.target.value
    })
  }

  if (loadingPatients) {
    return <div className="flex items-center justify-center min-h-screen">Loading patients...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Header with demo buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Schedule New Appointment</h1>
          <p className="text-muted-foreground">Create a new appointment for a patient</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prefillDemo}>
            <Zap className="mr-2 h-4 w-4" />
            Demo Fill
          </Button>
          <Button variant="outline" size="sm" onClick={prefillUrgent}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Urgent Demo
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointment Details
          </CardTitle>
          <CardDescription>
            Select patient, date, time, and reason for the appointment
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Select Patient
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select value={formData.selectedPatientId} onValueChange={handlePatientSelect}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.full_name}</span>
                            <span className="text-sm text-muted-foreground">{patient.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowCreatePatient(true)}
                  className="px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Patient
                </Button>
              </div>
              {patients.length === 0 && (
                <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md">
                  No patients found. Create a new patient first.
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Appointment Date
                </Label>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Appointment Time
                </Label>
                <Input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="h-12"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Reason for Visit</Label>
              <Input
                name="reason"
                placeholder="e.g., Regular checkup, Follow-up visit, Symptoms consultation..."
                value={formData.reason}
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>Creating Appointment...</>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/doctor/dashboard")}
                className="h-12 px-8"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Patient Creation Form */}
      {showCreatePatient && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Create New Patient
            </CardTitle>
            <CardDescription>
              Patient not found. Please create the patient account first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient_full_name">Full Name</Label>
                <Input
                  id="patient_full_name"
                  name="full_name"
                  placeholder="Patient's full name"
                  value={patientFormData.full_name}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_email">Email</Label>
                <Input
                  id="patient_email"
                  name="email"
                  type="email"
                  placeholder="patient@example.com"
                  value={patientFormData.email}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient_password">Temporary Password</Label>
                <Input
                  id="patient_password"
                  name="password"
                  type="password"
                  placeholder="Temporary password for patient"
                  value={patientFormData.password}
                  onChange={handlePatientChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_dob">Date of Birth</Label>
                  <Input
                    id="patient_dob"
                    name="date_of_birth"
                    type="date"
                    value={patientFormData.date_of_birth}
                    onChange={handlePatientChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_phone">Phone Number</Label>
                  <Input
                    id="patient_phone"
                    name="phone_number"
                    placeholder="Phone number"
                    value={patientFormData.phone_number}
                    onChange={handlePatientChange}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={createPatient} disabled={creatingPatient}>
                  {creatingPatient ? "Creating Patient..." : "Create Patient & Schedule Appointment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePatient(false)}
                  disabled={creatingPatient}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}