import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HelpCircle, BookOpen, Video, CheckCircle2 } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

export const Route = createFileRoute("/hq/listing-help")({
  head: () => ({
    meta: [
      {
        title: "Listing Help — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: ListingHelp,
});

const helpRequests = [
  {
    id: "1",
    user: "John Doe",
    issue: "How do I add photos to my listing?",
    category: "media",
    status: "open",
  },
  {
    id: "2",
    user: "Jane Smith",
    issue: "My listing is not showing in search results",
    category: "visibility",
    status: "in_progress",
  },
  {
    id: "3",
    user: "Bob Wilson",
    issue: "How do I edit my listing description?",
    category: "editing",
    status: "resolved",
  },
  {
    id: "4",
    user: "Alice Johnson",
    issue: "How do I set viewing schedules?",
    category: "viewings",
    status: "open",
  },
];

const coachingTips = [
  {
    title: "Create Compelling Property Titles",
    description:
      "Your property title should be clear, concise, and highlight the key features. Include location and property type.",
    tips: [
      "Start with the most attractive feature",
      "Include property type and location",
      "Keep it under 60 characters",
      "Avoid vague descriptions",
    ],
  },
  {
    title: "Write Effective Descriptions",
    description:
      "A well-written description can significantly increase your listing views and inquiries.",
    tips: [
      "Describe the property condition and features",
      "Highlight unique selling points",
      "Use bullet points for easy reading",
      "Include neighborhood details",
      "Be honest about any issues",
    ],
  },
  {
    title: "Optimize Your Photos",
    description:
      "High-quality photos are crucial for attracting buyers and renters to your listing.",
    tips: [
      "Use good natural lighting",
      "Take photos from multiple angles",
      "Include exterior and interior shots",
      "Show the entire property",
      "Avoid cluttered or messy spaces",
    ],
  },
  {
    title: "Set Competitive Pricing",
    description: "Price your property competitively to attract quality inquiries.",
    tips: [
      "Research similar properties in your area",
      "Consider market conditions",
      "Factor in property condition",
      "Be flexible with pricing",
      "Use our pricing guides",
    ],
  },
  {
    title: "Manage Your Viewings",
    description:
      "Effective viewing management helps you convert inquiries into actual transactions.",
    tips: [
      "Schedule viewings at convenient times",
      "Send confirmation to viewers",
      "Prepare the property before viewings",
      "Be present and professional",
      "Follow up after viewings",
    ],
  },
  {
    title: "Boost Your Listing",
    description: "Use our promotion tools to increase visibility and attract more buyers.",
    tips: [
      "Feature your listing for premium visibility",
      "Promote on social media",
      "Respond quickly to inquiries",
      "Keep your listing updated",
      "Use all available tools",
    ],
  },
];

function ListingHelp() {
  const { loading } = useRequireRole(["hq", "admin"]);
  const [activeTab, setActiveTab] = useState("help");

  if (loading) {
    return (
      <HQPage title="Listing Help" description="Support for property listings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Listing Help" description="Support for property listings">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="help">Help Requests</TabsTrigger>
          <TabsTrigger value="coaching">Coaching Tips</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Help Requests */}
        <TabsContent value="help" className="space-y-4">
          <div className="space-y-3">
            {helpRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {request.user}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.issue}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.category === "media"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                          : request.category === "visibility"
                            ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200"
                            : "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                      }`}
                    >
                      {request.category}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.status === "open"
                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                          : request.status === "in_progress"
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                            : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Coaching Tips */}
        <TabsContent value="coaching" className="space-y-4">
          {coachingTips.map((tip, idx) => (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {tip.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {tip.description}
              </p>
              <ul className="space-y-2">
                {tip.tips.map((t, tipIdx) => (
                  <li
                    key={tipIdx}
                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Video Tutorials
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Step-by-step video guides for listing management
                  </p>
                  <button className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Watch Videos →
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    FAQ
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Frequently asked questions about listing features
                  </p>
                  <button className="mt-3 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                    View FAQ →
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Guides & Handbook
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Comprehensive guides for successful listing management
                  </p>
                  <button className="mt-3 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    Read Guide →
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-soft transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Best Practices
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Industry best practices for property selling
                  </p>
                  <button className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                    Learn More →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </HQPage>
  );
}
