import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Hop as Home, Calendar, Users, CircleCheck as CheckCircle2, Circle as XCircle, LogIn, LogOut, MoveVertical as MoreVertical } from "lucide-react";
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

export const Route = createFileRoute("/hq/airbnb-bookings")({
  head: () => ({
    meta: [
      {
        title: "Airbnb Bookings — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: AirbnbBookings,
});

interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  status: string;
  created_at: string;
}

function AirbnbBookings() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading]);

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from("airbnb_bookings")
        .select(
          "id, property_id, guest_name, check_in_date, check_out_date, guests, status, created_at"
        )
        .order("check_in_date", { ascending: true });

      if (data) {
        setBookings(
          data.map((b: any) => ({
            id: b.id,
            property_id: b.property_id,
            guest_name: b.guest_name,
            check_in_date: b.check_in_date,
            check_out_date: b.check_out_date,
            guests: b.guests,
            status: b.status || "confirmed",
            created_at: b.created_at,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("airbnb_bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status } : b
        )
      );
      toast.success("Booking updated");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("Failed to update booking");
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => filterStatus === "all" || booking.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "checked_out":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200";
      case "checked_in":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "confirmed":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Airbnb Bookings" description="Manage Airbnb property bookings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Airbnb Bookings" description="Manage Airbnb property bookings">
      <div className="space-y-6">
        {/* Filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="checked_out">Checked Out</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bookings.length}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {bookings.filter((b) => b.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Checked In</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {bookings.filter((b) => b.status === "checked_in").length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Checked Out</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {bookings.filter((b) => b.status === "checked_out").length}
            </p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Guest
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Check-in/Out
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Guests
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
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                    {booking.guest_name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          to {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {booking.guests}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(booking.status))}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Dialog
                      open={selectedBooking?.id === booking.id}
                      onOpenChange={(open) =>
                        setSelectedBooking(open ? booking : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Booking Actions</DialogTitle>
                          <DialogDescription>
                            {booking.guest_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Button
                            onClick={() =>
                              updateBookingStatus(booking.id, "confirmed")
                            }
                            className="w-full"
                            variant="outline"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            onClick={() =>
                              updateBookingStatus(booking.id, "checked_in")
                            }
                            className="w-full"
                            variant="outline"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Check In
                          </Button>
                          <Button
                            onClick={() =>
                              updateBookingStatus(booking.id, "checked_out")
                            }
                            className="w-full"
                            variant="outline"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Check Out
                          </Button>
                          <Button
                            onClick={() =>
                              updateBookingStatus(booking.id, "cancelled")
                            }
                            className="w-full"
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
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

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
