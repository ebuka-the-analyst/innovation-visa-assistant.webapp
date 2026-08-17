const RECOVERY_KEY = "deployment-asset-reload-v2";
const STABLE_WINDOW_MS = 10_000;

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || "");
  }
  return "";
}

export function isDeploymentAssetError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase();
  return [
    "failed to fetch dynamically imported module",
    "dynamically imported module",
    "importing a module script failed",
    "loading chunk",
    "loading css chunk",
    "chunkloaderror",
    "failed to fetch module script",
  ].some((needle) => message.includes(needle));
}

function hasReloadAttempt(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_KEY) === "1";
  } catch {
    return false;
  }
}

function markReloadAttempt(): void {
  try {
    sessionStorage.setItem(RECOVERY_KEY, "1");
  } catch {
    // Storage can be unavailable in hardened/privacy browser modes. Reloading once
    // is still safer than leaving the user on a broken stale deployment shell.
  }
}

export function clearDeploymentAssetReloadAttempt(): void {
  try {
    sessionStorage.removeItem(RECOVERY_KEY);
  } catch {
    // Non-fatal: session storage is only used as a reload-loop guard.
  }
}

export function recoverFromDeploymentAssetError(error: unknown): boolean {
  if (!isDeploymentAssetError(error) || hasReloadAttempt()) return false;

  markReloadAttempt();
  window.location.reload();
  return true;
}

/**
 * Vite emits `vite:preloadError` when a lazy-loaded production chunk no longer
 * exists, which commonly happens when an already-open browser tab spans a new
 * deployment. Recover once by reloading the application shell so it receives the
 * current asset manifest. A second failure is allowed through to the normal error
 * boundary rather than creating a reload loop.
 */
export function armDeploymentAssetRecovery(): void {
  if (typeof window === "undefined") return;

  window.addEventListener("vite:preloadError", (event: Event) => {
    const preloadEvent = event as Event & { payload?: unknown };
    if (recoverFromDeploymentAssetError(preloadEvent.payload)) {
      event.preventDefault();
    }
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    if (recoverFromDeploymentAssetError(event.reason)) {
      event.preventDefault();
    }
  });

  // Once the newly loaded shell has remained stable long enough for its initial
  // lazy imports to resolve, allow a future deployment to use the one-time
  // recovery again in this same browser tab.
  window.setTimeout(clearDeploymentAssetReloadAttempt, STABLE_WINDOW_MS);
}
