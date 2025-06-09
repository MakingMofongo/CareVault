"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Shield, FileText, User, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import axios from "axios"

interface SharedPrescription {
  id: number
  patient_email: string
  doctor_name: string
  diagnosis: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  interactions: {
    interactions: string[]
    summary: string
  } | null
  created_at: string
  verification_token: string
}

export default function SharedPrescription() {
  const { token } = useParams()
  const [prescription, setPrescription] = useState<SharedPrescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPrescription()
  }, [token])

  const fetchPrescription = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/share/${token}`)
      setPrescription(response.data)
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to load prescription")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading prescription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              This prescription may have been revoked or the link may be invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!prescription) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CareVault Prescription</h1>
          <p className="text-gray-600">Secure prescription verification</p>
        </div>

        <div className="space-y-6">
          {/* Verification Badge */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div className="text-center">
                  <p className="font-medium text-green-800">Verified Prescription</p>
                  <p className="text-sm text-green-600">Token: {prescription.verification_token}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Patient:</span> {prescription.patient_email}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Doctor:</span> {prescription.doctor_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span> {new Date(prescription.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescription.medications.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="font-medium text-lg">{med.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Dosage:</span> {med.dosage}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Frequency:</span> {med.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Drug Interactions */}
          {prescription.interactions && (
            <Card className={prescription.interactions.interactions.length > 0 ? "border-yellow-500" : "border-green-500"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${prescription.interactions.interactions.length > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                  Drug Interaction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{prescription.interactions.summary}</p>
                {prescription.interactions.interactions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Detected Interactions:</p>
                    <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                      {prescription.interactions.interactions.map((interaction, i) => (
                        <li key={i} className="list-disc">{interaction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-blue-800">Security Notice</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• This prescription is authenticated and verified by CareVault</p>
                    <p>• The patient has authorized this view through secure token sharing</p>
                    <p>• Access can be revoked by the patient at any time</p>
                    <p>• Do not share this link with unauthorized parties</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print Button for Pharmacies */}
          <div className="text-center">
            <Button 
              onClick={() => window.print()}
              className="w-full md:w-auto"
            >
              Print Prescription Record
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              For pharmacy verification and record keeping
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-muted-foreground">
            Powered by CareVault • Secure Healthcare Records Management
          </p>
        </div>
      </div>
    </div>
  )
}