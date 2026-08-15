import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorLogger";
import { initPerformanceMonitor } from "./lib/performanceMonitor";
import { initCustomer360AdminEnhancer } from "./components/admin/Customer360Enhancer";

initPerformanceMonitor();
initCustomer360AdminEnhancer();

createRoot(document.getElementById("root")!).render(<App />);
