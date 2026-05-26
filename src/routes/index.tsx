import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  Shield,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Sparkles,
  Code2,
  Link as LinkIcon,
  Github,
  Figma,
  ArrowRight,
  Zap,
  Flame,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

type Severity = "HIGH" | "MEDIUM" | "LOW";
type Finding = {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
};
type CodexFix = { title: string; language: string; code: string; explanation: string };
type AuditResult = {
  trustScore: number;
  summary: string;
  findings: Finding[];
  codexFixes: CodexFix[];
};

const sevStyles: Record<Severity, { bg: string; text: string; dot: string; label: string }> = {
  HIGH: { bg: "bg-[#FFE5E5]", text: "text-[#FF4B4B]", dot: "bg-[#FF4B4B]", label: "High risk" },
  MEDIUM: { bg: "bg-[#FFF1D6]", text: "text-[#FF9600]", dot: "bg-[#FF9600]", label: "Medium" },
  LOW: { bg: "bg-[#D9F0FE]", text: "text-[#1899D6]", dot: "bg-[#1CB0F6]", label: "Low" },
};

function Btn({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "blue" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-9 px-4 text-[12px] rounded-[10px]",
    md: "h-12 px-6 text-[14px] rounded-[14px]",
    lg: "h-14 px-7 text-[15px] rounded-[16px]",
  };
  const variants = {
    primary:
      "bg-[#58CC02] text-white border-2 border-[#58CC02] shadow-[0_4px_0_0_#46A302] hover:bg-[#4BB200]",
    secondary:
      "bg-white text-[#1CB0F6] border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] hover:bg-[#F7F7F7]",
    blue:
      "bg-[#1CB0F6] text-white border-2 border-[#1CB0F6] shadow-[0_4px_0_0_#1899D6] hover:bg-[#179fde]",
    danger:
      "bg-[#FF4B4B] text-white border-2 border-[#FF4B4B] shadow-[0_4px_0_0_#CC3C3C] hover:bg-[#ee3a3a]",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 font-extrabold uppercase tracking-[0.5px] transition-[transform,box-shadow,background-color] duration-100 active:translate-y-[4px] active:!shadow-[0_0_0_0_transparent] disabled:opacity-50 disabled:cursor-not-allowed disabled:!translate-y-0 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#AFAFAF]">
        {children}
      </span>
      <span className="flex-1 h-px bg-[#E5E5E5]" />
    </div>
  );
}

