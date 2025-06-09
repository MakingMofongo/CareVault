"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Users, Plus } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

interface Patient {
  id: number
  email: string
  full_name: string
  role: string
  phone_number?: string
  date_of_birth?: string
  created_at: string
}

export default function Patients() {
  const { user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchPatients()
    }
  }, [user])

  const fetchPatients = async () => {
    try {
      const response = await api.get("/users")
      console.log("All users:", response.data)
      const patientsOnly = response.data.filter((u: any) => u.role === "patient")
      setPatients(patientsOnly)
      console.log("Patients found:", patientsOnly.length)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patient Records</h1>
          <p className="text-muted-foreground">Manage your patient database</p>
        </div>
        <Link href="/doctor/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Patients ({patients.length})
          </CardTitle>
          <CardDescription>
            View and manage patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No patients registered yet</p>
              <Link href="/doctor/patients/new" className="mt-4 inline-block">
                <Button>Create First Patient</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{patient.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                      {patient.phone_number && (
                        <p className="text-sm text-muted-foreground">{patient.phone_number}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Registered: {new Date(patient.created_at).toLocaleDateString()}
                      </p>
                      {patient.date_of_birth && (
                        <p className="text-sm text-muted-foreground">
                          DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}