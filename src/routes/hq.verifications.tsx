import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CircleCheck as CheckCircle2, Circle as XCircle, FileText, User } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/verifications")({
  head: () => ({
    meta: [
      {
        title: "Verifications — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Verifications,
});

interface VerificationRecord {
  id: string;
  user_id: string;
  user_email: string;
  verification_type: string;
  document_url: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
}

function Verifications() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRecord | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchVerifications();
    }
  }, [authLoading]);

  const fetchVerifications = async () => {
    try {
      const { data } = await supabase
        .from("verifications")
        .select("id, user_id, verification_type, document_url, status, created_at, reviewed_at")
        .order("created_at", { ascending: false });

      if (data) {
        setVerifications(
          data.map((v: any) => ({
            id: v.id,
            user_id: v.user_id,
            user_email: `user_${v.user_id.substring(0, 8)}@kejahub.co.ke`,
            verification_type: v.verification_type,
            document_url: v.document_url,
            status: v.status || "pending",
            created_at: v.created_at,
            reviewed_at: v.reviewed_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (verificationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("verifications")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", verificationId);

      if (error) throw error;

      setVerifications(
        verifications.map((v) =>
          v.id === verificationId ? { ...v, status, reviewed_at: new Date().toISOString() } : v
        )
      );
      toast.success(`Verification ${status}`);
      setSelectedVerification(null);
    } catch (error) {
      console.error("Failed to update verification:", error);
      toast.error("Failed to update verification");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Verification Center" description="Review and manage user verifications">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verifications...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Verification Center" description="Review and manage user verifications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {verifications.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {verifications.filter((v) => v.status === "pending").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {verifications.filter((v) => v.status === "approved").length}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {verifications.filter((v) => v.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Verifications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  User
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Type
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((verification) => (
                <tr
                  key={verification.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {verification.user_email}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {verification.verification_type}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(verification.status))}>
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Dialog
                      open={selectedVerification?.id === verification.id}
                      onOpenChange={(open) =>
                        setSelectedVerification(open ? verification : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Verification</DialogTitle>
                          <DialogDescription>
                            {verification.verification_type} for {verification.user_email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {verification.document_url && (
                            <div>
                              <label className="text-sm font-semibold block mb-2">
                                Document
                              </label>
                              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-center h-48 flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Document: {verification.document_url.split("/").pop()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateVerificationStatus(verification.id, "approved")}
                              className="flex-1"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateVerificationStatus(verification.id, "rejected")}
                              className="flex-1"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {verifications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No verifications found</p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
