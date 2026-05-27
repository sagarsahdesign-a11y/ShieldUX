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
type AuditTab = "screenshot" | "url";

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
    blue: "bg-[#1CB0F6] text-white border-2 border-[#1CB0F6] shadow-[0_4px_0_0_#1899D6] hover:bg-[#179fde]",
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

function scoreColor(score: number): string {
  if (score >= 80) return "#58CC02";
  if (score >= 60) return "#FF9600";
  return "#FF4B4B";
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
    <div className="card-chunky overflow-hidden">
      <div className="p-5 border-b-2 border-[#E5E5E5] bg-white">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="font-display text-[20px] text-[#0F1635]">{fix.title}</h4>
          <span className="text-[10px] font-extrabold uppercase tracking-[1px] px-2.5 py-1 rounded-full bg-[#D9F0FE] text-[#1899D6]">
            {fix.language}
          </span>
        </div>
        <p className="text-[13px] text-[#777] leading-relaxed">{fix.explanation}</p>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
          className={`absolute top-3 right-3 z-10 h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.5px] border transition-all duration-150 ${
            copied
              ? "bg-[#58CC02] text-white border-[#46A302] shadow-[0_2px_0_0_#46A302]"
              : "bg-white/10 text-[#A8E6FF] border-white/20 hover:bg-white/20 hover:border-white/40"
          }`}
        >
          {copied ? (
            <Check className="w-3 h-3" strokeWidth={3} />
          ) : (
            <Copy className="w-3 h-3" strokeWidth={2.5} />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
        <pre className="bg-[#0F1635] text-[#A8E6FF] p-5 pt-12 overflow-x-auto text-[12px] leading-relaxed font-mono">
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
    color: "#1CB0F6",
    bg: "#D9F0FE",
    delay: 0,
  },
  {
    label: "Running UX analysis",
    sublabel: "Evaluating hierarchy, CTA clarity, friction",
    Icon: Eye,
    color: "#58CC02",
    bg: "#EAF8DC",
    delay: 900,
  },
  {
    label: "Checking accessibility",
    sublabel: "WCAG 2.2 contrast, touch targets, labels",
    Icon: CheckCircle2,
    color: "#1CB0F6",
    bg: "#D9F0FE",
    delay: 3600,
  },
  {
    label: "Auditing security surface",
    sublabel: "Auth UX, MFA signals, privacy indicators",
    Icon: Lock,
    color: "#FF4B4B",
    bg: "#FFE5E5",
    delay: 6300,
  },
  {
    label: "Generating Codex fixes",
    sublabel: "Synthesising production-ready patches",
    Icon: Code2,
    color: "#FFC800",
    bg: "#FFF6D6",
    delay: 9000,
  },
  {
    label: "Calculating trust score",
    sublabel: "Applying weighted category scoring engine",
    Icon: Shield,
    color: "#58CC02",
    bg: "#EAF8DC",
    delay: 11700,
  },
];

function Index() {
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

  const runAudit = async (payload: { imageBase64?: string; url?: string }) => {
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
    runAudit({ imageBase64 });
  };
  const handleUrlAudit = () => {
    if (!url.trim()) return toast.error("Enter a URL");
    if (!isAuthenticated) {
      toast.info("Please sign in or continue as Guest to run the audit.");
      setAuthView("signin");
      setIsAuthModalOpen(true);
      return;
    }
    runAudit({ url });
  };

  // No full screen auth gate - allowing website to open first!

  // Main Auditing dashboard if logged in
  return (
    <div className="min-h-dvh bg-white text-[#3C3C3C]">
      <Toaster />

      {/* Chunky Themed Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1635]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setIsAuthModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white border-2 border-[#E5E5E5] shadow-[0_8px_0_0_#E5E5E5] rounded-[24px] p-8 sm:p-10 flex flex-col items-center animate-in zoom-in-95 duration-200 z-10">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border-2 border-[#E5E5E5] text-[#AFAFAF] hover:text-[#3C3C3C] hover:bg-[#F7F7F7] flex items-center justify-center transition-colors cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-[#58CC02] flex items-center justify-center shadow-[0_3px_0_0_#46A302] mb-6">
              <Shield className="w-7 h-7 text-white stroke-[2.5]" />
            </div>

            <h2 className="font-display text-[28px] font-bold text-[#0F1635] tracking-tight text-center leading-none mb-2">
              Enter <span className="font-serif italic text-[#58CC02]">ShieldUX</span>
            </h2>
            <p className="text-[13px] text-[#777] text-center mb-6">
              AI-driven product security, accessibility, and UX auditing engine.
            </p>

            {/* Segmented Auth View Controls */}
            <div className="w-full border-2 border-[#E5E5E5] p-1 rounded-xl flex mb-6 bg-white">
              <button
                type="button"
                onClick={() => {
                  setAuthView("signin");
                  setAuthError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-extrabold uppercase tracking-[0.5px] rounded-lg transition-colors cursor-pointer ${
                  authView === "signin"
                    ? "bg-[#EAF8DC] text-[#58CC02]"
                    : "text-[#AFAFAF] hover:text-[#3C3C3C]"
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
                className={`flex-1 py-2 text-[12px] font-extrabold uppercase tracking-[0.5px] rounded-lg transition-colors cursor-pointer ${
                  authView === "signup"
                    ? "bg-[#EAF8DC] text-[#58CC02]"
                    : "text-[#AFAFAF] hover:text-[#3C3C3C]"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error alert */}
            {authError && (
              <div className="w-full bg-[#FFE5E5] border-2 border-[#FF4B4B]/20 rounded-xl p-4 mb-5 flex items-start gap-2.5 text-[#FF4B4B] text-[12px] leading-relaxed font-bold">
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
                <label className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] block mb-1.5 pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 pl-11 pr-4 rounded-[14px] border-2 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-[14px] font-semibold text-[#3C3C3C] placeholder:text-[#AFAFAF] placeholder:font-medium transition-colors"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFAFAF]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] block mb-1.5 pl-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-11 pr-10 rounded-[14px] border-2 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-[14px] font-semibold text-[#3C3C3C] placeholder:text-[#AFAFAF] placeholder:font-medium transition-colors"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFAFAF]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#AFAFAF] hover:text-[#3C3C3C] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authView === "signup" && (
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF] block mb-1.5 pl-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-12 pl-11 pr-10 rounded-[14px] border-2 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-[14px] font-semibold text-[#3C3C3C] placeholder:text-[#AFAFAF] placeholder:font-medium transition-colors"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AFAFAF]" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 bg-[#58CC02] text-white border-2 border-[#58CC02] shadow-[0_4px_0_0_#46A302] hover:bg-[#4BB200] rounded-[14px] font-extrabold uppercase tracking-[0.5px] transition-all duration-100 active:translate-y-[4px] active:!shadow-[0_0_0_0_transparent] flex items-center justify-center gap-2 text-[14px] cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
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
              <span className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-[9px] font-bold text-[#AFAFAF] uppercase tracking-widest">
                Demo Bypasses
              </span>
              <span className="flex-1 h-px bg-[#E5E5E5]" />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={authLoading}
              className="w-full h-12 bg-white text-[#1CB0F6] border-2 border-[#E5E5E5] shadow-[0_4px_0_0_#E5E5E5] hover:bg-[#F7F7F7] rounded-[14px] font-extrabold uppercase tracking-[0.5px] transition-all duration-100 active:translate-y-[4px] active:!shadow-[0_0_0_0_transparent] flex items-center justify-center gap-2 text-[14px] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#1CB0F6]" fill="#1CB0F6" />
              <span>Sign In as Guest</span>
            </button>
          </div>
        </div>
      )}

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
            {[
              { label: "Audit", href: "#audit" },
              { label: "Domains", href: "#domains" },
              { label: "Findings", href: "#findings" },
              { label: "Codex", href: "#codex" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-3 py-2 rounded-lg text-[13px] font-bold uppercase tracking-[0.5px] text-[#AFAFAF] hover:text-[#58CC02] hover:bg-[#EAF8DC] transition-colors"
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
              <Zap className="h-3.5 w-3.5" strokeWidth={3} />
              Run Audit
            </Btn>

            {/* Conditional Sign In / Sign Up / Exit Buttons in Navbar */}
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="h-9 px-4 rounded-[10px] border-2 border-[#E5E5E5] text-[#777] hover:text-[#3C3C3C] hover:bg-[#F7F7F7] font-extrabold text-[12px] uppercase tracking-[0.5px] transition-all flex items-center gap-1.5 active:translate-y-[2px] active:shadow-[0_0_0_0_transparent] cursor-pointer"
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
                  className="h-9 px-4 rounded-[10px] border-2 border-[#E5E5E5] bg-white text-[#1CB0F6] shadow-[0_3px_0_0_#E5E5E5] hover:bg-[#F7F7F7] font-extrabold text-[12px] uppercase tracking-[0.5px] transition-all flex items-center gap-1.5 active:translate-y-[3px] active:!shadow-[0_0_0_0_transparent] cursor-pointer"
                >
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthView("signup");
                    setAuthError(null);
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex h-9 px-4 rounded-[10px] border-2 border-[#58CC02] bg-[#58CC02] text-white shadow-[0_3px_0_0_#46A302] hover:bg-[#4BB200] font-extrabold text-[12px] uppercase tracking-[0.5px] transition-all items-center gap-1.5 active:translate-y-[3px] active:!shadow-[0_0_0_0_transparent] cursor-pointer"
                >
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
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
              4 Analysis Domains · Multimodal · Multi-layer AI Audit
            </span>
          </div>

          <h1 className="font-display text-[44px] md:text-[72px] leading-[0.95] text-[#0F1635]">
            ship products that
            <br />
            <span className="text-[#58CC02]">people trust.</span>
          </h1>

          <p className="mt-6 text-[17px] md:text-[19px] text-[#777] max-w-[600px] mx-auto leading-relaxed">
            ShieldUX audits your UI for{" "}
            <span className="font-bold text-[#3C3C3C]">
              security, accessibility, privacy and UX
            </span>{" "}
            issues — then writes the code to fix them. Drop a screenshot. Get a trust score in 15
            seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Btn
              size="lg"
              onClick={() =>
                document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })
              }
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
              { icon: Layers, value: "5", label: "Audit domains", color: "#58CC02" },
              { icon: ShieldCheck, value: "100%", label: "Actionable fixes", color: "#FF9600" },
              { icon: Zap, value: "~15s", label: "Avg audit time", color: "#1CB0F6" },
            ].map((s) => (
              <div key={s.label} className="card-chunky px-4 py-5 hover:card-chunky-hover">
                <s.icon
                  className="h-5 w-5 mx-auto mb-2"
                  style={{ color: s.color }}
                  strokeWidth={2.5}
                />
                <div className="font-display text-[28px] leading-none text-[#0F1635]">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] font-extrabold uppercase tracking-[1px] text-[#AFAFAF]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOMAINS */}
      <section id="domains" className="mx-auto max-w-[1280px] px-6 py-20">
        <SectionLabel>Analysis domains</SectionLabel>
        <h2 className="font-display text-[36px] md:text-[48px] text-[#0F1635] mb-3">
          Four domains. <span className="text-[#58CC02]">One verdict.</span>
        </h2>
        <p className="text-[16px] text-[#777] mb-12 max-w-xl">
          Four analysis layers run in sequence — each grounded in visual evidence from your
          screenshot — then reconciled into a weighted Trust Score.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Eye,
              name: "UX Auditor",
              desc: "Reads hierarchy, trust signals, CTA clarity, friction points.",
              color: "#58CC02",
              bg: "#EAF8DC",
            },
            {
              icon: CheckCircle2,
              name: "Accessibility",
              desc: "Contrast, focus order, semantic structure, WCAG checks.",
              color: "#1CB0F6",
              bg: "#D9F0FE",
            },
            {
              icon: Lock,
              name: "Security",
              desc: "Auth UX, leaked data, missing MFA, weak password flows.",
              color: "#FF4B4B",
              bg: "#FFE5E5",
            },
            {
              icon: Code2,
              name: "Codex Fixer",
              desc: "Writes ready-to-paste React + Tailwind patches.",
              color: "#FFC800",
              bg: "#FFF6D6",
            },
          ].map((a) => (
            <div key={a.name} className="card-chunky p-5 hover:card-chunky-hover group">
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
            Upload a screenshot of any login screen, dashboard or checkout. Get a full audit in
            seconds.
          </p>

          <div className="card-chunky overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b-2 border-[#E5E5E5] bg-white">
              {(
                [
                  { id: "screenshot", icon: Upload, label: "Screenshot", soon: false },
                  { id: "url", icon: LinkIcon, label: "URL", soon: false },
                  { id: "repo", icon: Github, label: "Repo", soon: true },
                  { id: "figma", icon: Frame, label: "Figma", soon: true },
                ] as const
              ).map((t) => {
                const active = tab === t.id;
                const disabled = t.soon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (!disabled && (t.id === "screenshot" || t.id === "url")) {
                        setTab(t.id);
                      }
                    }}
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
                        Analyzing…
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
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />
                      ) : (
                        "Audit"
                      )}
                    </Btn>
                  </div>
                  <p className="text-[12px] text-[#AFAFAF] mt-3">
                    Screenshots give richer multimodal results than URLs.
                  </p>
                </>
              )}

              {loading &&
                (() => {
                  const stage = AUDIT_STAGES[stageIdx];
                  const StageIcon = stage.Icon;
                  return (
                    <div className="mt-7 space-y-4 animate-in fade-in duration-300">
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
                            className="text-[13px] font-extrabold text-[#0F1635] flex items-center gap-0 animate-in fade-in duration-300"
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
                            className="text-[11px] text-[#AFAFAF] font-medium mt-0.5 animate-in fade-in duration-500 truncate"
                          >
                            {stage.sublabel}
                          </div>
                        </div>
                        <span
                          className="text-[13px] font-extrabold tabular-nums flex-shrink-0 transition-colors duration-500"
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
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[0.8px] transition-all duration-300 ${
                                done
                                  ? "bg-[#EAF8DC] text-[#46A302]"
                                  : active
                                    ? "text-white"
                                    : "bg-[#F0F0F0] text-[#C0C0C0]"
                              }`}
                              style={active ? { background: s.color } : {}}
                            >
                              {done ? (
                                <Check className="w-2.5 h-2.5" strokeWidth={3} />
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
                      <div className="h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
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

      {/* RESULTS */}
      {result && (
        <section id="results" className="mx-auto max-w-[1100px] px-6 py-20">
          <SectionLabel>Audit results</SectionLabel>

          {result.errorInfo && (
            <div className="card-chunky border-[#FF4B4B] bg-[#FFE5E5] p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3.5 items-start">
                <div className="h-10 w-10 rounded-xl bg-[#FF4B4B] flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#CC3C3C]">
                  <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-[18px] font-bold text-[#CC3C3C] leading-none mb-1.5">
                    API Provider Error (Demo Mode Enabled)
                  </h4>
                  <p className="text-[13px] text-[#FF4B4B] leading-relaxed font-semibold">
                    ShieldUX is running in{" "}
                    <strong>Demo Mode (showing default mock report with 86 score)</strong> because
                    the configured RapidAPI GPT-4o integration has an issue:
                  </p>
                  <div className="mt-3 p-3 bg-white/60 border border-[#FF4B4B]/20 rounded-xl font-mono text-[12px] text-[#A30000] break-all">
                    {result.errorInfo}
                  </div>
                  <p className="text-[12px] text-[#FF4B4B] mt-3 leading-relaxed">
                    <strong>How to fix:</strong> Please ensure your <code>RAPIDAPI_KEY</code> and{" "}
                    <code>RAPIDAPI_HOST</code> in <code>d:\ShieldUX\shieldux\.env.local</code> are
                    correct and active in your RapidAPI Dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {/* Trust Score + Category Breakdown */}
            <div className="card-chunky p-7 md:col-span-1 bg-gradient-to-br from-[#EAF8DC] to-white flex flex-col">
              <div className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#AFAFAF] mb-3">
                Trust Score
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="font-display text-[72px] leading-none transition-colors duration-500"
                  style={{ color: scoreColor(result.trustScore) }}
                >
                  {result.trustScore}
                </span>
                <span className="font-display text-[24px] text-[#AFAFAF]">/100</span>
              </div>
              <div className="h-3 rounded-full bg-[#E5E5E5] overflow-hidden mb-5">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${result.trustScore}%`,
                    background: scoreColor(result.trustScore),
                  }}
                />
              </div>

              {/* Per-category breakdown */}
              {result.categoryScores && (
                <div className="space-y-2.5 mt-auto">
                  <div className="text-[9px] font-extrabold uppercase tracking-[1.5px] text-[#AFAFAF] mb-1">
                    Category Breakdown
                  </div>
                  {CATEGORY_ORDER.map(({ key, label }) => {
                    const score = result.categoryScores?.[key as Category] ?? 100;
                    const color = scoreColor(score);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-[#3C3C3C]">{label}</span>
                          <span
                            className="text-[11px] font-extrabold tabular-nums"
                            style={{ color }}
                          >
                            {score}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
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

          {/* Findings — sorted HIGH → MEDIUM → LOW, grouped by category */}
          <h3
            id="findings"
            className="font-display text-[28px] text-[#0F1635] mb-6 flex items-center gap-2"
          >
            <AlertTriangle className="h-6 w-6 text-[#FF9600]" strokeWidth={2.5} />
            Findings
            <span className="ml-auto text-[14px] font-bold text-[#AFAFAF] normal-case tracking-normal">
              {result.findings.length} total
            </span>
          </h3>
          <div className="mb-12 space-y-10">
            {groupAndSortFindings(result.findings).map(({ category, findings: catFindings }) => (
              <div key={category}>
                {/* Category divider */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[#AFAFAF]">
                    {category}
                  </span>
                  <span className="flex-1 h-px bg-[#E5E5E5]" />
                  <span className="text-[10px] font-extrabold tabular-nums text-[#AFAFAF]">
                    {catFindings.length} {catFindings.length === 1 ? "issue" : "issues"}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {catFindings.map((f) => {
                    const st = sevStyles[f.severity];
                    return (
                      <div key={f.id} className="card-chunky p-6 hover:card-chunky-hover">
                        <div className="flex items-start justify-between gap-3 mb-3">
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
                        <p className="text-[14px] text-[#777] leading-relaxed mb-4">
                          {f.description}
                        </p>
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
              </div>
            ))}
          </div>

          {/* Codex */}
          {result.codexFixes?.length > 0 && (
            <>
              <h3
                id="codex"
                className="font-display text-[28px] text-[#0F1635] mb-5 flex items-center gap-2"
              >
                <Code2 className="h-6 w-6 text-[#1CB0F6]" strokeWidth={2.5} />
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
      <section id="how" className="bg-[#FAFAF7] border-t-2 border-[#E5E5E5]">
        <div className="mx-auto max-w-[1280px] px-6 py-20">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="font-display text-[36px] md:text-[48px] text-[#0F1635] mb-12">
            Four steps from <span className="text-[#58CC02]">screenshot to ship</span>.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                n: "01",
                title: "Upload",
                desc: "Drop a screenshot or paste a URL.",
                color: "#58CC02",
              },
              {
                n: "02",
                title: "Analyze",
                desc: "Four analysis layers run in sequence.",
                color: "#1CB0F6",
              },
              {
                n: "03",
                title: "Score",
                desc: "HIGH / MEDIUM / LOW risk findings.",
                color: "#FF9600",
              },
              {
                n: "04",
                title: "Fix",
                desc: "Paste the Codex patches and ship.",
                color: "#FFC800",
              },
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
        </div>
      </footer>
    </div>
  );
}
