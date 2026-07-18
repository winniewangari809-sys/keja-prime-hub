import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, LogOut, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy state
  const [profilePublic, setProfilePublic] = useState(false);
  const [shareData, setShareData] = useState(true);

  // Account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, full_name, phone, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setFirstName(profileData.first_name || '');
          setFullName(profileData.full_name || '');
          setPhone(profileData.phone || '');
          setAvatarUrl(profileData.avatar_url || '');
        }

        // Load notification preferences from localStorage
        const savedNotifications = localStorage.getItem('settings_notifications');
        if (savedNotifications) {
          const notifs = JSON.parse(savedNotifications);
          setEmailNotifications(notifs.email ?? true);
          setPushNotifications(notifs.push ?? true);
          setMarketingEmails(notifs.marketing ?? false);
        }

        // Load privacy preferences from localStorage
        const savedPrivacy = localStorage.getItem('settings_privacy');
        if (savedPrivacy) {
          const privacy = JSON.parse(savedPrivacy);
          setProfilePublic(privacy.profilePublic ?? false);
          setShareData(privacy.shareData ?? true);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const validatePassword = (value: string) => {
    const errors: string[] = [];
    if (value.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(value)) errors.push('One number');
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: firstName,
          full_name: fullName,
          phone: phone || null,
          avatar_url: avatarUrl || null,
        });

      if (error) {
        toast.error('Failed to save profile');
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || 'Failed to change password');
      } else {
        toast.success('Password changed successfully');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationChange = () => {
    const notifs = {
      email: emailNotifications,
      push: pushNotifications,
      marketing: marketingEmails,
    };
    localStorage.setItem('settings_notifications', JSON.stringify(notifs));
  };

  const handlePrivacyChange = () => {
    const privacy = {
      profilePublic,
      shareData,
    };
    localStorage.setItem('settings_privacy', JSON.stringify(privacy));
  };

  const handlePauseAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ paused: true })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to pause account');
      } else {
        toast.success('Account paused');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteDialogOpen(false);
    toast.info('Please contact support to delete your account');

    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to logout');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container-app h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-app py-12">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white"
                        disabled={profileLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white"
                        disabled={profileLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254..."
                      className="border-slate-600 bg-slate-700 text-white"
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="border-slate-600 bg-slate-700 text-white"
                      disabled={profileLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="border-slate-600 bg-slate-700 text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400">Email cannot be changed</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={profileLoading}
                  >
                    {profileLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password regularly to keep your account secure</CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          validatePassword(e.target.value);
                        }}
                        className="border-slate-600 bg-slate-700 text-white pr-10"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {passwordErrors.length > 0 && (
                      <div className="bg-red-950 border border-red-700 rounded p-2 space-y-1">
                        {passwordErrors.map((error, idx) => (
                          <p key={idx} className="text-xs text-red-200 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="border-slate-600 bg-slate-700 text-white pr-10"
                        disabled={passwordLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={passwordLoading || passwordErrors.length > 0}
                  >
                    {passwordLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive property updates via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={(checked) => {
                      setEmailNotifications(checked);
                      handleNotificationChange();
                    }}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-sm text-slate-400">Receive instant alerts on your device</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={(checked) => {
                      setPushNotifications(checked);
                      handleNotificationChange();
                    }}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Marketing Emails</p>
                    <p className="text-sm text-slate-400">Receive news and special offers</p>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={(checked) => {
                      setMarketingEmails(checked);
                      handleNotificationChange();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="mt-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control how your information is used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Public Profile</p>
                    <p className="text-sm text-slate-400">Allow others to view your profile</p>
                  </div>
                  <Switch
                    checked={profilePublic}
                    onCheckedChange={(checked) => {
                      setProfilePublic(checked);
                      handlePrivacyChange();
                    }}
                  />
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Share Anonymous Data</p>
                    <p className="text-sm text-slate-400">Help us improve with usage analytics</p>
                  </div>
                  <Switch
                    checked={shareData}
                    onCheckedChange={(checked) => {
                      setShareData(checked);
                      handlePrivacyChange();
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle>Pause Account</CardTitle>
                <CardDescription>Temporarily deactivate your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">
                  Your account and data will remain safe, but you won't be able to login until you reactivate it.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={handlePauseAccount}
                >
                  Pause Account
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-red-900/30 bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-red-400">Delete Account</CardTitle>
                <CardDescription>Permanently delete your account and all data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  This action cannot be undone. Please contact our support team to initiate the deletion process.
                </p>
              </CardContent>
              <CardFooter>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-slate-700 bg-slate-800">
                    <DialogHeader>
                      <DialogTitle>Delete Account?</DialogTitle>
                      <DialogDescription>
                        This action is permanent. All your data will be deleted.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-slate-300">
                        To delete your account, please contact our support team. This helps us prevent accidental deletions.
                      </p>
                    </div>
                    <DialogFooter className="gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-slate-600">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                      >
                        Contact Support
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
