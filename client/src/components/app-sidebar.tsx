import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Users,
  BarChart3,
  Shield,
  Brain,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  CheckCircle2,
  PieChart,
  Network,
  BookOpen,
  Award,
  Clock,
  DollarSign,
  Gift,
  Target,
  HelpCircle,
  FolderOpen,
  Handshake,
  Sparkles,
  Trophy,
  CalendarDays,
  Newspaper,
  Rocket,
  Mic,
  Globe2,
  Bot,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

type NavGroup = {
  label: string;
  items: Array<{
    title: string;
    url: string;
    icon: any;
    description?: string;
    badge?: string;
    comingSoon?: boolean;
  }>;
};

interface AppSidebarProps {
  demoMode?: boolean;
}

export function AppSidebar({ demoMode = false }: AppSidebarProps) {
  const [location, setLocation] = useLocation();
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string; isAdmin?: boolean }>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !demoMode,
  });

  const { data: partnerStatus } = useQuery<{ isPartner: boolean; promoCodeCount: number }>({
    queryKey: ["/api/partner/status"],
    enabled: !!user && !demoMode,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.clear();
      // Redirect to Replit Auth logout if provided, otherwise go to login
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        setLocation("/login");
      }
    },
  });

  // Demo user data for non-logged-in users
  const demoUser = {
    id: "demo",
    email: "demo@example.com",
    displayName: "Demo User",
    isAdmin: false,
  };

  const currentUser = demoMode ? demoUser : user;
  
  // Debug logging - remove after testing
  console.log('[DEBUG] AppSidebar user data:', { 
    isAdmin: currentUser?.isAdmin, 
    email: currentUser?.email,
    demoMode 
  });
  
  if (!currentUser && !demoMode) return null;

  const navGroups: NavGroup[] = [
    ...(partnerStatus?.isPartner && !demoMode
      ? [
          {
            label: "Partner",
            items: [
              {
                title: "Partner Dashboard",
                url: "/partner-dashboard",
                icon: Handshake,
                description: "Track your referrals & earnings",
                badge: "PARTNER",
              },
            ],
          },
        ]
      : []),
    {
      label: "Core Platform",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          description: "Overview & business plans",
        },
        {
          title: "Generate Plan",
          url: "/questionnaire",
          icon: FileText,
          description: "Business plan builder",
        },
        {
          title: "Progress Tracker",
          url: "/progress",
          icon: Target,
          description: "Track your visa journey",
        },
        {
          title: "My Documents",
          url: "/documents",
          icon: FolderOpen,
          description: "Secure document storage",
        },
      ],
    },
    {
      label: "AI Analysis & Diagnostics",
      items: [
        {
          title: "Rejection Analysis",
          url: "/rejection-analysis",
          icon: TrendingUp,
          description: "Advanced rejection strategies",
        },
        {
          title: "Diagnostics",
          url: "/diagnostics",
          icon: Brain,
          description: "Advanced visa assessment",
        },
        {
          title: "Evidence Graph",
          url: "/evidence-graph",
          icon: Network,
          description: "Evidence mapping & analysis",
        },
      ],
    },
    {
      label: "OMNI",
      items: [
        {
          title: "ORACLE Supervisor",
          url: "/oracle-supervisor",
          icon: Brain,
          description: "Master AI with 4 specialist agents",
        },
        {
          title: "Founder Autopilot",
          url: "/founder-autopilot",
          icon: Rocket,
          description: "Full visa automation mode",
        },
        {
          title: "Neural Twin",
          url: "/neural-twin",
          icon: Bot,
          description: "AI simulation of you for practice",
        },
        {
          title: "Voice Builder",
          url: "/voice-builder",
          icon: Mic,
          description: "Speak to build your documents",
        },
        {
          title: "Regulatory Copilot",
          url: "/regulatory-copilot",
          icon: Shield,
          description: "Real-time UK law monitoring",
        },
        {
          title: "Economic Impact",
          url: "/economic-impact",
          icon: Globe2,
          description: "UK job & GDP calculator",
        },
        {
          title: "Knowledge Graph",
          url: "/knowledge-graph",
          icon: Network,
          description: "Visual UK visa rules map",
        },
      ],
    },
    {
      label: "Visa Strategy & Prep",
      items: [
        {
          title: "Interview Prep",
          url: "/interview-prep",
          icon: BookOpen,
          description: "Interview training & scenarios",
        },
        {
          title: "RFE Defence Lab",
          url: "/rfe-defence-lab",
          icon: Shield,
          description: "Request for further evidence",
        },
        {
          title: "Settlement Planning",
          url: "/settlement-planning",
          icon: CheckCircle2,
          description: "Post-approval planning",
        },
      ],
    },
    {
      label: "Business Intelligence",
      items: [
        {
          title: "KPI Dashboard",
          url: "/kpi-dashboard",
          icon: PieChart,
          description: "Business metrics & analytics",
        },
        {
          title: "Features Dashboard",
          url: "/features-dashboard",
          icon: BarChart3,
          description: "Feature performance tracking",
        },
      ],
    },
    {
      label: "Resources & Tools",
      items: [
        {
          title: "Tools Hub",
          url: "/tools-hub",
          icon: Zap,
          description: "100+ professional tools",
        },
        {
          title: "Achievements",
          url: "/achievements",
          icon: Trophy,
          description: "Badges & certificates",
        },
        {
          title: "Template Library",
          url: "/template-library",
          icon: FolderOpen,
          description: "60+ document templates",
        },
        {
          title: "AI Document Review",
          url: "/document-review",
          icon: Sparkles,
          description: "AI-powered feedback",
        },
        {
          title: "Success Stories",
          url: "/success-stories",
          icon: Award,
          description: "Real visa success cases",
        },
        {
          title: "Immigration News",
          url: "/news",
          icon: Newspaper,
          description: "UK visa news updates",
        },
        {
          title: "Calendar & Deadlines",
          url: "/calendar",
          icon: CalendarDays,
          description: "Track your timeline",
        },
        {
          title: "Endorser Comparison",
          url: "/endorser-comparison",
          icon: Award,
          description: "Endorser analysis",
        },
        {
          title: "Investment Requirements",
          url: "/endorser-investment",
          icon: DollarSign,
          description: "Investment by route",
        },
        {
          title: "Document Organizer",
          url: "/document-organizer",
          icon: FileText,
          description: "Document management",
        },
        {
          title: "Expert Booking",
          url: "/expert-booking",
          icon: Users,
          description: "Expert consultation",
        },
        {
          title: "Premium Features",
          url: "/premium-features",
          icon: Sparkles,
          description: "Achievements & more",
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          title: "Referral Programme",
          url: "/referral-dashboard",
          icon: Gift,
          description: "Earn by referring others",
        },
        {
          title: "Support",
          url: "/support",
          icon: HelpCircle,
          description: "Help & contact us",
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
          description: "Configuration & preferences",
        },
      ],
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <SidebarGroup className="py-2">
              <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 text-muted-foreground/80">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => {
                    const isActive = location === item.url;
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => setLocation(item.url)}
                          className={`cursor-pointer transition-colors py-2.5 px-3 rounded-md ${
                            isActive
                              ? "bg-primary/10 text-primary border-l-2 border-primary"
                              : "hover:bg-muted/50"
                          }`}
                          data-testid={`nav-button-${item.url}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className={`h-4 w-4 flex-shrink-0 ${item.comingSoon ? 'opacity-40' : 'opacity-70'}`} />
                            <span className={`text-sm font-medium truncate ${item.comingSoon ? 'opacity-50' : ''}`}>
                              {item.title}
                            </span>
                            {item.comingSoon && (
                              <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                Coming Soon
                              </span>
                            )}
                            {item.badge && !item.comingSoon && (
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                item.badge === "ADMIN"
                                  ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                                  : item.badge === "PARTNER"
                                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  : item.badge === "USER"
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : "text-muted-foreground bg-muted"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {idx < navGroups.length - 1 && <SidebarSeparator className="my-2 opacity-50" />}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-2 p-3 border-t">
          <div className="px-2 py-1.5">
            <div className="text-sm font-semibold text-foreground truncate">{currentUser?.displayName || "Demo User"}</div>
            <div className="text-xs text-muted-foreground truncate">{currentUser?.email || "demo@example.com"}</div>
          </div>
          {demoMode ? (
            <Button
              variant="default"
              size="sm"
              className="w-full justify-start gap-2 h-7 text-xs"
              onClick={() => setLocation("/login")}
              data-testid="sidebar-login-button"
            >
              <LogOut className="h-3 w-3" />
              Sign In / Sign Up
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start gap-2 h-7 text-xs"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="sidebar-logout-button"
            >
              <LogOut className="h-3 w-3" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
