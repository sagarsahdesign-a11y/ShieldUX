"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Layers,
  Eye,
  ShieldAlert,
  Terminal,
  Upload,
  Trash2,
  ArrowRight,
  Sparkles,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Globe,
  GitBranch,
  Frame,
  ArrowDown
} from "lucide-react";
import Link from "next/link";

interface Finding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  issue: string;
  fix: string;
}

interface CodexRecommendation {
  title: string;
  code: string;
}

interface AuditReport {
  riskScore: number;
  ux: Finding[];
  accessibility: Finding[];
  security: Finding[];
  codex: CodexRecommendation[];
  demoMode?: boolean;
}

const STEPS = [
  "Structuring layout coordinates...",
  "Applying WCAG accessibility contrast scanners...",
  "Evaluating credentials & PII exposures...",
  "Synthesizing findings & drafting Codex recommendations..."
];

export default function Home() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<"screenshot" | "url" | "repo" | "figma">("screenshot");

  // Dynamic Audit Integration State
  const [data, setData] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Tab controls for findings
  const [activeTab, setActiveTab] = useState<"security" | "a11y" | "ux" | "codex">("security");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load from localStorage if already uploaded previously
  useEffect(() => {
    const saved = localStorage.getItem("shieldUxScreenshot");
    if (saved) {
      setScreenshot(saved);
    }
  }, []);

  // Step progression animation during loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, JPEG).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setScreenshot(base64String);
      localStorage.setItem("shieldUxScreenshot", base64String);
      setData(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setScreenshot(null);
    setData(null);
    setError(null);
    localStorage.removeItem("shieldUxScreenshot");
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Perform Dynamic Audit
  const analyze = async () => {
    if (!screenshot) return;

    setLoading(true);
    setCurrentStep(0);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: screenshot }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to run audit.`);
      }

      const resJson = await res.json();
      
      let parsedReport: AuditReport;
      if (resJson.result) {
        parsedReport = JSON.parse(resJson.result);
      } else {
        parsedReport = resJson;
      }

      if (resJson.demoMode !== undefined) {
        parsedReport.demoMode = resJson.demoMode;
      }

      setData(parsedReport);
      setLoading(false);

      // Smooth scroll to the results section
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during the audit scan.");
      setLoading(false);
    }
  };

  // Trigger demo audit immediately with built-in mock screenshot
  const handleSeeLiveDemo = () => {
    // Set a sleek cyber security screen mockup image as the active screenshot
    const demoScreenshot = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%230C1222'/><circle cx='400' cy='300' r='100' fill='none' stroke='%2312D6FF' stroke-width='4'/><text x='400' y='310' font-family='sans-serif' font-size='20' fill='%23ffffff' text-anchor='middle'>Secure Portal</text><rect x='250' y='360' width='300' height='40' rx='8' fill='%23101826' stroke='%23rgba(255,255,255,0.08)'/><text x='270' y='385' font-family='sans-serif' font-size='14' fill='%23777'>Password: sk-proj-1243...</text></svg>";
    setScreenshot(demoScreenshot);
    localStorage.setItem("shieldUxScreenshot", demoScreenshot);
    scrollToSection(workspaceRef);
    
    // Auto-analyze after scrolling
    setTimeout(() => {
      analyze();
    }, 800);
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderCodexCode = (code: string, idx: number) => {
    const isCopied = copiedIndex === idx;
    const match = code.match(/```(\w*)\n([\s\S]*?)```/);
    
    if (match) {
      const lang = match[1];
      const rawCode = match[2];
      return (
        <div className="mt-3 bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden font-mono text-xs shadow-inner">
          <div className="bg-[#0C1222]/80 px-4 py-2 border-b border-white/5 flex items-center justify-between text-zinc-400">
            <span className="font-semibold tracking-wider text-[10px] uppercase text-zinc-500">{lang || "code"}</span>
            <button
              onClick={() => handleCopyCode(rawCode, idx)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-semibold active:scale-95 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-300">
            <code>{rawCode}</code>
          </pre>
        </div>
      );
    }

    return (
      <div className="mt-3 bg-zinc-950 rounded-2xl border border-white/5 p-4 font-mono text-xs text-zinc-300 overflow-x-auto relative group">
        <button
          onClick={() => handleCopyCode(code, idx)}
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold active:scale-95 cursor-pointer"
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        </button>
        <pre><code>{code}</code></pre>
      </div>
    );
  };

  const getSeverityBadge = (level: "HIGH" | "MEDIUM" | "LOW") => {
    switch (level) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <main className="min-h-screen bg-[#070B14] text-zinc-300 flex flex-col font-sans relative overflow-x-hidden antialiased selection:bg-cyan-500/25 selection:text-white font-inter">
      
      {/* High-performance visual background grids & radial glowing spots */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(18, 214, 255, 0.05) 0%, rgba(18, 214, 255, 0) 70%)" }} />
      <div className="absolute top-[35%] right-[-30%] w-[80%] h-[80%] rounded-full pointer-events-none animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)", animationDelay: "2.5s" }} />
      <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none animate-pulse-glow" style={{ background: "radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, rgba(16, 185, 129, 0) 70%)", animationDelay: "5s" }} />

      {/* CSS Injections for fonts, custom grids, and GPU-accelerated animators */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        
        .font-instrument {
          font-family: 'Instrument Serif', serif;
        }

        .grid-bg {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }

        .animate-pulse-glow {
          animation: pulseGlow 12s infinite ease-in-out;
        }
      `}} />

      {/* Fixed Floating Glass Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 bg-[#0C1222]/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(18,214,255,0.4)]">
            <Shield className="w-4.5 h-4.5 text-black stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">
            ShieldUX
          </span>
        </div>

        {/* Scroll Anchors */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[12px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">Features</a>
          <a href="#agents" className="text-[12px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">Agents</a>
          <a href="#workspace" className="text-[12px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors">Workspace</a>
        </div>

        <button
          onClick={() => scrollToSection(workspaceRef)}
          className="text-xs bg-white hover:bg-zinc-200 active:scale-95 text-black font-extrabold px-4.5 py-2 rounded-full transition-all tracking-wider uppercase cursor-pointer"
        >
          Run Audit
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-44 pb-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Auditor
          </div>

          {/* Mixed Typography Editorial Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6 max-w-3xl">
            Ship <span className="font-instrument italic text-[#12D6FF]">safer.</span> <br />
            Build <span className="font-instrument italic text-[#12D6FF]">smarter.</span> <br />
            Launch trusted products.
          </h1>

          {/* Subheadline */}
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            Autonomous AI agents that audit your product screenshots for UX defects, accessibility violations, privacy flaws, and security exposures.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection(workspaceRef)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#12D6FF] to-blue-500 text-black font-bold px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-98 shadow-[0_0_25px_rgba(18,214,255,0.25)] hover:shadow-[0_0_35px_rgba(18,214,255,0.4)] cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <span>Run Screenshot Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSeeLiveDemo}
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-98 cursor-pointer text-sm uppercase tracking-wider flex items-center justify-center"
            >
              See Live Demo
            </button>
          </div>

          <div className="mt-14 animate-bounce text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer" onClick={() => scrollToSection(workspaceRef)}>
            <ArrowDown className="w-5 h-5" />
          </div>

        </div>
      </section>

      {/* AGENT SHOWCASE SECTION */}
      <section id="agents" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#12D6FF] uppercase">The Specialist Roster</span>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mt-2 mb-4">
            Four specialized agents. <span className="font-instrument italic text-[#12D6FF]">One unified audit.</span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Unlike static linters, ShieldUX orchestrates four focused neural specialists to inspect your interface in parallel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "UX Inspector",
              desc: "Evaluates layout balance, visual hierarchies, reading flows, call-to-action prominence, and cognitive load blockers.",
              icon: <Layers className="w-6 h-6 text-[#12D6FF]" />,
              color: "group-hover:shadow-[0_0_30px_rgba(18,214,255,0.15)] group-hover:border-cyan-500/30"
            },
            {
              title: "A11y Assessor",
              desc: "Tests WCAG compliance parameters including real-time text-to-container contrast ratios, font scales, and screen reader labels.",
              icon: <Eye className="w-6 h-6 text-emerald-400" />,
              color: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30"
            },
            {
              title: "Security Shield",
              desc: "Flags plain-text credentials, leaked secrets, exposed session metrics, vulnerable forms, and missing 2FA enrollment calls.",
              icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
              color: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] group-hover:border-rose-500/30"
            },
            {
              title: "Codex Fixer",
              desc: "Synthesizes raw findings and generates drop-in React/Tailwind/CSS patches to correct every flagged defect instantly.",
              icon: <Terminal className="w-6 h-6 text-amber-400" />,
              color: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] group-hover:border-amber-500/30"
            }
          ].map((agent, idx) => (
            <div
              key={idx}
              className={`group bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${agent.color}`}
            >
              {/* Subtle back glowing node */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full blur-2xl group-hover:bg-white/5 transition-all" />
              
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
                  {agent.icon}
                </div>
                <h4 className="text-md font-bold text-white mb-2">{agent.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{agent.desc}</p>
              </div>

              <div className="mt-8 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-400 group-hover:text-white uppercase transition-colors">
                <span>View Schema</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 px-6 sm:px-12 bg-white/[0.01] border-t border-b border-white/5 z-10 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-widest text-[#12D6FF] uppercase">The Lifecycle</span>
            <h2 className="text-3xl font-light text-white mt-1">Four steps from screenshot to safe deployment</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              { num: "01", label: "Upload UI", desc: "Drag & drop a screenshot of any page or dashboard." },
              { num: "02", label: "Agent Analysis", desc: "Specialist agents crawl elements for UX, A11y, and security risks." },
              { num: "03", label: "Risk Scoremetry", desc: "Our engine maps raw weights to compile a dynamic Trust Score." },
              { num: "04", label: "Codex Fixes", desc: "Apply developer-grade code patches directly from your dashboard." }
            ].map((step, idx) => (
              <div key={idx} className="relative group">
                <div className="flex items-center gap-3.5 mb-4">
                  <span className="text-2xl font-instrument italic font-light text-cyan-400">{step.num}</span>
                  <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-cyan-500/30 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{step.label}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIT WORKSPACE SECTION */}
      <section ref={workspaceRef} id="workspace" className="py-24 px-6 sm:px-12 max-w-5xl mx-auto w-full z-10 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-bold tracking-widest text-[#12D6FF] uppercase">Interactive Sandbox</span>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mt-2 mb-4">
            Auditing Sandbox
          </h2>
          <p className="text-sm text-zinc-400">
            Upload a screenshot below or click <span className="text-cyan-400 font-semibold hover:underline cursor-pointer" onClick={handleSeeLiveDemo}>See Live Demo</span> to test the dynamic auditing engine instantly.
          </p>
        </div>

        {/* Workspace Panel */}
        <div className="bg-[#0C1222]/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Workspace Tabs Header */}
          <div className="flex border-b border-white/5 bg-[#0C1222]/80 overflow-x-auto">
            <button
              onClick={() => setWorkspaceTab("screenshot")}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                workspaceTab === "screenshot"
                  ? "border-[#12D6FF] text-[#12D6FF] bg-white/[0.01]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Screenshot</span>
            </button>

            <button
              onClick={() => {
                alert("URL active auditing sandbox is currently in restricted beta. Try 'Screenshot' upload!");
                setWorkspaceTab("screenshot");
              }}
              className="px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-transparent text-zinc-500 cursor-not-allowed"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>URL</span>
            </button>

            <button
              onClick={() => {
                alert("Repository active auditing integration is in restricted beta. Try 'Screenshot' upload!");
                setWorkspaceTab("screenshot");
              }}
              className="px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-transparent text-zinc-500 cursor-not-allowed"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Repository</span>
            </button>

            <button
              onClick={() => {
                alert("Figma plugin syncing is currently in restricted beta. Try 'Screenshot' upload!");
                setWorkspaceTab("screenshot");
              }}
              className="px-6 py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 border-transparent text-zinc-500 cursor-not-allowed"
            >
              <Frame className="w-3.5 h-3.5" />
              <span>Figma Sync</span>
            </button>
          </div>

          {/* Workspace Tab Panel Contents */}
          <div className="p-6 sm:p-10">
            
            {/* Drag & Drop Upload Portal */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center transition-all duration-300 ${
                screenshot
                  ? "border-cyan-500/50 bg-cyan-500/[0.01]"
                  : isDragging
                  ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                  : "border-white/10 bg-[#0C1222]/30 hover:border-white/20"
              }`}
            >
              {!screenshot ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-400 mb-6 shadow-inner">
                    <Upload className="w-6 h-6 text-zinc-400" />
                  </div>
                  <h3 className="text-md font-semibold text-zinc-200 mb-1">
                    Drag and drop your product screenshot here
                  </h3>
                  <p className="text-xs text-zinc-500 mb-6">
                    Supports PNG, JPG, or JPEG up to 10MB
                  </p>
                  
                  <label className="cursor-pointer bg-white hover:bg-zinc-200 active:scale-95 text-black px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all shadow-md inline-flex items-center gap-2">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Thumbnail container */}
                  <div className="relative max-w-sm w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshot}
                      alt="Uploaded Screenshot"
                      className="w-full h-auto max-h-[220px] object-contain bg-zinc-950"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        onClick={handleRemove}
                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform active:scale-90 shadow-lg cursor-pointer"
                        title="Remove Screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 text-xs font-semibold text-cyan-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Screenshot loaded successfully
                  </div>

                  <button
                    onClick={handleRemove}
                    className="mt-2 text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                  >
                    Change image
                  </button>
                </div>
              )}
            </div>

            {/* Audit Trigger / Progress Loader */}
            <div className="mt-8">
              {error && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!loading ? (
                <div className="flex justify-end">
                  <button
                    onClick={analyze}
                    disabled={!screenshot}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 ${
                      screenshot
                        ? "bg-gradient-to-r from-[#12D6FF] to-blue-500 hover:brightness-105 text-black shadow-[0_0_20px_rgba(18,214,255,0.2)] cursor-pointer text-xs uppercase tracking-wider"
                        : "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed text-xs uppercase tracking-wider"
                    }`}
                  >
                    <span>Run Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-[#0C1222]/80 rounded-2xl border border-white/5 p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#12D6FF] to-transparent animate-pulse" />
                  
                  <div className="relative w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 border-3 border-cyan-500/10 border-t-[#12D6FF] rounded-full animate-spin" />
                    <Shield className="w-5 h-5 text-[#12D6FF] animate-pulse" />
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">Crawl Scanning Elements</h3>
                  <p className="text-[11px] text-zinc-500 mb-6">Running autonomous heuristics checking visual nodes...</p>

                  <div className="max-w-md mx-auto space-y-2 text-left border-t border-white/5 pt-4">
                    {STEPS.map((step, idx) => {
                      const isCompleted = currentStep > idx;
                      const isActive = currentStep === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2.5 transition-opacity duration-300 ${
                            isActive ? "opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-4 h-4 text-[#12D6FF] shrink-0" />
                          ) : isActive ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#12D6FF] border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                          )}
                          <span className={`text-[11px] ${isActive ? "font-semibold text-zinc-100" : "text-zinc-400"}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RESULTS DASHBOARD SECTION */}
        {data && (
          <div ref={resultsRef} className="mt-20 w-full border-t border-white/5 pt-20 flex flex-col gap-8 scroll-mt-24">
            
            {/* Demo Notice */}
            {data.demoMode && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <h4 className="font-bold text-amber-400 text-xs">Demo Simulation Mode</h4>
                    <p className="text-zinc-500 text-[11px] mt-0.5 leading-relaxed">
                      Using a simulated fallback analysis report since no active <code>OPENAI_API_KEY</code> is present in <code>.env.local</code>.
                    </p>
                  </div>
                </div>
                <a
                  href="https://github.com/sagarsahdesign-a11y/ShieldUX"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] bg-amber-400 hover:bg-amber-300 text-black font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors uppercase tracking-wider"
                >
                  <span>View Codebase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Metrics dial and cards overview grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score card */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl col-span-1">
                <div className="absolute top-4 left-4 text-[9px] font-mono text-zinc-500 tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#12D6FF]" /> AUDIT TRUST INDEX
                </div>

                <div className="relative w-36 h-36 mt-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-zinc-800/60"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`transition-all duration-1000 ease-out ${
                        data.riskScore >= 90 
                          ? "stroke-emerald-400" 
                          : data.riskScore >= 70 
                          ? "stroke-amber-400" 
                          : "stroke-rose-500"
                      }`}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * data.riskScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className={`text-4xl font-extrabold tracking-tight ${
                      data.riskScore >= 90 
                        ? "text-emerald-400" 
                        : data.riskScore >= 70 
                        ? "text-amber-400" 
                        : "text-rose-500"
                    }`}>
                      {data.riskScore}
                    </span>
                    <span className="text-zinc-650 block text-[9px] font-bold tracking-wider mt-0.5 uppercase">Trust Index</span>
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h4 className="text-xs font-bold text-zinc-200">
                    {data.riskScore >= 90 ? "High Integrity Interface" : data.riskScore >= 70 ? "Vulnerabilities Found" : "Extreme Risk Vectors"}
                  </h4>
                </div>
              </div>

              {/* Status Report Card details */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col justify-between col-span-1 md:col-span-2 shadow-2xl">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#12D6FF]/10 text-[#12D6FF] px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border border-cyan-500/10 mb-3">
                    <Sparkles className="w-3 h-3" /> Audit Finished
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Interface Report Card</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    AI specialists finished auditing the visual screenshot. Switch tabs below to review detailed findings and export suggested Codex fixes directly.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 mt-6">
                  <div className="text-center bg-zinc-950/20 rounded-xl p-3 border border-white/5">
                    <span className="text-md font-bold text-rose-400 block">{(data.security || []).length}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Security</span>
                  </div>
                  <div className="text-center bg-zinc-950/20 rounded-xl p-3 border border-white/5">
                    <span className="text-md font-bold text-amber-400 block">{(data.accessibility || []).length}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">A11y</span>
                  </div>
                  <div className="text-center bg-zinc-950/20 rounded-xl p-3 border border-white/5">
                    <span className="text-md font-bold text-blue-400 block">{(data.ux || []).length}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">UX Friction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Findings Lists tab panel */}
            <div className="bg-[#0C1222]/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              
              {/* Navigation Tabs Panel */}
              <div className="flex border-b border-white/5 bg-[#0C1222]/50 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-5 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "security"
                      ? "border-cyan-500 text-cyan-400 bg-white/[0.01]"
                      : "border-transparent text-zinc-450 hover:text-zinc-200"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Security</span>
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                    {(data.security || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("a11y")}
                  className={`px-5 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "a11y"
                      ? "border-cyan-500 text-cyan-400 bg-white/[0.01]"
                      : "border-transparent text-zinc-450 hover:text-zinc-200"
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Accessibility</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    {(data.accessibility || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("ux")}
                  className={`px-5 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "ux"
                      ? "border-cyan-500 text-cyan-400 bg-white/[0.01]"
                      : "border-transparent text-zinc-450 hover:text-zinc-200"
                  }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span>UX Findings</span>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                    {(data.ux || []).length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("codex")}
                  className={`px-5 py-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ml-auto bg-cyan-500/5 hover:bg-cyan-500/10 border-l border-white/5 cursor-pointer ${
                    activeTab === "codex"
                      ? "border-cyan-500 text-cyan-400"
                      : "border-transparent text-cyan-400"
                  }`}
                >
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>Codex Suggestions</span>
                </button>
              </div>

              {/* Tab Outputs */}
              <div className="p-6 sm:p-8">
                
                {/* Security */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    {(!data.security || data.security.length === 0) ? (
                      <div className="text-center py-6 text-zinc-550 text-xs font-mono">No security hazards found.</div>
                    ) : (
                      data.security.map((item, index) => (
                        <div key={index} className="bg-zinc-950/20 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-white/10 transition-all">
                          <div className={`text-[9px] font-extrabold tracking-wider border px-2.5 py-1 rounded-lg shrink-0 uppercase ${getSeverityBadge(item.severity)}`}>
                            {item.severity}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100">{item.issue}</h4>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed flex items-center gap-1.5">
                              <span className="text-cyan-400 font-semibold uppercase text-[9px] tracking-wide">Fix:</span> {item.fix}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Accessibility */}
                {activeTab === "a11y" && (
                  <div className="space-y-4">
                    {(!data.accessibility || data.accessibility.length === 0) ? (
                      <div className="text-center py-6 text-zinc-550 text-xs font-mono">No accessibility concerns found.</div>
                    ) : (
                      data.accessibility.map((item, index) => (
                        <div key={index} className="bg-zinc-950/20 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-white/10 transition-all">
                          <div className={`text-[9px] font-extrabold tracking-wider border px-2.5 py-1 rounded-lg shrink-0 uppercase ${getSeverityBadge(item.severity)}`}>
                            {item.severity}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100">{item.issue}</h4>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed flex items-center gap-1.5">
                              <span className="text-cyan-400 font-semibold uppercase text-[9px] tracking-wide">Fix:</span> {item.fix}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* UX Findings */}
                {activeTab === "ux" && (
                  <div className="space-y-4">
                    {(!data.ux || data.ux.length === 0) ? (
                      <div className="text-center py-6 text-zinc-550 text-xs font-mono">No UX blockers found.</div>
                    ) : (
                      data.ux.map((item, index) => (
                        <div key={index} className="bg-zinc-950/20 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-white/10 transition-all">
                          <div className={`text-[9px] font-extrabold tracking-wider border px-2.5 py-1 rounded-lg shrink-0 uppercase ${getSeverityBadge(item.severity)}`}>
                            {item.severity}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100">{item.issue}</h4>
                            <p className="text-xs text-zinc-400 mt-2 leading-relaxed flex items-center gap-1.5">
                              <span className="text-cyan-400 font-semibold uppercase text-[9px] tracking-wide">Fix:</span> {item.fix}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Codex component suggestions */}
                {activeTab === "codex" && (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {(!data.codex || data.codex.length === 0) ? (
                      <div className="text-center py-6 text-zinc-550 text-xs font-mono">No code suggestions compiled.</div>
                    ) : (
                      data.codex.map((item, index) => (
                        <div key={index} className="bg-zinc-950/10 border border-white/5 rounded-3xl p-5 shadow-sm hover:bg-zinc-950/20 transition-all">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded-md flex items-center justify-center font-bold text-[10px]">
                              {index + 1}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.title}</span>
                          </div>
                          {renderCodexCode(item.code, index)}
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Quick reset actions */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleRemove}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 bg-zinc-950/40 border border-white/5 px-4.5 py-2 rounded-full cursor-pointer uppercase tracking-wider font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Clear and Start Over
              </button>
            </div>

          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0C1222]/30 py-8 px-6 sm:px-12 text-center text-xs text-zinc-550 z-10 w-full font-nunito mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">ShieldUX</span>
          </div>
          <p className="text-zinc-500">© 2026 ShieldUX Auditing Engine. Sandbox Secure Environment.</p>
        </div>
      </footer>

    </main>
  );
}
