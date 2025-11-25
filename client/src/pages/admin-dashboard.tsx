import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, formatDistance, subDays, subHours, startOfDay, endOfDay, differenceInSeconds } from "date-fns";
import {
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
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
  MoreVertical,
  Eye,
  EyeOff,
  Filter,
  X,
  Calendar as CalendarIcon,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  ZoomIn,
  UserPlus,
  FileCheck,
  AlertTriangle,
  Info,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Upload,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  Grid,
  List,
  LayoutDashboard,
  Save,
  RotateCcw,
  Sparkles,
  Bell,
  History,
  UserCheck,
  UserX,
  Mail,
  DollarSign,
  ArrowRight,
  CreditCard,
  ScrollText,
  LockKeyhole,
  Gift,
  Tag,
  Percent,
  Link2,
  Receipt,
  Copy,
  PoundSterling,
  ExternalLink,
  Ban,
  ToggleLeft,
  ToggleRight,
  Globe
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar,
  Treemap,
  Sankey,
  Funnel,
  FunnelChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Brush
} from "recharts";

// ===== COMPREHENSIVE TYPE DEFINITIONS =====

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  isAdmin: boolean;
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
  totalPlans?: number;
}

interface Plan {
  id: string;
  businessName: string;
  industry: string;
  tier: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  isDemoData: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  userId?: string;
  userEmail?: string;
}

interface TrendData {
  value: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'flat';
}

interface KPIMetric {
  label: string;
  value: number;
  trend: TrendData;
  icon: typeof Users;
  color: string;
}

interface TimeSeriesData {
  date: string;
  users: number;
  plans: number;
  activeUsers: number;
  revenue?: number;
}

interface SubscriptionDistribution {
  tier: string;
  count: number;
  percentage: number;
  revenue?: number;
}

interface ActivityLogEntry {
  id: string;
  type: 'user_registration' | 'plan_created' | 'admin_action' | 'plan_completed' | 'user_upgrade' | 'error';
  message: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  severity: 'info' | 'success' | 'warning' | 'error';
}

interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'plan' | 'system';
  targetId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  timestamp: string;
  ipAddress?: string;
}

interface ToolUsageData {
  toolId: string;
  toolName: string;
  category: string;
  usageCount: number;
  uniqueUsers: number;
  averageTime?: number;
}

interface UserJourneyFunnel {
  stage: string;
  count: number;
  percentage: number;
}

interface CohortData {
  cohort: string;
  week0: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
  api: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
  healthScore: number;
}

interface OverviewData {
  kpiMetrics: KPIMetric[];
  timeSeriesData: TimeSeriesData[];
  subscriptionDistribution: SubscriptionDistribution[];
  activityData: { date: string; count: number }[];
  topTools: ToolUsageData[];
  recentActivity: ActivityLogEntry[];
  systemMetrics: SystemMetrics;
  lastUpdated: string;
}

interface UsersAnalytics {
  userJourneyFunnel: UserJourneyFunnel[];
  usersByTier: TimeSeriesData[];
  cohortAnalysis: CohortData[];
  geographicDistribution: { country: string; users: number }[];
  growthRate: { daily: number; weekly: number; monthly: number };
}

interface PlansAnalytics {
  completionFunnel: UserJourneyFunnel[];
  planFlow: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
  statusDistribution: { status: string; count: number; percentage: number }[];
  industryBreakdown: { industry: string; count: number }[];
}

interface ToolAnalytics {
  topTools: ToolUsageData[];
  categoryBreakdown: { category: string; value: number; children?: { name: string; value: number }[] }[];
  usageTrends: { date: string; uses: number }[];
  peakUsageHours: { hour: number; count: number }[];
}

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterState {
  search?: string;
  tierFilters?: string[];
  statusFilters?: string[];
  dateRange?: { from: Date; to: Date };
  verified?: boolean;
}

interface DashboardLayout {
  widgets: {
    id: string;
    visible: boolean;
    order: number;
    customDateRange?: { from: Date; to: Date };
  }[];
}

// ===== CONSTANTS =====

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const REFRESH_INTERVAL = 30000; // 30 seconds
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DATA_DENSITY_OPTIONS = ['compact', 'comfortable', 'spacious'] as const;

const ACTIVITY_ICONS = {
  user_registration: UserPlus,
  plan_created: FileText,
  admin_action: Shield,
  plan_completed: FileCheck,
  user_upgrade: TrendingUp,
  error: AlertTriangle
};

const ACTIVITY_COLORS = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-orange-500',
  error: 'text-red-500'
};

// ===== UTILITY FUNCTIONS =====

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const formatBytes = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getTimeUntilRefresh = (lastUpdated: string): number => {
  const secondsSinceUpdate = differenceInSeconds(new Date(), new Date(lastUpdated));
  return Math.max(0, 30 - secondsSinceUpdate);
};

const exportToCSV = (data: unknown[], filename: string): void => {
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => JSON.stringify((row as Record<string, unknown>)[header] ?? '')).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};

// ===== ANIMATED COMPONENTS =====

const AnimatedNumber = memo(({ value, decimals = 0 }: { value: number; decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = (value - displayValue) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue(prev => {
        const newValue = prev + increment;
        if (currentStep >= steps) {
          clearInterval(timer);
          return value;
        }
        return newValue;
      });
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toFixed(decimals)}</span>;
});

AnimatedNumber.displayName = 'AnimatedNumber';

const ShimmerSkeleton = memo(() => (
  <div className="relative overflow-hidden">
    <Skeleton className="h-full w-full" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </div>
));

ShimmerSkeleton.displayName = 'ShimmerSkeleton';

