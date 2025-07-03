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

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "ENT",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Psychiatry",
  "Ophthalmology",
  "Other"
]

const DOCTORS: Record<string, string[]> = {
  "General Medicine": ["Dr. Alice Smith", "Dr. John Doe"],
  "Cardiology": ["Dr. Heart Strong", "Dr. Pulse Quick"],
  "Dermatology": ["Dr. Skin Deep"],
  "ENT": ["Dr. Ear Nose"],
  "Orthopedics": ["Dr. Bone Setter"],
  "Pediatrics": ["Dr. Child Care"],
  "Gynecology": ["Dr. Women Health"],
  "Neurology": ["Dr. Brainy"],
  "Psychiatry": ["Dr. Mindful"],
  "Ophthalmology": ["Dr. Eye See"],
  "Other": []
}

const TIME_SLOTS = [
  "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM"
]

export default function NewAppointment() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: "",
    gender: "",
    dob: "",
    contact_number: "",
    email: "",
    address: "",
    department: "",
    doctor: "",
    appointment_date: "",
    time_slot: "",
    mode: "",
    reason: "",
    visited_before: "",
    consent_info: false,
    consent_policy: false
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle text, select, radio, checkbox changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      setForm({ ...form, [name]: e.target.checked })
    } else {
      setForm({ ...form, [name]: value })
    }
    if (name === "department") setForm(f => ({ ...f, doctor: "" }))
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!form.consent_info || !form.consent_policy) {
      toast.error("Please provide all required consents.")
      return
    }
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => data.append(key, value as string))
      if (file) data.append("file", file)
      await api.post("/appointments", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Appointment booked successfully!")
      router.push("/patient/appointments")
    } catch (error: any) {
      toast.error("Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }

  const demoFill = () => {
    // Pick a department and doctor
    const department = "Dermatology"
    const doctor = DOCTORS[department][0] || ""

    // Tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split("T")[0]

    setForm({
      full_name: "John Doe",
      gender: "Male",
      dob: "1990-01-01",
      contact_number: "+1 234 567 8901",
      email: "johndoe@example.com",
      address: "123 Main St, Springfield",
      department,
      doctor,
      appointment_date: dateStr,
      time_slot: "10:00 AM – 11:00 AM",
      mode: "In-Person",
      reason: "Routine skin checkup",
      visited_before: "No",
      consent_info: true,
      consent_policy: true
    })
    setFile(null)
    toast.success("Demo data filled!")
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={demoFill}>
          Demo Fill
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Book a New Appointment</CardTitle>
          <CardDescription>
            Please fill in the details below to schedule your appointment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Patient Information */}
            <div>
              <h3 className="font-semibold mb-2">1. Patient Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    placeholder="+1 234 567 8901"
                    value={form.contact_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Appointment Details */}
            <div>
              <h3 className="font-semibold mb-2">2. Appointment Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="department">Department / Speciality</Label>
                  <select
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select</option>
                    {DEPARTMENTS.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="doctor">Preferred Doctor (optional)</Label>
                  <select
                    id="doctor"
                    name="doctor"
                    value={form.doctor}
                    onChange={handleChange}
                    disabled={!form.department}
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select</option>
                    {(DOCTORS[form.department] || []).map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="appointment_date">Appointment Date</Label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    type="date"
                    value={form.appointment_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time_slot">Preferred Time Slot</Label>
                  <select
                    id="time_slot"
                    name="time_slot"
                    value={form.time_slot}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Mode of Appointment</Label>
                  <div className="flex gap-4 mt-1">
                    {["In-Person", "Video Consultation", "Phone Call"].map(mode => (
                      <label key={mode} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="mode"
                          value={mode}
                          checked={form.mode === mode}
                          onChange={handleChange}
                          required
                        />
                        {mode}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Reason for Visit */}
            <div>
              <h3 className="font-semibold mb-2">3. Reason for Visit</h3>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Please briefly describe your symptoms or reason for visit"
                value={form.reason}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            {/* 4. Additional Information */}
            <div>
              <h3 className="font-semibold mb-2">4. Additional Information (optional)</h3>
              <div className="space-y-4">
                <div>
                  <Label>Have you visited us before?</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visited_before"
                        value="Yes"
                        checked={form.visited_before === "Yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="visited_before"
                        value="No"
                        checked={form.visited_before === "No"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="file">Upload Previous Reports / Prescriptions</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* 5. Consent */}
            <div>
              <h3 className="font-semibold mb-2">5. Consent</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="consent_info"
                    checked={form.consent_info}
                    onChange={handleChange}
                    required
                  />
                  I confirm that the information provided is accurate to the best of my knowledge.
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="consent_policy"
                    checked={form.consent_policy}
                    onChange={handleChange}
                    required
                  />
                  I agree to the privacy policy and terms of service.
                </label>
              </div>
            </div>

            {/* Actions */}
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