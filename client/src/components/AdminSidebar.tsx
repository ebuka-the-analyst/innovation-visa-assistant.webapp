import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, useSpring, useMotionValue, animate } from "framer-motion";

// Animated number component for sidebar stats - always synced with current value
function AnimatedStat({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  
  useEffect(() => {
    // Stop any ongoing animation
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    
    // Animate from current display value to new value
    controlsRef.current = animate(displayValue, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      onComplete: () => setDisplayValue(value),
    });
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [value]);
  
  // Ensure display is always in sync if animation fails
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      if (displayValue !== value) {
        setDisplayValue(value);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [value, displayValue]);

  return (
    <motion.span
      key={`stat-${displayValue}`}
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
    >
      {displayValue}
    </motion.span>
  );
}
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  FileText,
  FilePlus,
  FileCheck,
  FileWarning,
  TrendingUp,
  DollarSign,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  AlertTriangle,
  Shield,
  ScrollText,
  History,
  Settings,
  Bell,
  Mail,
  ChevronRight,
  Zap,
  Target,
  Globe,
  Clock,
  Layers,
  Wrench,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Gift,
  Tag,
  Percent,
  Link2,
  Receipt,
  Scale,
  UserCog,
  ClipboardCheck,
  FileSearch,
  MessageSquare,
  CheckSquare,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  stats?: {
    totalUsers?: number;
    activeUsers?: number;
    pendingPlans?: number;
    errorCount?: number;
    pendingRewards?: number;
  };
  hideDemoUsers?: boolean;
  onHideDemoUsersChange?: (value: boolean) => void;
}

const menuGroups = [
  {
    label: "Dashboard",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
      { id: "realtime", label: "Real-Time Activity", icon: Activity, badge: "live" },
      { id: "kpis", label: "Executive KPIs", icon: Target, badge: null },
    ]
  },
  {
    label: "User Intelligence",
    items: [
      { id: "users-overview", label: "All Users", icon: Users, badge: null },
      { id: "users-active", label: "Active Users", icon: UserCheck, badge: null },
      { id: "users-new", label: "New Registrations", icon: UserPlus, badge: null },
      { id: "users-churn", label: "Churn Analysis", icon: UserX, badge: null },
      { id: "users-cohorts", label: "Cohort Analysis", icon: Layers, badge: null },
      { id: "users-journey", label: "User Journeys", icon: TrendingUp, badge: null },
      { id: "users-geo", label: "Geographic Distribution", icon: Globe, badge: null },
    ]
  },
  {
    label: "Plan Lifecycle",
    items: [
      { id: "plans-overview", label: "All Plans", icon: FileText, badge: null },
      { id: "plans-pending", label: "Pending Plans", icon: FilePlus, badge: "count" },
      { id: "plans-completed", label: "Completed Plans", icon: FileCheck, badge: null },
      { id: "plans-failed", label: "Failed Plans", icon: FileWarning, badge: null },
      { id: "plans-funnel", label: "Completion Funnel", icon: Filter, badge: null },
    ]
  },
  {
    label: "Revenue & Subscriptions",
    items: [
      { id: "revenue-overview", label: "Revenue Dashboard", icon: DollarSign, badge: null },
      { id: "revenue-mrr", label: "MRR Analytics", icon: TrendingUp, badge: null },
      { id: "revenue-subscriptions", label: "Subscriptions", icon: CreditCard, badge: null },
      { id: "revenue-tiers", label: "Tier Distribution", icon: PieChart, badge: null },
      { id: "revenue-ltv", label: "LTV Analysis", icon: LineChart, badge: null },
    ]
  },
  {
    label: "Tool Performance",
    items: [
      { id: "tools-usage", label: "Usage Analytics", icon: BarChart3, badge: null },
      { id: "tools-heatmap", label: "Usage Heatmap", icon: Layers, badge: null },
      { id: "tools-popular", label: "Top Tools", icon: Zap, badge: null },
      { id: "tools-engagement", label: "Engagement Metrics", icon: Activity, badge: null },
      { id: "tools-completion", label: "Completion Rates", icon: Target, badge: null },
    ]
  },
  {
    label: "System Health",
    items: [
      { id: "system-overview", label: "Health Dashboard", icon: Server, badge: null },
      { id: "system-performance", label: "Performance", icon: Cpu, badge: null },
      { id: "system-database", label: "Database", icon: Database, badge: null },
      { id: "system-storage", label: "Storage", icon: HardDrive, badge: null },
      { id: "system-api", label: "API Metrics", icon: Activity, badge: null },
    ]
  },
  {
    label: "Logs & Audit",
    items: [
      { id: "logs-activity", label: "Activity Log", icon: ScrollText, badge: null },
      { id: "logs-errors", label: "Error Log", icon: AlertTriangle, badge: "errors" },
      { id: "logs-audit", label: "Audit Trail", icon: History, badge: null },
      { id: "logs-security", label: "Security Events", icon: Shield, badge: null },
    ]
  },
  {
    label: "Communications",
    items: [
      { id: "comms-emails", label: "Email Analytics", icon: Mail, badge: null },
      { id: "comms-notifications", label: "Notifications", icon: Bell, badge: null },
    ]
  },
  {
    label: "Referrals & Promos",
    items: [
      { id: "referrals-overview", label: "Referral Overview", icon: Gift, badge: null },
      { id: "referrals-codes", label: "Referral Codes", icon: Link2, badge: null },
      { id: "referrals-rewards", label: "Pending Rewards", icon: Receipt, badge: "rewards" },
      { id: "referrals-analytics", label: "Referral Analytics", icon: TrendingUp, badge: null },
      { id: "promos-overview", label: "Promo Codes", icon: Tag, badge: null },
      { id: "promos-create", label: "Create Promo", icon: Percent, badge: null },
      { id: "promos-analytics", label: "Promo Analytics", icon: BarChart3, badge: null },
      { id: "promos-campaigns", label: "Campaign Manager", icon: Target, badge: null },
      { id: "promos-reports", label: "Promo Reports", icon: FileText, badge: null },
    ]
  },
  {
    label: "Lawyer Review Center",
    items: [
      { id: "lawyer-dashboard", label: "Review Dashboard", icon: Scale, badge: null },
      { id: "lawyer-queue", label: "Review Queue", icon: ClipboardCheck, badge: "pending" },
      { id: "lawyer-documents", label: "Document Review", icon: FileSearch, badge: null },
      { id: "lawyer-team", label: "Lawyer Team", icon: UserCog, badge: null },
      { id: "lawyer-comments", label: "Comments & Notes", icon: MessageSquare, badge: null },
      { id: "lawyer-completed", label: "Completed Reviews", icon: CheckSquare, badge: null },
    ]
  },
  {
    label: "Admin Settings",
    items: [
      { id: "settings-general", label: "General Settings", icon: Settings, badge: null },
      { id: "settings-access", label: "Access Control", icon: Lock, badge: null },
      { id: "settings-maintenance", label: "Maintenance", icon: Wrench, badge: null },
    ]
  }
];

