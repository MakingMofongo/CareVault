"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  PhoneCall,
  Mail,
  MapPin
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import Breadcrumbs from "@/components/Breadcrumbs"

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  scheduled_at: string
  reason: string
  status: "scheduled" | "completed" | "cancelled" | "in_progress"
  patient_name: string
  patient_email: string
  notes?: string
  created_at: string
}

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/login")
    } else if (user && user.role === "doctor") {
      fetchAppointments()
    }
  }, [user, loading, router])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments")
      const sortedAppointments = response.data.sort((a: Appointment, b: Appointment) => 
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
      )
      setAppointments(sortedAppointments)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
      toast.error("Failed to load appointments")
    } finally {
      setLoadingAppointments(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}`, { status: newStatus })
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      )
      toast.success(`Appointment ${newStatus}`)
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    } catch (error) {
      toast.error("Failed to update appointment")
    }
  }

  const deleteAppointment = async (appointmentId: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return
    
    try {
      await api.delete(`/appointments/${appointmentId}`)
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      toast.success("Appointment deleted")
      if (selectedAppointment?.id === appointmentId) {
        setShowDetails(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      toast.error("Failed to delete appointment")
    }
  }

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetails(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed": return "bg-green-100 text-green-800 border-green-200"
      case "cancelled": return "bg-red-100 text-red-800 border-red-200"
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled": return <Calendar className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      case "in_progress": return <AlertCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || loadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "doctor") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>
        <Link href="/doctor/appointments/new">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, email, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="min-w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Grid */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {appointments.length === 0 
                  ? "You haven't scheduled any appointments yet." 
                  : "No appointments match your current filters."
                }
              </p>
              <Link href="/doctor/appointments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Your First Appointment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card 
              key={appointment.id} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => openAppointmentDetails(appointment)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                          {appointment.patient_name}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(appointment.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(appointment.scheduled_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{appointment.patient_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{appointment.reason}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openAppointmentDetails(appointment)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {appointment.status === "scheduled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateAppointmentStatus(appointment.id, "in_progress")
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                      >
                        Start
                      </Button>
                    )}
                    {appointment.status === "in_progress" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateAppointmentStatus(appointment.id, "completed")
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Appointment Details</CardTitle>
                  <CardDescription>{selectedAppointment.patient_name}</CardDescription>
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
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Patient Information</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedAppointment.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.patient_email}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Appointment Details</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(selectedAppointment.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(selectedAppointment.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.reason}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 w-fit ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      {selectedAppointment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {selectedAppointment.status === "scheduled" && (
                  <>
                    <Button
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "in_progress")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Start Appointment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
                {selectedAppointment.status === "in_progress" && (
                  <Button
                    onClick={() => updateAppointmentStatus(selectedAppointment.id, "completed")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Appointment
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => deleteAppointment(selectedAppointment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Link href={`/doctor/prescriptions/new?appointment=${selectedAppointment.id}&patient=${selectedAppointment.patient_name}&email=${selectedAppointment.patient_email}`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Create Prescription
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