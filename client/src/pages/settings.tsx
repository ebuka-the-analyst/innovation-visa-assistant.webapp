import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { 
  User as UserIcon, Bell, Shield, Palette, Trash2, Download, 
  CheckCircle2, AlertTriangle, Moon, Sun, Monitor,
  Mail, Key, LogOut, Save, Clock, Calendar, Zap, Trophy, Target, Newspaper,
  Info, CheckCircle, AlertCircle, Megaphone,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface HistoryNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  sent_at?: string;
  created_at: string;
  action_url?: string;
  action_text?: string;
}

const NOTIF_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  info:         { color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-100 dark:bg-blue-500/20",    label: "Info",         icon: Info },
  success:      { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/20", label: "Update",   icon: CheckCircle },
  warning:      { color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-500/20",   label: "Warning",    icon: AlertTriangle },
  urgent:       { color: "text-red-600 dark:text-red-400",       bg: "bg-red-100 dark:bg-red-500/20",       label: "Urgent",     icon: AlertCircle },
  announcement: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/20", label: "Announcement", icon: Megaphone },
};

function timeAgoSettings(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface NotificationPreferences {
  weeklyDigest: boolean;
  deadlineReminders: boolean;
  breakingNewsAlerts: boolean;
  toolCompletionCelebrations: boolean;
  progressMilestones: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  preferredTime: string;
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [autoSave, setAutoSave] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Read initial tab from URL ?tab= param
  const initialTab = (() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t && ["account", "preferences", "notifications", "privacy"].includes(t)) return t;
    }
    return "account";
  })();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch notification preferences from API
  const { data: notifPrefs, isLoading: notifLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
    enabled: !!user,
  });

  // Fetch notification history (all received broadcasts, including read ones)
  const { data: notifHistory, isLoading: historyLoading } = useQuery<{ notifications: HistoryNotification[] }>({
    queryKey: ['/api/notifications/history'],
    enabled: !!user,
  });

  // Viewing full notification in dialog
  const [viewingNotif, setViewingNotif] = useState<HistoryNotification | null>(null);

  // Delete (dismiss) a notification from history
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({ title: "Announcement removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove announcement", variant: "destructive" });
    },
  });

  // Update notification preferences mutation
  const updateNotifMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      await apiRequest('PUT', '/api/notifications/preferences', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({ title: "Notification preferences updated" });
    },
    onError: () => {
      toast({ title: "Failed to update preferences", variant: "destructive" });
    }
  });

  const handleNotifChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    updateNotifMutation.mutate({ [key]: value });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) setTheme(savedTheme);
    
    const savedAutoSave = localStorage.getItem('autoSaveEnabled');
    if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true');
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    toast({
      title: "Theme Updated",
      description: `Theme set to ${newTheme}`,
    });
  };

  const handleAutoSaveToggle = (enabled: boolean) => {
    setAutoSave(enabled);
    localStorage.setItem('autoSaveEnabled', String(enabled));
    toast({
      title: enabled ? "Auto-save Enabled" : "Auto-save Disabled",
      description: enabled 
        ? "Your progress will be saved automatically" 
        : "Remember to save your work manually",
    });
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    try {
      await apiRequest("POST", "/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    }
  };

  const handleClearSavedData = () => {
    const keys = Object.keys(localStorage);
    const toolKeys = keys.filter(key => 
      key.includes('autosave') || 
      key.includes('Progress') || 
      key.includes('-state') ||
      key.includes('_handoff')
    );
    
    toolKeys.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "Saved Data Cleared",
      description: `Cleared ${toolKeys.length} saved tool sessions`,
    });
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    const exportData = {
      user: {
        email: user?.email,
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "Not set",
        tier: user?.subscriptionTier,
      },
      savedProgress: {} as Record<string, any>,
      exportDate: new Date().toISOString(),
    };
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('autosave') || key.includes('Progress') || key.includes('-state')) {
        try {
          exportData.savedProgress[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          exportData.savedProgress[key] = localStorage.getItem(key);
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa-assistant-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your data has been downloaded",
    });
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2" data-testid="heading-settings">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-testid="tabs-settings">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list-settings">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={user?.email || "Not logged in"} 
                        readOnly 
                        className="bg-muted"
                        data-testid="input-email"
                      />
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "Not set"} 
                      readOnly 
                      className="bg-muted"
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subscription Tier</Label>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                        {user?.subscriptionTier || "Free"}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/pricing" data-testid="link-upgrade">Upgrade Plan</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password"
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    data-testid="input-current-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password"
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    data-testid="input-new-password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    data-testid="input-confirm-password"
                  />
                </div>
                
                <Button 
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  data-testid="button-change-password"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => handleThemeChange('light')}
                      data-testid="button-theme-light"
                    >
                      <Sun className="w-5 h-5" />
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => handleThemeChange('dark')}
                      data-testid="button-theme-dark"
                    >
                      <Moon className="w-5 h-5" />
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => handleThemeChange('system')}
                      data-testid="button-theme-system"
                    >
                      <Monitor className="w-5 h-5" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-save Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work as you type
                    </p>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={handleAutoSaveToggle}
                    data-testid="switch-autosave"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Smart Email Notifications
                </CardTitle>
                <CardDescription>
                  Customize your notification preferences for a personalized visa journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notifLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Weekly Digest */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            Weekly Progress Digest
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Summary of your visa journey progress, completed tools, and next steps
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs?.weeklyDigest ?? true}
                        onCheckedChange={(v) => handleNotifChange('weeklyDigest', v)}
                        disabled={updateNotifMutation.isPending}
                        data-testid="switch-weekly-digest"
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Deadline Reminders */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <Clock className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="flex items-center gap-2">
                            Deadline Reminders
                            <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">Important</Badge>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified 7 days before important visa deadlines
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs?.deadlineReminders ?? true}
                        onCheckedChange={(v) => handleNotifChange('deadlineReminders', v)}
                        disabled={updateNotifMutation.isPending}
                        data-testid="switch-deadline-reminders"
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Breaking News Alerts */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Newspaper className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Breaking News Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Urgent updates about UK visa policy changes from gov.uk
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs?.breakingNewsAlerts ?? true}
                        onCheckedChange={(v) => handleNotifChange('breakingNewsAlerts', v)}
                        disabled={updateNotifMutation.isPending}
                        data-testid="switch-breaking-news"
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Tool Completion Celebrations */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Tool Completion Celebrations</Label>
                          <p className="text-sm text-muted-foreground">
                            Celebrate when you complete tools with encouragement emails
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs?.toolCompletionCelebrations ?? true}
                        onCheckedChange={(v) => handleNotifChange('toolCompletionCelebrations', v)}
                        disabled={updateNotifMutation.isPending}
                        data-testid="switch-tool-completion"
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Progress Milestones */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Trophy className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Progress Milestones & Achievements</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you unlock achievements and reach milestones
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notifPrefs?.progressMilestones ?? true}
                        onCheckedChange={(v) => handleNotifChange('progressMilestones', v)}
                        disabled={updateNotifMutation.isPending}
                        data-testid="switch-milestones"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Digest Schedule Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Digest Schedule
                </CardTitle>
                <CardDescription>
                  Choose when you want to receive your progress digests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={notifPrefs?.digestFrequency || 'weekly'}
                      onValueChange={(v) => handleNotifChange('digestFrequency', v)}
                      disabled={updateNotifMutation.isPending || !notifPrefs?.weeklyDigest}
                    >
                      <SelectTrigger data-testid="select-digest-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Preferred Time</Label>
                    <Select
                      value={notifPrefs?.preferredTime || '09:00'}
                      onValueChange={(v) => handleNotifChange('preferredTime', v)}
                      disabled={updateNotifMutation.isPending || !notifPrefs?.weeklyDigest}
                    >
                      <SelectTrigger data-testid="select-preferred-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM (Recommended)</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!notifPrefs?.weeklyDigest && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Enable Weekly Progress Digest above to customize your schedule
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Platform Announcements History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Platform Announcements
                </CardTitle>
                <CardDescription>
                  Messages sent to you from the UK Innovator Founder Visa Assistant team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : !notifHistory?.notifications?.length ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No announcements yet</p>
                    <p className="text-xs text-muted-foreground/60">Platform updates and announcements will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifHistory.notifications.map(n => {
                      const cfg = NOTIF_TYPE_CONFIG[n.type] ?? NOTIF_TYPE_CONFIG.info;
                      const Icon = cfg.icon;
                      const ts = n.sent_at || n.created_at;
                      return (
                        <div
                          key={n.id}
                          className={`flex gap-3 p-3.5 rounded-lg border transition-colors ${
                            n.is_read ? "bg-background border-border/50" : "bg-primary/5 border-primary/20"
                          }`}
                          data-testid={`announcement-item-${n.id}`}
                        >
                          <div className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full ${cfg.bg}`}>
                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-semibold leading-tight">{n.title}</span>
                              {!n.is_read && (
                                <span className="flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wide">
                                  New
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">{timeAgoSettings(ts)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {n.message.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingNotif(n)}
                                data-testid={`button-view-announcement-${n.id}`}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => dismissMutation.mutate(n.id)}
                                disabled={dismissMutation.isPending}
                                data-testid={`button-delete-announcement-${n.id}`}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                              {(n.action_url || n.action_text) && (
                                <a
                                  href={n.action_url || "#"}
                                  target={n.action_url?.startsWith("http") ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-primary hover:underline ml-auto"
                                >
                                  {n.action_text || "View details"} →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Announcement Dialog */}
            <Dialog open={!!viewingNotif} onOpenChange={(open) => { if (!open) setViewingNotif(null); }}>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                {viewingNotif && (() => {
                  const cfg = NOTIF_TYPE_CONFIG[viewingNotif.type] ?? NOTIF_TYPE_CONFIG.info;
                  const Icon = cfg.icon;
                  const ts = viewingNotif.sent_at || viewingNotif.created_at;
                  const hasHtml = /<[a-z][\s\S]*>/i.test(viewingNotif.message);
                  return (
                    <>
                      <DialogHeader>
                        <div className={`flex items-center gap-2 mb-1`}>
                          <div className={`flex items-center justify-center h-7 w-7 rounded-full ${cfg.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          </div>
                          <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{timeAgoSettings(ts)}</span>
                        </div>
                        <DialogTitle className="text-base leading-snug">{viewingNotif.title}</DialogTitle>
                        <DialogDescription className="sr-only">Platform announcement details</DialogDescription>
                      </DialogHeader>
                      <Separator className="my-3" />
                      {hasHtml ? (
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground"
                          dangerouslySetInnerHTML={{ __html: viewingNotif.message }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{viewingNotif.message}</p>
                      )}
                      {(viewingNotif.action_url || viewingNotif.action_text) && (
                        <div className="mt-4">
                          <a
                            href={viewingNotif.action_url || "#"}
                            target={viewingNotif.action_url?.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                          >
                            <Button variant="default" size="sm">
                              {viewingNotif.action_text || "View details"}
                            </Button>
                          </a>
                        </div>
                      )}
                    </>
                  );
                })()}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Export Your Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download all your saved progress and data
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    data-testid="button-export-data"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Clear Saved Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all locally saved tool data
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleClearSavedData}
                    data-testid="button-clear-data"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-3">Legal Documents</h4>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <a href="/privacy" className="text-primary hover:underline" data-testid="link-privacy">Privacy Policy</a>
                    <span className="text-muted-foreground">•</span>
                    <a href="/terms" className="text-primary hover:underline" data-testid="link-terms">Terms of Service</a>
                    <span className="text-muted-foreground">•</span>
                    <a href="/cookies" className="text-primary hover:underline" data-testid="link-cookies">Cookie Policy</a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sign out of your account on this device
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
