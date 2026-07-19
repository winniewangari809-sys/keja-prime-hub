import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, LogOut } from "lucide-react";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    email: localStorage.getItem("notify_email") !== "false",
    sms: localStorage.getItem("notify_sms") !== "false",
    push: localStorage.getItem("notify_push") !== "false",
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: localStorage.getItem("profile_public") !== "false",
    showEmail: localStorage.getItem("show_email") === "true",
    allowMessages: localStorage.getItem("allow_messages") !== "false",
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl,
      });

      if (error) {
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
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

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({ ...prev, [key]: newValue }));
    localStorage.setItem(
      `notify_${key}`,
      newValue ? "true" : "false"
    );
    toast.success("Notification settings updated");
  };

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    const newValue = !privacy[key];
    setPrivacy((prev) => ({ ...prev, [key]: newValue }));
    const storageKey =
      key === "profilePublic"
        ? "profile_public"
        : key === "showEmail"
        ? "show_email"
        : "allow_messages";
    localStorage.setItem(storageKey, newValue ? "true" : "false");
    toast.success("Privacy settings updated");
  };

  const handlePauseAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ paused: true })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to pause account");
        return;
      }

      toast.success("Account paused successfully");
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Account deletion initiated. Please contact support.");
      navigate("/");
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container-app mx-auto px-4 py-8 max-w-2xl">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email (Cannot be changed)</Label>
                    <Input
                      value={user.email || ""}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password regularly for security</CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={passwordLoading}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={passwordLoading}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={passwordLoading}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={passwordLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 8 characters
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Email Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive email alerts</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationToggle("email")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">SMS Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive SMS alerts</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={() => handleNotificationToggle("sms")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Push Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationToggle("push")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Public Profile</Label>
                    <p className="text-sm text-gray-600 mt-1">Make your profile visible to others</p>
                  </div>
                  <Switch
                    checked={privacy.profilePublic}
                    onCheckedChange={() => handlePrivacyToggle("profilePublic")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Show Email</Label>
                    <p className="text-sm text-gray-600 mt-1">Display email on profile</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={() => handlePrivacyToggle("showEmail")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Allow Messages</Label>
                    <p className="text-sm text-gray-600 mt-1">Allow others to message you</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={() => handlePrivacyToggle("allowMessages")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle>Pause Account</CardTitle>
                <CardDescription>Temporarily disable your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Your account will be deactivated. You can reactivate it by logging in again.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                  onClick={handlePauseAccount}
                >
                  Pause Account
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  This action cannot be undone. Please contact support for assistance.
                </p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-700 border-red-200 hover:bg-red-100"
                    >
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete your account? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                      <p className="text-sm text-blue-900">
                        Please contact support@kejahub.com for account deletion assistance.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          const closeButton = e.currentTarget.closest(
                            "[role='dialog']"
                          )?.querySelector("[data-state='open']");
                          if (closeButton) (closeButton as HTMLElement).click();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        Sign Out
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
