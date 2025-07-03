"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, Shield, FileText } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Prescription {
  id: number;
  appointment_id: number;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  ai_summary: string;
  ai_interactions: {
    interactions: string[];
    summary: string;
  } | null;
  status: string;
  qr_code: string;
  share_token: string;
  created_at: string;
  patient_name: string;
  doctor_name: string;
}

export default function PatientPrescriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/login");
    } else if (user && user.role === "patient") {
      fetchPrescriptions();
    }
  }, [user, loading, router]);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (error) {
      toast.error("Failed to load prescriptions");
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== "patient") {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Prescriptions</h1>
          <p className="text-muted-foreground">View and manage your prescription records</p>
        </div>
        <Link href="/patient/dashboard">
          <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>Your complete prescription history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No prescriptions found
              </div>
            ) : (
              prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-blue-600 hover:text-blue-700">Dr. {prescription.doctor_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </div>
                      {prescription.ai_summary && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {prescription.ai_summary}
                        </div>
                      )}
                    </div>
                    {Array.isArray(prescription.ai_interactions?.interactions) && prescription.ai_interactions.interactions.length > 0 && (
                      <FileText className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="text-sm">
                    <strong>Medications:</strong> {prescription.medications.map(m => m.name).join(", ")}
                  </div>
                  {prescription.share_token && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Sharing enabled</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        disabled
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 