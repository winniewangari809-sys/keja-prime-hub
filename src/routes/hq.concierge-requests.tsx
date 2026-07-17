import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hop as Home, Flame, TrendingUp, Zap, Clock, CircleCheck as CheckCircle2 } from "lucide-react";
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

export const Route = createFileRoute("/hq/concierge-requests")({
  head: () => ({
    meta: [
      {
        title: "Concierge Requests — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: ConciergeRequests,
});

interface HouseHuntingRequest {
  id: string;
  client_name: string;
  client_phone: string;
  budget: number;
  location: string;
  requirements: string;
  lead_score: string;
  status: string;
  created_at: string;
}

const STATUSES = [
  "pending",
  "reviewing",
  "suggested",
  "viewing_scheduled",
  "viewing_completed",
  "negotiation",
  "closed",
];

const LEAD_COLORS: Record<string, string> = {
  hot: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
  warm: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200",
  cold: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
};

function ConciergeRequests() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [requests, setRequests] = useState<HouseHuntingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<HouseHuntingRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      fetchRequests();
    }
  }, [authLoading]);

  const fetchRequests = async () => {
    try {
      const { data } = await supabase
        .from("house_hunting_requests")
        .select("id, client_name, client_phone, budget, location, requirements, status, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setRequests(
          data.map((r: any) => {
            // Simple lead scoring
            const budgetScore = r.budget > 5000000 ? 1 : 0.5;
            const detailsScore = r.requirements?.length > 20 ? 1 : 0.5;
            const leadScore = (budgetScore + detailsScore) / 2;

            let leadType = "cold";
            if (leadScore > 0.8) leadType = "hot";
            else if (leadScore > 0.5) leadType = "warm";

            return {
              id: r.id,
              client_name: r.client_name,
              client_phone: r.client_phone,
              budget: r.budget,
              location: r.location,
              requirements: r.requirements,
              lead_score: leadType,
              status: r.status || "pending",
              created_at: r.created_at,
            };
          })
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
        .from("house_hunting_requests")
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
      case "closed":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "negotiation":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200";
      case "viewing_completed":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "viewing_scheduled":
        return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Concierge Requests" description="Manage house hunting requests">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  const hotLeads = requests.filter((r) => r.lead_score === "hot").length;
  const warmLeads = requests.filter((r) => r.lead_score === "warm").length;
  const coldLeads = requests.filter((r) => r.lead_score === "cold").length;

  return (
    <HQPage title="Concierge Requests" description="Manage house hunting requests">
      <div className="space-y-6">
        {/* Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ").toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Hot Leads</p>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {hotLeads}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Warm Leads</p>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {warmLeads}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Cold Leads</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {coldLeads}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {requests.length}
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="space-y-2">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {request.client_name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {request.location} • Budget: KES {request.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", LEAD_COLORS[request.lead_score] || "")}>
                        {request.lead_score.toUpperCase()} LEAD
                      </span>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(request.status))}>
                        {request.status.replace(/_/g, " ")}
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
                          {request.client_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold block mb-2">
                            Contact
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.client_phone}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold block mb-2">
                            Requirements
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.requirements || "No specific requirements"}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-semibold block mb-2">
                            Update Status
                          </label>
                          <Select
                            value={request.status}
                            onValueChange={(status) =>
                              updateRequestStatus(request.id, status)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace(/_/g, " ").toUpperCase()}
                                </SelectItem>
                              ))}
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
