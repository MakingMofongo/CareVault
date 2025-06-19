"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import api from "@/lib/api"

export default function NewAppointment() {
  const router = useRouter()
  const [form, setForm] = useState({
    doctor_email: "",
    scheduled_at: "",
    reason: ""
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post("/appointments", form)
      toast.success("Appointment booked successfully!")
      router.push("/patient/appointments")
    } catch (error: any) {
      toast.error("Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Book a New Appointment</CardTitle>
          <CardDescription>
            Fill in the details below to schedule an appointment with your doctor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="doctor_email">Doctor's Email</Label>
              <Input
                id="doctor_email"
                name="doctor_email"
                type="email"
                placeholder="doctor@example.com"
                value={form.doctor_email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date & Time</Label>
              <Input
                id="scheduled_at"
                name="scheduled_at"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Appointment</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Describe your symptoms or reason for visit"
                value={form.reason}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Booking..." : "Book Appointment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/patient/appointments")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}