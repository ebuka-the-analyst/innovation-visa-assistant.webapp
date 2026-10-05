import { Link } from "wouter";
import { ArrowRight, BookOpen, Building2, CheckCircle2, FileText } from "lucide-react";

const TOPIC_LINKS = [
  {
    href: "/guide",
    label: "Innovator Founder Visa guide",
    description: "Understand the route, preparation stages and application-readiness workflow.",
    icon: BookOpen,
  },
  {
    href: "/business-plan-template",
    label: "Business plan preparation",
    description: "Structure innovation, viability, scalability, market and financial evidence.",
    icon: FileText,
  },
  {
    href: "/endorsing-bodies",
    label: "Endorsement preparation",
    description: "Review endorsement-readiness information and preparation resources.",
    icon: Building2,
  },
  {
    href: "/eligibility",
    label: "Eligibility preparation",
    description: "Organise information relevant to eligibility and route requirements.",
    icon: CheckCircle2,
  },
] as const;

export function SeoTopicLinks({
  excludePath,
  heading = "Related Innovator Founder resources",
}: {
  excludePath?: string;
  heading?: string;
}) {
  const links = TOPIC_LINKS.filter((item) => item.href !== excludePath);

  return (
    <section
      className="mx-auto my-10 max-w-6xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="seo-topic-links-heading"
    >
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <h2 id="seo-topic-links-heading" className="text-lg font-semibold">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue with the resource that matches the part of your preparation you are working on.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {item.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