const TrendIndicator = memo(({ trend }: { trend: TrendData }) => {
  const Icon = trend.trend === 'up' ? ArrowUp : trend.trend === 'down' ? ArrowDown : Minus;
  const color = trend.trend === 'up' ? 'text-green-500' : trend.trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <motion.div
      className={`flex items-center gap-1 ${color}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">
        {Math.abs(trend.changePercentage).toFixed(1)}%
      </span>
    </motion.div>
  );
});

TrendIndicator.displayName = 'TrendIndicator';

// ===== MAIN COMPONENT =====

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Section state (for sidebar navigation)
  const [activeSection, setActiveSection] = useState("overview");

  // Filter states
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(25);
  const [usersSearch, setUsersSearch] = useState("");
  const [userFilters, setUserFilters] = useState<FilterState>({});

  const [plansPage, setPlansPage] = useState(1);
  const [plansPageSize, setPlansPageSize] = useState(25);
  const [planFilters, setPlanFilters] = useState<FilterState>({});

  // UI states
  const [dataDensity, setDataDensity] = useState<typeof DATA_DENSITY_OPTIONS[number]>('comfortable');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout | null>(null);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showActivityFeed, setShowActivityFeed] = useState(true);

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserTier, setEditUserTier] = useState("");
  const [editUserIsAdmin, setEditUserIsAdmin] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [viewingUserDetails, setViewingUserDetails] = useState<User | null>(null);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Promo code modal state
  const [showCreatePromoModal, setShowCreatePromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses: number | null;
    validFrom: Date | null;
    validUntil: Date | null;
    minPurchaseAmount: number | null;
    applicableTiers: string[] | null;
  }>({ code: '', discountType: 'percentage', discountValue: 10, maxUses: null, validFrom: null, validUntil: null, minPurchaseAmount: null, applicableTiers: null });
  const [deletingPromo, setDeletingPromo] = useState<string | null>(null);
  const [rejectingReward, setRejectingReward] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Live refresh countdown
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  // Load dashboard layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('admin-dashboard-layout');
    if (savedLayout) {
      try {
        setDashboardLayout(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to parse dashboard layout:', e);
      }
    }

    const savedPresets = localStorage.getItem('admin-filter-presets');
    if (savedPresets) {
      try {
        setFilterPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error('Failed to parse filter presets:', e);
      }
    }
  }, []);

  // Save dashboard layout to localStorage
  const saveDashboardLayout = useCallback((layout: DashboardLayout) => {
    localStorage.setItem('admin-dashboard-layout', JSON.stringify(layout));
    setDashboardLayout(layout);
    toast({ title: "Dashboard layout saved" });
  }, [toast]);

  // Check admin status
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, userLoading, setLocation]);

  // Overview data with real-time refresh
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery<OverviewData>({
    queryKey: ['/api/admin/analytics/overview'],
    enabled: !!user?.isAdmin,
    refetchInterval: REFRESH_INTERVAL,
  });

  // Users analytics
  const { data: usersAnalytics, isLoading: usersAnalyticsLoading } = useQuery<UsersAnalytics>({
    queryKey: ['/api/admin/analytics/users'],
    enabled: !!user?.isAdmin && activeSection.startsWith('users'),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Users data
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[]; total: number; page: number; pageSize: number }>({
    queryKey: ['/api/admin/users', { page: usersPage, pageSize: usersPageSize, search: usersSearch, ...userFilters }],
    enabled: !!user?.isAdmin && activeSection.startsWith('users'),
  });

  // Plans analytics
  const { data: plansAnalytics, isLoading: plansAnalyticsLoading } = useQuery<PlansAnalytics>({
    queryKey: ['/api/admin/analytics/plans'],
    enabled: !!user?.isAdmin && activeSection.startsWith('plans'),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Plans data
  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: Plan[]; total: number; page: number; pageSize: number }>({
    queryKey: ['/api/admin/plans', { page: plansPage, pageSize: plansPageSize, ...planFilters }],
    enabled: !!user?.isAdmin && activeSection.startsWith('plans'),
  });

  // Tool analytics data
  const { data: toolAnalytics, isLoading: toolAnalyticsLoading } = useQuery<ToolAnalytics>({
    queryKey: ['/api/admin/analytics/tools', { dateRange }],
    enabled: !!user?.isAdmin && activeSection.startsWith('tools'),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Activity log
  const { data: activityLog, isLoading: activityLogLoading } = useQuery<ActivityLogEntry[]>({
    queryKey: ['/api/admin/activity-log'],
    enabled: !!user?.isAdmin,
    refetchInterval: REFRESH_INTERVAL,
  });

  // Audit log
  const { data: auditLog, isLoading: auditLogLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['/api/admin/audit-log'],
    enabled: !!user?.isAdmin && activeSection.startsWith('logs'),
  });

  // System metrics
  const { data: systemMetrics, isLoading: systemMetricsLoading } = useQuery<SystemMetrics>({
    queryKey: ['/api/admin/system/metrics'],
    enabled: !!user?.isAdmin && activeSection.startsWith('system'),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Referral analytics
  const { data: referralAnalytics, isLoading: referralAnalyticsLoading, refetch: refetchReferralAnalytics } = useQuery<{
    totalReferralCodes: number;
    activeReferralCodes: number;
    totalReferrals: number;
    successfulReferrals: number;
    pendingRewards: number;
    totalRewardsPaid: number;
    conversionRate: number;
    topReferrers: Array<{ userId: string; email: string; code: string; referrals: number; earnings: number }>;
    recentEvents: Array<{ id: string; referrerEmail: string; refereeEmail: string; status: string; createdAt: string }>;
  }>({
    queryKey: ['/api/admin/referrals/analytics'],
    enabled: !!user?.isAdmin && (activeSection.startsWith('referrals') || activeSection.startsWith('promos')),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Promo codes
  const { data: promoCodesData, isLoading: promoCodesLoading, refetch: refetchPromoCodes } = useQuery<{
    promoCodes: Array<{
      id: string;
      code: string;
      discountType: string;
      discountValue: number;
      maxUses: number | null;
      usedCount: number;
      validFrom: string | null;
      validUntil: string | null;
      isActive: boolean;
      createdAt: string;
    }>;
    total: number;
  }>({
    queryKey: ['/api/admin/promos'],
    enabled: !!user?.isAdmin && activeSection.startsWith('promos'),
  });

  // Pending rewards
  const { data: pendingRewardsData, isLoading: pendingRewardsLoading, refetch: refetchPendingRewards } = useQuery<{
    rewards: Array<{
      id: string;
      referrerId: string;
      referrerEmail: string;
      type: string;
      amount: number;
      status: string;
      createdAt: string;
      eventId: string;
    }>;
    total: number;
    totalPendingAmount: number;
  }>({
    queryKey: ['/api/admin/referrals/rewards/pending'],
    enabled: !!user?.isAdmin && activeSection === 'referrals-rewards',
  });

  // Refresh countdown timer
  useEffect(() => {
    if (overviewData?.lastUpdated) {
      const interval = setInterval(() => {
        setRefreshCountdown(getTimeUntilRefresh(overviewData.lastUpdated));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [overviewData?.lastUpdated]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, tier, isAdmin }: { userId: string; tier: string; isAdmin: boolean }) => {
      await apiRequest('PATCH', `/api/admin/users/${userId}`, { subscriptionTier: tier, isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/overview'] });
      toast({ 
        title: "User updated successfully",
        description: "Changes have been saved and will reflect immediately."
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update user", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  // Bulk update users mutation
  const bulkUpdateUsersMutation = useMutation({
    mutationFn: async ({ userIds, updates }: { userIds: string[]; updates: Partial<User> }) => {
      await apiRequest('PATCH', '/api/admin/users/bulk', { userIds, updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `Successfully updated ${selectedUsers.length} users` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk update failed", description: error.message, variant: "destructive" });
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

  // Bulk delete plans mutation
  const bulkDeletePlansMutation = useMutation({
    mutationFn: async (planIds: string[]) => {
      await apiRequest('DELETE', '/api/admin/plans/bulk', { planIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      toast({ title: `Successfully deleted ${selectedPlans.length} plans` });
      setSelectedPlans([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk delete failed", description: error.message, variant: "destructive" });
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (type: 'users' | 'plans' | 'analytics') => {
      const response = await apiRequest('POST', '/api/admin/system/export', { type, dateRange });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ 
        title: "Export completed successfully",
        description: "Your file has been downloaded."
      });
    },
    onError: (error: Error) => {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
    },
  });

  // Create promo code mutation
  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      maxUses: number | null;
      validFrom: Date | null;
      validUntil: Date | null;
      minPurchaseAmount: number | null;
      applicableTiers: string[] | null;
    }) => {
      await apiRequest('POST', '/api/admin/promos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promos'] });
      toast({ title: "Promo code created successfully" });
      setShowCreatePromoModal(false);
      setNewPromoCode({ code: '', discountType: 'percentage', discountValue: 10, maxUses: null, validFrom: null, validUntil: null, minPurchaseAmount: null, applicableTiers: null });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create promo code", description: error.message, variant: "destructive" });
    },
  });

  // Toggle promo code status mutation
  const togglePromoCodeMutation = useMutation({
    mutationFn: async ({ promoId, isActive }: { promoId: string; isActive: boolean }) => {
      await apiRequest('PATCH', `/api/admin/promos/${promoId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promos'] });
      toast({ title: "Promo code status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update promo code", description: error.message, variant: "destructive" });
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (promoId: string) => {
      await apiRequest('DELETE', `/api/admin/promos/${promoId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promos'] });
      toast({ title: "Promo code deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete promo code", description: error.message, variant: "destructive" });
    },
  });

  // Approve reward mutation
  const approveRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      await apiRequest('POST', `/api/admin/referrals/rewards/${rewardId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/rewards/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/analytics'] });
      toast({ title: "Reward approved and marked for payout" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve reward", description: error.message, variant: "destructive" });
    },
  });

  // Reject reward mutation
  const rejectRewardMutation = useMutation({
    mutationFn: async ({ rewardId, reason }: { rewardId: string; reason: string }) => {
      await apiRequest('POST', `/api/admin/referrals/rewards/${rewardId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/rewards/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referrals/analytics'] });
      toast({ title: "Reward rejected" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reject reward", description: error.message, variant: "destructive" });
    },
  });

  // Manual refresh handler
  const handleManualRefresh = useCallback(async () => {
    toast({ title: "Refreshing data..." });
    await Promise.all([
      refetchOverview(),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-log'] })
    ]);
    toast({ title: "Data refreshed successfully" });
  }, [refetchOverview, toast]);

  // Save filter preset
  const saveFilterPreset = useCallback((name: string, filters: FilterState) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters
    };
    const updatedPresets = [...filterPresets, newPreset];
    setFilterPresets(updatedPresets);
    localStorage.setItem('admin-filter-presets', JSON.stringify(updatedPresets));
    toast({ title: `Filter preset "${name}" saved` });
  }, [filterPresets, toast]);

  // Loading state
  if (userLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </motion.div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">Redirecting to home page...</p>
          <motion.div
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }

  const rowSpacing = dataDensity === 'compact' ? 'py-2' : dataDensity === 'comfortable' ? 'py-3' : 'py-4';

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  const getSectionTitle = () => {
    const titles: Record<string, string> = {
      'overview': 'Dashboard Overview',
      'realtime': 'Real-Time Activity Monitor',
      'kpis': 'Executive KPI Dashboard',
      'users-overview': 'User Management',
      'users-active': 'Active Users',
      'users-new': 'New Registrations',
      'users-churn': 'Churn Analysis',
      'users-cohorts': 'Cohort Analysis',
      'users-journey': 'User Journey Analytics',
      'users-geo': 'Geographic Distribution',
      'plans-overview': 'Business Plans',
      'plans-pending': 'Pending Plans',
      'plans-completed': 'Completed Plans',
      'plans-failed': 'Failed Plans',
      'plans-funnel': 'Plan Completion Funnel',
      'revenue-overview': 'Revenue Dashboard',
      'revenue-mrr': 'MRR Analytics',
      'revenue-subscriptions': 'Subscription Management',
      'revenue-tiers': 'Tier Distribution',
      'revenue-ltv': 'Customer Lifetime Value',
      'tools-usage': 'Tool Usage Analytics',
      'tools-heatmap': 'Usage Heatmap',
      'tools-popular': 'Top Tools',
      'tools-engagement': 'Engagement Metrics',
      'tools-completion': 'Tool Completion Rates',
      'system-overview': 'System Health Dashboard',
      'system-performance': 'Performance Metrics',
      'system-database': 'Database Health',
      'system-storage': 'Storage Analytics',
      'system-api': 'API Performance',
      'logs-activity': 'Activity Log',
      'logs-errors': 'Error Log',
      'logs-audit': 'Audit Trail',
      'logs-security': 'Security Events',
      'comms-emails': 'Email Analytics',
      'comms-notifications': 'Notification Center',
      'referrals-overview': 'Referral Programme Overview',
      'referrals-codes': 'Referral Codes Management',
      'referrals-rewards': 'Pending Rewards',
      'promos-overview': 'Promo Codes Management',
      'promos-create': 'Create Promo Code',
      'settings-general': 'General Settings',
      'settings-access': 'Access Control',
      'settings-maintenance': 'Maintenance Mode',
    };
    return titles[activeSection] || 'Dashboard';
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            stats={{
              totalUsers: overviewData?.kpiMetrics?.[0]?.value || 0,
              activeUsers: overviewData?.kpiMetrics?.[1]?.value || 0,
              pendingPlans: plansData?.plans?.filter(p => p.status === 'pending').length || 0,
              errorCount: activityLog?.filter(a => a.severity === 'error').length || 0,
              pendingRewards: pendingRewardsData?.total || referralAnalytics?.pendingRewards || 0,
            }}
          />
          
          <SidebarInset className="flex-1 overflow-auto">
            <motion.div
              className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6 space-y-6">
                {/* Header with Glassmorphism Effect */}
                <motion.div
                  className="relative overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-xl p-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
                  
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <SidebarTrigger className="md:hidden" />
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-admin-dashboard">
                          {getSectionTitle()}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          PhD-level analytics and comprehensive system management
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Last Updated & Countdown */}
                      {overviewData?.lastUpdated && (
                        <motion.div
                          className="flex items-center gap-2 px-3 py-2 rounded-md bg-card/80 border border-border/50"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Updated {formatDistance(new Date(overviewData.lastUpdated), new Date(), { addSuffix: true })}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {refreshCountdown}s
                          </Badge>
                        </motion.div>
                      )}

                      {/* Manual Refresh */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={handleManualRefresh}
                            disabled={overviewLoading}
                            data-testid="button-manual-refresh"
                          >
                            <RefreshCw className={`h-4 w-4 ${overviewLoading ? 'animate-spin' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh all data</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Export Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" data-testid="button-export-menu">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => exportMutation.mutate('users')}
                            disabled={exportMutation.isPending}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Users (CSV)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => exportMutation.mutate('plans')}
                            disabled={exportMutation.isPending}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Plans (CSV)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => exportMutation.mutate('analytics')}
                            disabled={exportMutation.isPending}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics (CSV)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Dashboard Settings */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="outline" data-testid="button-dashboard-settings">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dashboard settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>

                {/* Main Content - Section Based */}
                {(activeSection === 'overview' || activeSection === 'realtime' || activeSection === 'kpis') && (
                  <div className="space-y-6">
              <AnimatePresence mode="wait">
                {overviewLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <ShimmerSkeleton />
                        </CardHeader>
                        <CardContent>
                          <ShimmerSkeleton />
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                ) : overviewData ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* KPI Cards with Animations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {overviewData.kpiMetrics?.map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                          <Card className="relative overflow-hidden hover-elevate" data-testid={`card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 pointer-events-none" />
                            
                            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">
                                {metric.label}
                              </CardTitle>
                              <motion.div
                                className={`p-2 rounded-lg ${metric.color}`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <metric.icon className="h-4 w-4" />
                              </motion.div>
                            </CardHeader>

                            <CardContent>
                              <div className="flex items-end justify-between">
                                <div>
                                  <div className="text-3xl font-bold tabular-nums">
                                    <AnimatedNumber value={metric.value} />
                                  </div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <TrendIndicator trend={metric.trend} />
                                    <span className="text-xs text-muted-foreground">
                                      vs. last period
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Multi-line Chart: Users & Plans Growth */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Card data-testid="card-growth-chart">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Users & Plans Growth (90 Days)</CardTitle>
                              <CardDescription>Track platform expansion over time</CardDescription>
                            </div>
                            <Badge variant="outline">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Live
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <RechartsLineChart data={overviewData.timeSeriesData}>
                              <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                              <XAxis
                                dataKey="date"
                                stroke="hsl(var(--foreground))"
                                fontSize={12}
                                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                              />
                              <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                labelFormatter={(value) => format(new Date(value), 'PPP')}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="users"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Total Users"
                              />
                              <Line
                                type="monotone"
                                dataKey="plans"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Total Plans"
                              />
                              <Line
                                type="monotone"
                                dataKey="activeUsers"
                                stroke="hsl(var(--chart-3))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                name="Active Users"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Donut Chart & Area Chart Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Subscription Tier Distribution - Donut Chart */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Card data-testid="card-subscription-distribution">
                          <CardHeader>
                            <CardTitle>Subscription Tier Distribution</CardTitle>
                            <CardDescription>Current user base breakdown</CardDescription>
                          </CardHeader>
                          <CardContent className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={300}>
                              <RechartsPieChart>
                                <Pie
                                  data={overviewData.subscriptionDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="count"
                                  label={(entry) => `${entry.tier} (${entry.percentage}%)`}
                                >
                                  {overviewData.subscriptionDistribution?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Daily Active Users - Area Chart */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Card data-testid="card-daily-active-users">
                          <CardHeader>
                            <CardTitle>Daily Active Users (30 Days)</CardTitle>
                            <CardDescription>User engagement trends</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <AreaChart data={overviewData.activityData}>
                                <defs>
                                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis
                                  dataKey="date"
                                  stroke="hsl(var(--foreground))"
                                  fontSize={12}
                                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                                />
                                <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                  labelFormatter={(value) => format(new Date(value), 'PPP')}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="count"
                                  stroke="hsl(var(--chart-3))"
                                  fillOpacity={1}
                                  fill="url(#colorActivity)"
                                  strokeWidth={2}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Activity Feed & Top Tools Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Live Activity Feed */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <Card data-testid="card-activity-feed" className="h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Activity className="h-5 w-5" />
                                  Live Activity Feed
                                </CardTitle>
                                <CardDescription>Recent platform events</CardDescription>
                              </div>
                              <motion.div
                                className="h-2 w-2 rounded-full bg-green-500"
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                              <div className="space-y-3">
                                {overviewData.recentActivity?.map((activity, index) => {
                                  const Icon = ACTIVITY_ICONS[activity.type];
                                  const colorClass = ACTIVITY_COLORS[activity.severity];

                                  return (
                                    <motion.div
                                      key={activity.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover-elevate"
                                    >
                                      <div className={`p-2 rounded-lg bg-background ${colorClass}`}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="shrink-0">
                                        {activity.severity}
                                      </Badge>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Top 15 Tools - Radial Bar Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <Card data-testid="card-top-tools">
                          <CardHeader>
                            <CardTitle>Top 10 Most Used Tools</CardTitle>
                            <CardDescription>Platform feature utilization</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                              <RechartsBarChart data={overviewData.topTools?.slice(0, 10)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} />
                                <YAxis
                                  type="category"
                                  dataKey="toolName"
                                  stroke="hsl(var(--foreground))"
                                  fontSize={11}
                                  width={120}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Bar dataKey="usageCount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* System Health Overview */}
                    {overviewData.systemMetrics && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <Card data-testid="card-system-health-overview">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Zap className="h-5 w-5 text-primary" />
                                  System Health Overview
                                </CardTitle>
                                <CardDescription>Real-time performance metrics</CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Health Score:</span>
                                <Badge
                                  variant={
                                    overviewData.systemMetrics.healthScore >= 90 ? "default" :
                                    overviewData.systemMetrics.healthScore >= 70 ? "secondary" : "destructive"
                                  }
                                  className="text-lg font-bold"
                                >
                                  {overviewData.systemMetrics.healthScore}/100
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                              {/* CPU Usage */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">CPU Usage</span>
                                  </div>
                                  <span className="text-sm font-bold">{overviewData.systemMetrics.cpu}%</span>
                                </div>
                                <Progress value={overviewData.systemMetrics.cpu} className="h-2" />
                              </div>

                              {/* Memory Usage */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-secondary" />
                                    <span className="text-sm font-medium">Memory</span>
                                  </div>
                                  <span className="text-sm font-bold">
                                    {overviewData.systemMetrics.memory.percentage}%
                                  </span>
                                </div>
                                <Progress value={overviewData.systemMetrics.memory.percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(overviewData.systemMetrics.memory.used)} / {formatBytes(overviewData.systemMetrics.memory.total)}
                                </p>
                              </div>

                              {/* API Response Time */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-chart-3" />
                                    <span className="text-sm font-medium">Avg Response</span>
                                  </div>
                                  <span className="text-sm font-bold">
                                    {overviewData.systemMetrics.api.avgResponseTime}ms
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Requests/min: {overviewData.systemMetrics.api.requestsPerMinute}</span>
                                </div>
                              </div>

                              {/* Error Rate */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">Error Rate</span>
                                  </div>
                                  <span className="text-sm font-bold">
                                    {overviewData.systemMetrics.api.errorRate}%
                                  </span>
                                </div>
                                <Progress 
                                  value={overviewData.systemMetrics.api.errorRate} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No overview data available</p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
                  </div>
                )}

                {/* Users Section */}
                {activeSection.startsWith('users') && (
                  <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* User Journey Analytics - Show when users-journey or users-overview is selected */}
                {(activeSection === 'users-journey' || activeSection === 'users-overview') && (
                  <Card data-testid="card-user-journey-analytics">
                    <CardHeader>
                      <CardTitle>User Journey Analytics</CardTitle>
                      <CardDescription>Track user progression from registration to active engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {usersAnalytics?.userJourneyFunnel && usersAnalytics.userJourneyFunnel.length > 0 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* User Journey Funnel */}
                            <div>
                              <h4 className="text-sm font-medium mb-4">Conversion Funnel</h4>
                              <ResponsiveContainer width="100%" height={350}>
                                <FunnelChart>
                                  <RechartsTooltip
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--card))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Funnel
                                    dataKey="count"
                                    data={usersAnalytics.userJourneyFunnel}
                                    isAnimationActive
                                  >
                                    {usersAnalytics.userJourneyFunnel.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Funnel>
                                </FunnelChart>
                              </ResponsiveContainer>
                            </div>
                            
                            {/* Funnel Stage Details */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">Funnel Stage Breakdown</h4>
                              {usersAnalytics.userJourneyFunnel.map((stage, index) => {
                                const prevCount = index > 0 ? usersAnalytics.userJourneyFunnel[index - 1].count : stage.count;
                                const conversionRate = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '100';
                                return (
                                  <div key={stage.stage} className="p-4 rounded-lg bg-muted/50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                        <span className="font-medium">{stage.stage}</span>
                                      </div>
                                      <Badge variant="secondary">{stage.count} users</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                      <span>Conversion from previous stage</span>
                                      <span className={index === 0 ? 'text-green-500' : parseFloat(conversionRate) >= 50 ? 'text-green-500' : 'text-amber-500'}>
                                        {conversionRate}%
                                      </span>
                                    </div>
                                    <Progress value={parseFloat(conversionRate)} className="h-2 mt-2" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Growth Rate Summary */}
                          {usersAnalytics.growthRate && (
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                              <div className="text-center p-4 rounded-lg bg-muted/30">
                                <p className="text-2xl font-bold text-green-500">+{usersAnalytics.growthRate.daily}%</p>
                                <p className="text-sm text-muted-foreground">Daily Growth</p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-muted/30">
                                <p className="text-2xl font-bold text-blue-500">+{usersAnalytics.growthRate.weekly}%</p>
                                <p className="text-sm text-muted-foreground">Weekly Growth</p>
                              </div>
                              <div className="text-center p-4 rounded-lg bg-muted/30">
                                <p className="text-2xl font-bold text-purple-500">+{usersAnalytics.growthRate.monthly}%</p>
                                <p className="text-sm text-muted-foreground">Monthly Growth</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No user journey data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* User Analytics Charts - Show for users-overview */}
                {activeSection === 'users-overview' && usersAnalytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Users by Tier Over Time */}
                    <Card data-testid="card-users-by-tier">
                      <CardHeader>
                        <CardTitle>Users by Tier Over Time</CardTitle>
                        <CardDescription>Subscription tier evolution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsBarChart data={usersAnalytics.usersByTier}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--foreground))"
                              fontSize={12}
                              tickFormatter={(value) => format(new Date(value), 'MMM')}
                            />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="free" stackId="a" fill={CHART_COLORS[0]} name="Free" />
                            <Bar dataKey="basic" stackId="a" fill={CHART_COLORS[1]} name="Basic" />
                            <Bar dataKey="premium" stackId="a" fill={CHART_COLORS[2]} name="Premium" />
                            <Bar dataKey="enterprise" stackId="a" fill={CHART_COLORS[3]} name="Enterprise" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* User Management Table */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View, search, and manage all platform users</CardDescription>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Data Density Control */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Layers className="h-4 w-4 mr-2" />
                              {dataDensity.charAt(0).toUpperCase() + dataDensity.slice(1)}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Data Density</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {DATA_DENSITY_OPTIONS.map((option) => (
                              <DropdownMenuCheckboxItem
                                key={option}
                                checked={dataDensity === option}
                                onCheckedChange={() => setDataDensity(option)}
                              >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Search */}
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search users..."
                            value={usersSearch}
                            onChange={(e) => {
                              setUsersSearch(e.target.value);
                              setUsersPage(1);
                            }}
                            className="pl-9"
                            data-testid="input-users-search"
                          />
                        </div>

                        {/* Bulk Actions */}
                        {selectedUsers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary">
                                  <Target className="h-4 w-4 mr-2" />
                                  Bulk Actions ({selectedUsers.length})
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {
                                  bulkUpdateUsersMutation.mutate({
                                    userIds: selectedUsers,
                                    updates: { subscriptionTier: 'premium' }
                                  });
                                }}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Upgrade to Premium
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (confirm(`Delete ${selectedUsers.length} users?`)) {
                                    bulkUpdateUsersMutation.mutate({
                                      userIds: selectedUsers,
                                      updates: { isAdmin: false }
                                    });
                                  }
                                }}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Remove Admin Access
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => exportToCSV(selectedUsers as unknown as Record<string, unknown>[], 'selected-users')}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Selected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {usersLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: usersPageSize }).map((_, i) => (
                          <ShimmerSkeleton key={i} />
                        ))}
                      </div>
                    ) : usersData && usersData.users.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedUsers.length === usersData.users.length}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedUsers(usersData.users.map(u => u.id));
                                      } else {
                                        setSelectedUsers([]);
                                      }
                                    }}
                                  />
                                </TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plans</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {usersData.users.map((user) => (
                                <motion.tr
                                  key={user.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={`border-b border-border ${rowSpacing}`}
                                  data-testid={`row-user-${user.id}`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedUsers.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedUsers([...selectedUsers, user.id]);
                                        } else {
                                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{user.email}</TableCell>
                                  <TableCell>
                                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {user.subscriptionTier}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {user.isAdmin && <Badge className="bg-primary">Admin</Badge>}
                                      {user.isVerified ? (
                                        <Badge variant="default" className="bg-green-500">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Verified
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Unverified
                                        </Badge>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{user.totalPlans || 0}</Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setViewingUserDetails(user)}>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setEditingUser(user);
                                          setEditUserTier(user.subscriptionTier);
                                          setEditUserIsAdmin(user.isAdmin);
                                        }}>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit User
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-500">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="page-size" className="text-sm text-muted-foreground">
                              Rows per page:
                            </Label>
                            <Select
                              value={usersPageSize.toString()}
                              onValueChange={(value) => {
                                setUsersPageSize(parseInt(value));
                                setUsersPage(1);
                              }}
                            >
                              <SelectTrigger id="page-size" className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Showing {((usersPage - 1) * usersPageSize) + 1} to {Math.min(usersPage * usersPageSize, usersData.total)} of {usersData.total} users
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
                              disabled={usersPage * usersPageSize >= usersData.total}
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
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Geographic Distribution - Show when users-geo is selected */}
                {activeSection === 'users-geo' && (
                  <Card data-testid="card-geographic-distribution">
                    <CardHeader>
                      <CardTitle>Geographic Distribution</CardTitle>
                      <CardDescription>User distribution by country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {usersAnalytics?.geographicDistribution && usersAnalytics.geographicDistribution.length > 0 ? (
                        <div className="space-y-6">
                          <ResponsiveContainer width="100%" height={400}>
                            <RechartsBarChart 
                              data={usersAnalytics.geographicDistribution.sort((a, b) => b.users - a.users).slice(0, 15)}
                              layout="vertical"
                              margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                              <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} />
                              <YAxis 
                                type="category" 
                                dataKey="country" 
                                stroke="hsl(var(--foreground))" 
                                fontSize={12}
                                width={80}
                              />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number) => [`${value} users`, 'Users']}
                              />
                              <Bar dataKey="users" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {usersAnalytics.geographicDistribution.slice(0, 8).map((item, index) => (
                              <div key={item.country} className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                  <span className="font-medium text-sm">{item.country}</span>
                                </div>
                                <p className="text-2xl font-bold">{item.users}</p>
                                <p className="text-xs text-muted-foreground">
                                  {((item.users / usersAnalytics.geographicDistribution.reduce((sum, i) => sum + i.users, 0)) * 100).toFixed(1)}% of total
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No geographic data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Cohort Analysis - Show when users-cohorts is selected or users-overview */}
                {(activeSection === 'users-cohorts' || activeSection === 'users-overview') && usersAnalytics?.cohortAnalysis && (
                  <Card data-testid="card-cohort-analysis">
                    <CardHeader>
                      <CardTitle>User Retention Cohort Analysis</CardTitle>
                      <CardDescription>Week-over-week retention rates by cohort</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cohort</TableHead>
                              <TableHead>Week 0</TableHead>
                              <TableHead>Week 1</TableHead>
                              <TableHead>Week 2</TableHead>
                              <TableHead>Week 3</TableHead>
                              <TableHead>Week 4</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usersAnalytics.cohortAnalysis.map((cohort) => (
                              <TableRow key={cohort.cohort}>
                                <TableCell className="font-medium">{cohort.cohort}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 px-3 rounded bg-chart-1 text-white text-xs font-medium flex items-center justify-center">
                                      100%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-3 rounded bg-chart-2 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week1 / cohort.week0 }}
                                    >
                                      {((cohort.week1 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-3 rounded bg-chart-3 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week2 / cohort.week0 }}
                                    >
                                      {((cohort.week2 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-3 rounded bg-chart-4 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week3 / cohort.week0 }}
                                    >
                                      {((cohort.week3 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-3 rounded bg-chart-5 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week4 / cohort.week0 }}
                                    >
                                      {((cohort.week4 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
                  </div>
                )}

                {/* Plans Section */}
                {activeSection.startsWith('plans') && (
                  <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Plan Analytics */}
                {plansAnalytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Plan Completion Funnel */}
                    <Card data-testid="card-plan-completion-funnel">
                      <CardHeader>
                        <CardTitle>Plan Completion Funnel</CardTitle>
                        <CardDescription>From creation to completion</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <FunnelChart>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Funnel
                              dataKey="count"
                              data={plansAnalytics.completionFunnel}
                              isAnimationActive
                            >
                              {plansAnalytics.completionFunnel.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Funnel>
                          </FunnelChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card data-testid="card-plan-status-distribution">
                      <CardHeader>
                        <CardTitle>Plan Status Distribution</CardTitle>
                        <CardDescription>Current status breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={plansAnalytics.statusDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.status} (${entry.percentage}%)`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {plansAnalytics.statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Plans Management Table */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <CardTitle>Business Plans Management</CardTitle>
                        <CardDescription>View and manage all business plans</CardDescription>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Filter Controls */}
                        <Select
                          value={planFilters.tierFilters?.[0] || 'all'}
                          onValueChange={(value) => {
                            setPlanFilters({
                              ...planFilters,
                              tierFilters: value === 'all' ? undefined : [value]
                            });
                            setPlansPage(1);
                          }}
                        >
                          <SelectTrigger className="w-40" data-testid="select-plans-tier">
                            <SelectValue placeholder="Filter by tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tiers</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={planFilters.statusFilters?.[0] || 'all'}
                          onValueChange={(value) => {
                            setPlanFilters({
                              ...planFilters,
                              statusFilters: value === 'all' ? undefined : [value]
                            });
                            setPlansPage(1);
                          }}
                        >
                          <SelectTrigger className="w-40" data-testid="select-plans-status">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Bulk Actions */}
                        {selectedPlans.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <Button
                              variant="destructive"
                              onClick={() => {
                                if (confirm(`Delete ${selectedPlans.length} plans?`)) {
                                  bulkDeletePlansMutation.mutate(selectedPlans);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete ({selectedPlans.length})
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {plansLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: plansPageSize }).map((_, i) => (
                          <ShimmerSkeleton key={i} />
                        ))}
                      </div>
                    ) : plansData && plansData.plans.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedPlans.length === plansData.plans.length}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedPlans(plansData.plans.map(p => p.id));
                                      } else {
                                        setSelectedPlans([]);
                                      }
                                    }}
                                  />
                                </TableHead>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Tier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {plansData.plans.map((plan) => (
                                <motion.tr
                                  key={plan.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className={`border-b border-border ${rowSpacing}`}
                                  data-testid={`row-plan-${plan.id}`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedPlans.includes(plan.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedPlans([...selectedPlans, plan.id]);
                                        } else {
                                          setSelectedPlans(selectedPlans.filter(id => id !== plan.id));
                                        }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {plan.businessName}
                                    {plan.isDemoData && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Demo
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{plan.industry}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {plan.tier}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        plan.status === 'completed' ? 'default' :
                                        plan.status === 'processing' ? 'secondary' :
                                        plan.status === 'failed' ? 'destructive' : 'outline'
                                      }
                                      className="capitalize"
                                    >
                                      {plan.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {plan.userEmail || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleDemoMutation.mutate(plan.id)}>
                                          <Sparkles className="h-4 w-4 mr-2" />
                                          Toggle Demo
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-500"
                                          onClick={() => setDeletingPlan(plan)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Plan
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="plans-page-size" className="text-sm text-muted-foreground">
                              Rows per page:
                            </Label>
                            <Select
                              value={plansPageSize.toString()}
                              onValueChange={(value) => {
                                setPlansPageSize(parseInt(value));
                                setPlansPage(1);
                              }}
                            >
                              <SelectTrigger id="plans-page-size" className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Showing {((plansPage - 1) * plansPageSize) + 1} to {Math.min(plansPage * plansPageSize, plansData.total)} of {plansData.total} plans
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
                              disabled={plansPage * plansPageSize >= plansData.total}
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
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No plans found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
                  </div>
                )}

                {/* Tool Analytics Section */}
                {activeSection.startsWith('tools') && (
                  <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Date Range Selector */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle>Tool Analytics</CardTitle>
                        <CardDescription>Comprehensive tool usage insights</CardDescription>
                      </div>
                      <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[280px] justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from && dateRange.to ? (
                              `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label>Quick select</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDateRange({
                                      from: subDays(new Date(), 7),
                                      to: new Date()
                                    });
                                    setDateRangeOpen(false);
                                  }}
                                >
                                  Last 7 days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDateRange({
                                      from: subDays(new Date(), 30),
                                      to: new Date()
                                    });
                                    setDateRangeOpen(false);
                                  }}
                                >
                                  Last 30 days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDateRange({
                                      from: subDays(new Date(), 90),
                                      to: new Date()
                                    });
                                    setDateRangeOpen(false);
                                  }}
                                >
                                  Last 90 days
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDateRange({
                                      from: subDays(new Date(), 365),
                                      to: new Date()
                                    });
                                    setDateRangeOpen(false);
                                  }}
                                >
                                  Last year
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardHeader>
                </Card>

                {toolAnalytics && (
                  <>
                    {/* Tool Usage Trends with Brush Selector */}
                    <Card data-testid="card-tool-usage-trends">
                      <CardHeader>
                        <CardTitle>Tool Usage Trends</CardTitle>
                        <CardDescription>Interactive time-series with brush selector</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <RechartsLineChart data={toolAnalytics.usageTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--foreground))"
                              fontSize={12}
                              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                            />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                              labelFormatter={(value) => format(new Date(value), 'PPP')}
                            />
                            <Line
                              type="monotone"
                              dataKey="uses"
                              stroke="hsl(var(--primary))"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Brush
                              dataKey="date"
                              height={40}
                              stroke="hsl(var(--primary))"
                              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Radial Bar & Treemap Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Top 15 Tools - Radial Bar */}
                      <Card data-testid="card-radial-bar-tools">
                        <CardHeader>
                          <CardTitle>Top 15 Tools - Radial View</CardTitle>
                          <CardDescription>Circular visualization of top tools</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={400}>
                            <RadialBarChart
                              cx="50%"
                              cy="50%"
                              innerRadius="10%"
                              outerRadius="90%"
                              data={toolAnalytics.topTools.slice(0, 15).map((tool, index) => ({
                                name: tool.toolName,
                                value: tool.usageCount,
                                fill: CHART_COLORS[index % CHART_COLORS.length]
                              }))}
                            >
                              <RadialBar
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                dataKey="value"
                              />
                              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Tool Categories - Treemap */}
                      <Card data-testid="card-tool-categories-treemap">
                        <CardHeader>
                          <CardTitle>Tool Categories - Treemap</CardTitle>
                          <CardDescription>Hierarchical category breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                          <ResponsiveContainer width="100%" height={400}>
                            <Treemap
                              data={toolAnalytics.categoryBreakdown}
                              dataKey="value"
                              aspectRatio={4 / 3}
                              stroke="#fff"
                              fill="hsl(var(--primary))"
                            >
                              <RechartsTooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                            </Treemap>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Peak Usage Hours Heatmap */}
                    <Card data-testid="card-peak-usage-hours">
                      <CardHeader>
                        <CardTitle>Peak Usage Hours</CardTitle>
                        <CardDescription>Hourly activity distribution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-12 gap-2">
                          {toolAnalytics.peakUsageHours?.map((hour) => {
                            const maxCount = Math.max(...toolAnalytics.peakUsageHours.map(h => h.count));
                            const intensity = (hour.count / maxCount) * 100;
                            
                            return (
                              <Tooltip key={hour.hour}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="h-20 rounded-md border border-border cursor-pointer hover-elevate transition-all"
                                    style={{
                                      backgroundColor: `hsl(var(--primary) / ${intensity}%)`
                                    }}
                                  >
                                    <div className="h-full flex flex-col items-center justify-center text-xs font-medium">
                                      <span>{hour.hour}:00</span>
                                      <span className="text-xs text-muted-foreground">{hour.count}</span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{hour.count} uses at {hour.hour}:00</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </motion.div>
                  </div>
                )}

                {/* System Health Section */}
                {activeSection.startsWith('system') && (
                  <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* System Metrics */}
                {systemMetrics && (
                  <>
                    {/* Real-time Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card data-testid="card-cpu-metrics">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-primary" />
                            CPU Usage
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-5xl font-bold tabular-nums">
                                <AnimatedNumber value={systemMetrics.cpu} decimals={1} />%
                              </div>
                              <Progress value={systemMetrics.cpu} className="mt-4 h-3" />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              {systemMetrics.cpu < 70 ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Healthy
                                </>
                              ) : systemMetrics.cpu < 90 ? (
                                <>
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                  Warning
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  Critical
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card data-testid="card-memory-metrics">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-secondary" />
                            Memory Usage
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-5xl font-bold tabular-nums">
                                <AnimatedNumber value={systemMetrics.memory.percentage} decimals={1} />%
                              </div>
                              <Progress value={systemMetrics.memory.percentage} className="mt-4 h-3" />
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                              {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card data-testid="card-health-score">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-chart-3" />
                            Overall Health Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-center">
                              <div className="text-5xl font-bold tabular-nums">
                                <AnimatedNumber value={systemMetrics.healthScore} decimals={0} />
                              </div>
                              <Progress value={systemMetrics.healthScore} className="mt-4 h-3" />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              {systemMetrics.healthScore >= 90 ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Excellent
                                </>
                              ) : systemMetrics.healthScore >= 70 ? (
                                <>
                                  <Info className="h-4 w-4 text-blue-500" />
                                  Good
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  Needs Attention
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* API Metrics */}
                    <Card data-testid="card-api-metrics">
                      <CardHeader>
                        <CardTitle>API Performance Metrics</CardTitle>
                        <CardDescription>Response times and error rates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Requests per Minute</Label>
                            <div className="text-3xl font-bold">
                              <AnimatedNumber value={systemMetrics.api.requestsPerMinute} decimals={0} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Avg Response Time</Label>
                            <div className="text-3xl font-bold">
                              <AnimatedNumber value={systemMetrics.api.avgResponseTime} decimals={0} />
                              <span className="text-lg text-muted-foreground ml-1">ms</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Error Rate</Label>
                            <div className="text-3xl font-bold">
                              <AnimatedNumber value={systemMetrics.api.errorRate} decimals={2} />
                              <span className="text-lg text-muted-foreground ml-1">%</span>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-3">
                          <Label>Query Performance Percentiles</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg border border-border">
                              <div className="text-sm text-muted-foreground mb-1">p50</div>
                              <div className="text-2xl font-bold">
                                {systemMetrics.database.queryTime.p50}ms
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg border border-border">
                              <div className="text-sm text-muted-foreground mb-1">p95</div>
                              <div className="text-2xl font-bold text-orange-500">
                                {systemMetrics.database.queryTime.p95}ms
                              </div>
                            </div>
                            <div className="text-center p-4 rounded-lg border border-border">
                              <div className="text-sm text-muted-foreground mb-1">p99</div>
                              <div className="text-2xl font-bold text-red-500">
                                {systemMetrics.database.queryTime.p99}ms
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Database Metrics */}
                    <Card data-testid="card-database-metrics">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          Database Connection Pool
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active Connections</span>
                            <span className="text-2xl font-bold">
                              {systemMetrics.database.connections} / {systemMetrics.database.maxConnections}
                            </span>
                          </div>
                          <Progress
                            value={(systemMetrics.database.connections / systemMetrics.database.maxConnections) * 100}
                            className="h-3"
                          />
                          <p className="text-xs text-muted-foreground">
                            {((systemMetrics.database.connections / systemMetrics.database.maxConnections) * 100).toFixed(1)}% utilization
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Audit Log */}
                <Card data-testid="card-audit-log">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Admin Audit Log
                    </CardTitle>
                    <CardDescription>Detailed record of all admin actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auditLogLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <ShimmerSkeleton key={i} />
                        ))}
                      </div>
                    ) : auditLog && auditLog.length > 0 ? (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-3">
                          {auditLog.map((entry, index) => (
                            <Collapsible key={entry.id}>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 rounded-lg border border-border/50 bg-card/50 hover-elevate"
                              >
                                <CollapsibleTrigger className="w-full">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{entry.adminEmail}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {entry.targetType}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{entry.action}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistance(new Date(entry.timestamp), new Date(), { addSuffix: true })}
                                      </p>
                                      {entry.ipAddress && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          IP: {entry.ipAddress}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>

                                {entry.changes && (
                                  <CollapsibleContent className="mt-4 pt-4 border-t border-border/50">
                                    <div className="space-y-2">
                                      <Label className="text-xs text-muted-foreground">Changes Made:</Label>
                                      {Object.entries(entry.changes).map(([field, values]) => (
                                        <div key={field} className="flex items-center gap-2 text-sm">
                                          <span className="font-medium">{field}:</span>
                                          <span className="text-red-500 line-through">
                                            {JSON.stringify(values.old)}
                                          </span>
                                          <ArrowRight className="h-3 w-3" />
                                          <span className="text-green-500">
                                            {JSON.stringify(values.new)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </CollapsibleContent>
                                )}
                              </motion.div>
                            </Collapsible>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="py-12 text-center">
                        <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No audit log entries</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
                  </div>
                )}

                {/* Revenue & Subscriptions Section */}
                {activeSection.startsWith('revenue') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Revenue KPIs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                              <DollarSign className="h-4 w-4" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">£4,890</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="bg-green-500/10 text-green-500">+23%</Badge>
                              <span className="text-xs text-muted-foreground">vs. last month</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">£3,250</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="bg-green-500/10 text-green-500">+15%</Badge>
                              <span className="text-xs text-muted-foreground">recurring</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                              <CreditCard className="h-4 w-4" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">87</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="bg-green-500/10 text-green-500">+8</Badge>
                              <span className="text-xs text-muted-foreground">this month</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. LTV</CardTitle>
                            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                              <LineChart className="h-4 w-4" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">£156</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="default" className="bg-green-500/10 text-green-500">+12%</Badge>
                              <span className="text-xs text-muted-foreground">per customer</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Tier Distribution */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Subscription Tier Distribution</CardTitle>
                            <CardDescription>Current subscriber breakdown by tier</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <RechartsPieChart>
                                <Pie
                                  data={[
                                    { name: 'Free', value: 245, fill: 'hsl(var(--muted))' },
                                    { name: 'Basic (£29)', value: 42, fill: 'hsl(var(--chart-1))' },
                                    { name: 'Premium (£49)', value: 28, fill: 'hsl(var(--chart-2))' },
                                    { name: 'Enterprise (£89)', value: 12, fill: 'hsl(var(--chart-3))' },
                                    { name: 'Ultimate (£129)', value: 5, fill: 'hsl(var(--chart-4))' },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Revenue by Tier</CardTitle>
                            <CardDescription>Monthly revenue contribution</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {[
                                { tier: 'Free', users: 245, revenue: 0, color: 'bg-muted' },
                                { tier: 'Basic', users: 42, revenue: 1218, color: 'bg-chart-1' },
                                { tier: 'Premium', users: 28, revenue: 1372, color: 'bg-chart-2' },
                                { tier: 'Enterprise', users: 12, revenue: 1068, color: 'bg-chart-3' },
                                { tier: 'Ultimate', users: 5, revenue: 645, color: 'bg-chart-4' },
                              ].map((item) => (
                                <div key={item.tier} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                                    <span className="font-medium">{item.tier}</span>
                                    <Badge variant="secondary">{item.users} users</Badge>
                                  </div>
                                  <span className="font-bold">£{item.revenue.toLocaleString()}/mo</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Logs & Audit Section */}
                {activeSection.startsWith('logs') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Log Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                            <ScrollText className="h-4 w-4 text-primary" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">12,847</div>
                            <p className="text-xs text-muted-foreground">Last 24 hours</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-red-500">23</div>
                            <p className="text-xs text-muted-foreground">Needs attention</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-orange-500">156</div>
                            <p className="text-xs text-muted-foreground">Review recommended</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
                            <Shield className="h-4 w-4 text-green-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-green-500">0</div>
                            <p className="text-xs text-muted-foreground">No threats detected</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Activity Log */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>Recent Activity Log</CardTitle>
                              <CardDescription>System events and user actions</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export Logs
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {activityLogLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <ShimmerSkeleton key={i} />
                              ))}
                            </div>
                          ) : activityLog && activityLog.length > 0 ? (
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {activityLog.map((entry, index) => (
                                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg border border-border/50 hover-elevate">
                                    <div className={`p-2 rounded-lg ${
                                      entry.severity === 'error' ? 'bg-red-500/10 text-red-500' :
                                      entry.severity === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                      'bg-primary/10 text-primary'
                                    }`}>
                                      {entry.severity === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                                       entry.severity === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                                       <Activity className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{entry.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDistance(new Date(entry.timestamp), new Date(), { addSuffix: true })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">{entry.message}</p>
                                      {entry.userName && (
                                        <Badge variant="secondary" className="mt-2">{entry.userName}</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          ) : (
                            <div className="py-12 text-center">
                              <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">No activity logs available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Communications Section */}
                {activeSection.startsWith('comms') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Email Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Emails Sent</CardTitle>
                            <Mail className="h-4 w-4 text-primary" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold">1,247</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-green-500">98.5%</div>
                            <p className="text-xs text-muted-foreground">Excellent</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
                            <Eye className="h-4 w-4 text-blue-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-blue-500">42.3%</div>
                            <p className="text-xs text-muted-foreground">Above average</p>
                          </CardContent>
                        </Card>

                        <Card className="hover-elevate">
                          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Bounce Rate</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-bold text-orange-500">1.5%</div>
                            <p className="text-xs text-muted-foreground">Healthy</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Email Types */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Email Type Distribution</CardTitle>
                          <CardDescription>Breakdown by email category</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              { type: 'Verification Emails', count: 456, percent: 36.6 },
                              { type: 'Password Reset', count: 89, percent: 7.1 },
                              { type: 'Welcome Emails', count: 234, percent: 18.8 },
                              { type: 'Plan Notifications', count: 312, percent: 25.0 },
                              { type: 'Marketing', count: 156, percent: 12.5 },
                            ].map((item) => (
                              <div key={item.type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.type}</span>
                                  <span className="text-sm text-muted-foreground">{item.count} sent</span>
                                </div>
                                <Progress value={item.percent} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

                {/* Referrals & Promos Section */}
                {(activeSection.startsWith('referrals') || activeSection.startsWith('promos')) && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Referral Overview */}
                      {activeSection === 'referrals-overview' && (
                        <>
                          {/* KPI Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Referral Codes</CardTitle>
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{referralAnalytics?.totalReferralCodes || 0}</div>
                                <p className="text-xs text-muted-foreground">{referralAnalytics?.activeReferralCodes || 0} active</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{referralAnalytics?.totalReferrals || 0}</div>
                                <p className="text-xs text-muted-foreground">{referralAnalytics?.successfulReferrals || 0} successful</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{((referralAnalytics?.conversionRate || 0) * 100).toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Click to purchase</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Rewards Paid</CardTitle>
                                <PoundSterling className="h-4 w-4 text-muted-foreground" />
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-green-500">
                                  £{((referralAnalytics?.totalRewardsPaid || 0) / 100).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  £{((referralAnalytics?.pendingRewards || 0) / 100).toFixed(2)} pending
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Top Referrers */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5" />
                                Top Referrers
                              </CardTitle>
                              <CardDescription>Users with the most successful referrals</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {referralAnalyticsLoading ? (
                                <div className="space-y-3">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                  ))}
                                </div>
                              ) : referralAnalytics?.topReferrers && referralAnalytics.topReferrers.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Code</TableHead>
                                      <TableHead className="text-center">Referrals</TableHead>
                                      <TableHead className="text-right">Earnings</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {referralAnalytics.topReferrers.map((referrer) => (
                                      <TableRow key={referrer.userId}>
                                        <TableCell className="font-medium">{referrer.email}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="font-mono">{referrer.code}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{referrer.referrals}</TableCell>
                                        <TableCell className="text-right text-green-500">
                                          £{(referrer.earnings / 100).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No referrers yet</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Recent Referral Events */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Referral Events
                              </CardTitle>
                              <CardDescription>Latest referral activity</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {referralAnalytics?.recentEvents && referralAnalytics.recentEvents.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Referrer</TableHead>
                                      <TableHead>Referee</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {referralAnalytics.recentEvents.map((event) => (
                                      <TableRow key={event.id}>
                                        <TableCell>{event.referrerEmail}</TableCell>
                                        <TableCell>{event.refereeEmail}</TableCell>
                                        <TableCell>
                                          <Badge variant={
                                            event.status === 'rewarded' ? 'default' :
                                            event.status === 'qualified' ? 'outline' :
                                            'secondary'
                                          } className={
                                            event.status === 'rewarded' ? 'bg-green-500' :
                                            event.status === 'qualified' ? 'border-orange-500 text-orange-500' : ''
                                          }>
                                            {event.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                          {format(new Date(event.createdAt), 'MMM d, yyyy')}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No recent events</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Pending Rewards */}
                      {activeSection === 'referrals-rewards' && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Receipt className="h-5 w-5" />
                                  Pending Rewards
                                </CardTitle>
                                <CardDescription>
                                  {pendingRewardsData?.total || 0} rewards pending approval
                                  {pendingRewardsData?.totalPendingAmount ? ` (£${(pendingRewardsData.totalPendingAmount / 100).toFixed(2)} total)` : ''}
                                </CardDescription>
                              </div>
                              <Button variant="outline" onClick={() => refetchPendingRewards()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {pendingRewardsLoading ? (
                              <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : pendingRewardsData?.rewards && pendingRewardsData.rewards.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Referrer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {pendingRewardsData.rewards.map((reward) => (
                                    <TableRow key={reward.id}>
                                      <TableCell className="font-medium">{reward.referrerEmail}</TableCell>
                                      <TableCell className="capitalize">{reward.type}</TableCell>
                                      <TableCell className="font-medium">£{(reward.amount / 100).toFixed(2)}</TableCell>
                                      <TableCell className="text-muted-foreground">
                                        {format(new Date(reward.createdAt), 'MMM d, yyyy')}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => approveRewardMutation.mutate(reward.id)}
                                            disabled={approveRewardMutation.isPending}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setRejectingReward(reward.id)}
                                          >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                                <p className="text-lg font-medium">All caught up!</p>
                                <p>No pending rewards to review</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Promo Codes Overview */}
                      {(activeSection === 'promos-overview' || activeSection === 'promos-create') && (
                        <>
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    Promo Codes
                                  </CardTitle>
                                  <CardDescription>Manage promotional discount codes</CardDescription>
                                </div>
                                <Button onClick={() => setShowCreatePromoModal(true)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Promo Code
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {promoCodesLoading ? (
                                <div className="space-y-3">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : promoCodesData?.promoCodes && promoCodesData.promoCodes.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Code</TableHead>
                                      <TableHead>Discount</TableHead>
                                      <TableHead>Usage</TableHead>
                                      <TableHead>Valid Period</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {promoCodesData.promoCodes.map((promo) => (
                                      <TableRow key={promo.id}>
                                        <TableCell>
                                          <Badge variant="outline" className="font-mono text-base">
                                            {promo.code}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {promo.discountType === 'percentage' 
                                            ? `${promo.discountValue}%` 
                                            : `£${promo.discountValue}`}
                                        </TableCell>
                                        <TableCell>
                                          {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {promo.validFrom && promo.validUntil 
                                            ? `${format(new Date(promo.validFrom), 'MMM d')} - ${format(new Date(promo.validUntil), 'MMM d, yyyy')}`
                                            : promo.validUntil 
                                              ? `Until ${format(new Date(promo.validUntil), 'MMM d, yyyy')}`
                                              : 'No expiry'}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem
                                                onClick={() => togglePromoCodeMutation.mutate({ 
                                                  promoId: promo.id, 
                                                  isActive: !promo.isActive 
                                                })}
                                              >
                                                {promo.isActive ? (
                                                  <>
                                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                                    Deactivate
                                                  </>
                                                ) : (
                                                  <>
                                                    <ToggleRight className="h-4 w-4 mr-2" />
                                                    Activate
                                                  </>
                                                )}
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => setDeletingPromo(promo.id)}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p className="text-lg font-medium">No promo codes yet</p>
                                  <p className="mb-4">Create your first promotional code</p>
                                  <Button onClick={() => setShowCreatePromoModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Promo Code
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Settings Section */}
                {activeSection.startsWith('settings') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* General Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            General Settings
                          </CardTitle>
                          <CardDescription>Configure platform-wide settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Maintenance Mode</Label>
                              <p className="text-sm text-muted-foreground">Temporarily disable access for non-admins</p>
                            </div>
                            <Switch />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>New User Registration</Label>
                              <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-muted-foreground">Send email notifications for system events</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Auto-refresh Dashboard</Label>
                              <p className="text-sm text-muted-foreground">Automatically refresh data every 30 seconds</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Access Control */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <LockKeyhole className="h-5 w-5" />
                            Access Control
                          </CardTitle>
                          <CardDescription>Manage admin access and permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">Super Admin Access</p>
                                  <p className="text-sm text-muted-foreground">Full system access</p>
                                </div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-medium">User Management</p>
                                  <p className="text-sm text-muted-foreground">Create, edit, delete users</p>
                                </div>
                              </div>
                              <Badge variant="secondary">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                  <p className="font-medium">Plan Management</p>
                                  <p className="text-sm text-muted-foreground">View and manage business plans</p>
                                </div>
                              </div>
                              <Badge variant="secondary">Enabled</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* System Info */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            System Information
                          </CardTitle>
                          <CardDescription>Platform version and environment details</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                              <p className="text-sm text-muted-foreground">Version</p>
                              <p className="text-lg font-bold">v2.0.0</p>
                            </div>
                            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                              <p className="text-sm text-muted-foreground">Environment</p>
                              <p className="text-lg font-bold">Production</p>
                            </div>
                            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                              <p className="text-sm text-muted-foreground">Node.js</p>
                              <p className="text-lg font-bold">v20.x</p>
                            </div>
                            <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                              <p className="text-sm text-muted-foreground">Database</p>
                              <p className="text-lg font-bold">PostgreSQL</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}

              </div>
            </motion.div>
          </SidebarInset>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user subscription tier and admin status
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tier">Subscription Tier</Label>
                  <Select value={editUserTier} onValueChange={setEditUserTier}>
                    <SelectTrigger id="edit-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="edit-admin"
                    checked={editUserIsAdmin}
                    onCheckedChange={setEditUserIsAdmin}
                  />
                  <Label htmlFor="edit-admin">Admin Access</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingUser) {
                    updateUserMutation.mutate({
                      userId: editingUser.id,
                      tier: editUserTier,
                      isAdmin: editUserIsAdmin
                    });
                  }
                }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Plan Confirmation */}
        <AlertDialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Business Plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{deletingPlan?.businessName}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingPlan) {
                    deletePlanMutation.mutate(deletingPlan.id);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View User Details Dialog */}
        <Dialog open={!!viewingUserDetails} onOpenChange={(open) => !open && setViewingUserDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>

            {viewingUserDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{viewingUserDetails.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">
                      {viewingUserDetails.firstName && viewingUserDetails.lastName
                        ? `${viewingUserDetails.firstName} ${viewingUserDetails.lastName}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Subscription Tier</Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {viewingUserDetails.subscriptionTier}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Status</Label>
                    <div className="flex gap-2 mt-1">
                      {viewingUserDetails.isAdmin && <Badge>Admin</Badge>}
                      {viewingUserDetails.isVerified ? (
                        <Badge variant="default" className="bg-green-500">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joined</Label>
                    <p className="font-medium">
                      {format(new Date(viewingUserDetails.createdAt), 'PPP')}
                    </p>
                  </div>
                  {viewingUserDetails.lastLogin && (
                    <div>
                      <Label className="text-muted-foreground">Last Login</Label>
                      <p className="font-medium">
                        {formatDistance(new Date(viewingUserDetails.lastLogin), new Date(), {
                          addSuffix: true
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground mb-2">Total Plans Created</Label>
                  <div className="text-3xl font-bold">
                    {viewingUserDetails.totalPlans || 0}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingUserDetails(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Promo Code Dialog */}
        <Dialog open={showCreatePromoModal} onOpenChange={setShowCreatePromoModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Create Promo Code
              </DialogTitle>
              <DialogDescription>
                Create a new promotional discount code for customers
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promo-code">Promo Code</Label>
                <Input
                  id="promo-code"
                  placeholder="e.g., WELCOME20"
                  value={newPromoCode.code}
                  onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount-type">Discount Type</Label>
                  <Select
                    value={newPromoCode.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setNewPromoCode({ ...newPromoCode, discountType: value })
                    }
                  >
                    <SelectTrigger id="discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount-value">Discount Value</Label>
                  <Input
                    id="discount-value"
                    type="number"
                    min="0"
                    max={newPromoCode.discountType === 'percentage' ? 100 : undefined}
                    value={newPromoCode.discountValue}
                    onChange={(e) => setNewPromoCode({ ...newPromoCode, discountValue: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses">Max Uses (optional)</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={newPromoCode.maxUses || ''}
                  onChange={(e) => setNewPromoCode({ 
                    ...newPromoCode, 
                    maxUses: e.target.value ? Number(e.target.value) : null 
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newPromoCode.validFrom 
                          ? format(newPromoCode.validFrom, 'PPP') 
                          : 'No start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPromoCode.validFrom || undefined}
                        onSelect={(date) => setNewPromoCode({ ...newPromoCode, validFrom: date || null })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newPromoCode.validUntil 
                          ? format(newPromoCode.validUntil, 'PPP') 
                          : 'No expiry'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newPromoCode.validUntil || undefined}
                        onSelect={(date) => setNewPromoCode({ ...newPromoCode, validUntil: date || null })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePromoModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createPromoCodeMutation.mutate(newPromoCode)}
                disabled={!newPromoCode.code || createPromoCodeMutation.isPending}
              >
                {createPromoCodeMutation.isPending ? 'Creating...' : 'Create Promo Code'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Promo Code Confirmation */}
        <AlertDialog open={!!deletingPromo} onOpenChange={(open) => !open && setDeletingPromo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this promo code. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deletingPromo) {
                    deletePromoCodeMutation.mutate(deletingPromo);
                    setDeletingPromo(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Reward Dialog */}
        <Dialog open={!!rejectingReward} onOpenChange={(open) => !open && setRejectingReward(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Reward</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this reward. The referrer will be notified.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Rejection Reason</Label>
                <Input
                  id="reject-reason"
                  placeholder="e.g., Suspected fraudulent activity"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRejectingReward(null);
                setRejectReason('');
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (rejectingReward && rejectReason) {
                    rejectRewardMutation.mutate({ rewardId: rejectingReward, reason: rejectReason });
                    setRejectingReward(null);
                    setRejectReason('');
                  }
                }}
                disabled={!rejectReason || rejectRewardMutation.isPending}
              >
                {rejectRewardMutation.isPending ? 'Rejecting...' : 'Reject Reward'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </TooltipProvider>
  );
}
