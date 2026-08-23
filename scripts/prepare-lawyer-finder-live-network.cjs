const fs = require("fs");
const path = require("path");

const root = process.cwd();

function update(relative, transform) {
  const target = path.join(root, relative);
  const before = fs.readFileSync(target, "utf8");
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(target, after, "utf8");
    console.log(`[lawyer-finder-live] prepared ${relative}`);
  }
}

function addApprovalGate(source) {
  let next = source;
  const availableAnchor = "      AND l.is_available = true\n";
  if (!next.includes("a.review_status = 'approved'")) {
    next = next.replaceAll(
      availableAnchor,
      `${availableAnchor}      AND EXISTS (\n        SELECT 1 FROM expert_network_applications a\n        WHERE a.expert_id = l.id AND a.review_status = 'approved'\n      )\n`,
    );
  }

  const directBookingAnchor = "        WHERE l.id = $1 AND s.id = $2\n        LIMIT 1";
  if (next.includes(directBookingAnchor)) {
    next = next.replaceAll(
      directBookingAnchor,
      "        WHERE l.id = $1 AND s.id = $2\n          AND EXISTS (\n            SELECT 1 FROM expert_network_applications a\n            WHERE a.expert_id = l.id AND a.review_status = 'approved'\n          )\n        LIMIT 1",
    );
  }
  return next;
}

update("server/expertBookingRoutes.ts", addApprovalGate);
update("server/publicExpertBookingRoutes.ts", addApprovalGate);

update("server/expertApplicationRoutes.ts", (source) => {
  let next = source;

  next = next.replace(
    "years_experience, is_available, status, bio\n        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,true,'active',$11)",
    "years_experience, is_available, status, bio\n        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,false,'inactive',$11)",
  );

  next = next.replace(
    "await client.query(`UPDATE immigration_lawyers SET is_available = $2 WHERE id = $1`, [application.expertId, approved]);",
    "await client.query(`UPDATE immigration_lawyers SET is_available = $2, status = $3 WHERE id = $1`, [application.expertId, approved, approved ? \"active\" : \"inactive\"]);",
  );

  return next;
});

update("client/src/components/expert-booking/PublicExpertBooking.tsx", (source) => {
  let next = source;

  if (!next.includes("const requestedExpertId = useMemo(")) {
    const stateAnchor = '  const [selectedExpertId, setSelectedExpertId] = useState("");';
    if (!next.includes(stateAnchor)) throw new Error("Could not locate selected expert state");
    next = next.replace(
      stateAnchor,
      `${stateAnchor}\n  const requestedExpertId = useMemo(() => new URLSearchParams(window.location.search).get("expertId") || "", []);`,
    );
  }

  const oldDefault = `  useEffect(() => {\n    if (!selectedExpertId && experts.length) {\n      setSelectedExpertId(experts[0].id);\n      setSelectedServiceId(experts[0].services[0]?.id || \"\");\n    }\n  }, [experts, selectedExpertId]);`;
  const newDefault = `  useEffect(() => {\n    if (!selectedExpertId && experts.length) {\n      const requestedExpert = experts.find((expert) => expert.id === requestedExpertId);\n      const initialExpert = requestedExpert || experts[0];\n      setSelectedExpertId(initialExpert.id);\n      setSelectedServiceId(initialExpert.services[0]?.id || \"\");\n    }\n  }, [experts, requestedExpertId, selectedExpertId]);`;
  if (next.includes(oldDefault)) next = next.replace(oldDefault, newDefault);

  return next;
});

require("./validate-lawyer-finder-live-network.cjs");
console.log("[lawyer-finder-live] live directory and approval-gated onboarding prepared");
