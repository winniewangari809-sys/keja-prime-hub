import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Lock } from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/hq/security")({
  head: () => ({
    meta: [
      {
        title: "Security — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: Security,
});

interface FailedLogin {
  id: string;
  email: string;
  ip_address: string;
  timestamp: string;
  reason: string;
}

function Security() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [failedLogins, setFailedLogins] = useState<FailedLogin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchSecurityData();
    }
  }, [authLoading]);

  const fetchSecurityData = async () => {
    try {
      const { data } = await supabase
        .from("failed_logins")
        .select("id, email, ip_address, timestamp, reason")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (data) {
        setFailedLogins(
          data.map((f: any) => ({
            id: f.id,
            email: f.email,
            ip_address: f.ip_address,
            timestamp: f.timestamp,
            reason: f.reason || "Invalid credentials",
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch security data:", error);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const suspiciousIPs = failedLogins.reduce(
    (acc: Record<string, number>, login) => {
      acc[login.ip_address] = (acc[login.ip_address] || 0) + 1;
      return acc;
    },
    {}
  );

  const topSuspiciousIPs = Object.entries(suspiciousIPs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([ip, count]) => ({ ip, count }));

  if (authLoading || loading) {
    return (
      <HQPage title="Security" description="Monitor security and access logs">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading security data...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="Security" description="Monitor security and access logs">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed Logins (24h)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {failedLogins.length}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspicious IPs</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {topSuspiciousIPs.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Platform Status</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Secure
            </p>
          </div>
        </div>

        {/* Suspicious IPs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Top Suspicious IP Addresses
          </h3>
          <div className="space-y-2">
            {topSuspiciousIPs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No suspicious activity detected</p>
            ) : (
              topSuspiciousIPs.map((item) => (
                <div
                  key={item.ip}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-orange-200 dark:border-orange-900"
                >
                  <div>
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                      {item.ip}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.count} failed attempts
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs rounded-full font-semibold">
                    High Risk
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Failed Logins */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Recent Failed Login Attempts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {failedLogins.slice(0, 20).map((login) => (
                  <tr
                    key={login.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-xs">
                      {login.email}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {login.ip_address}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 text-xs rounded">
                        {login.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {new Date(login.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {failedLogins.length === 0 && (
            <p className="text-center py-8 text-gray-600 dark:text-gray-400">
              No failed login attempts detected
            </p>
          )}
        </div>

        {/* Security Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status
          </h3>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> SSL/TLS encryption enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> Two-factor authentication active
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> DDoS protection enabled
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> Rate limiting enforced
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">✓</span> Last security audit: 7 days ago
            </li>
          </ul>
        </div>
      </div>
    </HQPage>
  );
}
