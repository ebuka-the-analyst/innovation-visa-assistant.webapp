import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorLogger";
import { initPerformanceMonitor } from "./lib/performanceMonitor";
import { initCustomer360AdminEnhancer } from "./components/admin/Customer360Enhancer";
import { initCustomer360DialogBridge } from "./components/admin/customer360DialogBridge";

initPerformanceMonitor();
initCustomer360AdminEnhancer();
initCustomer360DialogBridge();
document.getElementById("customer-360-admin-enhancer-root")?.style.setProperty("pointer-events", "auto", "important");

createRoot(document.getElementById("root")!).render(<App />);
