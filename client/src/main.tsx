import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorLogger";
import { initPerformanceMonitor } from "./lib/performanceMonitor";
import { initCustomer360AdminEnhancer } from "./components/admin/Customer360Enhancer";
import { initCustomer360DialogBridge } from "./components/admin/customer360DialogBridge";

initPerformanceMonitor();
// Register the dialog bridge first so it can normalise the Account View title
// before Customer 360 extracts the email from the dialog text.
initCustomer360DialogBridge();
initCustomer360AdminEnhancer();
document.getElementById("customer-360-admin-enhancer-root")?.style.setProperty("pointer-events", "auto", "important");

createRoot(document.getElementById("root")!).render(<App />);
