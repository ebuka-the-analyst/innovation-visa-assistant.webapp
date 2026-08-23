// Compatibility shim retained for older imports. Business-plan completion
// reconciliation is now an explicit service used by authenticated routes rather
// than an Express route-registration monkey patch or startup task.
module.exports = require("./businessPlanStatus.cjs");
