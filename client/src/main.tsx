import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CacheProvider } from "./services/cache/cache-manager";
import "./ui-system/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CacheProvider>
      <App />
    </CacheProvider>
  </React.StrictMode>
);
