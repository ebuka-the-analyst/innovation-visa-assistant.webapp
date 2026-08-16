const express = require("express");

require("./customer360Admin.cjs");
require("./customer360LocationContext.cjs");
require("./progressTracker.cjs");

if (process.env.NODE_ENV === "production") {
  require("./creditReconciliationReset.cjs");
}

const RETIRED_CREDIT_GRANT_ROUTE = "/api/credits/grant-tier-credits";
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