function Index() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [tab, setTab] = useState<"screenshot" | "url">("screenshot");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const runAudit = async (payload: { imageBase64?: string; url?: string }) => {
    setLoading(true);
    setResult(null);
    setProgress(8);
    const ticker = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 6 : p));
    }, 400);
    try {
      const { data, error } = await supabase.functions.invoke("audit-product", {
        body: { ...payload, mimeType },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setProgress(100);
      setResult(data);
      toast.success("Audit complete!");
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e: any) {
      toast.error(e.message || "Audit failed");
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  };

  const handleScreenshotAudit = () => {
    if (!imageBase64) return toast.error("Upload a screenshot first");
    runAudit({ imageBase64 });
  };
  const handleUrlAudit = () => {
    if (!url.trim()) return toast.error("Enter a URL");
    runAudit({ url });
  };

  return (
    <div className="min-h-dvh bg-white text-[#3C3C3C]">
      <Toaster />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b-2 border-[#E5E5E5]">
        <nav className="mx-auto max-w-[1280px] h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-2">
              <div className="relative h-9 w-9 rounded-xl bg-[#58CC02] grid place-items-center shadow-[0_3px_0_0_#46A302]">
                <Shield className="h-5 w-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-display text-[24px] font-bold text-[#0F1635] leading-none">
                ShieldUX
              </span>
            </a>
            <span className="hidden md:block h-6 w-px bg-[#E5E5E5]" />
            <span className="hidden md:block text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#AFAFAF]">
              AI Audit Suite
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {["Audit", "Agents", "Findings", "Codex"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-[0.5px] text-[#AFAFAF] hover:text-[#58CC02] hover:bg-[#EAF8DC] transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          <Btn
            size="sm"
            onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={3} />
            Run Audit
          </Btn>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF8DC] via-white to-white">
        <div className="absolute inset-0 -z-0 opacity-40">
          <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-[#58CC02]/20 blur-3xl" />
          <div className="absolute top-32 right-1/4 h-72 w-72 rounded-full bg-[#1CB0F6]/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1100px] px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-[#E5E5E5] shadow-[0_3px_0_0_#E5E5E5] mb-8">
            <Sparkles className="h-3.5 w-3.5 text-[#FFC800]" fill="#FFC800" />
            <span className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#3C3C3C]">
              4 AI Agents · Multimodal · Codex-powered
            </span>
          </div>

          <h1 className="font-display text-[44px] md:text-[72px] leading-[0.95] text-[#0F1635]">
            ship products that
            <br />
            <span className="text-[#58CC02]">people trust.</span>
          </h1>

          <p className="mt-6 text-[17px] md:text-[19px] text-[#777] max-w-[600px] mx-auto leading-relaxed">
            ShieldUX audits your UI for{" "}
            <span className="font-bold text-[#3C3C3C]">security, accessibility, privacy and UX</span>{" "}
            issues — then writes the code to fix them. Drop a screenshot. Get a trust score in 15 seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Btn
              size="lg"
              onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
            >
              Audit my product <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Btn>
            <Btn
              size="lg"
              variant="secondary"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            >
              How it works
            </Btn>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-3 max-w-[680px] mx-auto">
            {[
              { icon: Trophy, value: "92", label: "Avg trust score", color: "#58CC02" },
              { icon: Flame, value: "47", label: "Issues per audit", color: "#FF9600" },
              { icon: Zap, value: "15s", label: "Pipeline time", color: "#1CB0F6" },
            ].map((s) => (
              <div
                key={s.label}
                className="card-chunky px-4 py-5 hover:card-chunky-hover"
              >
                <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: s.color }} strokeWidth={2.5} />
                <div className="font-display text-[28px] leading-none text-[#0F1635]">{s.value}</div>
                <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agents" className="mx-auto max-w-[1280px] px-6 py-20">
        <SectionLabel>The agent team</SectionLabel>
        <h2 className="font-display text-[36px] md:text-[48px] text-[#0F1635] mb-3">
          Four specialists. <span className="text-[#58CC02]">One verdict.</span>
        </h2>
        <p className="text-[16px] text-[#777] mb-12 max-w-xl">
          Each agent runs in parallel, then a coordinator reconciles findings into a single trust score.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Eye, name: "UX Auditor", desc: "Reads hierarchy, trust signals, CTA clarity, friction points.", color: "#58CC02", bg: "#EAF8DC" },
            { icon: CheckCircle2, name: "Accessibility", desc: "Contrast, focus order, semantic structure, WCAG checks.", color: "#1CB0F6", bg: "#D9F0FE" },
            { icon: Lock, name: "Security", desc: "Auth UX, leaked data, missing MFA, weak password flows.", color: "#FF4B4B", bg: "#FFE5E5" },
            { icon: Code2, name: "Codex Fixer", desc: "Writes ready-to-paste React + Tailwind patches.", color: "#FFC800", bg: "#FFF6D6" },
          ].map((a) => (
            <div
              key={a.name}
              className="card-chunky p-5 hover:card-chunky-hover group"
            >
              <div
                className="h-12 w-12 rounded-2xl grid place-items-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: a.bg }}
              >
                <a.icon className="h-6 w-6" style={{ color: a.color }} strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-[22px] text-[#0F1635] mb-2">{a.name}</h3>
              <p className="text-[14px] text-[#777] leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT CONSOLE */}
      <section id="audit" className="bg-[#FAFAF7] border-y-2 border-[#E5E5E5]">
        <div className="mx-auto max-w-[920px] px-6 py-20">
          <SectionLabel>Audit workspace</SectionLabel>
          <h2 className="font-display text-[36px] md:text-[48px] text-[#0F1635] mb-3">
            Drop it. <span className="text-[#1CB0F6]">Ship it.</span>
          </h2>
          <p className="text-[16px] text-[#777] mb-10 max-w-lg">
            Upload a screenshot of any login screen, dashboard or checkout. Get a full audit in seconds.
          </p>

          <div className="card-chunky overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b-2 border-[#E5E5E5] bg-white">
              {[
                { id: "screenshot", icon: Upload, label: "Screenshot" },
                { id: "url", icon: LinkIcon, label: "URL" },
                { id: "repo", icon: Github, label: "Repo", soon: true },
                { id: "figma", icon: Figma, label: "Figma", soon: true },
              ].map((t) => {
                const active = tab === t.id;
                const disabled = t.soon;
                return (
                  <button
                    key={t.id}
                    onClick={() => !disabled && setTab(t.id as any)}
                    disabled={disabled}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-[12px] font-extrabold uppercase tracking-[0.5px] border-b-[3px] transition-colors ${
                      active
                        ? "border-[#58CC02] text-[#58CC02] bg-[#EAF8DC]/40"
                        : "border-transparent text-[#AFAFAF] hover:text-[#3C3C3C]"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <t.icon className="h-4 w-4" strokeWidth={2.5} />
                    {t.label}
                    {t.soon && (
                      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#FFF6D6] text-[#B8920F]">
                        SOON
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6 sm:p-8 bg-white">
              {tab === "screenshot" && (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) onFile(f);
                    }}
                    className="cursor-pointer rounded-2xl border-[3px] border-dashed border-[#E5E5E5] hover:border-[#58CC02] hover:bg-[#EAF8DC]/40 bg-[#FAFAF7] p-10 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Uploaded screenshot preview"
                          className="max-h-64 rounded-xl border-2 border-[#E5E5E5]"
                        />
                        <p className="text-[12px] font-bold uppercase tracking-[1px] text-[#AFAFAF]">
                          Click or drop to replace
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="h-16 w-16 rounded-2xl bg-[#58CC02] grid place-items-center mx-auto mb-4 shadow-[0_4px_0_0_#46A302]">
                          <Upload className="h-7 w-7 text-white" strokeWidth={3} />
                        </div>
                        <p className="font-display text-[22px] text-[#0F1635]">Drop a screenshot</p>
                        <p className="text-[13px] text-[#777] mt-1">
                          PNG · JPG · WebP — login flows, dashboards, forms
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                    />
                  </div>
                  <Btn
                    size="lg"
                    className="mt-6 w-full"
                    onClick={handleScreenshotAudit}
                    disabled={loading || !imageBase64}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />
                        Agents auditing…
                      </>
                    ) : (
                      <>
                        Run audit
                        <Sparkles className="h-4 w-4" strokeWidth={3} />
                      </>
                    )}
                  </Btn>
                </>
              )}

              {tab === "url" && (
                <>
                  <label className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] block mb-2">
                    Page URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/login"
                      className="flex-1 h-12 px-4 rounded-[14px] border-2 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-[15px] font-semibold text-[#3C3C3C] placeholder:text-[#AFAFAF] placeholder:font-medium transition-colors"
                    />
                    <Btn variant="blue" onClick={handleUrlAudit} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> : "Audit"}
                    </Btn>
                  </div>
                  <p className="text-[12px] text-[#AFAFAF] mt-3">
                    Screenshots give richer multimodal results than URLs.
                  </p>
                </>
              )}

              {loading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] mb-2">
                    <span>UX → Accessibility → Security → Codex</span>
                    <span className="text-[#58CC02]">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#E5E5E5] overflow-hidden">
                    <div
                      className="h-full bg-[#58CC02] rounded-full transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {result && (
        <section id="results" className="mx-auto max-w-[1100px] px-6 py-20">
          <SectionLabel>Audit results</SectionLabel>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {/* Trust Score */}
            <div className="card-chunky p-7 md:col-span-1 bg-gradient-to-br from-[#EAF8DC] to-white">
              <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#AFAFAF] mb-3">
                Trust Score
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-[72px] leading-none text-[#58CC02]">
                  {result.trustScore}
                </span>
                <span className="font-display text-[24px] text-[#AFAFAF]">/100</span>
              </div>
              <div className="mt-4 h-3 rounded-full bg-[#E5E5E5] overflow-hidden">
                <div
                  className="h-full bg-[#58CC02] rounded-full transition-[width] duration-700"
                  style={{ width: `${result.trustScore}%` }}
                />
              </div>
            </div>

            {/* Summary */}
            <div className="card-chunky p-7 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#FFC800]" fill="#FFC800" />
                <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#AFAFAF]">
                  Executive summary
                </span>
              </div>
              <p className="text-[15px] text-[#3C3C3C] leading-relaxed">{result.summary}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {(["HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => {
                  const count = result.findings.filter((f) => f.severity === s).length;
                  const st = sevStyles[s];
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${st.bg} ${st.text} text-[11px] font-extrabold uppercase tracking-[0.5px]`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {count} {s}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Findings */}
          <h3 id="findings" className="font-display text-[28px] text-[#0F1635] mb-5 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-[#FF9600]" strokeWidth={2.5} />
            Findings
          </h3>
          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {result.findings.map((f) => {
              const st = sevStyles[f.severity];
              return (
                <div key={f.id} className="card-chunky p-6 hover:card-chunky-hover">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-display text-[20px] text-[#0F1635] leading-tight">
                      {f.title}
                    </h4>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${st.bg} ${st.text} text-[10px] font-extrabold uppercase tracking-[0.5px]`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {f.severity}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] mb-3">
                    {f.category}
                  </span>
                  <p className="text-[14px] text-[#777] leading-relaxed mb-4">{f.description}</p>
                  <div className="rounded-xl bg-[#EAF8DC] border-2 border-[#58CC02]/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[1px] text-[#46A302] mb-1">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} /> Fix
                    </div>
                    <p className="text-[13px] text-[#3C3C3C]">{f.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Codex */}
          {result.codexFixes?.length > 0 && (
            <>
              <h3 id="codex" className="font-display text-[28px] text-[#0F1635] mb-5 flex items-center gap-2">
                <Code2 className="h-6 w-6 text-[#1CB0F6]" strokeWidth={2.5} />
                Codex Fixes
              </h3>
              <div className="space-y-5">
                {result.codexFixes.map((fix, i) => (
                  <div key={i} className="card-chunky overflow-hidden">
                    <div className="p-5 border-b-2 border-[#E5E5E5] bg-white">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className="font-display text-[20px] text-[#0F1635]">{fix.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase tracking-[1px] px-2.5 py-1 rounded-full bg-[#D9F0FE] text-[#1899D6]">
                          {fix.language}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#777] leading-relaxed">{fix.explanation}</p>
                    </div>
                    <pre className="bg-[#0F1635] text-[#A8E6FF] p-5 overflow-x-auto text-[12px] leading-relaxed font-mono">
                      <code>{fix.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[#FAFAF7] border-t-2 border-[#E5E5E5]">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="font-display text-[36px] md:text-[48px] text-[#0F1635] mb-12">
            Four steps from <span className="text-[#58CC02]">screenshot to ship</span>.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Upload", desc: "Drop a screenshot or paste a URL.", color: "#58CC02" },
              { n: "02", title: "Analyze", desc: "Four agents audit in parallel.", color: "#1CB0F6" },
              { n: "03", title: "Score", desc: "HIGH / MEDIUM / LOW risk findings.", color: "#FF9600" },
              { n: "04", title: "Fix", desc: "Paste the Codex patches and ship.", color: "#FFC800" },
            ].map((s) => (
              <div key={s.n} className="card-chunky p-6 hover:card-chunky-hover">
                <div
                  className="h-12 w-12 rounded-2xl grid place-items-center font-display text-[20px] text-white mb-4 shadow-[0_3px_0_0_rgba(0,0,0,0.15)]"
                  style={{ background: s.color }}
                >
                  {s.n}
                </div>
                <h3 className="font-display text-[22px] text-[#0F1635] mb-1">{s.title}</h3>
                <p className="text-[14px] text-[#777]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[920px] px-6 py-20 text-center">
        <div className="card-chunky p-10 sm:p-14 bg-gradient-to-br from-[#EAF8DC] via-white to-[#D9F0FE]">
          <h2 className="font-display text-[34px] md:text-[48px] text-[#0F1635] leading-[1] mb-4">
            Ready to earn your <span className="text-[#58CC02]">trust badge?</span>
          </h2>
          <p className="text-[16px] text-[#777] max-w-md mx-auto mb-8">
            Run your first audit free. No signup. Just drop a screenshot.
          </p>
          <Btn
            size="lg"
            onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
          >
            Start auditing <ArrowRight className="h-4 w-4" strokeWidth={3} />
          </Btn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-bold uppercase tracking-[0.5px] text-[#AFAFAF]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#58CC02] grid place-items-center">
              <Shield className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </div>
            <span>ShieldUX · AI Product Auditor</span>
          </div>
          <span>Built with Lovable AI</span>
        </div>
      </footer>
    </div>
  );
}
