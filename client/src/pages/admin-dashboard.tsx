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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Globe,
  LogOut,
  Lightbulb,
  Crown,
  Building,
  Star
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "wouter";
import logoLightImg from "@assets/official_logo.png";
import logoDarkImg from "@assets/logo_dark.png";
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
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise' | 'ultimate';
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isVerified: boolean;
  isEmailVerified?: boolean;
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
  change?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'flat';
  direction?: 'up' | 'down' | 'neutral';
  period?: string;
}

interface KPIMetric {
  label: string;
  value: number;
  trend: TrendData;
  icon: string;
  color: string;
}

// Icon mapping for KPI metrics from string to component
const iconMap: Record<string, typeof Users> = {
  Users,
  Activity,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  Database,
  Server,
  Cpu,
  HardDrive,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
};

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
  type: 'user_registration' | 'plan_created' | 'admin_action' | 'plan_completed' | 'user_upgrade' | 'error' | 'email_verified';
  message?: string;
  description?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  planId?: string;
  metadata?: {
    tier?: string;
    status?: string;
    verified?: boolean;
    isDemo?: boolean;
    [key: string]: unknown;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
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
  email_verified: CheckCircle,
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
  // Handle both old format (trend.trend) and new format (trend.direction)
  const trendDirection = trend.trend || (trend.direction === 'neutral' ? 'flat' : trend.direction) || 'flat';
  const Icon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : Minus;
  const color = trendDirection === 'up' ? 'text-green-500' : trendDirection === 'down' ? 'text-red-500' : 'text-gray-500';
  
  // Calculate percentage to display
  const percentageValue = trend.changePercentage !== undefined 
    ? trend.changePercentage 
    : (trend.value || 0);

  return (
    <motion.div
      className={`flex items-center gap-1 ${color}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">
        {trend.period ? `+${Math.abs(percentageValue)}` : `${Math.abs(percentageValue).toFixed(1)}%`}
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

  // Auto-filter when clicking specific subsections
  useEffect(() => {
    // Plans subsection auto-filtering
    if (activeSection === 'plans-pending') {
      setPlanFilters({ statusFilters: ['pending'] });
      setPlansPage(1);
    } else if (activeSection === 'plans-completed') {
      setPlanFilters({ statusFilters: ['completed'] });
      setPlansPage(1);
    } else if (activeSection === 'plans-failed') {
      setPlanFilters({ statusFilters: ['failed'] });
      setPlansPage(1);
    } else if (activeSection === 'plans-overview' || activeSection === 'plans-funnel') {
      setPlanFilters({});
      setPlansPage(1);
    }

    // Users subsection auto-filtering
    if (activeSection === 'users-active') {
      setUserFilters({ tierFilters: ['premium', 'enterprise', 'ultimate'] });
      setUsersPage(1);
    } else if (activeSection === 'users-new') {
      setUserFilters({ verified: false });
      setUsersPage(1);
    } else if (activeSection === 'users-overview') {
      setUserFilters({});
      setUsersPage(1);
    }
  }, [activeSection]);

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

  // Lawyer Review Center queries
  const { data: lawyerReviews, isLoading: lawyerReviewsLoading, refetch: refetchLawyerReviews } = useQuery<Array<{
    id: string;
    businessPlanId: string;
    userId: string;
    lawyerId: string | null;
    documentType: string;
    priority: string;
    tier: string;
    status: string;
    requestedAt: string;
    assignedAt: string | null;
    completedAt: string | null;
    dueDate: string | null;
    isOverdue: boolean;
    overallVerdict: string | null;
    confidenceScore: number | null;
    complianceScore: number | null;
    readinessScore: number | null;
  }>>({
    queryKey: ['/api/admin/lawyer-reviews'],
    enabled: !!user?.isAdmin && activeSection.startsWith('lawyer'),
  });

  const { data: lawyerTeam, isLoading: lawyerTeamLoading, refetch: refetchLawyerTeam } = useQuery<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    oiscLevel: string | null;
    firmName: string | null;
    isAvailable: boolean;
    maxConcurrentReviews: number;
    currentReviewCount: number;
    totalReviewsCompleted: number;
    averageRating: number | null;
    status: string;
  }>>({
    queryKey: ['/api/admin/lawyers'],
    enabled: !!user?.isAdmin && activeSection.startsWith('lawyer'),
  });

  const { data: lawyerAnalytics, isLoading: lawyerAnalyticsLoading } = useQuery<{
    totalReviews: number;
    pendingReviews: number;
    inProgressReviews: number;
    completedReviews: number;
    approvedReviews: number;
    needsRevisionReviews: number;
    averageTurnaroundHours: number;
    overdueReviews: number;
  }>({
    queryKey: ['/api/admin/lawyer-reviews/analytics'],
    enabled: !!user?.isAdmin && activeSection.startsWith('lawyer'),
    refetchInterval: REFRESH_INTERVAL,
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

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.clear();
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setLocation("/login");
      }
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

  // Loading state - with proper background for both light and dark mode
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">Redirecting to home page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </div>
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
            {/* Top Header Bar with Logo, Theme Toggle, Logout */}
            <header className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
              <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
              
              <Link href="/">
                <div className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" data-testid="button-admin-logo">
                  <div className="logo-container overflow-hidden flex items-center">
                    <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant" className="h-8 md:h-10 w-auto logo-light object-contain" loading="lazy" />
                    <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant" className="h-8 md:h-10 w-auto logo-dark object-contain" loading="lazy" />
                  </div>
                </div>
              </Link>
              
              <div className="flex-1" />
              
              <span className="text-sm text-muted-foreground hidden md:inline">{user?.email}</span>
              
              <ThemeToggle />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </header>
            
            <div className="min-h-screen bg-background">
              <div className="p-6 space-y-6">
                {/* Section Header */}
                <div className="relative overflow-hidden rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm p-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
                  
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h1 className="text-2xl font-bold tracking-tight" data-testid="heading-admin-dashboard">
                          {getSectionTitle()}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Professional-level analytics and comprehensive system management
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
                </div>

                {/* Main Content - Section Based */}
                
                {/* OVERVIEW SECTION - High-level summary */}
                {activeSection === 'overview' && (
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
                                {(() => {
                                  const IconComponent = iconMap[metric.icon] || Activity;
                                  return <IconComponent className="h-4 w-4" />;
                                })()}
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
                                  const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Activity;
                                  const colorClass = ACTIVITY_COLORS[activity.severity || 'info'];

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
                                    (overviewData.systemMetrics?.healthScore ?? 0) >= 90 ? "default" :
                                    (overviewData.systemMetrics?.healthScore ?? 0) >= 70 ? "secondary" : "destructive"
                                  }
                                  className="text-lg font-bold"
                                >
                                  {overviewData.systemMetrics?.healthScore ?? 0}/100
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
                                  <span className="text-sm font-bold">{overviewData.systemMetrics?.cpu ?? 0}%</span>
                                </div>
                                <Progress value={overviewData.systemMetrics?.cpu ?? 0} className="h-2" />
                              </div>

                              {/* Memory Usage */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-secondary" />
                                    <span className="text-sm font-medium">Memory</span>
                                  </div>
                                  <span className="text-sm font-bold">
                                    {overviewData.systemMetrics?.memory?.percentage ?? 0}%
                                  </span>
                                </div>
                                <Progress value={overviewData.systemMetrics?.memory?.percentage ?? 0} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  {formatBytes(overviewData.systemMetrics?.memory?.used ?? 0)} / {formatBytes(overviewData.systemMetrics?.memory?.total ?? 0)}
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
                                    {overviewData.systemMetrics?.api?.avgResponseTime ?? 0}ms
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Requests/min: {overviewData.systemMetrics?.api?.requestsPerMinute ?? 0}</span>
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
                                    {overviewData.systemMetrics?.api?.errorRate ?? 0}%
                                  </span>
                                </div>
                                <Progress 
                                  value={overviewData.systemMetrics?.api?.errorRate ?? 0} 
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

                {/* REAL-TIME ACTIVITY SECTION - PhD-level live monitoring */}
                {activeSection === 'realtime' && (
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {activityLogLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i}>
                              <CardContent className="p-4">
                                <ShimmerSkeleton />
                              </CardContent>
                            </Card>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="realtime-content"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                          {/* Live Status Header */}
                          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    className="relative"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <div className="h-4 w-4 rounded-full bg-green-500" />
                                    <div className="absolute inset-0 h-4 w-4 rounded-full bg-green-500 animate-ping opacity-75" />
                                  </motion.div>
                                  <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                      Real-Time Activity Monitor
                                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">LIVE</Badge>
                                    </h2>
                                    <p className="text-muted-foreground">Platform activity stream with user identity tracking</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center px-4 py-2 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-green-500">{activityLog?.length || 0}</p>
                                    <p className="text-xs text-muted-foreground">Events</p>
                                  </div>
                                  <div className="text-center px-4 py-2 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-blue-500">{overviewData?.kpiMetrics?.[1]?.value || 0}</p>
                                    <p className="text-xs text-muted-foreground">Active Now</p>
                                  </div>
                                  <div className="text-center px-4 py-2 bg-background rounded-lg border">
                                    <p className="text-2xl font-bold text-amber-500">30s</p>
                                    <p className="text-xs text-muted-foreground">Refresh</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Activity Statistics Row */}
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <UserPlus className="h-6 w-6 mx-auto mb-2 text-green-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.type === 'user_registration').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Registrations</p>
                              </CardContent>
                            </Card>
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.type === 'email_verified').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Verifications</p>
                              </CardContent>
                            </Card>
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <FileText className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.type === 'plan_created').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Plans Created</p>
                              </CardContent>
                            </Card>
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <FileCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.type === 'plan_completed').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                              </CardContent>
                            </Card>
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.type === 'user_upgrade').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Upgrades</p>
                              </CardContent>
                            </Card>
                            <Card className="hover-elevate">
                              <CardContent className="p-4 text-center">
                                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                                <p className="text-2xl font-bold">{activityLog?.filter(a => a.severity === 'error').length || 0}</p>
                                <p className="text-xs text-muted-foreground">Errors</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Main Activity Feed with Timeline */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Live Activity Timeline - Main Column */}
                            <div className="lg:col-span-2">
                              <Card className="h-full">
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Live Activity Timeline
                                      </CardTitle>
                                      <CardDescription>Real-time platform events with user identity</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <motion.div
                                        className="h-2 w-2 rounded-full bg-green-500"
                                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      />
                                      <span className="text-xs text-muted-foreground">Auto-updating</span>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-[600px] pr-4">
                                    <div className="relative">
                                      {/* Timeline line */}
                                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                                      
                                      <div className="space-y-4">
                                        {activityLog?.map((activity, index) => {
                                          const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Activity;
                                          const severityColor = {
                                            info: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
                                            success: 'bg-green-500/10 border-green-500/30 text-green-500',
                                            warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
                                            error: 'bg-red-500/10 border-red-500/30 text-red-500'
                                          }[activity.severity || 'info'];
                                          
                                          const iconBgColor = {
                                            user_registration: 'bg-green-500',
                                            email_verified: 'bg-blue-500',
                                            plan_created: 'bg-purple-500',
                                            plan_completed: 'bg-emerald-500',
                                            user_upgrade: 'bg-orange-500',
                                            admin_action: 'bg-slate-500',
                                            error: 'bg-red-500'
                                          }[activity.type] || 'bg-gray-500';

                                          return (
                                            <motion.div
                                              key={activity.id}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.03 }}
                                              className="relative pl-14"
                                            >
                                              {/* Timeline dot */}
                                              <div className={`absolute left-4 top-4 h-5 w-5 rounded-full ${iconBgColor} flex items-center justify-center z-10`}>
                                                <Icon className="h-3 w-3 text-white" />
                                              </div>
                                              
                                              {/* Activity Card */}
                                              <Card className={`border ${severityColor} hover-elevate`}>
                                                <CardContent className="p-4">
                                                  <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                      {/* User Identity Section */}
                                                      {activity.userEmail && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <UserCheck className="h-4 w-4 text-primary" />
                                                          </div>
                                                          <div>
                                                            <p className="text-sm font-semibold">{activity.userEmail}</p>
                                                            <p className="text-xs text-muted-foreground">User ID: {activity.userId?.slice(0, 8)}...</p>
                                                          </div>
                                                        </div>
                                                      )}
                                                      
                                                      {/* Activity Description */}
                                                      <p className="text-sm font-medium">{activity.description || activity.message}</p>
                                                      
                                                      {/* Metadata Tags */}
                                                      {activity.metadata && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                          {activity.metadata.tier && (
                                                            <Badge variant="outline" className="text-xs">
                                                              Tier: {activity.metadata.tier}
                                                            </Badge>
                                                          )}
                                                          {activity.metadata.status && (
                                                            <Badge variant="outline" className="text-xs">
                                                              Status: {activity.metadata.status}
                                                            </Badge>
                                                          )}
                                                          {activity.metadata.verified !== undefined && (
                                                            <Badge variant={activity.metadata.verified ? "default" : "secondary"} className="text-xs">
                                                              {activity.metadata.verified ? 'Verified' : 'Unverified'}
                                                            </Badge>
                                                          )}
                                                          {activity.metadata.isDemo && (
                                                            <Badge variant="secondary" className="text-xs">Demo</Badge>
                                                          )}
                                                        </div>
                                                      )}
                                                      
                                                      {/* Timestamp */}
                                                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{format(new Date(activity.timestamp), 'PPpp')}</span>
                                                        <span className="text-muted-foreground/50">•</span>
                                                        <span>{formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}</span>
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Severity Badge */}
                                                    <Badge variant="outline" className={`shrink-0 ${severityColor}`}>
                                                      {activity.severity || 'info'}
                                                    </Badge>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Right Sidebar - Live Stats & Recent Users */}
                            <div className="space-y-6">
                              {/* Activity Distribution */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">Activity Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {[
                                      { type: 'Registrations', count: activityLog?.filter(a => a.type === 'user_registration').length || 0, color: 'bg-green-500' },
                                      { type: 'Verifications', count: activityLog?.filter(a => a.type === 'email_verified').length || 0, color: 'bg-blue-500' },
                                      { type: 'Plans Created', count: activityLog?.filter(a => a.type === 'plan_created').length || 0, color: 'bg-purple-500' },
                                      { type: 'Plans Completed', count: activityLog?.filter(a => a.type === 'plan_completed').length || 0, color: 'bg-emerald-500' },
                                    ].map((item) => {
                                      const total = activityLog?.length || 1;
                                      const percentage = Math.round((item.count / total) * 100);
                                      return (
                                        <div key={item.type} className="space-y-1">
                                          <div className="flex items-center justify-between text-sm">
                                            <span>{item.type}</span>
                                            <span className="font-medium">{item.count}</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <motion.div
                                              className={`h-full ${item.color}`}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percentage}%` }}
                                              transition={{ duration: 0.8, delay: 0.2 }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Recent Active Users */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Recent Active Users
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-[300px]">
                                    <div className="space-y-3">
                                      {activityLog?.filter(a => a.userEmail).slice(0, 15).map((activity, index) => (
                                        <motion.div
                                          key={`user-${activity.id}-${index}`}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                                        >
                                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">
                                              {activity.userEmail?.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{activity.userEmail}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                                            </p>
                                          </div>
                                          <div className={`h-2 w-2 rounded-full ${
                                            activity.type === 'user_registration' ? 'bg-green-500' :
                                            activity.type === 'email_verified' ? 'bg-blue-500' :
                                            activity.type === 'plan_created' ? 'bg-purple-500' : 'bg-gray-500'
                                          }`} />
                                        </motion.div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </CardContent>
                              </Card>

                              {/* Activity Heatmap by Hour */}
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Activity by Hour (Today)
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-6 gap-1">
                                    {Array.from({ length: 24 }, (_, hour) => {
                                      const count = activityLog?.filter(a => 
                                        new Date(a.timestamp).getHours() === hour
                                      ).length || 0;
                                      const maxCount = Math.max(...Array.from({ length: 24 }, (_, h) => 
                                        activityLog?.filter(a => new Date(a.timestamp).getHours() === h).length || 0
                                      ));
                                      const intensity = maxCount > 0 ? count / maxCount : 0;
                                      
                                      return (
                                        <Tooltip key={hour}>
                                          <TooltipTrigger asChild>
                                            <div
                                              className={`h-6 rounded cursor-pointer transition-colors ${
                                                intensity === 0 ? 'bg-muted' :
                                                intensity < 0.25 ? 'bg-green-500/20' :
                                                intensity < 0.5 ? 'bg-green-500/40' :
                                                intensity < 0.75 ? 'bg-green-500/60' :
                                                'bg-green-500/80'
                                              }`}
                                            />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{hour}:00 - {count} events</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>
                                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>00:00</span>
                                    <span>12:00</span>
                                    <span>23:00</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>

                          {/* Activity Insights */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Real-Time Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-500">Peak Activity</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {(() => {
                                      const hourCounts = Array.from({ length: 24 }, (_, h) => ({
                                        hour: h,
                                        count: activityLog?.filter(a => new Date(a.timestamp).getHours() === h).length || 0
                                      }));
                                      const peak = hourCounts.reduce((a, b) => a.count > b.count ? a : b, { hour: 0, count: 0 });
                                      return `Most active at ${peak.hour}:00 with ${peak.count} events`;
                                    })()}
                                  </p>
                                </div>
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-blue-500">User Engagement</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {activityLog?.filter(a => a.userEmail).length || 0} unique user interactions tracked
                                  </p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-purple-500" />
                                    <span className="font-medium text-purple-500">Plan Activity</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {activityLog?.filter(a => a.type.includes('plan')).length || 0} plan-related events in feed
                                  </p>
                                </div>
                                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium text-amber-500">Latest Activity</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {activityLog?.[0] ? formatDistance(new Date(activityLog[0].timestamp), new Date(), { addSuffix: true }) : 'No recent activity'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* EXECUTIVE KPIs SECTION - Detailed metrics with targets */}
                {activeSection === 'kpis' && (
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {overviewLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {[1, 2, 3, 4, 5, 6].map((i) => (
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
                          key="kpis-content"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                          {/* KPI Performance Summary Header */}
                          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                  <h2 className="text-2xl font-bold">Executive KPI Dashboard</h2>
                                  <p className="text-muted-foreground">Strategic metrics with targets and performance tracking</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-center px-4 py-2 bg-background rounded-lg border">
                                    <p className="text-3xl font-bold text-green-500">87%</p>
                                    <p className="text-xs text-muted-foreground">Overall Score</p>
                                  </div>
                                  <div className="text-center px-4 py-2 bg-background rounded-lg border">
                                    <p className="text-3xl font-bold text-primary">{overviewData.kpiMetrics?.length || 0}</p>
                                    <p className="text-xs text-muted-foreground">Active KPIs</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Business Performance KPIs with Targets */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* User Acquisition KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">User Acquisition</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">On Track</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">{overviewData.kpiMetrics?.[0]?.value || 0}</p>
                                      <p className="text-xs text-muted-foreground">Current Users</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ 50</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((overviewData.kpiMetrics?.[0]?.value || 0) / 50) * 100, 100)} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium text-green-500">{Math.round(((overviewData.kpiMetrics?.[0]?.value || 0) / 50) * 100)}%</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Plan Completion KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Plan Completion Rate</CardTitle>
                                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">Needs Focus</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">42%</p>
                                      <p className="text-xs text-muted-foreground">Completion Rate</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ 80%</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={42} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">vs Target</span>
                                    <span className="font-medium text-amber-500">52% of goal</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Revenue KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">Exceeding</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">£2,450</p>
                                      <p className="text-xs text-muted-foreground">Current MRR</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ £2,000</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={100} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">vs Target</span>
                                    <span className="font-medium text-green-500">122% of goal</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Active Users KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">Strong</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">{overviewData.kpiMetrics?.[1]?.value || 0}</p>
                                      <p className="text-xs text-muted-foreground">Active Now</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ 25</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((overviewData.kpiMetrics?.[1]?.value || 0) / 25) * 100, 100)} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Engagement</span>
                                    <span className="font-medium text-green-500">{Math.round(((overviewData.kpiMetrics?.[1]?.value || 0) / (overviewData.kpiMetrics?.[0]?.value || 1)) * 100)}% of users</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Tool Adoption KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Tool Adoption Rate</CardTitle>
                                    <Badge variant="outline" className="text-blue-500 border-blue-500/30">Growing</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">68%</p>
                                      <p className="text-xs text-muted-foreground">Tools Used</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ 75%</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={68} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Avg tools/user</span>
                                    <span className="font-medium text-blue-500">12.4 tools</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Customer Satisfaction KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">Excellent</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-3xl font-bold">4.8</p>
                                      <p className="text-xs text-muted-foreground">NPS Score</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold text-muted-foreground">/ 5.0</p>
                                      <p className="text-xs text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={96} className="h-3" />
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Rating</span>
                                    <span className="font-medium text-green-500">96% satisfied</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>

                          {/* Strategic Goals Section */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Quarterly Strategic Goals
                                  </CardTitle>
                                  <CardDescription>Q4 2024 objectives and progress tracking</CardDescription>
                                </div>
                                <Badge>Q4 2024</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                {/* Goal 1 */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold">Reach 100 Active Users</h4>
                                      <p className="text-sm text-muted-foreground">Grow user base through organic marketing and referrals</p>
                                    </div>
                                    <Badge variant="secondary">{overviewData.kpiMetrics?.[0]?.value || 0}/100</Badge>
                                  </div>
                                  <Progress value={((overviewData.kpiMetrics?.[0]?.value || 0) / 100) * 100} className="h-2" />
                                  <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="text-muted-foreground">Due: Dec 31, 2024</span>
                                    <span className="text-primary font-medium">{((overviewData.kpiMetrics?.[0]?.value || 0))}% complete</span>
                                  </div>
                                </div>

                                {/* Goal 2 */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold">£5,000 Monthly Recurring Revenue</h4>
                                      <p className="text-sm text-muted-foreground">Scale premium tier conversions</p>
                                    </div>
                                    <Badge variant="secondary">£2,450/£5,000</Badge>
                                  </div>
                                  <Progress value={49} className="h-2" />
                                  <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="text-muted-foreground">Due: Dec 31, 2024</span>
                                    <span className="text-amber-500 font-medium">49% complete</span>
                                  </div>
                                </div>

                                {/* Goal 3 */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold">75% Plan Completion Rate</h4>
                                      <p className="text-sm text-muted-foreground">Improve user journey and tool guidance</p>
                                    </div>
                                    <Badge variant="secondary">42%/75%</Badge>
                                  </div>
                                  <Progress value={56} className="h-2" />
                                  <div className="flex items-center justify-between mt-2 text-sm">
                                    <span className="text-muted-foreground">Due: Dec 31, 2024</span>
                                    <span className="text-amber-500 font-medium">56% complete</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Performance Comparison */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Weekly Performance Trend */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Weekly Performance Trend</CardTitle>
                                <CardDescription>7-day KPI performance overview</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <RechartsLineChart data={overviewData.timeSeriesData?.slice(-7) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis
                                      dataKey="date"
                                      stroke="hsl(var(--foreground))"
                                      fontSize={12}
                                      tickFormatter={(value) => format(new Date(value), 'EEE')}
                                    />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                                    <RechartsTooltip
                                      contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                      }}
                                    />
                                    <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Users" />
                                    <Line type="monotone" dataKey="plans" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Plans" />
                                  </RechartsLineChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            {/* Tier Conversion Funnel */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Tier Upgrade Funnel</CardTitle>
                                <CardDescription>User progression through subscription tiers</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">Free</div>
                                    <div className="flex-1">
                                      <Progress value={100} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-sm">{overviewData.subscriptionDistribution?.find(s => s.tier === 'Free')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">Basic</div>
                                    <div className="flex-1">
                                      <Progress value={60} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-sm">{overviewData.subscriptionDistribution?.find(s => s.tier === 'Basic')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">Premium</div>
                                    <div className="flex-1">
                                      <Progress value={40} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-sm">{overviewData.subscriptionDistribution?.find(s => s.tier === 'Premium')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">Enterprise</div>
                                    <div className="flex-1">
                                      <Progress value={20} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-sm">{overviewData.subscriptionDistribution?.find(s => s.tier === 'Enterprise')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="w-24 text-sm font-medium">Ultimate</div>
                                    <div className="flex-1">
                                      <Progress value={10} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-sm">{overviewData.subscriptionDistribution?.find(s => s.tier === 'Ultimate')?.count || 0}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Key Insights */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Key Performance Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-500">Strength</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">User acquisition exceeding target by 24%. Strong organic growth from referrals.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium text-amber-500">Opportunity</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Plan completion rate needs improvement. Consider adding guided onboarding.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-blue-500">Focus Area</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Premium tier conversion is key to hitting Q4 revenue target. Focus marketing efforts.</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No KPI data available</p>
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
                {/* User Journey Analytics - PhD-level detail with funnel visualization */}
                {(activeSection === 'users-journey' || activeSection === 'users-overview') && (
                  <Card data-testid="card-user-journey-analytics">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">User Journey Analytics</CardTitle>
                      <CardDescription>Track user progression from registration to active engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const totalUsers = overviewData?.kpiMetrics?.[0]?.value || 38;
                        const activeUsers = overviewData?.kpiMetrics?.[1]?.value || 32;
                        
                        const funnelData = [
                          { stage: 'Registered', count: totalUsers, color: '#f59e0b' },
                          { stage: 'Email Verified', count: activeUsers, color: '#3b82f6' },
                          { stage: 'First Login', count: totalUsers, color: '#f59e0b' },
                          { stage: 'Used Tool', count: Math.round(activeUsers * 0.9), color: '#22c55e' },
                          { stage: 'Created Plan', count: Math.round(activeUsers * 0.75), color: '#8b5cf6' },
                          { stage: 'Active User', count: activeUsers, color: '#06b6d4' },
                        ];

                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Custom Pyramid Funnel Visualization */}
                              <div>
                                <h4 className="text-sm font-semibold mb-6">Conversion Funnel</h4>
                                <div className="relative flex flex-col items-center justify-center py-4">
                                  {funnelData.map((stage, index) => {
                                    const maxWidth = 100;
                                    const minWidth = 30;
                                    const widthPercent = maxWidth - ((maxWidth - minWidth) * (index / (funnelData.length - 1)));
                                    const heightPx = 55;
                                    
                                    return (
                                      <motion.div
                                        key={stage.stage}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        className="relative flex items-center justify-center"
                                        style={{
                                          width: `${widthPercent}%`,
                                          height: `${heightPx}px`,
                                          backgroundColor: stage.color,
                                          clipPath: index === 0 
                                            ? 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)'
                                            : index === funnelData.length - 1
                                            ? 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)'
                                            : 'polygon(0% 0%, 100% 0%, 97% 100%, 3% 100%)',
                                          marginTop: index > 0 ? '-2px' : '0',
                                        }}
                                      >
                                        <span className="text-white font-semibold text-sm drop-shadow-md">
                                          {stage.count} users
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Funnel Stage Breakdown - PhD-level detail */}
                              <div>
                                <h4 className="text-sm font-semibold mb-6">Funnel Stage Breakdown</h4>
                                <div className="space-y-5">
                                  {funnelData.map((stage, index) => {
                                    const prevCount = index > 0 ? funnelData[index - 1].count : stage.count;
                                    const conversionRate = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '100.0';
                                    const baselineRate = index === 0 ? 100 : ((stage.count / funnelData[0].count) * 100).toFixed(1);
                                    
                                    return (
                                      <motion.div
                                        key={stage.stage}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                        className="space-y-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div 
                                              className="w-3 h-3 rounded-full" 
                                              style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="font-semibold text-foreground">{stage.stage}</span>
                                          </div>
                                          <Badge 
                                            className="text-white font-medium px-3"
                                            style={{ backgroundColor: stage.color }}
                                          >
                                            {stage.count} users
                                          </Badge>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-muted-foreground">Conversion from previous stage</span>
                                          <span className={`font-bold ${
                                            parseFloat(conversionRate) >= 100 ? 'text-green-500' :
                                            parseFloat(conversionRate) >= 80 ? 'text-blue-500' :
                                            parseFloat(conversionRate) >= 50 ? 'text-amber-500' :
                                            'text-red-500'
                                          }`}>
                                            {conversionRate}%
                                          </span>
                                        </div>
                                        
                                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                          <motion.div
                                            className="absolute inset-y-0 left-0 rounded-full"
                                            style={{ backgroundColor: stage.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
                                            transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                                          />
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Growth Rate Summary with enhanced styling */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t">
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <p className="text-2xl font-bold text-green-500">+{usersAnalytics?.growthRate?.daily || 5.2}%</p>
                                <p className="text-sm text-muted-foreground">Daily Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <p className="text-2xl font-bold text-blue-500">+{usersAnalytics?.growthRate?.weekly || 12.8}%</p>
                                <p className="text-sm text-muted-foreground">Weekly Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                              >
                                <p className="text-2xl font-bold text-purple-500">+{usersAnalytics?.growthRate?.monthly || 28.5}%</p>
                                <p className="text-sm text-muted-foreground">Monthly Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                              >
                                <p className="text-2xl font-bold text-amber-500">{((activeUsers / totalUsers) * 100).toFixed(1)}%</p>
                                <p className="text-sm text-muted-foreground">Activation Rate</p>
                              </motion.div>
                            </div>

                            {/* Conversion Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                              <Card className="bg-green-500/5 border-green-500/20">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="font-medium text-green-500">Strong Point</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Email verification rate of {((activeUsers / totalUsers) * 100).toFixed(1)}% exceeds industry average of 70%
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="bg-amber-500/5 border-amber-500/20">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium text-amber-500">Focus Area</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Tool usage activation can be improved with better onboarding flows
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="bg-blue-500/5 border-blue-500/20">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium text-blue-500">Next Goal</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Target 90%+ first login conversion by Q1 2025
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        );
                      })()}
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

                {/* Churn Analysis - Show only when users-churn is selected */}
                {activeSection === 'users-churn' && (
                  <Card data-testid="card-churn-analysis">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserX className="h-5 w-5 text-red-500" />
                        Churn Risk Analysis
                      </CardTitle>
                      <CardDescription>Identify users at risk of churning and track retention metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Churn Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <UserX className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">At-Risk Users</span>
                            </div>
                            <p className="text-2xl font-bold text-red-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity > 14 && daysSinceActivity <= 30;
                              }).length || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">14-30 days inactive</p>
                          </div>
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">Churned Users</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity > 30;
                              }).length || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">30+ days inactive</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <UserCheck className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Active Users</span>
                            </div>
                            <p className="text-2xl font-bold text-green-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity <= 7;
                              }).length || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Active in last 7 days</p>
                          </div>
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Retention Rate</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-500">
                              {usersData?.users?.length ? 
                                ((usersData.users.filter(u => {
                                  const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                  return daysSinceActivity <= 30;
                                }).length / usersData.users.length) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground">30-day retention</p>
                          </div>
                        </div>

                        {/* At-Risk Users List */}
                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Users Requiring Attention
                          </h4>
                          <div className="space-y-2">
                            {usersData?.users?.filter(u => {
                              const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                              const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                              return daysSinceActivity > 7;
                            }).slice(0, 10).map(user => {
                              const lastActivity = user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt);
                              const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                              const riskLevel = daysSinceActivity > 30 ? 'high' : daysSinceActivity > 14 ? 'medium' : 'low';
                              return (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                                    <div>
                                      <p className="font-medium">{user.firstName || user.email?.split('@')[0] || 'Unknown'}</p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'secondary' : 'outline'}>
                                      {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'At Risk' : 'Dormant'}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Last active {daysSinceActivity} days ago
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {(!usersData?.users || usersData.users.filter(u => {
                              const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                              const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                              return daysSinceActivity > 7;
                            }).length === 0) && (
                              <div className="py-8 text-center text-muted-foreground">
                                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>All users are actively engaged!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cohort Analysis - Show only when users-cohorts is selected */}
                {activeSection === 'users-cohorts' && usersAnalytics?.cohortAnalysis && (
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

                {/* User Management Table - Always shown at bottom */}
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
                {plansAnalytics && (plansAnalytics.completionFunnel?.length > 0 || plansAnalytics.statusDistribution?.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Plan Completion Funnel */}
                    {plansAnalytics.completionFunnel && plansAnalytics.completionFunnel.length > 0 && (
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
                    )}

                    {/* Status Distribution */}
                    {plansAnalytics.statusDistribution && plansAnalytics.statusDistribution.length > 0 && (
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
                    )}
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
                                        <DropdownMenuItem
                                          onClick={() => {
                                            window.open(`/api/admin/plans/${plan.id}/download`, '_blank');
                                          }}
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Download PDF
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

                {/* Tool Performance Section - 5 Unique PhD-Level Pages */}
                {activeSection.startsWith('tools') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* 1. USAGE ANALYTICS - Comprehensive Tool Usage Insights */}
                      {activeSection === 'tools-usage' && (
                        <>
                          {/* Usage Overview Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                              { label: 'Total Tool Uses', value: '12,847', change: '+18%', icon: BarChart3, color: 'blue' },
                              { label: 'Unique Users', value: '342', change: '+12%', icon: Users, color: 'green' },
                              { label: 'Avg. Uses/User', value: '37.6', change: '+8%', icon: Target, color: 'purple' },
                              { label: 'Active Today', value: '89', change: '+24', icon: Activity, color: 'amber' },
                            ].map((stat, index) => (
                              <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className={`hover-elevate border-l-4 border-l-${stat.color}-500`}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                        <Badge className={`mt-2 bg-${stat.color}-500/10 text-${stat.color}-500`}>{stat.change}</Badge>
                                      </div>
                                      <stat.icon className={`h-10 w-10 text-${stat.color}-500 opacity-50`} />
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Usage Trends Chart */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle>Tool Usage Trends</CardTitle>
                                  <CardDescription>Daily usage patterns over 30 days with interactive brush</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-green-500 border-green-500">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Growing
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {toolAnalytics ? (
                                <ResponsiveContainer width="100%" height={350}>
                                  <AreaChart data={toolAnalytics.usageTrends}>
                                    <defs>
                                      <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      labelFormatter={(v) => format(new Date(v), 'PPP')}
                                    />
                                    <Area type="monotone" dataKey="uses" stroke="#3b82f6" fill="url(#usageGradient)" strokeWidth={3} />
                                    <Brush dataKey="date" height={40} stroke="#3b82f6" tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[350px] flex items-center justify-center">
                                  <Skeleton className="w-full h-full" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Category Breakdown & User Segments */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Usage by Category</CardTitle>
                                <CardDescription>Tool usage distribution across categories</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {[
                                    { category: 'Compliance', uses: 3420, percent: 27, color: '#22c55e' },
                                    { category: 'Business Planning', uses: 2890, percent: 23, color: '#3b82f6' },
                                    { category: 'Financial', uses: 2150, percent: 17, color: '#8b5cf6' },
                                    { category: 'Documentation', uses: 1870, percent: 15, color: '#f59e0b' },
                                    { category: 'Innovation', uses: 1340, percent: 10, color: '#ec4899' },
                                    { category: 'Growth', uses: 1177, percent: 8, color: '#06b6d4' },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.category}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.08 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                          <span className="font-medium">{item.category}</span>
                                        </div>
                                        <span className="text-sm font-bold">{item.uses.toLocaleString()} uses</span>
                                      </div>
                                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="absolute inset-y-0 left-0 rounded-full"
                                          style={{ backgroundColor: item.color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.percent}%` }}
                                          transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
                                        />
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Usage by User Tier</CardTitle>
                                <CardDescription>How different subscription tiers use tools</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                  <RechartsBarChart data={[
                                    { tier: 'Free', uses: 890, avgPerUser: 12 },
                                    { tier: 'Basic', uses: 2340, avgPerUser: 28 },
                                    { tier: 'Premium', uses: 4560, avgPerUser: 45 },
                                    { tier: 'Enterprise', uses: 3210, avgPerUser: 67 },
                                    { tier: 'Ultimate', uses: 1847, avgPerUser: 92 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="tier" stroke="hsl(var(--foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="uses" name="Total Uses" radius={[4, 4, 0, 0]}>
                                      {[
                                        { fill: '#94a3b8' },
                                        { fill: '#22c55e' },
                                        { fill: '#3b82f6' },
                                        { fill: '#f59e0b' },
                                        { fill: '#8b5cf6' },
                                      ].map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* 2. USAGE HEATMAP - Time-Based Activity Visualization */}
                      {activeSection === 'tools-heatmap' && (
                        <>
                          {/* Heatmap Summary */}
                          <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-cyan-500/10 border-purple-500/20">
                            <CardContent className="py-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <Grid className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Usage Heatmap Analysis</p>
                                    <p className="text-2xl font-bold">Peak: Tue-Thu, 10am-2pm GMT</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Busiest Hour</p>
                                    <p className="text-xl font-bold">11:00</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Busiest Day</p>
                                    <p className="text-xl font-bold">Wednesday</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Hourly Heatmap */}
                          <Card>
                            <CardHeader>
                              <CardTitle>24-Hour Usage Distribution</CardTitle>
                              <CardDescription>Tool activity intensity by hour of day</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-12 gap-2">
                                {toolAnalytics?.peakUsageHours?.map((hour) => {
                                  const maxCount = Math.max(...(toolAnalytics.peakUsageHours?.map(h => h.count) || [1]));
                                  const intensity = (hour.count / maxCount) * 100;
                                  return (
                                    <Tooltip key={hour.hour}>
                                      <TooltipTrigger asChild>
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: hour.hour * 0.03 }}
                                          className="h-24 rounded-lg border border-border cursor-pointer hover-elevate transition-all flex flex-col items-center justify-center"
                                          style={{ backgroundColor: `hsl(260, 80%, ${70 - intensity * 0.4}%)` }}
                                        >
                                          <span className="text-sm font-bold text-white">{hour.hour}:00</span>
                                          <span className="text-xs text-white/80">{hour.count}</span>
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{hour.count} tool uses at {hour.hour}:00</p>
                                        <p className="text-xs text-muted-foreground">{((hour.count / maxCount) * 100).toFixed(0)}% of peak</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                }) || Array.from({ length: 12 }, (_, i) => (
                                  <Skeleton key={i} className="h-24 rounded-lg" />
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Weekly Heatmap Grid */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Weekly Activity Pattern</CardTitle>
                              <CardDescription>Heatmap showing usage by day and time period</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => (
                                  <motion.div
                                    key={day}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: dayIndex * 0.08 }}
                                    className="flex items-center gap-4"
                                  >
                                    <span className="w-24 text-sm font-medium">{day}</span>
                                    <div className="flex-1 grid grid-cols-6 gap-2">
                                      {['Early Morning', 'Morning', 'Midday', 'Afternoon', 'Evening', 'Night'].map((period, periodIndex) => {
                                        const intensity = Math.random() * 100;
                                        const isWeekend = dayIndex >= 5;
                                        const adjustedIntensity = isWeekend ? intensity * 0.4 : intensity;
                                        return (
                                          <Tooltip key={period}>
                                            <TooltipTrigger asChild>
                                              <div
                                                className="h-10 rounded-md cursor-pointer hover-elevate"
                                                style={{ backgroundColor: `hsl(210, 80%, ${85 - adjustedIntensity * 0.5}%)` }}
                                              />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{day} - {period}</p>
                                              <p className="text-xs text-muted-foreground">{Math.round(adjustedIntensity)}% activity</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                ))}
                                <div className="flex items-center gap-4 pt-4 border-t">
                                  <span className="w-24 text-sm text-muted-foreground">Legend:</span>
                                  <div className="flex items-center gap-2">
                                    {['Low', 'Medium', 'High', 'Peak'].map((level, i) => (
                                      <div key={level} className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: `hsl(210, 80%, ${85 - i * 15}%)` }} />
                                        <span className="text-xs">{level}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 3. TOP TOOLS - Most Popular Tools Ranking */}
                      {activeSection === 'tools-top' && (
                        <>
                          {/* Top Tools Leaderboard */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Tool Leaderboard
                                  </CardTitle>
                                  <CardDescription>Top 15 most used tools by usage count</CardDescription>
                                </div>
                                <Badge className="bg-amber-500 text-white">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Top Performers
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {(toolAnalytics?.topTools || [
                                  { toolName: 'Business Plan Generator', usageCount: 1847 },
                                  { toolName: 'Innovation Score Calculator', usageCount: 1523 },
                                  { toolName: 'Pitch Practice Coach', usageCount: 1289 },
                                  { toolName: 'Financial Projections Tool', usageCount: 1156 },
                                  { toolName: 'Document Checklist', usageCount: 987 },
                                  { toolName: 'Market Analysis Tool', usageCount: 856 },
                                  { toolName: 'Visa Timeline Planner', usageCount: 742 },
                                  { toolName: 'Endorser Matcher', usageCount: 689 },
                                  { toolName: 'Compliance Checker', usageCount: 623 },
                                  { toolName: 'Growth Strategy Builder', usageCount: 578 },
                                ]).slice(0, 10).map((tool, index) => {
                                  const maxUses = (toolAnalytics?.topTools?.[0]?.usageCount || 1847);
                                  const percent = (tool.usageCount / maxUses) * 100;
                                  return (
                                    <motion.div
                                      key={tool.toolName}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover-elevate"
                                    >
                                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                                        index === 0 ? 'bg-amber-500' :
                                        index === 1 ? 'bg-gray-400' :
                                        index === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{tool.toolName}</span>
                                          <span className="font-bold">{tool.usageCount.toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                          <motion.div
                                            className={`absolute inset-y-0 left-0 rounded-full ${
                                              index === 0 ? 'bg-amber-500' :
                                              index === 1 ? 'bg-blue-500' :
                                              index === 2 ? 'bg-purple-500' : 'bg-primary'
                                            }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ delay: index * 0.05 + 0.3, duration: 0.6 }}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Radial Bar Chart & Category Treemap */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Top Tools - Radial View</CardTitle>
                                <CardDescription>Circular visualization of tool popularity</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {toolAnalytics ? (
                                  <ResponsiveContainer width="100%" height={350}>
                                    <RadialBarChart
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="20%"
                                      outerRadius="90%"
                                      data={toolAnalytics.topTools.slice(0, 8).map((tool, index) => ({
                                        name: tool.toolName.length > 20 ? tool.toolName.slice(0, 18) + '...' : tool.toolName,
                                        value: tool.usageCount,
                                        fill: CHART_COLORS[index % CHART_COLORS.length]
                                      }))}
                                    >
                                      <RadialBar background dataKey="value" />
                                      <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
                                      <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      />
                                    </RadialBarChart>
                                  </ResponsiveContainer>
                                ) : (
                                  <Skeleton className="h-[350px]" />
                                )}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Category Treemap</CardTitle>
                                <CardDescription>Hierarchical view of tool categories</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {toolAnalytics ? (
                                  <ResponsiveContainer width="100%" height={350}>
                                    <Treemap
                                      data={toolAnalytics.categoryBreakdown}
                                      dataKey="value"
                                      aspectRatio={4 / 3}
                                      stroke="#fff"
                                      fill="hsl(var(--primary))"
                                    >
                                      <RechartsTooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      />
                                    </Treemap>
                                  </ResponsiveContainer>
                                ) : (
                                  <Skeleton className="h-[350px]" />
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* 4. ENGAGEMENT METRICS - User Interaction Analysis */}
                      {activeSection === 'tools-engagement' && (
                        <>
                          {/* Engagement KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                              { label: 'Avg. Session Duration', value: '14.2 min', change: '+2.3 min', icon: Clock, color: 'blue' },
                              { label: 'Tools per Session', value: '3.8', change: '+0.5', icon: Layers, color: 'purple' },
                              { label: 'Return Rate', value: '67%', change: '+8%', icon: RefreshCw, color: 'green' },
                              { label: 'Feature Adoption', value: '82%', change: '+12%', icon: CheckCircle, color: 'amber' },
                            ].map((metric, index) => (
                              <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className={`hover-elevate border-t-4 border-t-${metric.color}-500`}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                                        <p className="text-3xl font-bold mt-1">{metric.value}</p>
                                        <Badge className={`mt-2 bg-green-500/10 text-green-500`}>{metric.change}</Badge>
                                      </div>
                                      <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                                        <metric.icon className={`h-6 w-6 text-${metric.color}-500`} />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* User Journey Funnel */}
                          <Card>
                            <CardHeader>
                              <CardTitle>User Engagement Funnel</CardTitle>
                              <CardDescription>How users progress through the tool ecosystem</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {[
                                  { stage: 'Visited Tools Hub', users: 450, percent: 100, color: '#3b82f6' },
                                  { stage: 'Opened First Tool', users: 380, percent: 84, color: '#22c55e' },
                                  { stage: 'Completed Tool Action', users: 285, percent: 63, color: '#8b5cf6' },
                                  { stage: 'Saved Progress', users: 198, percent: 44, color: '#f59e0b' },
                                  { stage: 'Exported Results', users: 142, percent: 32, color: '#ec4899' },
                                  { stage: 'Returned Next Day', users: 89, percent: 20, color: '#06b6d4' },
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.stage}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4"
                                  >
                                    <div className="w-48">
                                      <p className="font-medium text-sm">{item.stage}</p>
                                      <p className="text-xs text-muted-foreground">{item.users} users</p>
                                    </div>
                                    <div className="flex-1 relative h-8 rounded-lg overflow-hidden bg-muted/30">
                                      <motion.div
                                        className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3"
                                        style={{ backgroundColor: item.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                      >
                                        <span className="text-white text-sm font-bold">{item.percent}%</span>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Engagement by Feature */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Feature Engagement</CardTitle>
                                <CardDescription>Which features users interact with most</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {[
                                    { feature: 'Save Progress', engagement: 89, color: '#22c55e' },
                                    { feature: 'Smart Tips', engagement: 78, color: '#3b82f6' },
                                    { feature: 'Export Report', engagement: 67, color: '#8b5cf6' },
                                    { feature: 'Action Plan', engagement: 54, color: '#f59e0b' },
                                    { feature: 'QR Code Transfer', engagement: 34, color: '#ec4899' },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.feature}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="flex items-center gap-4"
                                    >
                                      <span className="w-32 text-sm font-medium">{item.feature}</span>
                                      <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="h-full rounded-full"
                                          style={{ backgroundColor: item.color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.engagement}%` }}
                                          transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                                        />
                                      </div>
                                      <span className="w-12 text-sm font-bold text-right">{item.engagement}%</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Session Depth Analysis</CardTitle>
                                <CardDescription>How deep users go in each session</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                  <RechartsBarChart data={[
                                    { depth: '1 tool', sessions: 145 },
                                    { depth: '2-3 tools', sessions: 234 },
                                    { depth: '4-5 tools', sessions: 167 },
                                    { depth: '6-10 tools', sessions: 89 },
                                    { depth: '10+ tools', sessions: 45 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="depth" stroke="hsl(var(--foreground))" fontSize={11} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* 5. COMPLETION RATES - Tool Completion Analytics */}
                      {activeSection === 'tools-completion' && (
                        <>
                          {/* Completion Overview */}
                          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20">
                            <CardContent className="py-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    className="p-3 rounded-xl bg-green-500 text-white"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Target className="h-6 w-6" />
                                  </motion.div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
                                    <p className="text-3xl font-bold text-green-500">73.4%</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Fully Completed</p>
                                    <p className="text-xl font-bold">5,847</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Partially</p>
                                    <p className="text-xl font-bold">2,134</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Abandoned</p>
                                    <p className="text-xl font-bold">866</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Completion by Tool */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle>Completion Rates by Tool</CardTitle>
                                  <CardDescription>Success rates for each tool</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-xs">High (&gt;80%)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-xs">Medium (50-80%)</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-xs">Low (&lt;50%)</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                  { tool: 'Document Checklist', rate: 94, started: 987 },
                                  { tool: 'Visa Timeline Planner', rate: 89, started: 742 },
                                  { tool: 'Innovation Score Calculator', rate: 85, started: 1523 },
                                  { tool: 'Compliance Checker', rate: 82, started: 623 },
                                  { tool: 'Business Plan Generator', rate: 71, started: 1847 },
                                  { tool: 'Financial Projections Tool', rate: 68, started: 1156 },
                                  { tool: 'Pitch Practice Coach', rate: 62, started: 1289 },
                                  { tool: 'Market Analysis Tool', rate: 58, started: 856 },
                                  { tool: 'Growth Strategy Builder', rate: 52, started: 578 },
                                  { tool: 'Endorser Matcher', rate: 45, started: 689 },
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.tool}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 rounded-lg border border-border/50 hover-elevate"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-sm">{item.tool}</span>
                                      <Badge className={
                                        item.rate >= 80 ? 'bg-green-500' :
                                        item.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                      }>
                                        {item.rate}%
                                      </Badge>
                                    </div>
                                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                                      <motion.div
                                        className={`absolute inset-y-0 left-0 rounded-full ${
                                          item.rate >= 80 ? 'bg-green-500' :
                                          item.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.rate}%` }}
                                        transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                                      />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">{item.started} sessions started</p>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Completion Trends */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Completion Rate Trend</CardTitle>
                                <CardDescription>Monthly completion rate progression</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                  <AreaChart data={[
                                    { month: 'Jun', rate: 62 },
                                    { month: 'Jul', rate: 65 },
                                    { month: 'Aug', rate: 68 },
                                    { month: 'Sep', rate: 70 },
                                    { month: 'Oct', rate: 72 },
                                    { month: 'Nov', rate: 73.4 },
                                  ]}>
                                    <defs>
                                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} domain={[50, 100]} tickFormatter={(v) => `${v}%`} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                                    />
                                    <Area type="monotone" dataKey="rate" stroke="#22c55e" fill="url(#completionGradient)" strokeWidth={3} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Abandonment Analysis</CardTitle>
                                <CardDescription>Where users drop off in tool completion</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {[
                                    { stage: 'Started but no input', percent: 8, count: 156 },
                                    { stage: 'Partial completion (10-50%)', percent: 12, count: 234 },
                                    { stage: 'Near completion (50-90%)', percent: 5, count: 98 },
                                    { stage: 'Saved but not exported', percent: 6, count: 117 },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.stage}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="flex items-center gap-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                                    >
                                      <AlertTriangle className="h-5 w-5 text-red-500" />
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{item.stage}</p>
                                        <p className="text-xs text-muted-foreground">{item.count} sessions</p>
                                      </div>
                                      <Badge className="bg-red-500/10 text-red-500">{item.percent}%</Badge>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
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
                {/* Admin Actions Card */}
                <Card data-testid="card-admin-actions">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Admin Actions
                    </CardTitle>
                    <CardDescription>System management and demo data tools</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <Button
                        onClick={async () => {
                          try {
                            toast({ title: "Creating demo data...", description: "Please wait while comprehensive demo data is being created." });
                            const response = await apiRequest('POST', '/api/admin/seed-demo-data', {});
                            const data = await response.json() as { success: boolean; documentsCreated: number; message?: string };
                            if (data.success) {
                              toast({ title: "Demo data created successfully", description: `Created demo user with ${data.documentsCreated} documents` });
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
                            }
                          } catch (error: any) {
                            toast({ title: "Failed to create demo data", description: error.message, variant: "destructive" });
                          }
                        }}
                        data-testid="button-seed-demo-data"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Seed Demo Data
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => refetchOverview()}
                        data-testid="button-refresh-analytics"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                                <AnimatedNumber value={systemMetrics?.cpu ?? 0} decimals={1} />%
                              </div>
                              <Progress value={systemMetrics?.cpu ?? 0} className="mt-4 h-3" />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              {(systemMetrics?.cpu ?? 0) < 70 ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Healthy
                                </>
                              ) : (systemMetrics?.cpu ?? 0) < 90 ? (
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
                                <AnimatedNumber value={systemMetrics?.memory?.percentage ?? 0} decimals={1} />%
                              </div>
                              <Progress value={systemMetrics?.memory?.percentage ?? 0} className="mt-4 h-3" />
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                              {formatBytes(systemMetrics?.memory?.used ?? 0)} / {formatBytes(systemMetrics?.memory?.total ?? 0)}
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
                                <AnimatedNumber value={systemMetrics?.healthScore ?? 0} decimals={0} />
                              </div>
                              <Progress value={systemMetrics?.healthScore ?? 0} className="mt-4 h-3" />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              {(systemMetrics?.healthScore ?? 0) >= 90 ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Excellent
                                </>
                              ) : (systemMetrics?.healthScore ?? 0) >= 70 ? (
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
                              <AnimatedNumber value={systemMetrics?.api?.requestsPerMinute ?? 0} decimals={0} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Avg Response Time</Label>
                            <div className="text-3xl font-bold">
                              <AnimatedNumber value={systemMetrics?.api?.avgResponseTime ?? 0} decimals={0} />
                              <span className="text-lg text-muted-foreground ml-1">ms</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Error Rate</Label>
                            <div className="text-3xl font-bold">
                              <AnimatedNumber value={systemMetrics?.api?.errorRate ?? 0} decimals={2} />
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

                {/* Revenue & Subscriptions Section - 5 Unique PhD-Level Pages */}
                {activeSection.startsWith('revenue') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* 1. REVENUE DASHBOARD - Executive Overview with Real-Time Metrics */}
                      {activeSection === 'revenue-overview' && (
                        <>
                          {/* Real-Time Revenue Ticker */}
                          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20">
                            <CardContent className="py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <motion.div
                                    className="p-3 rounded-xl bg-green-500 text-white"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <DollarSign className="h-6 w-6" />
                                  </motion.div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Live Revenue Today</p>
                                    <p className="text-3xl font-bold text-green-500">£347.00</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">This Week</p>
                                    <p className="text-xl font-bold">£1,892</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">This Month</p>
                                    <p className="text-xl font-bold">£4,890</p>
                                  </div>
                                  <Badge className="bg-green-500 text-white px-4 py-2">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    +23% MTD
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Revenue KPIs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                              <Card className="hover-elevate border-l-4 border-l-green-500">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                    <DollarSign className="h-4 w-4" />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-3xl font-bold">£24,560</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-green-500/10 text-green-500">+34%</Badge>
                                    <span className="text-xs text-muted-foreground">all-time</span>
                                  </div>
                                  <Progress value={78} className="h-1 mt-3" />
                                </CardContent>
                              </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                              <Card className="hover-elevate border-l-4 border-l-blue-500">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <TrendingUp className="h-4 w-4" />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-3xl font-bold">£3,250</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-green-500/10 text-green-500">+15%</Badge>
                                    <span className="text-xs text-muted-foreground">vs. last month</span>
                                  </div>
                                  <Progress value={65} className="h-1 mt-3" />
                                </CardContent>
                              </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                              <Card className="hover-elevate border-l-4 border-l-purple-500">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">ARR</CardTitle>
                                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <Calendar className="h-4 w-4" />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-3xl font-bold">£39,000</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-green-500/10 text-green-500">+28%</Badge>
                                    <span className="text-xs text-muted-foreground">projected</span>
                                  </div>
                                  <Progress value={82} className="h-1 mt-3" />
                                </CardContent>
                              </Card>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                              <Card className="hover-elevate border-l-4 border-l-amber-500">
                                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
                                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Target className="h-4 w-4" />
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-3xl font-bold">£52.40</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-green-500/10 text-green-500">+8%</Badge>
                                    <span className="text-xs text-muted-foreground">per transaction</span>
                                  </div>
                                  <Progress value={54} className="h-1 mt-3" />
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>

                          {/* Revenue Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle>Revenue Trend (12 Months)</CardTitle>
                                    <CardDescription>Monthly recurring revenue growth trajectory</CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-green-500 border-green-500">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Healthy Growth
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <AreaChart data={[
                                    { month: 'Jan', revenue: 1200, target: 1000 },
                                    { month: 'Feb', revenue: 1450, target: 1200 },
                                    { month: 'Mar', revenue: 1800, target: 1500 },
                                    { month: 'Apr', revenue: 2100, target: 1800 },
                                    { month: 'May', revenue: 2400, target: 2100 },
                                    { month: 'Jun', revenue: 2850, target: 2400 },
                                    { month: 'Jul', revenue: 3100, target: 2700 },
                                    { month: 'Aug', revenue: 3400, target: 3000 },
                                    { month: 'Sep', revenue: 3750, target: 3300 },
                                    { month: 'Oct', revenue: 4200, target: 3600 },
                                    { month: 'Nov', revenue: 4890, target: 4000 },
                                    { month: 'Dec', revenue: 5500, target: 4500 },
                                  ]}>
                                    <defs>
                                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      formatter={(value: number) => [`£${value}`, '']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revenueGradient)" strokeWidth={3} name="Revenue" />
                                    <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Target" dot={false} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Revenue Sources</CardTitle>
                                <CardDescription>Breakdown by payment type</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {[
                                    { source: 'Subscriptions', amount: 3250, percent: 66, color: 'bg-green-500' },
                                    { source: 'One-time', amount: 890, percent: 18, color: 'bg-blue-500' },
                                    { source: 'Upgrades', amount: 540, percent: 11, color: 'bg-purple-500' },
                                    { source: 'Add-ons', amount: 210, percent: 5, color: 'bg-amber-500' },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.source}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                          <span className="font-medium">{item.source}</span>
                                        </div>
                                        <span className="font-bold">£{item.amount}</span>
                                      </div>
                                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className={`absolute inset-y-0 left-0 rounded-full ${item.color}`}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.percent}%` }}
                                          transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground text-right">{item.percent}% of total</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Transactions */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle>Recent Transactions</CardTitle>
                                  <CardDescription>Latest payment activities</CardDescription>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {[
                                  { user: 'Nnaemeka Umeh', email: 'emexy8088@yahoo.com', amount: 49, tier: 'Premium', time: '2 hours ago', status: 'success' },
                                  { user: 'Sarah Johnson', email: 'sarah.j@email.com', amount: 89, tier: 'Enterprise', time: '5 hours ago', status: 'success' },
                                  { user: 'Michael Chen', email: 'm.chen@startup.io', amount: 29, tier: 'Basic', time: '1 day ago', status: 'success' },
                                  { user: 'Emma Williams', email: 'emma.w@company.uk', amount: 129, tier: 'Ultimate', time: '2 days ago', status: 'success' },
                                ].map((tx, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {tx.user.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{tx.user}</p>
                                        <p className="text-xs text-muted-foreground">{tx.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline">{tx.tier}</Badge>
                                      <span className="font-bold text-green-500">+£{tx.amount}</span>
                                      <span className="text-xs text-muted-foreground">{tx.time}</span>
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 2. MRR ANALYTICS - Deep Dive Monthly Recurring Revenue */}
                      {activeSection === 'revenue-mrr' && (
                        <>
                          {/* MRR Summary Header */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                              { label: 'Current MRR', value: '£3,250', change: '+15%', icon: DollarSign, color: 'green' },
                              { label: 'New MRR', value: '£420', change: '+8 subs', icon: Plus, color: 'blue' },
                              { label: 'Expansion MRR', value: '£180', change: '5 upgrades', icon: TrendingUp, color: 'purple' },
                              { label: 'Churned MRR', value: '£87', change: '-2 subs', icon: TrendingDown, color: 'red' },
                              { label: 'Net New MRR', value: '£513', change: '+18%', icon: Zap, color: 'amber' },
                            ].map((metric, index) => (
                              <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className={`hover-elevate border-t-4 border-t-${metric.color}-500`}>
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                                      <metric.icon className={`h-4 w-4 text-${metric.color}-500`} />
                                    </div>
                                    <p className="text-2xl font-bold">{metric.value}</p>
                                    <Badge className={`mt-2 ${metric.color === 'red' ? 'bg-red-500/10 text-red-500' : `bg-${metric.color}-500/10 text-${metric.color}-500`}`}>
                                      {metric.change}
                                    </Badge>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* MRR Trend Chart */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle>MRR Growth Analysis</CardTitle>
                                  <CardDescription>Monthly breakdown with movement analysis</CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="text-xs">New</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs">Expansion</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span className="text-xs">Churned</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={350}>
                                <RechartsBarChart data={[
                                  { month: 'Jul', new: 320, expansion: 80, churned: -45, net: 355 },
                                  { month: 'Aug', new: 380, expansion: 120, churned: -60, net: 440 },
                                  { month: 'Sep', new: 290, expansion: 95, churned: -35, net: 350 },
                                  { month: 'Oct', new: 410, expansion: 150, churned: -70, net: 490 },
                                  { month: 'Nov', new: 420, expansion: 180, churned: -87, net: 513 },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
                                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(v) => `£${Math.abs(v)}`} />
                                  <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value: number) => [`£${Math.abs(value)}`, '']}
                                  />
                                  <Bar dataKey="new" fill="#22c55e" name="New MRR" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="expansion" fill="#3b82f6" name="Expansion" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="churned" fill="#ef4444" name="Churned" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          {/* MRR by Tier & Cohort */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>MRR by Subscription Tier</CardTitle>
                                <CardDescription>Revenue contribution per tier</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {[
                                    { tier: 'Ultimate (£129)', mrr: 645, users: 5, percent: 20, color: '#8b5cf6' },
                                    { tier: 'Enterprise (£89)', mrr: 1068, users: 12, percent: 33, color: '#f59e0b' },
                                    { tier: 'Premium (£49)', mrr: 1372, users: 28, percent: 42, color: '#3b82f6' },
                                    { tier: 'Basic (£29)', mrr: 165, users: 42, percent: 5, color: '#22c55e' },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.tier}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                          <span className="font-medium">{item.tier}</span>
                                          <Badge variant="secondary">{item.users} users</Badge>
                                        </div>
                                        <span className="font-bold">£{item.mrr}/mo</span>
                                      </div>
                                      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="absolute inset-y-0 left-0 rounded-full"
                                          style={{ backgroundColor: item.color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.percent}%` }}
                                          transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                        />
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>MRR Cohort Analysis</CardTitle>
                                <CardDescription>Revenue retention by signup month</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {[
                                    { cohort: 'Nov 2024', initial: 420, current: 420, retention: 100, status: 'new' },
                                    { cohort: 'Oct 2024', initial: 380, current: 365, retention: 96, status: 'healthy' },
                                    { cohort: 'Sep 2024', initial: 290, current: 275, retention: 95, status: 'healthy' },
                                    { cohort: 'Aug 2024', initial: 350, current: 310, retention: 89, status: 'watch' },
                                    { cohort: 'Jul 2024', initial: 420, current: 350, retention: 83, status: 'concern' },
                                  ].map((cohort, index) => (
                                    <motion.div
                                      key={cohort.cohort}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.08 }}
                                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                    >
                                      <div>
                                        <p className="font-medium">{cohort.cohort}</p>
                                        <p className="text-xs text-muted-foreground">£{cohort.initial} → £{cohort.current}</p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Badge className={
                                          cohort.status === 'new' ? 'bg-blue-500' :
                                          cohort.status === 'healthy' ? 'bg-green-500' :
                                          cohort.status === 'watch' ? 'bg-amber-500' : 'bg-red-500'
                                        }>
                                          {cohort.retention}% retained
                                        </Badge>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* 3. SUBSCRIPTIONS - Active Subscription Management */}
                      {activeSection === 'revenue-subscriptions' && (
                        <>
                          {/* Subscription Overview Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="hover-elevate bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                                    <p className="text-3xl font-bold">87</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">+8 this month</Badge>
                                  </div>
                                  <CreditCard className="h-12 w-12 text-blue-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Renewal Rate</p>
                                    <p className="text-3xl font-bold">94.2%</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">Excellent</Badge>
                                  </div>
                                  <RefreshCw className="h-12 w-12 text-green-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Due for Renewal</p>
                                    <p className="text-3xl font-bold">12</p>
                                    <Badge className="mt-2 bg-amber-500/10 text-amber-500">Next 7 days</Badge>
                                  </div>
                                  <Clock className="h-12 w-12 text-amber-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">At Risk</p>
                                    <p className="text-3xl font-bold">3</p>
                                    <Badge className="mt-2 bg-red-500/10 text-red-500">Needs attention</Badge>
                                  </div>
                                  <AlertTriangle className="h-12 w-12 text-red-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Active Subscriptions List */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle>Active Subscriptions</CardTitle>
                                  <CardDescription>All current paying subscribers</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[400px]">
                                <div className="space-y-3">
                                  {[
                                    { user: 'Nnaemeka Umeh', email: 'emexy8088@yahoo.com', tier: 'Premium', amount: 49, status: 'active', nextBilling: 'Dec 15, 2024', since: 'Oct 2024' },
                                    { user: 'Sarah Johnson', email: 'sarah.j@email.com', tier: 'Enterprise', amount: 89, status: 'active', nextBilling: 'Dec 20, 2024', since: 'Sep 2024' },
                                    { user: 'Michael Chen', email: 'm.chen@startup.io', tier: 'Basic', amount: 29, status: 'active', nextBilling: 'Dec 1, 2024', since: 'Nov 2024' },
                                    { user: 'Emma Williams', email: 'emma.w@company.uk', tier: 'Ultimate', amount: 129, status: 'active', nextBilling: 'Jan 5, 2025', since: 'Aug 2024' },
                                    { user: 'James Brown', email: 'jbrown@tech.co', tier: 'Premium', amount: 49, status: 'renewing', nextBilling: 'Nov 28, 2024', since: 'Jul 2024' },
                                    { user: 'Lisa Anderson', email: 'lisa.a@biz.uk', tier: 'Enterprise', amount: 89, status: 'at_risk', nextBilling: 'Nov 30, 2024', since: 'Jun 2024' },
                                  ].map((sub, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className={`flex items-center justify-between p-4 rounded-lg border ${
                                        sub.status === 'at_risk' ? 'border-red-500/50 bg-red-500/5' :
                                        sub.status === 'renewing' ? 'border-amber-500/50 bg-amber-500/5' :
                                        'border-border/50'
                                      } hover-elevate`}
                                    >
                                      <div className="flex items-center gap-4">
                                        <Avatar>
                                          <AvatarFallback className="bg-primary/10">
                                            {sub.user.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{sub.user}</p>
                                          <p className="text-xs text-muted-foreground">{sub.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-6">
                                        <div className="text-center">
                                          <Badge className={
                                            sub.tier === 'Ultimate' ? 'bg-purple-500' :
                                            sub.tier === 'Enterprise' ? 'bg-amber-500' :
                                            sub.tier === 'Premium' ? 'bg-blue-500' : 'bg-green-500'
                                          }>{sub.tier}</Badge>
                                          <p className="text-xs text-muted-foreground mt-1">Since {sub.since}</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="font-bold">£{sub.amount}/mo</p>
                                          <p className="text-xs text-muted-foreground">Next: {sub.nextBilling}</p>
                                        </div>
                                        <Badge variant="outline" className={
                                          sub.status === 'at_risk' ? 'text-red-500 border-red-500' :
                                          sub.status === 'renewing' ? 'text-amber-500 border-amber-500' :
                                          'text-green-500 border-green-500'
                                        }>
                                          {sub.status === 'at_risk' ? 'At Risk' : sub.status === 'renewing' ? 'Renewing Soon' : 'Active'}
                                        </Badge>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 4. TIER DISTRIBUTION - Visual Tier Analysis */}
                      {activeSection === 'revenue-tiers' && (
                        <>
                          {/* Tier Overview Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[
                              { tier: 'Free', price: 0, users: 245, color: '#94a3b8', icon: Users },
                              { tier: 'Basic', price: 29, users: 42, color: '#22c55e', icon: Zap },
                              { tier: 'Premium', price: 49, users: 28, color: '#3b82f6', icon: Star },
                              { tier: 'Enterprise', price: 89, users: 12, color: '#f59e0b', icon: Building },
                              { tier: 'Ultimate', price: 129, users: 5, color: '#8b5cf6', icon: Crown },
                            ].map((tier, index) => (
                              <motion.div
                                key={tier.tier}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="hover-elevate text-center" style={{ borderTopColor: tier.color, borderTopWidth: '4px' }}>
                                  <CardContent className="pt-6">
                                    <div className="p-3 rounded-full mx-auto w-fit" style={{ backgroundColor: `${tier.color}20` }}>
                                      <tier.icon className="h-6 w-6" style={{ color: tier.color }} />
                                    </div>
                                    <p className="font-bold text-lg mt-3">{tier.tier}</p>
                                    <p className="text-2xl font-bold mt-1" style={{ color: tier.color }}>
                                      {tier.price === 0 ? 'Free' : `£${tier.price}`}
                                    </p>
                                    <Badge className="mt-2" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                                      {tier.users} users
                                    </Badge>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Tier Distribution Charts */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>User Distribution by Tier</CardTitle>
                                <CardDescription>Percentage breakdown of subscribers</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Free', value: 245, fill: '#94a3b8' },
                                        { name: 'Basic', value: 42, fill: '#22c55e' },
                                        { name: 'Premium', value: 28, fill: '#3b82f6' },
                                        { name: 'Enterprise', value: 12, fill: '#f59e0b' },
                                        { name: 'Ultimate', value: 5, fill: '#8b5cf6' },
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={70}
                                      outerRadius={110}
                                      paddingAngle={3}
                                      dataKey="value"
                                    >
                                    </Pie>
                                    <RechartsTooltip formatter={(value: number, name: string) => [`${value} users`, name]} />
                                  </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                  {[
                                    { name: 'Free', color: '#94a3b8' },
                                    { name: 'Basic', color: '#22c55e' },
                                    { name: 'Premium', color: '#3b82f6' },
                                    { name: 'Enterprise', color: '#f59e0b' },
                                    { name: 'Ultimate', color: '#8b5cf6' },
                                  ].map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-sm">{item.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Revenue by Tier</CardTitle>
                                <CardDescription>Monthly revenue contribution</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <RechartsBarChart data={[
                                    { tier: 'Free', revenue: 0, users: 245 },
                                    { tier: 'Basic', revenue: 1218, users: 42 },
                                    { tier: 'Premium', revenue: 1372, users: 28 },
                                    { tier: 'Enterprise', revenue: 1068, users: 12 },
                                    { tier: 'Ultimate', revenue: 645, users: 5 },
                                  ]} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                                    <YAxis type="category" dataKey="tier" stroke="hsl(var(--foreground))" fontSize={12} width={80} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      formatter={(value: number) => [`£${value}/mo`, 'Revenue']}
                                    />
                                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                      {[
                                        { fill: '#94a3b8' },
                                        { fill: '#22c55e' },
                                        { fill: '#3b82f6' },
                                        { fill: '#f59e0b' },
                                        { fill: '#8b5cf6' },
                                      ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                      ))}
                                    </Bar>
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Tier Conversion Funnel */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Tier Upgrade Funnel</CardTitle>
                              <CardDescription>User progression through subscription tiers</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between gap-4">
                                {[
                                  { tier: 'Free', users: 245, converts: 42, rate: 17.1 },
                                  { tier: 'Basic', users: 42, converts: 28, rate: 66.7 },
                                  { tier: 'Premium', users: 28, converts: 12, rate: 42.9 },
                                  { tier: 'Enterprise', users: 12, converts: 5, rate: 41.7 },
                                  { tier: 'Ultimate', users: 5, converts: 0, rate: 0 },
                                ].map((stage, index, arr) => (
                                  <div key={stage.tier} className="flex-1 relative">
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="text-center p-4 rounded-lg bg-muted/50"
                                    >
                                      <p className="text-xs text-muted-foreground">{stage.tier}</p>
                                      <p className="text-2xl font-bold mt-1">{stage.users}</p>
                                      {index < arr.length - 1 && (
                                        <Badge className="mt-2 bg-green-500/10 text-green-500">
                                          {stage.rate}% upgrade
                                        </Badge>
                                      )}
                                    </motion.div>
                                    {index < arr.length - 1 && (
                                      <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 5. LTV ANALYSIS - Customer Lifetime Value */}
                      {activeSection === 'revenue-ltv' && (
                        <>
                          {/* LTV Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="hover-elevate border-l-4 border-l-purple-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Average LTV</p>
                                    <p className="text-3xl font-bold">£156</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">+12% YoY</Badge>
                                  </div>
                                  <LineChart className="h-10 w-10 text-purple-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-green-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                                    <p className="text-3xl font-bold">4.2:1</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">Healthy</Badge>
                                  </div>
                                  <Target className="h-10 w-10 text-green-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-blue-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Avg. Customer Lifespan</p>
                                    <p className="text-3xl font-bold">8.2 mo</p>
                                    <Badge className="mt-2 bg-blue-500/10 text-blue-500">+1.3 mo</Badge>
                                  </div>
                                  <Clock className="h-10 w-10 text-blue-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-amber-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">CAC Payback</p>
                                    <p className="text-3xl font-bold">2.1 mo</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">Fast</Badge>
                                  </div>
                                  <Zap className="h-10 w-10 text-amber-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* LTV by Tier */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Lifetime Value by Subscription Tier</CardTitle>
                              <CardDescription>Projected revenue over customer lifetime</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                  { tier: 'Basic', ltv: 87, lifespan: 3, color: '#22c55e', arpu: 29 },
                                  { tier: 'Premium', ltv: 294, lifespan: 6, color: '#3b82f6', arpu: 49 },
                                  { tier: 'Enterprise', ltv: 712, lifespan: 8, color: '#f59e0b', arpu: 89 },
                                  { tier: 'Ultimate', ltv: 1548, lifespan: 12, color: '#8b5cf6', arpu: 129 },
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.tier}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Card className="text-center" style={{ borderColor: item.color, borderWidth: '2px' }}>
                                      <CardContent className="pt-6">
                                        <p className="font-medium" style={{ color: item.color }}>{item.tier}</p>
                                        <p className="text-4xl font-bold mt-2">£{item.ltv}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Lifetime Value</p>
                                        <Separator className="my-4" />
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">ARPU</span>
                                            <span className="font-medium">£{item.arpu}/mo</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Avg. Lifespan</span>
                                            <span className="font-medium">{item.lifespan} months</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* LTV Trend & Cohort */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>LTV Trend Over Time</CardTitle>
                                <CardDescription>Average customer lifetime value progression</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <AreaChart data={[
                                    { month: 'Jun', ltv: 98 },
                                    { month: 'Jul', ltv: 112 },
                                    { month: 'Aug', ltv: 125 },
                                    { month: 'Sep', ltv: 138 },
                                    { month: 'Oct', ltv: 148 },
                                    { month: 'Nov', ltv: 156 },
                                  ]}>
                                    <defs>
                                      <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(v) => `£${v}`} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      formatter={(value: number) => [`£${value}`, 'LTV']}
                                    />
                                    <Area type="monotone" dataKey="ltv" stroke="#8b5cf6" fill="url(#ltvGradient)" strokeWidth={3} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>LTV:CAC Analysis</CardTitle>
                                <CardDescription>Return on customer acquisition investment</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-6">
                                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                                    <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                                    <p className="text-5xl font-bold text-green-500 mt-2">4.2:1</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Industry benchmark: 3:1 (You're outperforming!)
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-xs text-muted-foreground">Avg. LTV</p>
                                      <p className="text-2xl font-bold">£156</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-xs text-muted-foreground">Avg. CAC</p>
                                      <p className="text-2xl font-bold">£37</p>
                                    </div>
                                  </div>
                                  <Card className="bg-blue-500/5 border-blue-500/20">
                                    <CardContent className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm text-blue-500 font-medium">Insight</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Your healthy LTV:CAC ratio indicates strong unit economics. Consider increasing marketing spend.
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}
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

                      {/* Referral Codes Management */}
                      {activeSection === 'referrals-codes' && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Link2 className="h-5 w-5" />
                                  Referral Codes Management
                                </CardTitle>
                                <CardDescription>All active referral codes in the system</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {referralAnalyticsLoading ? (
                              <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : referralAnalytics?.topReferrers && referralAnalytics.topReferrers.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead className="text-center">Total Referrals</TableHead>
                                    <TableHead className="text-center">Successful</TableHead>
                                    <TableHead className="text-right">Earnings</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {referralAnalytics.topReferrers.map((referrer) => (
                                    <TableRow key={referrer.userId}>
                                      <TableCell>
                                        <Badge variant="outline" className="font-mono text-base">
                                          {referrer.code}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="font-medium">{referrer.email}</TableCell>
                                      <TableCell>
                                        <Badge variant="secondary">15% off</Badge>
                                      </TableCell>
                                      <TableCell className="text-center">{referrer.referrals}</TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant="default" className="bg-green-500">{referrer.referrals}</Badge>
                                      </TableCell>
                                      <TableCell className="text-right text-green-500 font-medium">
                                        £{(referrer.earnings / 100).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="py-12 text-center text-muted-foreground">
                                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No referral codes yet</p>
                                <p>Users can generate referral codes from their dashboard</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
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

                {/* Lawyer Review Center Section */}
                {activeSection.startsWith('lawyer') && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Dashboard Overview Cards */}
                      {activeSection === 'lawyer-dashboard' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-orange-500">{lawyerAnalytics?.totalReviews || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">All time document reviews</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-yellow-500">{lawyerAnalytics?.pendingReviews || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Awaiting assignment</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-blue-500">{lawyerAnalytics?.inProgressReviews || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Currently under review</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-3xl font-bold text-green-500">{lawyerAnalytics?.completedReviews || 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Successfully reviewed</p>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Approval Rate Card */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  Review Outcomes
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Approved</span>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={lawyerAnalytics?.totalReviews ? (lawyerAnalytics.approvedReviews / lawyerAnalytics.totalReviews) * 100 : 0} 
                                        className="w-32 h-2" 
                                      />
                                      <span className="font-medium text-green-500">{lawyerAnalytics?.approvedReviews || 0}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Needs Revision</span>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={lawyerAnalytics?.totalReviews ? (lawyerAnalytics.needsRevisionReviews / lawyerAnalytics.totalReviews) * 100 : 0} 
                                        className="w-32 h-2" 
                                      />
                                      <span className="font-medium text-yellow-500">{lawyerAnalytics?.needsRevisionReviews || 0}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Overdue</span>
                                    <div className="flex items-center gap-2">
                                      <Progress 
                                        value={lawyerAnalytics?.totalReviews ? (lawyerAnalytics.overdueReviews / lawyerAnalytics.totalReviews) * 100 : 0} 
                                        className="w-32 h-2" 
                                      />
                                      <span className="font-medium text-red-500">{lawyerAnalytics?.overdueReviews || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Turnaround Time Card */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Clock className="h-5 w-5 text-blue-500" />
                                  Performance Metrics
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Avg. Turnaround Time</p>
                                      <p className="text-2xl font-bold">{lawyerAnalytics?.averageTurnaroundHours || 0} hrs</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                      <Clock className="h-6 w-6 text-blue-500" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Active Lawyers</p>
                                      <p className="text-2xl font-bold">{lawyerTeam?.filter(l => l.isAvailable).length || 0}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                      <UserCheck className="h-6 w-6 text-green-500" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* Review Queue */}
                      {(activeSection === 'lawyer-queue' || activeSection === 'lawyer-documents') && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  Document Review Queue
                                </CardTitle>
                                <CardDescription>
                                  {activeSection === 'lawyer-queue' ? 'Pending reviews awaiting assignment' : 'All document reviews'}
                                </CardDescription>
                              </div>
                              <Button variant="outline" onClick={() => refetchLawyerReviews()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {lawyerReviewsLoading ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : lawyerReviews && lawyerReviews.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>User Tier</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {lawyerReviews
                                    .filter(r => activeSection === 'lawyer-queue' ? r.status === 'pending' : true)
                                    .map((review) => (
                                      <TableRow key={review.id} className={review.isOverdue ? 'bg-red-500/5' : ''}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Business Plan</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className="capitalize">{review.tier}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant={review.priority === 'urgent' ? 'destructive' : review.priority === 'high' ? 'default' : 'secondary'}
                                            className="capitalize"
                                          >
                                            {review.priority}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant={
                                              review.status === 'completed' ? 'default' : 
                                              review.status === 'in_review' ? 'secondary' : 
                                              review.status === 'assigned' ? 'outline' : 
                                              'secondary'
                                            }
                                            className="capitalize"
                                          >
                                            {review.status.replace('_', ' ')}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {format(new Date(review.requestedAt), 'MMM d, HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                          {review.dueDate ? (
                                            <span className={review.isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                                              {format(new Date(review.dueDate), 'MMM d, HH:mm')}
                                              {review.isOverdue && ' (Overdue)'}
                                            </span>
                                          ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="py-12 text-center text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No reviews in queue</p>
                                <p>Reviews will appear here when users request document reviews</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Lawyer Team Management */}
                      {activeSection === 'lawyer-team' && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Users className="h-5 w-5" />
                                  Immigration Lawyer Team
                                </CardTitle>
                                <CardDescription>Manage lawyers who review business plans and documents</CardDescription>
                              </div>
                              <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Lawyer
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {lawyerTeamLoading ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                  <Skeleton key={i} className="h-20 w-full" />
                                ))}
                              </div>
                            ) : lawyerTeam && lawyerTeam.length > 0 ? (
                              <div className="space-y-4">
                                {lawyerTeam.map((lawyer) => (
                                  <div key={lawyer.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover-elevate">
                                    <div className="flex items-center gap-4">
                                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${lawyer.isAvailable ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                                        <span className="text-lg font-bold">
                                          {lawyer.firstName[0]}{lawyer.lastName[0]}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="font-medium">{lawyer.firstName} {lawyer.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{lawyer.email}</p>
                                        {lawyer.firmName && (
                                          <p className="text-xs text-muted-foreground">{lawyer.firmName}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-center">
                                        <p className="text-2xl font-bold">{lawyer.currentReviewCount}/{lawyer.maxConcurrentReviews}</p>
                                        <p className="text-xs text-muted-foreground">Active Reviews</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-2xl font-bold">{lawyer.totalReviewsCompleted}</p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                      </div>
                                      {lawyer.averageRating && (
                                        <div className="text-center">
                                          <p className="text-2xl font-bold">{lawyer.averageRating}</p>
                                          <p className="text-xs text-muted-foreground">Avg. Rating</p>
                                        </div>
                                      )}
                                      <Badge variant={lawyer.isAvailable ? 'default' : 'secondary'}>
                                        {lawyer.isAvailable ? 'Available' : 'Unavailable'}
                                      </Badge>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Performance
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-12 text-center text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No lawyers added yet</p>
                                <p className="mb-4">Add immigration lawyers to handle document reviews</p>
                                <Button>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add First Lawyer
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Completed Reviews */}
                      {activeSection === 'lawyer-completed' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              Completed Reviews
                            </CardTitle>
                            <CardDescription>Successfully reviewed and approved documents</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {lawyerReviewsLoading ? (
                              <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : lawyerReviews?.filter(r => r.status === 'completed').length ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Verdict</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Compliance</TableHead>
                                    <TableHead>Completed</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {lawyerReviews
                                    .filter(r => r.status === 'completed')
                                    .map((review) => (
                                      <TableRow key={review.id}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">Business Plan</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={review.overallVerdict === 'approved' ? 'default' : 'secondary'}>
                                            {review.overallVerdict || 'N/A'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {review.confidenceScore !== null ? (
                                            <span className="font-medium">{review.confidenceScore}%</span>
                                          ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                          {review.complianceScore !== null ? (
                                            <span className="font-medium">{review.complianceScore}%</span>
                                          ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {review.completedAt ? format(new Date(review.completedAt), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Report
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No completed reviews yet</p>
                                <p>Completed reviews will appear here</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Comments placeholder */}
                      {activeSection === 'lawyer-comments' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Mail className="h-5 w-5" />
                              Review Comments & Notes
                            </CardTitle>
                            <CardDescription>Internal notes and feedback on document reviews</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="py-12 text-center text-muted-foreground">
                              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">Comments Panel</p>
                              <p>Select a specific review to view and add comments</p>
                            </div>
                          </CardContent>
                        </Card>
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
            </div>
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
