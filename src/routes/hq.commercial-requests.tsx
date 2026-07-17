import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, Phone, MapPin, CheckCircle2, Clock } from "lucide-react";
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

export const Route = createFileRoute("/hq/commercial-requests")({
  head: () => ({
    meta: [
      {
        title: "Commercial Requests — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: CommercialRequests,
});

interface CommercialRequest {
  id: string;
  requester_name: string;
  requester_phone: string;
  property_type: string;
  request_type: string;
  location: string;
  status: string;
  created_at: string;
}

function CommercialRequests() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [requests, setRequests] = useState<CommercialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CommercialRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      fetchRequests();
    }
  }, [authLoading]);

  const fetchRequests = async () => {
    try {
      const { data } = await supabase
        .from("commercial_requests")
        .select(
          "id, requester_name, requester_phone, property_type, request_type, location, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (data) {
        setRequests(
          data.map((r: any) => ({
            id: r.id,
            requester_name: r.requester_name,
            requester_phone: r.requester_phone,
            property_type: r.property_type,
            request_type: r.request_type,
            location: r.location,
            status: r.status || "pending",
            created_at: r.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("commercial_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        )
      );
      toast.success("Request updated");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    }
  };

  const filteredRequests = requests.filter(
    (req) => filterStatus === "all" || req.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "contacted":
        return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Commercial Requests" description="Manage commercial property requests">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Commercial Requests" description="Manage commercial property requests">
      <div className="space-y-6">
        {/* Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {requests.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Contacted</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {requests.filter((r) => r.status === "contacted").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {requests.filter((r) => r.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {request.requester_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {request.requester_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.location}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {request.property_type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        {request.request_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(request.status))}>
                        {request.status}
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
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage Request</DialogTitle>
                        <DialogDescription>
                          {request.requester_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Button
                          onClick={() =>
                            updateRequestStatus(request.id, "contacted")
                          }
                          className="w-full"
                        >
                          Contact
                        </Button>
                        <Button
                          onClick={() =>
                            updateRequestStatus(request.id, "scheduled")
                          }
                          className="w-full"
                          variant="outline"
                        >
                          Schedule Visit
                        </Button>
                        <Button
                          onClick={() =>
                            updateRequestStatus(request.id, "completed")
                          }
                          className="w-full"
                          variant="outline"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
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
