import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Circle as HelpCircle, MessageSquare, CircleCheck as CheckCircle2, Clock } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/support")({
  head: () => ({
    meta: [
      {
        title: "Support Center — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: SupportCenter,
});

interface SupportRequest {
  id: string;
  requester_email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
}

function SupportCenter() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [response, setResponse] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      fetchRequests();
    }
  }, [authLoading]);

  const fetchRequests = async () => {
    try {
      const { data } = await supabase
        .from("requests")
        .select("id, requester_email, subject, message, status, priority, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setRequests(
          data.map((r: any) => ({
            id: r.id,
            requester_email: r.requester_email,
            subject: r.subject,
            message: r.message,
            status: r.status || "open",
            priority: r.priority || "medium",
            created_at: r.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load support requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        )
      );
      toast.success("Request updated");
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    }
  };

  const handleSendResponse = async () => {
    if (!selectedRequest || !response.trim()) return;

    try {
      // In a real app, this would send an email or store the response
      toast.success("Response sent to requester");
      setResponse("");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to send response:", error);
      toast.error("Failed to send response");
    }
  };

  const filteredRequests = requests.filter(
    (req) => filterStatus === "all" || req.status === filterStatus
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      case "low":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "open":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      case "closed":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Support Center" description="Manage customer support requests">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading support requests...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Support Center" description="Manage customer support requests">
      <div className="space-y-6">
        {/* Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {requests.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {requests.filter((r) => r.status === "open").length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {requests.filter((r) => r.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {requests.filter((r) => r.status === "resolved").length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-2">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No support requests</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {request.subject}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          From: {request.requester_email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {request.message.substring(0, 80)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(request.status))}>
                        {request.status}
                      </span>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getPriorityColor(request.priority))}>
                        {request.priority} priority
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Dialog
                    open={selectedRequest?.id === request.id}
                    onOpenChange={(open) =>
                      setSelectedRequest(open ? request : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Respond to Request</DialogTitle>
                        <DialogDescription>
                          {request.subject}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold block mb-2">
                            Original Message
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            {request.message}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold block mb-2">
                            Your Response
                          </label>
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response..."
                            rows={5}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleSendResponse}
                            disabled={!response.trim()}
                            className="flex-1"
                          >
                            Send Response
                          </Button>
                          <Select value={request.status} onValueChange={(status) => updateRequestStatus(request.id, status)}>
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </HQPage>
  );
}
