const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "client/src/components/admin/LawyerTeamManagement.tsx");
let source = fs.readFileSync(target, "utf8");
let next = source;

const queryOld = `  const { data: lawyers = [], isLoading, isFetching, refetch } = useQuery<Lawyer[]>({\n    queryKey: ["/api/admin/lawyers"],\n  });`;
const queryNew = `  const { data: lawyers = [], isLoading, isFetching, isError, error, refetch } = useQuery<Lawyer[]>({\n    queryKey: ["/api/admin/lawyers"],\n    retry: 1,\n  });`;

if (next.includes(queryOld)) {
  next = next.replace(queryOld, queryNew);
}

const emptyBranch = `          ) : lawyers.length === 0 ? (\n            <div className="py-14 text-center">`;
const resilientBranch = `          ) : isError ? (\n            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center" data-testid="lawyer-team-load-error">\n              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"><RefreshCw className="h-6 w-6 text-destructive" /></div>\n              <h3 className="mt-4 font-semibold">Could not load the Lawyer Team</h3>\n              <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">{error instanceof Error ? error.message : "The admin API did not return the Lawyer Team. Nothing has been deleted or changed."}</p>\n              <Button className="mt-4" variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={\`mr-2 h-4 w-4 \${isFetching ? "animate-spin" : ""}\`} /> {isFetching ? "Retrying..." : "Retry"}</Button>\n            </div>\n          ) : lawyers.length === 0 ? (\n            <div className="py-14 text-center">`;

if (next.includes(emptyBranch)) {
  next = next.replace(emptyBranch, resilientBranch);
}

const performanceOld = `value={\`${performance.approvalRate ?? 0}%\`}`;
const performanceNew = `value={performance.completedReviews > 0 ? \`${performance.approvalRate ?? 0}%\` : "—"}`;
if (next.includes(performanceOld)) {
  next = next.replace(performanceOld, performanceNew);
}

if (!next.includes("lawyer-team-load-error")) {
  throw new Error("Could not install Lawyer Team API failure state");
}
if (!next.includes("retry: 1")) {
  throw new Error("Could not install Lawyer Team query retry policy");
}
if (!next.includes('performance.completedReviews > 0 ?')) {
  throw new Error("Could not harden empty Lawyer Team performance display");
}

if (next !== source) {
  fs.writeFileSync(target, next, "utf8");
  console.log("[lawyer-team] installed production loading/error hardening");
} else {
  console.log("[lawyer-team] production loading/error hardening already present");
}
