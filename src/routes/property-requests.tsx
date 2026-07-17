import { createFileRoute } from "@tanstack/react-router";
import { useAuth, dashboardForRole } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/property-requests")({
  head: () => ({
    meta: [
      {
        title: "Property Requests — KejaHub",
      },
      {
        name: "description",
        content: "Manage your saved property searches and alerts.",
      },
    ],
  }),
  component: PropertyRequestsPage,
});

function PropertyRequestsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const requests = [
    {
      id: "1",
      name: "3 Bedroom Apartment, Westlands",
      budget: "50,000 - 75,000 KES/month",
      location: "Westlands",
      createdAt: "2 weeks ago",
      matches: 5,
    },
    {
      id: "2",
      name: "Villa with Garden, Karen",
      budget: "100,000 - 150,000 KES/month",
      location: "Karen",
      createdAt: "1 month ago",
      matches: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Saved Searches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Manage your property search alerts
          </p>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md dark:hover:shadow-lg/20 transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {request.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Budget
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {request.budget}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Location
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {request.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Created
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {request.createdAt}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-primary font-medium">
                        {request.matches} new match{request.matches !== 1 ? "es" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No saved searches yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a saved search to get alerts for matching properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
