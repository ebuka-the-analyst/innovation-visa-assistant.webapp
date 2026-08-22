const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "client/src/components/app-sidebar.tsx");
const source = fs.readFileSync(target, "utf8");
let next = source;

next = next
  .replace(
    'bg-[#005EB8]/20 ${',
    'bg-red-500/10 border border-red-500/20 text-red-950 dark:text-red-100 ${',
  )
  .replace(
    '"bg-[#005EB8]/30 text-primary"',
    '"bg-red-500/20 text-red-700 dark:text-red-300"',
  )
  .replace(
    '"hover:bg-[#005EB8]/30"',
    '"hover:bg-red-500/20"',
  )
  .replace(
    '"bg-primary/10 text-primary border-l-2 border-primary -ml-px"',
    '"bg-red-500/10 text-red-700 dark:text-red-300 border-l-2 border-red-500 -ml-px"',
  )
  .replace(
    'description: "Real-time UK law monitoring"',
    'description: "Official-source updates & application readiness"',
  )
  .replace(
    'description: "Feature performance tracking"',
    'description: "Visa journey feature navigation"',
  )
  .replace(
    'description: "Request for further evidence"',
    'description: "Evidence-gap mitigation planning"',
  );

if (next.includes("#005EB8")) {
  throw new Error("Blue sidebar group styling is still present");
}
if (!next.includes("bg-red-500/10 border border-red-500/20")) {
  throw new Error("Red sidebar group styling was not installed");
}
if (!next.includes("border-l-2 border-red-500")) {
  throw new Error("Red active navigation styling was not installed");
}

if (next !== source) {
  fs.writeFileSync(target, next, "utf8");
  console.log("[sidebar] red navigation styling installed");
} else {
  console.log("[sidebar] red navigation styling already present");
}