export function AdminSidebar({ activeSection, onSectionChange, stats, hideDemoUsers, onHideDemoUsersChange }: AdminSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Dashboard", "User Intelligence", "Plan Lifecycle"]);

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => 
      prev.includes(label) 
        ? prev.filter(g => g !== label)
        : [...prev, label]
    );
  };

  const getBadgeContent = (badge: string | null) => {
    if (!badge) return null;
    if (badge === "live") return <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">LIVE</Badge>;
    if (badge === "count" && stats?.pendingPlans) return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{stats.pendingPlans}</Badge>;
    if (badge === "errors" && stats?.errorCount) return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{stats.errorCount}</Badge>;
    if (badge === "rewards" && stats?.pendingRewards) return <Badge className="text-[10px] px-1.5 py-0 bg-orange-500">{stats.pendingRewards}</Badge>;
    return null;
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Admin Console</h2>
            <p className="text-xs text-muted-foreground">UK Innovator Founder Visa Assistant</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-card/50 border border-border/50 p-2 text-center">
            <div className="text-lg font-bold text-primary">
              <AnimatedStat value={stats?.totalUsers || 0} />
            </div>
            <div className="text-[10px] text-muted-foreground">Total Users</div>
          </div>
          <div className="rounded-lg bg-card/50 border border-border/50 p-2 text-center">
            <div className="text-lg font-bold text-green-500">
              <AnimatedStat value={stats?.activeUsers || 0} />
            </div>
            <div className="text-[10px] text-muted-foreground">Active Now</div>
          </div>
        </div>
        
        {onHideDemoUsersChange && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-card/50 border border-border/50 p-2">
            <div className="flex items-center gap-2">
              {hideDemoUsers ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">
                {hideDemoUsers ? 'Demo users hidden' : 'Show all users'}
              </span>
            </div>
            <Switch
              checked={hideDemoUsers}
              onCheckedChange={onHideDemoUsersChange}
              data-testid="switch-hide-demo-users"
              className="scale-90"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {menuGroups.map((group) => (
          <Collapsible 
            key={group.label}
            open={expandedGroups.includes(group.label)}
            onOpenChange={() => toggleGroup(group.label)}
          >
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1.5 transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedGroups.includes(group.label) ? 'rotate-90' : ''}`} />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onSectionChange(item.id)}
                          isActive={activeSection === item.id}
                          className="w-full justify-between"
                          data-testid={`sidebar-${item.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          {getBadgeContent(item.badge)}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>System Healthy</span>
          <span className="ml-auto">v2.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
