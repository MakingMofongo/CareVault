"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar, FileText, Users, Plus } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

export default function DoctorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    recentPrescriptions: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/login")
    } else if (user && user.role === "doctor") {
      fetchStats()
    }
  }, [user, loading, router])

  const fetchStats = async () => {
    try {
      // Fetch users to count patients
      const usersResponse = await api.get("/users")
      const patients = usersResponse.data.filter((u: any) => u.role === "patient")
      
      // Fetch appointments
      const appointmentsResponse = await api.get("/appointments")
      const appointments = appointmentsResponse.data
      
      // Fetch prescriptions
      const prescriptionsResponse = await api.get("/prescriptions")
      const prescriptions = prescriptionsResponse.data
      
      // Debug logging
      console.log("Fetched appointments:", appointments)
      console.log("Total appointments:", appointments.length)
      
      // Calculate today's appointments
      const today = new Date().toISOString().split('T')[0]
      console.log("Today's date string:", today)
      
      const todayAppointments = appointments.filter((apt: any) => {
        console.log("Appointment scheduled_at:", apt.scheduled_at)
        const appointmentDate = apt.scheduled_at.split('T')[0]
        console.log("Appointment date:", appointmentDate, "Today:", today, "Match:", appointmentDate === today)
        return appointmentDate === today
      }).length
      
      console.log("Today's appointments count:", todayAppointments)
      
      // Count recent prescriptions (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentPrescriptions = prescriptions.filter((p: any) => 
        new Date(p.created_at) > weekAgo
      ).length
      
      // Get recent appointments (next 5 upcoming or recent)
      const now = new Date()
      const sortedAppointments = appointments
        .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5)
      
      setStats({
        todayAppointments,
        totalPatients: patients.length,
        recentPrescriptions
      })
      setRecentAppointments(sortedAppointments)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const setupDemoData = async () => {
    try {
      const response = await api.post("/users/demo-setup")
      if (response.data.error) {
        toast.error(response.data.error)
      } else {
        toast.success("Demo data created! Patients can now login and see appointments.")
        fetchStats() // Refresh stats
      }
    } catch (error) {
      toast.error("Failed to create demo data")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "doctor") {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, Dr. {user.full_name}</h1>
          <p className="text-muted-foreground">Manage your appointments and prescriptions</p>
        </div>
        <div className="space-x-4">
          <Button
            variant="secondary"
            onClick={setupDemoData}
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Setup Demo
          </Button>
          <Link href="/doctor/patients/new">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Button>
          </Link>
          <Link href="/doctor/appointments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Active patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentPrescriptions}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your upcoming and recent appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No appointments scheduled yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAppointments.map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-blue-600 hover:text-blue-700">{appointment.patient_name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/doctor/appointments" className="block">
                <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                  View All Appointments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/doctor/patients/new" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Create New Patient
              </Button>
            </Link>
            <Link href="/doctor/appointments/new" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule New Appointment
              </Button>
            </Link>
            <Link href="/doctor/prescriptions/new" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-colors">
                <FileText className="mr-2 h-4 w-4" />
                Create Prescription
              </Button>
            </Link>
            <Link href="/doctor/patients" className="block">
              <Button variant="outline" className="w-full justify-start hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 transition-colors">
                <Users className="mr-2 h-4 w-4" />
                View Patient Records
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}