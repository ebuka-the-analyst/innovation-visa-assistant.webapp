import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorLogger";
import { initPerformanceMonitor } from "./lib/performanceMonitor";

initPerformanceMonitor();

createRoot(document.getElementById("root")!).render(<App />);
