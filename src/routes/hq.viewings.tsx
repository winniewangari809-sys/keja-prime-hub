import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, Phone, MapPin, Clock, CircleCheck as CheckCircle2, Circle as XCircle, MoveVertical as MoreVertical, MessageSquare, TriangleAlert as AlertTriangle, Ban, Eye, Trash2, Flag } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage, HQInternalNotes } from "@/components/site";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/viewings")({
  head: () => ({
    meta: [
      {
        title: "Viewing Requests — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: ViewingRequests,
});

interface ViewingRecord {
  id: string;
  property_id: string;
  buyer_id: string;
  buyer_phone: string;
  viewing_date: string;
  viewing_time: string;
  notes: string;
  status: string;
  property_title?: string;
  created_at: string;
}

interface ConciergeRequest {
  id: string;
  requester_name: string;
  requester_phone: string;
  request_type: string;
  details: string;
  status: string;
  created_at: string;
}

function ViewingRequests() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [viewings, setViewings] = useState<ViewingRecord[]>([]);
  const [conciergeRequests, setConciergeRequests] = useState<ConciergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViewing, setSelectedViewing] = useState<ViewingRecord | null>(null);
  const [selectedConcierge, setSelectedConcierge] = useState<ConciergeRequest | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchViewings();
      fetchConciergeRequests();
    }
  }, [authLoading]);

  const fetchViewings = async () => {
    try {
      const { data } = await supabase
        .from("viewings")
        .select("id, property_id, buyer_id, buyer_phone, viewing_date, viewing_time, notes, status, created_at")
        .order("viewing_date", { ascending: true });

      if (data) {
        setViewings(
          data.map((v: any) => ({
            id: v.id,
            property_id: v.property_id,
            buyer_id: v.buyer_id,
            buyer_phone: v.buyer_phone,
            viewing_date: v.viewing_date,
            viewing_time: v.viewing_time,
            notes: v.notes,
            status: v.status || "pending",
            created_at: v.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch viewings:", error);
    }
  };

  const fetchConciergeRequests = async () => {
    try {
      const { data } = await supabase
        .from("concierge_requests")
        .select("id, requester_name, requester_phone, request_type, details, status, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setConciergeRequests(
          data.map((c: any) => ({
            id: c.id,
            requester_name: c.requester_name,
            requester_phone: c.requester_phone,
            request_type: c.request_type,
            details: c.details,
            status: c.status || "pending",
            created_at: c.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch concierge requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateViewingStatus = async (viewingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("viewings")
        .update({ status })
        .eq("id", viewingId);

      if (error) throw error;

      setViewings(
        viewings.map((v) =>
          v.id === viewingId ? { ...v, status } : v
        )
      );
      toast.success("Viewing updated");
      setSelectedViewing(null);
    } catch (error) {
      console.error("Failed to update viewing:", error);
      toast.error("Failed to update viewing");
    }
  };

  const updateConciergeStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("concierge_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      setConciergeRequests(
        conciergeRequests.map((c) =>
          c.id === requestId ? { ...c, status } : c
        )
      );
      toast.success("Request updated");
      setSelectedConcierge(null);
    } catch (error) {
      console.error("Failed to update request:", error);
      toast.error("Failed to update request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "cancelled":
      case "closed":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      case "approved":
      case "resolved":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Viewing Requests" description="Manage property viewings and concierge requests">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Viewing Requests" description="Manage property viewings and concierge requests">
      <div className="space-y-6">
        <Tabs defaultValue="viewings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewings">
              Viewing Requests ({viewings.length})
            </TabsTrigger>
            <TabsTrigger value="concierge">
              Concierge Requests ({conciergeRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Viewings Tab */}
          <TabsContent value="viewings" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Buyer Phone
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {viewings.map((viewing) => (
                    <tr
                      key={viewing.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-semibold">{new Date(viewing.viewing_date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{viewing.viewing_time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {viewing.buyer_phone}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {viewing.notes || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(viewing.status))}>
                          {viewing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Dialog
                          open={selectedViewing?.id === viewing.id}
                          onOpenChange={(open) =>
                            setSelectedViewing(open ? viewing : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Viewing Actions</DialogTitle>
                              <DialogDescription>
                                {new Date(viewing.viewing_date).toLocaleDateString()} at {viewing.viewing_time}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Button
                                onClick={() => updateViewingStatus(viewing.id, "approved")}
                                className="w-full"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => updateViewingStatus(viewing.id, "cancelled")}
                                className="w-full"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => updateViewingStatus(viewing.id, "completed")}
                                className="w-full"
                                variant="outline"
                              >
                                Mark Completed
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No viewing requests</p>
              </div>
            )}
          </TabsContent>

          {/* Concierge Tab */}
          <TabsContent value="concierge" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Requester
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conciergeRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                        {request.requester_name}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {request.requester_phone}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {request.request_type}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(request.status))}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Dialog
                          open={selectedConcierge?.id === request.id}
                          onOpenChange={(open) =>
                            setSelectedConcierge(open ? request : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                              <DialogDescription>
                                {request.requester_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-semibold">Details</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{request.details}</p>
                              </div>
                              <Button
                                onClick={() => updateConciergeStatus(request.id, "resolved")}
                                className="w-full"
                              >
                                Mark Resolved
                              </Button>
                              <Button
                                onClick={() => updateConciergeStatus(request.id, "closed")}
                                className="w-full"
                                variant="outline"
                              >
                                Close
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {conciergeRequests.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No concierge requests</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Internal Notes Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <HQInternalNotes />
        </div>
      </div>
    </HQPage>
  );
}
