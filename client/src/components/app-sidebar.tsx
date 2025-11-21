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

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { data: user } = useQuery<{ id: string; email: string; displayName?: string }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  if (!user) return null;

  const navGroups: NavGroup[] = [
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
          description: "PhD-level rejection strategies",
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
          description: "104+ visa application tools",
          badge: "100+",
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
      ],
    },
    {
      label: "Account",
      items: [
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
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold px-3 py-2 rounded-md" style={{ backgroundColor: "#ffa536", color: "#000000" }}>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = location === item.url;
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => setLocation(item.url)}
                          className={`cursor-pointer transition-all ${
                            isActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "hover:bg-muted"
                          }`}
                          data-testid={`nav-button-${item.url}`}
                        >
                          <div className="flex items-start gap-3 py-1">
                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium leading-tight">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </div>
                            </div>
                            {item.badge && (
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
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
            {idx < navGroups.length - 1 && <SidebarSeparator className="my-2" />}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-3 p-2 border-t">
          <div className="px-2 py-2 text-sm">
            <div className="font-semibold text-foreground">{user.displayName || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="sidebar-logout-button"
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
