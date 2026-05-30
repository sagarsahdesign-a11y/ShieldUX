import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Shield,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Code2,
  Link as LinkIcon,
  Github,
  ArrowRight,
  Zap,
  Mail,
  LogOut,
  Frame,
  X,
  Copy,
  Check,
  Layers,
  ShieldCheck,
  ArrowUpRight,
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
type Category = "Security" | "Accessibility" | "UX" | "Privacy" | "Frontend";
type AuditResult = {
  trustScore: number;
  categoryScores?: Partial<Record<Category, number>>;
  summary: string;
  findings: Finding[];
  codexFixes: CodexFix[];
  errorInfo?: string;
};
type AuditTab = "screenshot" | "url" | "repo" | "figma";
type AuditSource = "screenshot" | "url" | "repo" | "figma";

const sevStyles: Record<Severity, { bg: string; text: string; dot: string; border: string; label: string }> = {
  HIGH: { bg: "bg-red-500/10", text: "text-red-700", dot: "bg-red-500", border: "border-red-200/50", label: "High Risk" },
  MEDIUM: { bg: "bg-amber-500/10", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200/50", label: "Medium" },
  LOW: { bg: "bg-sky-500/10", text: "text-sky-700", dot: "bg-sky-500", border: "border-sky-200/50", label: "Low" },
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
    sm: "h-9 px-4 text-[12px] rounded-full",
    md: "h-11 px-5 text-[13px] rounded-full",
    lg: "h-12 px-6 text-[14px] rounded-full",
  };
  const variants = {
    primary:
      "bg-lime-400 text-neutral-950 hover:bg-lime-300 hover:shadow-[0_4px_12px_rgba(163,230,53,0.3)] active:scale-98 active:translate-y-0",
    secondary:
      "bg-white text-neutral-800 border border-neutral-350 hover:bg-neutral-50 hover:border-neutral-450",
    blue: "bg-[#0EA5E9] text-white hover:bg-[#0284C7] hover:shadow-[0_4px_12px_rgba(14,165,233,0.3)]",
    danger:
      "bg-[#EF4444] text-white hover:bg-[#DC2626] hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 font-bold uppercase tracking-[0.8px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-450">
        {children}
      </span>
      <span className="flex-1 h-[1px] bg-neutral-200/80" />
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10B981"; // Safe Green
  if (score >= 60) return "#F59E0B"; // Warning Amber
  return "#EF4444"; // Danger Red
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: "Security", label: "Security" },
  { key: "Accessibility", label: "Accessibility" },
  { key: "UX", label: "UX" },
  { key: "Privacy", label: "Privacy" },
  { key: "Frontend", label: "Frontend" },
];

