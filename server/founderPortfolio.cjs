const express = require("express");
const { Pool } = require("pg");

const ROUTE = "/api/founder-portfolio";
const TOOL_ID = "founder-portfolio";
const application = express.application;

const MAX_ITEMS = 50;
const MAX_TEXT = 5000;
const MAX_PAYLOAD_BYTES = 200000;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

function isAuthenticated(req) {
  return Boolean(req.isAuthenticated && req.isAuthenticated() && req.user && req.user.id);
}

function text(value, maxLength = MAX_TEXT) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function optionalText(value, maxLength = MAX_TEXT) {
  const cleaned = text(value, maxLength);
  return cleaned || undefined;
}

function id(value) {
  const cleaned = text(value, 120);
  return cleaned || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function number(value, min = 0, max = 1000000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(min, Math.min(max, parsed));
}

function stringArray(value, maxItems = 30, maxLength = 100) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => text(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function normaliseGithubProject(value) {
  return {
    id: id(value?.id),
    repoName: text(value?.repoName, 200),
    repoUrl: text(value?.repoUrl, 1000),
    description: text(value?.description, 3000),
    technologies: stringArray(value?.technologies, 30, 100),
    stars: number(value?.stars, 0, 10000000),
    relevance: text(value?.relevance, 3000),
    source: optionalText(value?.source, 60),
  };
}

function normaliseDemo(value) {
  const platform = ["youtube", "vimeo", "loom", "other"].includes(String(value?.platform))
    ? String(value.platform)
    : "other";
  const type = ["mvp", "pitch", "technical", "walkthrough"].includes(String(value?.type))
    ? String(value.type)
    : "walkthrough";
  return {
    id: id(value?.id),
    title: text(value?.title, 300),
    url: text(value?.url, 1000),
    duration: text(value?.duration, 40),
    description: text(value?.description, 3000),
    platform,
    type,
    source: optionalText(value?.source, 60),
  };
}

function normaliseProject(value) {
  return {
    id: id(value?.id),
    projectName: text(value?.projectName, 300),
    clientName: optionalText(value?.clientName, 300),
    role: text(value?.role, 300),
    description: text(value?.description, 4000),
    outcomes: text(value?.outcomes, 4000),
    technologies: stringArray(value?.technologies, 30, 100),
    startDate: text(value?.startDate, 40),
    endDate: optionalText(value?.endDate, 40),
    referenceAvailable: Boolean(value?.referenceAvailable),
    source: optionalText(value?.source, 60),
  };
}

function normaliseReference(value) {
  const willingToProvide = ["linkedin", "email", "letter", "call"].includes(String(value?.willingToProvide))
    ? String(value.willingToProvide)
    : "email";
  return {
    id: id(value?.id),
    name: text(value?.name, 300),
    title: text(value?.title, 300),
    company: text(value?.company, 300),
    email: text(value?.email, 500),
    phone: optionalText(value?.phone, 80),
    relationship: text(value?.relationship, 1000),
    yearsKnown: number(value?.yearsKnown, 0, 100) || 0,
    willingToProvide,
    source: optionalText(value?.source, 60),
  };
}

function normaliseCredential(value) {
  const type = ["degree", "certification", "award", "patent", "publication"].includes(String(value?.type))
    ? String(value.type)
    : "certification";
  return {
    id: id(value?.id),
    type,
    title: text(value?.title, 500),
    issuer: text(value?.issuer, 500),
    date: text(value?.date, 40),
    url: optionalText(value?.url, 1000),
    relevance: text(value?.relevance, 3000),
    source: optionalText(value?.source, 60),
  };
}

function validItem(item, requiredFields) {
  return requiredFields.every((field) => text(item?.[field], 10).length > 0);
}

function emptyPortfolio() {
  return {
    githubUsername: "",
    githubProjects: [],
    demos: [],
    projects: [],
    references: [],
    credentials: [],
  };
}

function normalisePortfolio(value) {
  const portfolio = value && typeof value === "object" ? value : {};
  return {
    githubUsername: text(portfolio.githubUsername, 100),
    githubProjects: (Array.isArray(portfolio.githubProjects) ? portfolio.githubProjects : [])
      .slice(0, MAX_ITEMS)
      .map(normaliseGithubProject)
      .filter((item) => validItem(item, ["repoName", "repoUrl"])),
    demos: (Array.isArray(portfolio.demos) ? portfolio.demos : [])
      .slice(0, MAX_ITEMS)
      .map(normaliseDemo)
      .filter((item) => validItem(item, ["title", "url"])),
    projects: (Array.isArray(portfolio.projects) ? portfolio.projects : [])
      .slice(0, MAX_ITEMS)
      .map(normaliseProject)
      .filter((item) => validItem(item, ["projectName", "role"])),
    references: (Array.isArray(portfolio.references) ? portfolio.references : [])
      .slice(0, MAX_ITEMS)
      .map(normaliseReference)
      .filter((item) => validItem(item, ["name", "email"])),
    credentials: (Array.isArray(portfolio.credentials) ? portfolio.credentials : [])
      .slice(0, MAX_ITEMS)
      .map(normaliseCredential)
      .filter((item) => validItem(item, ["title", "issuer"])),
  };
}

function calculateScore(portfolio) {
  let score = 0;
  if (portfolio.githubProjects.length >= 3) score += 20;
  else if (portfolio.githubProjects.length >= 1) score += 10;

  if (portfolio.demos.length >= 2) score += 20;
  else if (portfolio.demos.length >= 1) score += 10;

  if (portfolio.projects.length >= 5) score += 20;
  else if (portfolio.projects.length >= 3) score += 15;
  else if (portfolio.projects.length >= 1) score += 10;

  if (portfolio.references.length >= 3) score += 20;
  else if (portfolio.references.length >= 2) score += 15;
  else if (portfolio.references.length >= 1) score += 10;

  if (portfolio.credentials.length >= 3) score += 20;
  else if (portfolio.credentials.length >= 1) score += 10;

  return Math.min(100, score);
}

function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractGithubUrls(...values) {
  const combined = values.filter(Boolean).join("\n");
  const matches = combined.match(/https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/gi) || [];
  return uniqueBy(matches.map((url) => url.replace(/[),.;]+$/, "")), (url) => url.toLowerCase()).slice(0, 20);
}

function splitEvidenceLines(value, maxItems = 8) {
  const raw = text(value, 12000);
  if (!raw) return [];
  const parts = raw
    .split(/\n+|\s*[•·]\s*|\s*;\s*/)
    .map((item) => item.replace(/^[-–—\d.)\s]+/, "").trim())
    .filter((item) => item.length >= 8);
  return uniqueBy(parts, (item) => item.toLowerCase()).slice(0, maxItems);
}

