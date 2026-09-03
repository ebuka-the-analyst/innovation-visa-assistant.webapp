import { Clock3, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLightImg from "@assets/official_logo.webp";
import logoDarkImg from "@assets/logo_dark.webp";

interface MaintenancePageProps {
  message: string;
  scheduledEnd: string | null;
}

function formatScheduledEnd(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export default function MaintenancePage({
  message,
  scheduledEnd,
}: MaintenancePageProps) {
  const formattedEnd = formatScheduledEnd(scheduledEnd);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 px-4 py-10 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl border border-amber-200/80 bg-white/95 p-6 text-center shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-amber-500/30 dark:bg-slate-900/95 sm:p-10">
          <div className="mb-8 flex justify-center">
            <div className="logo-container isolate overflow-hidden">
              <img
                src={logoLightImg}
                alt="UK Innovator Founder Visa Assistant"
                className="logo-light h-14 w-auto object-contain"
              />
              <img
                src={logoDarkImg}
                alt="UK Innovator Founder Visa Assistant"
                className="logo-dark h-14 w-auto object-contain"
              />
            </div>
          </div>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <Wrench className="h-10 w-10" aria-hidden="true" />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
            Scheduled maintenance
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            We’ll be back soon
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            {message}
          </p>

          {formattedEnd && (
            <div className="mx-auto mt-7 flex max-w-lg items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-800/70">
              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">Expected availability</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {formattedEnd}
                </p>
              </div>
            </div>
          )}

          <p className="mt-7 text-sm text-slate-500 dark:text-slate-400">
            This page checks automatically and will restore access when maintenance ends.
          </p>

          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <Button variant="ghost" size="sm" asChild>
              <a href="/login?maintenance-admin=1">
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Administrator sign in
              </a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
