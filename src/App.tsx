import { useState } from "react";
import {
  Shield,
  Sparkles,
  ArrowRight,
  Code2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Activity,
  Check,
} from "lucide-react";

export default function App() {
  const [activeNav, setActiveNav] = useState("Product");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f4f0] antialiased selection:bg-lime-200 selection:text-neutral-900 font-sans">
      {/* Soft premium background gradients + technical grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.12),transparent_45%)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-300/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-lime-400/5 blur-[150px] pointer-events-none" />

      {/* Elegant minimalist grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.012)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] pointer-events-none" />

      {/* Foreground container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar (Centered Premium Floating Pill Style) */}
        <header className="w-full flex items-center justify-center pt-6 px-5 gap-3">
          {/* Left Logo Pill */}
          <div className="flex items-center justify-center rounded-full w-11 h-11 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-200/80 bg-white/80 backdrop-blur-md hover:border-neutral-350 transition-colors duration-200">
            <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center shadow-sm">
              <Shield className="w-3.5 h-3.5 text-lime-400 stroke-[2.5]" />
            </div>
          </div>

          {/* Right Navigation Pill */}
          <nav className="flex items-center gap-6 sm:gap-10 rounded-full px-6 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-200/80 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-5 sm:gap-8">
              {["Product", "Domains", "Findings", "How It Works"].map((item) => {
                const isActive = activeNav === item;
                return (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setActiveNav(item)}
                    className={`text-[13px] font-semibold tracking-tight transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? "text-neutral-950 font-bold"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            <span className="w-[1px] h-4 bg-neutral-200 hidden sm:block" />

            <button className="rounded-full bg-neutral-900 text-white hover:bg-lime-400 hover:text-neutral-950 text-[12px] font-semibold px-4.5 py-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm cursor-pointer">
              Run Audit
            </button>
          </nav>
        </header>

        {/* Hero Content Section */}
        <main className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20 xl:px-24 py-16 lg:py-0">
          <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
            {/* Left Content Column */}
            <div className="flex-1 max-w-2xl text-left">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-lime-200/80 bg-lime-50/70 px-4 py-1.5 text-[11px] font-bold tracking-wider text-lime-800 mb-6 shadow-sm shadow-lime-100/50">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span>AI PRODUCT SECURITY · UX · ACCESSIBILITY AUDITOR</span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.8rem] sm:text-[4.5rem] leading-[0.95] tracking-[-0.04em] font-semibold text-neutral-950 mb-6 font-display">
                Ship products <br />
                <span className="text-lime-600 font-display">people trust.</span>
              </h1>

              {/* Subtext */}
              <p className="text-[15px] sm:text-[16.5px] leading-relaxed text-neutral-600 max-w-xl mb-8">
                Upload a screenshot, URL, GitHub repo, or Figma file. ShieldUX analyzes UX,
                accessibility, security, and trust issues — then returns findings, trust scoring,
                and actionable fixes.
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap gap-3.5 mb-12">
                <button className="inline-flex items-center gap-2 rounded-full bg-lime-400 text-neutral-950 px-6 py-3.5 text-[13.5px] font-bold hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(163,230,53,0.3)] active:translate-y-0 transition-all duration-200 cursor-pointer group">
                  <span>RUN AUDIT</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white text-neutral-800 px-6 py-3.5 text-[13.5px] font-semibold hover:bg-neutral-50 active:scale-98 transition-all duration-200 cursor-pointer shadow-sm">
                  <span>VIEW DEMO</span>
                </button>
              </div>

              {/* Mini Stats Row */}
              <div className="grid grid-cols-3 gap-3.5 max-w-lg">
                {[
                  { label: "Trust Scoring", val: "99.8%", desc: "Weighted algorithm" },
                  { label: "Accessibility", val: "WCAG 2.2", desc: "A/AA compliance" },
                  { label: "Security", val: "12+ Layers", desc: "Surface telemetry" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3.5 rounded-xl border border-neutral-200/50 bg-white/60 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:border-neutral-300/60 transition-all duration-200"
                  >
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      {stat.label}
                    </div>
                    <div className="text-[14.5px] font-bold text-neutral-800 tracking-tight">
                      {stat.val}
                    </div>
                    <div className="text-[9.5px] text-neutral-400 mt-0.5">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Visual Column (believable, minimal luxury SaaS dashboard) */}
            <div className="flex-1 relative w-full max-w-lg lg:max-w-xl aspect-[1.1/1] flex items-center justify-center select-none">
              {/* Soft visual glow background */}
              <div className="absolute w-[80%] h-[80%] rounded-full bg-lime-300/10 blur-[90px] pointer-events-none" />

              {/* Main Dashboard Frame (Sleek minimalist browser mock) */}
              <div className="w-[92%] aspect-[1.25/1] rounded-2xl border border-neutral-200/80 bg-white/60 backdrop-blur-md shadow-[0_15px_45px_rgba(0,0,0,0.03)] p-4 sm:p-5 relative overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.05)]">
                {/* Header browser-bar */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                    <span className="text-[9px] font-bold text-neutral-400 ml-2 uppercase tracking-widest font-mono">
                      console.shieldux.sh
                    </span>
                  </div>
                  <span className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-lime-100/60 text-lime-800 border border-lime-200/40 uppercase tracking-wider font-mono">
                    ACTIVE ENGINE
                  </span>
                </div>

                {/* Simulated SaaS visual layout grids representing UI layers */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100/70 border border-neutral-200/20 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-1/3 bg-neutral-200 rounded" />
                      <div className="h-2 w-1/2 bg-neutral-150 rounded" />
                    </div>
                    <div className="h-5 w-12 bg-lime-100/40 border border-lime-200/20 rounded flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-lime-700">SECURE</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-neutral-100/70 pt-3.5">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100/70 border border-neutral-200/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-1/4 bg-neutral-200 rounded" />
                      <div className="h-2 w-3/5 bg-neutral-150 rounded" />
                    </div>
                    <div className="h-5 w-12 bg-neutral-100 border border-neutral-200 rounded flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-neutral-500">WCAG</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-neutral-100/70 pt-3.5">
                    <div className="h-10 w-10 rounded-lg bg-neutral-100/70 border border-neutral-200/20 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-1/2 bg-neutral-200 rounded" />
                      <div className="h-2 w-2/5 bg-neutral-150 rounded" />
                    </div>
                    <div className="h-5 w-12 bg-neutral-100 border border-neutral-200 rounded flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-neutral-500">UX AR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 1 — Trust Score Card */}
              <div className="absolute top-[8%] left-[-4%] w-[190px] rounded-xl border border-neutral-200/80 bg-white p-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Score telemetry
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-lime-600 transition-colors" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center h-12 w-12 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        className="stroke-neutral-100"
                        strokeWidth="3.5"
                        fill="transparent"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        className="stroke-lime-500"
                        strokeDasharray="100"
                        strokeDashoffset="8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute text-[12.5px] font-extrabold text-neutral-900">
                      92
                    </span>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-bold text-neutral-850 leading-none mb-1">
                      Trust Score
                    </div>
                    <div className="text-[9px] text-lime-600 font-bold uppercase tracking-wider">
                      OPTIMAL COMPLIANCE
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 — Findings Card (UX + Security + Accessibility) */}
              <div className="absolute bottom-[4%] right-[-5%] w-[240px] rounded-xl border border-neutral-200/80 bg-white p-4.5 shadow-[0_12px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 mb-2.5">
                  <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">
                    Security & UX Audit
                  </span>
                  <span className="text-[8.5px] font-bold text-red-500 px-1.5 py-0.5 rounded bg-red-55/10 border border-red-200/20 uppercase tracking-wider font-mono">
                    3 ALERTS
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      label: "Contrast ratio below AA",
                      sev: "ACC",
                      color: "text-amber-600 bg-amber-50 border-amber-100",
                    },
                    {
                      label: "Missing aria accessibility labels",
                      sev: "ACC",
                      color: "text-amber-600 bg-amber-50 border-amber-100",
                    },
                    {
                      label: "Insecure auth endpoint",
                      sev: "SEC",
                      color: "text-red-650 bg-red-50 border-red-100",
                    },
                    {
                      label: "Layout friction in CTA onboarding",
                      sev: "UX",
                      color: "text-sky-600 bg-sky-50 border-sky-100",
                    },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between gap-2 text-[11px] font-medium text-neutral-700"
                    >
                      <span className="truncate">{f.label}</span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.2 rounded border shrink-0 font-mono ${f.color}`}
                      >
                        {f.sev}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card 3 — Codex Fix Card */}
              <div className="absolute top-[3%] right-[-8%] w-[215px] rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 text-left font-mono">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-[9px] text-neutral-400 font-mono">CodexFix.tsx</span>
                  </div>
                  <span className="text-[8px] px-1 bg-lime-400/20 text-lime-400 rounded font-mono">
                    TSX
                  </span>
                </div>
                <pre className="text-[9.5px] text-neutral-350 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono select-none">
                  <code className="font-mono">
                    <span className="text-lime-400 font-mono">const</span>{" "}
                    <span className="text-sky-300 font-mono">AuditBadge</span> = () =&gt; &#123;{" "}
                    <br />
                    &nbsp;&nbsp;
                    <span className="text-neutral-500 font-mono">{"// Fix contrast"}</span> <br />
                    &nbsp;&nbsp;<span className="text-lime-400 font-mono">return</span> (<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-sky-300 font-mono">
                      div
                    </span>{" "}
                    <span className="text-amber-300 font-mono">className</span>=
                    <span className="text-lime-300 font-mono">"text-neutral-900"</span>&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span className="text-neutral-250 font-mono">Secure Node</span>
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                    <span className="text-sky-300 font-mono">div</span>&gt;
                    <br />
                    &nbsp;&nbsp;);
                    <br />
                    &#125;;
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
