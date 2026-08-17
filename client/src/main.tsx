import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorLogger";
import { initPerformanceMonitor } from "./lib/performanceMonitor";
import { initQuestionnaireDraftSync } from "./lib/questionnaireDraftSync";
import { armDeploymentAssetRecovery } from "./lib/deploymentAssetRecovery";
import { initCustomer360AdminEnhancer } from "./components/admin/Customer360Enhancer";
import { initCustomer360DialogBridge } from "./components/admin/customer360DialogBridge";

armDeploymentAssetRecovery();

async function bootstrap() {
  initPerformanceMonitor();

  // Hydrate the questionnaire auto-save from authenticated server storage before
  // React reads localStorage. Network failures are non-fatal; the existing local
  // auto-save remains the offline fallback.
  try {
    await initQuestionnaireDraftSync();
  } catch (error) {
    console.warn("[Questionnaire draft sync] Initial hydration failed.", error);
  }

  // Register the dialog bridge first so it can normalise the Account View title
  // before Customer 360 extracts the email from the dialog text.
  initCustomer360DialogBridge();
  initCustomer360AdminEnhancer();
  document.getElementById("customer-360-admin-enhancer-root")?.style.setProperty("pointer-events", "auto", "important");

  createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
