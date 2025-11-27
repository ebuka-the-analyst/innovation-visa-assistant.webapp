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
  
  if (!currentUser && !demoMode) return null;

  const navGroups: NavGroup[] = [
    ...(currentUser?.isAdmin && !demoMode
      ? [
          {
            label: "Admin",
            items: [
              {
                title: "Admin Dashboard",
                url: "/admin-dashboard",
                icon: Shield,
                description: "System analytics & management",
                badge: "ADMIN",
              },
            ],
          },
        ]
      : []),
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
          title: "Questionnaire",
          url: "/questionnaire",
          icon: FileText,
          description: "Business plan builder",
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
      label: "2040 AI Brain",
      items: [
        {
          title: "ORACLE Supervisor",
          url: "/oracle-supervisor",
          icon: Brain,
          description: "Master AI with 4 specialist agents",
          badge: "NEW",
        },
        {
          title: "Founder Autopilot",
          url: "/founder-autopilot",
          icon: Rocket,
          description: "Full visa automation mode",
          badge: "NEW",
        },
        {
          title: "Neural Twin",
          url: "/neural-twin",
          icon: Bot,
          description: "AI simulation of you for practice",
          badge: "NEW",
        },
        {
          title: "Voice Builder",
          url: "/voice-builder",
          icon: Mic,
          description: "Speak to build your documents",
          badge: "NEW",
        },
        {
          title: "Regulatory Copilot",
          url: "/regulatory-copilot",
          icon: Shield,
          description: "Real-time UK law monitoring",
          badge: "NEW",
        },
        {
          title: "Economic Impact",
          url: "/economic-impact",
          icon: Globe2,
          description: "UK job & GDP calculator",
          badge: "NEW",
        },
        {
          title: "Knowledge Graph",
          url: "/knowledge-graph",
          icon: Network,
          description: "Visual UK visa rules map",
          badge: "NEW",
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
          description: "100+ professional-level tools",
          badge: "100+",
        },
        {
          title: "Achievements",
          url: "/achievements",
          icon: Trophy,
          description: "Badges, milestones & certificates",
        },
        {
          title: "Template Library",
          url: "/template-library",
          icon: FolderOpen,
          description: "60+ document templates",
          badge: "60+",
        },
        {
          title: "AI Document Review",
          url: "/document-review",
          icon: Sparkles,
          description: "AI-powered document feedback",
          badge: "AI",
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
          description: "Live UK visa news updates",
          badge: "LIVE",
        },
        {
          title: "Calendar & Deadlines",
          url: "/calendar",
          icon: CalendarDays,
          description: "Track visa timeline",
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
          description: "Minimum investment by route",
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
          description: "Achievements, templates & more",
          badge: "NEW",
        },
      ],
    },
    {
      label: "Your Journey",
      items: [
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
        {
          title: "Support",
          url: "/support",
          icon: HelpCircle,
          description: "Help & contact us",
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
          description: "Earn money by referring others",
          badge: "EARN",
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
            <SidebarGroup className="py-1">
              <SidebarGroupLabel className="text-[10px] font-bold px-2 py-1 rounded-md mb-1" style={{ backgroundColor: "#ffa536", color: "#000000" }}>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const isActive = location === item.url;
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => setLocation(item.url)}
                          className={`cursor-pointer transition-all py-1.5 ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted"
                          }`}
                          data-testid={`nav-button-${item.url}`}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="text-sm font-medium leading-tight truncate">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </div>
                            </div>
                            {item.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                                item.badge === "ADMIN"
                                  ? "bg-orange-500 text-white"
                                  : item.badge === "PARTNER"
                                  ? "bg-blue-500 text-white"
                                  : "text-primary bg-primary/10"
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
            {idx < navGroups.length - 1 && <SidebarSeparator className="my-1" />}
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
              variant="outline"
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
