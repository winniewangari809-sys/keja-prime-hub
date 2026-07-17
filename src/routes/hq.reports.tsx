import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Ban, Eye } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/reports")({
  head: () => ({
    meta: [
      {
        title: "Reports & Trust — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Reports,
});

interface Report {
  id: string;
  reported_item: string;
  reported_type: string;
  reason: string;
  reported_by: string;
  status: string;
  created_at: string;
}

function Reports() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchReports();
    }
  }, [authLoading]);

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from("reports")
        .select("id, reported_item, reported_type, reason, reported_by, status, created_at")
        .order("created_at", { ascending: false });

      if (data) {
        setReports(
          data.map((r: any) => ({
            id: r.id,
            reported_item: r.reported_item,
            reported_type: r.reported_type,
            reason: r.reason,
            reported_by: r.reported_by,
            status: r.status || "pending",
            created_at: r.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);

      if (error) throw error;

      setReports(
        reports.map((r) =>
          r.id === reportId ? { ...r, status } : r
        )
      );
      toast.success("Report updated");
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to update report:", error);
      toast.error("Failed to update report");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "investigated":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "action_taken":
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
      <HQPage title="Reports & Trust" description="Manage reported content and accounts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Reports & Trust" description="Manage reported content and accounts">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reports.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {reports.filter((r) => r.status === "pending").length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Investigated</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {reports.filter((r) => r.status === "investigated").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Action Taken</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {reports.filter((r) => r.status === "action_taken").length}
            </p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Reported Item
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Type
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Reason
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
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                    {report.reported_item.substring(0, 20)}...
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                      {report.reported_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {report.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(report.status))}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Dialog
                      open={selectedReport?.id === report.id}
                      onOpenChange={(open) =>
                        setSelectedReport(open ? report : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review Report</DialogTitle>
                          <DialogDescription>
                            {report.reported_type}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-semibold block mb-2">
                              Item
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.reported_item}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-semibold block mb-2">
                              Reason
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.reason}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-semibold block mb-2">
                              Reported By
                            </label>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {report.reported_by}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                updateReportStatus(report.id, "action_taken")
                              }
                              className="flex-1"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Take Action
                            </Button>
                            <Button
                              onClick={() =>
                                updateReportStatus(report.id, "investigated")
                              }
                              className="flex-1"
                              variant="outline"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Investigated
                            </Button>
                            <Button
                              onClick={() =>
                                updateReportStatus(report.id, "rejected")
                              }
                              className="flex-1"
                              variant="outline"
                            >
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

        {reports.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No reports found</p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
