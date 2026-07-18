import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, firstName, fullName, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profileFirstName, setProfileFirstName] = useState(firstName || "");
  const [profileFullName, setProfileFullName] = useState(fullName || "");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Security state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem("emailNotifications") === "true";
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    return localStorage.getItem("pushNotifications") === "true";
  });

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(() => {
    return localStorage.getItem("profilePublic") === "true";
  });
  const [showListings, setShowListings] = useState(() => {
    return localStorage.getItem("showListings") === "true";
  });

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (data && !error) {
        setProfileFirstName(data.first_name || "");
        setProfileFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || "");
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Profile Tab Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          first_name: profileFirstName,
          full_name: profileFullName,
          phone,
          avatar_url: avatarUrl,
        });

      if (error) {
        toast.error(error.message || "Failed to save profile");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Security Tab Handlers
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Notification Handlers
  const handleEmailNotificationsChange = (value: boolean) => {
    setEmailNotifications(value);
    localStorage.setItem("emailNotifications", value.toString());
    toast.success(
      value ? "Email notifications enabled" : "Email notifications disabled"
    );
  };

  const handlePushNotificationsChange = (value: boolean) => {
    setPushNotifications(value);
    localStorage.setItem("pushNotifications", value.toString());
    toast.success(
      value ? "Push notifications enabled" : "Push notifications disabled"
    );
  };

  // Privacy Handlers
  const handleProfilePublicChange = (value: boolean) => {
    setProfilePublic(value);
    localStorage.setItem("profilePublic", value.toString());
    toast.success(
      value ? "Profile is now public" : "Profile is now private"
    );
  };

  const handleShowListingsChange = (value: boolean) => {
    setShowListings(value);
    localStorage.setItem("showListings", value.toString());
    toast.success(
      value ? "Your listings are now visible" : "Your listings are now hidden"
    );
  };

  // Account Handlers
  const handlePauseAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ paused: true })
        .eq("id", user.id);

      if (error) {
        toast.error(error.message || "Failed to pause account");
      } else {
        toast.success("Account paused. You can reactivate it anytime.");
        await signOut();
        navigate("/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.success(
      "To delete your account, please contact our support team at support@kejahub.com"
    );
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account and preferences</p>
          </div>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Settings Tabs */}
        <div className="max-w-4xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileFirstName}
                        onChange={(e) => setProfileFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 712 345 678"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <Button type="submit" disabled={loading}>
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={handleEmailNotificationsChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={handlePushNotificationsChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy</CardTitle>
                  <CardDescription>Control your privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-gray-600">Allow others to view your profile</p>
                    </div>
                    <Switch
                      checked={profilePublic}
                      onCheckedChange={handleProfilePublicChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Listings</p>
                      <p className="text-sm text-gray-600">Display your listings publicly</p>
                    </div>
                    <Switch
                      checked={showListings}
                      onCheckedChange={handleShowListingsChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>Manage your account status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Account actions below are not immediately visible but affect your account status.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Pause Account</p>
                      <p className="text-sm text-gray-600 mb-3">
                        Temporarily deactivate your account. You can reactivate it anytime.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handlePauseAccount}
                        disabled={loading}
                        className="text-gray-600"
                      >
                        Pause Account
                      </Button>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Delete Account</p>
                      <p className="text-sm text-gray-600 mb-3">
                        Permanently delete your account. This action cannot be undone.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="text-gray-600">
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. To proceed with account deletion, please contact our support team.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm font-medium mb-2">Support Contact:</p>
                            <p className="text-sm text-gray-600">support@kejahub.com</p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              onClick={handleDeleteAccount}
                              disabled={loading}
                              className="text-gray-600"
                            >
                              Proceed to Support
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
