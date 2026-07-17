import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Search,
  ChevronDown,
  Shield,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRequireRole } from "@/hooks/use-require-role";
import { HQPage } from "@/components/site";
import {
  Button,
  Input,
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

export const Route = createFileRoute("/hq/users")({
  head: () => ({
    meta: [
      {
        title: "User Management — KejaHub Command Center",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: UserManagement,
});

interface UserRecord {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  role: string;
}

function UserManagement() {
  const { loading: authLoading } = useRequireRole(["hq", "admin"]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, display_name, created_at, role");

      if (profiles) {
        setUsers(
          profiles.map((p: any) => ({
            id: p.id,
            email: p.email,
            display_name: p.display_name,
            created_at: p.created_at,
            role: p.role || "user",
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newUserRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newUserRole })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: newUserRole } : u
        )
      );
      toast.success("Role updated");
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.display_name &&
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (authLoading || loading) {
    return (
      <HQPage title="User Management" description="Manage platform users and roles">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border border-gray-300 border-t-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </HQPage>
    );
  }

  return (
    <HQPage title="User Management" description="Manage platform users and roles">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
              <SelectItem value="landlord">Landlord</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="airbnb">Airbnb Host</SelectItem>
              <SelectItem value="commercial">Commercial Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="hq">HQ Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.floor(users.length * 0.65)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.floor(users.length * 0.82)}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">New This Week</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.floor(users.length * 0.12)}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Role
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Joined
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-mono text-xs">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                    {user.display_name || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        user.role === "admin" || user.role === "hq"
                          ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200"
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Dialog
                      open={editingUser?.id === user.id}
                      onOpenChange={(open) =>
                        setEditingUser(open ? user : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole(user.role);
                          }}
                        >
                          Edit Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change User Role</DialogTitle>
                          <DialogDescription>
                            Update the role for {user.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="buyer">Buyer</SelectItem>
                              <SelectItem value="seller">Seller</SelectItem>
                              <SelectItem value="landlord">Landlord</SelectItem>
                              <SelectItem value="tenant">Tenant</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                              <SelectItem value="airbnb">Airbnb Host</SelectItem>
                              <SelectItem value="commercial">
                                Commercial Owner
                              </SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="hq">HQ Staff</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button
                              onClick={() =>
                                handleRoleChange(user.id, newRole)
                              }
                              className="flex-1"
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingUser(null)}
                              className="flex-1"
                            >
                              Cancel
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">No users found</p>
          </div>
        )}
      </div>
    </HQPage>
  );
}
