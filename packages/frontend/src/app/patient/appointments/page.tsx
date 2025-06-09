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
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  MapPin,
  Phone
} from "lucide-react"
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
  doctor_name?: string
  notes?: string
  created_at: string
}

export default function PatientAppointments() {
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
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/login")
    } else if (user && user.role === "patient") {
      fetchAppointments()
    }
  }, [user, loading, router])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter])

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments")
      // Filter appointments for the current patient
      const userAppointments = response.data.filter(
        (apt: Appointment) => apt.patient_email === user?.email
      )
      const sortedAppointments = userAppointments.sort((a: Appointment, b: Appointment) => 
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
        apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.doctor_name && apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    setFilteredAppointments(filtered)
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => 
      new Date(apt.scheduled_at) > now && apt.status === "scheduled"
    ).length
  }

  if (loading || loadingAppointments) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "patient") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumbs />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your healthcare appointments</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            {getUpcomingAppointments()} upcoming
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{appointments.length}</div>
            <p className="text-xs text-blue-600">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-xs text-green-600">Finished visits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Upcoming</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{getUpcomingAppointments()}</div>
            <p className="text-xs text-yellow-600">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {appointments.filter(a => {
                const aptDate = new Date(a.scheduled_at)
                const now = new Date()
                return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-purple-600">Appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reason or doctor..."
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
                  ? "You don't have any appointments scheduled yet." 
                  : "No appointments match your current filters."
                }
              </p>
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
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                          {appointment.reason}
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
                        <User className="h-4 w-4" />
                        <span>Dr. {appointment.doctor_name || "Healthcare Provider"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>CareVault Clinic</span>
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
                  <CardDescription>{selectedAppointment.reason}</CardDescription>
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
              {/* Appointment Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Appointment Information</h4>
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

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Healthcare Provider</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span>Dr. {selectedAppointment.doctor_name || "Healthcare Provider"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>CareVault Medical Center</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>(555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preparation Instructions */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-lg text-blue-800">Preparation Instructions</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>• Please arrive 15 minutes before your scheduled time</p>
                  <p>• Bring a valid ID and insurance card</p>
                  <p>• Bring a list of current medications</p>
                  <p>• Wear comfortable, loose-fitting clothing</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {selectedAppointment.status === "scheduled" && (
                  <div className="text-sm text-muted-foreground">
                    To reschedule or cancel this appointment, please contact our office at (555) 123-4567
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 