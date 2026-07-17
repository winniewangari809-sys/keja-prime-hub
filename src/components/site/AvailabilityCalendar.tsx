import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DateStatus = "available" | "booked" | "maintenance" | "blocked";

interface AvailabilityCalendarProps {
  onStatusChange?: (date: Date, status: DateStatus) => void;
}

const STATUS_COLORS: Record<DateStatus, string> = {
  available: "bg-success text-white hover:bg-success/90",
  booked: "bg-destructive text-white hover:bg-destructive/90",
  maintenance: "bg-warning text-white hover:bg-warning/90",
  blocked: "bg-gray-400 text-white hover:bg-gray-500",
};

const STATUS_LABELS: Record<DateStatus, string> = {
  available: "Available",
  booked: "Booked",
  maintenance: "Maintenance",
  blocked: "Blocked",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvailabilityCalendar({ onStatusChange }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Map<string, DateStatus>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const handleStatusChange = (status: DateStatus) => {
    if (!selectedDate) return;

    const key = getDateKey(selectedDate);
    const newAvailability = new Map(availability);
    newAvailability.set(key, status);
    setAvailability(newAvailability);
    onStatusChange?.(selectedDate, status);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl mb-4">Airbnb Availability</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click on dates to manage your availability
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-display font-bold text-lg">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} />;
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const key = getDateKey(date);
              const status = availability.get(key);
              const isSelected = selectedDate && getDateKey(selectedDate) === key;
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "aspect-square rounded-lg font-semibold text-sm transition-all",
                    status
                      ? STATUS_COLORS[status]
                      : "border-2 border-gray-200 dark:border-gray-700 hover:border-primary",
                    isSelected && !status && "border-primary",
                    isToday && "ring-2 ring-primary"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Editor */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-fit">
          <h4 className="font-display font-bold text-lg mb-4">Status</h4>

          {selectedDate ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Selected Date
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Set Availability
                </p>
                <div className="space-y-2">
                  {(Object.keys(STATUS_COLORS) as DateStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        "w-full px-4 py-2 rounded-lg font-semibold transition-all",
                        STATUS_COLORS[status]
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current: {
                    availability.get(getDateKey(selectedDate))
                      ? STATUS_LABELS[availability.get(getDateKey(selectedDate))!]
                      : "Not set"
                  }
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Select a date to set availability
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(STATUS_COLORS) as DateStatus[]).map(status => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", STATUS_COLORS[status].split(" ")[0])} />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {STATUS_LABELS[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
