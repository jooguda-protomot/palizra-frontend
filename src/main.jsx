import * as Sentry from "@sentry/react";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPanel from "./AdminPanel.jsx";
import AnalysesPage from "./AnalysesPage.jsx";
import CorrectionsPage from "./CorrectionsPage.jsx";
import SuggestPage from "./SuggestPage.jsx";

Sentry.init({
  dsn: "https://8feb21459f3af15423099f4cdf13b534@o4511713083785216.ingest.de.sentry.io/4511713121534032",
  environment: "production",
  tracesSampleRate: 0.2,
  integrations: [Sentry.browserTracingIntegration()],
});

const path = window.location.pathname;
const isAdmin = path === "/admin";
const isAnalyses = path === "/analyses" || path.startsWith("/analyses/");
const isCorrections = path === "/corrections";
const isSuggest = path === "/suggest";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminPanel /> : isAnalyses ? <AnalysesPage /> : isCorrections ? <CorrectionsPage /> : isSuggest ? <SuggestPage /> : <App />}
  </StrictMode>
);
