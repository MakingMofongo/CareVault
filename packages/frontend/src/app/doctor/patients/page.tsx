"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Calendar, 
  FileText, 
  Phone, 
  Mail, 
  User,
  Cake,
  MapPin,
  Activity
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import Breadcrumbs from "@/components/Breadcrumbs"

interface Patient {
  id: number
  email: string
  full_name: string
  role: string
  phone_number?: string
  date_of_birth?: string
  created_at: string
  appointments_count?: number
  prescriptions_count?: number
}

export default function Patients() {
  const { user } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [patientAppointments, setPatientAppointments] = useState<any[]>([])
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([])
  const [loadingPatientData, setLoadingPatientData] = useState(false)

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchPatients()
    }
  }, [user])

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm])

  const fetchPatients = async () => {
    try {
      const [usersResponse, appointmentsResponse, prescriptionsResponse] = await Promise.all([
        api.get("/users"),
        api.get("/appointments"),
        api.get("/prescriptions")
      ])
      
      const patientsOnly = usersResponse.data.filter((u: any) => u.role === "patient")
      const appointments = appointmentsResponse.data
      const prescriptions = prescriptionsResponse.data
      
      // Add counts to patients
      const patientsWithCounts = patientsOnly.map((patient: Patient) => ({
        ...patient,
        appointments_count: appointments.filter((apt: any) => apt.patient_email === patient.email).length,
        prescriptions_count: prescriptions.filter((rx: any) => rx.patient_email === patient.email).length
      }))
      
      setPatients(patientsWithCounts)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast.error("Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(patient => 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone_number && patient.phone_number.includes(searchTerm))
      )
      setFilteredPatients(filtered)
    }
  }

  const openPatientDetails = async (patient: Patient) => {
    setSelectedPatient(patient)
    setShowDetails(true)
    setLoadingPatientData(true)
    
    try {
      const [appointmentsResponse, prescriptionsResponse] = await Promise.all([
        api.get("/appointments"),
        api.get("/prescriptions")
      ])
      
      const patientAppointments = appointmentsResponse.data.filter(
        (apt: any) => apt.patient_email === patient.email
      )
      const patientPrescriptions = prescriptionsResponse.data.filter(
        (rx: any) => rx.patient_email === patient.email
      )
      
      setPatientAppointments(patientAppointments)
      setPatientPrescriptions(patientPrescriptions)
    } catch (error) {
      console.error("Failed to fetch patient data:", error)
      toast.error("Failed to load patient details")
    } finally {
      setLoadingPatientData(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Patient Records</h1>
          <p className="text-muted-foreground">Manage your patient database</p>
        </div>
        <Link href="/doctor/patients/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.reduce((sum, p) => sum + (p.appointments_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.reduce((sum, p) => sum + (p.prescriptions_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Grid */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {patients.length === 0 ? "No patients found" : "No matching patients"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {patients.length === 0 
                  ? "You haven't registered any patients yet." 
                  : "Try adjusting your search terms."
                }
              </p>
              {patients.length === 0 && (
                <Link href="/doctor/patients/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Patient
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card 
              key={patient.id} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => openPatientDetails(patient)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                          {patient.full_name}
                        </h3>
                      </div>
                      {patient.date_of_birth && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          Age {calculateAge(patient.date_of_birth)}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{patient.email}</span>
                      </div>
                      {patient.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{patient.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{patient.appointments_count || 0} appointments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{patient.prescriptions_count || 0} prescriptions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openPatientDetails(patient)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link href={`/doctor/appointments/new?patient=${patient.email}&name=${patient.full_name}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Patient Details Modal */}
      {showDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Patient Details</CardTitle>
                  <CardDescription>{selectedPatient.full_name}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Patient Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Personal Information</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedPatient.full_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.email}</span>
                    </div>
                    {selectedPatient.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPatient.phone_number}</span>
                      </div>
                    )}
                    {selectedPatient.date_of_birth && (
                      <div className="flex items-center gap-3">
                        <Cake className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(selectedPatient.date_of_birth).toLocaleDateString()} 
                          (Age {calculateAge(selectedPatient.date_of_birth)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Medical Summary</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.appointments_count || 0} total appointments</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.prescriptions_count || 0} prescriptions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>Patient since {new Date(selectedPatient.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {loadingPatientData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Appointments */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Recent Appointments</h4>
                    {patientAppointments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No appointments yet</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {patientAppointments.slice(0, 3).map((apt: any) => (
                          <div key={apt.id} className="text-sm border rounded p-2">
                            <div className="font-medium">{apt.reason}</div>
                            <div className="text-muted-foreground">
                              {new Date(apt.scheduled_at).toLocaleDateString()} - {apt.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Prescriptions */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Recent Prescriptions</h4>
                    {patientPrescriptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No prescriptions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {patientPrescriptions.slice(0, 3).map((rx: any) => (
                          <div key={rx.id} className="text-sm border rounded p-2">
                            <div className="font-medium">
                              {rx.medications?.map((m: any) => m.name).join(", ") || "Prescription"}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(rx.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Link href={`/doctor/appointments/new?patient=${selectedPatient.email}&name=${selectedPatient.full_name}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    New Appointment
                  </Button>
                </Link>
                <Link href={`/doctor/prescriptions/new?patient=${selectedPatient.full_name}&email=${selectedPatient.email}`}>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    New Prescription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}