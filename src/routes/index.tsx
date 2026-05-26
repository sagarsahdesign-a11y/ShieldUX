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
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

const sevColors: Record<Severity, string> = {
  HIGH: "bg-red-500/15 text-red-400 border-red-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  LOW: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function Index() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
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
      toast.success("Audit complete");
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
    <div className="min-h-dvh bg-[#0a0a14] text-slate-100 selection:bg-cyan-500/30">
      <Toaster theme="dark" />
      {/* glow bg */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1200px] bg-gradient-to-br from-cyan-500/20 via-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-40 bg-[#0a0a14]/70">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Shield className="h-7 w-7 text-cyan-400" />
              <div className="absolute inset-0 blur-md bg-cyan-400/40 -z-10" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Shield<span className="text-cyan-400">UX</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#audit" className="hover:text-white">Audit</a>
            <a href="#how" className="hover:text-white">How it works</a>
          </div>
          <Button
            onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
          >
            Run Audit <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 bg-cyan-500/10 mb-6">
          <Sparkles className="h-3 w-3 mr-1" /> AI Product Security & UX Auditor
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          Ship safer, smarter
          <br />
          digital products.
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          ShieldUX audits your product across UX, accessibility, privacy, frontend quality, and
          security — and generates actionable fixes powered by multi-agent AI.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
          >
            Audit a screenshot <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
            onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
          >
            How it works
          </Button>
        </div>

        {/* Agent chips */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {[
            { icon: Eye, label: "UX Auditor", color: "text-violet-300 bg-violet-500/10 border-violet-500/30" },
            { icon: ShieldCheck, label: "Accessibility", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
            { icon: Lock, label: "Security", color: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
            { icon: Code2, label: "Codex Fixes", color: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30" },
          ].map((a) => (
            <div
              key={a.label}
              className={`px-4 py-2 rounded-full border text-sm flex items-center gap-2 ${a.color}`}
            >
              <a.icon className="h-4 w-4" /> {a.label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Eye,
              title: "Multimodal vision",
              desc: "Upload a screenshot and our agents read the UI — buttons, contrast, hierarchy, trust signals.",
            },
            {
              icon: Lock,
              title: "Security reasoning",
              desc: "Detects insecure auth UX, missing MFA, weak password flows, and privacy leak patterns.",
            },
            {
              icon: Code2,
              title: "Codex-powered fixes",
              desc: "Get ready-to-paste React + Tailwind snippets with explanations, not just generic advice.",
            },
          ].map((f) => (
            <Card
              key={f.title}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
            >
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 grid place-items-center mb-2">
                  <f.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <CardTitle className="text-white">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Audit Console */}
      <section id="audit" className="mx-auto max-w-5xl px-6 py-12">
        <Card className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <CardTitle className="text-white">Run an audit</CardTitle>
            </div>
            <p className="text-sm text-slate-400">
              Upload a screenshot or paste a URL. Our agent pipeline takes ~15 seconds.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="screenshot">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="screenshot" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                  <Upload className="h-4 w-4 mr-1" /> Screenshot
                </TabsTrigger>
                <TabsTrigger value="url" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                  <LinkIcon className="h-4 w-4 mr-1" /> URL
                </TabsTrigger>
                <TabsTrigger value="repo" disabled>
                  <Github className="h-4 w-4 mr-1" /> Repo
                  <Badge className="ml-2 bg-white/10 text-slate-300 text-[10px]">Soon</Badge>
                </TabsTrigger>
                <TabsTrigger value="figma" disabled>
                  <Figma className="h-4 w-4 mr-1" /> Figma
                  <Badge className="ml-2 bg-white/10 text-slate-300 text-[10px]">Soon</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="screenshot" className="mt-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) onFile(f);
                  }}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-white/15 hover:border-cyan-400/50 bg-black/20 p-8 transition-colors"
                >
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Uploaded screenshot preview"
                        className="max-h-64 rounded-lg border border-white/10"
                      />
                      <p className="text-xs text-slate-400">Click or drop to replace</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-cyan-400 mx-auto mb-3" />
                      <p className="text-white font-medium">Drop a screenshot here</p>
                      <p className="text-sm text-slate-400 mt-1">PNG, JPG, or WebP — login screens, dashboards, forms</p>
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
                <Button
                  onClick={handleScreenshotAudit}
                  disabled={loading || !imageBase64}
                  className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running agent pipeline…</>
                  ) : (
                    <>Run ShieldUX audit <Sparkles className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/login"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-black/30 border-white/15 text-white"
                  />
                  <Button
                    onClick={handleUrlAudit}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Audit"}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  URL audits analyze patterns based on common product flows. Screenshot uploads give richer multimodal results.
                </p>
              </TabsContent>
            </Tabs>

            {loading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                    Agents auditing UX → Accessibility → Security → Codex
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="bg-white/10" />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results */}
      {result && (
        <section id="results" className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-transparent border-cyan-500/30 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300">Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-bold text-white">
                  {result.trustScore}
                  <span className="text-2xl text-slate-400">/100</span>
                </div>
                <Progress value={result.trustScore} className="mt-3 bg-white/10" />
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 leading-relaxed">{result.summary}</p>
                <div className="flex gap-3 mt-4">
                  {(["HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => {
                    const count = result.findings.filter((f) => f.severity === s).length;
                    return (
                      <Badge key={s} className={`${sevColors[s]} border`}>
                        {count} {s}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Findings
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {result.findings.map((f) => (
              <Card key={f.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base text-white">{f.title}</CardTitle>
                    <Badge className={`${sevColors[f.severity]} border shrink-0`}>{f.severity}</Badge>
                  </div>
                  <Badge variant="outline" className="w-fit border-white/15 text-slate-400">
                    {f.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300">{f.description}</p>
                  <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
                    <p className="text-xs text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Recommendation
                    </p>
                    <p className="text-sm text-slate-200">{f.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.codexFixes?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-cyan-400" /> Codex Fixes
              </h2>
              <div className="space-y-4">
                {result.codexFixes.map((fix, i) => (
                  <Card key={i} className="bg-black/40 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-base">{fix.title}</CardTitle>
                      <p className="text-sm text-slate-400">{fix.explanation}</p>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-black/60 border border-white/10 rounded-lg p-4 overflow-x-auto text-xs text-cyan-100">
                        <code>{fix.code}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How ShieldUX works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Upload", desc: "Drop a screenshot or paste a URL." },
            { step: "02", title: "Agents analyze", desc: "UX, Accessibility, Security agents audit in parallel." },
            { step: "03", title: "Risk scoring", desc: "Findings are categorized HIGH / MEDIUM / LOW." },
            { step: "04", title: "Codex fixes", desc: "Get ready-to-paste React + Tailwind code." },
          ].map((s) => (
            <Card key={s.step} className="bg-white/5 border-white/10">
              <CardHeader>
                <span className="text-cyan-400 font-mono text-sm">{s.step}</span>
                <CardTitle className="text-white">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 mt-12">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>ShieldUX — AI Product Security & UX Auditor</span>
          </div>
          <span>Built with Lovable AI</span>
        </div>
      </footer>
    </div>
  );
}
