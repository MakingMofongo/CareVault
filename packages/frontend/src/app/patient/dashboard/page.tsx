"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar, FileText, QrCode, Shield, AlertCircle } from "lucide-react"
import api from "@/lib/api"

interface Prescription {
  id: number
  appointment_id: number
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  ai_summary: string
  ai_interactions: {
    interactions: string[]
    summary: string
  } | null
  status: string
  qr_code: string
  share_token: string
  created_at: string
  patient_name: string
  doctor_name: string
}

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  scheduled_at: string
  reason: string
  status: string
  patient_name: string
  patient_email: string
}

export default function PatientDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/login")
    } else if (user && user.role === "patient") {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      const [prescriptionsRes, appointmentsRes] = await Promise.all([
        api.get("/prescriptions"),
        api.get("/appointments")
      ])
      setPrescriptions(prescriptionsRes.data)
      setAppointments(appointmentsRes.data)
      console.log("Patient data loaded:", {
        prescriptions: prescriptionsRes.data.length,
        appointments: appointmentsRes.data.length
      })
    } catch (error) {
      console.error("Failed to load patient data:", error)
      toast.error("Failed to load your data")
    } finally {
      setLoadingData(false)
    }
  }

  const revokeAccess = async (prescriptionId: number) => {
    try {
      await api.delete(`/share/prescriptions/${prescriptionId}`)
      toast.success("Prescription access revoked successfully")
      fetchData() // Refresh data
    } catch (error) {
      toast.error("Failed to revoke access")
    }
  }

  if (loading || loadingData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "patient") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
          <p className="text-muted-foreground">View your medical records and manage prescription sharing</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Prescription records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.filter(p => p.share_token).length}</div>
            <p className="text-xs text-muted-foreground">Shareable prescriptions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Your prescription history and sharing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No prescriptions yet
                </div>
              ) : (
                prescriptions.slice(0, 3).map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Dr. {prescription.doctor_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </div>
                        {prescription.ai_summary && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {prescription.ai_summary}
                          </div>
                        )}
                      </div>
                      {prescription.ai_interactions?.interactions?.length > 0 && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <div className="text-sm">
                      <strong>Medications:</strong> {prescription.medications.map(m => m.name).join(", ")}
                    </div>
                    
                    {prescription.share_token && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Sharing enabled</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeAccess(prescription.id)}
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Revoke
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {prescriptions.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All Prescriptions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your appointment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No appointments yet
                </div>
              ) : (
                appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{appointment.reason}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
              
              {appointments.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All Appointments
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Sharing</CardTitle>
          <CardDescription>
            Control who can access your prescription information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <QrCode className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Secure Sharing</p>
              <p className="text-sm text-muted-foreground">
                Your prescriptions can be shared via QR code for pharmacy verification. 
                You can revoke access at any time for complete control over your medical data.
              </p>
            </div>
          </div>
          
          {prescriptions.filter(p => p.share_token).length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No active prescription shares
            </div>
          ) : (
            <div className="text-sm">
              <p className="font-medium mb-2">Active Shares: {prescriptions.filter(p => p.share_token).length}</p>
              <p className="text-muted-foreground">
                These prescriptions can be accessed by scanning their QR codes. Revoke access for any prescription to disable sharing immediately.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}