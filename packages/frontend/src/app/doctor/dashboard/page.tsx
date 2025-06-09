"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar, FileText, Users, Plus } from "lucide-react"
import Link from "next/link"

export default function DoctorDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    recentPrescriptions: 0
  })

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
      
      // Calculate today's appointments
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointments.filter((apt: any) => 
        apt.scheduled_at.startsWith(today)
      ).length
      
      // Count recent prescriptions (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentPrescriptions = prescriptions.filter((p: any) => 
        new Date(p.created_at) > weekAgo
      ).length
      
      setStats({
        todayAppointments,
        totalPatients: patients.length,
        recentPrescriptions
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your upcoming and recent appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center py-8">
                No appointments scheduled yet
              </div>
              <Link href="/doctor/appointments" className="block">
                <Button variant="outline" className="w-full">View All Appointments</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/doctor/patients/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Patient
              </Button>
            </Link>
            <Link href="/doctor/appointments/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule New Appointment
              </Button>
            </Link>
            <Link href="/doctor/prescriptions/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Create Prescription
              </Button>
            </Link>
            <Link href="/doctor/patients" className="block">
              <Button variant="outline" className="w-full justify-start">
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