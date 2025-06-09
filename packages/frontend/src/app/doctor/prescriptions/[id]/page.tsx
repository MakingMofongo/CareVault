"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Download, QrCode, FileText, Calendar, User, AlertCircle } from "lucide-react"
import api from "@/lib/api"

interface Prescription {
  id: number
  appointment_id: number
  patient_email: string
  patient_name: string
  doctor_name: string
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
}

export default function PrescriptionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescription()
  }, [id])

  const fetchPrescription = async () => {
    try {
      const response = await api.get(`/prescriptions/${id}`)
      setPrescription(response.data)
    } catch (error) {
      toast.error("Failed to load prescription")
      router.push("/doctor/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    // In a real implementation, this would generate and download a PDF
    toast.info("PDF generation will be implemented soon")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!prescription) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prescription Details</h1>
        <Button variant="outline" onClick={() => router.push("/doctor/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Patient:</span> {prescription.patient_name}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span> {prescription.patient_email}
              </div>
              {prescription.ai_summary && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Summary:</span> {prescription.ai_summary}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span> {new Date(prescription.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <div className="font-medium">{med.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {med.dosage} - {med.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {prescription.ai_interactions && (
            <Card className={prescription.ai_interactions.interactions?.length > 0 ? "border-yellow-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Drug Interaction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{prescription.ai_interactions.summary}</p>
                {prescription.ai_interactions.interactions?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Detected Interactions:</p>
                    <ul className="text-sm text-muted-foreground ml-4">
                      {prescription.ai_interactions.interactions.map((interaction, i) => (
                        <li key={i} className="list-disc">{interaction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Share & Download</CardTitle>
              <CardDescription>
                Share this prescription with the patient or pharmacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescription.qr_code && (
                <div className="flex justify-center">
                  <img
                    src={prescription.qr_code}
                    alt="Prescription QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}
              <div className="text-center text-sm text-muted-foreground">
                Scan this QR code to view the prescription
              </div>
              <div className="space-y-2">
                <Button onClick={downloadPDF} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:3000/share/${prescription.share_token}`)
                    toast.success("Share link copied to clipboard!")
                  }}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Copy Share Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/doctor/prescriptions/new")}
              >
                Create New Prescription
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/doctor/appointments/new")}
              >
                Schedule Follow-up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}