import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/calendar")({
  head: () => ({
    meta: [
      {
        title: "Master Calendar — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: MasterCalendar,
});

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  client: string;
  location: string;
  type: "viewing" | "airbnb" | "commercial";
}

function MasterCalendar() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
  }, [authLoading]);

  const fetchEvents = async () => {
    try {
      // Fetch viewings
      const { data: viewingData } = await supabase
        .from("viewings")
        .select("id, viewing_date, viewing_time")
        .limit(50);

      // Fetch airbnb bookings
      const { data: airbnbData } = await supabase
        .from("airbnb_bookings")
        .select("id, check_in_date, check_out_date")
        .limit(50);

      // Fetch commercial requests
      const { data: commercialData } = await supabase
        .from("commercial_requests")
        .select("id, visit_date")
        .limit(50);

      const allEvents: Event[] = [];

      // Add viewings
      if (viewingData) {
        viewingData.forEach((v: any, idx: number) => {
          allEvents.push({
            id: `viewing_${v.id}`,
            title: "Property Viewing",
            date: v.viewing_date,
            time: v.viewing_time || "10:00 AM",
            client: `Client ${idx + 1}`,
            location: "Property Location",
            type: "viewing",
          });
        });
      }

      // Add airbnb bookings
      if (airbnbData) {
        airbnbData.forEach((a: any, idx: number) => {
          allEvents.push({
            id: `airbnb_${a.id}`,
            title: "Airbnb Check-in",
            date: a.check_in_date,
            time: "3:00 PM",
            client: `Guest ${idx + 1}`,
            location: "Airbnb Property",
            type: "airbnb",
          });
        });
      }

      // Add commercial requests
      if (commercialData) {
        commercialData.forEach((c: any, idx: number) => {
          allEvents.push({
            id: `commercial_${c.id}`,
            title: "Site Visit",
            date: c.visit_date,
            time: "2:00 PM",
            client: `Business Client ${idx + 1}`,
            location: "Commercial Property",
            type: "commercial",
          });
        });
      }

      setEvents(allEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return events.filter((e) => e.date.startsWith(dateStr));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "viewing":
        return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200";
      case "airbnb":
        return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
      case "commercial":
        return "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <HQPage title="Master Calendar" description="View all platform events">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Master Calendar" description="View all platform events">
      <div className="space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {currentMonth.toLocaleString("en", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                )
              }
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                )
              }
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-semibold text-gray-900 dark:text-gray-100"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                {Array.from({ length: firstDay + (weekIdx === 0 ? 0 : 0) })
                  .fill(null)
                  .slice(weekIdx === 0 ? 0 : -7)
                  .map((_, idx) => (
                    <div
                      key={`empty_${idx}`}
                      className="min-h-24 p-2 bg-gray-50 dark:bg-gray-900"
                    />
                  ))}
                {week.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth.getMonth() === new Date().getMonth() &&
                    currentMonth.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={day}
                      className={`min-h-24 p-2 border-r border-gray-200 dark:border-gray-700 ${
                        isToday
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      } transition-colors`}
                    >
                      <p
                        className={`font-semibold mb-1 ${
                          isToday
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {day}
                      </p>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate font-semibold ${getEventColor(
                              event.type
                            )}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            +{dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {events
              .filter((e) => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 10)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className={`p-2 rounded ${getEventColor(event.type)}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {event.title}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.client}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </HQPage>
  );
}
