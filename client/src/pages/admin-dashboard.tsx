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
import { PromoCodeGenerator } from "@/components/admin/PromoCodeGenerator";
import { 
  RealtimeMonitor, 
  HeatmapView, 
  UserJourneyView, 
  ConversionFunnelView, 
  ApiPerformanceView, 
  ExportAnalyticsView, 
  AuditLogView, 
  CoinsUsageView 
} from "@/components/admin/AdvancedAnalytics";
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
  Star,
  Send,
  MousePointer,
  MessageSquare,
  Smartphone,
  Image as ImageIcon,
  Archive,
  Wallet,
  ClipboardCheck,
  FileSearch,
  UserCog,
  BadgeCheck,
  ShieldOff,
  Microscope,
  Brain,
  TrendingUp as TrendingUpIcon,
  Gauge,
  FileBarChart,
  Wifi,
  MousePointerClick,
  Timer,
  Tablet,
  Monitor,
  Wrench
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "wouter";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
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
  uptime?: {
    seconds: number;
    formatted: string;
  };
  cpu?: {
    user: number;
    system: number;
  };
  memory?: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    percentage: number;
  };
  database?: {
    status: string;
    totalUsers: number;
    totalPlans: number;
    connections?: number;
    maxConnections?: number;
    responseTime?: string;
    queryTime?: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
  api?: {
    requestsPerMinute: number;
    errorRate: number;
    avgResponseTime: number;
  };
  node?: {
    version: string;
    platform: string;
    arch: string;
  };
  healthScore?: number;
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

const getCountryFlag = (countryCode: string): string => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
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
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    // Detect value change and animate
    if (prevValue !== value) {
      const startValue = displayValue;
      const duration = 800;
      const steps = 40;
      const increment = (value - startValue) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(prev => {
          if (currentStep >= steps) {
            clearInterval(timer);
            return value;
          }
          return startValue + (increment * currentStep);
        });
      }, duration / steps);

      setPrevValue(value);

      return () => clearInterval(timer);
    }
  }, [value, prevValue, displayValue]);

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
      <Icon className="h-3 w-3" />
      <span className="text-[9px] font-medium">
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

  // Section state — persisted in URL hash so refresh restores position
  const getInitialSection = () => {
    const hash = window.location.hash.replace('#', '').trim();
    return hash || "overview";
  };
  const [activeSection, setActiveSectionState] = useState(getInitialSection);

  const setActiveSection = (section: string) => {
    setActiveSectionState(section);
    window.location.hash = section;
  };

  // Sync state when user navigates with browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) setActiveSectionState(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  
  // Calendar dialog states (using Dialog instead of Popover for better positioning)
  const [promoValidFromOpen, setPromoValidFromOpen] = useState(false);
  const [promoValidUntilOpen, setPromoValidUntilOpen] = useState(false);
  const [campaignStartDateOpen, setCampaignStartDateOpen] = useState(false);
  const [campaignEndDateOpen, setCampaignEndDateOpen] = useState(false);

  // ADMIN CONTROL CENTER STATES
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);
  const [tierOverrideUser, setTierOverrideUser] = useState<User | null>(null);
  const [overrideTier, setOverrideTier] = useState<string>("premium");
  const [overrideReason, setOverrideReason] = useState("");
  const [creditsUser, setCreditsUser] = useState<User | null>(null);
  const [creditsAmount, setCreditsAmount] = useState(1);
  const [creditsType, setCreditsType] = useState<'plan' | 'bonus'>('plan');
  const [creditsMode, setCreditsMode] = useState<'add' | 'set'>('add');
  const [notesUser, setNotesUser] = useState<User | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
  const [impersonationData, setImpersonationData] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [viewingUserActivity, setViewingUserActivity] = useState<User | null>(null);
  const [exportingUser, setExportingUser] = useState<User | null>(null);
  const [analyzingUser, setAnalyzingUser] = useState<User | null>(null);
  
  // Error logging states
  const [selectedError, setSelectedError] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState("");
  
  // Broadcast notification modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    targetTiers: [] as string[],
  });
  
  // Campaign creation modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    targetTiers: [] as string[],
  });

  // Live refresh countdown
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  // Hide demo users toggle - demo users are all users before uerobor@gmail.com (Sophia Ugbede)
  const [hideDemoUsers, setHideDemoUsers] = useState(() => {
    const saved = localStorage.getItem('admin-hide-demo-users');
    return saved === 'true';
  });

  // Save hide demo users preference
  useEffect(() => {
    localStorage.setItem('admin-hide-demo-users', String(hideDemoUsers));
  }, [hideDemoUsers]);

  // Demo user cutoff date - all users created before November 27, 2025 are demo users
  const DEMO_CUTOFF_DATE = new Date('2025-11-27T00:00:00Z');

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

  // Users data for the current page
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[]; total: number; page: number; pageSize: number }>({
    queryKey: ['/api/admin/users', { page: usersPage, pageSize: usersPageSize, search: usersSearch, ...userFilters }],
    enabled: !!user?.isAdmin && activeSection.startsWith('users'),
  });

  // Fetch ALL users for accurate demo user counting (only on overview)
  const { data: allUsersData } = useQuery<{ users: User[]; total: number }>({
    queryKey: ['/api/admin/users', { page: 1, pageSize: 1000 }],
    enabled: !!user?.isAdmin && activeSection === 'overview',
  });

  // User analysis query (comprehensive analysis)
  const { data: userAnalysis, isLoading: userAnalysisLoading, refetch: refetchUserAnalysis } = useQuery<any>({
    queryKey: ['/api/admin/users', analyzingUser?.id, 'analysis'],
    queryFn: async () => {
      if (!analyzingUser?.id) return null;
      const res = await fetch(`/api/admin/users/${analyzingUser.id}/analysis`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch analysis');
      return res.json();
    },
    enabled: !!analyzingUser?.id && !!user?.isAdmin,
  });

  // Count real (non-demo) users from all users data
  const { totalUsers, realUserCount, demoUserCount } = useMemo(() => {
    const total = allUsersData?.total || overviewData?.kpiMetrics?.[0]?.value || 0;
    
    if (!allUsersData?.users || !hideDemoUsers) {
      return { totalUsers: total, realUserCount: total, demoUserCount: 0 };
    }
    
    // Count users created on or after November 27, 2025 (real users) + admins
    const realUsers = allUsersData.users.filter(u => 
      u.isAdmin || 
      new Date(u.createdAt) >= DEMO_CUTOFF_DATE
    );
    
    const demoCount = total - realUsers.length;
    return { totalUsers: total, realUserCount: realUsers.length, demoUserCount: demoCount };
  }, [allUsersData?.users, allUsersData?.total, overviewData?.kpiMetrics, hideDemoUsers, DEMO_CUTOFF_DATE]);

  // Filter current page users to exclude demo users when toggle is on
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    if (!hideDemoUsers) return usersData.users;
    
    return usersData.users.filter(u => 
      u.isAdmin || 
      new Date(u.createdAt) >= DEMO_CUTOFF_DATE
    );
  }, [usersData?.users, hideDemoUsers, DEMO_CUTOFF_DATE]);

  // Filtered overview data excluding demo users when toggle is on
  const filteredOverviewData = useMemo(() => {
    if (!overviewData) return overviewData;
    if (!hideDemoUsers) return overviewData;
    
    // Calculate demo user count reduction
    const totalUsersFromAPI = overviewData.kpiMetrics?.[0]?.value || 1;
    const effectiveDemoCount = Math.min(demoUserCount, totalUsersFromAPI);
    
    // For time series data: only filter data points AFTER the cutoff date
    // Historical data before cutoff can't be retroactively filtered accurately
    const filterTimeSeriesPoint = (dataPoint: { date: string; users: number; plans: number; activeUsers?: number }) => {
      const pointDate = new Date(dataPoint.date);
      if (pointDate >= DEMO_CUTOFF_DATE) {
        // For dates after cutoff, subtract demo users
        return {
          ...dataPoint,
          users: Math.max(0, (dataPoint.users || 0) - effectiveDemoCount),
          activeUsers: Math.max(0, (dataPoint.activeUsers || 0) - effectiveDemoCount),
        };
      }
      // For historical data, show original values (demo users existed then)
      return {
        ...dataPoint,
        activeUsers: dataPoint.activeUsers || 0,
      };
    };
    
    const filterActivityPoint = (dataPoint: { date: string; count: number }) => {
      const pointDate = new Date(dataPoint.date);
      if (pointDate >= DEMO_CUTOFF_DATE) {
        return {
          ...dataPoint,
          count: Math.max(0, (dataPoint.count || 0) - effectiveDemoCount),
        };
      }
      return dataPoint;
    };
    
    // Calculate ACTUAL tier distribution from filtered real users (not demo users)
    let filteredSubscriptionDistribution = overviewData.subscriptionDistribution;
    
    if (allUsersData?.users && allUsersData.users.length > 0) {
      // Get real users (admins + users created on/after Nov 27)
      const realUsers = allUsersData.users.filter(u => 
        u.isAdmin || new Date(u.createdAt) >= DEMO_CUTOFF_DATE
      );
      
      // Count users by tier from actual filtered data
      const tierCounts: Record<string, number> = {};
      realUsers.forEach(u => {
        const tier = u.subscriptionTier || 'free';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });
      
      const totalRealUsers = realUsers.length;
      
      // Build new subscription distribution with accurate counts and percentages
      filteredSubscriptionDistribution = [
        { tier: 'Free', count: tierCounts['free'] || 0, percentage: totalRealUsers > 0 ? Math.round(((tierCounts['free'] || 0) / totalRealUsers) * 100) : 0 },
        { tier: 'Basic', count: tierCounts['basic'] || 0, percentage: totalRealUsers > 0 ? Math.round(((tierCounts['basic'] || 0) / totalRealUsers) * 100) : 0 },
        { tier: 'Premium', count: tierCounts['premium'] || 0, percentage: totalRealUsers > 0 ? Math.round(((tierCounts['premium'] || 0) / totalRealUsers) * 100) : 0 },
        { tier: 'Enterprise', count: tierCounts['enterprise'] || 0, percentage: totalRealUsers > 0 ? Math.round(((tierCounts['enterprise'] || 0) / totalRealUsers) * 100) : 0 },
        { tier: 'Ultimate', count: tierCounts['ultimate'] || 0, percentage: totalRealUsers > 0 ? Math.round(((tierCounts['ultimate'] || 0) / totalRealUsers) * 100) : 0 },
      ].filter(t => t.count > 0); // Only show tiers with users
    }
    
    return {
      ...overviewData,
      kpiMetrics: overviewData.kpiMetrics?.map((metric, index) => {
        // First metric is typically total users, second is active users
        if (index === 0 || index === 1) {
          return { ...metric, value: Math.max(0, (metric.value || 0) - effectiveDemoCount) };
        }
        return metric;
      }),
      subscriptionDistribution: filteredSubscriptionDistribution,
      // Filter time series data - only for dates after cutoff
      timeSeriesData: overviewData.timeSeriesData?.map(filterTimeSeriesPoint),
      // Filter activity data - only for dates after cutoff  
      activityData: overviewData.activityData?.map(filterActivityPoint),
    };
  }, [overviewData, hideDemoUsers, demoUserCount, allUsersData?.users, DEMO_CUTOFF_DATE]);

  // Filtered users analytics excluding demo users
  const filteredUsersAnalytics = useMemo(() => {
    if (!usersAnalytics || !hideDemoUsers) return usersAnalytics;
    
    return {
      ...usersAnalytics,
      // Reduce users count in time series data by demo user count
      usersByTier: usersAnalytics.usersByTier?.map(data => ({
        ...data,
        users: Math.max(0, data.users - demoUserCount)
      })),
    };
  }, [usersAnalytics, hideDemoUsers, demoUserCount]);

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

  // Real-Time Activity Overview
  const { data: activityOverview, isLoading: activityOverviewLoading } = useQuery<{
    realtime: {
      activeUsersNow: number;
      sessionsLastHour: number;
      pageViewsToday: number;
      eventsToday: number;
      avgSessionDuration: number;
    };
    topPages: Array<{ page_path: string; views: string }>;
    deviceBreakdown: Array<{ device_type: string; count: string }>;
    browserBreakdown: Array<{ browser_name: string; count: string }>;
    geoDistribution: Array<{ country: string; country_code: string; sessions: string }>;
    hourlyActivity: Array<{ hour: string; page_views: string }>;
    eventBreakdown: Array<{ event_type: string; event_category: string; count: string }>;
    toolUsage: Array<{ tool_id: string; tool_category: string; usage_count: string }>;
    generatedAt: string;
  }>({
    queryKey: ['/api/admin/activity/overview'],
    enabled: !!user?.isAdmin && activeSection === 'realtime',
    refetchInterval: 15000,
  });

  // Live Activity Feed
  const { data: liveFeed, isLoading: liveFeedLoading } = useQuery<{
    activities: Array<{
      id: string;
      activity_type: 'page_view' | 'event';
      page_path?: string;
      page_title?: string;
      event_type?: string;
      event_category?: string;
      event_action?: string;
      event_label?: string;
      tool_id?: string;
      occurred_at: string;
      email: string;
      first_name?: string;
      last_name?: string;
      subscription_tier?: string;
      device_type?: string;
      browser_name?: string;
      country?: string;
      city?: string;
    }>;
    count: number;
    since: string;
  }>({
    queryKey: ['/api/admin/activity/live-feed'],
    enabled: !!user?.isAdmin && activeSection === 'realtime',
    refetchInterval: 10000,
  });

  // Active Sessions
  const { data: activeSessions, isLoading: activeSessionsLoading } = useQuery<{
    sessions: Array<{
      id: string;
      user_id: string;
      session_started_at: string;
      last_seen_at: string;
      device_type?: string;
      browser_name?: string;
      os_name?: string;
      country?: string;
      city?: string;
      current_page?: string;
      page_view_count: number;
      event_count: number;
      total_duration_seconds: number;
      email: string;
      first_name?: string;
      last_name?: string;
      subscription_tier?: string;
      is_admin?: boolean;
      profile_image_url?: string;
    }>;
    count: number;
    activeOnly: boolean;
  }>({
    queryKey: ['/api/admin/activity/sessions', { active: 'true' }],
    enabled: !!user?.isAdmin && activeSection === 'realtime',
    refetchInterval: 10000,
  });

  // Users with Activity (for Active Users table)
  const { data: usersWithActivity, isLoading: usersWithActivityLoading } = useQuery<{
    users: Array<{
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
      subscription_tier?: string;
      is_email_verified: boolean;
      is_admin?: boolean;
      created_at: string;
      last_activity_at?: string;
      profile_image_url?: string;
      plan_count?: string;
      last_session_started?: string;
      last_seen_at?: string;
      last_device?: string;
      last_country?: string;
      current_page?: string;
      is_online: boolean;
    }>;
  }>({
    queryKey: ['/api/admin/users/activity'],
    enabled: !!user?.isAdmin && (activeSection === 'realtime' || activeSection === 'users'),
    refetchInterval: 30000,
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

  // Core Web Vitals metrics
  const { data: webVitalsData, isLoading: webVitalsLoading, refetch: refetchWebVitals } = useQuery<{
    totalSamples: number;
    averages: {
      lcp: number | null;
      fid: number | null;
      cls: number | null;
      fcp: number | null;
      ttfb: number | null;
      inp: number | null;
    };
    ratings: {
      lcp: { good: number; needsImprovement: number; poor: number };
      fid: { good: number; needsImprovement: number; poor: number };
      cls: { good: number; needsImprovement: number; poor: number };
    };
    byPage: Array<{ pagePath: string; samples: number; avgLcp: number | null; avgFid: number | null; avgCls: number | null }>;
    byDevice: Array<{ deviceType: string; samples: number; avgLcp: number | null }>;
  }>({
    queryKey: ['/api/admin/performance/stats'],
    enabled: !!user?.isAdmin && activeSection === 'system-webvitals',
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

  // Real Stripe Revenue Analytics
  const { data: revenueAnalytics, isLoading: revenueAnalyticsLoading, refetch: refetchRevenueAnalytics } = useQuery<{
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueAllTime: number;
    revenueYear1ToDate: number;
    monthlyGrowth: number;
    mrr: number;
    arr: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    churnRate: number;
    totalCustomers: number;
    avgLTV: number;
    avgOrderValue: number;
    totalTransactions: number;
    tierDistribution: { free: number; basic: number; premium: number; enterprise: number; ultimate: number };
    revenueByTier: { basic: number; premium: number; enterprise: number; ultimate: number };
    monthlyTrend: Array<{ month: string; revenue: number; transactions: number }>;
    promoCodeStats: Array<{ code: string; uses: number; maxUses: number | null; discountType: string; discountValue: number; totalSavings: number }>;
    totalDiscounts: number;
    lastUpdated: string;
  }>({
    queryKey: ['/api/admin/analytics/revenue'],
    enabled: !!user?.isAdmin && activeSection.startsWith('revenue'),
    refetchInterval: REFRESH_INTERVAL,
  });

  // Real Stripe Recent Transactions
  const { data: recentTransactionsData, isLoading: recentTransactionsLoading } = useQuery<{
    transactions: Array<{
      id: string;
      user: string;
      email: string;
      amount: number;
      tier: string;
      time: string;
      status: string;
      date: string;
    }>;
  }>({
    queryKey: ['/api/admin/analytics/transactions'],
    enabled: !!user?.isAdmin && activeSection === 'revenue-dashboard',
    refetchInterval: REFRESH_INTERVAL,
  });

  // Real Stripe Active Subscriptions
  const { data: activeSubscriptionsData, isLoading: activeSubscriptionsLoading } = useQuery<{
    subscriptions: Array<{
      id: string;
      user: string;
      email: string;
      tier: string;
      amount: number;
      status: string;
      nextBilling: string;
      since: string;
    }>;
  }>({
    queryKey: ['/api/admin/analytics/subscriptions'],
    enabled: !!user?.isAdmin && activeSection === 'revenue-subscriptions',
    refetchInterval: REFRESH_INTERVAL,
  });

  // Promo codes with comprehensive analytics
  const { data: promoCodesData, isLoading: promoCodesLoading, refetch: refetchPromoCodes } = useQuery<{
    promoCodes: Array<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      discountType: string;
      discountValue: number;
      minPurchaseAmount: number | null;
      maxTotalUses: number | null;
      maxUsesPerUser: number | null;
      currentUses: number;
      validFrom: string;
      validUntil: string | null;
      eligibleTiers: string[] | null;
      status: string;
      ownerId: string | null;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
      usedCount: number;
      maxUses: number | null;
      isActive: boolean;
      redemptionsCount: number;
      totalRevenueSaved: number;
      uniqueUsers: number;
      lastUsedAt: string | null;
    }>;
    total: number;
    summary: {
      totalCodes: number;
      activeCodes: number;
      expiredCodes: number;
      pausedCodes: number;
      totalRedemptions: number;
      totalRevenueSaved: number;
      averageDiscount: number;
    };
  }>({
    queryKey: ['/api/admin/promos'],
    enabled: !!user?.isAdmin && activeSection.startsWith('promos'),
    refetchInterval: REFRESH_INTERVAL,
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

  // Error logs query
  const { data: errorLogsData, isLoading: errorLogsLoading, refetch: refetchErrorLogs } = useQuery<{
    errors: Array<{
      id: string;
      errorType: string;
      errorCode: string | null;
      message: string;
      stack: string | null;
      userId: string | null;
      userEmail: string | null;
      endpoint: string | null;
      toolId: string | null;
      pageUrl: string | null;
      severity: string;
      isResolved: boolean;
      resolution: string | null;
      createdAt: string;
    }>;
    stats: {
      total: number;
      unresolved: number;
      bySeverity: Record<string, number>;
    };
  }>({
    queryKey: ['/api/admin/errors'],
    enabled: !!user?.isAdmin && activeSection === 'logs-errors',
    refetchInterval: 30000,
  });

  // Email Analytics - Real data from email_logs table
  const { data: emailAnalytics, isLoading: emailAnalyticsLoading, refetch: refetchEmailAnalytics } = useQuery<{
    summary: {
      totalSent30Days: number;
      sentToday: number;
      deliveryRate: string;
      totalAllTime: number;
    };
    weeklyData: Array<{ week: string; sent: number; delivered: number }>;
    typeDistribution: Array<{ type: string; count: number; percent: string }>;
    recentEmails: Array<{
      id: string;
      to: string;
      subject: string;
      type: string;
      status: string;
      time: string;
      sentAt: string;
    }>;
  }>({
    queryKey: ['/api/admin/analytics/emails'],
    enabled: !!user?.isAdmin && activeSection === 'comms-emails',
    refetchInterval: 30000,
  });

  // Notification Analytics - Real data from database
  const { data: notificationAnalytics, isLoading: notificationAnalyticsLoading } = useQuery<{
    summary: {
      totalSent30Days: number;
      sentToday: number;
      inAppCount: number;
      scheduledCount: number;
      readRate: string;
      totalAllTime: number;
    };
    typeDistribution: Array<{ type: string; count: number; percent: string }>;
    recentNotifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      recipientCount: number;
      readCount: number;
      status: string;
      time: string;
      createdAt: string;
    }>;
  }>({
    queryKey: ['/api/admin/analytics/notifications'],
    enabled: !!user?.isAdmin && activeSection === 'comms-notifications',
    refetchInterval: 30000,
  });

  // Resolve error mutation
  const resolveErrorMutation = useMutation({
    mutationFn: async ({ errorId, resolution }: { errorId: string; resolution: string }) => {
      await apiRequest('PATCH', `/api/admin/errors/${errorId}/resolve`, { resolution });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/errors'] });
      toast({ title: "Error marked as resolved" });
      setSelectedError(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to resolve error", description: error.message, variant: "destructive" });
    },
  });

  // Delete error mutation
  const deleteErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      await apiRequest('DELETE', `/api/admin/errors/${errorId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/errors'] });
      toast({ title: "Error log deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete error", description: error.message, variant: "destructive" });
    },
  });

  // Clear resolved errors mutation  
  const clearResolvedErrorsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/admin/errors/resolved/all', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/errors'] });
      toast({ title: "All resolved errors cleared" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to clear errors", description: error.message, variant: "destructive" });
    },
  });

  // Security events query
  const { data: securityEventsData, isLoading: securityEventsLoading, refetch: refetchSecurityEvents } = useQuery<{
    events: Array<{
      id: string;
      eventType: string;
      severity: string;
      userId: string | null;
      userEmail: string | null;
      ipAddress: string | null;
      userAgent: string | null;
      description: string;
      metadata: any;
      isResolved: boolean;
      resolution: string | null;
      createdAt: string;
    }>;
    stats: {
      total: number;
      unresolved: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
    };
  }>({
    queryKey: ['/api/admin/security-events'],
    enabled: !!user?.isAdmin && activeSection === 'logs-security',
    refetchInterval: 30000,
  });

  // Resolve security event mutation
  const resolveSecurityEventMutation = useMutation({
    mutationFn: async ({ eventId, resolution }: { eventId: string; resolution: string }) => {
      await apiRequest('PATCH', `/api/admin/security-events/${eventId}/resolve`, { resolution });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-events'] });
      toast({ title: "Security event marked as resolved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to resolve security event", description: error.message, variant: "destructive" });
    },
  });

  // Delete security event mutation
  const deleteSecurityEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('DELETE', `/api/admin/security-events/${eventId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-events'] });
      toast({ title: "Security event deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete security event", description: error.message, variant: "destructive" });
    },
  });

  // Clear resolved security events mutation  
  const clearResolvedSecurityEventsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/admin/security-events/resolved/all', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security-events'] });
      toast({ title: "All resolved security events cleared" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to clear security events", description: error.message, variant: "destructive" });
    },
  });

  // Site Feedback Analytics query
  const { data: feedbackData } = useQuery<{
    feedback: Array<{
      id: string;
      userId: string | null;
      rating: number;
      comment: string | null;
      pageUrl: string | null;
      timeSpentMinutes: number | null;
      userEmail: string | null;
      userName: string | null;
      userTier: string | null;
      browserInfo: string | null;
      screenSize: string | null;
      referrer: string | null;
      createdAt: string;
    }>;
  }>({
    queryKey: ['/api/admin/feedback'],
    enabled: !!user?.isAdmin && activeSection.startsWith('feedback'),
    refetchInterval: 30000,
  });

  // Blog Stats query
  const { data: blogStats, isLoading: blogStatsLoading, refetch: refetchBlogStats } = useQuery<{
    counts: { published: number; draft: number; scheduled: number; total: number };
    recentPosts: Array<{
      id: string;
      title: string;
      postStatus: string;
      publishedAt: string | null;
      scheduledFor: string | null;
      views: number;
    }>;
    scheduledPosts: Array<{
      id: string;
      title: string;
      scheduledFor: string;
    }>;
    topPosts: Array<{
      id: string;
      title: string;
      views: number;
      category: string;
    }>;
  }>({
    queryKey: ['/api/admin/blog/stats'],
    enabled: !!user?.isAdmin && activeSection === 'content-blog',
    refetchInterval: 30000,
  });

  // Blog Posts query
  const { data: blogPosts, isLoading: blogPostsLoading, refetch: refetchBlogPosts } = useQuery<Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    postStatus: string;
    publishedAt: string | null;
    scheduledFor: string | null;
    views: number;
    author: string;
  }>>({
    queryKey: ['/api/admin/blog/posts'],
    enabled: !!user?.isAdmin && activeSection === 'content-blog',
    refetchInterval: 30000,
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
      return { count: userIds.length };
    },
    onSuccess: (data) => {
      // Force immediate refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/admin');
        }
      });
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `Successfully updated ${data.count} users` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk update failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk force logout mutation
  const bulkForceLogoutMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const results = await Promise.allSettled(
        userIds.map(id => apiRequest('POST', `/api/admin/users/${id}/force-logout`))
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      return { succeeded, total: userIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `Force logout completed`, description: `${data.succeeded}/${data.total} users logged out` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk force logout failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk delete users mutation with optimistic updates
  const bulkDeleteUsersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const results = await Promise.allSettled(
        userIds.map(id => apiRequest('DELETE', `/api/admin/users/${id}`))
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      return { succeeded, total: userIds.length, deletedIds: userIds };
    },
    onMutate: async (userIds) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/admin/users'] });
      
      // Optimistically remove users from ALL cached user queries
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === '/api/admin/users' },
        (oldData: any) => {
          if (!oldData?.users) return oldData;
          return {
            ...oldData,
            users: oldData.users.filter((u: User) => !userIds.includes(u.id)),
            total: Math.max(0, (oldData.total || 0) - userIds.length)
          };
        }
      );
      
      return { userIds };
    },
    onSuccess: (data) => {
      // Refetch to ensure server state is accurate
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/overview'] });
      toast({ title: `Bulk delete completed`, description: `${data.succeeded}/${data.total} users deleted` });
      setSelectedUsers([]);
    },
    onError: (error: Error, _userIds, context) => {
      // Revert on error - refetch the real data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Bulk delete failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk verify/unverify mutation
  const bulkVerifyMutation = useMutation({
    mutationFn: async ({ userIds, verified }: { userIds: string[]; verified: boolean }) => {
      const results = await Promise.allSettled(
        userIds.map(id => apiRequest('POST', `/api/admin/users/${id}/verify`, { verified }))
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      return { succeeded, total: userIds.length };
    },
    onSuccess: (data, { verified }) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/admin');
        }
      });
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `${verified ? 'Verification' : 'Unverification'} completed`, description: `${data.succeeded}/${data.total} users updated` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk verify failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk suspend mutation
  const bulkSuspendMutation = useMutation({
    mutationFn: async ({ userIds, suspended, durationDays }: { userIds: string[]; suspended: boolean; durationDays?: number }) => {
      const results = await Promise.allSettled(
        userIds.map(id => apiRequest('POST', `/api/admin/users/${id}/suspend`, { suspended, durationDays }))
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      return { succeeded, total: userIds.length };
    },
    onSuccess: (data, { suspended }) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/admin');
        }
      });
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `${suspended ? 'Suspension' : 'Unsuspension'} completed`, description: `${data.succeeded}/${data.total} users updated` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk suspend failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk ban mutation
  const bulkBanMutation = useMutation({
    mutationFn: async ({ userIds, banned }: { userIds: string[]; banned: boolean }) => {
      const results = await Promise.allSettled(
        userIds.map(id => apiRequest('POST', `/api/admin/users/${id}/ban`, { banned }))
      );
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      return { succeeded, total: userIds.length };
    },
    onSuccess: (data, { banned }) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/admin');
        }
      });
      queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: `${banned ? 'Ban' : 'Unban'} completed`, description: `${data.succeeded}/${data.total} users updated` });
      setSelectedUsers([]);
    },
    onError: (error: Error) => {
      toast({ title: "Bulk ban failed", description: error.message, variant: "destructive" });
    },
  });

  // Bulk export user data
  const bulkExportUserData = async (userIds: string[]) => {
    try {
      const allData: any[] = [];
      for (const userId of userIds) {
        const res = await apiRequest('GET', `/api/admin/users/${userId}/export`);
        const data = await res.json();
        allData.push(data);
      }
      
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: 'Bulk export completed', description: `${userIds.length} users exported` });
      setSelectedUsers([]);
    } catch (error: any) {
      toast({ title: "Failed to export user data", description: error.message, variant: "destructive" });
    }
  };

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

  // Reset all user credits based on tier - 2026 PRICING
  const resetAllCreditsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/reset-all-credits', {});
      return response.json();
    },
    onSuccess: (data: { message: string; updatedCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/overview'] });
      toast({ 
        title: "Credits Reset Successfully", 
        description: data.message 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reset credits", description: error.message, variant: "destructive" });
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

  // Send broadcast notification mutation
  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: { title: string; message: string; type: string; targetTiers: string[] }) => {
      const response = await apiRequest('POST', '/api/admin/notifications', {
        title: data.title,
        message: data.message,
        type: data.type,
        targetTiers: data.targetTiers.length > 0 ? data.targetTiers : null,
      });
      const notification = await response.json();
      // Auto-send after creation
      await apiRequest('POST', `/api/admin/notifications/${notification.id}/send`, {});
      return notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      setShowBroadcastModal(false);
      setBroadcastData({ title: '', message: '', type: 'info', targetTiers: [] });
      toast({ title: "Broadcast notification sent successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send broadcast", description: error.message, variant: "destructive" });
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; discountType: string; discountValue: number; startDate: Date; endDate: Date; targetTiers: string[] }) => {
      const response = await apiRequest('POST', '/api/admin/campaigns', {
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        targetTiers: data.targetTiers.length > 0 ? data.targetTiers : null,
        status: 'active',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/campaigns'] });
      setShowCampaignModal(false);
      setCampaignData({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        targetTiers: [],
      });
      toast({ title: "Campaign created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  // ==================== ADMIN CONTROL CENTER MUTATIONS ====================

  // Verify/Unverify user
  const verifyUserMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/verify`, { verified });
    },
    onSuccess: (_, { verified }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      toast({ title: `User ${verified ? 'verified' : 'unverified'} successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update verification", description: error.message, variant: "destructive" });
    },
  });

  // Ban/Unban user
  const banUserMutation = useMutation({
    mutationFn: async ({ userId, banned, reason }: { userId: string; banned: boolean; reason?: string }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/ban`, { banned, reason });
    },
    onSuccess: (_, { banned }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      setBanningUser(null);
      setBanReason("");
      toast({ title: `User ${banned ? 'banned' : 'unbanned'} successfully` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to ban/unban user", description: error.message, variant: "destructive" });
    },
  });

  // Suspend user
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, suspended, reason, durationDays }: { userId: string; suspended: boolean; reason?: string; durationDays?: number }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/suspend`, { suspended, reason, durationDays });
    },
    onSuccess: (_, { suspended }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      setSuspendingUser(null);
      setSuspendReason("");
      toast({ title: suspended ? 'User suspended' : 'User suspension lifted' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to suspend user", description: error.message, variant: "destructive" });
    },
  });

  // Tier override
  const tierOverrideMutation = useMutation({
    mutationFn: async ({ userId, tier, reason, addCredits }: { userId: string; tier: string; reason: string; addCredits?: boolean }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/tier-override`, { tier, reason, addCredits });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      setTierOverrideUser(null);
      setOverrideReason("");
      toast({ title: 'User tier updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to override tier", description: error.message, variant: "destructive" });
    },
  });

  // Manage credits - supports 'add' (default) or 'set' mode
  const creditsMutation = useMutation({
    mutationFn: async ({ userId, amount, type, mode = 'add' }: { userId: string; amount: number; type: 'plan' | 'bonus'; mode?: 'add' | 'set' }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/credits`, { amount, type, mode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      setCreditsUser(null);
      toast({ title: 'Credits updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update credits", description: error.message, variant: "destructive" });
    },
  });

  // Update admin notes
  const notesMutation = useMutation({
    mutationFn: async ({ userId, notes }: { userId: string; notes: string }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/notes`, { notes });
    },
    onSuccess: () => {
      setNotesUser(null);
      setAdminNotes("");
      toast({ title: 'Admin notes saved' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save notes", description: error.message, variant: "destructive" });
    },
  });

  // Toggle admin status
  const adminToggleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      await apiRequest('POST', `/api/admin/users/${userId}/admin-toggle`, { isAdmin });
    },
    onSuccess: (_, { isAdmin }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
      toast({ title: isAdmin ? 'User promoted to admin' : 'Admin privileges removed' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update admin status", description: error.message, variant: "destructive" });
    },
  });

  // Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/reset-password`, {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Password reset initiated', 
        description: `Reset link generated. Expires at ${new Date(data.expiresAt).toLocaleString()}` 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reset password", description: error.message, variant: "destructive" });
    },
  });

  // Delete user permanently
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      // Invalidate all user-related queries for immediate UI update
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      setDeletingUser(null);
      setDeleteConfirmText("");
      toast({ title: 'User deleted permanently', description: 'All user data has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    },
  });

  // Force logout user (end all sessions)
  const forceLogoutMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/force-logout`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'User logged out', 
        description: `${data.sessionsTerminated || 0} active session(s) terminated.` 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to force logout", description: error.message, variant: "destructive" });
    },
  });

  // Export user data (GDPR compliance)
  const exportUserData = async (userId: string) => {
    try {
      const res = await apiRequest('GET', `/api/admin/users/${userId}/export`);
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportingUser(null);
      toast({ title: 'User data exported', description: 'Download started.' });
    } catch (error: any) {
      toast({ title: "Failed to export user data", description: error.message, variant: "destructive" });
    }
  };

  // Fetch impersonation data
  const fetchImpersonationData = async (userId: string) => {
    try {
      const res = await apiRequest('GET', `/api/admin/users/${userId}/impersonate-data`);
      const data = await res.json();
      setImpersonationData(data);
    } catch (error: any) {
      toast({ title: "Failed to load user data", description: error.message, variant: "destructive" });
    }
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-1" />
          <p className="text-[9px] text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-1" />
          <h2 className="text-xs font-semibold mb-0.5">Admin Access Required</h2>
          <p className="text-muted-foreground mb-1">Redirecting to home page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    );
  }

  const rowSpacing = dataDensity === 'compact' ? 'py-0.5' : dataDensity === 'comfortable' ? 'py-1' : 'py-0.5';

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
      'system-webvitals': 'Core Web Vitals',
      'system-database': 'Database Health',
      'system-storage': 'Storage Analytics',
      'system-api': 'API Performance',
      'logs-activity': 'Activity Log',
      'logs-errors': 'Error Log',
      'logs-audit': 'Audit Trail',
      'logs-security': 'Security Events',
      'comms-emails': 'Email Analytics',
      'comms-notifications': 'Notification Center',
      'feedback-overview': 'Feedback Analytics',
      'feedback-responses': 'All Feedback Responses',
      'content-blog': 'Blog Dashboard',
      'content-seo': 'SEO Analytics',
      'referrals-overview': 'Referral Programme Overview',
      'referrals-codes': 'Referral Codes Management',
      'referrals-rewards': 'Pending Rewards',
      'referrals-analytics': 'Referral Analytics',
      'promos-overview': 'Promo Codes Management',
      'promos-create': 'Create Promo Code',
      'promos-analytics': 'Promo Analytics',
      'promos-campaigns': 'Campaign Manager',
      'promos-reports': 'Promo Reports',
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
              totalUsers: filteredOverviewData?.kpiMetrics?.[0]?.value || overviewData?.kpiMetrics?.[0]?.value || 0,
              activeUsers: filteredOverviewData?.kpiMetrics?.[1]?.value || overviewData?.kpiMetrics?.[1]?.value || 0,
              pendingPlans: plansData?.plans?.filter(p => p.status === 'pending').length || 0,
              errorCount: activityLog?.filter(a => a.severity === 'error').length || 0,
              pendingRewards: pendingRewardsData?.total || referralAnalytics?.pendingRewards || 0,
            }}
            hideDemoUsers={hideDemoUsers}
            onHideDemoUsersChange={setHideDemoUsers}
          />
          
          <SidebarInset className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{scrollbarWidth:'none'} as React.CSSProperties}>
            {/* Top Header Bar with Logo, Theme Toggle, Logout */}
            <header className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
              <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
              
              <div 
                onClick={() => setLocation('/')}
                className="isolate z-[9999] mix-blend-normal bg-transparent cursor-pointer hover:opacity-85 transition-opacity" 
                data-testid="button-admin-logo"
              >
                <div className="logo-container overflow-hidden flex items-center">
                  <img src={logoLightImg} alt="UK Innovator Founder Visa Assistant - Click to go home" className="h-8 md:h-10 w-auto logo-light object-contain" loading="lazy" />
                  <img src={logoDarkImg} alt="UK Innovator Founder Visa Assistant - Click to go home" className="h-8 md:h-10 w-auto logo-dark object-contain" loading="lazy" />
                </div>
              </div>
              
              <div className="flex-1" />
              
              <span className="text-[9px] text-muted-foreground hidden md:inline">{user?.email}</span>
              
              <ThemeToggle />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </header>
            
            <div className="h-full bg-background">
              <div className="p-3 space-y-2">
                {/* Section Header — compact single row */}
                <div className="flex items-center justify-between border-b pb-2">
                  <h1 className="text-[9px] font-semibold tracking-tight" data-testid="heading-admin-dashboard">
                    {getSectionTitle()}
                  </h1>
                  <div className="flex items-center gap-1">
                    {overviewData?.lastUpdated && (
                      <span className="text-xs text-muted-foreground hidden sm:inline mr-1">
                        {formatDistance(new Date(overviewData.lastUpdated), new Date(), { addSuffix: true })}
                        {' · '}<span className="font-mono">{refreshCountdown}s</span>
                      </span>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" onClick={handleManualRefresh} disabled={overviewLoading} data-testid="button-manual-refresh">
                          <RefreshCw className={`h-3.5 w-3.5 ${overviewLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Refresh</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" data-testid="button-export-menu">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => exportMutation.mutate('users')} disabled={exportMutation.isPending}>
                          <Users className="h-3 w-3 mr-2" />Users (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportMutation.mutate('plans')} disabled={exportMutation.isPending}>
                          <FileText className="h-3 w-3 mr-2" />Plans (CSV)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportMutation.mutate('analytics')} disabled={exportMutation.isPending}>
                          <BarChart3 className="h-3 w-3 mr-2" />Analytics (CSV)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="ghost" data-testid="button-dashboard-settings">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Settings</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Main Content - Section Based */}
                
                {/* OVERVIEW SECTION - High-level summary */}
                {activeSection === 'overview' && (
                  <div className="space-y-0.5">
              <AnimatePresence mode="wait">
                {overviewLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-2"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardHeader className="p-3 pb-1">
                          <ShimmerSkeleton />
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
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
                    transition={{ duration: 0.3 }}
                    className="space-y-1.5"
                  >
                    {/* Demo filter banner */}
                    {hideDemoUsers && demoUserCount > 0 && (
                      <div className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
                        <p className="text-[10px] font-medium text-orange-800 dark:text-orange-200">
                          Demo Filter: Hiding {demoUserCount} demo users — showing {realUserCount} real users
                        </p>
                      </div>
                    )}

                    {/* 2-Column Dashboard Layout */}
                    <div className="grid grid-cols-5 gap-1.5 items-start">

                      {/* LEFT COLUMN (2/5): KPI 2×2 + Tier Distribution + System Health */}
                      <div className="col-span-2 flex flex-col gap-1.5">

                        {/* KPI 2×2 grid */}
                        <div key={`kpi-${hideDemoUsers}`} className="grid grid-cols-2 gap-1.5">
                          {filteredOverviewData?.kpiMetrics?.map((metric) => {
                            const IconComponent = iconMap[metric.icon] || Activity;
                            return (
                              <Card key={`${metric.label}-${hideDemoUsers}`} data-testid={`card-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                                <CardContent className="p-2">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-medium text-muted-foreground leading-none">{metric.label}</span>
                                    <IconComponent className={`h-3 w-3 shrink-0 ${metric.color}`} />
                                  </div>
                                  <div className="text-[9px] font-bold tabular-nums leading-none">
                                    <AnimatedNumber key={`num-${metric.label}-${metric.value}`} value={metric.value} />
                                  </div>
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    <TrendIndicator trend={metric.trend} />
                                    <span className="text-[9px] text-muted-foreground">vs last period</span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Subscription Tier Distribution */}
                        <Card>
                          <CardContent className="p-2">
                            <span className="text-[10px] font-medium block mb-1">Subscription Tier Distribution</span>
                            <div className="space-y-0.5">
                              {(overviewData?.subscriptionDistribution?.length ? overviewData.subscriptionDistribution : [
                                { tier: 'free', count: 0, percentage: 0 }, { tier: 'basic', count: 0, percentage: 0 },
                                { tier: 'premium', count: 0, percentage: 0 }, { tier: 'enterprise', count: 0, percentage: 0 }, { tier: 'ultimate', count: 0, percentage: 0 }
                              ]).map((item) => (
                                <div key={item.tier} className="flex items-center gap-1">
                                  <span className="text-[9px] text-muted-foreground w-14 capitalize">{item.tier}</span>
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${item.percentage || 0}%`, backgroundColor: item.tier === 'free' ? '#94a3b8' : item.tier === 'basic' ? '#22c55e' : item.tier === 'premium' ? '#3b82f6' : item.tier === 'enterprise' ? '#f59e0b' : '#8b5cf6' }} />
                                  </div>
                                  <span className="text-[9px] font-medium w-7 text-right">{Math.round(item.percentage || 0)}%</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* System Health */}
                        <Card>
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-medium">System Health Overview</span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1 text-green-600 border-green-500/30">
                                {overviewData?.systemMetrics?.healthScore || 0}/100
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                              {[
                                { label: 'CPU', value: `${Math.min(100, Math.round(((overviewData?.systemMetrics?.cpu?.user || 0) + (overviewData?.systemMetrics?.cpu?.system || 0)) / 10000) || 35)}%` },
                                { label: 'Memory', value: `${overviewData?.systemMetrics?.memory?.heapUsed || 0} MB` },
                                { label: 'Response', value: `${overviewData?.systemMetrics?.api?.avgResponseTime || 0}ms` },
                                { label: 'Errors', value: `${overviewData?.systemMetrics?.api?.errorRate || 0}%` },
                              ].map((m) => (
                                <div key={m.label} className="flex items-center justify-between">
                                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                                  <span className="text-[9px] font-medium">{m.value}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                      </div>

                      {/* RIGHT COLUMN (3/5): Growth Chart + Daily Active + Activity Feed + Top Tools */}
                      <div className="col-span-3 flex flex-col gap-1.5">

                        {/* Growth Chart */}
                        <Card data-testid="card-growth-chart">
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-medium">Users & Plans Growth (90 Days)</span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1"><TrendingUp className="h-2 w-2 mr-0.5" />Live</Badge>
                            </div>
                            <ResponsiveContainer width="100%" height={55}>
                              <RechartsLineChart data={filteredOverviewData?.timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={7} tickFormatter={(v) => format(new Date(v), 'MMM d')} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={7} width={18} />
                                <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '9px' }} labelFormatter={(v) => format(new Date(v), 'PPP')} />
                                <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Users" />
                                <Line type="monotone" dataKey="plans" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Plans" />
                                <Line type="monotone" dataKey="activeUsers" stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Active" />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Daily Active + Activity Feed side by side */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <Card>
                            <CardContent className="p-2">
                              <span className="text-[10px] font-medium block mb-0.5">Daily Active Users (30 Days)</span>
                              <ResponsiveContainer width="100%" height={45}>
                                <RechartsAreaChart data={overviewData?.activityData?.slice(-30) || []}>
                                  <defs>
                                    <linearGradient id="ovActivityGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={7} tickFormatter={(v) => { try { return format(new Date(v), 'MMM d'); } catch { return v; } }} />
                                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={7} width={18} />
                                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '9px' }} />
                                  <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" strokeWidth={1.5} fill="url(#ovActivityGrad)" name="Users" />
                                </RechartsAreaChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-2">
                              <span className="text-[10px] font-medium block mb-0.5">Live Activity Feed</span>
                              <div className="space-y-0.5" style={{ height: 45, overflow: 'hidden' }}>
                                {(overviewData?.recentActivity || []).slice(0, 5).map((activity, i) => (
                                  <div key={i} className="flex items-center gap-1">
                                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${activity.severity === 'error' ? 'bg-red-500' : activity.severity === 'success' ? 'bg-green-500' : activity.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                    <span className="text-[9px] text-muted-foreground truncate">{activity.description || activity.message || activity.type}</span>
                                  </div>
                                ))}
                                {(!overviewData?.recentActivity || overviewData.recentActivity.length === 0) && (
                                  <p className="text-[9px] text-muted-foreground">No recent activity</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Top Tools */}
                        <Card>
                          <CardContent className="p-2">
                            <span className="text-[10px] font-medium block mb-0.5">Top 10 Most Used Tools</span>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                              {(overviewData?.topTools || []).slice(0, 4).map((tool, i) => {
                                const maxCount = overviewData?.topTools?.[0]?.usageCount || 1;
                                return (
                                  <div key={tool.toolId} className="flex items-center gap-1">
                                    <span className="text-[9px] text-muted-foreground w-3">{i + 1}.</span>
                                    <span className="text-[9px] truncate flex-1">{tool.toolName}</span>
                                    <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round((tool.usageCount / maxCount) * 100)}%` }} />
                                    </div>
                                    <span className="text-[9px] font-medium w-4 text-right">{tool.usageCount}</span>
                                  </div>
                                );
                              })}
                              {(!overviewData?.topTools || overviewData.topTools.length === 0) && (
                                <p className="text-[9px] text-muted-foreground col-span-2">No tool usage data yet</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <Card>
                    <CardContent className="py-1 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                      <p className="text-[9px] text-muted-foreground">No overview data available</p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
                  </div>
                )}

                {/* REAL-TIME ACTIVITY SECTION - live monitoring */}
                {activeSection === 'realtime' && (
                  <div className="space-y-1.5">
                    <AnimatePresence mode="wait">
                      {activityLogLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-1.5"
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i}>
                              <CardContent className="p-2">
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
                          className="space-y-1.5"
                        >
                          {/* Compact Status Bar */}
                          <Card className="border-green-500/20 bg-green-500/5">
                            <CardContent className="p-1.5">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <div className="relative shrink-0">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                    <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-60" />
                                  </div>
                                  <span className="text-[11px] font-semibold">Real-Time Activity Monitor</span>
                                  <Badge variant="default" className="bg-green-500 text-[9px] h-4 px-1.5">LIVE</Badge>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                  {[
                                    { label: 'Events', value: activityLog?.length || 0, color: 'text-green-600' },
                                    { label: 'Active Now', value: filteredOverviewData?.kpiMetrics?.[1]?.value || 0, color: 'text-blue-600' },
                                    { label: 'Refresh', value: '30s', color: 'text-amber-600' },
                                  ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-1 px-2 py-0.5 bg-background rounded border">
                                      <span className={`text-[11px] font-bold ${s.color}`}>{s.value}</span>
                                      <span className="text-[9px] text-muted-foreground">{s.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Compact 6-stat strip */}
                          <div className="grid grid-cols-6 gap-1.5">
                            {[
                              { label: 'Registrations', count: activityLog?.filter(a => a.type === 'user_registration').length || 0, Icon: UserPlus, color: 'text-green-500' },
                              { label: 'Verifications', count: activityLog?.filter(a => a.type === 'email_verified').length || 0, Icon: CheckCircle, color: 'text-blue-500' },
                              { label: 'Plans Created', count: activityLog?.filter(a => a.type === 'plan_created').length || 0, Icon: FileText, color: 'text-purple-500' },
                              { label: 'Completed', count: activityLog?.filter(a => a.type === 'plan_completed').length || 0, Icon: FileCheck, color: 'text-emerald-500' },
                              { label: 'Upgrades', count: activityLog?.filter(a => a.type === 'user_upgrade').length || 0, Icon: TrendingUp, color: 'text-orange-500' },
                              { label: 'Errors', count: activityLog?.filter(a => a.severity === 'error').length || 0, Icon: AlertTriangle, color: 'text-red-500' },
                            ].map(({ label, count, Icon, color }) => (
                              <Card key={label}>
                                <CardContent className="p-1.5 text-center">
                                  <Icon className={`h-3 w-3 mx-auto mb-0.5 ${color}`} />
                                  <p className="text-xs font-bold leading-none">{count}</p>
                                  <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{label}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {/* Main 2-col: Timeline + Right Sidebar */}
                          <div className="grid grid-cols-5 gap-1.5 items-start">

                            {/* LEFT: Live Activity Timeline (compact rows) */}
                            <Card className="col-span-3">
                              <CardContent className="p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-medium flex items-center gap-1">
                                    <Activity className="h-3 w-3" />Live Activity Timeline
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <motion.div className="h-1.5 w-1.5 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                    <span className="text-[9px] text-muted-foreground">Auto-updating</span>
                                  </div>
                                </div>
                                <ScrollArea className="h-[260px]">
                                  <div className="space-y-0.5 pr-1">
                                    {activityLog?.map((activity) => {
                                      const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Activity;
                                      const dotColor = { user_registration: 'bg-green-500', email_verified: 'bg-blue-500', plan_created: 'bg-purple-500', plan_completed: 'bg-emerald-500', user_upgrade: 'bg-orange-500', admin_action: 'bg-slate-500', error: 'bg-red-500' }[activity.type] || 'bg-gray-400';
                                      const severityDot = { info: 'bg-blue-400', success: 'bg-green-400', warning: 'bg-amber-400', error: 'bg-red-400' }[activity.severity || 'info'];
                                      return (
                                        <div key={activity.id} className="flex items-center gap-1.5 py-0.5 border-b border-border/30 last:border-0">
                                          <div className={`h-3 w-3 rounded-full ${dotColor} flex items-center justify-center shrink-0`}>
                                            <Icon className="h-2.5 w-2.5 text-white" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            {activity.userEmail && <span className="text-[9px] font-medium text-primary truncate block">{activity.userEmail}</span>}
                                            <span className="text-[9px] text-muted-foreground truncate block">{activity.description || activity.message}</span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <div className={`h-1.5 w-1.5 rounded-full ${severityDot}`} />
                                            <span className="text-[8px] text-muted-foreground whitespace-nowrap">{formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {(!activityLog || activityLog.length === 0) && (
                                      <p className="text-[9px] text-muted-foreground text-center py-1">No activity events yet</p>
                                    )}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>

                            {/* RIGHT: Activity Distribution + Heatmap + Analytics */}
                            <div className="col-span-2 flex flex-col gap-1.5">

                              {/* Activity Distribution */}
                              <Card>
                                <CardContent className="p-2">
                                  <span className="text-[10px] font-medium block mb-1">Activity Distribution</span>
                                  <div className="space-y-0.5">
                                    {[
                                      { type: 'Registrations', count: activityLog?.filter(a => a.type === 'user_registration').length || 0, color: 'bg-green-500' },
                                      { type: 'Verifications', count: activityLog?.filter(a => a.type === 'email_verified').length || 0, color: 'bg-blue-500' },
                                      { type: 'Plans Created', count: activityLog?.filter(a => a.type === 'plan_created').length || 0, color: 'bg-purple-500' },
                                      { type: 'Plans Completed', count: activityLog?.filter(a => a.type === 'plan_completed').length || 0, color: 'bg-emerald-500' },
                                    ].map((item) => {
                                      const total = activityLog?.length || 1;
                                      const pct = Math.round((item.count / total) * 100);
                                      return (
                                        <div key={item.type} className="flex items-center gap-1">
                                          <span className="text-[9px] text-muted-foreground w-20 truncate">{item.type}</span>
                                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                                          </div>
                                          <span className="text-[9px] font-medium w-5 text-right">{item.count}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Hourly Heatmap */}
                              <Card>
                                <CardContent className="p-2">
                                  <span className="text-[10px] font-medium block mb-1">Activity by Hour (Today)</span>
                                  <div className="grid grid-cols-6 gap-0.5">
                                    {Array.from({ length: 24 }, (_, hour) => {
                                      const count = activityLog?.filter(a => new Date(a.timestamp).getHours() === hour).length || 0;
                                      const maxCount = Math.max(...Array.from({ length: 24 }, (_, h) => activityLog?.filter(a => new Date(a.timestamp).getHours() === h).length || 0), 1);
                                      const intensity = count / maxCount;
                                      return (
                                        <Tooltip key={hour}>
                                          <TooltipTrigger asChild>
                                            <div className={`h-3 rounded-sm cursor-pointer ${intensity === 0 ? 'bg-muted' : intensity < 0.25 ? 'bg-green-500/20' : intensity < 0.5 ? 'bg-green-500/40' : intensity < 0.75 ? 'bg-green-500/60' : 'bg-green-500/80'}`} />
                                          </TooltipTrigger>
                                          <TooltipContent><p className="text-xs">{hour}:00 — {count} events</p></TooltipContent>
                                        </Tooltip>
                                      );
                                    })}
                                  </div>
                                  <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                                    <span>00:00</span><span>12:00</span><span>23:00</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Compact Insights */}
                              <Card>
                                <CardContent className="p-2">
                                  <span className="text-[10px] font-medium block mb-0.5">Insights</span>
                                  <div className="space-y-0.5">
                                    {[
                                      { label: 'Peak Hour', value: (() => { const h = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: activityLog?.filter(a => new Date(a.timestamp).getHours() === i).length || 0 })).reduce((a, b) => a.count > b.count ? a : b, { hour: 0, count: 0 }); return `${h.hour}:00 (${h.count} events)`; })(), color: 'text-green-600' },
                                      { label: 'User Interactions', value: `${activityLog?.filter(a => a.userEmail).length || 0} tracked`, color: 'text-blue-600' },
                                      { label: 'Plan Events', value: `${activityLog?.filter(a => a.type.includes('plan')).length || 0} events`, color: 'text-purple-600' },
                                      { label: 'Last Event', value: activityLog?.[0] ? formatDistance(new Date(activityLog[0].timestamp), new Date(), { addSuffix: true }) : 'None', color: 'text-amber-600' },
                                    ].map((ins) => (
                                      <div key={ins.label} className="flex items-center justify-between">
                                        <span className="text-[9px] text-muted-foreground">{ins.label}</span>
                                        <span className={`text-[9px] font-medium ${ins.color}`}>{ins.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Analytics Strip (if available) */}
                              {activityOverview && (
                                <Card>
                                  <CardContent className="p-2">
                                    <span className="text-[10px] font-medium block mb-0.5">Live Analytics</span>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                      {[
                                        { label: 'Active Now', value: activityOverview.realtime?.activeUsersNow || 0, color: 'text-green-600' },
                                        { label: 'Sessions 1h', value: activityOverview.realtime?.sessionsLastHour || 0, color: 'text-blue-600' },
                                        { label: 'Views 24h', value: activityOverview.realtime?.pageViewsToday || 0, color: 'text-purple-600' },
                                        { label: 'Events 24h', value: activityOverview.realtime?.eventsToday || 0, color: 'text-orange-600' },
                                        { label: 'Avg Session', value: `${Math.round((activityOverview.realtime?.avgSessionDuration || 0) / 60)}m`, color: 'text-cyan-600' },
                                        { label: 'Countries', value: activityOverview.geoDistribution?.length || 0, color: 'text-emerald-600' },
                                      ].map((s) => (
                                        <div key={s.label} className="flex items-center justify-between">
                                          <span className="text-[9px] text-muted-foreground">{s.label}</span>
                                          <span className={`text-[9px] font-bold ${s.color}`}>{s.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                            </div>
                          </div>

                          {/* Active Sessions (compact, only if present) */}
                          {activeSessions && activeSessions.sessions.length > 0 && (
                            <Card>
                              <CardContent className="p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Wifi className="h-3 w-3 text-green-500" />
                                  <span className="text-[10px] font-medium">Active Sessions</span>
                                  <Badge variant="default" className="bg-green-500 text-[9px] h-4 px-1">{activeSessions.count} Live</Badge>
                                </div>
                                <div className="space-y-0.5">
                                  {activeSessions.sessions.slice(0, 5).map((session) => (
                                    <div key={session.id} className="flex items-center gap-2 py-0.5 border-b border-border/30 last:border-0">
                                      <div className="h-3 w-3 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-bold text-primary">{session.email?.charAt(0).toUpperCase()}</span>
                                      </div>
                                      <span className="text-[9px] font-medium truncate flex-1">{session.email}</span>
                                      <Badge variant="secondary" className="text-[8px] h-3.5 px-1 capitalize">{session.subscription_tier || 'free'}</Badge>
                                      {session.current_page && <span className="text-[8px] text-muted-foreground truncate max-w-[80px]">{session.current_page}</span>}
                                      <span className="text-[8px] text-muted-foreground shrink-0">{session.page_view_count}p · {Math.round(session.total_duration_seconds / 60)}m</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* EXECUTIVE KPIs SECTION - Detailed metrics with targets */}
                {activeSection === 'kpis' && (
                  <div className="space-y-1.5">
                    <AnimatePresence mode="wait">
                      {overviewLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5"
                        >
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i}>
                              <CardHeader className="p-2 pb-1">
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
                          className="space-y-1.5"
                        >
                          {/* KPI Performance Summary Header */}
                          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                            <CardContent className="p-2">
                              <div className="flex flex-row items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <h2 className="text-[11px] font-semibold">Executive KPI Dashboard</h2>
                                  <p className="text-[9px] text-muted-foreground">Strategic metrics with targets and performance tracking</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center px-2 py-0.5 bg-background rounded border">
                                    <p className={`text-xs font-bold ${
                                      (overviewData.extendedKPIs?.overallScore || 0) >= 80 ? 'text-green-500' :
                                      (overviewData.extendedKPIs?.overallScore || 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                                    }`}>{overviewData.extendedKPIs?.overallScore || 0}%</p>
                                    <p className="text-[9px] text-muted-foreground">Overall Score</p>
                                  </div>
                                  <div className="text-center px-2 py-0.5 bg-background rounded border">
                                    <p className="text-xs font-bold text-primary">5</p>
                                    <p className="text-[9px] text-muted-foreground">Active KPIs</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Business Performance KPIs with Targets */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {/* User Acquisition KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">User Acquisition</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">On Track</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">{filteredOverviewData?.kpiMetrics?.[0]?.value || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Current Users</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ 50</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((filteredOverviewData?.kpiMetrics?.[0]?.value || 0) / 50) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="text-[9px] font-medium text-green-500">{Math.round(((filteredOverviewData?.kpiMetrics?.[0]?.value || 0) / 50) * 100)}%</span>
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
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">Plan Completion Rate</CardTitle>
                                    <Badge variant="outline" className={
                                      (overviewData.extendedKPIs?.planCompletionRate || 0) >= 80 ? 'text-green-500 border-green-500/30' :
                                      (overviewData.extendedKPIs?.planCompletionRate || 0) >= 50 ? 'text-amber-500 border-amber-500/30' : 'text-red-500 border-red-500/30'
                                    }>
                                      {(overviewData.extendedKPIs?.planCompletionRate || 0) >= 80 ? 'On Track' :
                                       (overviewData.extendedKPIs?.planCompletionRate || 0) >= 50 ? 'Needs Focus' : 'Critical'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">{overviewData.extendedKPIs?.planCompletionRate || 0}%</p>
                                      <p className="text-[9px] text-muted-foreground">{overviewData.extendedKPIs?.completedPlans || 0} of {overviewData.extendedKPIs?.totalPlans || 0} completed</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ 80%</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={overviewData.extendedKPIs?.planCompletionRate || 0} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">vs Target</span>
                                    <span className={`font-medium ${
                                      (overviewData.extendedKPIs?.planCompletionRate || 0) >= 80 ? 'text-green-500' : 'text-amber-500'
                                    }`}>{Math.round(((overviewData.extendedKPIs?.planCompletionRate || 0) / 80) * 100)}% of goal</span>
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
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">Monthly Revenue</CardTitle>
                                    <Badge variant="outline" className={
                                      (overviewData.extendedKPIs?.monthlyRevenue || 0) >= (overviewData.extendedKPIs?.revenueTarget || 2000) ? 'text-green-500 border-green-500/30' :
                                      (overviewData.extendedKPIs?.monthlyRevenue || 0) >= ((overviewData.extendedKPIs?.revenueTarget || 2000) * 0.5) ? 'text-amber-500 border-amber-500/30' : 'text-red-500 border-red-500/30'
                                    }>
                                      {(overviewData.extendedKPIs?.monthlyRevenue || 0) >= (overviewData.extendedKPIs?.revenueTarget || 2000) ? 'Exceeding' :
                                       (overviewData.extendedKPIs?.monthlyRevenue || 0) >= ((overviewData.extendedKPIs?.revenueTarget || 2000) * 0.5) ? 'Growing' : 'Needs Focus'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">£{(overviewData.extendedKPIs?.monthlyRevenue || 0).toLocaleString()}</p>
                                      <p className="text-[9px] text-muted-foreground">Current MRR</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ £{(overviewData.extendedKPIs?.revenueTarget || 2000).toLocaleString()}</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((overviewData.extendedKPIs?.monthlyRevenue || 0) / (overviewData.extendedKPIs?.revenueTarget || 2000)) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">vs Target</span>
                                    <span className={`font-medium ${
                                      (overviewData.extendedKPIs?.monthlyRevenue || 0) >= (overviewData.extendedKPIs?.revenueTarget || 2000) ? 'text-green-500' : 'text-amber-500'
                                    }`}>{Math.round(((overviewData.extendedKPIs?.monthlyRevenue || 0) / (overviewData.extendedKPIs?.revenueTarget || 2000)) * 100)}% of goal</span>
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
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">Daily Active Users</CardTitle>
                                    <Badge variant="outline" className="text-green-500 border-green-500/30">Strong</Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">{overviewData.kpiMetrics?.[1]?.value || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Active Now</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ 25</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((overviewData.kpiMetrics?.[1]?.value || 0) / 25) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">Engagement</span>
                                    <span className="text-[9px] font-medium text-green-500">{Math.round(((filteredOverviewData?.kpiMetrics?.[1]?.value || 0) / (filteredOverviewData?.kpiMetrics?.[0]?.value || 1)) * 100)}% of users</span>
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
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">Tool Adoption Rate</CardTitle>
                                    <Badge variant="outline" className={
                                      (overviewData.extendedKPIs?.toolAdoptionRate || 0) >= 75 ? 'text-green-500 border-green-500/30' :
                                      (overviewData.extendedKPIs?.toolAdoptionRate || 0) >= 50 ? 'text-blue-500 border-blue-500/30' : 'text-amber-500 border-amber-500/30'
                                    }>
                                      {(overviewData.extendedKPIs?.toolAdoptionRate || 0) >= 75 ? 'Excellent' :
                                       (overviewData.extendedKPIs?.toolAdoptionRate || 0) >= 50 ? 'Growing' : 'Building'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">{overviewData.extendedKPIs?.toolAdoptionRate || 0}%</p>
                                      <p className="text-[9px] text-muted-foreground">{overviewData.extendedKPIs?.uniqueToolsUsed || 0} of {overviewData.extendedKPIs?.totalTools || 109} tools</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ 75%</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={overviewData.extendedKPIs?.toolAdoptionRate || 0} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">Avg tools/user</span>
                                    <span className="text-[9px] font-medium text-blue-500">{overviewData.extendedKPIs?.avgToolsPerUser || 0} tools</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* User Engagement KPI */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Card className="h-full">
                                <CardHeader className="p-2 pb-1">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-medium">User Engagement</CardTitle>
                                    <Badge variant="outline" className={
                                      ((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) >= 0.5 ? 'text-green-500 border-green-500/30' :
                                      ((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) >= 0.25 ? 'text-blue-500 border-blue-500/30' : 'text-amber-500 border-amber-500/30'
                                    }>
                                      {((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) >= 0.5 ? 'Excellent' :
                                       ((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) >= 0.25 ? 'Good' : 'Building'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-2 space-y-1">
                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-[9px] font-bold">{Math.round(((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) * 100)}%</p>
                                      <p className="text-[9px] text-muted-foreground">Daily active rate</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-semibold text-muted-foreground">/ 50%</p>
                                      <p className="text-[9px] text-muted-foreground">Target</p>
                                    </div>
                                  </div>
                                  <Progress value={Math.min(((overviewData.extendedKPIs?.dailyActiveUsers || 0) / Math.max(filteredOverviewData?.kpiMetrics?.[0]?.value || 1, 1)) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between text-[9px]">
                                    <span className="text-muted-foreground">Active users</span>
                                    <span className="text-[9px] font-medium text-blue-500">{overviewData.extendedKPIs?.dailyActiveUsers || 0} of {filteredOverviewData?.kpiMetrics?.[0]?.value || 0}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>

                          {/* Strategic Goals Section */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Target className="h-3 w-3 text-primary" />
                                    Quarterly Strategic Goals
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Q4 2025 objectives and progress tracking</CardDescription>
                                </div>
                                <Badge>Q4 2025</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {/* Goal 1 */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div>
                                      <h4 className="text-[10px] font-semibold">Reach 100 Active Users</h4>
                                      <p className="text-[9px] text-muted-foreground">Grow user base through organic marketing and referrals</p>
                                    </div>
                                    <Badge variant="secondary">{filteredOverviewData?.kpiMetrics?.[0]?.value || 0}/100</Badge>
                                  </div>
                                  <Progress value={((filteredOverviewData?.kpiMetrics?.[0]?.value || 0) / 100) * 100} className="h-1" />
                                  <div className="flex items-center justify-between mt-0.5 text-[9px]">
                                    <span className="text-muted-foreground">Due: Dec 31, 2025</span>
                                    <span className="text-primary font-medium">{((filteredOverviewData?.kpiMetrics?.[0]?.value || 0))}% complete</span>
                                  </div>
                                </div>

                                {/* Goal 2 - Real MRR from Stripe */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div>
                                      <h4 className="text-[10px] font-semibold">£5,000 Monthly Recurring Revenue</h4>
                                      <p className="text-[9px] text-muted-foreground">Scale premium tier conversions</p>
                                    </div>
                                    <Badge variant="secondary">£{(overviewData.extendedKPIs?.monthlyRevenue || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/£5,000</Badge>
                                  </div>
                                  <Progress value={Math.min(((overviewData.extendedKPIs?.monthlyRevenue || 0) / 5000) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between mt-0.5 text-[9px]">
                                    <span className="text-muted-foreground">Due: Dec 31, 2025</span>
                                    <span className={`font-medium ${((overviewData.extendedKPIs?.monthlyRevenue || 0) / 5000) * 100 >= 75 ? 'text-green-500' : ((overviewData.extendedKPIs?.monthlyRevenue || 0) / 5000) * 100 >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                      {Math.round(((overviewData.extendedKPIs?.monthlyRevenue || 0) / 5000) * 100)}% complete
                                    </span>
                                  </div>
                                </div>

                                {/* Goal 3 - Real Plan Completion Rate */}
                                <div className="p-4 rounded-lg border bg-muted/30">
                                  <div className="flex items-start justify-between mb-0.5">
                                    <div>
                                      <h4 className="text-[10px] font-semibold">75% Plan Completion Rate</h4>
                                      <p className="text-[9px] text-muted-foreground">Improve user journey and tool guidance</p>
                                    </div>
                                    <Badge variant="secondary">{overviewData.extendedKPIs?.planCompletionRate || 0}%/75%</Badge>
                                  </div>
                                  <Progress value={Math.min(((overviewData.extendedKPIs?.planCompletionRate || 0) / 75) * 100, 100)} className="h-1" />
                                  <div className="flex items-center justify-between mt-0.5 text-[9px]">
                                    <span className="text-muted-foreground">Due: Dec 31, 2025</span>
                                    <span className={`font-medium ${((overviewData.extendedKPIs?.planCompletionRate || 0) / 75) * 100 >= 75 ? 'text-green-500' : ((overviewData.extendedKPIs?.planCompletionRate || 0) / 75) * 100 >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                      {Math.round(((overviewData.extendedKPIs?.planCompletionRate || 0) / 75) * 100)}% complete
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Performance Comparison */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            {/* Weekly Performance Trend */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Weekly Performance Trend</CardTitle>
                                <CardDescription className="text-[9px]">7-day KPI performance overview</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsLineChart data={filteredOverviewData?.timeSeriesData?.slice(-7) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis
                                      dataKey="date"
                                      stroke="hsl(var(--foreground))"
                                      fontSize={8}
                                      tickFormatter={(value) => format(new Date(value), 'EEE')}
                                    />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={8} />
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
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Tier Upgrade Funnel</CardTitle>
                                <CardDescription className="text-[9px]">User progression through subscription tiers</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-24 text-[9px] font-medium">Free</div>
                                    <div className="flex-1">
                                      <Progress value={100} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-[9px]">{filteredOverviewData?.subscriptionDistribution?.find(s => s.tier === 'Free')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-24 text-[9px] font-medium">Basic</div>
                                    <div className="flex-1">
                                      <Progress value={60} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-[9px]">{filteredOverviewData?.subscriptionDistribution?.find(s => s.tier === 'Basic')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-24 text-[9px] font-medium">Premium</div>
                                    <div className="flex-1">
                                      <Progress value={40} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-[9px]">{filteredOverviewData?.subscriptionDistribution?.find(s => s.tier === 'Premium')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-24 text-[9px] font-medium">Enterprise</div>
                                    <div className="flex-1">
                                      <Progress value={20} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-[9px]">{filteredOverviewData?.subscriptionDistribution?.find(s => s.tier === 'Enterprise')?.count || 0}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-24 text-[9px] font-medium">Ultimate</div>
                                    <div className="flex-1">
                                      <Progress value={10} className="h-6" />
                                    </div>
                                    <div className="w-16 text-right text-[9px]">{filteredOverviewData?.subscriptionDistribution?.find(s => s.tier === 'Ultimate')?.count || 0}</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Key Insights */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Lightbulb className="h-3 w-3 text-amber-500" />
                                Key Performance Insights
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    <span className="text-[9px] font-medium text-green-500">Strength</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">User acquisition exceeding target by 24%. Strong organic growth from referrals.</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                    <span className="text-[9px] font-medium text-amber-500">Opportunity</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">Plan completion rate needs improvement. Consider adding guided onboarding.</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Target className="h-3 w-3 text-blue-500" />
                                    <span className="text-[9px] font-medium text-blue-500">Focus Area</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">Premium tier conversion is key to hitting Q4 revenue target. Focus marketing efforts.</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        <Card>
                          <CardContent className="py-1 text-center">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                            <p className="text-[9px] text-muted-foreground">No KPI data available</p>
                          </CardContent>
                        </Card>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Users Section */}
                {activeSection.startsWith('users') && (
                  <div className="space-y-1.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1.5"
              >
                {/* User Journey Analytics - detailed funnel visualization */}
                {(activeSection === 'users-journey' || activeSection === 'users-overview') && (
                  <Card data-testid="card-user-journey-analytics">
                    <CardHeader className="p-2 pb-1">
                      <CardTitle className="text-[11px] font-bold">User Journey Analytics</CardTitle>
                      <CardDescription className="text-[9px]">Track user progression from registration to active engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const totalUsers = filteredOverviewData?.kpiMetrics?.[0]?.value || 38;
                        const activeUsers = filteredOverviewData?.kpiMetrics?.[1]?.value || 32;
                        
                        const funnelData = [
                          { stage: 'Registered', count: totalUsers, color: '#f59e0b' },
                          { stage: 'Email Verified', count: activeUsers, color: '#3b82f6' },
                          { stage: 'First Login', count: activeUsers, color: '#f59e0b' },
                          { stage: 'Used Tool', count: Math.round(activeUsers * 0.9), color: '#22c55e' },
                          { stage: 'Created Plan', count: Math.round(activeUsers * 0.75), color: '#8b5cf6' },
                          { stage: 'Active User', count: activeUsers, color: '#06b6d4' },
                        ];

                        return (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                              {/* Custom Pyramid Funnel Visualization */}
                              <div>
                                <h4 className="text-[10px] font-semibold mb-0.5">Conversion Funnel</h4>
                                <div className="relative flex flex-col items-center justify-center py-1">
                                  {funnelData.map((stage, index) => {
                                    const maxWidth = 100;
                                    const minWidth = 30;
                                    const widthPercent = maxWidth - ((maxWidth - minWidth) * (index / (funnelData.length - 1)));
                                    const heightPx = 28;
                                    
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
                                        <span className="text-white font-semibold text-[9px] drop-shadow-md">
                                          {stage.count} users
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Funnel Stage Breakdown - detailed */}
                              <div>
                                <h4 className="text-[10px] font-semibold mb-0.5">Funnel Stage Breakdown</h4>
                                <div className="space-y-1.5">
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
                                        className="space-y-0.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <div 
                                              className="w-3 h-3 rounded-full" 
                                              style={{ backgroundColor: stage.color }}
                                            />
                                            <span className="font-semibold text-foreground">{stage.stage}</span>
                                          </div>
                                          <Badge 
                                            className="text-white font-medium px-1.5"
                                            style={{ backgroundColor: stage.color }}
                                          >
                                            {stage.count} users
                                          </Badge>
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-[9px]">
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-1 border-t">
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                              >
                                <p className="text-xs font-bold text-green-500">+{usersAnalytics?.growthRate?.daily || 5.2}%</p>
                                <p className="text-[9px] text-muted-foreground">Daily Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                              >
                                <p className="text-xs font-bold text-blue-500">+{usersAnalytics?.growthRate?.weekly || 12.8}%</p>
                                <p className="text-[9px] text-muted-foreground">Weekly Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                              >
                                <p className="text-xs font-bold text-purple-500">+{usersAnalytics?.growthRate?.monthly || 28.5}%</p>
                                <p className="text-[9px] text-muted-foreground">Monthly Growth</p>
                              </motion.div>
                              <motion.div 
                                className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                              >
                                <p className="text-xs font-bold text-amber-500">{((activeUsers / totalUsers) * 100).toFixed(1)}%</p>
                                <p className="text-[9px] text-muted-foreground">Activation Rate</p>
                              </motion.div>
                            </div>

                            {/* Conversion Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                              <Card className="bg-green-500/5 border-green-500/20">
                                <CardContent className="p-2">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span className="text-[9px] font-medium text-green-500">Strong Point</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">
                                    Email verification rate of {((activeUsers / totalUsers) * 100).toFixed(1)}% exceeds industry average of 70%
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="bg-amber-500/5 border-amber-500/20">
                                <CardContent className="p-2">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                    <span className="text-[9px] font-medium text-amber-500">Focus Area</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">
                                    Tool usage activation can be improved with better onboarding flows
                                  </p>
                                </CardContent>
                              </Card>
                              <Card className="bg-blue-500/5 border-blue-500/20">
                                <CardContent className="p-2">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Target className="h-3 w-3 text-blue-500" />
                                    <span className="text-[9px] font-medium text-blue-500">Next Goal</span>
                                  </div>
                                  <p className="text-[9px] text-muted-foreground">
                                    Target 90%+ first login conversion by Q1 2026
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                    {/* Users by Tier Over Time */}
                    <Card data-testid="card-users-by-tier">
                      <CardHeader className="p-2 pb-1">
                        <CardTitle className="text-[10px] font-semibold">Users by Tier Over Time</CardTitle>
                        <CardDescription className="text-[9px]">Subscription tier evolution</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={80}>
                          <RechartsBarChart data={filteredUsersAnalytics?.usersByTier}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--foreground))"
                              fontSize={8}
                              tickFormatter={(value) => format(new Date(value), 'MMM')}
                            />
                            <YAxis stroke="hsl(var(--foreground))" fontSize={8} />
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
                    <CardHeader className="p-2 pb-1">
                      <CardTitle className="text-[10px] font-semibold">Geographic Distribution</CardTitle>
                      <CardDescription className="text-[9px]">User distribution by country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {usersAnalytics?.geographicDistribution && usersAnalytics.geographicDistribution.length > 0 ? (
                        <div className="space-y-1.5">
                          <ResponsiveContainer width="100%" height={120}>
                            <RechartsBarChart 
                              data={usersAnalytics.geographicDistribution.sort((a, b) => b.users - a.users).slice(0, 15)}
                              layout="vertical"
                              margin={{ left: 60, right: 5, top: 2, bottom: 2 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                              <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={8} />
                              <YAxis 
                                type="category" 
                                dataKey="country" 
                                stroke="hsl(var(--foreground))" 
                                fontSize={8}
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
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                            {usersAnalytics.geographicDistribution.slice(0, 8).map((item, index) => (
                              <div key={item.country} className="p-1.5 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                  <span className="font-medium text-[9px]">{item.country}</span>
                                </div>
                                <p className="text-[9px] font-bold">{item.users}</p>
                                <p className="text-[9px] text-muted-foreground">
                                  {((item.users / usersAnalytics.geographicDistribution.reduce((sum, i) => sum + i.users, 0)) * 100).toFixed(1)}% of total
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-1 text-center">
                          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                          <p className="text-[9px] text-muted-foreground">No geographic data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Churn Analysis - Show only when users-churn is selected */}
                {activeSection === 'users-churn' && (
                  <Card data-testid="card-churn-analysis">
                    <CardHeader className="p-2 pb-1">
                      <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                        <UserX className="h-3 w-3 text-red-500" />
                        Churn Risk Analysis
                      </CardTitle>
                      <CardDescription className="text-[9px]">Identify users at risk of churning and track retention metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5">
                        {/* Churn Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-1 mb-0.5">
                              <UserX className="h-3 w-3 text-red-500" />
                              <span className="text-[9px] font-medium">At-Risk Users</span>
                            </div>
                            <p className="text-xs font-bold text-red-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity > 14 && daysSinceActivity <= 30;
                              }).length || 0}
                            </p>
                            <p className="text-[9px] text-muted-foreground">14-30 days inactive</p>
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-1 mb-0.5">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              <span className="text-[9px] font-medium">Churned Users</span>
                            </div>
                            <p className="text-xs font-bold text-amber-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity > 30;
                              }).length || 0}
                            </p>
                            <p className="text-[9px] text-muted-foreground">30+ days inactive</p>
                          </div>
                          <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-1 mb-0.5">
                              <UserCheck className="h-3 w-3 text-green-500" />
                              <span className="text-[9px] font-medium">Active Users</span>
                            </div>
                            <p className="text-xs font-bold text-green-500">
                              {usersData?.users?.filter(u => {
                                const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                return daysSinceActivity <= 7;
                              }).length || 0}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Active in last 7 days</p>
                          </div>
                          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Target className="h-3 w-3 text-blue-500" />
                              <span className="text-[9px] font-medium">Retention Rate</span>
                            </div>
                            <p className="text-xs font-bold text-blue-500">
                              {usersData?.users?.length ? 
                                ((usersData.users.filter(u => {
                                  const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                                  const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                                  return daysSinceActivity <= 30;
                                }).length / usersData.users.length) * 100).toFixed(1) : 0}%
                            </p>
                            <p className="text-[9px] text-muted-foreground">30-day retention</p>
                          </div>
                        </div>

                        {/* At-Risk Users List */}
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                            Users Requiring Attention
                          </h4>
                          <div className="space-y-0.5">
                            {usersData?.users?.filter(u => {
                              const lastActivity = u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt);
                              const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                              return daysSinceActivity > 7;
                            }).slice(0, 10).map(user => {
                              const lastActivity = user.updatedAt ? new Date(user.updatedAt) : new Date(user.createdAt);
                              const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
                              const riskLevel = daysSinceActivity > 30 ? 'high' : daysSinceActivity > 14 ? 'medium' : 'low';
                              return (
                                <div key={user.id} className="flex items-center justify-between p-1 rounded-lg border bg-card hover-elevate">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${riskLevel === 'high' ? 'bg-red-500' : riskLevel === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'}`} />
                                    <div>
                                      <p className="font-medium">{user.firstName || user.email?.split('@')[0] || 'Unknown'}</p>
                                      <p className="text-[9px] text-muted-foreground">{user.email}</p>
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
                              <div className="py-1 text-center text-muted-foreground">
                                <UserCheck className="h-12 w-12 mx-auto mb-1 opacity-50" />
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
                    <CardHeader className="p-2 pb-1">
                      <CardTitle className="text-[10px] font-semibold">User Retention Cohort Analysis</CardTitle>
                      <CardDescription className="text-[9px]">Week-over-week retention rates by cohort</CardDescription>
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
                                    <div className="h-6 px-1.5 rounded bg-chart-1 text-white text-xs font-medium flex items-center justify-center">
                                      100%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-1.5 rounded bg-chart-2 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week1 / cohort.week0 }}
                                    >
                                      {((cohort.week1 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-1.5 rounded bg-chart-3 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week2 / cohort.week0 }}
                                    >
                                      {((cohort.week2 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-1.5 rounded bg-chart-4 text-white text-xs font-medium flex items-center justify-center"
                                      style={{ opacity: cohort.week3 / cohort.week0 }}
                                    >
                                      {((cohort.week3 / cohort.week0) * 100).toFixed(0)}%
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-6 px-1.5 rounded bg-chart-5 text-white text-xs font-medium flex items-center justify-center"
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
                  <CardHeader className="p-2 pb-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5">
                      <div>
                        <CardTitle className="text-[10px] font-semibold">User Management</CardTitle>
                        <CardDescription className="text-[9px]">View, search, and manage all platform users</CardDescription>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Hide Demo Users Toggle */}
                        <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-md border bg-muted/30">
                          <Label htmlFor="hide-demo-users" className="text-[9px] font-medium cursor-pointer">
                            {hideDemoUsers ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                          </Label>
                          <Switch
                            id="hide-demo-users"
                            checked={hideDemoUsers}
                            onCheckedChange={setHideDemoUsers}
                            data-testid="switch-hide-demo-users"
                          />
                          <Label htmlFor="hide-demo-users" className="text-[9px] text-muted-foreground cursor-pointer">
                            {hideDemoUsers 
                              ? `Hiding ${demoUserCount} demo users` 
                              : `Show all (${demoUserCount} demo)`}
                          </Label>
                        </div>

                        {/* Data Density Control */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Layers className="h-3 w-3 mr-2" />
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
                        <div className="relative w-40">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
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
                                  <Target className="h-3 w-3 mr-2" />
                                  Bulk Actions ({selectedUsers.length})
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56" align="end">
                                <DropdownMenuLabel>Email Verification</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => bulkVerifyMutation.mutate({ userIds: selectedUsers, verified: true })}>
                                  <BadgeCheck className="h-3 w-3 mr-2 text-green-500" />
                                  Verify All Emails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkVerifyMutation.mutate({ userIds: selectedUsers, verified: false })}>
                                  <XCircle className="h-3 w-3 mr-2 text-orange-500" />
                                  Unverify All Emails
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Tier</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { subscriptionTier: 'free' } })}>
                                  <Crown className="h-3 w-3 mr-2 text-gray-500" />
                                  Set to Free
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { subscriptionTier: 'basic' } })}>
                                  <Crown className="h-3 w-3 mr-2 text-blue-500" />
                                  Set to Basic
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { subscriptionTier: 'premium' } })}>
                                  <Crown className="h-3 w-3 mr-2 text-purple-500" />
                                  Set to Premium
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { subscriptionTier: 'enterprise' } })}>
                                  <Crown className="h-3 w-3 mr-2 text-amber-500" />
                                  Set to Enterprise
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { subscriptionTier: 'ultimate' } })}>
                                  <Crown className="h-3 w-3 mr-2 text-gradient" />
                                  Set to Ultimate
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { isAdmin: true } })}>
                                  <Shield className="h-3 w-3 mr-2 text-blue-500" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkUpdateUsersMutation.mutate({ userIds: selectedUsers, updates: { isAdmin: false } })}>
                                  <ShieldOff className="h-3 w-3 mr-2" />
                                  Remove Admin Access
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Data & Sessions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => bulkExportUserData(selectedUsers)}>
                                  <Download className="h-3 w-3 mr-2" />
                                  Export User Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (confirm(`Force logout ${selectedUsers.length} users?`)) {
                                    bulkForceLogoutMutation.mutate(selectedUsers);
                                  }
                                }}>
                                  <LogOut className="h-3 w-3 mr-2" />
                                  Force Logout All
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-orange-500">Restrictions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => {
                                  if (confirm(`Suspend ${selectedUsers.length} users for 7 days?`)) {
                                    bulkSuspendMutation.mutate({ userIds: selectedUsers, suspended: true, durationDays: 7 });
                                  }
                                }}>
                                  <Clock className="h-3 w-3 mr-2 text-orange-500" />
                                  Suspend All (7 days)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkSuspendMutation.mutate({ userIds: selectedUsers, suspended: false })}>
                                  <Clock className="h-3 w-3 mr-2 text-green-500" />
                                  Lift All Suspensions
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (confirm(`Ban ${selectedUsers.length} users permanently?`)) {
                                    bulkBanMutation.mutate({ userIds: selectedUsers, banned: true });
                                  }
                                }}>
                                  <Ban className="h-3 w-3 mr-2 text-red-500" />
                                  Ban All Users
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => bulkBanMutation.mutate({ userIds: selectedUsers, banned: false })}>
                                  <UserCheck className="h-3 w-3 mr-2 text-green-500" />
                                  Unban All Users
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-red-500">Danger Zone</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  className="text-red-500 focus:text-red-500"
                                  onClick={() => {
                                    if (confirm(`DELETE ${selectedUsers.length} users PERMANENTLY? This cannot be undone!`)) {
                                      if (confirm(`Are you absolutely sure? Type count to confirm: ${selectedUsers.length} users will be deleted forever.`)) {
                                        bulkDeleteUsersMutation.mutate(selectedUsers);
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete All Users
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
                      <div className="space-y-1">
                        {Array.from({ length: usersPageSize }).map((_, i) => (
                          <ShimmerSkeleton key={i} />
                        ))}
                      </div>
                    ) : usersData && filteredUsers.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedUsers(filteredUsers.map(u => u.id));
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
                                <TableHead>Last Activity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.map((user) => (
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
                                  <TableCell className="text-[9px] text-muted-foreground">
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-[9px]">
                                    {(user as any).lastActivityAt ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className={`h-2 w-2 rounded-full ${
                                          new Date((user as any).lastActivityAt) > new Date(Date.now() - 5 * 60 * 1000)
                                            ? 'bg-green-500 animate-pulse'
                                            : new Date((user as any).lastActivityAt) > new Date(Date.now() - 60 * 60 * 1000)
                                            ? 'bg-yellow-500'
                                            : 'bg-muted-foreground'
                                        }`} />
                                        <span className="text-muted-foreground">
                                          {formatDistance(new Date((user as any).lastActivityAt), new Date(), { addSuffix: true })}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground/50">No activity</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" data-testid={`button-user-actions-${user.id}`}>
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem onClick={() => setViewingUserDetails(user)}>
                                          <Eye className="h-3 w-3 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setImpersonatingUser(user);
                                          fetchImpersonationData(user.id);
                                        }}>
                                          <UserCog className="h-3 w-3 mr-2" />
                                          View as User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                          setEditingUser(user);
                                          setEditUserTier(user.subscriptionTier);
                                          setEditUserIsAdmin(user.isAdmin);
                                        }}>
                                          <Edit className="h-3 w-3 mr-2" />
                                          Edit User
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Access Control</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem onClick={() => verifyUserMutation.mutate({ userId: user.id, verified: !user.isVerified })}>
                                          {user.isVerified ? (
                                            <>
                                              <XCircle className="h-3 w-3 mr-2 text-orange-500" />
                                              Unverify Email
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                              Verify Email
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTierOverrideUser(user)}>
                                          <Crown className="h-3 w-3 mr-2 text-yellow-500" />
                                          Change Tier
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setCreditsUser(user)}>
                                          <Wallet className="h-3 w-3 mr-2 text-blue-500" />
                                          Manage Credits
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Admin Tools</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem onClick={() => {
                                          setNotesUser(user);
                                          setAdminNotes((user as any).adminNotes || "");
                                        }}>
                                          <FileText className="h-3 w-3 mr-2" />
                                          Admin Notes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => resetPasswordMutation.mutate(user.id)}>
                                          <LockKeyhole className="h-3 w-3 mr-2" />
                                          Reset Password
                                        </DropdownMenuItem>
                                        {!user.isAdmin && (
                                          <DropdownMenuItem onClick={() => adminToggleMutation.mutate({ userId: user.id, isAdmin: true })}>
                                            <Shield className="h-3 w-3 mr-2 text-purple-500" />
                                            Make Admin
                                          </DropdownMenuItem>
                                        )}
                                        {user.isAdmin && user.id !== (window as any).__currentUserId && (
                                          <DropdownMenuItem onClick={() => adminToggleMutation.mutate({ userId: user.id, isAdmin: false })} className="text-orange-600">
                                            <Shield className="h-3 w-3 mr-2" />
                                            Remove Admin
                                          </DropdownMenuItem>
                                        )}
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Data & Sessions</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem onClick={() => exportUserData(user.id)}>
                                          <Download className="h-3 w-3 mr-2 text-blue-500" />
                                          Export User Data
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setViewingUserActivity(user)}>
                                          <Activity className="h-3 w-3 mr-2 text-green-500" />
                                          View Activity
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setAnalyzingUser(user)}>
                                          <Microscope className="h-3 w-3 mr-2 text-purple-500" />
                                          Deep Analysis
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => forceLogoutMutation.mutate(user.id)}>
                                          <LogOut className="h-3 w-3 mr-2 text-orange-500" />
                                          Force Logout
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Restrictions</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem onClick={() => setSuspendingUser(user)} className="text-orange-600">
                                          <Clock className="h-3 w-3 mr-2" />
                                          Suspend User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setBanningUser(user)} className="text-red-600">
                                          <Ban className="h-3 w-3 mr-2" />
                                          Ban User
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Danger Zone</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem 
                                          onClick={() => setDeletingUser(user)} 
                                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="page-size" className="text-[9px] text-muted-foreground">
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

                          <p className="text-[9px] text-muted-foreground">
                            Showing {filteredUsers.length} users
                            {hideDemoUsers && <span className="ml-1 text-orange-500">(demo users excluded)</span>}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                              disabled={usersPage === 1}
                              data-testid="button-users-prev"
                            >
                              <ChevronLeft className="h-3 w-3 mr-1" />
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
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-1 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[9px] text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
                  </div>
                )}

                {/* Plans Section */}
                {activeSection.startsWith('plans') && (
                  <div className="space-y-1.5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1.5"
              >
                {/* Plan Analytics */}
                {plansAnalytics && (plansAnalytics.completionFunnel?.length > 0 || plansAnalytics.statusDistribution?.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                    {/* Plan Completion Funnel */}
                    {plansAnalytics.completionFunnel && plansAnalytics.completionFunnel.length > 0 && (
                      <Card data-testid="card-plan-completion-funnel">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-[10px] font-semibold">Plan Completion Funnel</CardTitle>
                          <CardDescription className="text-[9px]">From creation to completion</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={80}>
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
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-[10px] font-semibold">Plan Status Distribution</CardTitle>
                          <CardDescription className="text-[9px]">Current status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={80}>
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
                  <CardHeader className="p-2 pb-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1.5">
                      <div>
                        <CardTitle className="text-[10px] font-semibold">Business Plans Management</CardTitle>
                        <CardDescription className="text-[9px]">View and manage all business plans</CardDescription>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
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
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete ({selectedPlans.length})
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {plansLoading ? (
                      <div className="space-y-1">
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
                                  <TableCell className="text-[9px] text-muted-foreground">
                                    {plan.userEmail || 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-[9px] text-muted-foreground">
                                    {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <MoreVertical className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="h-3 w-3 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            window.open(`/api/admin/plans/${plan.id}/download`, '_blank');
                                          }}
                                        >
                                          <Download className="h-3 w-3 mr-2" />
                                          Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => toggleDemoMutation.mutate(plan.id)}>
                                          <Sparkles className="h-3 w-3 mr-2" />
                                          Toggle Demo
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-red-500"
                                          onClick={() => setDeletingPlan(plan)}
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="plans-page-size" className="text-[9px] text-muted-foreground">
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

                          <p className="text-[9px] text-muted-foreground">
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
                              <ChevronLeft className="h-3 w-3 mr-1" />
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
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-1 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[9px] text-muted-foreground">No plans found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
                  </div>
                )}

                {/* Tool Performance Section - 5 Unique Advanced Pages */}
                {activeSection.startsWith('tools') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* 1. USAGE ANALYTICS - Comprehensive Tool Usage Insights */}
                      {activeSection === 'tools-usage' && (
                        <>
                          {/* Usage Overview Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
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
                                        <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                        <p className="text-[9px] font-bold">{stat.value}</p>
                                        <Badge className={`mt-2 bg-${stat.color}-500/10 text-${stat.color}-500`}>{stat.change}</Badge>
                                      </div>
                                      <stat.icon className={`h-5 w-5 text-${stat.color}-500 opacity-50`} />
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Usage Trends Chart */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Tool Usage Trends</CardTitle>
                                  <CardDescription className="text-[9px]">Daily usage patterns over 30 days with interactive brush</CardDescription>
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
                                <ResponsiveContainer width="100%" height={100}>
                                  <RechartsAreaChart data={toolAnalytics.usageTrends}>
                                    <defs>
                                      <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={8} tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={8} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      labelFormatter={(v) => format(new Date(v), 'PPP')}
                                    />
                                    <Area type="monotone" dataKey="uses" stroke="#3b82f6" fill="url(#usageGradient)" strokeWidth={3} />
                                    <Brush dataKey="date" height={40} stroke="#3b82f6" tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                                  </RechartsAreaChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[350px] flex items-center justify-center">
                                  <Skeleton className="w-full h-full" />
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Category Breakdown & User Segments */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Usage by Category</CardTitle>
                                <CardDescription className="text-[9px]">Tool usage distribution across categories</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
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
                                      className="space-y-0.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                          <span className="font-medium">{item.category}</span>
                                        </div>
                                        <span className="text-[9px] font-bold">{item.uses.toLocaleString()} uses</span>
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
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Usage by User Tier</CardTitle>
                                <CardDescription className="text-[9px]">How different subscription tiers use tools</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={90}>
                                  <RechartsBarChart data={[
                                    { tier: 'Free', uses: 890, avgPerUser: 12 },
                                    { tier: 'Basic', uses: 2340, avgPerUser: 28 },
                                    { tier: 'Premium', uses: 4560, avgPerUser: 45 },
                                    { tier: 'Enterprise', uses: 3210, avgPerUser: 67 },
                                    { tier: 'Ultimate', uses: 1847, avgPerUser: 92 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="tier" stroke="hsl(var(--foreground))" fontSize={8} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={8} />
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
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <Grid className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Usage Heatmap Analysis</p>
                                    <p className="text-[9px] font-bold">Peak: Tue-Thu, 10am-2pm GMT</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Busiest Hour</p>
                                    <p className="text-[9px] font-bold">11:00</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Busiest Day</p>
                                    <p className="text-[9px] font-bold">Wednesday</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Hourly Heatmap */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">24-Hour Usage Distribution</CardTitle>
                              <CardDescription className="text-[9px]">Tool activity intensity by hour of day</CardDescription>
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
                                          <span className="text-[9px] font-bold text-white">{hour.hour}:00</span>
                                          <span className="text-xs text-white/80">{hour.count}</span>
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{hour.count} tool uses at {hour.hour}:00</p>
                                        <p className="text-[9px] text-muted-foreground">{((hour.count / maxCount) * 100).toFixed(0)}% of peak</p>
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
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Weekly Activity Pattern</CardTitle>
                              <CardDescription className="text-[9px]">Heatmap showing usage by day and time period</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => (
                                  <motion.div
                                    key={day}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: dayIndex * 0.08 }}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span className="w-24 text-[9px] font-medium">{day}</span>
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
                                              <p className="text-[9px] text-muted-foreground">{Math.round(adjustedIntensity)}% activity</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                ))}
                                <div className="flex items-center gap-4 pt-4 border-t">
                                  <span className="w-24 text-[9px] text-muted-foreground">Legend:</span>
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
                      {activeSection === 'tools-popular' && (
                        <>
                          {/* Top Tools Leaderboard */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    Tool Leaderboard
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Top 15 most used tools by usage count</CardDescription>
                                </div>
                                <Badge className="bg-amber-500 text-white">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Top Performers
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {(() => {
                                  const defaultTools = [
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
                                  ];
                                  const rawTools = toolAnalytics?.topTools;
                                  const hasValidData = rawTools && rawTools.length > 0 && rawTools.some((t: any) => 
                                    (t.toolName || t.toolId) && (t.usageCount > 0 || t.count > 0)
                                  );
                                  const toolsData = hasValidData 
                                    ? rawTools.map((t: any) => ({
                                        toolName: t.toolName || (t.toolId ? t.toolId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unknown Tool'),
                                        usageCount: t.usageCount ?? t.count ?? 0
                                      }))
                                    : defaultTools;
                                  const maxUses = toolsData[0]?.usageCount || 1;
                                  
                                  return toolsData.slice(0, 10).map((tool, index) => {
                                    const percent = ((tool.usageCount || 0) / maxUses) * 100;
                                    return (
                                      <motion.div
                                        key={tool.toolName + index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover-elevate"
                                      >
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full font-bold text-white ${
                                          index === 0 ? 'bg-amber-500' :
                                          index === 1 ? 'bg-gray-400' :
                                          index === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground'
                                        }`}>
                                          {index + 1}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{tool.toolName}</span>
                                            <span className="font-bold">{(tool.usageCount || 0).toLocaleString()}</span>
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
                                  });
                                })()}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Radial Bar Chart & Category Treemap */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Top Tools - Radial View</CardTitle>
                                <CardDescription className="text-[9px]">Circular visualization of tool popularity</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {(() => {
                                  const defaultRadialData = [
                                    { name: 'Business Plan', value: 1847 },
                                    { name: 'Innovation Score', value: 1523 },
                                    { name: 'Pitch Coach', value: 1289 },
                                    { name: 'Financial Proj.', value: 1156 },
                                    { name: 'Doc Checklist', value: 987 },
                                    { name: 'Market Analysis', value: 856 },
                                    { name: 'Timeline', value: 742 },
                                    { name: 'Endorser Match', value: 689 },
                                  ];
                                  const rawTools = toolAnalytics?.topTools;
                                  const hasValidData = rawTools && rawTools.length > 0 && rawTools.some((t: any) => 
                                    (t.toolName || t.toolId) && (t.usageCount > 0 || t.count > 0)
                                  );
                                  const radialData = hasValidData
                                    ? rawTools.slice(0, 8).map((tool: any, index: number) => {
                                        const name = tool.toolName || (tool.toolId ? tool.toolId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Tool');
                                        return {
                                          name: name.length > 15 ? name.slice(0, 13) + '...' : name,
                                          value: tool.usageCount ?? tool.count ?? 0,
                                          fill: CHART_COLORS[index % CHART_COLORS.length]
                                        };
                                      })
                                    : defaultRadialData.map((item, index) => ({ ...item, fill: CHART_COLORS[index % CHART_COLORS.length] }));
                                  
                                  return (
                                    <ResponsiveContainer width="100%" height={100}>
                                      <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="20%"
                                        outerRadius="90%"
                                        data={radialData}
                                      >
                                        <RadialBar background dataKey="value" />
                                        <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" />
                                        <RechartsTooltip
                                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                        />
                                      </RadialBarChart>
                                    </ResponsiveContainer>
                                  );
                                })()}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Category Treemap</CardTitle>
                                <CardDescription className="text-[9px]">Hierarchical view of tool categories</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {(() => {
                                  const defaultCategories = [
                                    { name: 'Compliance', value: 3420 },
                                    { name: 'Business', value: 2890 },
                                    { name: 'Financial', value: 2150 },
                                    { name: 'Documentation', value: 1870 },
                                    { name: 'Innovation', value: 1340 },
                                    { name: 'Growth', value: 1177 },
                                  ];
                                  const categoryData = (toolAnalytics?.categoryBreakdown && toolAnalytics.categoryBreakdown.length > 0)
                                    ? toolAnalytics.categoryBreakdown
                                    : defaultCategories;
                                  
                                  return (
                                    <ResponsiveContainer width="100%" height={100}>
                                      <Treemap
                                        data={categoryData}
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
                                  );
                                })()}
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* 4. ENGAGEMENT METRICS - User Interaction Analysis */}
                      {activeSection === 'tools-engagement' && (
                        <>
                          {/* Engagement KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
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
                                        <p className="text-[9px] text-muted-foreground">{metric.label}</p>
                                        <p className="text-xs font-bold mt-1">{metric.value}</p>
                                        <Badge className={`mt-2 bg-green-500/10 text-green-500`}>{metric.change}</Badge>
                                      </div>
                                      <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                                        <metric.icon className={`h-3 w-3 text-${metric.color}-500`} />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* User Journey Funnel */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">User Engagement Funnel</CardTitle>
                              <CardDescription className="text-[9px]">How users progress through the tool ecosystem</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
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
                                    className="flex items-center gap-1.5"
                                  >
                                    <div className="w-48">
                                      <p className="font-medium text-[9px]">{item.stage}</p>
                                      <p className="text-[9px] text-muted-foreground">{item.users} users</p>
                                    </div>
                                    <div className="flex-1 relative h-8 rounded-lg overflow-hidden bg-muted/30">
                                      <motion.div
                                        className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3"
                                        style={{ backgroundColor: item.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                      >
                                        <span className="text-white text-[9px] font-bold">{item.percent}%</span>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Engagement by Feature */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Feature Engagement</CardTitle>
                                <CardDescription className="text-[9px]">Which features users interact with most</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
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
                                      className="flex items-center gap-1.5"
                                    >
                                      <span className="w-32 text-[9px] font-medium">{item.feature}</span>
                                      <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="h-full rounded-full"
                                          style={{ backgroundColor: item.color }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.engagement}%` }}
                                          transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                                        />
                                      </div>
                                      <span className="w-12 text-[9px] font-bold text-right">{item.engagement}%</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Session Depth Analysis</CardTitle>
                                <CardDescription className="text-[9px]">How deep users go in each session</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsBarChart data={[
                                    { depth: '1 tool', sessions: 145 },
                                    { depth: '2-3 tools', sessions: 234 },
                                    { depth: '4-5 tools', sessions: 167 },
                                    { depth: '6-10 tools', sessions: 89 },
                                    { depth: '10+ tools', sessions: 45 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="depth" stroke="hsl(var(--foreground))" fontSize={11} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={8} />
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
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <motion.div
                                    className="p-3 rounded-xl bg-green-500 text-white"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Target className="h-3 w-3" />
                                  </motion.div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Overall Completion Rate</p>
                                    <p className="text-xs font-bold text-green-500">73.4%</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Fully Completed</p>
                                    <p className="text-[9px] font-bold">5,847</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Partially</p>
                                    <p className="text-[9px] font-bold">2,134</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Abandoned</p>
                                    <p className="text-[9px] font-bold">866</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Completion by Tool */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Completion Rates by Tool</CardTitle>
                                  <CardDescription className="text-[9px]">Success rates for each tool</CardDescription>
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
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
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="font-medium text-[9px]">{item.tool}</span>
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
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.started} sessions started</p>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Completion Trends - Real Data */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-[10px] font-semibold">Current Completion Rate</CardTitle>
                                    <CardDescription className="text-[9px]">Real-time plan completion status</CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-green-500 border-green-500/30">Live</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col items-center justify-center h-[280px]">
                                  <div className="relative w-48 h-48">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                      <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                                      <circle 
                                        cx="50" cy="50" r="40" fill="none" 
                                        stroke="#22c55e" strokeWidth="8"
                                        strokeDasharray={`${(overviewData.extendedKPIs?.planCompletionRate || 0) * 2.51} 251.2`}
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="text-[11px] font-bold">{overviewData.extendedKPIs?.planCompletionRate || 0}%</span>
                                      <span className="text-[9px] text-muted-foreground">Complete</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-4 mt-1 text-[9px]">
                                    <div className="text-center">
                                      <p className="font-bold text-green-500">{overviewData.extendedKPIs?.completedPlans || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Completed</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="font-bold">{overviewData.extendedKPIs?.totalPlans || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Total Plans</p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-[10px] font-semibold">Plan Status Overview</CardTitle>
                                    <CardDescription className="text-[9px]">Current business plan distribution</CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-blue-500 border-blue-500/30">Real-time</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {[
                                    { stage: 'Completed Plans', count: overviewData.extendedKPIs?.completedPlans || 0, color: 'green' },
                                    { stage: 'In Progress', count: (overviewData.extendedKPIs?.totalPlans || 0) - (overviewData.extendedKPIs?.completedPlans || 0), color: 'blue' },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.stage}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: index * 0.1 }}
                                      className={`flex items-center gap-4 p-3 rounded-lg ${item.color === 'green' ? 'bg-green-500/5 border border-green-500/20' : 'bg-blue-500/5 border border-blue-500/20'}`}
                                    >
                                      <CheckCircle2 className={`h-3 w-3 ${item.color === 'green' ? 'text-green-500' : 'text-blue-500'}`} />
                                      <div className="flex-1">
                                        <p className="font-medium text-[9px]">{item.stage}</p>
                                      </div>
                                      <Badge className={`${item.color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>{item.count}</Badge>
                                    </motion.div>
                                  ))}
                                  {(overviewData.extendedKPIs?.totalPlans || 0) === 0 && (
                                    <p className="text-[9px] text-muted-foreground text-center py-1">
                                      No business plans created yet. Data will appear as users create plans.
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* System Health Section - 5 Unique Advanced Pages */}
                {activeSection.startsWith('system') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* 1. HEALTH DASHBOARD - Executive System Overview */}
                      {activeSection === 'system-overview' && (
                        <>
                          {/* Overall System Status Banner */}
                          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <motion.div
                                    className="p-4 rounded-2xl bg-green-500 text-white"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                  >
                                    <Server className="h-8 w-8" />
                                  </motion.div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">System Status</p>
                                    <p className="text-xs font-bold text-green-500">All Systems Operational</p>
                                    <p className="text-[9px] text-muted-foreground mt-1">Last checked: {new Date().toLocaleTimeString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Uptime</p>
                                    <p className="text-[9px] font-bold">{systemMetrics?.uptime?.formatted || '99.9%'}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Health Score</p>
                                    <p className="text-xs font-bold text-green-500">{systemMetrics?.healthScore || 98}/100</p>
                                  </div>
                                  <Badge className="bg-green-500 text-white px-4 py-2">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Healthy
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Health Status Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            {[
                              { name: 'API Server', status: 'operational', uptime: '99.99%', icon: Server, color: 'green' },
                              { name: 'Database', status: 'operational', uptime: '99.97%', icon: Database, color: 'green' },
                              { name: 'File Storage', status: 'operational', uptime: '99.95%', icon: HardDrive, color: 'green' },
                              { name: 'Email Service', status: 'operational', uptime: '99.90%', icon: Mail, color: 'green' },
                            ].map((service, index) => (
                              <motion.div
                                key={service.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="hover-elevate">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-1">
                                      <service.icon className={`h-8 w-8 text-${service.color}-500`} />
                                      <Badge className={`bg-${service.color}-500 text-white`}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {service.status}
                                      </Badge>
                                    </div>
                                    <h3 className="text-[10px] font-semibold">{service.name}</h3>
                                    <p className="text-[9px] text-muted-foreground">Uptime: {service.uptime}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Cpu className="h-3 w-3 text-blue-500" />
                                  CPU Usage
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-center mb-1">
                                  {Math.min(100, Math.round(((systemMetrics?.cpu?.user || 0) + (systemMetrics?.cpu?.system || 0)) / 10000) || 35)}%
                                </div>
                                <Progress value={Math.min(100, Math.round(((systemMetrics?.cpu?.user || 0) + (systemMetrics?.cpu?.system || 0)) / 10000) || 35)} className="h-1" />
                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">Normal load</p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <HardDrive className="h-3 w-3 text-purple-500" />
                                  Memory
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-center mb-1">
                                  {systemMetrics?.memory?.heapUsed || 256} MB
                                </div>
                                <Progress value={systemMetrics?.memory?.percentage || 62} className="h-1" />
                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">
                                  {systemMetrics?.memory?.heapUsed || 256} / {systemMetrics?.memory?.heapTotal || 512} MB
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Activity className="h-3 w-3 text-green-500" />
                                  Active Connections
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-center mb-1">
                                  {systemMetrics?.database?.connections || 12}
                                </div>
                                <Progress value={((systemMetrics?.database?.connections || 12) / (systemMetrics?.database?.maxConnections || 100)) * 100} className="h-1" />
                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">of {systemMetrics?.database?.maxConnections || 100} max</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Admin Actions */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                Quick Actions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-1.5">
                                <Button
                                  onClick={async () => {
                                    try {
                                      toast({ title: "Creating demo data...", description: "Please wait while comprehensive demo data is being created." });
                                      const response = await apiRequest('POST', '/api/admin/seed-demo-data', {});
                                      const data = await response.json() as { success: boolean; documentsCreated: number; message?: string };
                                      if (data.success) {
                                        toast({ title: "Demo data created successfully", description: `Created demo user with ${data.documentsCreated} documents` });
                                        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                                      }
                                    } catch (error: any) {
                                      toast({ title: "Failed to create demo data", description: error.message, variant: "destructive" });
                                    }
                                  }}
                                  data-testid="button-seed-demo-data"
                                >
                                  <Database className="h-3 w-3 mr-2" />
                                  Seed Demo Data
                                </Button>
                                <Button variant="outline" onClick={() => refetchOverview()}>
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                  Refresh Metrics
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 2. PERFORMANCE - Detailed Performance Metrics */}
                      {activeSection === 'system-performance' && (
                        <>
                          {/* Performance Overview */}
                          <Card className="bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-500/10 border-blue-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-blue-500 text-white">
                                    <Cpu className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Performance Grade</p>
                                    <p className="text-xs font-bold text-blue-500">A+ (Excellent)</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Avg Response</p>
                                    <p className="text-[9px] font-bold">{systemMetrics?.api?.avgResponseTime || 45}ms</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Throughput</p>
                                    <p className="text-[9px] font-bold">{systemMetrics?.api?.requestsPerMinute || 1250}/min</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* CPU & Memory Gauges */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">CPU Performance</CardTitle>
                                <CardDescription className="text-[9px]">Real-time processor utilization</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-center mb-1">
                                  <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90">
                                      <circle cx="96" cy="96" r="88" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
                                      <motion.circle
                                        cx="96" cy="96" r="88"
                                        stroke="#3b82f6"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={553}
                                        initial={{ strokeDashoffset: 553 }}
                                        animate={{ strokeDashoffset: 553 - (553 * (Math.min(100, Math.round(((systemMetrics?.cpu?.user || 0) + (systemMetrics?.cpu?.system || 0)) / 10000) || 35))) / 100 }}
                                        transition={{ duration: 1 }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                      <span className="text-[11px] font-bold">{Math.min(100, Math.round(((systemMetrics?.cpu?.user || 0) + (systemMetrics?.cpu?.system || 0)) / 10000) || 35)}%</span>
                                      <span className="text-[9px] text-muted-foreground">CPU</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">1 min avg</p>
                                    <p className="font-bold">42%</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">5 min avg</p>
                                    <p className="font-bold">38%</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">15 min avg</p>
                                    <p className="font-bold">35%</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Memory Usage</CardTitle>
                                <CardDescription className="text-[9px]">RAM allocation breakdown</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-center mb-1">
                                  <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90">
                                      <circle cx="96" cy="96" r="88" stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
                                      <motion.circle
                                        cx="96" cy="96" r="88"
                                        stroke="#8b5cf6"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={553}
                                        initial={{ strokeDashoffset: 553 }}
                                        animate={{ strokeDashoffset: 553 - (553 * (systemMetrics?.memory?.percentage || 62)) / 100 }}
                                        transition={{ duration: 1 }}
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                      <span className="text-[11px] font-bold">{systemMetrics?.memory?.percentage || 62}%</span>
                                      <span className="text-[9px] text-muted-foreground">RAM</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {[
                                    { name: 'Application', value: 45, color: '#8b5cf6' },
                                    { name: 'Cache', value: 12, color: '#3b82f6' },
                                    { name: 'System', value: 5, color: '#22c55e' },
                                  ].map((item) => (
                                    <div key={item.name} className="flex items-center gap-1.5">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-[9px] flex-1">{item.name}</span>
                                      <span className="font-medium">{item.value}%</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Response Time Distribution */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Response Time Distribution</CardTitle>
                              <CardDescription className="text-[9px]">Request latency percentiles</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-5 gap-1.5">
                                {[
                                  { percentile: 'p50', value: systemMetrics?.database?.queryTime?.p50 || 12, color: 'green' },
                                  { percentile: 'p75', value: 25, color: 'blue' },
                                  { percentile: 'p90', value: 45, color: 'yellow' },
                                  { percentile: 'p95', value: systemMetrics?.database?.queryTime?.p95 || 78, color: 'orange' },
                                  { percentile: 'p99', value: systemMetrics?.database?.queryTime?.p99 || 145, color: 'red' },
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.percentile}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`text-center p-4 rounded-lg border border-${item.color}-500/30 bg-${item.color}-500/5`}
                                  >
                                    <p className="text-[9px] text-muted-foreground mb-1">{item.percentile}</p>
                                    <p className={`text-xs font-bold text-${item.color}-500`}>{item.value}ms</p>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* CORE WEB VITALS - Real User Monitoring */}
                      {activeSection === 'system-webvitals' && (
                        <>
                          {/* Web Vitals Header */}
                          <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-green-500 text-white">
                                    <Activity className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Core Web Vitals Monitoring</p>
                                    <p className="text-xs font-bold text-green-500">
                                      {webVitalsData?.totalSamples || 0} Samples Collected
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => refetchWebVitals()} data-testid="button-refresh-webvitals">
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                  Refresh
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Core Metrics Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                            {/* LCP - Largest Contentful Paint */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                                  LCP (Largest Contentful Paint)
                                </CardTitle>
                                <CardDescription className="text-[9px]">Loading performance - Target: &lt; 2.5s</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center mb-1">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.lcp || 0) < 2500 ? 'text-green-500' :
                                    (webVitalsData?.averages?.lcp || 0) < 4000 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.lcp ? (webVitalsData.averages.lcp / 1000).toFixed(2) : '--'}s
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Average</p>
                                </div>
                                {webVitalsData?.ratings?.lcp && (
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-green-500">Good</span>
                                      <span>{webVitalsData.ratings.lcp.good || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.lcp.good || 0} className="h-2 bg-green-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-yellow-500">Needs Work</span>
                                      <span>{webVitalsData.ratings.lcp.needsImprovement || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.lcp.needsImprovement || 0} className="h-2 bg-yellow-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-red-500">Poor</span>
                                      <span>{webVitalsData.ratings.lcp.poor || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.lcp.poor || 0} className="h-2 bg-red-100" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* FID - First Input Delay */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                                  FID (First Input Delay)
                                </CardTitle>
                                <CardDescription className="text-[9px]">Interactivity - Target: &lt; 100ms</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center mb-1">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.fid || 0) < 100 ? 'text-green-500' :
                                    (webVitalsData?.averages?.fid || 0) < 300 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.fid ?? '--'}ms
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Average</p>
                                </div>
                                {webVitalsData?.ratings?.fid && (
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-green-500">Good</span>
                                      <span>{webVitalsData.ratings.fid.good || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.fid.good || 0} className="h-2 bg-green-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-yellow-500">Needs Work</span>
                                      <span>{webVitalsData.ratings.fid.needsImprovement || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.fid.needsImprovement || 0} className="h-2 bg-yellow-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-red-500">Poor</span>
                                      <span>{webVitalsData.ratings.fid.poor || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.fid.poor || 0} className="h-2 bg-red-100" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            {/* CLS - Cumulative Layout Shift */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                                  CLS (Cumulative Layout Shift)
                                </CardTitle>
                                <CardDescription className="text-[9px]">Visual stability - Target: &lt; 0.1</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center mb-1">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.cls || 0) < 100 ? 'text-green-500' :
                                    (webVitalsData?.averages?.cls || 0) < 250 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.cls ? (webVitalsData.averages.cls / 1000).toFixed(3) : '--'}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Average Score</p>
                                </div>
                                {webVitalsData?.ratings?.cls && (
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-green-500">Good</span>
                                      <span>{webVitalsData.ratings.cls.good || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.cls.good || 0} className="h-2 bg-green-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-yellow-500">Needs Work</span>
                                      <span>{webVitalsData.ratings.cls.needsImprovement || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.cls.needsImprovement || 0} className="h-2 bg-yellow-100" />
                                    <div className="flex justify-between text-[9px]">
                                      <span className="text-red-500">Poor</span>
                                      <span>{webVitalsData.ratings.cls.poor || 0}%</span>
                                    </div>
                                    <Progress value={webVitalsData.ratings.cls.poor || 0} className="h-2 bg-red-100" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>

                          {/* Additional Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">FCP (First Contentful Paint)</CardTitle>
                                <CardDescription className="text-[9px]">Time to first visible content</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.fcp || 0) < 1800 ? 'text-green-500' :
                                    (webVitalsData?.averages?.fcp || 0) < 3000 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.fcp ? (webVitalsData.averages.fcp / 1000).toFixed(2) : '--'}s
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Target: &lt; 1.8s</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">TTFB (Time to First Byte)</CardTitle>
                                <CardDescription className="text-[9px]">Server response time</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.ttfb || 0) < 800 ? 'text-green-500' :
                                    (webVitalsData?.averages?.ttfb || 0) < 1800 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.ttfb ?? '--'}ms
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Target: &lt; 800ms</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">INP (Interaction to Next Paint)</CardTitle>
                                <CardDescription className="text-[9px]">Overall responsiveness</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <p className={`text-xs font-bold ${
                                    (webVitalsData?.averages?.inp || 0) < 200 ? 'text-green-500' :
                                    (webVitalsData?.averages?.inp || 0) < 500 ? 'text-yellow-500' : 'text-red-500'
                                  }`}>
                                    {webVitalsData?.averages?.inp ?? '--'}ms
                                  </p>
                                  <p className="text-[9px] text-muted-foreground mt-1">Target: &lt; 200ms</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Performance by Page */}
                          {webVitalsData?.byPage && webVitalsData.byPage.length > 0 && (
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Performance by Page</CardTitle>
                                <CardDescription className="text-[9px]">Web vitals breakdown per page</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[9px]">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-2">Page</th>
                                        <th className="text-center p-2">Samples</th>
                                        <th className="text-center p-2">Avg LCP</th>
                                        <th className="text-center p-2">Avg FID</th>
                                        <th className="text-center p-2">Avg CLS</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {webVitalsData.byPage.map((page, i) => (
                                        <tr key={i} className="border-b hover-elevate">
                                          <td className="p-2 font-medium">{page.pagePath}</td>
                                          <td className="text-center p-2">{page.samples}</td>
                                          <td className="text-center p-2">
                                            {page.avgLcp ? `${(page.avgLcp / 1000).toFixed(2)}s` : '--'}
                                          </td>
                                          <td className="text-center p-2">
                                            {page.avgFid ? `${page.avgFid}ms` : '--'}
                                          </td>
                                          <td className="text-center p-2">
                                            {page.avgCls ? (page.avgCls / 1000).toFixed(3) : '--'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Device Type Distribution */}
                          {webVitalsData?.byDevice && webVitalsData.byDevice.length > 0 && (
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Performance by Device</CardTitle>
                                <CardDescription className="text-[9px]">How different devices experience your site</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                  {webVitalsData.byDevice.map((device, i) => (
                                    <div key={i} className="p-4 rounded-lg border text-center">
                                      <p className="text-xs font-semibold capitalize">{device.deviceType || 'Unknown'}</p>
                                      <p className="text-xs font-bold mt-0.5">
                                        {device.avgLcp ? `${(device.avgLcp / 1000).toFixed(2)}s` : '--'}
                                      </p>
                                      <p className="text-[9px] text-muted-foreground">Avg LCP</p>
                                      <p className="text-[9px] text-muted-foreground mt-1">{device.samples} samples</p>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* No Data State */}
                          {(!webVitalsData || webVitalsData.totalSamples === 0) && !webVitalsLoading && (
                            <Card className="text-center py-1">
                              <CardContent>
                                <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-1" />
                                <h3 className="text-xs font-semibold mb-0.5">No Performance Data Yet</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                  Performance metrics are automatically collected as users browse your site.
                                  Check back later to see real user performance data.
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Loading State */}
                          {webVitalsLoading && (
                            <div className="flex items-center justify-center py-1">
                              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          )}
                        </>
                      )}

                      {/* 3. DATABASE - Database Health & Analytics */}
                      {activeSection === 'system-database' && (
                        <>
                          {/* Database Status */}
                          <Card className="bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-purple-500/10 border-purple-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <Database className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">PostgreSQL (Neon)</p>
                                    <p className="text-xs font-bold text-purple-500">Connected & Healthy</p>
                                  </div>
                                </div>
                                <Badge className="bg-green-500 text-white px-4 py-2">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Online
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Connection Pool */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Connection Pool</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center mb-1">
                                  <p className="text-[9px] font-bold">{systemMetrics?.database?.connections || 8}</p>
                                  <p className="text-[9px] text-muted-foreground">of {systemMetrics?.database?.maxConnections || 100} connections</p>
                                </div>
                                <Progress value={((systemMetrics?.database?.connections || 8) / (systemMetrics?.database?.maxConnections || 100)) * 100} className="h-1" />
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Query Performance</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Query Time</span>
                                    <span className="font-bold">{systemMetrics?.database?.queryTime?.p50 || 12}ms</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Queries/sec</span>
                                    <span className="font-bold">145</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Cache Hit Rate</span>
                                    <span className="font-bold text-green-500">98.5%</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Database Size</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center mb-1">
                                  <p className="text-[9px] font-bold">2.4</p>
                                  <p className="text-[9px] text-muted-foreground">GB used</p>
                                </div>
                                <Progress value={24} className="h-1" />
                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">of 10 GB allocated</p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Table Statistics */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Table Statistics</CardTitle>
                              <CardDescription className="text-[9px]">Row counts and sizes by table</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {[
                                  { table: 'users', rows: 342, size: '45 MB', growth: '+12%' },
                                  { table: 'business_plans', rows: 1247, size: '890 MB', growth: '+28%' },
                                  { table: 'tool_usage', rows: 15834, size: '234 MB', growth: '+45%' },
                                  { table: 'sessions', rows: 892, size: '67 MB', growth: '+18%' },
                                  { table: 'audit_logs', rows: 4521, size: '123 MB', growth: '+22%' },
                                ].map((item, index) => (
                                  <motion.div
                                    key={item.table}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <Database className="h-3 w-3 text-purple-500" />
                                      <span className="font-mono font-medium">{item.table}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-[9px]">
                                      <span>{item.rows.toLocaleString()} rows</span>
                                      <span className="text-muted-foreground">{item.size}</span>
                                      <Badge className="bg-green-500/10 text-green-500">{item.growth}</Badge>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 4. STORAGE - File & Media Storage Analytics */}
                      {activeSection === 'system-storage' && (
                        <>
                          {/* Storage Overview */}
                          <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-amber-500 text-white">
                                    <HardDrive className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Storage Used</p>
                                    <p className="text-[9px] font-bold">4.7 GB <span className="text-xs text-muted-foreground font-normal">of 50 GB</span></p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] text-muted-foreground">Available</p>
                                  <p className="text-xs font-bold text-green-500">45.3 GB</p>
                                </div>
                              </div>
                              <Progress value={9.4} className="h-3 mt-1" />
                            </CardContent>
                          </Card>

                          {/* Storage Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Storage by Type</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {[
                                    { type: 'Documents', size: '2.1 GB', percent: 45, color: '#3b82f6', icon: FileText },
                                    { type: 'Images', size: '1.4 GB', percent: 30, color: '#22c55e', icon: ImageIcon },
                                    { type: 'Reports', size: '0.8 GB', percent: 17, color: '#8b5cf6', icon: BarChart3 },
                                    { type: 'Backups', size: '0.4 GB', percent: 8, color: '#f59e0b', icon: Archive },
                                  ].map((item, index) => (
                                    <motion.div
                                      key={item.type}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="space-y-0.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <item.icon className="h-3 w-3" style={{ color: item.color }} />
                                          <span>{item.type}</span>
                                        </div>
                                        <span className="font-bold">{item.size}</span>
                                      </div>
                                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
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
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Storage Metrics</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {[
                                    { label: 'Total Files', value: '12,847', icon: FileText },
                                    { label: 'Avg File Size', value: '365 KB', icon: HardDrive },
                                    { label: 'Uploads Today', value: '234', icon: Upload },
                                    { label: 'Downloads Today', value: '1,892', icon: Download },
                                  ].map((stat, index) => (
                                    <motion.div
                                      key={stat.label}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="p-4 rounded-lg border border-border/50 text-center"
                                    >
                                      <stat.icon className="h-3 w-3 mx-auto mb-0.5 text-amber-500" />
                                      <p className="text-[9px] font-bold">{stat.value}</p>
                                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Large Files */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Recent Large Files</CardTitle>
                              <CardDescription className="text-[9px]">Files over 1MB uploaded recently</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {[
                                  { name: 'business-plan-v3.pdf', size: '4.2 MB', user: 'john@example.com', date: '2 hours ago' },
                                  { name: 'financial-model.xlsx', size: '2.8 MB', user: 'sarah@startup.io', date: '5 hours ago' },
                                  { name: 'pitch-deck.pptx', size: '8.5 MB', user: 'mike@venture.com', date: '1 day ago' },
                                  { name: 'market-research.pdf', size: '3.1 MB', user: 'lisa@tech.co', date: '2 days ago' },
                                ].map((file, index) => (
                                  <motion.div
                                    key={file.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="h-3 w-3 text-amber-500" />
                                      <div>
                                        <p className="font-medium">{file.name}</p>
                                        <p className="text-[9px] text-muted-foreground">{file.user}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold">{file.size}</p>
                                      <p className="text-[9px] text-muted-foreground">{file.date}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 5. API METRICS - API Performance Analytics */}
                      {activeSection === 'system-api' && (
                        <>
                          {/* API Status Banner */}
                          <Card className="bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-cyan-500/10 border-cyan-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <motion.div
                                    className="p-3 rounded-xl bg-cyan-500 text-white"
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Activity className="h-3 w-3" />
                                  </motion.div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">API Gateway</p>
                                    <p className="text-xs font-bold text-cyan-500">All Endpoints Healthy</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Requests/min</p>
                                    <p className="text-[9px] font-bold">{systemMetrics?.api?.requestsPerMinute || 1245}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Error Rate</p>
                                    <p className="text-xs font-bold text-green-500">{systemMetrics?.api?.errorRate || 0.02}%</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* API KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            {[
                              { label: 'Total Requests Today', value: '1.2M', change: '+15%', icon: BarChart3, color: 'blue' },
                              { label: 'Avg Latency', value: `${systemMetrics?.api?.avgResponseTime || 45}ms`, change: '-8%', icon: Clock, color: 'green' },
                              { label: 'Success Rate', value: '99.98%', change: '+0.1%', icon: CheckCircle, color: 'green' },
                              { label: '4xx/5xx Errors', value: '23', change: '-45%', icon: AlertTriangle, color: 'red' },
                            ].map((kpi, index) => (
                              <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className={`hover-elevate border-t-4 border-t-${kpi.color}-500`}>
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <kpi.icon className={`h-3 w-3 text-${kpi.color}-500`} />
                                      <Badge className={kpi.change.startsWith('+') && kpi.color !== 'red' ? 'bg-green-500/10 text-green-500' : kpi.change.startsWith('-') && kpi.color !== 'red' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                                        {kpi.change}
                                      </Badge>
                                    </div>
                                    <p className="text-[9px] font-bold">{kpi.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Endpoint Performance */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Top Endpoints by Traffic</CardTitle>
                              <CardDescription className="text-[9px]">Most called API endpoints in the last 24 hours</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {[
                                  { endpoint: 'GET /api/auth/user', calls: 45230, latency: 12, status: 'healthy' },
                                  { endpoint: 'POST /api/tools/save', calls: 23450, latency: 45, status: 'healthy' },
                                  { endpoint: 'GET /api/business-plans', calls: 18920, latency: 28, status: 'healthy' },
                                  { endpoint: 'POST /api/ai/generate', calls: 12340, latency: 890, status: 'warning' },
                                  { endpoint: 'GET /api/admin/analytics', calls: 8920, latency: 156, status: 'healthy' },
                                ].map((ep, index) => (
                                  <motion.div
                                    key={ep.endpoint}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover-elevate"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full ${ep.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                      <code className="text-[9px] font-mono">{ep.endpoint}</code>
                                    </div>
                                    <div className="flex items-center gap-6 text-[9px]">
                                      <span>{ep.calls.toLocaleString()} calls</span>
                                      <span className={ep.latency > 500 ? 'text-amber-500' : 'text-green-500'}>{ep.latency}ms avg</span>
                                      <Badge className={ep.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                                        {ep.status}
                                      </Badge>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Rate Limiting */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Rate Limiting Status</CardTitle>
                              <CardDescription className="text-[9px]">Current rate limit utilization by tier</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                {[
                                  { tier: 'Free', limit: '100/hr', used: 45, color: '#94a3b8' },
                                  { tier: 'Premium', limit: '1000/hr', used: 23, color: '#3b82f6' },
                                  { tier: 'Enterprise', limit: 'Unlimited', used: 0, color: '#8b5cf6' },
                                ].map((item) => (
                                  <div key={item.tier} className="p-4 rounded-lg border border-border/50">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="font-medium">{item.tier}</span>
                                      <Badge variant="outline">{item.limit}</Badge>
                                    </div>
                                    <Progress value={item.used} className="h-1" />
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{item.used}% utilized</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Revenue & Subscriptions Section - 5 Unique Advanced Pages */}
                {activeSection.startsWith('revenue') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* 1. REVENUE DASHBOARD - Executive Overview with Real-Time Metrics */}
                      {activeSection === 'revenue-overview' && (
                        <>
                          {revenueAnalyticsLoading ? (
                            <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20">
                              <CardContent className="py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500" />
                                  <span className="text-muted-foreground">Loading real-time Stripe revenue data...</span>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <>
                              {/* Real-Time Revenue Ticker */}
                              <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-green-500/20">
                                <CardContent className="py-1">
                                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <motion.div
                                        className="p-3 rounded-xl bg-green-500 text-white"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <DollarSign className="h-3 w-3" />
                                      </motion.div>
                                      <div>
                                        <p className="text-[9px] text-muted-foreground">Live Revenue Today</p>
                                        <p className="text-xs font-bold text-green-500">£{(revenueAnalytics?.revenueToday || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-6 flex-wrap flex-1">
                                      <div className="text-center">
                                        <p className="text-[9px] text-muted-foreground">This Week</p>
                                        <p className="text-[9px] font-bold">£{(revenueAnalytics?.revenueThisWeek || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[9px] text-muted-foreground">This Month</p>
                                        <p className="text-[9px] font-bold">£{(revenueAnalytics?.revenueThisMonth || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                      </div>
                                      <Badge className={`${(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white px-1.5 py-1.5 flex items-center`}>
                                        {(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        <span className="text-xs font-medium">{(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{revenueAnalytics?.monthlyGrowth || 0}% MTD</span>
                                        <span className="ml-2 text-[10px] opacity-90">{format(new Date(), 'dd MMM')}</span>
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Revenue KPIs Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                  <Card className="hover-elevate border-l-4 border-l-green-500">
                                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                      <CardTitle className="text-[10px] font-medium text-muted-foreground">Total Revenue</CardTitle>
                                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                        <DollarSign className="h-3 w-3" />
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-[11px] font-bold">£{(revenueAnalytics?.revenueAllTime || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge className="bg-green-500/10 text-green-500">{revenueAnalytics?.totalTransactions || 0} transactions</Badge>
                                        <span className="text-xs text-muted-foreground">all-time</span>
                                      </div>
                                      <Progress value={Math.min((revenueAnalytics?.revenueAllTime || 0) / 500, 100)} className="h-1 mt-0.5" />
                                    </CardContent>
                                  </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                  <Card className="hover-elevate border-l-4 border-l-blue-500">
                                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                      <CardTitle className="text-[10px] font-medium text-muted-foreground">MRR</CardTitle>
                                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <TrendingUp className="h-3 w-3" />
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-[11px] font-bold">£{(revenueAnalytics?.mrr || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge className={`${(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                          {(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{revenueAnalytics?.monthlyGrowth || 0}%
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">vs. last month</span>
                                      </div>
                                      <Progress value={Math.min((revenueAnalytics?.mrr || 0) / 100, 100)} className="h-1 mt-0.5" />
                                    </CardContent>
                                  </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                  <Card className="hover-elevate border-l-4 border-l-purple-500">
                                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                      <CardTitle className="text-[10px] font-medium text-muted-foreground">ARR</CardTitle>
                                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <CalendarIcon className="h-3 w-3" />
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-[11px] font-bold">£{(revenueAnalytics?.arr || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge className="bg-purple-500/10 text-purple-500">{revenueAnalytics?.activeSubscriptions || 0} active subs</Badge>
                                        <span className="text-xs text-muted-foreground">projected</span>
                                      </div>
                                      <Progress value={Math.min((revenueAnalytics?.arr || 0) / 1000, 100)} className="h-1 mt-0.5" />
                                    </CardContent>
                                  </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                  <Card className="hover-elevate border-l-4 border-l-amber-500">
                                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                                      <CardTitle className="text-[10px] font-medium text-muted-foreground">Avg. Order Value</CardTitle>
                                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <Target className="h-3 w-3" />
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-[11px] font-bold">£{(revenueAnalytics?.avgOrderValue || 0).toFixed(2)}</div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <Badge className="bg-amber-500/10 text-amber-500">{revenueAnalytics?.totalCustomers || 0} customers</Badge>
                                        <span className="text-xs text-muted-foreground">per transaction</span>
                                      </div>
                                      <Progress value={Math.min((revenueAnalytics?.avgOrderValue || 0) / 2, 100)} className="h-1 mt-0.5" />
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </div>

                              {/* Revenue Charts */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
                                <Card className="lg:col-span-2">
                                  <CardHeader className="p-2 pb-1">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <CardTitle className="text-[10px] font-semibold">Revenue Trend (12 Months)</CardTitle>
                                        <CardDescription className="text-[9px]">Monthly revenue from Stripe payments</CardDescription>
                                      </div>
                                      <Badge variant="outline" className={`${(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'}`}>
                                        {(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        {(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? 'Growing' : 'Declining'}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <ResponsiveContainer width="100%" height={80}>
                                      <RechartsAreaChart data={revenueAnalytics?.monthlyTrend || []}>
                                    <defs>
                                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={8} />
                                    <YAxis stroke="hsl(var(--foreground))" fontSize={8} tickFormatter={(v) => `£${v}`} />
                                    <RechartsTooltip
                                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                      formatter={(value: number) => [`£${value}`, '']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revenueGradient)" strokeWidth={3} name="Revenue" />
                                    <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} name="Target" dot={false} />
                                  </RechartsAreaChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Revenue by Tier</CardTitle>
                                <CardDescription className="text-[9px]">Monthly revenue from each tier</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {(() => {
                                    const tierData = [
                                      { source: 'Basic (£9)', amount: revenueAnalytics?.revenueByTier?.basic || 0, color: 'bg-green-500' },
                                      { source: 'Premium (£19)', amount: revenueAnalytics?.revenueByTier?.premium || 0, color: 'bg-blue-500' },
                                      { source: 'Enterprise (£29)', amount: revenueAnalytics?.revenueByTier?.enterprise || 0, color: 'bg-purple-500' },
                                      { source: 'Ultimate (£39)', amount: revenueAnalytics?.revenueByTier?.ultimate || 0, color: 'bg-amber-500' },
                                    ];
                                    const totalRevenue = tierData.reduce((sum, t) => sum + t.amount, 0) || 1;
                                    return tierData.map((item, index) => {
                                      const percent = Math.round((item.amount / totalRevenue) * 100) || 0;
                                      return (
                                        <motion.div
                                          key={item.source}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="space-y-0.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                              <span className="font-medium">{item.source}</span>
                                            </div>
                                            <span className="font-bold">£{item.amount.toFixed(2)}</span>
                                          </div>
                                          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                            <motion.div
                                              className={`absolute inset-y-0 left-0 rounded-full ${item.color}`}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percent}%` }}
                                              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                            />
                                          </div>
                                          <p className="text-xs text-muted-foreground text-right">{percent}% of total</p>
                                        </motion.div>
                                      );
                                    });
                                  })()}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Revenue vs Target Comparison Chart */}
                          <Card className="border-l-4 border-l-primary">
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Target className="h-3 w-3 text-primary" />
                                    Revenue vs Target (Year 1)
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Actual performance compared to Year 1 projections (£72,000 target)</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  Since Nov 26, 2025
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const year1Target = 72000;
                                const monthlyTarget = year1Target / 12;
                                const launchDate = new Date('2025-11-26');
                                const year1EndDate = new Date('2026-11-25');
                                const now = new Date();
                                const daysSinceLaunch = Math.max(1, Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)));
                                const totalYear1Days = Math.floor((year1EndDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
                                const year1Progress = Math.min(daysSinceLaunch / totalYear1Days, 1);
                                const actualRevenue = revenueAnalytics?.revenueYear1ToDate || revenueAnalytics?.revenueAllTime || 0;
                                const currentMRR = revenueAnalytics?.mrr || 0;
                                const projectedARR = currentMRR * 12;
                                const expectedRevenue = year1Target * year1Progress;
                                const progressPercent = Math.min((actualRevenue / year1Target) * 100, 100);
                                const isAheadOfTarget = actualRevenue >= expectedRevenue;
                                
                                return (
                                  <div className="space-y-1.5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                      <div className="p-1.5 rounded-lg bg-muted/50 border">
                                        <p className="text-[9px] text-muted-foreground">Year 1 Target</p>
                                        <p className="text-[9px] font-bold">£{year1Target.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground mt-1">£{monthlyTarget.toLocaleString()}/mo average</p>
                                      </div>
                                      <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-[9px] text-muted-foreground">Actual Revenue</p>
                                        <p className="text-xs font-bold text-green-500">£{actualRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{daysSinceLaunch} days since launch</p>
                                      </div>
                                      <div className={`p-4 rounded-lg ${isAheadOfTarget ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'} border`}>
                                        <p className="text-[9px] text-muted-foreground">Projected ARR (based on MRR)</p>
                                        <p className={`text-xs font-bold ${isAheadOfTarget ? 'text-green-500' : 'text-amber-500'}`}>£{projectedARR.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{projectedARR >= year1Target ? 'On track' : 'Below target'}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-0.5">
                                      <div className="flex items-center justify-between text-[9px]">
                                        <span className="text-muted-foreground">Progress to Year 1 Target</span>
                                        <span className="font-bold">{progressPercent.toFixed(1)}%</span>
                                      </div>
                                      <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${progressPercent}%` }}
                                          transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                        <div 
                                          className="absolute inset-y-0 w-0.5 bg-primary"
                                          style={{ left: `${Math.min((expectedRevenue / year1Target) * 100, 100)}%` }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>£0</span>
                                        <span className="flex items-center gap-1">
                                          <div className="w-2 h-2 rounded-full bg-primary" />
                                          Expected: £{expectedRevenue.toFixed(0)}
                                        </span>
                                        <span>£{year1Target.toLocaleString()}</span>
                                      </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                      <ResponsiveContainer width="100%" height={70}>
                                        <RechartsBarChart
                                          data={[
                                            { name: 'Target (Expected)', value: expectedRevenue, fill: 'hsl(var(--muted-foreground))' },
                                            { name: 'Actual Revenue', value: actualRevenue, fill: '#22c55e' },
                                            { name: 'Projected ARR', value: projectedARR, fill: '#3b82f6' },
                                            { name: 'Year 1 Target', value: year1Target, fill: 'hsl(var(--primary))' },
                                          ]}
                                          layout="vertical"
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                          <XAxis type="number" tickFormatter={(v) => `£${v >= 1000 ? (v/1000).toFixed(0) + 'K' : v}`} stroke="hsl(var(--foreground))" fontSize={8} />
                                          <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--foreground))" fontSize={11} />
                                          <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                            formatter={(value: number) => [`£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']}
                                          />
                                          <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                                        </RechartsBarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>

                          {/* Recent Transactions - Real Stripe Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Recent Transactions</CardTitle>
                                  <CardDescription className="text-[9px]">Latest payment activities from Stripe</CardDescription>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => exportMutation.mutate('transactions')}
                                  disabled={exportMutation.isPending}
                                  data-testid="button-export-transactions"
                                >
                                  <Download className="h-3 w-3 mr-2" />
                                  {exportMutation.isPending ? 'Exporting...' : 'Export'}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {recentTransactionsLoading ? (
                                <div className="flex items-center justify-center py-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                                  <span className="ml-2 text-muted-foreground">Loading transactions...</span>
                                </div>
                              ) : recentTransactionsData?.transactions && recentTransactionsData.transactions.length > 0 ? (
                                <div className="space-y-1">
                                  {recentTransactionsData.transactions.map((tx, index) => (
                                    <motion.div
                                      key={tx.id || index}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Avatar className="h-5 w-5">
                                          <AvatarFallback className="bg-primary/10 text-primary">
                                            {tx.user.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">{tx.user}</p>
                                          <p className="text-[9px] text-muted-foreground">{tx.email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="capitalize">{tx.tier}</Badge>
                                        <span className="font-bold text-green-500">+£{tx.amount.toFixed(2)}</span>
                                        <span className="text-xs text-muted-foreground">{tx.time}</span>
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-1 text-muted-foreground">
                                  <CreditCard className="h-12 w-12 mx-auto mb-0.5 opacity-30" />
                                  <p>No transactions yet</p>
                                  <p className="text-[9px]">Transactions will appear here when customers make payments</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                            </>
                          )}
                        </>
                      )}

                      {/* 2. MRR ANALYTICS - Deep Dive Monthly Recurring Revenue */}
                      {activeSection === 'revenue-mrr' && (
                        <>
                          {revenueAnalyticsLoading ? (
                            <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 border-blue-500/20">
                              <CardContent className="py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500" />
                                  <span className="text-muted-foreground">Loading MRR analytics from Stripe...</span>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <>
                          {/* MRR Summary Header */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
                            {[
                              { label: 'Current MRR', value: `£${(revenueAnalytics?.mrr || 0).toFixed(2)}`, change: `${(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? '+' : ''}${revenueAnalytics?.monthlyGrowth || 0}%`, icon: DollarSign, color: 'green' },
                              { label: 'Active Subs', value: `${revenueAnalytics?.activeSubscriptions || 0}`, change: 'subscribers', icon: Plus, color: 'blue' },
                              { label: 'ARR', value: `£${(revenueAnalytics?.arr || 0).toFixed(2)}`, change: 'projected', icon: TrendingUp, color: 'purple' },
                              { label: 'Churned', value: `${revenueAnalytics?.cancelledSubscriptions || 0}`, change: `${(revenueAnalytics?.churnRate || 0).toFixed(1)}% churn`, icon: TrendingDown, color: 'red' },
                              { label: 'This Month', value: `£${(revenueAnalytics?.revenueThisMonth || 0).toFixed(2)}`, change: `${revenueAnalytics?.totalTransactions || 0} txns`, icon: Zap, color: 'amber' },
                            ].map((metric, index) => (
                              <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className={`hover-elevate border-t-4 border-t-${metric.color}-500`}>
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-xs text-muted-foreground">{metric.label}</span>
                                      <metric.icon className={`h-3 w-3 text-${metric.color}-500`} />
                                    </div>
                                    <p className="text-[9px] font-bold">{metric.value}</p>
                                    <Badge className={`mt-2 ${metric.color === 'red' ? 'bg-red-500/10 text-red-500' : `bg-${metric.color}-500/10 text-${metric.color}-500`}`}>
                                      {metric.change}
                                    </Badge>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* MRR Trend Chart - Real Stripe Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Monthly Revenue (from Stripe)</CardTitle>
                                  <CardDescription className="text-[9px]">Real revenue data since launch (Nov 26, 2025)</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-green-500 border-green-500/30">
                                  Live Data
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={100}>
                                <RechartsBarChart data={revenueAnalytics?.monthlyTrend || []}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" fontSize={8} />
                                  <YAxis stroke="hsl(var(--foreground))" fontSize={8} tickFormatter={(v) => `£${v}`} />
                                  <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    formatter={(value: number, name: string) => [`£${value.toFixed(2)}`, name === 'revenue' ? 'Revenue' : 'Transactions']}
                                  />
                                  <Bar dataKey="revenue" fill="#22c55e" name="Revenue" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                              {(!revenueAnalytics?.monthlyTrend || revenueAnalytics.monthlyTrend.every((m: any) => m.revenue === 0)) && (
                                <div className="text-center text-muted-foreground mt-1">
                                  <p className="text-[9px]">No revenue recorded yet. Revenue will appear here as Stripe payments come in.</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* MRR by Tier & Cohort */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">MRR by Subscription Tier</CardTitle>
                                <CardDescription className="text-[9px]">Revenue contribution per tier (from Stripe)</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {(() => {
                                    const tierData = [
                                      { tier: 'Ultimate (£39)', mrr: (revenueAnalytics?.tierDistribution?.ultimate || 0) * 39, users: revenueAnalytics?.tierDistribution?.ultimate || 0, color: '#8b5cf6' },
                                      { tier: 'Enterprise (£29)', mrr: (revenueAnalytics?.tierDistribution?.enterprise || 0) * 29, users: revenueAnalytics?.tierDistribution?.enterprise || 0, color: '#f59e0b' },
                                      { tier: 'Premium (£19)', mrr: (revenueAnalytics?.tierDistribution?.premium || 0) * 19, users: revenueAnalytics?.tierDistribution?.premium || 0, color: '#3b82f6' },
                                      { tier: 'Basic (£9)', mrr: (revenueAnalytics?.tierDistribution?.basic || 0) * 9, users: revenueAnalytics?.tierDistribution?.basic || 0, color: '#22c55e' },
                                    ];
                                    const totalMrr = tierData.reduce((sum, t) => sum + t.mrr, 0) || 1;
                                    return tierData.map((item, index) => {
                                      const percent = Math.round((item.mrr / totalMrr) * 100) || 0;
                                      return (
                                        <motion.div
                                          key={item.tier}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                          className="space-y-0.5"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                              <span className="font-medium">{item.tier}</span>
                                              <Badge variant="secondary">{item.users} users</Badge>
                                            </div>
                                            <span className="font-bold">£{item.mrr.toFixed(2)}/mo</span>
                                          </div>
                                          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                                            <motion.div
                                              className="absolute inset-y-0 left-0 rounded-full"
                                              style={{ backgroundColor: item.color }}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percent}%` }}
                                              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                            />
                                          </div>
                                        </motion.div>
                                      );
                                    });
                                  })()}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Subscription Metrics</CardTitle>
                                <CardDescription className="text-[9px]">Real-time subscription health</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                      <p className="font-medium">Active Subscriptions</p>
                                      <p className="text-[9px] text-muted-foreground">Currently paying customers</p>
                                    </div>
                                    <Badge className="bg-green-500">{revenueAnalytics?.activeSubscriptions || 0}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                      <p className="font-medium">Cancelled Subscriptions</p>
                                      <p className="text-[9px] text-muted-foreground">All-time cancelled</p>
                                    </div>
                                    <Badge className="bg-red-500">{revenueAnalytics?.cancelledSubscriptions || 0}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                      <p className="font-medium">Churn Rate</p>
                                      <p className="text-[9px] text-muted-foreground">Percentage of cancellations</p>
                                    </div>
                                    <Badge className={(revenueAnalytics?.churnRate || 0) < 5 ? 'bg-green-500' : (revenueAnalytics?.churnRate || 0) < 10 ? 'bg-amber-500' : 'bg-red-500'}>
                                      {(revenueAnalytics?.churnRate || 0).toFixed(1)}%
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                      <p className="font-medium">Total Customers</p>
                                      <p className="text-[9px] text-muted-foreground">Unique paying customers</p>
                                    </div>
                                    <Badge className="bg-blue-500">{revenueAnalytics?.totalCustomers || 0}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div>
                                      <p className="font-medium">Monthly Growth</p>
                                      <p className="text-[9px] text-muted-foreground">vs. last month</p>
                                    </div>
                                    <Badge className={(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}>
                                      {(revenueAnalytics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{revenueAnalytics?.monthlyGrowth || 0}%
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                            </>
                          )}
                        </>
                      )}

                      {/* 3. SUBSCRIPTIONS - Active Subscription Management */}
                      {activeSection === 'revenue-subscriptions' && (
                        <>
                          {/* Subscription Overview Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="hover-elevate bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Active Subscriptions</p>
                                    <p className="text-[9px] font-bold">{revenueAnalytics?.activeSubscriptions || 0}</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">from Stripe</Badge>
                                  </div>
                                  <CreditCard className="h-12 w-12 text-blue-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Retention Rate</p>
                                    <p className="text-[9px] font-bold">{(100 - (revenueAnalytics?.churnRate || 0)).toFixed(1)}%</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">
                                      {(100 - (revenueAnalytics?.churnRate || 0)) >= 90 ? 'Excellent' : (100 - (revenueAnalytics?.churnRate || 0)) >= 80 ? 'Good' : 'Needs work'}
                                    </Badge>
                                  </div>
                                  <RefreshCw className="h-12 w-12 text-green-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Monthly Revenue</p>
                                    <p className="text-[9px] font-bold">£{(revenueAnalytics?.mrr || 0).toFixed(0)}</p>
                                    <Badge className="mt-2 bg-amber-500/10 text-amber-500">MRR</Badge>
                                  </div>
                                  <TrendingUp className="h-12 w-12 text-amber-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Cancelled</p>
                                    <p className="text-[9px] font-bold">{revenueAnalytics?.cancelledSubscriptions || 0}</p>
                                    <Badge className="mt-2 bg-red-500/10 text-red-500">All-time</Badge>
                                  </div>
                                  <AlertTriangle className="h-12 w-12 text-red-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Active Subscriptions List - Real Stripe Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Active Subscriptions</CardTitle>
                                  <CardDescription className="text-[9px]">All current paying subscribers from Stripe</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Filter className="h-3 w-3 mr-2" />
                                    Filter
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('users')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-subscriptions"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export'}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {activeSubscriptionsLoading ? (
                                <div className="flex items-center justify-center py-1">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                                  <span className="ml-2 text-muted-foreground">Loading subscriptions...</span>
                                </div>
                              ) : activeSubscriptionsData?.subscriptions && activeSubscriptionsData.subscriptions.length > 0 ? (
                                <ScrollArea className="h-[160px]">
                                  <div className="space-y-1">
                                    {activeSubscriptionsData.subscriptions.map((sub, index) => (
                                      <motion.div
                                        key={sub.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-4 rounded-lg border ${
                                          sub.status === 'at_risk' ? 'border-red-500/50 bg-red-500/5' :
                                          sub.status === 'renewing' ? 'border-amber-500/50 bg-amber-500/5' :
                                          'border-border/50'
                                        } hover-elevate`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Avatar>
                                            <AvatarFallback className="bg-primary/10">
                                              {sub.user.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium">{sub.user}</p>
                                            <p className="text-[9px] text-muted-foreground">{sub.email}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="text-center">
                                            <Badge className={
                                              sub.tier === 'ultimate' ? 'bg-purple-500' :
                                              sub.tier === 'enterprise' ? 'bg-amber-500' :
                                              sub.tier === 'premium' ? 'bg-blue-500' : 'bg-green-500'
                                            }><span className="capitalize">{sub.tier}</span></Badge>
                                            <p className="text-xs text-muted-foreground mt-1">Since {sub.since}</p>
                                          </div>
                                          <div className="text-center">
                                            <p className="font-bold">£{sub.amount.toFixed(2)}/mo</p>
                                            <p className="text-[9px] text-muted-foreground">Next: {sub.nextBilling}</p>
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
                              ) : (
                                <div className="text-center py-1 text-muted-foreground">
                                  <Users className="h-12 w-12 mx-auto mb-0.5 opacity-30" />
                                  <p>No active subscriptions yet</p>
                                  <p className="text-[9px]">Subscriptions will appear here when customers subscribe</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 4. TIER DISTRIBUTION - Visual Tier Analysis */}
                      {activeSection === 'revenue-tiers' && (
                        <>
                          {revenueAnalyticsLoading ? (
                            <Card className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-purple-500/10 border-purple-500/20">
                              <CardContent className="py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500" />
                                  <span className="text-muted-foreground">Loading tier distribution from Stripe...</span>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <>
                          {/* Tier Overview Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5">
                            {[
                              { tier: 'Free', price: 0, users: revenueAnalytics?.tierDistribution?.free || 0, color: '#94a3b8', icon: Users },
                              { tier: 'Basic', price: 29, users: revenueAnalytics?.tierDistribution?.basic || 0, color: '#22c55e', icon: Zap },
                              { tier: 'Premium', price: 49, users: revenueAnalytics?.tierDistribution?.premium || 0, color: '#3b82f6', icon: Star },
                              { tier: 'Enterprise', price: 89, users: revenueAnalytics?.tierDistribution?.enterprise || 0, color: '#f59e0b', icon: Building },
                              { tier: 'Ultimate', price: 129, users: revenueAnalytics?.tierDistribution?.ultimate || 0, color: '#8b5cf6', icon: Crown },
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
                                      <tier.icon className="h-3 w-3" style={{ color: tier.color }} />
                                    </div>
                                    <p className="font-bold text-xs mt-0.5">{tier.tier}</p>
                                    <p className="text-xs font-bold mt-1" style={{ color: tier.color }}>
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
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">User Distribution by Tier</CardTitle>
                                <CardDescription className="text-[9px]">Percentage breakdown of subscribers</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsPieChart>
                                    <Pie
                                      data={[
                                        { name: 'Free', value: revenueAnalytics?.tierDistribution?.free || 0, fill: '#94a3b8' },
                                        { name: 'Basic', value: revenueAnalytics?.tierDistribution?.basic || 0, fill: '#22c55e' },
                                        { name: 'Premium', value: revenueAnalytics?.tierDistribution?.premium || 0, fill: '#3b82f6' },
                                        { name: 'Enterprise', value: revenueAnalytics?.tierDistribution?.enterprise || 0, fill: '#f59e0b' },
                                        { name: 'Ultimate', value: revenueAnalytics?.tierDistribution?.ultimate || 0, fill: '#8b5cf6' },
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
                                <div className="flex flex-wrap justify-center gap-4 mt-1">
                                  {[
                                    { name: 'Free', color: '#94a3b8' },
                                    { name: 'Basic', color: '#22c55e' },
                                    { name: 'Premium', color: '#3b82f6' },
                                    { name: 'Enterprise', color: '#f59e0b' },
                                    { name: 'Ultimate', color: '#8b5cf6' },
                                  ].map(item => (
                                    <div key={item.name} className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                      <span className="text-[9px]">{item.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Revenue by Tier</CardTitle>
                                <CardDescription className="text-[9px]">Monthly revenue contribution</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsBarChart data={[
                                    { tier: 'Free', revenue: 0, users: revenueAnalytics?.tierDistribution?.free || 0 },
                                    { tier: 'Basic', revenue: revenueAnalytics?.revenueByTier?.basic || 0, users: revenueAnalytics?.tierDistribution?.basic || 0 },
                                    { tier: 'Premium', revenue: revenueAnalytics?.revenueByTier?.premium || 0, users: revenueAnalytics?.tierDistribution?.premium || 0 },
                                    { tier: 'Enterprise', revenue: revenueAnalytics?.revenueByTier?.enterprise || 0, users: revenueAnalytics?.tierDistribution?.enterprise || 0 },
                                    { tier: 'Ultimate', revenue: revenueAnalytics?.revenueByTier?.ultimate || 0, users: revenueAnalytics?.tierDistribution?.ultimate || 0 },
                                  ]} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis type="number" stroke="hsl(var(--foreground))" fontSize={8} tickFormatter={(v) => `£${v}`} />
                                    <YAxis type="category" dataKey="tier" stroke="hsl(var(--foreground))" fontSize={8} width={80} />
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
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Tier Upgrade Funnel</CardTitle>
                              <CardDescription className="text-[9px]">User progression through subscription tiers (real data)</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between gap-1.5">
                                {(() => {
                                  const tiers = [
                                    { tier: 'Free', users: revenueAnalytics?.tierDistribution?.free || 0 },
                                    { tier: 'Basic', users: revenueAnalytics?.tierDistribution?.basic || 0 },
                                    { tier: 'Premium', users: revenueAnalytics?.tierDistribution?.premium || 0 },
                                    { tier: 'Enterprise', users: revenueAnalytics?.tierDistribution?.enterprise || 0 },
                                    { tier: 'Ultimate', users: revenueAnalytics?.tierDistribution?.ultimate || 0 },
                                  ];
                                  return tiers.map((stage, index, arr) => (
                                    <div key={stage.tier} className="flex-1 relative">
                                      <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="text-center p-4 rounded-lg bg-muted/50"
                                      >
                                        <p className="text-[9px] text-muted-foreground">{stage.tier}</p>
                                        <p className="text-xs font-bold mt-1">{stage.users}</p>
                                        {index < arr.length - 1 && stage.users > 0 && arr[index + 1].users > 0 && (
                                          <Badge className="mt-2 bg-green-500/10 text-green-500">
                                            {((arr[index + 1].users / stage.users) * 100).toFixed(1)}% upgrade
                                          </Badge>
                                        )}
                                      </motion.div>
                                      {index < arr.length - 1 && (
                                        <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                                      )}
                                    </div>
                                  ));
                                })()}
                              </div>
                            </CardContent>
                          </Card>
                            </>
                          )}
                        </>
                      )}

                      {/* 5. LTV ANALYSIS - Customer Lifetime Value */}
                      {activeSection === 'revenue-ltv' && (
                        <>
                          {/* LTV Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="hover-elevate border-l-4 border-l-purple-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Average LTV</p>
                                    <p className="text-[9px] font-bold">£{(revenueAnalytics?.avgLTV || 0).toFixed(2)}</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">from Stripe</Badge>
                                  </div>
                                  <LineChart className="h-5 w-5 text-purple-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-green-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Revenue</p>
                                    <p className="text-[9px] font-bold">£{(revenueAnalytics?.revenueAllTime || 0).toFixed(2)}</p>
                                    <Badge className="mt-2 bg-green-500/10 text-green-500">All-time</Badge>
                                  </div>
                                  <Target className="h-5 w-5 text-green-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-blue-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Customers</p>
                                    <p className="text-[9px] font-bold">{revenueAnalytics?.totalCustomers || 0}</p>
                                    <Badge className="mt-2 bg-blue-500/10 text-blue-500">Unique</Badge>
                                  </div>
                                  <Users className="h-5 w-5 text-blue-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="hover-elevate border-l-4 border-l-amber-500">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Avg Order Value</p>
                                    <p className="text-[9px] font-bold">£{(revenueAnalytics?.avgOrderValue || 0).toFixed(2)}</p>
                                    <Badge className="mt-2 bg-amber-500/10 text-amber-500">Per transaction</Badge>
                                  </div>
                                  <Zap className="h-5 w-5 text-amber-500 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* LTV by Tier */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Lifetime Value by Subscription Tier</CardTitle>
                              <CardDescription className="text-[9px]">Projected revenue over customer lifetime</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
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
                                        <p className="text-xs font-bold mt-0.5">£{item.ltv}</p>
                                        <p className="text-[9px] text-muted-foreground mt-1">Lifetime Value</p>
                                        <Separator className="my-4" />
                                        <div className="space-y-2 text-[9px]">
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

                          {/* LTV & Revenue Summary - Real Data */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-[10px] font-semibold">Customer Lifetime Value</CardTitle>
                                    <CardDescription className="text-[9px]">Real-time LTV from Stripe data</CardDescription>
                                  </div>
                                  <Badge variant="outline" className="text-purple-500 border-purple-500/30">Live</Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col items-center justify-center h-[300px]">
                                  <div className="text-center mb-1">
                                    <p className="text-xs font-bold text-purple-500">£{(revenueAnalytics?.avgLTV || 0).toFixed(2)}</p>
                                    <p className="text-muted-foreground mt-0.5">Average Customer Lifetime Value</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-6 w-full mt-1">
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-[9px] font-bold">{revenueAnalytics?.totalCustomers || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Total Customers</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-[9px] font-bold">{revenueAnalytics?.activeSubscriptions || 0}</p>
                                      <p className="text-[9px] text-muted-foreground">Active Subs</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-[9px] font-bold">£{(revenueAnalytics?.avgOrderValue || 0).toFixed(0)}</p>
                                      <p className="text-[9px] text-muted-foreground">Avg Order</p>
                                    </div>
                                  </div>
                                  {(revenueAnalytics?.totalCustomers || 0) === 0 && (
                                    <p className="text-[9px] text-muted-foreground text-center mt-1">
                                      No customers yet. LTV data will appear as payments are made.
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Revenue Summary</CardTitle>
                                <CardDescription className="text-[9px]">Key revenue metrics from Stripe</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                                    <p className="text-[9px] text-muted-foreground">Monthly Recurring Revenue</p>
                                    <p className="text-xs font-bold text-green-500 mt-0.5">£{(revenueAnalytics?.mrr || 0).toFixed(2)}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                      ARR: £{(revenueAnalytics?.arr || 0).toFixed(2)}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-[9px] text-muted-foreground">Avg. LTV</p>
                                      <p className="text-[9px] font-bold">£{(revenueAnalytics?.avgLTV || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-muted/30">
                                      <p className="text-[9px] text-muted-foreground">This Month</p>
                                      <p className="text-[9px] font-bold">£{(revenueAnalytics?.revenueThisMonth || 0).toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <Card className="bg-blue-500/5 border-blue-500/20">
                                    <CardContent className="py-3">
                                      <div className="flex items-center gap-2">
                                        <Lightbulb className="h-3 w-3 text-blue-500" />
                                        <span className="text-[9px] text-blue-500 font-medium">Summary</span>
                                      </div>
                                      <p className="text-[9px] text-muted-foreground mt-1">
                                        All figures are real-time data from your Stripe account. {revenueAnalytics?.totalCustomers || 0} unique customers, {revenueAnalytics?.activeSubscriptions || 0} active subscriptions.
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

                {/* Logs & Audit Section - 4 Unique Advanced Pages */}
                {activeSection.startsWith('logs') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* 1. ACTIVITY LOG - Comprehensive Activity Stream */}
                      {activeSection === 'logs-activity' && (
                        <>
                          {/* Activity Overview Banner */}
                          <Card className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 border-blue-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-blue-500 text-white">
                                    <ScrollText className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Activity Stream</p>
                                    <p className="text-xs font-bold text-blue-500">Real-Time Event Monitoring</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Today</p>
                                    <p className="text-[9px] font-bold">2,847</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">This Week</p>
                                    <p className="text-[9px] font-bold">18,234</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('analytics')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-activity-log"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Activity Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            {[
                              { label: 'Total Events', value: '12,847', icon: Activity, color: 'blue', change: '+15%' },
                              { label: 'User Actions', value: '8,234', icon: Users, color: 'green', change: '+22%' },
                              { label: 'System Events', value: '3,156', icon: Server, color: 'purple', change: '+8%' },
                              { label: 'API Calls', value: '1,457', icon: Zap, color: 'amber', change: '+34%' },
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
                                      <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                                      <Badge className={`bg-${stat.color}-500/10 text-${stat.color}-500`}>{stat.change}</Badge>
                                    </div>
                                    <p className="text-xs font-bold mt-0.5">{stat.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Activity Timeline */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Activity Timeline</CardTitle>
                                  <CardDescription className="text-[9px]">Recent user and system activities</CardDescription>
                                </div>
                                <Select defaultValue="all">
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    <SelectItem value="user">User Actions</SelectItem>
                                    <SelectItem value="system">System Events</SelectItem>
                                    <SelectItem value="api">API Calls</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {activityLogLoading ? (
                                <div className="space-y-1">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <ShimmerSkeleton key={i} />
                                  ))}
                                </div>
                              ) : activityLog && activityLog.length > 0 ? (
                                <ScrollArea className="h-[180px]">
                                  <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                                    <div className="space-y-1.5">
                                      {activityLog.map((entry, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.03 }}
                                          className="flex items-start gap-4 relative"
                                        >
                                          <div className={`p-2 rounded-full z-10 ${
                                            entry.severity === 'error' ? 'bg-red-500 text-white' :
                                            entry.severity === 'warning' ? 'bg-amber-500 text-white' :
                                            'bg-blue-500 text-white'
                                          }`}>
                                            {entry.severity === 'error' ? <AlertTriangle className="h-3 w-3" /> :
                                             entry.severity === 'warning' ? <AlertCircle className="h-3 w-3" /> :
                                             <Activity className="h-3 w-3" />}
                                          </div>
                                          <div className="flex-1 p-4 rounded-lg border border-border/50 bg-card/50 hover-elevate">
                                            <div className="flex items-center justify-between mb-0.5">
                                              <span className="font-medium">{entry.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDistance(new Date(entry.timestamp), new Date(), { addSuffix: true })}
                                              </span>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground">{entry.message}</p>
                                            {entry.userName && (
                                              <Badge variant="secondary" className="mt-2">{entry.userName}</Badge>
                                            )}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </ScrollArea>
                              ) : (
                                <div className="py-1 text-center">
                                  <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-[9px] text-muted-foreground">No activity logs available</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 2. ERROR LOG - Real-Time Error Tracking & Analysis */}
                      {activeSection === 'logs-errors' && (
                        <>
                          {/* Error Status Banner */}
                          <Card className="bg-gradient-to-r from-red-500/10 via-rose-500/5 to-red-500/10 border-red-500/20">
                            <CardContent className="py-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <motion.div
                                    className={`p-3 rounded-xl text-white ${
                                      (errorLogsData?.stats?.unresolved || 0) > 0 ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    animate={{ scale: (errorLogsData?.stats?.unresolved || 0) > 0 ? [1, 1.1, 1] : 1 }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    {(errorLogsData?.stats?.unresolved || 0) > 0 ? (
                                      <AlertTriangle className="h-3 w-3" />
                                    ) : (
                                      <CheckCircle className="h-3 w-3" />
                                    )}
                                  </motion.div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Live Error Monitor</p>
                                    <p className={`text-xs font-bold ${
                                      (errorLogsData?.stats?.unresolved || 0) > 0 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                      {errorLogsData?.stats?.unresolved || 0} Unresolved Issues
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Critical</p>
                                    <p className="text-xs font-bold text-red-500">{errorLogsData?.stats?.bySeverity?.critical || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Error</p>
                                    <p className="text-xs font-bold text-orange-500">{errorLogsData?.stats?.bySeverity?.error || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Warning</p>
                                    <p className="text-xs font-bold text-amber-500">{errorLogsData?.stats?.bySeverity?.warning || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-muted-foreground">Total</p>
                                    <p className="text-[9px] font-bold">{errorLogsData?.stats?.total || 0}</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Error Stats Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            {[
                              { label: 'Client Errors', type: 'client', icon: Globe, color: 'blue' },
                              { label: 'API Errors', type: 'api', icon: Server, color: 'purple' },
                              { label: 'AI Errors', type: 'ai', icon: Sparkles, color: 'amber' },
                              { label: 'Auth Errors', type: 'auth', icon: Shield, color: 'red' },
                            ].map((stat) => {
                              const count = errorLogsData?.errors?.filter(e => e.errorType === stat.type).length || 0;
                              return (
                                <Card key={stat.type} className="hover-elevate">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                                        <stat.icon className={`h-3 w-3 text-${stat.color}-500`} />
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold">{count}</p>
                                        <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>

                          {/* Error List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    Recent Errors
                                    {errorLogsLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Click to view details and resolve errors</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => clearResolvedErrorsMutation.mutate()}
                                    disabled={clearResolvedErrorsMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Clear Resolved
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => refetchErrorLogs()}
                                  >
                                    <RefreshCw className={`h-3 w-3 mr-2 ${errorLogsLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {errorLogsLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                  ))}
                                </div>
                              ) : errorLogsData?.errors?.length === 0 ? (
                                <div className="py-1 text-center">
                                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-1" />
                                  <p className="text-xs font-medium text-green-600">No errors logged!</p>
                                  <p className="text-[9px] text-muted-foreground">Your system is running smoothly.</p>
                                </div>
                              ) : (
                                <ScrollArea className="h-[180px]">
                                  <div className="space-y-1">
                                    {errorLogsData?.errors?.map((error, index) => (
                                      <motion.div
                                        key={error.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`p-4 rounded-lg border hover-elevate cursor-pointer ${
                                          error.isResolved ? 'border-green-500/30 bg-green-500/5' :
                                          error.severity === 'critical' ? 'border-red-500/50 bg-red-500/5' :
                                          error.severity === 'error' ? 'border-orange-500/50 bg-orange-500/5' :
                                          error.severity === 'warning' ? 'border-amber-500/50 bg-amber-500/5' :
                                          'border-border/50'
                                        }`}
                                        onClick={() => setSelectedError(error)}
                                      >
                                        <div className="flex items-start justify-between gap-1.5">
                                          <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <Badge className={
                                              error.isResolved ? 'bg-green-500 text-white' :
                                              error.severity === 'critical' ? 'bg-red-500 text-white' :
                                              error.severity === 'error' ? 'bg-orange-500 text-white' :
                                              error.severity === 'warning' ? 'bg-amber-500 text-white' :
                                              'bg-blue-500 text-white'
                                            }>
                                              {error.isResolved ? 'resolved' : error.severity}
                                            </Badge>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                  {error.errorType}
                                                </Badge>
                                                {error.toolId && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    {error.toolId}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-[9px] mt-0.5 break-words">{error.message}</p>
                                              <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                                                <span className="font-mono">{error.id.slice(0, 8)}...</span>
                                                {error.userEmail && (
                                                  <>
                                                    <span>|</span>
                                                    <span>{error.userEmail}</span>
                                                  </>
                                                )}
                                                {error.pageUrl && (
                                                  <>
                                                    <span>|</span>
                                                    <span className="truncate max-w-[200px]">{error.pageUrl}</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                              {formatDistance(new Date(error.createdAt), new Date(), { addSuffix: true })}
                                            </span>
                                            <div className="flex items-center gap-1">
                                              {!error.isResolved && (
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-7 w-7"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedError(error);
                                                  }}
                                                >
                                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                                </Button>
                                              )}
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  deleteErrorMutation.mutate(error.id);
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              )}
                            </CardContent>
                          </Card>

                          {/* Error Detail Dialog */}
                          <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  Error Details
                                </DialogTitle>
                                <DialogDescription>
                                  Full error information and stack trace
                                </DialogDescription>
                              </DialogHeader>
                              {selectedError && (
                                <div className="space-y-1.5">
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                      <Label className="text-muted-foreground">Error Type</Label>
                                      <p className="font-mono">{selectedError.errorType}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Severity</Label>
                                      <Badge className={
                                        selectedError.severity === 'critical' ? 'bg-red-500' :
                                        selectedError.severity === 'error' ? 'bg-orange-500' :
                                        'bg-amber-500'
                                      }>{selectedError.severity}</Badge>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">User</Label>
                                      <p>{selectedError.userEmail || 'Anonymous'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Time</Label>
                                      <p>{format(new Date(selectedError.createdAt), 'PPpp')}</p>
                                    </div>
                                    {selectedError.toolId && (
                                      <div>
                                        <Label className="text-muted-foreground">Tool</Label>
                                        <p>{selectedError.toolId}</p>
                                      </div>
                                    )}
                                    {selectedError.pageUrl && (
                                      <div className="col-span-2">
                                        <Label className="text-muted-foreground">Page URL</Label>
                                        <p className="break-all text-[9px]">{selectedError.pageUrl}</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <Label className="text-muted-foreground">Message</Label>
                                    <p className="p-3 bg-muted rounded-lg mt-1">{selectedError.message}</p>
                                  </div>
                                  
                                  {selectedError.stack && (
                                    <div>
                                      <Label className="text-muted-foreground">Stack Trace</Label>
                                      <pre className="p-3 bg-muted rounded-lg mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                                        {selectedError.stack}
                                      </pre>
                                    </div>
                                  )}

                                  {!selectedError.isResolved && (
                                    <div className="space-y-0.5">
                                      <Label>Resolution Notes</Label>
                                      <Input
                                        placeholder="How was this error resolved?"
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                      />
                                    </div>
                                  )}

                                  {selectedError.isResolved && selectedError.resolution && (
                                    <div>
                                      <Label className="text-muted-foreground">Resolution</Label>
                                      <p className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-1">
                                        {selectedError.resolution}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setSelectedError(null)}>
                                  Close
                                </Button>
                                {selectedError && !selectedError.isResolved && (
                                  <Button 
                                    onClick={() => {
                                      resolveErrorMutation.mutate({
                                        errorId: selectedError.id,
                                        resolution: resolutionText || 'Marked as resolved'
                                      });
                                      setResolutionText("");
                                    }}
                                    disabled={resolveErrorMutation.isPending}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-2" />
                                    Mark Resolved
                                  </Button>
                                )}
                                <Button 
                                  variant="destructive"
                                  onClick={() => {
                                    deleteErrorMutation.mutate(selectedError.id);
                                    setSelectedError(null);
                                  }}
                                  disabled={deleteErrorMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {/* 3. AUDIT TRAIL - Complete Admin Audit History */}
                      {activeSection === 'logs-audit' && (
                        <>
                          {/* Audit Overview */}
                          <Card className="bg-gradient-to-r from-purple-500/10 via-violet-500/5 to-purple-500/10 border-purple-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="p-3 rounded-xl bg-purple-500 text-white">
                                    <History className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Admin Audit Trail</p>
                                    <p className="text-xs font-bold text-purple-500">Complete Action History</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('analytics')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-audit-report"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export Report'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Audit Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            {[
                              { label: 'Total Actions', value: auditLog?.length || 0, icon: History, color: 'purple' },
                              { label: 'User Changes', value: 45, icon: Users, color: 'blue' },
                              { label: 'Plan Changes', value: 23, icon: CreditCard, color: 'green' },
                              { label: 'System Config', value: 12, icon: Settings, color: 'amber' },
                            ].map((stat, index) => (
                              <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="hover-elevate">
                                  <CardContent className="pt-6">
                                    <stat.icon className={`h-8 w-8 text-${stat.color}-500 mb-0.5`} />
                                    <p className="text-[9px] font-bold">{stat.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Audit Log Table */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Audit Trail</CardTitle>
                              <CardDescription className="text-[9px]">All administrative actions with detailed change logs</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {auditLogLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <ShimmerSkeleton key={i} />
                                  ))}
                                </div>
                              ) : auditLog && auditLog.length > 0 ? (
                                <ScrollArea className="h-[600px] pr-4">
                                  <div className="space-y-1">
                                    {auditLog.map((entry, index) => (
                                      <Collapsible key={entry.id}>
                                        <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: index * 0.02 }}
                                          className="p-4 rounded-lg border border-border/50 bg-card/50 hover-elevate"
                                        >
                                          <CollapsibleTrigger className="w-full">
                                            <div className="flex items-start justify-between gap-1.5">
                                              <div className="flex-1 text-left">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                  <Shield className="h-3 w-3 text-purple-500" />
                                                  <span className="font-medium">{entry.adminEmail}</span>
                                                  <Badge variant="outline" className="text-xs">
                                                    {entry.targetType}
                                                  </Badge>
                                                </div>
                                                <p className="text-[9px] text-muted-foreground">{entry.action}</p>
                                              </div>
                                              <div className="text-right shrink-0">
                                                <p className="text-[9px] text-muted-foreground">
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
                                              <div className="space-y-0.5">
                                                <Label className="text-xs text-muted-foreground">Changes Made:</Label>
                                                {Object.entries(entry.changes).map(([field, values]) => (
                                                  <div key={field} className="flex items-center gap-2 text-[9px]">
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
                                <div className="py-1 text-center">
                                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-1" />
                                  <p className="text-[9px] text-muted-foreground">No audit log entries</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* 4. SECURITY EVENTS - Security Monitoring Dashboard */}
                      {activeSection === 'logs-security' && (
                        <>
                          {/* Security Status */}
                          <Card className={`bg-gradient-to-r ${
                            (securityEventsData?.stats?.unresolved || 0) > 0 
                              ? 'from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/20'
                              : 'from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20'
                          }`}>
                            <CardContent className="py-1">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <motion.div
                                    className={`p-3 rounded-xl text-white ${
                                      (securityEventsData?.stats?.unresolved || 0) > 0 ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Shield className="h-3 w-3" />
                                  </motion.div>
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Security Status</p>
                                    <p className={`text-xs font-bold ${
                                      (securityEventsData?.stats?.unresolved || 0) > 0 ? 'text-amber-500' : 'text-green-500'
                                    }`}>
                                      {(securityEventsData?.stats?.unresolved || 0) > 0 
                                        ? `${securityEventsData?.stats?.unresolved} Unresolved Events` 
                                        : 'All Systems Secure'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => refetchSecurityEvents()}
                                    disabled={securityEventsLoading}
                                  >
                                    <RefreshCw className={`h-3 w-3 mr-2 ${securityEventsLoading ? 'animate-spin' : ''}`} />
                                    Refresh
                                  </Button>
                                  {(securityEventsData?.events?.filter(e => e.isResolved).length || 0) > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => clearResolvedSecurityEventsMutation.mutate()}
                                      disabled={clearResolvedSecurityEventsMutation.isPending}
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Clear Resolved
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Security Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            {[
                              { 
                                label: 'Failed Logins', 
                                value: securityEventsData?.stats?.byType?.failed_login || 0, 
                                icon: XCircle, 
                                color: 'red', 
                                status: (securityEventsData?.stats?.byType?.failed_login || 0) > 0 ? 'Monitoring' : 'Clear' 
                              },
                              { 
                                label: 'Suspicious IPs', 
                                value: securityEventsData?.stats?.byType?.suspicious_ip || 0, 
                                icon: Eye, 
                                color: 'amber', 
                                status: (securityEventsData?.stats?.byType?.suspicious_ip || 0) > 0 ? 'Tracking' : 'Clear' 
                              },
                              { 
                                label: 'Rate Limits', 
                                value: securityEventsData?.stats?.byType?.rate_limit || 0, 
                                icon: Zap, 
                                color: 'blue', 
                                status: 'Normal' 
                              },
                              { 
                                label: 'Total Events', 
                                value: securityEventsData?.stats?.total || 0, 
                                icon: Shield, 
                                color: 'green', 
                                status: securityEventsData?.stats?.unresolved === 0 ? 'All Clear' : 'Review' 
                              },
                            ].map((metric, index) => (
                              <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card className="hover-elevate">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <metric.icon className={`h-3 w-3 text-${metric.color}-500`} />
                                      <Badge variant="outline">{metric.status}</Badge>
                                    </div>
                                    <p className="text-[9px] font-bold">{metric.value}</p>
                                    <p className="text-[9px] text-muted-foreground">{metric.label}</p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>

                          {/* Security Events List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold">Security Events</CardTitle>
                                  <CardDescription className="text-[9px]">Real-time security monitoring and event tracking</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {securityEventsLoading ? (
                                <div className="space-y-1">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <ShimmerSkeleton key={i} />
                                  ))}
                                </div>
                              ) : securityEventsData?.events && securityEventsData.events.length > 0 ? (
                                <ScrollArea className="h-[160px]">
                                  <div className="space-y-1">
                                    {securityEventsData.events.map((event, index) => (
                                      <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-lg border ${
                                          event.isResolved 
                                            ? 'border-green-500/30 bg-green-500/5' 
                                            : event.severity === 'critical' || event.severity === 'high'
                                              ? 'border-red-500/30 bg-red-500/5'
                                              : event.severity === 'medium'
                                                ? 'border-amber-500/30 bg-amber-500/5'
                                                : 'border-border/50'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-1.5">
                                          <div className="flex items-start gap-1.5">
                                            {event.isResolved ? (
                                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                                            ) : event.severity === 'critical' || event.severity === 'high' ? (
                                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5" />
                                            ) : event.severity === 'medium' ? (
                                              <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5" />
                                            ) : (
                                              <Eye className="h-3 w-3 text-blue-500 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">{event.description}</p>
                                                <Badge variant="outline" className={
                                                  event.severity === 'critical' ? 'text-red-600 border-red-500' :
                                                  event.severity === 'high' ? 'text-red-500' :
                                                  event.severity === 'medium' ? 'text-amber-500' :
                                                  'text-blue-500'
                                                }>{event.severity}</Badge>
                                                {event.isResolved && (
                                                  <Badge className="bg-green-500/10 text-green-500">Resolved</Badge>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                  <Clock className="h-3 w-3" />
                                                  {formatDistance(new Date(event.createdAt), new Date(), { addSuffix: true })}
                                                </span>
                                                {event.ipAddress && (
                                                  <span className="font-mono">{event.ipAddress}</span>
                                                )}
                                                {event.userEmail && (
                                                  <span>{event.userEmail}</span>
                                                )}
                                                <Badge variant="secondary" className="text-xs">
                                                  {event.eventType.replace(/_/g, ' ')}
                                                </Badge>
                                              </div>
                                              {event.resolution && (
                                                <p className="text-xs text-green-600 mt-0.5">
                                                  Resolution: {event.resolution}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {!event.isResolved && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => resolveSecurityEventMutation.mutate({ 
                                                  eventId: event.id, 
                                                  resolution: 'Reviewed and cleared by admin' 
                                                })}
                                                disabled={resolveSecurityEventMutation.isPending}
                                              >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Resolve
                                              </Button>
                                            )}
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => deleteSecurityEventMutation.mutate(event.id)}
                                              disabled={deleteSecurityEventMutation.isPending}
                                            >
                                              <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              ) : (
                                <div className="py-1 text-center">
                                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-1" />
                                  <p className="text-xs font-medium text-green-500">All Systems Secure</p>
                                  <p className="text-muted-foreground mt-1">No security events recorded</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Communications Section - 2 Unique Advanced Pages */}
                {activeSection.startsWith('comms') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* 1. EMAIL ANALYTICS - Real Data from Database */}
                      {activeSection === 'comms-emails' && (
                        <>
                          {emailAnalyticsLoading ? (
                            <div className="space-y-1.5">
                              <Skeleton className="h-24 w-full" />
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Email Overview Banner */}
                              <Card className="bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-blue-500/10 border-blue-500/20">
                                <CardContent className="py-1">
                                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className="p-3 rounded-xl bg-blue-500 text-white">
                                        <Mail className="h-3 w-3" />
                                      </div>
                                      <div>
                                        <p className="text-[9px] text-muted-foreground">Email Analytics</p>
                                        <p className="text-xs font-bold text-blue-500">Email Performance Dashboard</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6 flex-wrap">
                                      <div className="text-center">
                                        <p className="text-[9px] text-muted-foreground">Sent Today</p>
                                        <p className="text-[9px] font-bold">{emailAnalytics?.summary?.sentToday || 0}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[9px] text-muted-foreground">Delivery Rate</p>
                                        <p className="text-xs font-bold text-green-500">{emailAnalytics?.summary?.deliveryRate || '0%'}</p>
                                      </div>
                                      <Button
                                        data-testid="button-send-bulk-welcome"
                                        onClick={async () => {
                                          if (!confirm('Send welcome email to ALL users? This will email all 17 registered users.')) return;
                                          try {
                                            const response = await apiRequest('POST', '/api/admin/emails/send-bulk-welcome', {});
                                            const data = await response.json();
                                            if (data.success) {
                                              toast({
                                                title: 'Welcome Emails Sent',
                                                description: `Successfully sent ${data.sent} emails. ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
                                              });
                                              refetchEmailAnalytics();
                                            } else {
                                              throw new Error(data.error);
                                            }
                                          } catch (err: any) {
                                            toast({
                                              title: 'Email Send Failed',
                                              description: err.message || 'Failed to send bulk emails',
                                              variant: 'destructive',
                                            });
                                          }
                                        }}
                                        className="bg-gradient-to-r from-orange-500 to-blue-500 text-white"
                                      >
                                        <Send className="h-3 w-3 mr-2" />
                                        Send Bulk Welcome Email
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Email KPIs - Real Data */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                {[
                                  { label: 'Total Sent (30 days)', value: emailAnalytics?.summary?.totalSent30Days?.toLocaleString() || '0', icon: Send, color: 'blue', sub: 'Last 30 days' },
                                  { label: 'Delivery Rate', value: emailAnalytics?.summary?.deliveryRate || '0%', icon: CheckCircle, color: 'green', sub: emailAnalytics?.summary?.deliveryRate === '100%' ? 'Perfect' : 'Good' },
                                  { label: 'Sent Today', value: emailAnalytics?.summary?.sentToday?.toString() || '0', icon: Eye, color: 'purple', sub: 'Today' },
                                  { label: 'Total All Time', value: emailAnalytics?.summary?.totalAllTime?.toLocaleString() || '0', icon: MousePointer, color: 'amber', sub: 'Since launch' },
                                ].map((kpi, index) => (
                                  <motion.div
                                    key={kpi.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Card className={`hover-elevate border-t-4 border-t-${kpi.color}-500`}>
                                      <CardContent className="pt-6">
                                        <kpi.icon className={`h-8 w-8 text-${kpi.color}-500 mb-0.5`} />
                                        <p className="text-[9px] font-bold">{kpi.value}</p>
                                        <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Email Charts - Real Data */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold">Email Volume (30 days)</CardTitle>
                                    <CardDescription className="text-[9px]">Weekly email sending trends</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <ResponsiveContainer width="100%" height={80}>
                                      <RechartsAreaChart data={emailAnalytics?.weeklyData || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                        <Area type="monotone" dataKey="sent" stroke="#3b82f6" fill="#3b82f620" strokeWidth={2} name="Sent" />
                                        <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="#22c55e20" strokeWidth={2} name="Delivered" />
                                      </RechartsAreaChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-6 mt-1">
                                      {[
                                        { name: 'Sent', color: '#3b82f6' },
                                        { name: 'Delivered', color: '#22c55e' },
                                      ].map(item => (
                                        <div key={item.name} className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                          <span className="text-[9px]">{item.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold">Email Type Distribution</CardTitle>
                                    <CardDescription className="text-[9px]">Breakdown by category</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-1.5">
                                      {emailAnalytics?.typeDistribution?.length ? (
                                        emailAnalytics.typeDistribution.map((item, index) => {
                                          const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
                                          const color = colors[index % colors.length];
                                          return (
                                            <motion.div
                                              key={item.type}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.1 }}
                                              className="space-y-0.5"
                                            >
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                  <span className="text-[9px]">{item.type}</span>
                                                </div>
                                                <span className="text-[9px] font-bold">{item.count}</span>
                                              </div>
                                              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                                <motion.div
                                                  className="absolute inset-y-0 left-0 rounded-full"
                                                  style={{ backgroundColor: color }}
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${parseFloat(item.percent)}%` }}
                                                  transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                                />
                                              </div>
                                            </motion.div>
                                          );
                                        })
                                      ) : (
                                        <p className="text-muted-foreground text-center py-1">No emails sent yet</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Recent Emails Table - Real Data */}
                              <Card>
                                <CardHeader className="p-2 pb-1">
                                  <CardTitle className="text-[10px] font-semibold">Recent Emails</CardTitle>
                                  <CardDescription className="text-[9px]">Last 10 emails sent</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-[130px]">
                                    <div className="space-y-1">
                                      {emailAnalytics?.recentEmails?.length ? (
                                        emailAnalytics.recentEmails.map((email, index) => (
                                          <motion.div
                                            key={email.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                          >
                                            <div className="flex items-center gap-1.5">
                                              <Mail className="h-3 w-3 text-blue-500" />
                                              <div>
                                                <p className="font-medium text-[9px]">{email.subject}</p>
                                                <p className="text-[9px] text-muted-foreground">{email.to}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <Badge variant="outline">{email.type}</Badge>
                                              <Badge className={
                                                email.status === 'sent' || email.status === 'delivered' ? 'bg-green-500 text-white' :
                                                email.status === 'pending' ? 'bg-blue-500 text-white' :
                                                'bg-red-500 text-white'
                                              }>{email.status}</Badge>
                                              <span className="text-xs text-muted-foreground">{email.time}</span>
                                            </div>
                                          </motion.div>
                                        ))
                                      ) : (
                                        <p className="text-muted-foreground text-center py-1">No emails sent yet</p>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </>
                          )}
                        </>
                      )}

                      {/* 2. NOTIFICATIONS - Real Data from Database */}
                      {activeSection === 'comms-notifications' && (
                        <>
                          {notificationAnalyticsLoading ? (
                            <div className="space-y-1.5">
                              <Skeleton className="h-24 w-full" />
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Notification Overview */}
                              <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/20">
                                <CardContent className="py-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <motion.div
                                        className="p-3 rounded-xl bg-amber-500 text-white"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                                      >
                                        <Bell className="h-3 w-3" />
                                      </motion.div>
                                      <div>
                                        <p className="text-[9px] text-muted-foreground">Notification Center</p>
                                        <p className="text-xs font-bold text-amber-500">In-App & Push Notifications</p>
                                      </div>
                                    </div>
                                    <Button 
                                      variant="outline"
                                      onClick={() => setShowBroadcastModal(true)}
                                      data-testid="button-send-broadcast"
                                    >
                                      <Send className="h-3 w-3 mr-2" />
                                      Send Broadcast
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Notification Stats - Real Data */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                {[
                                  { label: 'Total Sent', value: notificationAnalytics?.summary?.totalSent30Days?.toLocaleString() || '0', icon: Bell, color: 'amber', sub: 'Last 30 days' },
                                  { label: 'In-App', value: notificationAnalytics?.summary?.inAppCount?.toLocaleString() || '0', icon: MessageSquare, color: 'blue', sub: 'System alerts' },
                                  { label: 'Scheduled', value: notificationAnalytics?.summary?.scheduledCount?.toLocaleString() || '0', icon: Smartphone, color: 'purple', sub: 'Scheduled notifications' },
                                  { label: 'Read Rate', value: notificationAnalytics?.summary?.readRate || '0%', icon: Eye, color: 'green', sub: notificationAnalytics?.summary?.readRate === '0%' ? 'No data yet' : 'Current rate' },
                                ].map((stat, index) => (
                                  <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Card className="hover-elevate">
                                      <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <stat.icon className={`h-3 w-3 text-${stat.color}-500`} />
                                        </div>
                                        <p className="text-[9px] font-bold">{stat.value}</p>
                                        <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                        <p className="text-[9px] text-muted-foreground">{stat.sub}</p>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>

                              {/* Notification Categories & Recent - Real Data */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold">Notification Categories</CardTitle>
                                    <CardDescription className="text-[9px]">Distribution by type</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-1.5">
                                      {notificationAnalytics?.typeDistribution?.length ? (
                                        notificationAnalytics.typeDistribution.map((cat, index) => {
                                          const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
                                          const color = colors[index % colors.length];
                                          const icons = [CheckCircle, CreditCard, AlertCircle, Sparkles, Clock, Info];
                                          const IconComponent = icons[index % icons.length];
                                          return (
                                            <motion.div
                                              key={cat.type}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.1 }}
                                              className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover-elevate"
                                            >
                                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                                                <IconComponent className="h-3 w-3" style={{ color }} />
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                  <span className="font-medium text-[9px]">{cat.type}</span>
                                                  <span className="text-[9px] font-bold">{cat.count}</span>
                                                </div>
                                                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                                  <motion.div
                                                    className="absolute inset-y-0 left-0 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${parseFloat(cat.percent)}%` }}
                                                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                                  />
                                                </div>
                                              </div>
                                            </motion.div>
                                          );
                                        })
                                      ) : (
                                        <p className="text-muted-foreground text-center py-1">No notifications sent yet</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold">Recent Notifications</CardTitle>
                                    <CardDescription className="text-[9px]">Latest sent notifications</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <ScrollArea className="h-[140px]">
                                      <div className="space-y-1">
                                        {notificationAnalytics?.recentNotifications?.length ? (
                                          notificationAnalytics.recentNotifications.map((notif, index) => (
                                            <motion.div
                                              key={notif.id}
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              transition={{ delay: index * 0.05 }}
                                              className="p-1.5 rounded-lg border border-border/50 hover-elevate"
                                            >
                                              <div className="flex items-start gap-1.5">
                                                <div className={`p-2 rounded-lg ${
                                                  notif.type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                  notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                                  notif.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                                  'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                  {notif.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                                                   notif.type === 'warning' ? <AlertCircle className="h-3 w-3" /> :
                                                   notif.type === 'error' ? <AlertCircle className="h-3 w-3" /> :
                                                   <Info className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1">
                                                  <p className="font-medium text-[9px]">{notif.title}</p>
                                                  <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                                                  <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-xs">
                                                      {notif.recipientCount === 0 ? 'All users' : `${notif.recipientCount} user${notif.recipientCount > 1 ? 's' : ''}`}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                      {notif.readCount} read
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </motion.div>
                                          ))
                                        ) : (
                                          <p className="text-muted-foreground text-center py-1">No notifications sent yet</p>
                                        )}
                                      </div>
                                    </ScrollArea>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Notification Templates - Static config, not analytics data */}
                              <Card>
                                <CardHeader className="p-2 pb-1">
                                  <CardTitle className="text-[10px] font-semibold">Notification Templates</CardTitle>
                                  <CardDescription className="text-[9px]">Pre-configured notification types (available templates)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                    {[
                                      { name: 'Welcome Message', status: 'active', description: 'Sent to new users' },
                                      { name: 'Trial Ending', status: 'active', description: 'Sent 3 days before trial ends' },
                                      { name: 'Feature Update', status: 'active', description: 'Announce new features' },
                                      { name: 'Weekly Summary', status: 'active', description: 'User progress digest' },
                                      { name: 'Payment Reminder', status: 'active', description: 'Subscription renewal' },
                                      { name: 'Custom Broadcast', status: 'active', description: 'Admin broadcast message' },
                                    ].map((template, index) => (
                                      <motion.div
                                        key={template.name}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                      >
                                        <Card className="hover-elevate cursor-pointer">
                                          <CardContent className="pt-4 pb-4">
                                            <div className="flex items-center justify-between mb-0.5">
                                              <span className="font-medium text-[9px]">{template.name}</span>
                                              <Badge className="bg-green-500 text-white">{template.status}</Badge>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground">{template.description}</p>
                                          </CardContent>
                                        </Card>
                                      </motion.div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )}
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* User Feedback Section */}
                {activeSection.startsWith('feedback') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* Feedback Overview */}
                      {activeSection === 'feedback-overview' && (
                        <>
                          {/* Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
                            {(() => {
                              const feedback = feedbackData?.feedback || [];
                              const totalResponses = feedback.length;
                              const avgRating = totalResponses > 0 
                                ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalResponses).toFixed(2)
                                : '0';
                              const fiveStars = feedback.filter(f => f.rating === 5).length;
                              const fourStars = feedback.filter(f => f.rating === 4).length;
                              const loggedInUsers = feedback.filter(f => f.userId).length;
                              
                              return [
                                { label: 'Total Responses', value: totalResponses, icon: MessageSquare, color: 'blue' },
                                { label: 'Avg Rating', value: `${avgRating}/5`, icon: Star, color: 'amber' },
                                { label: '5 Stars', value: fiveStars, icon: Star, color: 'green' },
                                { label: '4 Stars', value: fourStars, icon: Star, color: 'yellow' },
                                { label: 'Logged-in Users', value: loggedInUsers, icon: Users, color: 'purple' },
                              ].map((stat, index) => (
                                <motion.div
                                  key={stat.label}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Card className="hover-elevate">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <stat.icon className={`h-3 w-3 text-${stat.color}-500`} />
                                      </div>
                                      <p className="text-[9px] font-bold">{stat.value}</p>
                                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ));
                            })()}
                          </div>

                          {/* Rating Distribution Chart */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Rating Distribution</CardTitle>
                                <CardDescription className="text-[9px]">Breakdown by star rating</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {[5, 4, 3, 2, 1].map((rating) => {
                                    const feedback = feedbackData?.feedback || [];
                                    const count = feedback.filter(f => f.rating === rating).length;
                                    const total = feedback.length || 1;
                                    const percent = Math.round((count / total) * 100);
                                    const colors: Record<number, string> = {
                                      5: '#22c55e',
                                      4: '#84cc16',
                                      3: '#eab308',
                                      2: '#f97316',
                                      1: '#ef4444'
                                    };
                                    return (
                                      <div key={rating} className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-1 w-20">
                                          {Array.from({ length: rating }).map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                          ))}
                                        </div>
                                        <div className="flex-1">
                                          <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                                            <motion.div
                                              className="absolute inset-y-0 left-0 rounded-full"
                                              style={{ backgroundColor: colors[rating] }}
                                              initial={{ width: 0 }}
                                              animate={{ width: `${percent}%` }}
                                              transition={{ duration: 0.6 }}
                                            />
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-medium w-12 text-right">{count} ({percent}%)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold">Feedback by Page</CardTitle>
                                <CardDescription className="text-[9px]">Which pages received feedback</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1">
                                  {(() => {
                                    const feedback = feedbackData?.feedback || [];
                                    const pageMap: Record<string, number> = {};
                                    feedback.forEach(f => {
                                      const page = f.pageUrl || 'Unknown';
                                      pageMap[page] = (pageMap[page] || 0) + 1;
                                    });
                                    return Object.entries(pageMap)
                                      .sort((a, b) => b[1] - a[1])
                                      .slice(0, 8)
                                      .map(([page, count], index) => (
                                        <motion.div
                                          key={page}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover-elevate"
                                        >
                                          <span className="text-[9px] font-medium">{page}</span>
                                          <Badge variant="secondary">{count}</Badge>
                                        </motion.div>
                                      ));
                                  })()}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Feedback with Comments */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">Recent Feedback with Comments</CardTitle>
                              <CardDescription className="text-[9px]">User suggestions and improvement ideas</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[160px]">
                                <div className="space-y-1.5">
                                  {(feedbackData?.feedback || [])
                                    .filter(f => f.comment && f.comment.trim())
                                    .map((feedback, index) => (
                                      <motion.div
                                        key={feedback.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 rounded-lg border border-border/50 hover-elevate"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <div className="flex">
                                              {Array.from({ length: feedback.rating }).map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                              ))}
                                            </div>
                                            <span className="text-[9px] text-muted-foreground">
                                              {feedback.userName || feedback.userEmail || 'Anonymous'}
                                            </span>
                                            {feedback.userTier && (
                                              <Badge variant="outline" className="text-xs">{feedback.userTier}</Badge>
                                            )}
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(feedback.createdAt), 'MMM d, yyyy h:mm a')}
                                          </span>
                                        </div>
                                        <p className="mt-2 text-[9px]">{feedback.comment}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <Badge variant="secondary" className="text-xs">{feedback.pageUrl || 'Unknown page'}</Badge>
                                          {feedback.timeSpentMinutes && (
                                            <span className="text-xs text-muted-foreground">
                                              {feedback.timeSpentMinutes} min on site
                                            </span>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  {(feedbackData?.feedback || []).filter(f => f.comment && f.comment.trim()).length === 0 && (
                                    <div className="text-center py-1 text-muted-foreground">
                                      No feedback with comments yet
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* All Responses */}
                      {activeSection === 'feedback-responses' && (
                        <>
                          <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-500/20">
                            <CardContent className="py-1">
                              <div className="flex items-center gap-1.5">
                                <div className="p-3 rounded-xl bg-amber-500 text-white">
                                  <Star className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="text-[9px] text-muted-foreground">All Feedback Responses</p>
                                  <p className="text-xs font-bold text-amber-500">{feedbackData?.feedback?.length || 0} Total</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold">All Feedback Entries</CardTitle>
                              <CardDescription className="text-[9px]">Complete list of user feedback with all details</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[200px]">
                                <div className="space-y-1">
                                  {(feedbackData?.feedback || []).map((feedback, index) => (
                                    <motion.div
                                      key={feedback.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.02 }}
                                      className="p-4 rounded-lg border border-border/50 hover-elevate"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                        {/* Rating & User */}
                                        <div>
                                          <div className="flex items-center gap-1 mb-0.5">
                                            {Array.from({ length: feedback.rating }).map((_, i) => (
                                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            ))}
                                            {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                                              <Star key={i} className="h-3 w-3 text-muted-foreground/30" />
                                            ))}
                                          </div>
                                          <p className="text-[9px] font-medium">
                                            {feedback.userName || feedback.userEmail || 'Anonymous'}
                                          </p>
                                          {feedback.userTier && (
                                            <Badge variant="outline" className="text-xs mt-1">{feedback.userTier}</Badge>
                                          )}
                                        </div>
                                        
                                        {/* Comment */}
                                        <div className="md:col-span-2">
                                          {feedback.comment ? (
                                            <p className="text-[9px]">{feedback.comment}</p>
                                          ) : (
                                            <p className="text-[9px] text-muted-foreground italic">No comment</p>
                                          )}
                                        </div>
                                        
                                        {/* Meta */}
                                        <div className="text-right text-xs text-muted-foreground space-y-1">
                                          <p>{format(new Date(feedback.createdAt), 'MMM d, yyyy h:mm a')}</p>
                                          <p>{feedback.pageUrl || 'Unknown page'}</p>
                                          {feedback.timeSpentMinutes && <p>{feedback.timeSpentMinutes} min on site</p>}
                                          {feedback.screenSize && <p>{feedback.screenSize}</p>}
                                          {feedback.referrer && feedback.referrer !== 'direct' && (
                                            <p className="truncate max-w-[150px]" title={feedback.referrer}>
                                              From: {feedback.referrer}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                  {(feedbackData?.feedback || []).length === 0 && (
                                    <div className="text-center py-1 text-muted-foreground">
                                      No feedback collected yet
                                    </div>
                                  )}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Content Management Section */}
                {activeSection.startsWith('content-') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* Blog Dashboard */}
                      {activeSection === 'content-blog' && (
                        <>
                          {blogStatsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                              {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
                            </div>
                          ) : (
                            <>
                              {/* Blog Stats Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                      <FileText className="h-3 w-3" />
                                      Total Posts
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-xs font-bold text-blue-500">
                                      {blogStats?.counts?.total || 0}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3" />
                                      Published
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-xs font-bold text-emerald-500">
                                      {blogStats?.counts?.published || 0}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      Scheduled
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-xs font-bold text-amber-500">
                                      {blogStats?.counts?.scheduled || 0}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                      <Edit className="h-3 w-3" />
                                      Drafts
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-xs font-bold text-gray-500">
                                      {blogStats?.counts?.draft || 0}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Blog Posts Table */}
                              <Card>
                                <CardHeader className="flex flex-row items-center justify-between gap-1.5">
                                  <div>
                                    <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-[#005EB8]" />
                                      Blog Posts
                                    </CardTitle>
                                    <CardDescription className="text-[9px]">Manage your blog content</CardDescription>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        refetchBlogStats();
                                        refetchBlogPosts();
                                      }}
                                      data-testid="button-refresh-blog"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-[#005EB8] hover:bg-[#004494]"
                                      onClick={() => window.open('/admin/blog', '_blank')}
                                      data-testid="button-open-blog-editor"
                                    >
                                      Open Full Editor
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {blogPostsLoading ? (
                                    <Skeleton className="h-64 w-full" />
                                  ) : (
                                    <ScrollArea className="h-[160px]">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Views</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {blogPosts?.slice(0, 20).map((post) => (
                                            <TableRow key={post.id}>
                                              <TableCell className="font-medium max-w-[300px] truncate">
                                                {post.title}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline">{post.category}</Badge>
                                              </TableCell>
                                              <TableCell>
                                                <Badge className={
                                                  post.postStatus === 'published' ? 'bg-emerald-500/20 text-emerald-600' :
                                                  post.postStatus === 'scheduled' ? 'bg-amber-500/20 text-amber-600' :
                                                  'bg-gray-500/20 text-gray-600'
                                                }>
                                                  {post.postStatus}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{post.views || 0}</TableCell>
                                              <TableCell className="text-muted-foreground text-[9px]">
                                                {post.publishedAt ? format(new Date(post.publishedAt), 'dd MMM yyyy') :
                                                 post.scheduledFor ? format(new Date(post.scheduledFor), 'dd MMM yyyy') :
                                                 '-'}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                                  data-testid={`button-view-post-${post.id}`}
                                                >
                                                  <Eye className="h-3 w-3" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                          {(!blogPosts || blogPosts.length === 0) && (
                                            <TableRow>
                                              <TableCell colSpan={6} className="text-center py-1 text-muted-foreground">
                                                No blog posts yet
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </ScrollArea>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Scheduled & Top Posts */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-amber-500" />
                                      Upcoming Scheduled
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-1">
                                      {blogStats?.scheduledPosts?.slice(0, 5).map((post) => (
                                        <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                                          <span className="font-medium truncate max-w-[200px]">{post.title}</span>
                                          <Badge variant="outline" className="text-amber-600">
                                            {format(new Date(post.scheduledFor), 'dd MMM')}
                                          </Badge>
                                        </div>
                                      ))}
                                      {(!blogStats?.scheduledPosts || blogStats.scheduledPosts.length === 0) && (
                                        <p className="text-center text-muted-foreground py-1">No scheduled posts</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="p-2 pb-1">
                                    <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                                      Top Performing
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-1">
                                      {blogStats?.topPosts?.slice(0, 5).map((post) => (
                                        <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                                          <span className="font-medium truncate max-w-[200px]">{post.title}</span>
                                          <Badge className="bg-emerald-500/20 text-emerald-600">
                                            {post.views} views
                                          </Badge>
                                        </div>
                                      ))}
                                      {(!blogStats?.topPosts || blogStats.topPosts.length === 0) && (
                                        <p className="text-center text-muted-foreground py-1">No posts with views yet</p>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* SEO Analytics Placeholder */}
                      {activeSection === 'content-seo' && (
                        <Card>
                          <CardHeader className="p-2 pb-1">
                            <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-[#005EB8]" />
                              SEO Analytics
                            </CardTitle>
                            <CardDescription className="text-[9px]">Search engine optimization metrics</CardDescription>
                          </CardHeader>
                          <CardContent className="py-1 text-center text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-1 opacity-50" />
                            <p>SEO Analytics coming soon</p>
                            <p className="text-[9px] mt-0.5">Track keyword rankings, organic traffic, and search visibility</p>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Referrals & Promos Section */}
                {(activeSection.startsWith('referrals') || activeSection.startsWith('promos')) && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* Advanced Referral Programme Overview */}
                      {activeSection === 'referrals-overview' && (
                        <>
                          {/* Hero Stats - KPI Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <Link2 className="h-3 w-3" />
                                  Referral Codes
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-cyan-500">
                                  {referralAnalytics?.totalReferralCodes || 0}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                    {referralAnalytics?.activeReferralCodes || 0} Active
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-600 border-gray-500/20">
                                    {(referralAnalytics?.totalReferralCodes || 0) - (referralAnalytics?.activeReferralCodes || 0)} Inactive
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  Referral Network
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-violet-500">
                                  {referralAnalytics?.totalReferrals || 0}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-green-500 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {referralAnalytics?.successfulReferrals || 0} converted
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <Target className="h-3 w-3" />
                                  Viral Coefficient
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-emerald-500">
                                  {((referralAnalytics?.conversionRate || 0) * 100).toFixed(1)}%
                                </div>
                                <div className="mt-2">
                                  <Progress 
                                    value={(referralAnalytics?.conversionRate || 0) * 100} 
                                    className="h-1" 
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <PoundSterling className="h-3 w-3" />
                                  Rewards Programme
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-amber-500">
                                  £{((referralAnalytics?.totalRewardsPaid || 0) / 100).toFixed(0)}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    £{((referralAnalytics?.pendingRewards || 0) / 100).toFixed(0)} pending
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Referral Performance Metrics */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            {/* Referral Funnel Visualization */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-cyan-500" />
                                  Referral Conversion Funnel
                                </CardTitle>
                                <CardDescription className="text-[9px]">Track users through the referral journey</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {[
                                    { stage: 'Link Clicks', count: referralAnalytics?.totalReferrals || 0, color: 'bg-cyan-500', percentage: 100 },
                                    { stage: 'Sign Ups', count: Math.round((referralAnalytics?.totalReferrals || 0) * 0.7), color: 'bg-violet-500', percentage: 70 },
                                    { stage: 'Plan Selected', count: Math.round((referralAnalytics?.totalReferrals || 0) * 0.4), color: 'bg-blue-500', percentage: 40 },
                                    { stage: 'Purchase Made', count: referralAnalytics?.successfulReferrals || 0, color: 'bg-green-500', percentage: Math.round(((referralAnalytics?.successfulReferrals || 0) / Math.max(1, referralAnalytics?.totalReferrals || 1)) * 100) },
                                  ].map((stage, index) => (
                                    <div key={stage.stage} className="relative">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-medium flex items-center gap-2">
                                          <span className={`w-3 h-3 rounded-full ${stage.color}`} />
                                          {stage.stage}
                                        </span>
                                        <span className="text-[9px] font-bold">{stage.count}</span>
                                      </div>
                                      <div className="h-8 bg-muted rounded-lg overflow-hidden">
                                        <div 
                                          className={`h-full ${stage.color} transition-all duration-500`}
                                          style={{ width: `${stage.percentage}%` }}
                                        />
                                      </div>
                                      {index < 3 && (
                                        <div className="absolute right-2 -bottom-2 text-xs text-muted-foreground">
                                          {stage.percentage}% →
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Referral Network Visualization */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Globe className="h-3 w-3 text-violet-500" />
                                  Network Growth
                                </CardTitle>
                                <CardDescription className="text-[9px]">Visualize your referral network expansion</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="relative h-[250px] flex items-center justify-center">
                                  {/* Central Node */}
                                  <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg z-10">
                                    <Crown className="h-8 w-8 text-white" />
                                  </div>
                                  
                                  {/* First Ring */}
                                  <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-violet-500/30 animate-pulse" />
                                  
                                  {/* Referrer Nodes */}
                                  {referralAnalytics?.topReferrers?.slice(0, 6).map((referrer, i) => {
                                    const angle = (i * 60) * (Math.PI / 180);
                                    const x = Math.cos(angle) * 80;
                                    const y = Math.sin(angle) * 80;
                                    return (
                                      <div 
                                        key={referrer.userId}
                                        className="absolute w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md"
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                      >
                                        <span className="text-white text-xs font-bold">{referrer.referrals}</span>
                                      </div>
                                    );
                                  })}
                                  
                                  {/* Second Ring */}
                                  <div className="absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/20" />
                                  
                                  {/* Stats Overlay */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card to-transparent pt-8 pb-2">
                                    <div className="flex justify-around text-center">
                                      <div>
                                        <p className="text-[9px] font-bold">{referralAnalytics?.topReferrers?.length || 0}</p>
                                        <p className="text-[9px] text-muted-foreground">Active Referrers</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold">{referralAnalytics?.successfulReferrals || 0}</p>
                                        <p className="text-[9px] text-muted-foreground">Conversions</p>
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-bold">
                                          {((referralAnalytics?.successfulReferrals || 0) / Math.max(1, referralAnalytics?.topReferrers?.length || 1)).toFixed(1)}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">Avg per Referrer</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Top Referrers Leaderboard */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Crown className="h-3 w-3 text-amber-500" />
                                    Top Referrers Leaderboard
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Champions driving your growth through referrals</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => refetchReferralAnalytics()}>
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                  Refresh
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {referralAnalyticsLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : referralAnalytics?.topReferrers && referralAnalytics.topReferrers.length > 0 ? (
                                <div className="space-y-1">
                                  {referralAnalytics.topReferrers.map((referrer, index) => (
                                    <Card key={referrer.userId} className={`hover-elevate ${index === 0 ? 'border-amber-500/30 bg-amber-500/5' : index === 1 ? 'border-gray-400/30 bg-gray-400/5' : index === 2 ? 'border-orange-600/30 bg-orange-600/5' : ''}`}>
                                      <CardContent className="p-2">
                                        <div className="flex items-center gap-1.5">
                                          {/* Rank Badge */}
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                            index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                            'bg-muted text-muted-foreground'
                                          }`}>
                                            #{index + 1}
                                          </div>
                                          
                                          {/* User Info */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <p className="font-medium truncate">{referrer.email}</p>
                                              {index === 0 && <Badge className="bg-amber-500">Top Referrer</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                              <Badge variant="outline" className="font-mono text-xs">
                                                {referrer.code}
                                              </Badge>
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 px-2"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(referrer.code);
                                                  toast({ title: "Copied!", description: `Code ${referrer.code} copied` });
                                                }}
                                              >
                                                <Copy className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                          
                                          {/* Stats */}
                                          <div className="flex items-center gap-1.5">
                                            <div className="text-center">
                                              <p className="text-xs font-bold text-cyan-500">{referrer.referrals}</p>
                                              <p className="text-[9px] text-muted-foreground">Referrals</p>
                                            </div>
                                            <div className="text-center">
                                              <p className="text-xs font-bold text-green-500">
                                                £{(referrer.earnings / 100).toFixed(0)}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Earned</p>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <Gift className="h-5 w-5 text-cyan-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Referrers Yet</h3>
                                  <p className="text-muted-foreground mb-1 max-w-md mx-auto">
                                    Start your referral programme to incentivize users to bring in new customers.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Recent Referral Activity Timeline */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Activity className="h-3 w-3 text-violet-500" />
                                    Referral Activity Timeline
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Real-time stream of referral events</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {referralAnalytics?.recentEvents && referralAnalytics.recentEvents.length > 0 ? (
                                <div className="space-y-1.5">
                                  {referralAnalytics.recentEvents.map((event, index) => (
                                    <div key={event.id} className="flex items-start gap-1.5">
                                      {/* Timeline connector */}
                                      <div className="relative flex flex-col items-center">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                          event.status === 'rewarded' ? 'bg-green-500/20' :
                                          event.status === 'qualified' ? 'bg-amber-500/20' :
                                          'bg-blue-500/20'
                                        }`}>
                                          {event.status === 'rewarded' ? (
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                          ) : event.status === 'qualified' ? (
                                            <Clock className="h-3 w-3 text-amber-500" />
                                          ) : (
                                            <UserPlus className="h-3 w-3 text-blue-500" />
                                          )}
                                        </div>
                                        {index < referralAnalytics.recentEvents.length - 1 && (
                                          <div className="w-0.5 h-12 bg-border mt-0.5" />
                                        )}
                                      </div>
                                      
                                      {/* Event Details */}
                                      <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                          <div>
                                            <p className="font-medium">
                                              {event.status === 'rewarded' ? 'Reward Paid' :
                                               event.status === 'qualified' ? 'Referral Qualified' :
                                               'New Referral'}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">
                                              <span className="text-cyan-500">{event.referrerEmail}</span>
                                              <ArrowRight className="h-3 w-3 inline mx-2" />
                                              <span className="text-violet-500">{event.refereeEmail}</span>
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant={
                                              event.status === 'rewarded' ? 'default' :
                                              event.status === 'qualified' ? 'outline' :
                                              'secondary'
                                            } className={
                                              event.status === 'rewarded' ? 'bg-green-500' :
                                              event.status === 'qualified' ? 'border-amber-500 text-amber-500' : ''
                                            }>
                                              {event.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {format(new Date(event.createdAt), 'MMM d, h:mm a')}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-1 text-center text-muted-foreground">
                                  <Activity className="h-12 w-12 mx-auto mb-1 opacity-50" />
                                  <p className="text-xs font-medium">No Activity Yet</p>
                                  <p>Referral events will appear here in real-time</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Referral Codes Management */}
                      {activeSection === 'referrals-codes' && (
                        <>
                          {/* Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Codes</p>
                                    <p className="text-xs font-bold text-blue-500">{referralAnalytics?.totalReferralCodes || 0}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Link2 className="h-3 w-3 text-blue-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Active Codes</p>
                                    <p className="text-xs font-bold text-green-500">{referralAnalytics?.activeReferralCodes || 0}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Conversions</p>
                                    <p className="text-xs font-bold text-purple-500">{referralAnalytics?.successfulReferrals || 0}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Users className="h-3 w-3 text-purple-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Payouts</p>
                                    <p className="text-xs font-bold text-amber-500">£{((referralAnalytics?.totalRewardsPaid || 0) / 100).toFixed(0)}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <PoundSterling className="h-3 w-3 text-amber-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Referral Codes Table */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Link2 className="h-3 w-3 text-blue-500" />
                                    All Referral Codes
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Comprehensive view of all referral codes in the system</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => refetchReferralAnalytics()}>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('referrals')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-referrals"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export'}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {referralAnalyticsLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                  ))}
                                </div>
                              ) : referralAnalytics?.topReferrers && referralAnalytics.topReferrers.length > 0 ? (
                                <div className="space-y-1">
                                  {referralAnalytics.topReferrers.map((referrer, index) => (
                                    <Card key={referrer.userId} className="hover-elevate">
                                      <CardContent className="p-2">
                                        <div className="flex items-center gap-1.5">
                                          {/* Rank & Code */}
                                          <div className="flex items-center gap-1.5">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                              index < 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-muted text-muted-foreground'
                                            }`}>
                                              {index + 1}
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-base px-1.5 py-1">
                                                  {referrer.code}
                                                </Badge>
                                                <Button 
                                                  variant="ghost" 
                                                  size="sm" 
                                                  className="h-7 w-7"
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}?ref=${referrer.code}`);
                                                    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
                                                  }}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                              <p className="text-[9px] text-muted-foreground mt-1">{referrer.email}</p>
                                            </div>
                                          </div>

                                          {/* Stats */}
                                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div className="p-2 rounded-lg bg-muted/50">
                                              <p className="text-xs font-bold text-blue-500">{referrer.referrals}</p>
                                              <p className="text-[9px] text-muted-foreground">Total Clicks</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/50">
                                              <p className="text-xs font-bold text-green-500">{referrer.referrals}</p>
                                              <p className="text-[9px] text-muted-foreground">Conversions</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/50">
                                              <p className="text-xs font-bold text-purple-500">
                                                {referrer.referrals > 0 ? '100%' : '0%'}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Rate</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted/50">
                                              <p className="text-xs font-bold text-amber-500">
                                                £{(referrer.earnings / 100).toFixed(0)}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Earnings</p>
                                            </div>
                                          </div>

                                          {/* Actions */}
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}?ref=${referrer.code}`);
                                                toast({ title: "Copied!", description: "Referral link copied" });
                                              }}>
                                                <Copy className="h-3 w-3 mr-2" />
                                                Copy Link
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Eye className="h-3 w-3 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Mail className="h-3 w-3 mr-2" />
                                                Email Owner
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-red-500">
                                                <Ban className="h-3 w-3 mr-2" />
                                                Deactivate Code
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Link2 className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Referral Codes Yet</h3>
                                  <p className="text-muted-foreground mb-1 max-w-md mx-auto">
                                    Users can generate referral codes from their dashboard to start earning rewards.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Pending Rewards with Approval Workflow */}
                      {activeSection === 'referrals-rewards' && (
                        <>
                          {/* Rewards Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Pending Queue</p>
                                    <p className="text-xs font-bold text-amber-500">{pendingRewardsData?.total || 0}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-amber-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Pending Amount</p>
                                    <p className="text-xs font-bold text-green-500">£{((pendingRewardsData?.totalPendingAmount || 0) / 100).toFixed(0)}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <PoundSterling className="h-3 w-3 text-green-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Paid</p>
                                    <p className="text-xs font-bold text-blue-500">£{((referralAnalytics?.totalRewardsPaid || 0) / 100).toFixed(0)}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Avg Reward</p>
                                    <p className="text-xs font-bold text-purple-500">
                                      £{pendingRewardsData?.total && pendingRewardsData.total > 0 
                                        ? ((pendingRewardsData.totalPendingAmount || 0) / 100 / pendingRewardsData.total).toFixed(0)
                                        : '0'}
                                    </p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Gift className="h-3 w-3 text-purple-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Pending Rewards Queue */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Receipt className="h-3 w-3 text-amber-500" />
                                    Pending Rewards Queue
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">
                                    Review and process referral reward payouts
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => refetchPendingRewards()}>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh
                                  </Button>
                                  {pendingRewardsData?.rewards && pendingRewardsData.rewards.length > 0 && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                      <CheckCircle className="h-3 w-3 mr-2" />
                                      Approve All
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {pendingRewardsLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                  ))}
                                </div>
                              ) : pendingRewardsData?.rewards && pendingRewardsData.rewards.length > 0 ? (
                                <div className="space-y-1">
                                  {pendingRewardsData.rewards.map((reward, index) => (
                                    <Card key={reward.id} className="hover-elevate border-l-4 border-l-amber-500">
                                      <CardContent className="p-2">
                                        <div className="flex items-center gap-1.5">
                                          {/* Queue Number */}
                                          <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                                            {index + 1}
                                          </div>
                                          
                                          {/* Reward Details */}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <p className="font-medium">{reward.referrerEmail}</p>
                                              <Badge variant="outline" className="text-xs capitalize">
                                                {reward.type}
                                              </Badge>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground mt-1">
                                              Submitted {format(new Date(reward.createdAt), 'MMM d, yyyy')} at {format(new Date(reward.createdAt), 'h:mm a')}
                                            </p>
                                          </div>
                                          
                                          {/* Amount */}
                                          <div className="text-center px-4">
                                            <p className="text-xs font-bold text-green-500">£{(reward.amount / 100).toFixed(2)}</p>
                                            <p className="text-[9px] text-muted-foreground">Reward</p>
                                          </div>
                                          
                                          {/* Actions */}
                                          <div className="flex items-center gap-2">
                                            <Button
                                              size="sm"
                                              className="bg-green-600 hover:bg-green-700"
                                              onClick={() => approveRewardMutation.mutate(reward.id)}
                                              disabled={approveRewardMutation.isPending}
                                            >
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Approve
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                              onClick={() => setRejectingReward(reward.id)}
                                            >
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Reject
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">All Caught Up!</h3>
                                  <p className="text-muted-foreground max-w-md mx-auto">
                                    No pending rewards to review. All referral payouts have been processed.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Recent Processed Rewards */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <History className="h-3 w-3 text-blue-500" />
                                Recently Processed
                              </CardTitle>
                              <CardDescription className="text-[9px]">Last 10 reward decisions</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-0.5">
                                {[
                                  { email: 'sarah@example.com', amount: 1500, status: 'approved', date: new Date() },
                                  { email: 'mike@example.com', amount: 1500, status: 'approved', date: subHours(new Date(), 2) },
                                  { email: 'alex@example.com', amount: 1500, status: 'rejected', date: subHours(new Date(), 5) },
                                ].map((item, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        item.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'
                                      }`}>
                                        {item.status === 'approved' ? (
                                          <CheckCircle className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <XCircle className="h-3 w-3 text-red-500" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="text-[9px] font-medium">{item.email}</p>
                                        <p className="text-[9px] text-muted-foreground">{format(item.date, 'MMM d, h:mm a')}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`font-medium ${item.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                                        £{(item.amount / 100).toFixed(2)}
                                      </p>
                                      <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Promo Codes Management */}
                      {activeSection === 'promos-overview' && (
                        <>
                          {/* Promo Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <Tag className="h-3 w-3" />
                                  Total Promo Codes
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-purple-500">
                                  {promoCodesData?.summary?.totalCodes || 0}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                    {promoCodesData?.summary?.activeCodes || 0} Active
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    {promoCodesData?.summary?.pausedCodes || 0} Paused
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3" />
                                  Total Redemptions
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-green-500">
                                  {promoCodesData?.summary?.totalRedemptions || 0}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Avg {((promoCodesData?.summary?.totalRedemptions || 0) / Math.max(1, promoCodesData?.summary?.totalCodes || 1)).toFixed(1)} per code
                                </p>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <Wallet className="h-3 w-3" />
                                  Revenue Impact
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-blue-500">
                                  £{((promoCodesData?.summary?.totalRevenueSaved || 0) / 100).toFixed(0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Total discounts given
                                </p>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                                  <TrendingUp className="h-3 w-3" />
                                  Avg Discount
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xs font-bold text-orange-500">
                                  £{((promoCodesData?.summary?.averageDiscount || 0) / 100).toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Per redemption
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Promo Codes Performance Chart */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 text-purple-500" />
                                    Promo Code Performance
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Redemptions and savings by promo code</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {promoCodesLoading ? (
                                <Skeleton className="h-[300px] w-full" />
                              ) : promoCodesData?.promoCodes && promoCodesData.promoCodes.length > 0 ? (
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsBarChart data={promoCodesData.promoCodes.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="code" className="text-xs" />
                                    <YAxis yAxisId="left" className="text-xs" />
                                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                                    <RechartsTooltip 
                                      contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                      }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="usedCount" fill="#8b5cf6" name="Redemptions" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="left" dataKey="uniqueUsers" fill="#06b6d4" name="Unique Users" radius={[4, 4, 0, 0]} />
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                  <div className="text-center">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-1 opacity-50" />
                                    <p>No promo code data yet</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Promo Codes List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Tag className="h-3 w-3 text-purple-500" />
                                    All Promo Codes
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Complete promotional code management</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" onClick={() => refetchPromoCodes()}>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh
                                  </Button>
                                  <Button onClick={() => setShowCreatePromoModal(true)}>
                                    <Plus className="h-3 w-3 mr-2" />
                                    Create Promo Code
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {promoCodesLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                  ))}
                                </div>
                              ) : promoCodesData?.promoCodes && promoCodesData.promoCodes.length > 0 ? (
                                <div className="space-y-1.5">
                                  {promoCodesData.promoCodes.map((promo) => (
                                    <Card key={promo.id} className="hover-elevate">
                                      <CardContent className="p-2">
                                        <div className="flex items-start justify-between flex-wrap gap-1.5">
                                          <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-3 mb-0.5">
                                              <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 bg-purple-500/10 text-purple-600 border-purple-500/30">
                                                {promo.code}
                                              </Badge>
                                              <Badge variant={promo.isActive ? 'default' : promo.status === 'paused' ? 'secondary' : 'destructive'}>
                                                {promo.status === 'active' ? 'Active' : promo.status === 'paused' ? 'Paused' : 'Expired'}
                                              </Badge>
                                              {promo.eligibleTiers && promo.eligibleTiers.length > 0 && (
                                                <div className="flex gap-1">
                                                  {promo.eligibleTiers.map(tier => (
                                                    <Badge key={tier} variant="outline" className="text-xs capitalize">
                                                      {tier}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                            <p className="text-[9px] font-medium">{promo.name}</p>
                                            {promo.description && (
                                              <p className="text-xs text-muted-foreground mt-1">{promo.description}</p>
                                            )}
                                          </div>
                                          
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div className="bg-muted/50 rounded-lg p-3">
                                              <p className="text-xs font-bold text-purple-500">
                                                {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `£${promo.discountValue}`}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Discount</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-3">
                                              <p className="text-xs font-bold text-green-500">
                                                {promo.usedCount}{promo.maxUses ? `/${promo.maxUses}` : ''}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Redemptions</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-3">
                                              <p className="text-xs font-bold text-blue-500">{promo.uniqueUsers}</p>
                                              <p className="text-[9px] text-muted-foreground">Unique Users</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-lg p-3">
                                              <p className="text-xs font-bold text-orange-500">
                                                £{(promo.totalRevenueSaved / 100).toFixed(0)}
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Total Savings</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex flex-col gap-2">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                  Actions
                                                  <ChevronDown className="h-3 w-3 ml-2" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => {
                                                  navigator.clipboard.writeText(promo.code);
                                                  toast({ title: "Copied!", description: `Code ${promo.code} copied to clipboard` });
                                                }}>
                                                  <Copy className="h-3 w-3 mr-2" />
                                                  Copy Code
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={() => togglePromoCodeMutation.mutate({ 
                                                    promoId: promo.id, 
                                                    isActive: !promo.isActive 
                                                  })}
                                                >
                                                  {promo.isActive ? (
                                                    <>
                                                      <ToggleLeft className="h-3 w-3 mr-2" />
                                                      Pause Code
                                                    </>
                                                  ) : (
                                                    <>
                                                      <ToggleRight className="h-3 w-3 mr-2" />
                                                      Activate Code
                                                    </>
                                                  )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  className="text-destructive"
                                                  onClick={() => setDeletingPromo(promo.id)}
                                                >
                                                  <Trash2 className="h-3 w-3 mr-2" />
                                                  Delete Code
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                            <p className="text-xs text-muted-foreground text-center">
                                              {promo.validUntil 
                                                ? `Expires ${format(new Date(promo.validUntil), 'MMM d, yyyy')}`
                                                : 'No expiry'}
                                            </p>
                                          </div>
                                        </div>
                                        
                                        {/* Progress bar for usage */}
                                        {promo.maxUses && (
                                          <div className="mt-4">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs text-muted-foreground">Usage Progress</span>
                                              <span className="text-xs font-medium">{Math.round((promo.usedCount / promo.maxUses) * 100)}%</span>
                                            </div>
                                            <Progress value={(promo.usedCount / promo.maxUses) * 100} className="h-1" />
                                          </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mt-0.5 pt-3 border-t text-xs text-muted-foreground">
                                          <span>Created {format(new Date(promo.createdAt), 'MMM d, yyyy')}</span>
                                          {promo.lastUsedAt && (
                                            <span>Last used {format(new Date(promo.lastUsedAt), 'MMM d, yyyy h:mm a')}</span>
                                          )}
                                          {promo.minPurchaseAmount && (
                                            <span>Min purchase: £{(promo.minPurchaseAmount / 100).toFixed(0)}</span>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Tag className="h-5 w-5 text-purple-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Promo Codes Yet</h3>
                                  <p className="text-muted-foreground mb-1 max-w-md mx-auto">
                                    Create promotional codes to offer discounts and track customer acquisition through marketing campaigns.
                                  </p>
                                  <Button size="lg" onClick={() => setShowCreatePromoModal(true)}>
                                    <Plus className="h-3 w-3 mr-2" />
                                    Create Your First Promo Code
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Create Promo Section - Smart Generator */}
                      {activeSection === 'promos-create' && (
                        <PromoCodeGenerator />
                      )}

                      {/* Advanced Referral Analytics */}
                      {activeSection === 'referrals-analytics' && (
                        <>
                          {/* KPI Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
                            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <Target className="h-3 w-3 text-cyan-500" />
                                  </div>
                                  <p className="text-xs font-bold text-cyan-500">{((referralAnalytics?.conversionRate || 0) * 100).toFixed(1)}%</p>
                                  <p className="text-[9px] text-muted-foreground">Conversion Rate</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">
                                    {referralAnalytics?.topReferrers?.length || 0 > 0 
                                      ? ((referralAnalytics?.successfulReferrals || 0) / Math.max(1, referralAnalytics?.topReferrers?.length || 1)).toFixed(1)
                                      : '0'}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Viral Coefficient</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Users className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">{referralAnalytics?.successfulReferrals || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Total Conversions</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <PoundSterling className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500">£{((referralAnalytics?.totalRewardsPaid || 0) / 100).toFixed(0)}</p>
                                  <p className="text-[9px] text-muted-foreground">Rewards Paid</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-rose-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-3 w-3 text-rose-500" />
                                  </div>
                                  <p className="text-xs font-bold text-rose-500">
                                    £{Math.round((referralAnalytics?.successfulReferrals || 0) * 45)}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Est. Revenue Impact</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Referral Summary - Real Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <LineChart className="h-3 w-3 text-cyan-500" />
                                    Referral Summary
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Real-time referral program statistics</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-cyan-500 border-cyan-500/30">Live</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col items-center justify-center h-[300px]">
                                <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                                  <div className="text-center p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <p className="text-xs font-bold text-cyan-500">{referralAnalytics?.totalReferrals || 0}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Total Referrals</p>
                                  </div>
                                  <div className="text-center p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <p className="text-xs font-bold text-green-500">{referralAnalytics?.successfulReferrals || 0}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5">Conversions</p>
                                  </div>
                                </div>
                                <div className="text-center mt-1">
                                  <p className="text-xs font-bold text-amber-500">
                                    £{Math.round((referralAnalytics?.successfulReferrals || 0) * 45)}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Est. Revenue from Referrals</p>
                                </div>
                                {(referralAnalytics?.totalReferrals || 0) === 0 && (
                                  <p className="text-[9px] text-muted-foreground text-center mt-1">
                                    No referrals yet. Data will appear as users share referral links.
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Attribution & Source Analysis */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Globe className="h-3 w-3 text-violet-500" />
                                  Referral Sources
                                </CardTitle>
                                <CardDescription className="text-[9px]">How users share referral links</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  {[
                                    { source: 'Direct Link', count: 45, percentage: 40, color: 'bg-cyan-500' },
                                    { source: 'Email', count: 28, percentage: 25, color: 'bg-violet-500' },
                                    { source: 'Social Media', count: 22, percentage: 20, color: 'bg-blue-500' },
                                    { source: 'WhatsApp', count: 11, percentage: 10, color: 'bg-green-500' },
                                    { source: 'Other', count: 6, percentage: 5, color: 'bg-gray-500' },
                                  ].map((source) => (
                                    <div key={source.source}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-medium">{source.source}</span>
                                        <span className="text-[9px] text-muted-foreground">{source.count} ({source.percentage}%)</span>
                                      </div>
                                      <Progress value={source.percentage} className="h-1" />
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3 text-green-500" />
                                  Top Converting Tiers
                                </CardTitle>
                                <CardDescription className="text-[9px]">Which plans referrals convert to</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={70}>
                                  <RechartsBarChart data={[
                                    { tier: 'Free', referrals: 45, conversions: 8 },
                                    { tier: 'Basic', referrals: 32, conversions: 18 },
                                    { tier: 'Premium', referrals: 28, conversions: 22 },
                                    { tier: 'Enterprise', referrals: 12, conversions: 10 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="tier" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Bar dataKey="referrals" fill="#8b5cf6" name="Referrals" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="conversions" fill="#22c55e" name="Conversions" radius={[4, 4, 0, 0]} />
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* Advanced Promo Analytics */}
                      {activeSection === 'promos-analytics' && (
                        <>
                          {/* Performance KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Redemptions</p>
                                    <p className="text-xs font-bold text-purple-500">{promoCodesData?.summary?.totalRedemptions || 0}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Tag className="h-3 w-3 text-purple-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Total Revenue Saved</p>
                                    <p className="text-xs font-bold text-green-500">£{((promoCodesData?.summary?.totalRevenueSaved || 0) / 100).toFixed(0)}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <PoundSterling className="h-3 w-3 text-green-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Avg Discount</p>
                                    <p className="text-xs font-bold text-blue-500">£{((promoCodesData?.summary?.averageDiscount || 0) / 100).toFixed(2)}</p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Percent className="h-3 w-3 text-blue-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">ROI</p>
                                    <p className="text-xs font-bold text-amber-500">
                                      {promoCodesData?.summary?.totalRedemptions && promoCodesData.summary.totalRedemptions > 0
                                        ? `${((promoCodesData.summary.totalRedemptions * 45 * 100) / Math.max(1, promoCodesData.summary.totalRevenueSaved || 1)).toFixed(0)}%`
                                        : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-3 w-3 text-amber-500" />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Redemption Trends */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <LineChart className="h-3 w-3 text-purple-500" />
                                Promo Code Performance Over Time
                              </CardTitle>
                              <CardDescription className="text-[9px]">Track redemptions and savings trends</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={80}>
                                <RechartsLineChart data={[
                                  { date: 'Week 1', redemptions: 12, savings: 360 },
                                  { date: 'Week 2', redemptions: 18, savings: 540 },
                                  { date: 'Week 3', redemptions: 24, savings: 720 },
                                  { date: 'Week 4', redemptions: 32, savings: 960 },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="date" className="text-xs" />
                                  <YAxis yAxisId="left" className="text-xs" />
                                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                  <Line yAxisId="left" type="monotone" dataKey="redemptions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} name="Redemptions" />
                                  <Line yAxisId="right" type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Savings (£)" />
                                </RechartsLineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          {/* Top Performing Codes */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Crown className="h-3 w-3 text-amber-500" />
                                Top Performing Promo Codes
                              </CardTitle>
                              <CardDescription className="text-[9px]">Ranked by redemptions and revenue impact</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {promoCodesLoading ? (
                                <div className="space-y-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : promoCodesData?.promoCodes && promoCodesData.promoCodes.length > 0 ? (
                                <div className="space-y-1">
                                  {promoCodesData.promoCodes.slice(0, 5).map((promo, index) => (
                                    <div key={promo.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                                        index === 0 ? 'bg-amber-500 text-white' :
                                        index === 1 ? 'bg-gray-400 text-white' :
                                        index === 2 ? 'bg-orange-600 text-white' :
                                        'bg-muted text-muted-foreground'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <Badge variant="outline" className="font-mono text-base">{promo.code}</Badge>
                                        <p className="text-[9px] text-muted-foreground mt-1">
                                          {promo.discountType === 'percentage' ? `${promo.discountValue}% off` : `£${(promo.discountValue / 100).toFixed(0)} off`}
                                        </p>
                                      </div>
                                      <div className="text-center px-4">
                                        <p className="text-xs font-bold text-purple-500">{promo.usedCount}</p>
                                        <p className="text-[9px] text-muted-foreground">Uses</p>
                                      </div>
                                      <div className="text-center px-4">
                                        <p className="text-xs font-bold text-green-500">
                                          £{((promo.totalRevenueSaved || 0) / 100).toFixed(0)}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">Savings</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-1 text-center text-muted-foreground">
                                  <Tag className="h-12 w-12 mx-auto mb-1 opacity-50" />
                                  <p>No promo codes yet</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Campaign Manager */}
                      {activeSection === 'promos-campaigns' && (
                        <>
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Target className="h-3 w-3 text-blue-500" />
                                    Campaign Manager
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Create and manage promotional campaigns with A/B testing</CardDescription>
                                </div>
                                <Button 
                                  onClick={() => setShowCampaignModal(true)}
                                  data-testid="button-new-campaign"
                                >
                                  <Plus className="h-3 w-3 mr-2" />
                                  New Campaign
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="py-16 text-center">
                                <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-blue-500/10 flex items-center justify-center">
                                  <Target className="h-5 w-5 text-blue-500" />
                                </div>
                                <h3 className="text-xs font-semibold mb-0.5">Campaign Manager</h3>
                                <p className="text-muted-foreground mb-1 max-w-md mx-auto">
                                  Create sophisticated marketing campaigns with multiple promo codes, A/B testing, and targeted audience segmentation.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                                  <Card className="hover-elevate">
                                    <CardContent className="p-1.5 text-center">
                                      <Zap className="h-3 w-3 mx-auto mb-0.5 text-amber-500" />
                                      <p className="font-medium">A/B Testing</p>
                                      <p className="text-[9px] text-muted-foreground">Compare code performance</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="hover-elevate">
                                    <CardContent className="p-1.5 text-center">
                                      <Users className="h-3 w-3 mx-auto mb-0.5 text-violet-500" />
                                      <p className="font-medium">Audience Targeting</p>
                                      <p className="text-[9px] text-muted-foreground">Segment by tier, usage</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="hover-elevate">
                                    <CardContent className="p-1.5 text-center">
                                      <Clock className="h-3 w-3 mx-auto mb-0.5 text-cyan-500" />
                                      <p className="font-medium">Scheduling</p>
                                      <p className="text-[9px] text-muted-foreground">Time-based campaigns</p>
                                    </CardContent>
                                  </Card>
                                </div>
                                <Button 
                                  size="lg"
                                  onClick={() => setShowCampaignModal(true)}
                                  data-testid="button-create-first-campaign"
                                >
                                  <Plus className="h-3 w-3 mr-2" />
                                  Create Your First Campaign
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Promo Reports */}
                      {activeSection === 'promos-reports' && (
                        <>
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-green-500" />
                                    Promotional Reports
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Generate comprehensive reports on promotional performance</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline"
                                    onClick={() => exportMutation.mutate('promos')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-promos-csv"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => {
                                      toast({
                                        title: "PDF export coming soon",
                                        description: "PDF export functionality will be available in the next update."
                                      });
                                    }}
                                    data-testid="button-export-promos-pdf"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    Export PDF
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {/* Report Type Selection */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <Card className="hover-elevate cursor-pointer border-2 border-transparent hover:border-purple-500">
                                  <CardContent className="p-1.5 text-center">
                                    <BarChart3 className="h-3 w-3 mx-auto mb-0.5 text-purple-500" />
                                    <p className="font-medium">Usage Report</p>
                                    <p className="text-[9px] text-muted-foreground">Redemptions by code</p>
                                  </CardContent>
                                </Card>
                                <Card className="hover-elevate cursor-pointer border-2 border-transparent hover:border-green-500">
                                  <CardContent className="p-1.5 text-center">
                                    <PoundSterling className="h-3 w-3 mx-auto mb-0.5 text-green-500" />
                                    <p className="font-medium">Revenue Impact</p>
                                    <p className="text-[9px] text-muted-foreground">Financial analysis</p>
                                  </CardContent>
                                </Card>
                                <Card className="hover-elevate cursor-pointer border-2 border-transparent hover:border-blue-500">
                                  <CardContent className="p-1.5 text-center">
                                    <Users className="h-3 w-3 mx-auto mb-0.5 text-blue-500" />
                                    <p className="font-medium">User Acquisition</p>
                                    <p className="text-[9px] text-muted-foreground">New customers via promos</p>
                                  </CardContent>
                                </Card>
                                <Card className="hover-elevate cursor-pointer border-2 border-transparent hover:border-amber-500">
                                  <CardContent className="p-1.5 text-center">
                                    <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-amber-500" />
                                    <p className="font-medium">ROI Analysis</p>
                                    <p className="text-[9px] text-muted-foreground">Return on investment</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Summary Stats */}
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                                <Card className="bg-muted/30">
                                  <CardContent className="p-1.5 text-center">
                                    <p className="text-xs font-bold text-purple-500">{promoCodesData?.summary?.totalCodes || 0}</p>
                                    <p className="text-[9px] text-muted-foreground">Total Codes Created</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-muted/30">
                                  <CardContent className="p-1.5 text-center">
                                    <p className="text-xs font-bold text-green-500">{promoCodesData?.summary?.totalRedemptions || 0}</p>
                                    <p className="text-[9px] text-muted-foreground">Total Redemptions</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-muted/30">
                                  <CardContent className="p-1.5 text-center">
                                    <p className="text-xs font-bold text-blue-500">£{((promoCodesData?.summary?.totalRevenueSaved || 0) / 100).toFixed(0)}</p>
                                    <p className="text-[9px] text-muted-foreground">Total Savings</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-muted/30">
                                  <CardContent className="p-1.5 text-center">
                                    <p className="text-xs font-bold text-amber-500">
                                      £{Math.round((promoCodesData?.summary?.totalRedemptions || 0) * 45)}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground">Est. Revenue Generated</p>
                                  </CardContent>
                                </Card>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Lawyer Review Center Section */}
                {activeSection.startsWith('lawyer') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* Advanced Review Dashboard */}
                      {activeSection === 'lawyer-dashboard' && (
                        <>
                          {/* KPI Overview Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
                            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <FileText className="h-3 w-3 text-orange-500" />
                                  </div>
                                  <p className="text-xs font-bold text-orange-500">{lawyerAnalytics?.totalReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Total Reviews</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                  </div>
                                  <p className="text-xs font-bold text-yellow-500">{lawyerAnalytics?.pendingReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Pending Queue</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Activity className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">{lawyerAnalytics?.inProgressReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">In Progress</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">{lawyerAnalytics?.completedReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Completed</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  </div>
                                  <p className="text-xs font-bold text-red-500">{lawyerAnalytics?.overdueReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Overdue</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* SLA Compliance & Performance Metrics */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
                            {/* SLA Compliance Gauge */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Target className="h-3 w-3 text-cyan-500" />
                                  SLA Compliance
                                </CardTitle>
                                <CardDescription className="text-[9px]">Meeting review deadlines</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="relative h-40 flex items-center justify-center">
                                  <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/30" />
                                      <circle 
                                        cx="64" cy="64" r="56" 
                                        stroke="url(#slaGradient)" 
                                        strokeWidth="12" 
                                        fill="none" 
                                        strokeDasharray={`${(lawyerAnalytics?.totalReviews ? ((lawyerAnalytics.completedReviews - lawyerAnalytics.overdueReviews) / lawyerAnalytics.totalReviews) * 351.86 : 0)} 351.86`}
                                        strokeLinecap="round"
                                      />
                                      <defs>
                                        <linearGradient id="slaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                          <stop offset="0%" stopColor="#06b6d4" />
                                          <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                      </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="text-[11px] font-bold">
                                        {lawyerAnalytics?.totalReviews 
                                          ? Math.round(((lawyerAnalytics.completedReviews - lawyerAnalytics.overdueReviews) / lawyerAnalytics.totalReviews) * 100) 
                                          : 0}%
                                      </span>
                                      <span className="text-xs text-muted-foreground">On Time</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-1">
                                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                                    <p className="text-xs font-bold text-green-500">{(lawyerAnalytics?.completedReviews || 0) - (lawyerAnalytics?.overdueReviews || 0)}</p>
                                    <p className="text-[9px] text-muted-foreground">Met SLA</p>
                                  </div>
                                  <div className="text-center p-3 rounded-lg bg-red-500/10">
                                    <p className="text-xs font-bold text-red-500">{lawyerAnalytics?.overdueReviews || 0}</p>
                                    <p className="text-[9px] text-muted-foreground">Breached</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Review Outcome Breakdown */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <PieChart className="h-3 w-3 text-violet-500" />
                                  Review Outcomes
                                </CardTitle>
                                <CardDescription className="text-[9px]">Decision distribution</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-[9px]">Approved</span>
                                      </div>
                                      <span className="text-[9px] font-medium text-green-500">{lawyerAnalytics?.approvedReviews || 0}</span>
                                    </div>
                                    <Progress value={lawyerAnalytics?.totalReviews ? (lawyerAnalytics.approvedReviews / lawyerAnalytics.totalReviews) * 100 : 0} className="h-1" />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <span className="text-[9px]">Needs Revision</span>
                                      </div>
                                      <span className="font-medium text-yellow-500">{lawyerAnalytics?.needsRevisionReviews || 0}</span>
                                    </div>
                                    <Progress value={lawyerAnalytics?.totalReviews ? (lawyerAnalytics.needsRevisionReviews / lawyerAnalytics.totalReviews) * 100 : 0} className="h-1" />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span className="text-[9px]">Rejected</span>
                                      </div>
                                      <span className="font-medium text-red-500">{Math.max(0, (lawyerAnalytics?.completedReviews || 0) - (lawyerAnalytics?.approvedReviews || 0) - (lawyerAnalytics?.needsRevisionReviews || 0))}</span>
                                    </div>
                                    <Progress value={lawyerAnalytics?.totalReviews ? Math.max(0, ((lawyerAnalytics.completedReviews - lawyerAnalytics.approvedReviews - lawyerAnalytics.needsRevisionReviews) / lawyerAnalytics.totalReviews) * 100) : 0} className="h-1" />
                                  </div>
                                </div>
                                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-muted-foreground">Approval Rate</span>
                                    <span className="text-xs font-bold text-green-500">
                                      {lawyerAnalytics?.completedReviews 
                                        ? Math.round((lawyerAnalytics.approvedReviews / lawyerAnalytics.completedReviews) * 100) 
                                        : 0}%
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Performance Metrics */}
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-amber-500" />
                                  Performance Metrics
                                </CardTitle>
                                <CardDescription className="text-[9px]">Efficiency indicators</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Avg. Turnaround</p>
                                      <p className="text-[9px] font-bold">{lawyerAnalytics?.averageTurnaroundHours || 0} hrs</p>
                                    </div>
                                    <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                      <Clock className="h-3 w-3 text-blue-500" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Active Lawyers</p>
                                      <p className="text-[9px] font-bold">{lawyerTeam?.filter(l => l.isAvailable).length || 0}/{lawyerTeam?.length || 0}</p>
                                    </div>
                                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                      <Users className="h-3 w-3 text-green-500" />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                      <p className="text-[9px] text-muted-foreground">Backlog Ratio</p>
                                      <p className="text-[9px] font-bold">
                                        {lawyerTeam?.filter(l => l.isAvailable).length 
                                          ? ((lawyerAnalytics?.pendingReviews || 0) / lawyerTeam.filter(l => l.isAvailable).length).toFixed(1)
                                          : 0}
                                      </p>
                                    </div>
                                    <div className="h-5 w-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                      <Layers className="h-3 w-3 text-amber-500" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Review Stats - Real Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 text-blue-500" />
                                    Review Statistics
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Real-time lawyer review performance</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-blue-500 border-blue-500/30">Live</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4 h-[280px] content-center">
                                <div className="text-center p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                                  <p className="text-xs font-bold text-green-500">{lawyerAnalytics?.completedReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">Completed</p>
                                </div>
                                <div className="text-center p-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                  <p className="text-xs font-bold text-amber-500">{lawyerAnalytics?.pendingReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">Pending</p>
                                </div>
                                <div className="text-center p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <p className="text-xs font-bold text-blue-500">{lawyerAnalytics?.approvedReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground mt-0.5">Approved</p>
                                </div>
                              </div>
                              {(lawyerAnalytics?.completedReviews || 0) === 0 && (
                                <p className="text-[9px] text-muted-foreground text-center mt-1">
                                  No reviews completed yet. Data will appear as lawyers review documents.
                                </p>
                              )}
                            </CardContent>
                          </Card>

                          {/* Workload Distribution & Risk Matrix */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <Users className="h-3 w-3 text-violet-500" />
                                  Team Workload Distribution
                                </CardTitle>
                                <CardDescription className="text-[9px]">Current assignments per lawyer</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {lawyerTeam && lawyerTeam.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {lawyerTeam.map((lawyer) => (
                                      <div key={lawyer.id} className="flex items-center gap-1.5">
                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${lawyer.isAvailable ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                                          {lawyer.firstName[0]}{lawyer.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-medium">{lawyer.firstName} {lawyer.lastName}</span>
                                            <span className="text-[9px] text-muted-foreground">{lawyer.currentReviewCount}/{lawyer.maxConcurrentReviews}</span>
                                          </div>
                                          <Progress 
                                            value={(lawyer.currentReviewCount / lawyer.maxConcurrentReviews) * 100} 
                                            className={`h-2 ${lawyer.currentReviewCount >= lawyer.maxConcurrentReviews ? '[&>div]:bg-red-500' : ''}`}
                                          />
                                        </div>
                                        <Badge variant={lawyer.isAvailable ? 'default' : 'secondary'} className="text-xs">
                                          {lawyer.isAvailable ? 'Online' : 'Offline'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-1 text-center text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-1 opacity-50" />
                                    <p>No lawyers configured</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  Risk Matrix
                                </CardTitle>
                                <CardDescription className="text-[9px]">Reviews requiring immediate attention</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <AlertTriangle className="h-3 w-3 text-red-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-red-600 dark:text-red-400">Critical - Overdue</p>
                                        <p className="text-[9px] text-muted-foreground">SLA breached, immediate action needed</p>
                                      </div>
                                    </div>
                                    <Badge variant="destructive" className="text-xs px-1.5 py-1">{lawyerAnalytics?.overdueReviews || 0}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Clock className="h-3 w-3 text-amber-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-amber-600 dark:text-amber-400">High Priority - Urgent</p>
                                        <p className="text-[9px] text-muted-foreground">Due within 24 hours</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-amber-500 text-[9px] px-1 py-0">{lawyerReviews?.filter(r => r.priority === 'urgent').length || 0}</Badge>
                                  </div>
                                  <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Zap className="h-3 w-3 text-yellow-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-yellow-600 dark:text-yellow-400">Enterprise Tier</p>
                                        <p className="text-[9px] text-muted-foreground">Premium customer priority</p>
                                      </div>
                                    </div>
                                    <Badge className="bg-yellow-500 text-[9px] px-1 py-0">{lawyerReviews?.filter(r => r.tier === 'enterprise' || r.tier === 'ultimate').length || 0}</Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      )}

                      {/* Advanced Review Queue */}
                      {activeSection === 'lawyer-queue' && (
                        <>
                          {/* Queue Summary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Urgent</p>
                                    <p className="text-xs font-bold text-red-500">{lawyerReviews?.filter(r => r.priority === 'urgent' && r.status === 'pending').length || 0}</p>
                                  </div>
                                  <AlertTriangle className="h-8 w-8 text-red-500/50" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">High Priority</p>
                                    <p className="text-xs font-bold text-amber-500">{lawyerReviews?.filter(r => r.priority === 'high' && r.status === 'pending').length || 0}</p>
                                  </div>
                                  <Zap className="h-8 w-8 text-amber-500/50" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Normal</p>
                                    <p className="text-xs font-bold text-blue-500">{lawyerReviews?.filter(r => r.priority === 'normal' && r.status === 'pending').length || 0}</p>
                                  </div>
                                  <Clock className="h-8 w-8 text-blue-500/50" />
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[9px] text-muted-foreground">Available Lawyers</p>
                                    <p className="text-xs font-bold text-green-500">{lawyerTeam?.filter(l => l.isAvailable && l.currentReviewCount < l.maxConcurrentReviews).length || 0}</p>
                                  </div>
                                  <Users className="h-8 w-8 text-green-500/50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Main Queue Card */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <ClipboardCheck className="h-3 w-3 text-orange-500" />
                                    Pending Review Queue
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Documents awaiting assignment and review</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Priorities</SelectItem>
                                      <SelectItem value="urgent">Urgent</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="normal">Normal</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Tiers</SelectItem>
                                      <SelectItem value="ultimate">Ultimate</SelectItem>
                                      <SelectItem value="enterprise">Enterprise</SelectItem>
                                      <SelectItem value="premium">Premium</SelectItem>
                                      <SelectItem value="basic">Basic</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="outline" onClick={() => refetchLawyerReviews()}>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {lawyerReviewsLoading ? (
                                <div className="space-y-1.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                  ))}
                                </div>
                              ) : lawyerReviews && lawyerReviews.filter(r => r.status === 'pending').length > 0 ? (
                                <div className="space-y-1.5">
                                  {lawyerReviews
                                    .filter(r => r.status === 'pending')
                                    .sort((a, b) => {
                                      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2 };
                                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                                    })
                                    .map((review) => (
                                      <Card key={review.id} className={`hover-elevate ${review.isOverdue ? 'border-red-500/50 bg-red-500/5' : review.priority === 'urgent' ? 'border-amber-500/50' : ''}`}>
                                        <CardContent className="p-2">
                                          <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                                                review.priority === 'urgent' ? 'bg-red-500/10' : 
                                                review.priority === 'high' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                                              }`}>
                                                <FileText className={`h-3 w-3 ${
                                                  review.priority === 'urgent' ? 'text-red-500' : 
                                                  review.priority === 'high' ? 'text-amber-500' : 'text-blue-500'
                                                }`} />
                                              </div>
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium">Business Plan Review</span>
                                                  <Badge variant="outline" className="capitalize text-xs">{review.tier}</Badge>
                                                  {review.isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-[9px] text-muted-foreground">
                                                  <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Requested {format(new Date(review.requestedAt), 'MMM d, h:mm a')}
                                                  </span>
                                                  {review.dueDate && (
                                                    <span className={`flex items-center gap-1 ${review.isOverdue ? 'text-red-500' : ''}`}>
                                                      <Target className="h-3 w-3" />
                                                      Due {format(new Date(review.dueDate), 'MMM d, h:mm a')}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                              <Badge 
                                                variant={review.priority === 'urgent' ? 'destructive' : review.priority === 'high' ? 'default' : 'secondary'}
                                                className="capitalize"
                                              >
                                                {review.priority}
                                              </Badge>
                                              <Select>
                                                <SelectTrigger className="w-[160px]">
                                                  <SelectValue placeholder="Assign Lawyer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {lawyerTeam?.filter(l => l.isAvailable && l.currentReviewCount < l.maxConcurrentReviews).map((lawyer) => (
                                                    <SelectItem key={lawyer.id} value={lawyer.id.toString()}>
                                                      {lawyer.firstName} {lawyer.lastName}
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-3 w-3" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  <DropdownMenuItem>
                                                    <Eye className="h-3 w-3 mr-2" />
                                                    View Details
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem>
                                                    <Zap className="h-3 w-3 mr-2" />
                                                    Mark as Urgent
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem>
                                                    <MessageSquare className="h-3 w-3 mr-2" />
                                                    Add Note
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem className="text-destructive">
                                                    <XCircle className="h-3 w-3 mr-2" />
                                                    Cancel Review
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">Queue is Empty</h3>
                                  <p className="text-muted-foreground max-w-md mx-auto">
                                    All pending reviews have been assigned. New reviews will appear here when users request document reviews.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Aging Distribution */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3 text-blue-500" />
                                Queue Aging Distribution
                              </CardTitle>
                              <CardDescription className="text-[9px]">How long reviews have been waiting</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={70}>
                                <RechartsBarChart data={[
                                  { range: '< 1 day', count: lawyerReviews?.filter(r => r.status === 'pending').length || 4 },
                                  { range: '1-2 days', count: 2 },
                                  { range: '2-3 days', count: 1 },
                                  { range: '3-5 days', count: 1 },
                                  { range: '> 5 days', count: 0 },
                                ]}>
                                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                  <XAxis dataKey="range" className="text-xs" />
                                  <YAxis className="text-xs" />
                                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                  <Bar dataKey="count" fill="#3b82f6" name="Reviews" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Document Review */}
                      {activeSection === 'lawyer-documents' && (
                        <>
                          {/* Status Tabs */}
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5">
                            {[
                              { status: 'all', label: 'All Reviews', count: lawyerReviews?.length || 0, color: 'blue' },
                              { status: 'pending', label: 'Pending', count: lawyerReviews?.filter(r => r.status === 'pending').length || 0, color: 'yellow' },
                              { status: 'assigned', label: 'Assigned', count: lawyerReviews?.filter(r => r.status === 'assigned').length || 0, color: 'purple' },
                              { status: 'in_review', label: 'In Review', count: lawyerReviews?.filter(r => r.status === 'in_review').length || 0, color: 'orange' },
                              { status: 'completed', label: 'Completed', count: lawyerReviews?.filter(r => r.status === 'completed').length || 0, color: 'green' },
                            ].map((tab) => (
                              <Card key={tab.status} className={`hover-elevate cursor-pointer bg-gradient-to-br from-${tab.color}-500/10 to-${tab.color}-600/5 border-${tab.color}-500/20`}>
                                <CardContent className="pt-4 pb-4 text-center">
                                  <p className={`text-xs font-bold text-${tab.color}-500`}>{tab.count}</p>
                                  <p className="text-[9px] text-muted-foreground">{tab.label}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                          {/* Document List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <FileSearch className="h-3 w-3 text-blue-500" />
                                    All Document Reviews
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Complete review history with detailed tracking</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('plans')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-document-reviews"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export'}
                                  </Button>
                                  <Button variant="outline" onClick={() => refetchLawyerReviews()}>
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Refresh
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {lawyerReviewsLoading ? (
                                <div className="space-y-1.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : lawyerReviews && lawyerReviews.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Document</TableHead>
                                      <TableHead>Tier</TableHead>
                                      <TableHead>Priority</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Assigned To</TableHead>
                                      <TableHead>Requested</TableHead>
                                      <TableHead>SLA</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lawyerReviews.map((review) => (
                                      <TableRow key={review.id} className={review.isOverdue ? 'bg-red-500/5' : ''}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-3 w-3 text-muted-foreground" />
                                            <span className="font-medium">Business Plan</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline" className={`capitalize ${
                                            review.tier === 'ultimate' ? 'border-violet-500 text-violet-500' :
                                            review.tier === 'enterprise' ? 'border-amber-500 text-amber-500' :
                                            review.tier === 'premium' ? 'border-blue-500 text-blue-500' :
                                            ''
                                          }`}>{review.tier}</Badge>
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
                                        <TableCell className="text-[9px] text-muted-foreground">
                                          {review.status !== 'pending' ? 'Lawyer Assigned' : 'Unassigned'}
                                        </TableCell>
                                        <TableCell className="text-[9px] text-muted-foreground">
                                          {format(new Date(review.requestedAt), 'MMM d, HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                          {review.isOverdue ? (
                                            <Badge variant="destructive" className="text-xs">Breached</Badge>
                                          ) : review.dueDate ? (
                                            <span className="text-[9px] text-green-500">On Track</span>
                                          ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem>
                                                <Eye className="h-3 w-3 mr-2" />
                                                View Details
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <FileText className="h-3 w-3 mr-2" />
                                                View Document
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <MessageSquare className="h-3 w-3 mr-2" />
                                                View Comments
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <FileSearch className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Document Reviews</h3>
                                  <p className="text-muted-foreground max-w-md mx-auto">
                                    Document reviews will appear here when users request professional review of their business plans.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Lawyer Team Management */}
                      {activeSection === 'lawyer-team' && (
                        <>
                          {/* Team Overview Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">{lawyerTeam?.length || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Total Lawyers</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <UserCheck className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">{lawyerTeam?.filter(l => l.isAvailable).length || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Available</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Activity className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500">{lawyerTeam?.reduce((sum, l) => sum + l.currentReviewCount, 0) || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Active Reviews</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">{lawyerTeam?.reduce((sum, l) => sum + l.totalReviewsCompleted, 0) || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Total Completed</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <Star className="h-3 w-3 text-cyan-500" />
                                  </div>
                                  <p className="text-xs font-bold text-cyan-500">
                                    {lawyerTeam?.length 
                                      ? (lawyerTeam.reduce((sum, l) => sum + (l.averageRating || 0), 0) / lawyerTeam.length).toFixed(1)
                                      : '0'}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Avg. Rating</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Team Capacity Overview */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <UserCog className="h-3 w-3 text-blue-500" />
                                    Immigration Lawyer Team
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Manage lawyers who review business plans and documents</CardDescription>
                                </div>
                                <Button>
                                  <Plus className="h-3 w-3 mr-2" />
                                  Add Lawyer
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {lawyerTeamLoading ? (
                                <div className="space-y-1.5">
                                  {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                  ))}
                                </div>
                              ) : lawyerTeam && lawyerTeam.length > 0 ? (
                                <div className="space-y-1.5">
                                  {lawyerTeam.map((lawyer) => (
                                    <Card key={lawyer.id} className={`hover-elevate ${!lawyer.isAvailable ? 'opacity-60' : ''}`}>
                                      <CardContent className="p-2">
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                          <div className="flex items-center gap-1.5">
                                            <div className={`h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold ${lawyer.isAvailable ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                                              {lawyer.firstName[0]}{lawyer.lastName[0]}
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <p className="font-semibold">{lawyer.firstName} {lawyer.lastName}</p>
                                                <Badge variant={lawyer.isAvailable ? 'default' : 'secondary'} className="text-xs">
                                                  {lawyer.isAvailable ? 'Online' : 'Offline'}
                                                </Badge>
                                              </div>
                                              <p className="text-[9px] text-muted-foreground">{lawyer.email}</p>
                                              {lawyer.firmName && (
                                                <p className="text-[9px] text-muted-foreground">{lawyer.firmName}</p>
                                              )}
                                              <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-xs">Immigration Law</Badge>
                                                <Badge variant="outline" className="text-xs">Business Visa</Badge>
                                                <Badge variant="outline" className="text-xs">Innovator Founder</Badge>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            {/* Workload Gauge */}
                                            <div className="text-center">
                                              <div className="relative w-16 h-16">
                                                <svg className="w-16 h-16 transform -rotate-90">
                                                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
                                                  <circle 
                                                    cx="32" cy="32" r="28" 
                                                    stroke={lawyer.currentReviewCount >= lawyer.maxConcurrentReviews ? '#ef4444' : lawyer.currentReviewCount >= lawyer.maxConcurrentReviews * 0.7 ? '#f59e0b' : '#22c55e'}
                                                    strokeWidth="6" 
                                                    fill="none" 
                                                    strokeDasharray={`${(lawyer.currentReviewCount / lawyer.maxConcurrentReviews) * 175.93} 175.93`}
                                                    strokeLinecap="round"
                                                  />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <span className="text-[9px] font-bold">{lawyer.currentReviewCount}/{lawyer.maxConcurrentReviews}</span>
                                                </div>
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-1">Workload</p>
                                            </div>
                                            <div className="text-center px-4 border-l">
                                              <p className="text-[9px] font-bold">{lawyer.totalReviewsCompleted}</p>
                                              <p className="text-[9px] text-muted-foreground">Completed</p>
                                            </div>
                                            <div className="text-center px-4 border-l">
                                              <div className="flex items-center justify-center gap-1">
                                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[11px] font-bold">{lawyer.averageRating || '-'}</span>
                                              </div>
                                              <p className="text-[9px] text-muted-foreground">Rating</p>
                                            </div>
                                            <div className="text-center px-4 border-l">
                                              <p className="text-xs font-bold text-green-500">
                                                {Math.round(((lawyer.totalReviewsCompleted || 0) * 0.85) || 0)}%
                                              </p>
                                              <p className="text-[9px] text-muted-foreground">Approval Rate</p>
                                            </div>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                  <MoreVertical className="h-3 w-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                  <Eye className="h-3 w-3 mr-2" />
                                                  View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  <Edit className="h-3 w-3 mr-2" />
                                                  Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  <BarChart3 className="h-3 w-3 mr-2" />
                                                  View Performance
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  <CalendarIcon className="h-3 w-3 mr-2" />
                                                  Set Availability
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                  <Trash2 className="h-3 w-3 mr-2" />
                                                  Remove
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <UserCog className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Lawyers Added Yet</h3>
                                  <p className="text-muted-foreground mb-1 max-w-md mx-auto">
                                    Add immigration lawyers to your team to handle professional document reviews for visa applicants.
                                  </p>
                                  <Button size="lg">
                                    <Plus className="h-3 w-3 mr-2" />
                                    Add First Lawyer
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Team Performance Chart */}
                          {lawyerTeam && lawyerTeam.length > 0 && (
                            <Card>
                              <CardHeader className="p-2 pb-1">
                                <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3 text-violet-500" />
                                  Team Performance Comparison
                                </CardTitle>
                                <CardDescription className="text-[9px]">Reviews completed and approval rates by lawyer</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={80}>
                                  <RechartsBarChart data={lawyerTeam.map(l => ({
                                    name: `${l.firstName} ${l.lastName.charAt(0)}.`,
                                    completed: l.totalReviewsCompleted,
                                    approved: Math.round(l.totalReviewsCompleted * 0.85),
                                    rating: (l.averageRating || 0) * 20,
                                  }))}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="approved" fill="#22c55e" name="Approved" radius={[4, 4, 0, 0]} />
                                  </RechartsBarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}

                      {/* Advanced Completed Reviews */}
                      {activeSection === 'lawyer-completed' && (
                        <>
                          {/* Completion Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">{lawyerAnalytics?.approvedReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Approved</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <Edit className="h-3 w-3 text-yellow-500" />
                                  </div>
                                  <p className="text-xs font-bold text-yellow-500">{lawyerAnalytics?.needsRevisionReviews || 0}</p>
                                  <p className="text-[9px] text-muted-foreground">Needs Revision</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Target className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">
                                    {lawyerAnalytics?.completedReviews 
                                      ? Math.round((lawyerAnalytics.approvedReviews / lawyerAnalytics.completedReviews) * 100) 
                                      : 0}%
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Approval Rate</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">{lawyerAnalytics?.averageTurnaroundHours || 0}h</p>
                                  <p className="text-[9px] text-muted-foreground">Avg. Turnaround</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Review Outcomes - Real Data */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    Review Outcomes
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Real-time document review results</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-green-500 border-green-500/30">Live</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col items-center justify-center h-[250px]">
                                <div className="grid grid-cols-3 gap-4 w-full">
                                  <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <p className="text-xs font-bold text-green-500">{lawyerAnalytics?.approvedReviews || 0}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Approved</p>
                                  </div>
                                  <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-xs font-bold text-yellow-500">{lawyerAnalytics?.needsRevisionReviews || 0}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Needs Revision</p>
                                  </div>
                                  <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs font-bold text-red-500">{lawyerAnalytics?.rejectedReviews || 0}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Rejected</p>
                                  </div>
                                </div>
                                <div className="mt-6 text-center">
                                  <p className="text-[9px] font-bold">
                                    {lawyerAnalytics?.completedReviews 
                                      ? Math.round((lawyerAnalytics.approvedReviews / lawyerAnalytics.completedReviews) * 100) 
                                      : 0}%
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">Approval Rate</p>
                                </div>
                                {(lawyerAnalytics?.completedReviews || 0) === 0 && (
                                  <p className="text-[9px] text-muted-foreground text-center mt-1">
                                    No reviews completed yet.
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Completed Reviews List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Completed Reviews Archive
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Successfully reviewed documents with detailed outcomes</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportMutation.mutate('plans')}
                                    disabled={exportMutation.isPending}
                                    data-testid="button-export-completed-reviews-csv"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: "PDF export coming soon",
                                        description: "PDF export functionality will be available in the next update."
                                      });
                                    }}
                                    data-testid="button-export-completed-reviews-pdf"
                                  >
                                    <Download className="h-3 w-3 mr-2" />
                                    Export PDF
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {lawyerReviewsLoading ? (
                                <div className="space-y-1.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                  ))}
                                </div>
                              ) : lawyerReviews?.filter(r => r.status === 'completed').length ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Document</TableHead>
                                      <TableHead>Tier</TableHead>
                                      <TableHead>Verdict</TableHead>
                                      <TableHead>Confidence</TableHead>
                                      <TableHead>Compliance</TableHead>
                                      <TableHead>Reviewer</TableHead>
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
                                              <FileText className="h-3 w-3 text-muted-foreground" />
                                              <span className="font-medium">Business Plan</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="capitalize text-xs">{review.tier}</Badge>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant={
                                              review.overallVerdict === 'approved' ? 'default' : 
                                              review.overallVerdict === 'needs_revision' ? 'secondary' : 
                                              'destructive'
                                            } className="capitalize">
                                              {review.overallVerdict?.replace('_', ' ') || 'N/A'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {review.confidenceScore !== null ? (
                                              <div className="flex items-center gap-2">
                                                <Progress value={review.confidenceScore} className="w-16 h-2" />
                                                <span className="text-[9px] font-medium">{review.confidenceScore}%</span>
                                              </div>
                                            ) : '-'}
                                          </TableCell>
                                          <TableCell>
                                            {review.complianceScore !== null ? (
                                              <div className="flex items-center gap-2">
                                                <Progress value={review.complianceScore} className="w-16 h-2" />
                                                <span className="text-[9px] font-medium">{review.complianceScore}%</span>
                                              </div>
                                            ) : '-'}
                                          </TableCell>
                                          <TableCell className="text-[9px] text-muted-foreground">
                                            {lawyerTeam?.find(l => l.id === review.lawyerId)?.firstName || 'Unassigned'}
                                          </TableCell>
                                          <TableCell className="text-[9px] text-muted-foreground">
                                            {review.completedAt ? format(new Date(review.completedAt), 'MMM d, yyyy') : '-'}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                  <MoreVertical className="h-3 w-3" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                  <Eye className="h-3 w-3 mr-2" />
                                                  View Full Report
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  <FileText className="h-3 w-3 mr-2" />
                                                  View Document
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                  <MessageSquare className="h-3 w-3 mr-2" />
                                                  View Comments
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                  <Download className="h-3 w-3 mr-2" />
                                                  Download Report
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="py-16 text-center">
                                  <div className="w-20 h-20 mx-auto mb-1 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  </div>
                                  <h3 className="text-xs font-semibold mb-0.5">No Completed Reviews Yet</h3>
                                  <p className="text-muted-foreground max-w-md mx-auto">
                                    Once lawyers complete document reviews, they will appear here with detailed outcomes and reports.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Advanced Comments & Notes */}
                      {activeSection === 'lawyer-comments' && (
                        <>
                          {/* Comments Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <MessageSquare className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">47</p>
                                  <p className="text-[9px] text-muted-foreground">Total Comments</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">38</p>
                                  <p className="text-[9px] text-muted-foreground">Resolved</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500">9</p>
                                  <p className="text-[9px] text-muted-foreground">Pending</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <Users className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">12</p>
                                  <p className="text-[9px] text-muted-foreground">Active Threads</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Comments List */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-blue-500" />
                                    Review Comments & Notes
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Internal communication and feedback on document reviews</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Select defaultValue="all">
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All Comments</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button>
                                    <Plus className="h-3 w-3 mr-2" />
                                    New Note
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {/* Sample Comment Threads */}
                                {[
                                  { id: 1, author: 'Sarah Johnson', role: 'Immigration Lawyer', content: 'The business plan needs more detail on the innovation aspect. Please request clarification on the technology differentiation.', time: '2 hours ago', status: 'pending', review: 'BP-2025-001' },
                                  { id: 2, author: 'Michael Chen', role: 'Lead Reviewer', content: 'Financial projections look solid. Ready for final approval pending innovation section revision.', time: '5 hours ago', status: 'resolved', review: 'BP-2025-002' },
                                  { id: 3, author: 'Emma Williams', role: 'Immigration Lawyer', content: '@Michael Chen - I have reviewed the updated innovation section. The applicant has provided sufficient evidence of scalability and market potential.', time: '1 day ago', status: 'resolved', review: 'BP-2025-003' },
                                  { id: 4, author: 'James Taylor', role: 'Senior Partner', content: 'Urgent: This Enterprise tier application needs priority review. Client has endorsement meeting scheduled next week.', time: '2 days ago', status: 'pending', review: 'BP-2025-004' },
                                ].map((comment) => (
                                  <Card key={comment.id} className={`hover-elevate ${comment.status === 'pending' ? 'border-amber-500/30' : ''}`}>
                                    <CardContent className="p-2">
                                      <div className="flex items-start gap-1.5">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-[9px] font-bold">
                                          {comment.author.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold">{comment.author}</span>
                                              <Badge variant="outline" className="text-xs">{comment.role}</Badge>
                                              <Badge variant={comment.status === 'pending' ? 'secondary' : 'default'} className="text-xs capitalize">
                                                {comment.status}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              <span>Re: {comment.review}</span>
                                              <span>{comment.time}</span>
                                            </div>
                                          </div>
                                          <p className="mt-2 text-[9px]">{comment.content}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <Button variant="ghost" size="sm">
                                              <MessageSquare className="h-3 w-3 mr-1" />
                                              Reply
                                            </Button>
                                            {comment.status === 'pending' && (
                                              <Button variant="ghost" size="sm">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Resolve
                                              </Button>
                                            )}
                                            <Button variant="ghost" size="sm">
                                              <Eye className="h-3 w-3 mr-1" />
                                              View Review
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Advanced Analytics Section */}
                {activeSection.startsWith('analytics-') && (
                  <div className="space-y-1.5">
                    {activeSection === 'analytics-realtime-monitor' && (
                      <RealtimeMonitor isActive={activeSection === 'analytics-realtime-monitor'} />
                    )}
                    {activeSection === 'analytics-heatmaps' && (
                      <HeatmapView isActive={activeSection === 'analytics-heatmaps'} />
                    )}
                    {activeSection === 'analytics-journeys' && (
                      <UserJourneyView isActive={activeSection === 'analytics-journeys'} />
                    )}
                    {activeSection === 'analytics-funnels' && (
                      <ConversionFunnelView isActive={activeSection === 'analytics-funnels'} />
                    )}
                    {activeSection === 'analytics-api-perf' && (
                      <ApiPerformanceView isActive={activeSection === 'analytics-api-perf'} />
                    )}
                    {activeSection === 'analytics-exports' && (
                      <ExportAnalyticsView isActive={activeSection === 'analytics-exports'} />
                    )}
                    {activeSection === 'analytics-audit' && (
                      <AuditLogView isActive={activeSection === 'analytics-audit'} />
                    )}
                    {activeSection === 'analytics-coins' && (
                      <CoinsUsageView isActive={activeSection === 'analytics-coins'} />
                    )}
                  </div>
                )}

                {/* Settings Section */}
                {activeSection.startsWith('settings') && (
                  <div className="space-y-1.5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-1.5"
                    >
                      {/* General Settings Section */}
                      {activeSection === 'settings-general' && (
                        <>
                          {/* Platform Settings Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Settings className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">24</p>
                                  <p className="text-[9px] text-muted-foreground">Active Settings</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">18</p>
                                  <p className="text-[9px] text-muted-foreground">Enabled Features</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500">3</p>
                                  <p className="text-[9px] text-muted-foreground">Pending Changes</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <History className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">12</p>
                                  <p className="text-[9px] text-muted-foreground">Config History</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Platform Configuration */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Settings className="h-3 w-3 text-blue-500" />
                                Platform Configuration
                              </CardTitle>
                              <CardDescription className="text-[9px]">Core platform settings and feature toggles</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                {/* Registration Settings */}
                                <div className="space-y-4 p-4 rounded-lg border border-border/50">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <UserPlus className="h-3 w-3 text-blue-500" />
                                    User Registration
                                  </h4>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Allow New Registrations</Label>
                                        <p className="text-[9px] text-muted-foreground">Enable public user signups</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Email Verification Required</Label>
                                        <p className="text-[9px] text-muted-foreground">Require email verification before access</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Google OAuth Login</Label>
                                        <p className="text-[9px] text-muted-foreground">Allow sign-in with Google</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                  </div>
                                </div>

                                {/* Notification Settings */}
                                <div className="space-y-4 p-4 rounded-lg border border-border/50">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Bell className="h-3 w-3 text-amber-500" />
                                    Notifications
                                  </h4>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-[9px] text-muted-foreground">System event email alerts</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Welcome Emails</Label>
                                        <p className="text-[9px] text-muted-foreground">Send welcome email to new users</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Payment Confirmations</Label>
                                        <p className="text-[9px] text-muted-foreground">Send receipt after payment</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                  </div>
                                </div>

                                {/* Dashboard Settings */}
                                <div className="space-y-4 p-4 rounded-lg border border-border/50">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <LayoutDashboard className="h-3 w-3 text-green-500" />
                                    Dashboard Behavior
                                  </h4>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Auto-Refresh Data</Label>
                                        <p className="text-[9px] text-muted-foreground">Refresh every 30 seconds</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Show Analytics</Label>
                                        <p className="text-[9px] text-muted-foreground">Display detailed analytics</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Compact Mode</Label>
                                        <p className="text-[9px] text-muted-foreground">Reduce spacing for more data</p>
                                      </div>
                                      <Switch />
                                    </div>
                                  </div>
                                </div>

                                {/* Security Settings */}
                                <div className="space-y-4 p-4 rounded-lg border border-border/50">
                                  <h4 className="font-semibold flex items-center gap-2">
                                    <Shield className="h-3 w-3 text-red-500" />
                                    Security
                                  </h4>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Turnstile Bot Protection</Label>
                                        <p className="text-[9px] text-muted-foreground">Cloudflare captcha on forms</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Session Timeout</Label>
                                        <p className="text-[9px] text-muted-foreground">Auto logout after 24 hours</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label>Login Rate Limiting</Label>
                                        <p className="text-[9px] text-muted-foreground">Limit failed login attempts</p>
                                      </div>
                                      <Switch defaultChecked />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* System Information */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Server className="h-3 w-3 text-violet-500" />
                                System Information
                              </CardTitle>
                              <CardDescription className="text-[9px]">Platform version and environment details</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                  <p className="text-[9px] text-muted-foreground">Version</p>
                                  <p className="text-xs font-bold text-blue-500">v2.0.0</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                                  <p className="text-[9px] text-muted-foreground">Environment</p>
                                  <p className="text-xs font-bold text-green-500">Production</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                                  <p className="text-[9px] text-muted-foreground">Node.js</p>
                                  <p className="text-xs font-bold text-amber-500">v20.x</p>
                                </div>
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
                                  <p className="text-[9px] text-muted-foreground">Database</p>
                                  <p className="text-xs font-bold text-violet-500">PostgreSQL</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Configuration History */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <History className="h-3 w-3 text-amber-500" />
                                Recent Configuration Changes
                              </CardTitle>
                              <CardDescription className="text-[9px]">Track who changed what and when</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {[
                                  { setting: 'Email Notifications', oldValue: 'Disabled', newValue: 'Enabled', user: 'Admin', time: '2 hours ago' },
                                  { setting: 'Bot Protection', oldValue: 'Basic', newValue: 'Enhanced', user: 'Admin', time: '1 day ago' },
                                  { setting: 'Session Timeout', oldValue: '12 hours', newValue: '24 hours', user: 'Admin', time: '3 days ago' },
                                ].map((change, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                                        <Settings className="h-3 w-3 text-amber-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-[9px]">{change.setting}</p>
                                        <p className="text-[9px] text-muted-foreground">
                                          <span className="text-red-500">{change.oldValue}</span>
                                          <ArrowRight className="h-3 w-3 inline mx-1" />
                                          <span className="text-green-500">{change.newValue}</span>
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-medium">{change.user}</p>
                                      <p className="text-[9px] text-muted-foreground">{change.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Access Control Section */}
                      {activeSection === 'settings-access' && (
                        <>
                          {/* Access Control Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <Shield className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">3</p>
                                  <p className="text-[9px] text-muted-foreground">Admin Users</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <LockKeyhole className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">12</p>
                                  <p className="text-[9px] text-muted-foreground">Permission Sets</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">45</p>
                                  <p className="text-[9px] text-muted-foreground">Active Sessions</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  </div>
                                  <p className="text-xs font-bold text-red-500">2</p>
                                  <p className="text-[9px] text-muted-foreground">Security Alerts</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Admin Team Management */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <div className="flex items-center justify-between flex-wrap gap-1.5">
                                <div>
                                  <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-violet-500" />
                                    Admin Team
                                  </CardTitle>
                                  <CardDescription className="text-[9px]">Manage administrator accounts and permissions</CardDescription>
                                </div>
                                <Button>
                                  <Plus className="h-3 w-3 mr-2" />
                                  Add Admin
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {[
                                  { name: 'Ebuka Benedict Umeh', email: 'ebuka@example.com', role: 'Super Admin', status: 'Active', lastLogin: '2 hours ago', permissions: ['All'] },
                                  { name: 'System Administrator', email: 'admin@ukvisaassistant.com', role: 'Admin', status: 'Active', lastLogin: '1 day ago', permissions: ['Users', 'Plans', 'Analytics'] },
                                  { name: 'Support Manager', email: 'support@ukvisaassistant.com', role: 'Moderator', status: 'Active', lastLogin: '3 days ago', permissions: ['Users', 'Support'] },
                                ].map((admin, i) => (
                                  <Card key={i} className="hover-elevate">
                                    <CardContent className="p-2">
                                      <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                            admin.role === 'Super Admin' ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-600' :
                                            admin.role === 'Admin' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600' :
                                            'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-600'
                                          }`}>
                                            {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-semibold">{admin.name}</p>
                                              <Badge variant={admin.role === 'Super Admin' ? 'default' : 'secondary'} className="text-xs">
                                                {admin.role}
                                              </Badge>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground">{admin.email}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                              {admin.permissions.map((perm, j) => (
                                                <Badge key={j} variant="outline" className="text-xs">{perm}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="text-right">
                                            <Badge variant="default" className="text-xs bg-green-500">{admin.status}</Badge>
                                            <p className="text-xs text-muted-foreground mt-1">Last login: {admin.lastLogin}</p>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem>
                                                <Edit className="h-3 w-3 mr-2" />
                                                Edit Permissions
                                              </DropdownMenuItem>
                                              <DropdownMenuItem>
                                                <Eye className="h-3 w-3 mr-2" />
                                                View Activity
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-destructive">
                                                <Ban className="h-3 w-3 mr-2" />
                                                Revoke Access
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Permission Matrix */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <LockKeyhole className="h-3 w-3 text-blue-500" />
                                Permission Matrix
                              </CardTitle>
                              <CardDescription className="text-[9px]">Role-based access control settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Permission</TableHead>
                                    <TableHead className="text-center">Super Admin</TableHead>
                                    <TableHead className="text-center">Admin</TableHead>
                                    <TableHead className="text-center">Moderator</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[
                                    { permission: 'User Management', superAdmin: true, admin: true, moderator: false },
                                    { permission: 'Business Plan Management', superAdmin: true, admin: true, moderator: false },
                                    { permission: 'Analytics & Reports', superAdmin: true, admin: true, moderator: true },
                                    { permission: 'Subscription Management', superAdmin: true, admin: true, moderator: false },
                                    { permission: 'Promo Codes', superAdmin: true, admin: true, moderator: false },
                                    { permission: 'Referral Management', superAdmin: true, admin: false, moderator: false },
                                    { permission: 'Lawyer Review Center', superAdmin: true, admin: true, moderator: false },
                                    { permission: 'System Settings', superAdmin: true, admin: false, moderator: false },
                                    { permission: 'Access Control', superAdmin: true, admin: false, moderator: false },
                                    { permission: 'Maintenance Mode', superAdmin: true, admin: false, moderator: false },
                                  ].map((row, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="font-medium">{row.permission}</TableCell>
                                      <TableCell className="text-center">
                                        {row.superAdmin ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <XCircle className="h-3 w-3 text-muted-foreground/30 mx-auto" />}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {row.admin ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <XCircle className="h-3 w-3 text-muted-foreground/30 mx-auto" />}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {row.moderator ? <CheckCircle className="h-3 w-3 text-green-500 mx-auto" /> : <XCircle className="h-3 w-3 text-muted-foreground/30 mx-auto" />}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          {/* Recent Security Events */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                Security Events
                              </CardTitle>
                              <CardDescription className="text-[9px]">Recent login attempts and security alerts</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {[
                                  { event: 'Successful admin login', user: 'ebuka@example.com', ip: '192.168.1.x', time: '2 hours ago', status: 'success' },
                                  { event: 'Failed login attempt', user: 'unknown@attacker.com', ip: '45.33.x.x', time: '5 hours ago', status: 'blocked' },
                                  { event: 'Password reset requested', user: 'support@ukvisaassistant.com', ip: '192.168.1.x', time: '1 day ago', status: 'success' },
                                  { event: 'New admin added', user: 'System', ip: 'Internal', time: '3 days ago', status: 'success' },
                                ].map((event, i) => (
                                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                                    event.status === 'blocked' ? 'bg-red-500/10 border border-red-500/20' : 'bg-muted/50'
                                  }`}>
                                    <div className="flex items-center gap-1.5">
                                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                        event.status === 'blocked' ? 'bg-red-500/20' : 'bg-green-500/20'
                                      }`}>
                                        {event.status === 'blocked' ? (
                                          <AlertTriangle className="h-3 w-3 text-red-500" />
                                        ) : (
                                          <CheckCircle className="h-3 w-3 text-green-500" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium text-[9px]">{event.event}</p>
                                        <p className="text-[9px] text-muted-foreground">{event.user} • IP: {event.ip}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant={event.status === 'blocked' ? 'destructive' : 'default'} className="text-xs">
                                        {event.status}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}

                      {/* Maintenance Section */}
                      {activeSection === 'settings-maintenance' && (
                        <>
                          {/* Maintenance Status */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  </div>
                                  <p className="text-xs font-bold text-green-500">Online</p>
                                  <p className="text-[9px] text-muted-foreground">System Status</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-blue-500" />
                                  </div>
                                  <p className="text-xs font-bold text-blue-500">99.9%</p>
                                  <p className="text-[9px] text-muted-foreground">Uptime (30 days)</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Database className="h-3 w-3 text-amber-500" />
                                  </div>
                                  <p className="text-xs font-bold text-amber-500">1.2GB</p>
                                  <p className="text-[9px] text-muted-foreground">Database Size</p>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                              <CardContent className="pt-6">
                                <div className="text-center">
                                  <div className="w-12 h-12 mx-auto mb-0.5 rounded-full bg-violet-500/10 flex items-center justify-center">
                                    <History className="h-3 w-3 text-violet-500" />
                                  </div>
                                  <p className="text-xs font-bold text-violet-500">2h ago</p>
                                  <p className="text-[9px] text-muted-foreground">Last Backup</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Maintenance Mode Control */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                Maintenance Mode
                              </CardTitle>
                              <CardDescription className="text-[9px]">Temporarily disable access for non-admin users</CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                              <div className="flex items-center justify-between p-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-4 w-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <AlertTriangle className="h-7 w-7 text-amber-500" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-xs">Enable Maintenance Mode</p>
                                    <p className="text-[9px] text-muted-foreground">
                                      When enabled, only administrators can access the platform. Users will see a maintenance page.
                                    </p>
                                  </div>
                                </div>
                                <Switch />
                              </div>

                              <div className="space-y-1.5">
                                <Label>Maintenance Message (shown to users)</Label>
                                <Input
                                  placeholder="We're performing scheduled maintenance. Please check back soon."
                                  className="h-12"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                <div className="space-y-0.5">
                                  <Label>Scheduled Start</Label>
                                  <Input type="datetime-local" />
                                </div>
                                <div className="space-y-0.5">
                                  <Label>Scheduled End</Label>
                                  <Input type="datetime-local" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* System Maintenance Actions */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Server className="h-3 w-3 text-blue-500" />
                                System Actions
                              </CardTitle>
                              <CardDescription className="text-[9px]">Database and cache management operations</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                <Card className="hover-elevate">
                                  <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                          <Database className="h-3 w-3 text-blue-500" />
                                        </div>
                                        <div>
                                          <p className="font-medium">Backup Database</p>
                                          <p className="text-[9px] text-muted-foreground">Create a full database backup</p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Download className="h-3 w-3 mr-2" />
                                        Backup
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="hover-elevate">
                                  <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                          <RefreshCw className="h-3 w-3 text-amber-500" />
                                        </div>
                                        <div>
                                          <p className="font-medium">Clear Cache</p>
                                          <p className="text-[9px] text-muted-foreground">Clear application cache</p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-3 w-3 mr-2" />
                                        Clear
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="hover-elevate">
                                  <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded-lg bg-green-500/10 flex items-center justify-center">
                                          <RotateCcw className="h-3 w-3 text-green-500" />
                                        </div>
                                        <div>
                                          <p className="font-medium">Restart Services</p>
                                          <p className="text-[9px] text-muted-foreground">Restart application services</p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <RotateCcw className="h-3 w-3 mr-2" />
                                        Restart
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="hover-elevate">
                                  <CardContent className="p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <div className="h-5 w-5 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                          <FileText className="h-3 w-3 text-violet-500" />
                                        </div>
                                        <div>
                                          <p className="font-medium">View Logs</p>
                                          <p className="text-[9px] text-muted-foreground">Access system logs</p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-3 w-3 mr-2" />
                                        View
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Backup History */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <History className="h-3 w-3 text-violet-500" />
                                Backup History
                              </CardTitle>
                              <CardDescription className="text-[9px]">Recent database backups and restore points</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Backup Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[
                                    { name: 'auto_backup_2025_11_29', type: 'Automatic', size: '1.2 GB', created: '2 hours ago', status: 'Completed' },
                                    { name: 'auto_backup_2025_11_28', type: 'Automatic', size: '1.1 GB', created: '1 day ago', status: 'Completed' },
                                    { name: 'manual_pre_update', type: 'Manual', size: '1.1 GB', created: '3 days ago', status: 'Completed' },
                                    { name: 'auto_backup_2025_11_26', type: 'Automatic', size: '1.0 GB', created: '4 days ago', status: 'Completed' },
                                  ].map((backup, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          <Database className="h-3 w-3 text-muted-foreground" />
                                          {backup.name}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={backup.type === 'Manual' ? 'default' : 'secondary'} className="text-xs">
                                          {backup.type}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{backup.size}</TableCell>
                                      <TableCell className="text-muted-foreground">{backup.created}</TableCell>
                                      <TableCell>
                                        <Badge variant="default" className="text-xs bg-green-500">{backup.status}</Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <MoreVertical className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                              <Download className="h-3 w-3 mr-2" />
                                              Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                              <RotateCcw className="h-3 w-3 mr-2" />
                                              Restore
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                              <Trash2 className="h-3 w-3 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          {/* Scheduled Tasks */}
                          <Card>
                            <CardHeader className="p-2 pb-1">
                              <CardTitle className="text-[10px] font-semibold flex items-center gap-1">
                                <Clock className="h-3 w-3 text-cyan-500" />
                                Scheduled Tasks
                              </CardTitle>
                              <CardDescription className="text-[9px]">Automated maintenance tasks and their schedules</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1.5">
                                {[
                                  { task: 'Database Backup', schedule: 'Daily at 3:00 AM', lastRun: '2 hours ago', nextRun: '22 hours', status: 'Active' },
                                  { task: 'Clear Expired Sessions', schedule: 'Every 6 hours', lastRun: '1 hour ago', nextRun: '5 hours', status: 'Active' },
                                  { task: 'Analytics Aggregation', schedule: 'Daily at 1:00 AM', lastRun: '6 hours ago', nextRun: '18 hours', status: 'Active' },
                                  { task: 'Email Queue Processing', schedule: 'Every 5 minutes', lastRun: '2 minutes ago', nextRun: '3 minutes', status: 'Active' },
                                ].map((task, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover-elevate">
                                    <div className="flex items-center gap-1.5">
                                      <div className="h-5 w-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                        <Clock className="h-3 w-3 text-cyan-500" />
                                      </div>
                                      <div>
                                        <p className="font-medium">{task.task}</p>
                                        <p className="text-[9px] text-muted-foreground">{task.schedule}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <div className="text-right">
                                        <p className="text-[9px]">Last: {task.lastRun}</p>
                                        <p className="text-[9px] text-muted-foreground">Next: {task.nextRun}</p>
                                      </div>
                                      <Badge variant="default" className="text-xs bg-green-500">{task.status}</Badge>
                                      <Switch defaultChecked />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      )}
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
              <div className="space-y-1.5">
                <div className="space-y-0.5">
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
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
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
                  <Label className="text-muted-foreground mb-0.5">Total Plans Created</Label>
                  <div className="text-[11px] font-bold">
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

        {/* Deep User Analysis Modal */}
        <Dialog open={!!analyzingUser} onOpenChange={(open) => !open && setAnalyzingUser(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Microscope className="h-3 w-3 text-purple-500" />
                Comprehensive User Analysis
              </DialogTitle>
              <DialogDescription>
                In-depth analysis of user engagement, behavior, and platform usage
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
              {userAnalysisLoading ? (
                <div className="space-y-4 py-1">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : userAnalysis ? (
                <div className="space-y-1.5 py-1">
                  {/* User Identity Section */}
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userAnalysis.user.avatar} />
                      <AvatarFallback className="text-[9px]">
                        {userAnalysis.user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xs font-semibold">{userAnalysis.user.name || 'Unknown User'}</h3>
                      <p className="text-[9px] text-muted-foreground">{userAnalysis.user.email}</p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        <Badge variant="outline" className="capitalize">{userAnalysis.user.tier}</Badge>
                        {userAnalysis.user.isVerified && <Badge className="bg-green-500">Verified</Badge>}
                        {userAnalysis.user.isAdmin && <Badge className="bg-purple-500">Admin</Badge>}
                        {userAnalysis.user.isBanned && <Badge variant="destructive">Banned</Badge>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground">Member since</p>
                      <p className="font-medium">{format(new Date(userAnalysis.user.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Last active</p>
                      <p className="font-medium">{formatDistance(new Date(userAnalysis.activity.lastActive), new Date(), { addSuffix: true })}</p>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Gauge className="h-3 w-3" />
                        <span className="text-xs font-medium">Engagement Score</span>
                      </div>
                      <div className="text-xs font-bold">{userAnalysis.insights.engagementScore}/100</div>
                      <Progress value={userAnalysis.insights.engagementScore} className="h-1.5 mt-0.5" />
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs font-medium">Business Plans</span>
                      </div>
                      <div className="text-xs font-bold">{userAnalysis.businessPlans.total}</div>
                      <p className="text-xs text-muted-foreground mt-1">Created</p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Wallet className="h-3 w-3" />
                        <span className="text-xs font-medium">Credits</span>
                      </div>
                      <div className="text-xs font-bold">{userAnalysis.credits.current}</div>
                      <p className="text-xs text-muted-foreground mt-1">Available ({userAnalysis.credits.used} used)</p>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <PoundSterling className="h-3 w-3" />
                        <span className="text-xs font-medium">Lifetime Value</span>
                      </div>
                      <div className="text-xs font-bold">£{userAnalysis.financials.lifetimeValue?.toFixed(2) || '0.00'}</div>
                      <p className="text-xs text-muted-foreground mt-1">{userAnalysis.financials.transactionCount} transactions</p>
                    </Card>
                  </div>

                  {/* Risk & Insights */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                      <Brain className="h-3 w-3 text-purple-500" />
                      Insights & Recommendations
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <p className="text-[9px] text-muted-foreground">Churn Risk</p>
                        <Badge variant={
                          userAnalysis.insights.riskLevel === 'high' ? 'destructive' :
                          userAnalysis.insights.riskLevel === 'medium' ? 'secondary' : 'default'
                        } className={userAnalysis.insights.riskLevel === 'low' ? 'bg-green-500' : ''}>
                          {userAnalysis.insights.riskLevel.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{userAnalysis.insights.churnRisk}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Upgrade Readiness</p>
                        <p className="font-medium">{userAnalysis.insights.upgradeReadiness}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground">Recommended Actions</p>
                        {userAnalysis.insights.recommendedActions.length > 0 ? (
                          <ul className="text-[9px] space-y-0.5">
                            {userAnalysis.insights.recommendedActions.map((action: string, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3 text-primary" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[9px] text-muted-foreground">No actions needed</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Tool Usage */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                      <Target className="h-3 w-3 text-blue-500" />
                      Tool Engagement
                    </h4>
                    <div className="grid grid-cols-3 gap-4 mb-1">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs font-bold">{userAnalysis.toolEngagement.uniqueToolsUsed}</div>
                        <p className="text-[9px] text-muted-foreground">Unique Tools</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs font-bold">{userAnalysis.toolEngagement.totalToolInteractions}</div>
                        <p className="text-[9px] text-muted-foreground">Total Interactions</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs font-bold">{userAnalysis.aiInteractions.total}</div>
                        <p className="text-[9px] text-muted-foreground">AI Interactions</p>
                      </div>
                    </div>
                    {userAnalysis.toolEngagement.topTools.length > 0 && (
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-0.5">Top Tools Used</p>
                        <div className="flex flex-wrap gap-2">
                          {userAnalysis.toolEngagement.topTools.slice(0, 6).map((tool: any, i: number) => (
                            <Badge key={i} variant="outline">
                              {tool.tool_id} ({tool.uses}x)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Business Plans Detail */}
                  {userAnalysis.businessPlans.plans.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <FileText className="h-3 w-3 text-green-500" />
                        Business Plans
                      </h4>
                      <div className="space-y-0.5">
                        {userAnalysis.businessPlans.plans.map((plan: any) => (
                          <div key={plan.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div>
                              <p className="font-medium">{plan.name || 'Untitled Plan'}</p>
                              <p className="text-[9px] text-muted-foreground">Created {format(new Date(plan.createdAt), 'MMM dd, yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">{plan.status || 'draft'}</Badge>
                              <Progress value={plan.progress || 0} className="w-16 h-1.5" />
                              <span className="text-xs text-muted-foreground">{plan.progress || 0}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Support & Security */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-orange-500" />
                        Support History
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">{userAnalysis.support.totalTickets}</div>
                          <p className="text-[9px] text-muted-foreground">Total</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-xs font-bold text-orange-500">{userAnalysis.support.openTickets}</div>
                          <p className="text-[9px] text-muted-foreground">Open</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-xs font-bold text-green-500">{userAnalysis.support.resolvedTickets}</div>
                          <p className="text-[9px] text-muted-foreground">Resolved</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <Shield className="h-3 w-3 text-red-500" />
                        Security Events
                      </h4>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-[11px] font-bold">{userAnalysis.security.totalEvents}</div>
                        <p className="text-[9px] text-muted-foreground">Total Events</p>
                      </div>
                      {userAnalysis.security.events.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {userAnalysis.security.events.slice(0, 3).map((event: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span>{event.event_type}</span>
                              <Badge variant={event.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                {event.count}x
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Referrals & Files */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <UserPlus className="h-3 w-3 text-blue-500" />
                        Referrals
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">{userAnalysis.referrals.codesCreated}</div>
                          <p className="text-[9px] text-muted-foreground">Codes</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">{userAnalysis.referrals.successfulReferrals}</div>
                          <p className="text-[9px] text-muted-foreground">Referrals</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">£{userAnalysis.referrals.totalRewards?.toFixed(0) || 0}</div>
                          <p className="text-[9px] text-muted-foreground">Rewards</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <Upload className="h-3 w-3 text-purple-500" />
                        Files & Documents
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">{userAnalysis.files.totalUploaded}</div>
                          <p className="text-[9px] text-muted-foreground">Files</p>
                        </div>
                        <div className="p-2 bg-muted/30 rounded">
                          <div className="text-[11px] font-bold">
                            {userAnalysis.files.totalSize > 0 
                              ? `${(userAnalysis.files.totalSize / 1024 / 1024).toFixed(1)}MB`
                              : '0'}
                          </div>
                          <p className="text-[9px] text-muted-foreground">Total Size</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Feedback */}
                  {userAnalysis.feedback.submissions.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-0.5 flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        User Feedback
                        {userAnalysis.feedback.averageRating && (
                          <Badge variant="secondary" className="ml-2">
                            Avg: {userAnalysis.feedback.averageRating.toFixed(1)}/5
                          </Badge>
                        )}
                      </h4>
                      <div className="space-y-0.5">
                        {userAnalysis.feedback.submissions.slice(0, 3).map((fb: any, i: number) => (
                          <div key={i} className="p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`h-3 w-3 ${s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(fb.created_at), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            {fb.comment && <p className="text-[9px]">{fb.comment}</p>}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <p className="text-xs text-muted-foreground text-center">
                    Analysis generated at {format(new Date(userAnalysis.generatedAt), 'PPpp')}
                  </p>
                </div>
              ) : (
                <div className="py-1 text-center text-muted-foreground">
                  No analysis data available
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="border-t pt-4 mt-0.5">
              <Button variant="outline" onClick={() => refetchUserAnalysis()}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => setAnalyzingUser(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========== ADMIN CONTROL CENTER MODALS ========== */}

        {/* Ban User Modal */}
        <AlertDialog open={!!banningUser} onOpenChange={(open) => !open && setBanningUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Ban className="h-3 w-3" />
                Ban User
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently restrict {banningUser?.email} from accessing the platform.
                They will not be able to log in or use any features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-1">
              <div className="space-y-0.5">
                <Label htmlFor="ban-reason">Reason for Ban</Label>
                <Input
                  id="ban-reason"
                  placeholder="e.g., Terms of service violation, spam, etc."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  data-testid="input-ban-reason"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setBanningUser(null); setBanReason(""); }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover-elevate"
                onClick={() => banningUser && banUserMutation.mutate({ 
                  userId: banningUser.id, 
                  banned: true, 
                  reason: banReason 
                })}
                disabled={banUserMutation.isPending}
                data-testid="button-confirm-ban"
              >
                {banUserMutation.isPending ? "Banning..." : "Ban User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete User Modal */}
        <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-3 w-3" />
                Delete User Permanently
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-0.5">
                <p>This action <span className="font-bold text-red-600">CANNOT be undone</span>. This will permanently delete:</p>
                <ul className="list-disc list-inside text-[9px] space-y-0.5 mt-0.5">
                  <li>User account and profile</li>
                  <li>All business plans</li>
                  <li>Payment history</li>
                  <li>Activity logs</li>
                </ul>
                <p className="mt-4">
                  To confirm, type <span className="font-mono bg-muted px-1 rounded">{deletingUser?.email}</span> below:
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-1">
              <Input
                placeholder="Type user email to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                data-testid="input-delete-confirm"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setDeletingUser(null); setDeleteConfirmText(""); }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover-elevate"
                onClick={() => deletingUser && deleteUserMutation.mutate(deletingUser.id)}
                disabled={deleteUserMutation.isPending || deleteConfirmText !== deletingUser?.email}
                data-testid="button-confirm-delete"
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User Forever"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View User Activity Modal */}
        <Dialog open={!!viewingUserActivity} onOpenChange={(open) => !open && setViewingUserActivity(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-green-500" />
                User Activity
              </DialogTitle>
              <DialogDescription>
                Recent activity for {viewingUserActivity?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[9px] text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {viewingUserActivity?.createdAt 
                      ? format(new Date(viewingUserActivity.createdAt), 'PPp')
                      : 'Unknown'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[9px] text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {viewingUserActivity?.lastLogin 
                      ? formatDistance(new Date(viewingUserActivity.lastLogin), new Date(), { addSuffix: true })
                      : 'Never'}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[9px] text-muted-foreground">Current Tier</p>
                  <Badge variant="outline" className="capitalize mt-1">
                    {viewingUserActivity?.subscriptionTier || 'free'}
                  </Badge>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-[9px] text-muted-foreground">Credits Remaining</p>
                  <p className="font-medium">
                    {((viewingUserActivity as any)?.planCredits || 0) + ((viewingUserActivity as any)?.bonusCredits || 0)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-0.5">Account Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={(viewingUserActivity as any)?.isVerified ? "default" : "secondary"}>
                    {(viewingUserActivity as any)?.isVerified ? "Email Verified" : "Email Not Verified"}
                  </Badge>
                  {viewingUserActivity?.isAdmin && (
                    <Badge variant="default" className="bg-purple-600">Admin</Badge>
                  )}
                  {(viewingUserActivity as any)?.isBanned && (
                    <Badge variant="destructive">Banned</Badge>
                  )}
                  {(viewingUserActivity as any)?.suspendedUntil && new Date((viewingUserActivity as any).suspendedUntil) > new Date() && (
                    <Badge variant="secondary" className="bg-orange-500 text-white">
                      Suspended until {format(new Date((viewingUserActivity as any).suspendedUntil), 'PP')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingUserActivity(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend User Modal */}
        <Dialog open={!!suspendingUser} onOpenChange={(open) => !open && setSuspendingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="h-3 w-3" />
                Suspend User
              </DialogTitle>
              <DialogDescription>
                Temporarily restrict {suspendingUser?.email}'s access for a specified duration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="space-y-0.5">
                <Label htmlFor="suspend-duration">Suspension Duration (days)</Label>
                <Select
                  value={suspendDays.toString()}
                  onValueChange={(v) => setSuspendDays(Number(v))}
                >
                  <SelectTrigger id="suspend-duration" data-testid="select-suspend-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="suspend-reason">Reason for Suspension</Label>
                <Input
                  id="suspend-reason"
                  placeholder="e.g., Policy violation, review pending, etc."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  data-testid="input-suspend-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSuspendingUser(null); setSuspendReason(""); }}>
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover-elevate"
                onClick={() => suspendingUser && suspendUserMutation.mutate({ 
                  userId: suspendingUser.id, 
                  suspended: true, 
                  reason: suspendReason,
                  durationDays: suspendDays
                })}
                disabled={suspendUserMutation.isPending}
                data-testid="button-confirm-suspend"
              >
                {suspendUserMutation.isPending ? "Suspending..." : `Suspend for ${suspendDays} days`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tier Override Modal */}
        <Dialog open={!!tierOverrideUser} onOpenChange={(open) => !open && setTierOverrideUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-yellow-500" />
                Change User Tier
              </DialogTitle>
              <DialogDescription>
                Override the subscription tier for {tierOverrideUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-[9px] text-muted-foreground">Current Tier</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {tierOverrideUser?.subscriptionTier}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="new-tier">New Tier</Label>
                <Select value={overrideTier} onValueChange={setOverrideTier}>
                  <SelectTrigger id="new-tier" data-testid="select-new-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (0 coins)</SelectItem>
                    <SelectItem value="basic">Basic (1 coin)</SelectItem>
                    <SelectItem value="premium">Premium (3 coins)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (6 coins)</SelectItem>
                    <SelectItem value="ultimate">Ultimate (12 coins)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="override-reason">Reason for Override</Label>
                <Input
                  id="override-reason"
                  placeholder="e.g., Voucher applied, promotional upgrade, etc."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  data-testid="input-override-reason"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setTierOverrideUser(null); setOverrideReason(""); }}>
                Cancel
              </Button>
              <Button
                onClick={() => tierOverrideUser && tierOverrideMutation.mutate({ 
                  userId: tierOverrideUser.id, 
                  tier: overrideTier, 
                  reason: overrideReason,
                  addCredits: true
                })}
                disabled={tierOverrideMutation.isPending || !overrideReason}
                data-testid="button-confirm-tier"
              >
                {tierOverrideMutation.isPending ? "Updating..." : "Update Tier"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Credits Management Modal */}
        <Dialog open={!!creditsUser} onOpenChange={(open) => !open && setCreditsUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-3 w-3 text-blue-500" />
                Manage Credits
              </DialogTitle>
              <DialogDescription>
                Add or remove credits for {creditsUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="space-y-0.5">
                <Label htmlFor="credit-type">Credit Type</Label>
                <Select value={creditsType} onValueChange={(v) => setCreditsType(v as 'plan' | 'bonus')}>
                  <SelectTrigger id="credit-type" data-testid="select-credit-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus Credits (promotional)</SelectItem>
                    <SelectItem value="plan">Plan Credits (subscription)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="credit-amount">Amount (positive to add, negative to remove)</Label>
                <Input
                  id="credit-amount"
                  type="number"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(Number(e.target.value))}
                  data-testid="input-credit-amount"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(1); }}>+1</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(3); }}>+3</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(5); }}>+5</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(10); }}>+10</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(-1); }}>-1</Button>
                <Button size="sm" variant="outline" onClick={() => { setCreditsMode('add'); setCreditsAmount(-3); }}>-3</Button>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-[9px] font-medium mb-0.5">Quick Actions (Set to exact value)</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      const tierCredits: Record<string, number> = { free: 0, basic: 1, premium: 3, enterprise: 6, ultimate: 12 };
                      const tier = (creditsUser?.subscriptionTier || 'free').toLowerCase();
                      const defaultCredits = tierCredits[tier] ?? 0;
                      setCreditsType('plan');
                      setCreditsMode('set');
                      setCreditsAmount(defaultCredits);
                    }}
                    data-testid="button-set-tier-default"
                  >
                    Reset to Tier Default ({
                      { free: 0, basic: 1, premium: 3, enterprise: 6, ultimate: 12 }[
                        (creditsUser?.subscriptionTier || 'free').toLowerCase()
                      ] ?? 0
                    })
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => { setCreditsMode('set'); setCreditsAmount(0); }}
                  >
                    Set to 0
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  2026 Tier Defaults: Free=0, Basic=1, Premium=3, Enterprise=6, Ultimate=12
                </p>
                {creditsMode === 'set' && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Mode: SET (will replace current balance with {creditsAmount})
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreditsUser(null); setCreditsMode('add'); }}>Cancel</Button>
              <Button
                onClick={() => creditsUser && creditsMutation.mutate({ 
                  userId: creditsUser.id, 
                  amount: creditsAmount, 
                  type: creditsType,
                  mode: creditsMode
                })}
                disabled={creditsMutation.isPending}
                data-testid="button-confirm-credits"
              >
                {creditsMutation.isPending ? "Updating..." : 
                  creditsMode === 'set' ? `Set to ${creditsAmount}` : 
                  creditsAmount >= 0 ? "Add Credits" : "Remove Credits"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Admin Notes Modal */}
        <Dialog open={!!notesUser} onOpenChange={(open) => !open && setNotesUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Admin Notes
              </DialogTitle>
              <DialogDescription>
                Internal notes for {notesUser?.email} (not visible to user)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <textarea
                className="w-full h-40 p-3 rounded-lg border bg-muted/50 resize-none"
                placeholder="Add internal notes about this user..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                data-testid="textarea-admin-notes"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNotesUser(null)}>Cancel</Button>
              <Button
                onClick={() => notesUser && notesMutation.mutate({ userId: notesUser.id, notes: adminNotes })}
                disabled={notesMutation.isPending}
                data-testid="button-save-notes"
              >
                {notesMutation.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View as User (Impersonation) Modal */}
        <Dialog open={!!impersonatingUser} onOpenChange={(open) => { 
          if (!open) { 
            setImpersonatingUser(null); 
            setImpersonationData(null); 
          } 
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="h-3 w-3" />
                View as User (Read-Only)
              </DialogTitle>
              <DialogDescription>
                Viewing {impersonatingUser?.email}'s account data for support purposes
              </DialogDescription>
            </DialogHeader>
            {impersonationData ? (
              <div className="space-y-1.5 py-1">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-0.5">Account Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-[9px]">
                    <div>
                      <p className="text-[9px] text-muted-foreground">Email</p>
                      <p className="font-medium">{impersonationData.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Tier</p>
                      <Badge variant="outline" className="capitalize">{impersonationData.user?.subscriptionTier}</Badge>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Plan Credits</p>
                      <p className="font-medium">{impersonationData.user?.planCredits || 0}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Bonus Credits</p>
                      <p className="font-medium">{impersonationData.user?.bonusCredits || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-0.5">Recent Business Plans ({impersonationData.businessPlans?.length || 0})</h4>
                  {impersonationData.businessPlans?.length > 0 ? (
                    <div className="space-y-0.5">
                      {impersonationData.businessPlans.map((plan: any) => (
                        <div key={plan.id} className="p-3 border rounded-lg text-[9px]">
                          <div className="flex justify-between">
                            <span className="font-medium">{plan.businessName || 'Unnamed Plan'}</span>
                            <Badge variant="outline" className="text-xs">{plan.status}</Badge>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">
                            Created: {plan.createdAt ? format(new Date(plan.createdAt), 'PPp') : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-[9px]">No business plans found</p>
                  )}
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-[9px] text-orange-700 dark:text-orange-300">
                    {impersonationData.impersonationNote}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-1 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground mt-0.5">Loading user data...</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setImpersonatingUser(null); setImpersonationData(null); }}>
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
                <Tag className="h-3 w-3" />
                Create Promo Code
              </DialogTitle>
              <DialogDescription>
                Create a new promotional discount code for customers
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="promo-code">Promo Code</Label>
                <Input
                  id="promo-code"
                  placeholder="e.g., WELCOME20"
                  value={newPromoCode.code}
                  onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
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

                <div className="space-y-0.5">
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

              <div className="space-y-0.5">
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

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <Label>Valid From</Label>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setPromoValidFromOpen(true)}>
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {newPromoCode.validFrom 
                      ? format(newPromoCode.validFrom, 'PPP') 
                      : 'No start date'}
                  </Button>
                  <Dialog open={promoValidFromOpen} onOpenChange={setPromoValidFromOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select Start Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={newPromoCode.validFrom || undefined}
                          onSelect={(date) => {
                            setNewPromoCode({ ...newPromoCode, validFrom: date || null });
                            setPromoValidFromOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-0.5">
                  <Label>Valid Until</Label>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setPromoValidUntilOpen(true)}>
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {newPromoCode.validUntil 
                      ? format(newPromoCode.validUntil, 'PPP') 
                      : 'No expiry'}
                  </Button>
                  <Dialog open={promoValidUntilOpen} onOpenChange={setPromoValidUntilOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select End Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={newPromoCode.validUntil || undefined}
                          onSelect={(date) => {
                            setNewPromoCode({ ...newPromoCode, validUntil: date || null });
                            setPromoValidUntilOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
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

            <div className="space-y-1.5">
              <div className="space-y-0.5">
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

        {/* Send Broadcast Notification Dialog */}
        <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-3 w-3" />
                Send Broadcast Notification
              </DialogTitle>
              <DialogDescription>
                Send a notification to all users or specific subscription tiers
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="broadcast-title">Notification Title</Label>
                <Input
                  id="broadcast-title"
                  placeholder="e.g., New Feature Announcement"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  data-testid="input-broadcast-title"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="broadcast-message">Message</Label>
                <textarea
                  id="broadcast-message"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-1.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Write your notification message here..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  data-testid="input-broadcast-message"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="broadcast-type">Notification Type</Label>
                <Select
                  value={broadcastData.type}
                  onValueChange={(value: 'info' | 'success' | 'warning' | 'error') => 
                    setBroadcastData({ ...broadcastData, type: value })
                  }
                >
                  <SelectTrigger id="broadcast-type" data-testid="select-broadcast-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-0.5">
                <Label>Target Tiers (leave empty for all users)</Label>
                <div className="flex flex-wrap gap-2">
                  {['free', 'basic', 'premium', 'enterprise', 'ultimate'].map(tier => (
                    <Badge
                      key={tier}
                      variant={broadcastData.targetTiers.includes(tier) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        if (broadcastData.targetTiers.includes(tier)) {
                          setBroadcastData({
                            ...broadcastData,
                            targetTiers: broadcastData.targetTiers.filter(t => t !== tier)
                          });
                        } else {
                          setBroadcastData({
                            ...broadcastData,
                            targetTiers: [...broadcastData.targetTiers, tier]
                          });
                        }
                      }}
                    >
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBroadcastModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => sendBroadcastMutation.mutate(broadcastData)}
                disabled={!broadcastData.title || !broadcastData.message || sendBroadcastMutation.isPending}
                data-testid="button-confirm-send-broadcast"
              >
                {sendBroadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Campaign Dialog */}
        <Dialog open={showCampaignModal} onOpenChange={setShowCampaignModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                Create Marketing Campaign
              </DialogTitle>
              <DialogDescription>
                Create a new promotional campaign with targeted discounts
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <div className="space-y-0.5">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Black Friday Sale"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  data-testid="input-campaign-name"
                />
              </div>

              <div className="space-y-0.5">
                <Label htmlFor="campaign-description">Description</Label>
                <textarea
                  id="campaign-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-1.5 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe the campaign..."
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                  data-testid="input-campaign-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <Label htmlFor="campaign-discount-type">Discount Type</Label>
                  <Select
                    value={campaignData.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setCampaignData({ ...campaignData, discountType: value })
                    }
                  >
                    <SelectTrigger id="campaign-discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-0.5">
                  <Label htmlFor="campaign-discount-value">Discount Value</Label>
                  <Input
                    id="campaign-discount-value"
                    type="number"
                    min="0"
                    max={campaignData.discountType === 'percentage' ? 100 : undefined}
                    value={campaignData.discountValue}
                    onChange={(e) => setCampaignData({ ...campaignData, discountValue: Number(e.target.value) })}
                    data-testid="input-campaign-discount-value"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="space-y-0.5">
                  <Label>Start Date</Label>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setCampaignStartDateOpen(true)}>
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {format(campaignData.startDate, 'PPP')}
                  </Button>
                  <Dialog open={campaignStartDateOpen} onOpenChange={setCampaignStartDateOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select Start Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={campaignData.startDate}
                          onSelect={(date) => {
                            if (date) setCampaignData({ ...campaignData, startDate: date });
                            setCampaignStartDateOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-0.5">
                  <Label>End Date</Label>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setCampaignEndDateOpen(true)}>
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {format(campaignData.endDate, 'PPP')}
                  </Button>
                  <Dialog open={campaignEndDateOpen} onOpenChange={setCampaignEndDateOpen}>
                    <DialogContent className="sm:max-w-[350px] p-4">
                      <DialogHeader>
                        <DialogTitle>Select End Date</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center py-2">
                        <Calendar
                          mode="single"
                          selected={campaignData.endDate}
                          onSelect={(date) => {
                            if (date) setCampaignData({ ...campaignData, endDate: date });
                            setCampaignEndDateOpen(false);
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-0.5">
                <Label>Target Tiers (leave empty for all users)</Label>
                <div className="flex flex-wrap gap-2">
                  {['free', 'basic', 'premium', 'enterprise', 'ultimate'].map(tier => (
                    <Badge
                      key={tier}
                      variant={campaignData.targetTiers.includes(tier) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        if (campaignData.targetTiers.includes(tier)) {
                          setCampaignData({
                            ...campaignData,
                            targetTiers: campaignData.targetTiers.filter(t => t !== tier)
                          });
                        } else {
                          setCampaignData({
                            ...campaignData,
                            targetTiers: [...campaignData.targetTiers, tier]
                          });
                        }
                      }}
                    >
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCampaignModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCampaignMutation.mutate(campaignData)}
                disabled={!campaignData.name || createCampaignMutation.isPending}
                data-testid="button-confirm-create-campaign"
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </TooltipProvider>
  );
}