const SEVERITY_ORDER: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function groupAndSortFindings(findings: Finding[]): { category: string; findings: Finding[] }[] {
  const sorted = [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
  return CATEGORY_ORDER.map(({ key }) => ({
    category: key,
    findings: sorted.filter((f) => f.category === key),
  })).filter((g) => g.findings.length > 0);
}

function CodexFixCard({ fix }: { fix: CodexFix }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fix.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-neutral-200/60 bg-neutral-50/50">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="font-display text-[17px] font-bold text-neutral-900">{fix.title}</h4>
          <span className="text-[9.5px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 font-mono">
            {fix.language}
          </span>
        </div>
        <p className="text-[13px] text-neutral-500 leading-relaxed">{fix.explanation}</p>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
          className={`absolute top-3 right-3 z-10 h-8 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.5px] border transition-all duration-150 cursor-pointer ${
            copied
              ? "bg-[#10B981] text-white border-[#10B981] shadow-sm"
              : "bg-neutral-850 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white"
          }`}
        >
          {copied ? (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          ) : (
            <Copy className="w-3 h-3" strokeWidth={2.5} />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
        <pre className="bg-neutral-950 text-neutral-300 p-5 pt-12 overflow-x-auto text-[12px] leading-relaxed font-mono">
          <code>{fix.code}</code>
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Staged loading pipeline
// ---------------------------------------------------------------------------

const AUDIT_STAGES: {
  label: string;
  sublabel: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  delay: number;
}[] = [
  {
    label: "Uploading screenshot",
    sublabel: "Transferring image to analysis pipeline",
    Icon: Upload,
    color: "#0EA5E9",
    bg: "rgba(14, 165, 233, 0.1)",
    delay: 0,
  },
  {
    label: "Running UX analysis",
    sublabel: "Evaluating hierarchy, CTA clarity, friction",
    Icon: Eye,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    delay: 900,
  },
  {
    label: "Checking accessibility",
    sublabel: "WCAG 2.2 contrast, touch targets, labels",
    Icon: CheckCircle2,
    color: "#0EA5E9",
    bg: "rgba(14, 165, 233, 0.1)",
    delay: 3600,
  },
  {
    label: "Auditing security surface",
    sublabel: "Auth UX, MFA signals, privacy indicators",
    Icon: Lock,
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    delay: 6300,
  },
  {
    label: "Generating Codex fixes",
    sublabel: "Synthesising production-ready patches",
    Icon: Code2,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    delay: 9000,
  },
  {
    label: "Calculating trust score",
    sublabel: "Applying weighted category scoring engine",
    Icon: Shield,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    delay: 11700,
  },
];

function Index() {
  // Navigation states
  const [activeNav, setActiveNav] = useState("Product");

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Audit Workspace States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [url, setUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [tab, setTab] = useState<AuditTab>("screenshot");
  const fileRef = useRef<HTMLInputElement>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Check session status on mount
  useEffect(() => {
    const guestSession = localStorage.getItem("shieldUxSession");
    if (guestSession) {
      setIsAuthenticated(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        if (!localStorage.getItem("shieldUxSession")) {
          setIsAuthenticated(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Stage cycling — advances through AUDIT_STAGES while loading
  useEffect(() => {
    if (!loading) {
      stageTimers.current.forEach(clearTimeout);
      stageTimers.current = [];
      setStageIdx(0);
      return;
    }
    stageTimers.current = AUDIT_STAGES.map((s, i) => setTimeout(() => setStageIdx(i), s.delay));
    return () => {
      stageTimers.current.forEach(clearTimeout);
      stageTimers.current = [];
    };
  }, [loading]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } catch (err: unknown) {
      setAuthError(getErrorMessage(err, "Failed to sign in. Please check your credentials."));
      toast.error("Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        toast.success("Account created and signed in!");
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
      } else {
        toast.info("Registration successful! Check your email for a confirmation link.");
        setAuthView("signin");
      }
    } catch (err: unknown) {
      setAuthError(getErrorMessage(err, "Failed to sign up. Please try again."));
      toast.error("Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setAuthLoading(true);
    setTimeout(() => {
      localStorage.setItem("shieldUxSession", "guest-builder-token-42");
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      toast.success("Logged in as Guest Builder");
      setAuthLoading(false);
    }, 500);
  };

  const handleSignOut = async () => {
    localStorage.removeItem("shieldUxSession");
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast.success("Signed out successfully.");
  };

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

  const runAudit = async (payload: { imageBase64?: string; url?: string; source?: AuditSource }) => {
    setLoading(true);
    setResult(null);
    setProgress(8);
    const ticker = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 6 : p));
    }, 400);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, mimeType }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data?.error) throw new Error(data.error);

      setProgress(100);
      setResult(data);
      toast.success("Audit complete!");
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Audit failed"));
    } finally {
      clearInterval(ticker);
      setLoading(false);
    }
  };

  const handleScreenshotAudit = () => {
    if (!imageBase64) return toast.error("Upload a screenshot first");
    if (!isAuthenticated) {
      toast.info("Please sign in or continue as Guest to run the audit.");
      setAuthView("signin");
      setIsAuthModalOpen(true);
      return;
    }
    runAudit({ imageBase64, source: "screenshot" });
  };
  const handleUrlAudit = () => {
    if (!url.trim()) return toast.error("Enter a URL");
    if (!isAuthenticated) {
      toast.info("Please sign in or continue as Guest to run the audit.");
      setAuthView("signin");
      setIsAuthModalOpen(true);
      return;
    }
    runAudit({ url, source: "url" });
  };
  const handleRepoAudit = () => {
    if (!repoUrl.trim()) return toast.error("Enter a GitHub repository URL");
    if (!isAuthenticated) {
      toast.info("Please sign in or continue as Guest to run the audit.");
      setAuthView("signin");
      setIsAuthModalOpen(true);
      return;
    }
    runAudit({ url: repoUrl, source: "repo" });
  };
  const handleFigmaAudit = () => {
    if (!figmaUrl.trim()) return toast.error("Enter a Figma file URL");
    if (!isAuthenticated) {
      toast.info("Please sign in or continue as Guest to run the audit.");
      setAuthView("signin");
      setIsAuthModalOpen(true);
      return;
    }
    runAudit({ url: figmaUrl, source: "figma" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-[#f0f0ee] antialiased selection:bg-lime-200 selection:text-neutral-900 font-sans text-neutral-800">
      <Toaster />

      {/* Warm off-white gradients and grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.12),transparent_45%)] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-300/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-lime-400/5 blur-[150px] pointer-events-none" />
      
      {/* Subtle clean tech grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.012)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] pointer-events-none" />

      {/* Floating Premium Pill-Style Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setIsAuthModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border border-neutral-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl p-8 sm:p-10 flex flex-col items-center animate-in zoom-in-95 duration-200 z-10">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-neutral-200 text-neutral-450 hover:text-neutral-900 hover:bg-neutral-50 flex items-center justify-center transition-colors cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shadow-sm mb-6">
              <Shield className="w-6 h-6 text-lime-400 stroke-[2.5]" />
            </div>

            <h2 className="font-display text-[26px] font-bold text-neutral-900 tracking-tight text-center leading-none mb-2">
              Enter <span className="font-sans font-bold text-lime-600">ShieldUX</span>
            </h2>
            <p className="text-[13px] text-neutral-500 text-center mb-6">
              AI-driven product security, accessibility, and UX auditing engine.
            </p>

            {/* Segmented Auth View Controls */}
            <div className="w-full border border-neutral-200/80 p-1 rounded-xl flex mb-6 bg-neutral-50/50">
              <button
                type="button"
                onClick={() => {
                  setAuthView("signin");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-[0.5px] rounded-lg transition-colors cursor-pointer ${
                  authView === "signin"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-450 hover:text-neutral-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthView("signup");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-bold uppercase tracking-[0.5px] rounded-lg transition-colors cursor-pointer ${
                  authView === "signup"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-450 hover:text-neutral-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error alert */}
            {authError && (
              <div className="w-full bg-red-500/10 border border-red-200/30 rounded-xl p-4 mb-5 flex items-start gap-2.5 text-red-700 text-[12px] leading-relaxed font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Forms */}
            <form
              className="w-full space-y-4"
              onSubmit={authView === "signin" ? handleSignIn : handleSignUp}
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-1.5 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-305 bg-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-1.5 pl-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-305 bg-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authView === "signup" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-1.5 pl-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-305 bg-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 bg-lime-400 text-neutral-950 hover:bg-lime-300 hover:shadow-[0_4px_12px_rgba(163,230,53,0.3)] rounded-xl font-bold uppercase tracking-[0.8px] transition-all duration-200 active:scale-97 flex items-center justify-center gap-2 text-[13px] cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Connecting Securely...</span>
                  </>
                ) : (
                  <>
                    <span>{authView === "signin" ? "Sign In" : "Register Credentials"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="w-full flex items-center gap-3 my-6">
              <span className="flex-1 h-[1px] bg-neutral-200" />
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest">
                Demo Bypasses
              </span>
              <span className="flex-1 h-[1px] bg-neutral-200" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={authLoading}
              className="w-full h-11 bg-transparent text-[#0EA5E9] border border-neutral-200 hover:bg-neutral-50 rounded-xl font-bold uppercase tracking-[0.8px] transition-all duration-200 active:scale-97 flex items-center justify-center gap-2 text-[13px] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#0EA5E9]" fill="currentColor" />
              <span>Sign In as Guest</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill-Style Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#f0f0ee]/80 backdrop-blur-md border-b border-neutral-200/60 w-full flex items-center justify-center py-4 px-5">
        <div className="max-w-[1280px] w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo capsule */}
            <a href="#" className="flex items-center justify-center rounded-full w-10 h-10 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-200/80 bg-white/80 backdrop-blur-md hover:border-neutral-350 transition-colors duration-200">
              <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-lime-400 stroke-[2.5]" />
              </div>
            </a>
            <span className="font-display text-[20px] font-extrabold text-neutral-900 leading-none tracking-tight">
              ShieldUX
            </span>
            <span className="hidden md:block h-5 w-px bg-neutral-200/80 mx-1" />
            <span className="hidden md:block text-[9.5px] font-bold uppercase tracking-[1.5px] text-neutral-400">
              AI Audit Suite
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 rounded-full px-5 py-2 border border-neutral-200/60 bg-white/40 shadow-sm">
            {[
              { label: "Audit", href: "#audit" },
              { label: "Domains", href: "#domains" },
              { label: "Findings", href: "#findings" },
              { label: "Codex", href: "#codex" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveNav(label)}
                className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.8px] transition-all ${
                  activeNav === label ? "text-neutral-950 font-bold bg-neutral-100" : "text-slate-400 hover:text-neutral-950"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Btn
              size="sm"
              onClick={() =>
                document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Zap className="h-3.5 w-3.5 text-neutral-950" strokeWidth={3} />
              Run Audit
            </Btn>

            {/* Session authentication buttons */}
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="h-9 px-4 rounded-full border border-neutral-250 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 font-bold text-[12px] uppercase tracking-[0.5px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                title="Sign Out Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthView("signin");
                    setAuthError(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="h-9 px-4 rounded-full border border-neutral-250 bg-white text-[#0EA5E9] hover:bg-neutral-50 font-bold text-[12px] uppercase tracking-[0.5px] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>Sign In</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative border-b border-neutral-200/60 bg-[#f0f0ee] py-16 sm:pt-24 sm:pb-12">
        {/* Warm premium background gradients + technical grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(132,204,22,0.06),transparent_45%)] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-300/5 blur-[120px] pointer-events-none" />
        
        {/* Subtle clean tech grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)] pointer-events-none" />

        <div className="relative z-20 mx-auto max-w-[1240px] px-6 flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left content block */}
          <div className="flex-1 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-lime-200/80 bg-lime-50/70 px-4 py-1.5 text-[11px] font-bold tracking-wider text-lime-800 mb-6 shadow-sm shadow-lime-100/50">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
              </span>
              <span>AI PRODUCT SECURITY · UX · ACCESSIBILITY AUDITOR</span>
            </div>

            <h1 className="text-[2.8rem] sm:text-[4.2rem] lg:text-[4.5rem] leading-[0.95] tracking-[-0.04em] font-semibold text-neutral-950 mb-6 font-display">
              Ship products <br />
              <span className="text-lime-600 font-display">people trust.</span>
            </h1>

            <p className="text-[15px] sm:text-[16.5px] leading-relaxed text-neutral-600 max-w-xl mb-8">
              Upload a screenshot, URL, GitHub repo, or Figma file. ShieldUX analyzes UX,
              accessibility, security, and trust issues — then returns findings, trust scoring, and
              actionable fixes.
            </p>

            <div className="flex flex-wrap gap-3.5 mb-12">
              <button
                onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full bg-lime-400 text-neutral-950 px-6 py-3.5 text-[13.5px] font-bold hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(163,230,53,0.3)] active:translate-y-0 transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <span>RUN AUDIT</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white text-neutral-800 px-6 py-3.5 text-[13.5px] font-semibold hover:bg-neutral-50 active:scale-98 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <span>VIEW DEMO</span>
              </button>
            </div>

            {/* Mini Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5 max-w-lg">
              {[
                { icon: Layers, value: "5 Domains", label: "Audit Domains", color: "#10B981" },
                { icon: ShieldCheck, value: "100%", label: "Actionable Fixes", color: "#F59E0B" },
                { icon: Zap, value: "~15s", label: "Avg Audit Time", color: "#0EA5E9" },
              ].map((s) => (
                <div key={s.label} className="p-3.5 rounded-xl border border-neutral-200/50 bg-white/60 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:border-neutral-300/60 transition-all duration-200">
                  <s.icon
                    className="h-4.5 w-4.5 mb-2"
                    style={{ color: s.color }}
                    strokeWidth={2.5}
                  />
                  <div className="text-[14.5px] font-bold text-neutral-800 tracking-tight leading-none">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[1px] text-neutral-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - floating layered hero composition */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-xl min-h-[340px] sm:min-h-[480px] flex items-center justify-center select-none scale-95 sm:scale-100 origin-center mt-8 sm:mt-0">
            {/* Open-space intelligence field behind the hand */}
            <div className="absolute inset-[-8%] rounded-full bg-[radial-gradient(circle_at_center,_rgba(190,242,100,0.22)_0%,_rgba(236,252,203,0.12)_28%,_rgba(255,255,255,0)_66%)] blur-2xl pointer-events-none" />
            <div className="absolute inset-[8%] rounded-full border border-lime-300/20 bg-white/10 backdrop-blur-[2px] [mask-image:radial-gradient(circle_at_center,white,transparent_72%)] pointer-events-none" />
            <div className="absolute inset-[4%] bg-[linear-gradient(rgba(16,185,129,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-70 [mask-image:radial-gradient(ellipse_at_center,white_0%,transparent_68%)] pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-lime-500/18 animate-[spin_48s_linear_infinite] pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime-500/14 pointer-events-none" />
            <div className="absolute left-[14%] right-[8%] top-1/2 h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-[12%] top-[10%] left-1/2 w-px bg-gradient-to-b from-transparent via-sky-400/14 to-transparent pointer-events-none" />
            <div className="absolute left-[18%] top-[20%] h-20 w-32 rounded-full border border-white/50 bg-white/20 blur-xl pointer-events-none" />
            <div className="absolute bottom-[22%] right-[8%] h-24 w-36 rounded-full border border-lime-200/40 bg-lime-100/20 blur-xl pointer-events-none" />

            {/* Scanning HUD indicators */}
            <div className="absolute inset-0 pointer-events-none z-20">
              <div className="absolute top-[31%] left-[28%] flex items-center gap-1 rounded-md border border-neutral-200/80 bg-white/70 px-2 py-0.5 text-[8px] font-bold text-neutral-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>AI_AUDIT_CORE</span>
              </div>
              <div className="absolute bottom-[26%] right-[23%] flex items-center gap-1 rounded-md border border-neutral-200/80 bg-white/70 px-2 py-0.5 text-[8px] font-bold text-neutral-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
                <span>UX_TELEMETRY</span>
              </div>
              <div className="absolute bottom-[12%] left-[18%] flex items-center gap-1 text-[9px] font-mono text-neutral-450">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-ping" />
                SYS_ACTIVE // PROD_INTEL
              </div>
            </div>

            {/* Spotlight highlight behind the hand */}
            <div className="absolute left-1/2 top-1/2 z-0 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(163,230,53,0.2)_0%,_transparent_70%)] blur-3xl pointer-events-none" />

            {/* Center Robot Hand Area (Wrapped in mix-blend-multiply div to force transparent background) */}
            <div
              style={{
                mixBlendMode: "multiply",
                WebkitMaskImage:
                  "radial-gradient(ellipse 54% 66% at 58% 57%, black 34%, rgba(0,0,0,0.78) 48%, transparent 74%)",
                maskImage:
                  "radial-gradient(ellipse 54% 66% at 58% 57%, black 34%, rgba(0,0,0,0.78) 48%, transparent 74%)",
              }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-multiply"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ mixBlendMode: "multiply" }}
                className="w-[112%] sm:w-[120%] max-w-none h-auto object-contain opacity-95 mix-blend-multiply filter contrast-[1.05] saturate-[0.98] transition-all duration-500 hover:scale-[1.02]"
              >
                <source
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
                  type="video/mp4"
                />
              </video>
            </div>

            {/* Floating Card 1 — Trust Score Card */}
            <div className="absolute top-[2%] left-0 w-[172px] sm:top-[8%] sm:left-[1%] sm:w-[190px] rounded-xl border border-neutral-200/80 bg-white/92 p-4 sm:p-4.5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:shadow-[0_20px_54px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300 group z-30">
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
                  <span className="absolute text-[12.5px] font-extrabold text-neutral-900">92</span>
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

            {/* Floating Card 2 — Findings Card */}
            <div className="absolute bottom-0 right-0 w-[220px] sm:bottom-[4%] sm:w-[240px] rounded-xl border border-neutral-200/80 bg-white/92 p-4 sm:p-4.5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:shadow-[0_20px_54px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 transition-all duration-300 z-30">
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
                    label: "Missing accessibility labels",
                    sev: "ACC",
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                  },
                  {
                    label: "Insecure auth endpoint",
                    sev: "SEC",
                    color: "text-red-650 bg-red-50 border-red-100",
                  },
                  {
                    label: "Layout friction in onboarding",
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
            <div className="absolute top-[23%] right-0 w-[178px] sm:top-[3%] sm:w-[215px] rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 sm:p-4 shadow-[0_18px_48px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 transition-all duration-300 text-left font-mono z-30 hidden sm:block">
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
                  &nbsp;&nbsp;<span className="text-neutral-500 font-mono">{"// Fix contrast"}</span>{" "}
                  <br />
                  &nbsp;&nbsp;<span className="text-lime-400 font-mono">return</span> (<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-sky-300 font-mono">div</span>{" "}
                  <span className="text-amber-300 font-mono">className</span>=
                  <span className="text-lime-300 font-mono">"text-neutral-900"</span>&gt;<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-neutral-250 font-mono">Secure Node</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                  <span className="text-sky-300 font-mono">div</span>&gt;<br />
                  &nbsp;&nbsp;);<br />
                  &#125;;
                </code>
              </pre>
            </div>

          </div>
        </div>
      </section>

      {/* DOMAINS */}
      <section id="domains" className="mx-auto max-w-[1240px] px-6 py-20">
        <SectionLabel>Analysis domains</SectionLabel>
        <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-neutral-900 mb-3">
          Four domains. <span className="text-lime-600">One verdict.</span>
        </h2>
        <p className="text-[15px] text-neutral-500 mb-12 max-w-xl">
          Four analysis layers run in sequence — each grounded in visual evidence from your
          screenshot — then reconciled into a weighted Trust Score.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Eye,
              name: "UX Auditor",
              desc: "Reads hierarchy, trust signals, CTA clarity, friction points.",
              color: "#10B981",
              bg: "rgba(16, 185, 129, 0.08)",
            },
            {
              icon: CheckCircle2,
              name: "Accessibility",
              desc: "Contrast, focus order, semantic structure, WCAG checks.",
              color: "#0EA5E9",
              bg: "rgba(14, 165, 233, 0.08)",
            },
            {
              icon: Lock,
              name: "Security",
              desc: "Auth UX, leaked data, missing MFA, weak password flows.",
              color: "#EF4444",
              bg: "rgba(239, 68, 68, 0.08)",
            },
            {
              icon: Code2,
              name: "Codex Fixer",
              desc: "Writes ready-to-paste React + Tailwind patches.",
              color: "#F59E0B",
              bg: "rgba(245, 158, 11, 0.08)",
            },
          ].map((a) => (
            <div key={a.name} className="bg-white border border-neutral-200 shadow-sm p-6 rounded-xl hover:shadow-md transition-all duration-200 group">
              <div
                className="h-12 w-12 rounded-xl grid place-items-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: a.bg }}
              >
                <a.icon className="h-6 w-6" style={{ color: a.color }} strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-[17px] font-bold text-neutral-900 mb-2">{a.name}</h3>
              <p className="text-[13.5px] text-neutral-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIT WORKSPACE CONSOLE */}
      <section id="audit" className="bg-[#ecece8]/30 border-y border-neutral-250/70">
        <div className="mx-auto max-w-[920px] px-6 py-20">
          <SectionLabel>Audit workspace</SectionLabel>
          <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-neutral-900 mb-3">
            Drop it. <span className="text-[#0EA5E9]">Ship it.</span>
          </h2>
          <p className="text-[15px] text-neutral-500 mb-10 max-w-lg">
            Upload a screenshot, paste a URL, connect a GitHub repo, or review a Figma file. Get a
            full audit in seconds.
          </p>

          <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50/50">
              {(
                [
                  { id: "screenshot", icon: Upload, label: "Screenshot", soon: false },
                  { id: "url", icon: LinkIcon, label: "URL", soon: false },
                  { id: "repo", icon: Github, label: "Repo", soon: false },
                  { id: "figma", icon: Frame, label: "Figma", soon: false },
                ] as const
              ).map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-[12px] font-bold uppercase tracking-[0.8px] border-b-2 transition-colors cursor-pointer ${
                      active
                        ? "border-lime-500 text-neutral-900 bg-lime-50/10"
                        : "border-transparent text-neutral-400 hover:text-neutral-900"
                    }`}
                  >
                    <t.icon className="h-4 w-4" strokeWidth={2.5} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6 sm:p-8">
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
                    className="cursor-pointer rounded-xl border border-dashed border-neutral-300 hover:border-lime-400 hover:bg-lime-50/5 bg-neutral-50/50 p-10 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Uploaded screenshot preview"
                          className="max-h-64 rounded-xl border border-neutral-250 shadow-sm"
                        />
                        <p className="text-[11px] font-bold uppercase tracking-[1px] text-neutral-400">
                          Click or drop to replace
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="h-14 w-14 rounded-full bg-lime-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Upload className="h-6 w-6 text-neutral-950" strokeWidth={2.5} />
                        </div>
                        <p className="font-display text-[18px] font-bold text-neutral-900">Drop a screenshot</p>
                        <p className="text-[12.5px] text-neutral-500 mt-1">
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
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-950" strokeWidth={3} />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        Run audit
                        <Sparkles className="h-4 w-4 text-neutral-950" strokeWidth={2.5} />
                      </>
                    )}
                  </Btn>
                </>
              )}

              {tab === "url" && (
                <>
                  <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-2">
                    Page URL
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/login"
                      className="flex-1 h-11 px-4 rounded-xl border border-neutral-300 bg-white focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                    />
                    <Btn variant="blue" onClick={handleUrlAudit} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={3} />
                      ) : (
                        "Audit"
                      )}
                    </Btn>
                  </div>
                  <p className="text-[12px] text-neutral-500 mt-3">
                    Screenshots give richer multimodal results than URLs.
                  </p>
                </>
              )}

              {tab === "repo" && (
                <>
                  <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-2">
                    GitHub repository
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Github className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={2.5} />
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/company/product"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 bg-white focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                      />
                    </div>
                    <Btn variant="blue" onClick={handleRepoAudit} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={3} />
                      ) : (
                        "Audit repo"
                      )}
                    </Btn>
                  </div>
                  <p className="text-[12px] text-neutral-500 mt-3">
                    Audits repository-facing product risks, frontend quality, accessibility debt, and security posture from the repo context.
                  </p>
                </>
              )}

              {tab === "figma" && (
                <>
                  <label className="text-[10px] font-bold uppercase tracking-[1px] text-neutral-450 block mb-2">
                    Figma file
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Frame className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={2.5} />
                      <input
                        type="url"
                        value={figmaUrl}
                        onChange={(e) => setFigmaUrl(e.target.value)}
                        placeholder="https://www.figma.com/design/..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-300 bg-white focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] outline-none text-[14px] font-semibold text-neutral-900 placeholder:text-neutral-400 transition-colors"
                      />
                    </div>
                    <Btn variant="blue" onClick={handleFigmaAudit} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" strokeWidth={3} />
                      ) : (
                        "Audit file"
                      )}
                    </Btn>
                  </div>
                  <p className="text-[12px] text-neutral-500 mt-3">
                    Reviews design-system consistency, accessibility, UX friction, privacy cues, and handoff readiness from the Figma file link.
                  </p>
                </>
              )}

              {loading &&
                (() => {
                  const stage = AUDIT_STAGES[stageIdx];
                  const StageIcon = stage.Icon;
                  return (
                    <div className="mt-7 space-y-4 animate-in fade-in duration-300 bg-neutral-50/50 border border-neutral-200/80 p-5 rounded-xl">
                      {/* Active stage row */}
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500"
                          style={{ background: stage.bg }}
                        >
                          <StageIcon
                            className="h-5 w-5"
                            style={{ color: stage.color }}
                            strokeWidth={2.5}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            key={stageIdx}
                            className="text-[13px] font-bold text-neutral-900 flex items-center gap-0 animate-in fade-in duration-300"
                          >
                            {stage.label}
                            <span className="inline-flex ml-0.5">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="animate-bounce"
                                  style={{
                                    animationDelay: `${i * 120}ms`,
                                    animationDuration: "900ms",
                                  }}
                                >
                                  .
                                </span>
                              ))}
                            </span>
                          </div>
                          <div
                            key={`sub-${stageIdx}`}
                            className="text-[11px] text-neutral-500 font-medium mt-0.5 animate-in fade-in duration-500 truncate"
                          >
                            {stage.sublabel}
                          </div>
                        </div>
                        <span
                          className="text-[13px] font-bold tabular-nums flex-shrink-0 transition-colors duration-500"
                          style={{ color: stage.color }}
                        >
                          {Math.round(progress)}%
                        </span>
                      </div>

                      {/* Stage pipeline pills */}
                      <div className="flex gap-1.5 flex-wrap">
                        {AUDIT_STAGES.map((s, i) => {
                          const done = i < stageIdx;
                          const active = i === stageIdx;
                          const SIcon = s.Icon;
                          return (
                            <span
                              key={s.label}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.8px] transition-all duration-300 ${
                                done
                                  ? "bg-lime-100 text-lime-800 border border-lime-200/30"
                                  : active
                                    ? "text-neutral-950 bg-lime-400 font-bold"
                                    : "bg-neutral-100 text-neutral-400 border border-neutral-200/50"
                              }`}
                              style={active ? { background: s.color } : {}}
                            >
                              {done ? (
                                <Check className="w-2.5 h-2.5 text-lime-800" strokeWidth={3} />
                              ) : (
                                <SIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                              )}
                              <span className="hidden sm:inline">
                                {s.label.split(" ").slice(0, 2).join(" ")}
                              </span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Progress bar — color transitions with active stage */}
                      <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width,background-color] duration-500"
                          style={{
                            width: `${progress}%`,
                            background: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS WORKSPACE */}
      {result && (
        <section id="results" className="mx-auto max-w-[1100px] px-6 py-20">
          <SectionLabel>Audit results</SectionLabel>

          {result.errorInfo && (
            <div className="border border-red-200/60 bg-red-500/10 p-6 mb-8 rounded-xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3.5 items-start">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-[17px] font-bold text-red-750 leading-none mb-1.5">
                    OpenRouter API Error (Demo Mode Enabled)
                  </h4>
                  <p className="text-[13px] text-red-900/80 leading-relaxed font-semibold">
                    ShieldUX is running in{" "}
                    <strong>Demo Mode (showing default mock report with 92 score)</strong> because
                    the OpenRouter API integration has an issue:
                  </p>
                  <div className="mt-3 p-3 bg-white border border-red-200/50 rounded-xl font-mono text-[12px] text-red-750 break-all">
                    {result.errorInfo}
                  </div>
                  <p className="text-[12px] text-red-800/80 mt-3 leading-relaxed">
                    <strong>How to fix:</strong> Please ensure your <code>OPENROUTER_API_KEY</code> and{" "}
                    <code>OPENROUTER_MODEL</code> in <code>d:\ShieldUX\shieldux\.env.local</code> are
                    correctly configured.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {/* Trust Score circular gauge breakdown */}
            <div className="bg-white border border-neutral-200 shadow-sm p-7 rounded-2xl md:col-span-1 flex flex-col justify-between">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-400 mb-3">
                  Trust Score
                </div>
                <div className="relative flex items-center justify-center h-40 w-40 mx-auto my-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" className="stroke-neutral-100" strokeWidth="6" fill="transparent" />
                    <circle cx="60" cy="60" r="52"
                      style={{
                        strokeDasharray: 326.73,
                        strokeDashoffset: 326.73 - (326.73 * result.trustScore) / 100,
                        stroke: scoreColor(result.trustScore),
                        transition: "stroke-dashoffset 1s ease-in-out"
                      }}
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[38px] font-extrabold leading-none text-neutral-900 font-display">
                      {result.trustScore}
                    </span>
                    <span className="text-[9px] font-bold uppercase text-neutral-450 tracking-widest mt-1">
                      TRUST SCORE
                    </span>
                  </div>
                </div>
              </div>

              {/* Per-category breakdown progress */}
              {result.categoryScores && (
                <div className="space-y-2.5 mt-auto">
                  <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-400 mb-1">
                    Category Breakdown
                  </div>
                  {CATEGORY_ORDER.map(({ key, label }) => {
                    const score = result.categoryScores?.[key as Category] ?? 100;
                    const color = scoreColor(score);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-neutral-600">{label}</span>
                          <span
                            className="text-[11px] font-bold tracking-tight tabular-nums"
                            style={{ color }}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-150 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-[width] duration-700"
                            style={{ width: `${score}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Executive Summary Card */}
            <div className="bg-white border border-neutral-200 shadow-sm p-7 rounded-2xl md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[#F59E0B]" fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-neutral-400">
                  Executive summary
                </span>
              </div>
              <p className="text-[15px] text-neutral-600 leading-relaxed font-medium">{result.summary}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {(["HIGH", "MEDIUM", "LOW"] as Severity[]).map((s) => {
                  const count = result.findings.filter((f) => f.severity === s).length;
                  const st = sevStyles[s];
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${st.bg} ${st.text} ${st.border} border text-[11px] font-bold uppercase tracking-[0.5px]`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {count} {s}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Findings Catalog List */}
          <h3
            id="findings"
            className="font-display text-[26px] font-bold text-neutral-900 mb-6 flex items-center gap-2"
          >
            <AlertTriangle className="h-6 w-6 text-[#F59E0B]" strokeWidth={2.5} />
            Findings
            <span className="ml-auto text-[14px] font-bold text-neutral-450 normal-case tracking-normal">
              {result.findings.length} total
            </span>
          </h3>
          <div className="mb-12 space-y-10">
            {groupAndSortFindings(result.findings).map(({ category, findings: catFindings }) => (
              <div key={category}>
                {/* Category divider tag line */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-neutral-400">
                    {category}
                  </span>
                  <span className="flex-1 h-[1px] bg-neutral-200/80" />
                  <span className="text-[10px] font-bold tabular-nums text-neutral-500">
                    {catFindings.length} {catFindings.length === 1 ? "issue" : "issues"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {catFindings.map((f) => {
                    const st = sevStyles[f.severity];
                    return (
                      <div key={f.id} className="bg-white border border-neutral-200 shadow-sm p-6 rounded-xl hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="font-display text-[17px] font-bold text-neutral-900 leading-tight">
                            {f.title}
                          </h4>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${st.bg} ${st.text} ${st.border} border text-[10px] font-bold uppercase tracking-[0.5px]`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[13.5px] text-neutral-500 leading-relaxed mb-4">
                          {f.description}
                        </p>
                        <div className="rounded-lg bg-lime-50/50 border border-lime-200/50 p-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[1px] text-lime-800 mb-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-lime-600" strokeWidth={3} /> Actionable Fix
                          </div>
                          <p className="text-[13px] text-neutral-700">{f.recommendation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Codex Fix Code Blocks */}
          {result.codexFixes?.length > 0 && (
            <>
              <h3
                id="codex"
                className="font-display text-[26px] font-bold text-neutral-900 mb-5 flex items-center gap-2"
              >
                <Code2 className="h-6 w-6 text-[#0EA5E9]" strokeWidth={2.5} />
                Codex Fixes
              </h3>
              <div className="space-y-5">
                {result.codexFixes.map((fix, i) => (
                  <CodexFixCard key={i} fix={fix} />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* HOW IT WORKS */}
      <section id="how" className="bg-[#ecece8]/30 border-t border-neutral-250/70">
        <div className="mx-auto max-w-[1240px] px-6 py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-neutral-900 mb-12">
            Four steps from <span className="text-lime-600">screenshot to ship</span>.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "01",
                title: "Upload",
                desc: "Drop a screenshot or paste a URL.",
                color: "#10B981",
              },
              {
                n: "02",
                title: "Analyze",
                desc: "Four analysis layers run in sequence.",
                color: "#0EA5E9",
              },
              {
                n: "03",
                title: "Score",
                desc: "HIGH / MEDIUM / LOW risk findings.",
                color: "#F59E0B",
              },
              {
                n: "04",
                title: "Fix",
                desc: "Paste the Codex patches and ship.",
                color: "#EAB308",
              },
            ].map((s) => (
              <div key={s.n} className="bg-white border border-neutral-200 shadow-sm p-6 rounded-xl hover:shadow-md transition-all duration-200">
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center font-display text-[16px] text-neutral-950 font-bold mb-4"
                  style={{ background: s.color }}
                >
                  {s.n}
                </div>
                <h3 className="font-display text-[18px] font-bold text-neutral-900 mb-1">{s.title}</h3>
                <p className="text-[13px] text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-[920px] px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-white via-[#fcfcf9] to-[#f0f0ee] border border-neutral-200/80 p-10 sm:p-14 rounded-2xl shadow-sm">
          <h2 className="font-display text-[30px] md:text-[40px] font-extrabold text-neutral-900 leading-[1.1] mb-4">
            Ready to earn your <span className="text-lime-600">trust badge?</span>
          </h2>
          <p className="text-[14px] text-neutral-500 max-w-md mx-auto mb-8">
            Run your first audit free. No signup. Just drop a screenshot.
          </p>
          <Btn
            size="lg"
            onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
          >
            Start auditing <ArrowRight className="h-4 w-4 text-neutral-950" strokeWidth={3} />
          </Btn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-neutral-200/80 bg-[#f0f0ee] py-8">
        <div className="mx-auto max-w-[1240px] px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-bold uppercase tracking-[0.5px] text-neutral-450">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#10B981] grid place-items-center">
              <Shield className="h-3.5 w-3.5 text-neutral-950" strokeWidth={3} />
            </div>
            <span>ShieldUX · AI Product Auditor · made by sagar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
