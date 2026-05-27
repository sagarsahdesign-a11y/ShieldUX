"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Eye,
  Layers,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Lock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Finding {
  level: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  recommendation: string;
}

interface AuditReport {
  trustScore: number;
  summary: string;
  uxFindings: Finding[];
  accessibilityFindings: Finding[];
  securityFindings: Finding[];
  codexRecommendations: string[];
  demoMode?: boolean;
}

const STEPS = [
  "Analyzing screenshot layout and components...",
  "Running WCAG accessibility & contrast checks...",
  "Evaluating security posture & credential leakage...",
  "Compiling results and generating Codex suggestions..."
];

export default function ResultsPage() {
  const router = useRouter();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"security" | "a11y" | "ux" | "codex">("security");
  
  // Copy utility state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function performAudit(imgBase64: string) {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imgBase64 }),
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to perform audit.`);
      }

      const data = (await res.json()) as AuditReport;
      setReport(data);
      setLoading(false);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during analysis.";
      setError(message);
      setLoading(false);
    }
  }

  // Read screenshot from local storage and trigger analysis
  useEffect(() => {
    const saved = localStorage.getItem("shieldUxScreenshot");
    if (!saved) {
      setError("No screenshot was uploaded. Please return to the upload page.");
      setLoading(false);
      return;
    }
    setScreenshot(saved);
    performAudit(saved);
  }, []);

  // Step progression animation during loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple Markdown & Code block renderer helper for Codex recommendations
  const renderMarkdownContent = (text: string, recIndex: number) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Extract language and code
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "";
        const code = match ? match[2] : part.slice(3, -3);
        const uniqueKey = `${recIndex}-${index}`;
        const isThisCopied = copiedIndex === index + recIndex * 100;

        return (
          <div key={uniqueKey} className="my-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden font-mono text-sm shadow-inner z-0">
            <div className="bg-zinc-900/60 px-4 py-2 border-b border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
              <span className="font-semibold tracking-wider text-[10px] text-zinc-500 uppercase">{lang || "code"}</span>
              <button
                onClick={() => handleCopyCode(code, index + recIndex * 100)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-semibold active:scale-95 cursor-pointer"
              >
                {isThisCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-zinc-300">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // Parse basic lists and headers
        return part.split("\n").map((line, lIdx) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={`${recIndex}-${index}-${lIdx}`} className="text-base font-bold text-white mt-4 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 rounded-full bg-emerald-400" />
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li key={`${recIndex}-${index}-${lIdx}`} className="ml-4 list-disc text-zinc-300 my-1.5 pl-1 leading-relaxed">
                {line.substring(2)}
              </li>
            );
          }
          if (line.trim() === "") return <div key={`${recIndex}-${index}-${lIdx}`} className="h-2" />;
          return (
            <p key={`${recIndex}-${index}-${lIdx}`} className="text-zinc-300 my-1.5 leading-relaxed text-sm">
              {line}
            </p>
          );
        });
      }
    });
  };

  // Severity badge color mapping
  const getSeverityStyles = (level: "HIGH" | "MEDIUM" | "LOW") => {
    switch (level) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  // Trust Score Color Category
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 90) return "stroke-emerald-400";
    if (score >= 70) return "stroke-amber-400";
    return "stroke-rose-400";
  };

  // Redirect to start a clean audit
  const handleReset = () => {
    localStorage.removeItem("shieldUxScreenshot");
    router.push("/audit");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-10 py-5 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            ShieldUX
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded-xl border border-zinc-800 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Audit
          </button>
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-6 py-20 text-center z-10">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Audit Interrupted</h2>
          <p className="text-zinc-400 mb-8">{error}</p>
          <button
            onClick={handleReset}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Upload
          </button>
        </div>
      )}

      {/* Loading analysis screen */}
      {loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-6 py-12 z-10">
          <div className="w-full bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            {/* Glowing active indicator */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

            <div className="relative w-24 h-24 mx-auto mb-8 flex items-center justify-center">
              {/* Outer rotating circle */}
              <div className="absolute inset-0 border-4 border-emerald-500/10 border-t-emerald-400 rounded-full animate-spin" />
              {/* Inner pulsed logo */}
              <ShieldAlert className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Analyzing Product Interface</h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-10">
              Running advanced OCR, accessibility checks, and security heuristics on your screenshot.
            </p>

            {/* Checklist items */}
            <div className="max-w-md mx-auto space-y-3.5 text-left border-t border-zinc-800/80 pt-8">
              {STEPS.map((step, idx) => {
                const isCompleted = currentStep > idx;
                const isActive = currentStep === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className={`text-sm ${isActive ? "font-semibold text-zinc-100" : "text-zinc-400"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audit Dashboard Report */}
      {!loading && !error && report && (
        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 z-10 flex flex-col gap-8">
          
          {/* Demo Mode Notice */}
          {report.demoMode && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">Demo Sandbox Simulation Mode</h4>
                  <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                    No active <code>OPENAI_API_KEY</code> detected in <code>.env.local</code>. Running a simulated high-fidelity analysis to test dashboard capabilities.
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/sagarsahdesign-a11y/ShieldUX"
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-1 whitespace-nowrap transition-colors"
              >
                <span>View Repository</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Core Analytics Header Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Trust Score Card */}
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl lg:col-span-1">
              <div className="absolute top-4 left-4 text-xs font-mono text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" /> RISK SCOREMETRY
              </div>
              
              {/* Circular SVG Gauge */}
              <div className="relative w-44 h-44 mt-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-zinc-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={`transition-all duration-1000 ease-out ${getScoreStrokeColor(report.trustScore)}`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * report.trustScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute text-center">
                  <span className={`text-5xl font-extrabold tracking-tight ${getScoreColor(report.trustScore)}`}>
                    {report.trustScore}
                  </span>
                  <span className="text-zinc-500 block text-xs font-semibold mt-0.5">TRUST INDEX</span>
                </div>
              </div>

              <div className="mt-6 text-center max-w-xs">
                <h3 className="font-bold text-zinc-200">
                  {report.trustScore >= 90 ? "Excellent Trust Score" : report.trustScore >= 70 ? "Vulnerabilities Detected" : "Severe Security & UX Risks"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {report.trustScore >= 90 
                    ? "Your screen adheres closely to standard UX, a11y, and secure data handling guidelines."
                    : report.trustScore >= 70 
                    ? "Minor code structure adjustments and visibility tweaks are required to satisfy WCAG AA standards."
                    : "Immediate action required. Exposed credentials, dark UX patterns, or critical contract errors were flagged."
                  }
                </p>
              </div>
            </div>

            {/* Column 2 & 3: Screenshot preview and overview counts */}
            <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center lg:col-span-2 shadow-xl">
              
              {/* Image Preview Container */}
              {screenshot && (
                <div className="w-full md:w-1/2 max-h-[220px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshot}
                    alt="Audited Screenshot"
                    className="w-full h-full object-contain max-h-[220px]"
                  />
                </div>
              )}

              <div className="flex-1 flex flex-col justify-between w-full h-full py-2">
                <div>
                  <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-500/10 mb-3">
                    <Sparkles className="w-3 h-3" /> Audit Finished
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Interface Report Card</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {report.summary}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/60 pt-4">
                  <div className="text-center bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/30">
                    <span className="text-lg font-bold text-rose-400 block">{report.securityFindings.length}</span>
                    <span className="text-[10px] font-medium text-zinc-500 tracking-wide uppercase">Security</span>
                  </div>
                  <div className="text-center bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/30">
                    <span className="text-lg font-bold text-amber-400 block">{report.accessibilityFindings.length}</span>
                    <span className="text-[10px] font-medium text-zinc-500 tracking-wide uppercase">Accessibility</span>
                  </div>
                  <div className="text-center bg-zinc-950/40 rounded-xl p-3 border border-zinc-800/30">
                    <span className="text-lg font-bold text-blue-400 block">{report.uxFindings.length}</span>
                    <span className="text-[10px] font-medium text-zinc-500 tracking-wide uppercase">UX Friction</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Findings Section */}
          <div className="bg-zinc-900/40 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-xl z-0">
            {/* Tabs Header */}
            <div className="flex border-b border-zinc-800/80 bg-zinc-900/60 overflow-x-auto">
              <button
                onClick={() => setActiveTab("security")}
                className={`px-6 py-4.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "security"
                    ? "border-emerald-500 text-emerald-400 bg-zinc-900/[0.05]"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Security & Privacy</span>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                  {report.securityFindings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("a11y")}
                className={`px-6 py-4.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "a11y"
                    ? "border-emerald-500 text-emerald-400 bg-zinc-900/[0.05]"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>Accessibility</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                  {report.accessibilityFindings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ux")}
                className={`px-6 py-4.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "ux"
                    ? "border-emerald-500 text-emerald-400 bg-zinc-900/[0.05]"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>UX Findings</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0 font-extrabold">
                  {report.uxFindings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("codex")}
                className={`px-6 py-4.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ml-auto bg-emerald-500/5 hover:bg-emerald-500/10 border-l border-zinc-800/80 cursor-pointer ${
                  activeTab === "codex"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-emerald-400"
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>Codex Actionable Suggestions</span>
              </button>
            </div>

            {/* Findings Content */}
            <div className="p-6 md:p-8">
              
              {/* Tab 1: Security */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  {report.securityFindings.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">No security concerns flagged. Clean scan!</div>
                  ) : (
                    report.securityFindings.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-5 flex flex-col sm:flex-row items-start gap-4 transition-all hover:border-zinc-700/80">
                        <div className={`text-xs font-extrabold tracking-wider border px-3 py-1.5 rounded-xl shrink-0 ${getSeverityStyles(item.level)}`}>
                          {item.level}
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-zinc-100">{item.title}</h3>
                          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
                          <p className="text-sm text-emerald-300 mt-3 leading-relaxed">
                            <span className="font-bold">Fix: </span>
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Accessibility */}
              {activeTab === "a11y" && (
                <div className="space-y-6">
                  {report.accessibilityFindings.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">No accessibility violations flagged. Perfect contrast!</div>
                  ) : (
                    report.accessibilityFindings.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-5 flex flex-col sm:flex-row items-start gap-4 transition-all hover:border-zinc-700/80">
                        <div className={`text-xs font-extrabold tracking-wider border px-3 py-1.5 rounded-xl shrink-0 ${getSeverityStyles(item.level)}`}>
                          {item.level}
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-zinc-100">{item.title}</h3>
                          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
                          <p className="text-sm text-emerald-300 mt-3 leading-relaxed">
                            <span className="font-bold">Fix: </span>
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: UX Findings */}
              {activeTab === "ux" && (
                <div className="space-y-6">
                  {report.uxFindings.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">No UX flaws detected. Interface flow looks optimal!</div>
                  ) : (
                    report.uxFindings.map((item, idx) => (
                      <div key={idx} className="bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-5 flex flex-col sm:flex-row items-start gap-4 transition-all hover:border-zinc-700/80">
                        <div className={`text-xs font-extrabold tracking-wider border px-3 py-1.5 rounded-xl shrink-0 ${getSeverityStyles(item.level)}`}>
                          {item.level}
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-zinc-100">{item.title}</h3>
                          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{item.description}</p>
                          <p className="text-sm text-emerald-300 mt-3 leading-relaxed">
                            <span className="font-bold">Fix: </span>
                            {item.recommendation}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Codex Actionable Suggestions */}
              {activeTab === "codex" && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {report.codexRecommendations.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 text-sm">No suggestions. Everything looks outstanding!</div>
                  ) : (
                    report.codexRecommendations.map((rec, idx) => (
                      <div key={idx} className="bg-zinc-950/20 border border-zinc-850 rounded-3xl p-6 shadow-md transition-all hover:bg-zinc-950/30">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-7 h-7 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">AI Recommendation</span>
                        </div>
                        <div className="prose prose-invert max-w-none text-zinc-200">
                          {renderMarkdownContent(rec, idx)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
