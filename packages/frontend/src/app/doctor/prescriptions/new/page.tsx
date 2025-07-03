"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { AlertCircle, Plus, Trash2, Loader2 } from "lucide-react"
import api from "@/lib/api"

interface Medication {
  name: string
  dosage: string
  frequency: string
  timing?: string
}

interface Appointment {
  id: number
  patient_name: string
  patient_email: string
  scheduled_at: string
  reason: string
}

// Add a static list of medicine name suggestions
const MEDICINE_SUGGESTIONS = [
  "Paracetamol",
  "Ibuprofen",
  "Amoxicillin",
  "Aspirin",
  "Metformin",
  "Atorvastatin",
  "Omeprazole",
  "Simvastatin",
  "Losartan",
  "Azithromycin",
  "Levothyroxine",
  "Lisinopril",
  "Amlodipine",
  "Metoprolol",
  "Albuterol",
  "Gabapentin",
  "Hydrochlorothiazide",
  "Sertraline",
  "Furosemide",
  "Pantoprazole",
  "Prednisone"
];

export default function NewPrescription() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingInteractions, setCheckingInteractions] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)
  const [aiSummary, setAiSummary] = useState("")
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", timing: "" }
  ])
  const [interactions, setInteractions] = useState<any>(null)
  const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null)
  const [openSuggestionIndex, setOpenSuggestionIndex] = useState<number | null>(null)
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load appointments for this doctor
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await api.get('/appointments')
        setAppointments(response.data)
      } catch (error) {
        toast.error('Failed to load appointments')
      }
    }
    loadAppointments()
  }, [])

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", timing: "" }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications]
    updated[index][field] = value
    setMedications(updated)
  }

  const checkInteractions = async () => {
    const validMedications = medications.filter(m => m.name.trim())
    if (validMedications.length < 2) {
      toast.info("Add at least 2 medications to check interactions")
      return
    }

    setCheckingInteractions(true)
    try {
      const response = await api.post("/ai/check-interactions", {
        medications: validMedications.map(m => m.name)
      })
      setInteractions(response.data)
      if (response.data.interactions?.length > 0) {
        toast.warning("Potential drug interactions detected!")
      } else {
        toast.success("No significant interactions found")
      }
    } catch (error) {
      toast.error("Failed to check drug interactions")
    } finally {
      setCheckingInteractions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validMedications = medications.filter(m => m.name.trim())
    if (validMedications.length === 0) {
      toast.error("Please add at least one medication")
      return
    }

    if (!selectedAppointmentId) {
      toast.error("Please select an appointment")
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        appointment_id: selectedAppointmentId,
        medications: validMedications,
        ai_summary: aiSummary
      }
      if (interactions) {
        payload.ai_interactions = interactions
      }
      const response = await api.post("/prescriptions", payload)

      toast.success("Prescription created successfully!")
      router.push(`/doctor/prescriptions/${response.data.id}`)
    } catch (error: any) {
      let errorMessage = "Failed to create prescription"
      
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors
          errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ')
        } else if (error.response.data.detail) {
          errorMessage = JSON.stringify(error.response.data.detail)
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderMedicineInput = (med: Medication, index: number) => {
    // Filter suggestions based on input
    const filteredSuggestions = MEDICINE_SUGGESTIONS.filter(name =>
      med.name && name.toLowerCase().includes(med.name.toLowerCase())
    ).slice(0, 8)

    return (
      <div className="relative">
        <Label htmlFor={`medication-name-${index}`}>Medicine Name</Label>
        <Input
          id={`medication-name-${index}`}
          placeholder="Enter medicine name"
          value={med.name}
          autoComplete="off"
          onFocus={() => setOpenSuggestionIndex(index)}
          onBlur={() => setTimeout(() => setOpenSuggestionIndex(null), 100)}
          onChange={e => {
            updateMedication(index, "name", e.target.value)
            setActiveSuggestion(null)
            setOpenSuggestionIndex(index)
          }}
          onKeyDown={e => {
            if (filteredSuggestions.length === 0) return
            if (e.key === "ArrowDown") {
              setActiveSuggestion(prev => prev === null ? 0 : Math.min(prev + 1, filteredSuggestions.length - 1))
            } else if (e.key === "ArrowUp") {
              setActiveSuggestion(prev => prev === null ? filteredSuggestions.length - 1 : Math.max(prev - 1, 0))
            } else if (e.key === "Enter" && activeSuggestion !== null) {
              updateMedication(index, "name", filteredSuggestions[activeSuggestion])
              setActiveSuggestion(null)
              setOpenSuggestionIndex(null)
              e.preventDefault()
            }
          }}
          className="pr-10"
        />
        {openSuggestionIndex === index && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredSuggestions.map((name, i) => (
              <div
                key={name}
                ref={el => suggestionRefs.current[i] = el}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${activeSuggestion === i ? "bg-blue-100" : ""}`}
                onMouseDown={() => {
                  updateMedication(index, "name", name)
                  setActiveSuggestion(null)
                  setOpenSuggestionIndex(null)
                }}
                onMouseEnter={() => setActiveSuggestion(i)}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Prescription</CardTitle>
          <CardDescription>
            Add medications and check for drug interactions before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointment">Select Appointment</Label>
                <Select 
                  value={selectedAppointmentId?.toString() || ""} 
                  onValueChange={(value) => setSelectedAppointmentId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id.toString()}>
                        {appointment.patient_name} ({appointment.patient_email}) - {new Date(appointment.scheduled_at).toLocaleDateString()} - {appointment.reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiSummary">AI Summary (Optional)</Label>
                <Textarea
                  id="aiSummary"
                  placeholder="AI-generated summary or notes about the prescription"
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Medications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMedication}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Medication
                  </Button>
                </div>

                {medications.map((med, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          {renderMedicineInput(med, index)}
                        </div>
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMedication(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Dosage</Label>
                          <Input
                            placeholder="e.g., 500mg"
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Input
                            placeholder="e.g., 3 times daily"
                            value={med.frequency}
                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Timing</Label>
                          <Select
                            value={med.timing || ""}
                            onValueChange={(value) => updateMedication(index, "timing", value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select timing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before food">Before Food</SelectItem>
                              <SelectItem value="after food">After Food</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={checkInteractions}
                    disabled={checkingInteractions}
                  >
                    {checkingInteractions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking Interactions...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Check Drug Interactions
                      </>
                    )}
                  </Button>
                </div>

                {interactions && (
                  <Card className={`p-4 ${interactions.interactions?.length > 0 ? 'border-yellow-500' : 'border-green-500'}`}>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        AI Analysis Results
                      </h4>
                      <p className="text-sm">{interactions.summary}</p>
                      {interactions.interactions?.length > 0 && (
                        <ul className="text-sm space-y-1 ml-6">
                          {interactions.interactions.map((interaction: string, i: number) => (
                            <li key={i} className="list-disc">{interaction}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Finalize Prescription"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/doctor/dashboard")}
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