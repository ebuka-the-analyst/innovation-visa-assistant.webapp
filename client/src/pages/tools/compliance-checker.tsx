if (typeof window !== "undefined") {
  window.localStorage.removeItem("complianceCheckerProgress");
  window.localStorage.removeItem("compliance-checker-state");
}

export { default } from "./compliance-checker-v2";