async function loadStoredPortfolio(db, userId) {
  const result = await db.query(
    `SELECT id, progress_data, completion_percent, status, updated_at
       FROM tool_progress
      WHERE user_id = $1 AND tool_id = $2
      ORDER BY updated_at DESC
      LIMIT 1`,
    [userId, TOOL_ID],
  );
  const row = result.rows[0] || null;
  const data = safeJson(row?.progress_data, {});
  return {
    row,
    portfolio: normalisePortfolio(data.portfolio || data),
  };
}

async function saveStoredPortfolio(db, userId, value) {
  const portfolio = normalisePortfolio(value);
  const score = calculateScore(portfolio);
  const status = score >= 70 ? "completed" : score > 0 ? "in_progress" : "not_started";
  const progressData = JSON.stringify({
    source: "account",
    portfolio,
    score,
    updatedAt: new Date().toISOString(),
  });

  if (Buffer.byteLength(progressData, "utf8") > MAX_PAYLOAD_BYTES) {
    const error = new Error("Founder portfolio is too large");
    error.statusCode = 413;
    throw error;
  }

  const existing = await db.query(
    `SELECT id FROM tool_progress
      WHERE user_id = $1 AND tool_id = $2
      ORDER BY updated_at DESC
      LIMIT 1`,
    [userId, TOOL_ID],
  );

  if (existing.rows[0]?.id) {
    await db.query(
      `UPDATE tool_progress
          SET progress_data = $1::jsonb,
              completion_percent = $2,
              status = $3,
              updated_at = NOW()
        WHERE id = $4 AND user_id = $5`,
      [progressData, score, status, existing.rows[0].id, userId],
    );
  } else {
    await db.query(
      `INSERT INTO tool_progress (user_id, tool_id, progress_data, completion_percent, status, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), NOW())`,
      [userId, TOOL_ID, progressData, score, status],
    );
  }

  return { portfolio, score, status };
}

