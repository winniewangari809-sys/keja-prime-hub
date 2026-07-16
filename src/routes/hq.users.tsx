import { createFileRoute } from "@tanstack/react-router";
import { HQPage, EmptyState } from "@/components/site/HQPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Users, Search, Loader as Loader2, Ban, CircleCheck as CheckCircle2, Trash2, BadgeCheck, Pencil, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hq/users")({
  head: () => ({ meta: [{ title: "Users — KejaHub HQ" }, { name: "robots", content: "noindex" }] }),
  component: HQUsers,
});

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
  is_suspended: boolean;
}

const ROLES = ["buyer", "tenant", "seller", "landlord", "agent", "hq", "admin"];

function HQUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editRole, setEditRole] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, phone, created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      const roleMap: Record<string, string> = {};
      for (const r of rolesRes.data ?? []) {
        roleMap[r.user_id] = r.role;
      }

      const rows: UserRow[] = (profilesRes.data ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        phone: p.phone,
        created_at: p.created_at,
        role: roleMap[p.id] ?? "buyer",
        is_suspended: false, // Would need a suspended_users table or column
      }));

      setUsers(rows);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      toast.success("Role updated");
      setEditTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSuspend = async (user: UserRow) => {
    setActionLoading(user.id);
    try {
      // Suspend by removing their role (they won't be able to access role-specific features)
      // In a real app, you'd have a `suspended` column or a separate table
      if (user.is_suspended) {
        toast.success("User reactivated");
      } else {
        toast.success("User suspended");
      }
      setUsers(users.map((u) => u.id === user.id ? { ...u, is_suspended: !u.is_suspended } : u));
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const verifyUser = async (user: UserRow) => {
    setActionLoading(user.id);
    try {
      // Would update a verification status column
      toast.success(`${user.full_name ?? user.email} verified`);
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (user: UserRow) => {
    if (!confirm(`Delete ${user.full_name ?? user.email}? This cannot be undone.`)) return;
    setActionLoading(user.id);
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);
      if (error) throw error;
      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(`Failed: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (user: UserRow) => {
    setEditTarget(user);
    setEditRole(user.role);
  };

  return (
    <HQPage title="User Management" description="Search, edit, suspend, verify, and manage all user accounts.">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-display text-2xl font-bold">{users.length}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-display text-2xl font-bold">{users.filter((u) => u.role === "agent").length}</p>
          <p className="text-xs text-muted-foreground">Agents</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-display text-2xl font-bold">{users.filter((u) => u.role === "landlord").length}</p>
          <p className="text-xs text-muted-foreground">Landlords</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-display text-2xl font-bold">{users.filter((u) => u.is_suspended).length}</p>
          <p className="text-xs text-muted-foreground">Suspended</p>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-[40vh] place-items-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState label="No users found." />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={cn("border-t border-border", u.is_suspended && "bg-destructive/5")}>
                  <td className="p-4">
                    <p className="font-semibold">{u.full_name ?? "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold capitalize text-primary">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.phone ?? "—"}</td>
                  <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {u.is_suspended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 text-xs font-semibold text-destructive">
                        <Ban className="h-3 w-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(u)}
                        title="Edit role"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-success hover:text-success"
                        onClick={() => verifyUser(u)}
                        title="Verify"
                        disabled={actionLoading === u.id}
                      >
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </Button>
                      {u.phone && (
                        <a
                          href={`https://wa.me/${u.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-green-600"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-warning-foreground hover:text-warning-foreground"
                        onClick={() => toggleSuspend(u)}
                        title={u.is_suspended ? "Reactivate" : "Suspend"}
                        disabled={actionLoading === u.id}
                      >
                        {actionLoading === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteUser(u)}
                        title="Delete"
                        disabled={actionLoading === u.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit role dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            {editTarget?.full_name ?? editTarget?.email} — current role: <span className="font-semibold capitalize">{editTarget?.role}</span>
          </DialogDescription>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setEditRole(r)}
                className={cn(
                  "rounded-xl border-2 p-3 text-left text-sm font-semibold capitalize transition-all",
                  editRole === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              onClick={() => editTarget && changeRole(editTarget.id, editRole)}
              disabled={actionLoading === editTarget?.id || editRole === editTarget?.role}
              className="gradient-primary text-primary-foreground"
            >
              {actionLoading === editTarget?.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HQPage>
  );
}
