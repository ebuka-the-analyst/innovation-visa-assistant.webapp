import { LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { queryClient } from "@/lib/queryClient";
import { innovatorFounderPath } from "@/lib/innovator-founder-routes";

const copy = {
  en: { signIn: "Sign In", dashboard: "Dashboard", signOut: "Sign Out", account: "Account" },
  es: { signIn: "Iniciar sesión", dashboard: "Panel", signOut: "Cerrar sesión", account: "Cuenta" },
  fr: { signIn: "Se connecter", dashboard: "Tableau de bord", signOut: "Se déconnecter", account: "Compte" },
  de: { signIn: "Anmelden", dashboard: "Dashboard", signOut: "Abmelden", account: "Konto" },
  zh: { signIn: "登录", dashboard: "控制面板", signOut: "退出登录", account: "账户" },
  ar: { signIn: "تسجيل الدخول", dashboard: "لوحة التحكم", signOut: "تسجيل الخروج", account: "الحساب" },
  pt: { signIn: "Iniciar sessão", dashboard: "Painel", signOut: "Terminar sessão", account: "Conta" },
  ja: { signIn: "ログイン", dashboard: "ダッシュボード", signOut: "ログアウト", account: "アカウント" },
} as const;

export default function PublicAccountControls({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const labels = copy[language] || copy.en;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      queryClient.setQueryData(["/api/auth/user"], null);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-xl border border-slate-200 bg-white/60 dark:border-white/10 dark:bg-white/5 ${compact ? "h-9 w-20" : "h-10 w-24"}`}
        aria-hidden="true"
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className="rounded-xl"
        onClick={() => setLocation("/login")}
      >
        {labels.signIn}
      </Button>
    );
  }

  const displayName =
    user.firstName?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    labels.account;

  return (
    <div className="flex items-center gap-1.5">
      {!compact && (
        <div
          className="hidden max-w-[160px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-2.5 py-2 text-sm font-medium text-slate-700 sm:flex dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          title={user.email}
        >
          <UserCircle2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{displayName}</span>
        </div>
      )}

      <Button
        variant="outline"
        size={compact ? "sm" : "default"}
        className="rounded-xl"
        onClick={() => setLocation(innovatorFounderPath("/dashboard"))}
      >
        <LayoutDashboard className="mr-1.5 h-4 w-4" />
        <span className={compact ? "hidden sm:inline" : ""}>{labels.dashboard}</span>
      </Button>

      <Button
        variant="ghost"
        size={compact ? "sm" : "default"}
        className="rounded-xl"
        onClick={handleLogout}
        aria-label={labels.signOut}
        title={labels.signOut}
      >
        <LogOut className="h-4 w-4" />
        {!compact && <span className="ml-1.5 hidden xl:inline">{labels.signOut}</span>}
      </Button>
    </div>
  );
}
