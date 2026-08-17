require("./securityStartupGuard.cjs");

const express = require("express");

require("./customer360Admin.cjs");
require("./customer360LocationContext.cjs");
require("./progressTracker.cjs");
require("./toolPlatform.cjs");
require("./applicationContextPrefill.cjs");
require("./eligibilityEngine.cjs");
require("./ivsEngine.cjs");
require("./financialModelEngine.cjs");

const RETIRED_CREDIT_GRANT_ROUTE = "/api/credits/grant-tier-credits";
const RETIRED_DISPUTE_EVIDENCE_ROUTE = "/dispute-evidence";
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