async function loadAccountEvidence(db, userId) {
  const [planResult, documentsResult] = await Promise.all([
    db.query(
      `SELECT id, business_name, tech_stack, founder_education, founder_work_history,
              founder_achievements, relevant_projects, supporting_evidence, created_at
         FROM business_plans
        WHERE user_id = $1 AND LOWER(COALESCE(status, '')) = 'completed'
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    ).catch(() => ({ rows: [] })),
    db.query(
      `SELECT id, name, category, status, created_at
         FROM user_documents
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 100`,
      [userId],
    ).catch(() => ({ rows: [] })),
  ]);

  const plan = planResult.rows[0] || null;
  const documents = documentsResult.rows || [];

  const githubUrls = plan
    ? extractGithubUrls(plan.relevant_projects, plan.supporting_evidence, plan.founder_achievements)
    : [];

  const suggestedGithubProjects = githubUrls.map((url, index) => {
    const repoName = url.split("/").filter(Boolean).pop() || `Repository ${index + 1}`;
    return normaliseGithubProject({
      id: `account-github-${index + 1}`,
      repoName,
      repoUrl: url,
      description: "GitHub repository referenced in the completed business-plan evidence.",
      technologies: stringArray(String(plan?.tech_stack || "").split(/,|\||\n/), 20, 100),
      relevance: "Imported from the applicant's completed business-plan evidence. Review before relying on it.",
      source: "business-plan",
    });
  });

  const projectLines = plan ? splitEvidenceLines(plan.relevant_projects, 5) : [];
  const suggestedProjects = projectLines.map((line, index) => normaliseProject({
    id: `account-project-${index + 1}`,
    projectName: line.length > 100 ? `${line.slice(0, 97)}...` : line,
    clientName: "",
    role: "Founder / technical delivery",
    description: line,
    outcomes: index === 0 ? text(plan?.founder_achievements, 3000) : "",
    technologies: stringArray(String(plan?.tech_stack || "").split(/,|\||\n/), 20, 100),
    startDate: plan?.created_at ? new Date(plan.created_at).toISOString().slice(0, 10) : "",
    referenceAvailable: false,
    source: "business-plan",
  }));

  const educationLines = plan ? splitEvidenceLines(plan.founder_education, 5) : [];
  const credentialDocuments = documents.filter((doc) => /education|degree|certificate|certification|licen[cs]e|qualification/i.test(`${doc.name} ${doc.category}`));

  return {
    latestCompletedPlan: plan
      ? {
          id: plan.id,
          businessName: plan.business_name,
          founderEducation: plan.founder_education || "",
          founderWorkHistory: plan.founder_work_history || "",
          founderAchievements: plan.founder_achievements || "",
          relevantProjects: plan.relevant_projects || "",
          techStack: plan.tech_stack || "",
          createdAt: plan.created_at || null,
        }
      : null,
    documents: documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      category: doc.category,
      status: doc.status,
      createdAt: doc.created_at,
    })),
    suggestions: {
      githubProjects: suggestedGithubProjects,
      projects: suggestedProjects,
      educationLines,
      credentialDocuments: credentialDocuments.map((doc) => ({ id: doc.id, name: doc.name, category: doc.category })),
    },
  };
}

async function handleGet(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });
    const db = getPool();
    const userId = req.user.id;
    const [{ row, portfolio }, accountEvidence] = await Promise.all([
      loadStoredPortfolio(db, userId),
      loadAccountEvidence(db, userId),
    ]);
    const score = calculateScore(portfolio);
    res.setHeader("Cache-Control", "no-store");
    return res.json({
      portfolio,
      score,
      status: score >= 70 ? "strong" : score >= 40 ? "moderate" : "weak",
      updatedAt: row?.updated_at || null,
      accountEvidence,
    });
  } catch (error) {
    console.error("[FOUNDER PORTFOLIO] Failed to load:", error);
    return res.status(500).json({ error: "Failed to load founder portfolio" });
  }
}

async function handlePut(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });
    const value = req.body?.portfolio && typeof req.body.portfolio === "object" ? req.body.portfolio : req.body;
    const saved = await saveStoredPortfolio(getPool(), req.user.id, value);
    res.setHeader("Cache-Control", "no-store");
    return res.json({ success: true, ...saved, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[FOUNDER PORTFOLIO] Failed to save:", error);
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({ error: status === 413 ? "Founder portfolio is too large" : "Failed to save founder portfolio" });
  }
}

async function handleImportAccount(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });
    const db = getPool();
    const userId = req.user.id;
    const [{ portfolio }, accountEvidence] = await Promise.all([
      loadStoredPortfolio(db, userId),
      loadAccountEvidence(db, userId),
    ]);

    const suggestedGithub = accountEvidence.suggestions.githubProjects || [];
    const suggestedProjects = accountEvidence.suggestions.projects || [];
    const merged = {
      ...portfolio,
      githubProjects: uniqueBy([...portfolio.githubProjects, ...suggestedGithub], (item) => String(item.repoUrl || "").toLowerCase()).slice(0, MAX_ITEMS),
      projects: uniqueBy([...portfolio.projects, ...suggestedProjects], (item) => `${item.projectName}|${item.description}`.toLowerCase()).slice(0, MAX_ITEMS),
    };
    const saved = await saveStoredPortfolio(db, userId, merged);
    return res.json({
      success: true,
      imported: {
        githubProjects: Math.max(0, saved.portfolio.githubProjects.length - portfolio.githubProjects.length),
        projects: Math.max(0, saved.portfolio.projects.length - portfolio.projects.length),
      },
      ...saved,
      accountEvidence,
    });
  } catch (error) {
    console.error("[FOUNDER PORTFOLIO] Failed to import account evidence:", error);
    return res.status(500).json({ error: "Failed to import account evidence" });
  }
}

async function handleImportGithub(req, res) {
  try {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "Authentication required" });
    const username = text(req.body?.username, 100);
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(username)) {
      return res.status(400).json({ error: "Enter a valid GitHub username" });
    }

    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "innovator-founder-visa-assistant",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 502).json({ error: response.status === 404 ? "GitHub user not found" : "GitHub import is temporarily unavailable" });
    }
    const repos = await response.json();
    if (!Array.isArray(repos)) return res.status(502).json({ error: "Unexpected GitHub response" });

    const importedRepos = repos
      .filter((repo) => repo && !repo.fork && !repo.archived && repo.html_url && repo.name)
      .slice(0, 20)
      .map((repo) => normaliseGithubProject({
        id: `github-${repo.id || repo.name}`,
        repoName: repo.name,
        repoUrl: repo.html_url,
        description: repo.description || "",
        technologies: repo.language ? [repo.language] : [],
        stars: repo.stargazers_count || 0,
        relevance: "Imported from the founder's public GitHub profile. Add a short relevance note for endorsement use.",
        source: "github-public-api",
      }));

    const db = getPool();
    const { portfolio } = await loadStoredPortfolio(db, req.user.id);
    const merged = {
      ...portfolio,
      githubUsername: username,
      githubProjects: uniqueBy([...portfolio.githubProjects, ...importedRepos], (item) => String(item.repoUrl || "").toLowerCase()).slice(0, MAX_ITEMS),
    };
    const saved = await saveStoredPortfolio(db, req.user.id, merged);
    return res.json({ success: true, imported: importedRepos.length, ...saved });
  } catch (error) {
    console.error("[FOUNDER PORTFOLIO] GitHub import failed:", error);
    return res.status(500).json({ error: "Failed to import GitHub repositories" });
  }
}

function installRoutes(app, originalGet, originalPut, originalPost) {
  if (app.__founderPortfolioRoutesInstalled) return;
  Object.defineProperty(app, "__founderPortfolioRoutesInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  originalGet.call(app, ROUTE, handleGet);
  originalPut.call(app, ROUTE, handlePut);
  originalPost.call(app, `${ROUTE}/import-account`, handleImportAccount);
  originalPost.call(app, `${ROUTE}/import-github`, handleImportGithub);
}

if (!application.__founderPortfolioHookInstalled) {
  const originalGet = application.get;
  const originalPut = application.put;
  const originalPost = application.post;

  Object.defineProperty(application, "__founderPortfolioHookInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function founderPortfolioGet(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoutes(this, originalGet, originalPut, originalPost);
    return originalGet.call(this, path, ...handlers);
  };

  application.put = function founderPortfolioPut(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoutes(this, originalGet, originalPut, originalPost);
    return originalPut.call(this, path, ...handlers);
  };

  application.post = function founderPortfolioPost(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;
    if (isRouteRegistration) installRoutes(this, originalGet, originalPut, originalPost);
    return originalPost.call(this, path, ...handlers);
  };
}
