import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Server,
  Cpu,
  HardDrive,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Types
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Plan {
  id: string;
  businessName: string;
  industry: string;
  tier: string;
  status: string;
  isDemoData: boolean;
  createdAt: string;
  userId?: string;
  userEmail?: string;
}

interface OverviewData {
  totalUsers: number;
  newUsers30d: number;
  activeUsers: number;
  totalPlans: number;
  completedPlans: number;
  demoPlans: number;
  topTools: Array<{ name: string; uses: number }>;
  systemHealth: {
    uptime: number;
    databaseStatus: 'healthy' | 'degraded' | 'down';
  };
}

interface ToolAnalytics {
  byActionType: Array<{ name: string; value: number }>;
  topTools: Array<{ name: string; uses: number }>;
  trends: Array<{ date: string; uses: number }>;
}

interface SystemConfig {
  nodeVersion: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  databaseStatus: 'healthy' | 'degraded' | 'down';
}

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // User management state
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserTier, setEditUserTier] = useState("");
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);

  // Plans management state
  const [plansPage, setPlansPage] = useState(1);
  const [plansTierFilter, setPlansTierFilter] = useState("all");
  const [plansStatusFilter, setPlansStatusFilter] = useState("all");
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  // Check admin status
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Redirect if not admin
  if (!userLoading && (!user || !user.isAdmin)) {
    setLocation("/");
    return null;
  }

  // Overview data
  const { data: overviewData, isLoading: overviewLoading } = useQuery<OverviewData>({
    queryKey: ['/api/admin/analytics/overview'],
    enabled: !!user?.isAdmin,
  });

  // Users data
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[]; total: number; page: number; pageSize: number }>({
    queryKey: ['/api/admin/users', { page: usersPage, search: usersSearch }],
    enabled: !!user?.isAdmin && activeTab === 'users',
  });

  // Plans data
  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: Plan[]; total: number; page: number; pageSize: number }>({
    queryKey: ['/api/admin/plans', { page: plansPage, tier: plansTierFilter, status: plansStatusFilter }],
    enabled: !!user?.isAdmin && activeTab === 'plans',
  });

  // Tool analytics data
  const { data: toolAnalytics, isLoading: toolAnalyticsLoading } = useQuery<ToolAnalytics>({
    queryKey: ['/api/admin/analytics/tools'],
    enabled: !!user?.isAdmin && activeTab === 'analytics',
  });

  // System config data
  const { data: systemConfig, isLoading: systemConfigLoading } = useQuery<SystemConfig>({
    queryKey: ['/api/admin/system/config'],
    enabled: !!user?.isAdmin && activeTab === 'system',
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, tier, isAdmin }: { userId: string; tier: string; isAdmin: boolean }) => {
      await apiRequest('PATCH', `/api/admin/users/${userId}`, { subscriptionTier: tier, isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User updated successfully" });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    },
  });

  // Toggle demo mutation
  const toggleDemoMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest('PATCH', `/api/admin/plans/${planId}/toggle-demo`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({ title: "Plan demo status toggled" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to toggle demo status", description: error.message, variant: "destructive" });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      await apiRequest('DELETE', `/api/admin/plans/${planId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({ title: "Plan deleted successfully" });
      setDeletingPlan(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete plan", description: error.message, variant: "destructive" });
    },
  });

  // Clear cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/admin/system/cache-clear', {});
    },
    onSuccess: () => {
      toast({ title: "Cache cleared successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to clear cache", description: error.message, variant: "destructive" });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (type: 'users' | 'plans') => {
      const response = await apiRequest('POST', '/api/admin/system/export', { type });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ title: "Export completed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold" data-testid="heading-admin-dashboard">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, plans, and system configuration</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2" data-testid="tabs-navigation">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="plans" data-testid="tab-plans">
              <FileText className="h-4 w-4 mr-2" />
              Business Plans
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tool Analytics
            </TabsTrigger>
            <TabsTrigger value="system" data-testid="tab-system">
              <Server className="h-4 w-4 mr-2" />
              System Health
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {overviewLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-12 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : overviewData ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card data-testid="card-total-users">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overviewData.totalUsers}</div>
                      <p className="text-xs text-muted-foreground mt-2">All registered users</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-new-users">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-2">{overviewData.newUsers30d}</div>
                      <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-active-users">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-3">{overviewData.activeUsers}</div>
                      <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-total-plans">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{overviewData.totalPlans}</div>
                      <p className="text-xs text-muted-foreground mt-2">All business plans</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-completed-plans">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-chart-3">{overviewData.completedPlans}</div>
                      <p className="text-xs text-muted-foreground mt-2">Successfully generated</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-demo-plans">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Demo Plans</CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-500">{overviewData.demoPlans}</div>
                      <p className="text-xs text-muted-foreground mt-2">Sample data</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top 10 Tools Chart */}
                <Card data-testid="card-top-tools">
                  <CardHeader>
                    <CardTitle>Top 10 Tools</CardTitle>
                    <CardDescription>Most used tools across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={overviewData.topTools.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="uses" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card data-testid="card-system-health">
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current system status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          <span className="font-medium">Uptime</span>
                        </div>
                        <p className="text-2xl font-bold">{formatUptime(overviewData.systemHealth.uptime)}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          <span className="font-medium">Database Status</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {overviewData.systemHealth.databaseStatus === 'healthy' ? (
                            <CheckCircle className="h-6 w-6 text-chart-3" />
                          ) : overviewData.systemHealth.databaseStatus === 'degraded' ? (
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive" />
                          )}
                          <span className="text-2xl font-bold capitalize">{overviewData.systemHealth.databaseStatus}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No overview data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Users Management</CardTitle>
                    <CardDescription>View and manage all users</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email..."
                        value={usersSearch}
                        onChange={(e) => {
                          setUsersSearch(e.target.value);
                          setUsersPage(1);
                        }}
                        className="pl-8"
                        data-testid="input-users-search"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : usersData && usersData.users.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Subscription Tier</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usersData.users.map((user) => (
                            <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {user.subscriptionTier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.isAdmin ? (
                                  <Badge className="bg-primary">Admin</Badge>
                                ) : (
                                  <Badge variant="secondary">User</Badge>
                                )}
                              </TableCell>
                              <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setEditUserTier(user.subscriptionTier);
                                    setEditUserIsAdmin(user.isAdmin);
                                  }}
                                  data-testid={`button-edit-user-${user.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Showing {((usersPage - 1) * usersData.pageSize) + 1} to {Math.min(usersPage * usersData.pageSize, usersData.total)} of {usersData.total} users
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                          disabled={usersPage === 1}
                          data-testid="button-users-prev"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => p + 1)}
                          disabled={usersPage * usersData.pageSize >= usersData.total}
                          data-testid="button-users-next"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Business Plans Management</CardTitle>
                    <CardDescription>View and manage all business plans</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={plansTierFilter} onValueChange={(value) => { setPlansTierFilter(value); setPlansPage(1); }}>
                      <SelectTrigger className="w-full sm:w-40" data-testid="select-plans-tier">
                        <SelectValue placeholder="Filter by tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={plansStatusFilter} onValueChange={(value) => { setPlansStatusFilter(value); setPlansPage(1); }}>
                      <SelectTrigger className="w-full sm:w-40" data-testid="select-plans-status">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="generating">Generating</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : plansData && plansData.plans.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Owner Email</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plansData.plans.map((plan) => (
                            <TableRow key={plan.id} data-testid={`row-plan-${plan.id}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {plan.businessName}
                                  {plan.isDemoData && (
                                    <Badge variant="outline" className="text-xs">Demo</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{plan.userEmail || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {plan.tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    plan.status === 'completed' ? 'default' :
                                    plan.status === 'failed' ? 'destructive' :
                                    'secondary'
                                  }
                                  className="capitalize"
                                >
                                  {plan.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(plan.createdAt), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleDemoMutation.mutate(plan.id)}
                                    disabled={toggleDemoMutation.isPending}
                                    data-testid={`button-toggle-demo-${plan.id}`}
                                  >
                                    {plan.isDemoData ? 'Remove Demo' : 'Mark Demo'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeletingPlan(plan)}
                                    data-testid={`button-delete-plan-${plan.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-muted-foreground">
                        Showing {((plansPage - 1) * plansData.pageSize) + 1} to {Math.min(plansPage * plansData.pageSize, plansData.total)} of {plansData.total} plans
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlansPage(p => Math.max(1, p - 1))}
                          disabled={plansPage === 1}
                          data-testid="button-plans-prev"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlansPage(p => p + 1)}
                          disabled={plansPage * plansData.pageSize >= plansData.total}
                          data-testid="button-plans-next"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No plans found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tool Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {toolAnalyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : toolAnalytics ? (
              <>
                {/* Tool Usage by Action Type */}
                <Card data-testid="card-action-type-chart">
                  <CardHeader>
                    <CardTitle>Tool Usage by Action Type</CardTitle>
                    <CardDescription>Distribution of tool actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={toolAnalytics.byActionType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {toolAnalytics.byActionType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Tools */}
                <Card data-testid="card-top-tools-analytics">
                  <CardHeader>
                    <CardTitle>Top Tools</CardTitle>
                    <CardDescription>Most frequently used tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={toolAnalytics.topTools.slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={11} angle={-45} textAnchor="end" height={120} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="uses" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Usage Trends */}
                <Card data-testid="card-usage-trends">
                  <CardHeader>
                    <CardTitle>Usage Trends Over Time</CardTitle>
                    <CardDescription>Tool usage over the past 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={toolAnalytics.trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="uses" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system" className="space-y-6">
            {systemConfigLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : systemConfig ? (
              <>
                {/* Environment Information */}
                <Card data-testid="card-environment-info">
                  <CardHeader>
                    <CardTitle>Environment Information</CardTitle>
                    <CardDescription>Server configuration and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Cpu className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Node Version</p>
                            <p className="text-lg font-semibold">{systemConfig.nodeVersion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Uptime</p>
                            <p className="text-lg font-semibold">{formatUptime(systemConfig.uptime)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <HardDrive className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Memory Usage</p>
                            <p className="text-lg font-semibold">
                              {formatBytes(systemConfig.memory.used)} / {formatBytes(systemConfig.memory.total)}
                            </p>
                            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(systemConfig.memory.used / systemConfig.memory.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Database Status */}
                <Card data-testid="card-database-status">
                  <CardHeader>
                    <CardTitle>Database Status</CardTitle>
                    <CardDescription>Database health and connectivity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {systemConfig.databaseStatus === 'healthy' ? (
                          <div className="h-16 w-16 rounded-full bg-chart-3/20 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-chart-3" />
                          </div>
                        ) : systemConfig.databaseStatus === 'degraded' ? (
                          <div className="h-16 w-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-orange-500" />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-destructive" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold capitalize">{systemConfig.databaseStatus}</p>
                        <p className="text-sm text-muted-foreground">
                          {systemConfig.databaseStatus === 'healthy' 
                            ? 'Database is operating normally'
                            : systemConfig.databaseStatus === 'degraded'
                            ? 'Database is experiencing issues'
                            : 'Database is unreachable'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Actions */}
                <Card data-testid="card-system-actions">
                  <CardHeader>
                    <CardTitle>System Actions</CardTitle>
                    <CardDescription>Administrative operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => clearCacheMutation.mutate()}
                        disabled={clearCacheMutation.isPending}
                        data-testid="button-clear-cache"
                        className="w-full"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${clearCacheMutation.isPending ? 'animate-spin' : ''}`} />
                        Clear Cache
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportMutation.mutate('users')}
                        disabled={exportMutation.isPending}
                        data-testid="button-export-users"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Users CSV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => exportMutation.mutate('plans')}
                        disabled={exportMutation.isPending}
                        data-testid="button-export-plans"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Plans CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No system data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent data-testid="dialog-edit-user">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user subscription tier and admin status</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editingUser.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Subscription Tier</Label>
                <Select value={editUserTier} onValueChange={setEditUserTier}>
                  <SelectTrigger id="tier" data-testid="select-edit-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="ultimate">Ultimate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={editUserIsAdmin}
                  onChange={(e) => setEditUserIsAdmin(e.target.checked)}
                  className="h-4 w-4"
                  data-testid="checkbox-edit-admin"
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">Admin User</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingUser) {
                  updateUserMutation.mutate({
                    userId: editingUser.id,
                    tier: editUserTier,
                    isAdmin: editUserIsAdmin,
                  });
                }
              }}
              disabled={updateUserMutation.isPending}
              data-testid="button-save-user"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent data-testid="dialog-delete-plan">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the business plan "{deletingPlan?.businessName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPlan) {
                  deletePlanMutation.mutate(deletingPlan.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
