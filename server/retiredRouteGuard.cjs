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
          message:
            "Credits are granted only through verified payment, promo, referral, or administrator flows.",
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
    // Express also uses app.get(name) to read settings, so only intercept
    // actual route registration calls that include one or more handlers.
    if (path === RETIRED_DISPUTE_EVIDENCE_ROUTE && handlers.length > 0) {
      return originalGet.call(this, path, (_req, res) => res.sendStatus(404));
    }

    return originalGet.call(this, path, ...handlers);
  };
}

// These route modules require the session and Passport middleware installed by
// setupAuth. registerRoutes installs authentication before registering
// /api/pricing, so defer loading them until that known auth-ready boundary.
// This keeps the modules on the normal CommonJS preload path while ensuring
// authenticated requests reach Passport before their route handlers run.
if (!application.__customer360DeferredBootstrapInstalled) {
  const originalGet = application.get;

  Object.defineProperty(application, "__customer360DeferredBootstrapInstalled", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  application.get = function customer360DeferredGet(path, ...handlers) {
    const isRouteRegistration =
      typeof path === "string" && path.startsWith("/") && handlers.length > 0;

    if (
      isRouteRegistration &&
      path === CUSTOMER360_AUTH_READY_ROUTE &&
      !application.__customer360DeferredModulesLoaded
    ) {
      Object.defineProperty(application, "__customer360DeferredModulesLoaded", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      // Progress Tracker and questionnaire draft routes both depend on
      // req.isAuthenticated()/req.user and therefore must be registered only
      // after setupAuth has installed session + Passport middleware.
      require("./progressTracker.cjs");
      require("./questionnaireDraftSync.cjs");

      // Location enrichment must wrap the Customer 360 response before the
      // Customer 360 GET route itself is registered.
      require("./customer360LocationContext.cjs");
      require("./customer360Admin.cjs");

      // The requires above replace application.get with their route wrappers.
      // Re-enter through the newest wrapper so each deferred module can install
      // its protected routes, then continue registering /api/pricing.
      return application.get.call(this, path, ...handlers);
    }

    return originalGet.call(this, path, ...handlers);
  };
}
