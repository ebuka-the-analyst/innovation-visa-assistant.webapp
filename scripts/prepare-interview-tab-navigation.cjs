const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), "client/src/pages/interview-prep.tsx");
const source = fs.readFileSync(target, "utf8");
let next = source;

if (!next.includes('const [activeTab, setActiveTab] = useState("scenarios");')) {
  next = next.replace(
    '  const [selectedId, setSelectedId] = useState<string | null>(null);',
    '  const [selectedId, setSelectedId] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState("scenarios");',
  );
}

next = next.replace(
  '<Tabs defaultValue="scenarios" className="space-y-5">',
  '<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">',
);
next = next.replace(
  'onClick={() => document.querySelector<HTMLButtonElement>(\'[data-state="inactive"][value="practice"]\')?.click()}',
  'onClick={() => setActiveTab("practice")}',
);

if (!next.includes('value={activeTab} onValueChange={setActiveTab}')) {
  throw new Error("Interview Prep tabs are not controlled");
}
if (next.includes("document.querySelector<HTMLButtonElement>")) {
  throw new Error("Interview Prep still relies on DOM-query tab switching");
}
if (!next.includes('onClick={() => setActiveTab("practice")}')) {
  throw new Error("Practice-question action is not wired to the Practice tab");
}

if (next !== source) {
  fs.writeFileSync(target, next, "utf8");
  console.log("[interview] controlled tab navigation installed");
} else {
  console.log("[interview] controlled tab navigation already present");
}
