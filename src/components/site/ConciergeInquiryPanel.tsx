import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WhatsAppButton } from "./WhatsAppButton";
import { MessageSquare, Calendar } from "lucide-react";

interface ConciergeInquiryPanelProps {
  propertyId: string;
  propertyTitle: string;
}

export function ConciergeInquiryPanel({
  propertyId,
  propertyTitle,
}: ConciergeInquiryPanelProps) {
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    preferredDate: "",
    preferredTime: "",
  });

  const handleInterestedClick = async () => {
    if (!user) {
      toast.error("Please sign in to express interest");
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("concierge_requests").insert({
        user_id: user.id,
        property_id: propertyId,
        request_type: "interested",
        status: "pending",
      });
      toast.success("We've noted your interest! Our team will contact you soon.");
    } catch (error) {
      toast.error("Failed to save your interest");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleViewing = async () => {
    if (!user) {
      toast.error("Please sign in to schedule a viewing");
      return;
    }

    if (!scheduleData.preferredDate || !scheduleData.preferredTime) {
      toast.error("Please select both date and time");
      return;
    }

    setSubmitting(true);
    try {
      const viewingDateTime = new Date(
        `${scheduleData.preferredDate}T${scheduleData.preferredTime}`
      );

      await supabase.from("viewings").insert({
        user_id: user.id,
        property_id: propertyId,
        scheduled_at: viewingDateTime.toISOString(),
        status: "scheduled",
      });

      toast.success("Viewing scheduled successfully!");
      setShowScheduleDialog(false);
      setScheduleData({ preferredDate: "", preferredTime: "" });
    } catch (error) {
      toast.error("Failed to schedule viewing");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-primary text-white rounded-lg p-6">
        <h3 className="font-display font-bold text-xl mb-2">Interested In This Property?</h3>
        <p className="opacity-90 mb-4">Let our concierge team help you find your perfect home.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleInterestedClick}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            Express Interest
          </button>
          <button
            onClick={() => setShowScheduleDialog(true)}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            Schedule Viewing
          </button>
        </div>
      </div>

      {/* Schedule Viewing Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h3 className="font-display font-bold text-xl mb-4">Schedule a Viewing</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Date</label>
                <input
                  type="date"
                  value={scheduleData.preferredDate}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      preferredDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Preferred Time</label>
                <input
                  type="time"
                  value={scheduleData.preferredTime}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      preferredTime: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleViewing}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Button */}
      <WhatsAppButton
        variant="card"
        message={`Hi! I'm interested in ${propertyTitle}. Can you provide more details?`}
        label="Chat on WhatsApp"
      />
    </div>
  );
}
