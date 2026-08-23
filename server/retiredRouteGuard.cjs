require("./securityStartupGuard.cjs");

const express = require("express");

require("./founderPortfolio.cjs");
require("./toolPlatform.cjs");
require("./applicationContextPrefill.cjs");
require("./eligibilityEngine.cjs");
require("./ivsEngine.cjs");
require("./financialModelEngine.cjs");

const RETIRED_CREDIT_GRANT_ROUTE = "/api/credits/grant-tier-credits";
const RETIRED_DISPUTE_EVIDENCE_ROUTE = "/dispute-evidence";
const CUSTOMER360_AUTH_READY_ROUTE = "/api/pricing";
const application = express.application;

if (!application.__legacyCreditGrantRouteGuardInstalled) {
  const originalPost = application.post;

  Object.defineProperty(application, "__legacyCreditGrantRouteGuardInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.post = function guardedPost(path, ...handlers) {
    if (path === RETIRED_CREDIT_GRANT_ROUTE) {
      return originalPost.call(this, path, (_req, res) => {
        return res.status(410).json({
          error: "Endpoint retired",
          message: "Credits are granted only through verified payment, promo, referral, or administrator flows.",
        });
      });
    }
    return originalPost.call(this, path, ...handlers);
  };
}

if (!application.__disputeEvidenceRouteGuardInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__disputeEvidenceRouteGuardInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function guardedGet(path, ...handlers) {
    if (path === RETIRED_DISPUTE_EVIDENCE_ROUTE && handlers.length > 0) {
      return originalGet.call(this, path, (_req, res) => res.sendStatus(404));
    }
    return originalGet.call(this, path, ...handlers);
  };
}

// registerRoutes() installs session + Passport before it registers /api/pricing.
// Use that existing auth-ready boundary once to register protected extension
// routes explicitly. The individual Progress Tracker and questionnaire modules
// no longer monkey-patch express.application or attempt to authenticate before
// Passport is installed.
if (!application.__authReadyExtensionsBootstrapInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__authReadyExtensionsBootstrapInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function authReadyExtensionsGet(path, ...handlers) {
    const isRouteRegistration = typeof path === "string" && path.startsWith("/") && handlers.length > 0;

    if (
      isRouteRegistration &&
      path === CUSTOMER360_AUTH_READY_ROUTE &&
      !application.__authReadyExtensionsLoaded
    ) {
      Object.defineProperty(application, "__authReadyExtensionsLoaded", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      const { registerBusinessPlanStatusRoutes } = require("./businessPlanStatus.cjs");
      const { registerProgressTrackerRoutes } = require("./progressTracker.cjs");
      const { registerQuestionnaireDraftRoutes } = require("./questionnaireDraftSync.cjs");

      registerBusinessPlanStatusRoutes(this);
      registerProgressTrackerRoutes(this);
      registerQuestionnaireDraftRoutes(this);

      // Customer 360 still uses its historical wrapper internally. Keep it at
      // the same post-auth boundary until that subsystem is migrated separately.
      require("./customer360LocationContext.cjs");
      require("./customer360Admin.cjs");

      return application.get.call(this, path, ...handlers);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
