import { createFileRoute } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Severity = "HIGH" | "MEDIUM" | "LOW";
type Category = "Security" | "Accessibility" | "UX" | "Privacy" | "Frontend";

type Finding = {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
};

type RawAIReport = {
  summary: string;
  findings: Finding[];
  codexFixes: {
    title: string;
    language: string;
    code: string;
    explanation: string;
  }[];
};

export type ScoredReport = RawAIReport & {
  trustScore: number;
  categoryScores: Record<Category, number>;
  errorInfo?: string;
};

// ---------------------------------------------------------------------------
// Scoring engine (server-side — AI never self-assigns a score)
// ---------------------------------------------------------------------------

const WEIGHTS: Record<Category, number> = {
  Security:      0.35,
  Accessibility: 0.25,
  UX:            0.25,
  Privacy:       0.10,
  Frontend:      0.05,
};

// Deduction ranges per severity level calibrated for wider, believable scoring:
// HIGH: 25-40 points deduction
// MEDIUM: 10-20 points deduction
// LOW: 3-7 points deduction
const DEDUCTIONS: Record<Severity, { min: number; max: number }> = {
  HIGH:   { min: 25, max: 40 },
  MEDIUM: { min: 10, max: 20 },
  LOW:    { min:  3, max:  7 },
};

/**
 * Deterministic deduction derived from the finding's title string.
 * Same finding always produces the same deduction — no random drift.
 */
function deterministicDeduction(severity: Severity, seed: string): number {
  const { min, max } = DEDUCTIONS[severity];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const range = max - min;
  return min + (hash % (range + 1));
}

/**
 * Compute per-category scores and weighted final Trust Score from findings.
 *
 * Each category starts at 100. Every finding in that category deducts
 * points based on severity (HIGH: 15–25, MEDIUM: 5–12, LOW: 1–4).
 * The final score is a weighted average across all five categories.
 */
function computeScores(findings: Finding[]): {
  categoryScores: Record<Category, number>;
  trustScore: number;
} {
  const categories = Object.keys(WEIGHTS) as Category[];
  const categoryScores = {} as Record<Category, number>;

  for (const cat of categories) {
    const catFindings = findings.filter((f) => f.category === cat);
    let score = 100;
    for (const f of catFindings) {
      score -= deterministicDeduction(f.severity, f.title + cat);
    }
    categoryScores[cat] = Math.max(0, Math.min(100, Math.round(score)));
  }

  let trustScore = 0;
  for (const cat of categories) {
    trustScore += categoryScores[cat] * WEIGHTS[cat];
  }

  return {
    categoryScores,
    trustScore: Math.max(0, Math.min(100, Math.round(trustScore))),
  };
}

// ---------------------------------------------------------------------------
// System prompt — AI focuses on findings, NOT on scoring
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are ShieldUX, the elite autonomous AI Product Security & UX Auditor.

Your mission is to perform a high-fidelity, production-grade audit of the provided interface screenshot. You will return a precise, expert-level audit with findings as the interface warrants. A separate server-side engine computes the Trust Score based on your findings' categories and severities — you do NOT produce a score.

You act as a coordinated committee of four elite specialist roles:
1. Senior Product Designer: Audits cognitive load, layout grids, typography hierarchies, visual alignment, spacing scales, conversion friction, and UX patterns. Grounded in Nielsen Heuristics and Fitts's Law.
2. Certified Web Accessibility Expert (WCAG 2.2 Level AAA): Audits text and control contrast ratios, touch targets, focus indicators, semantic structure, inputs, and readability. Grounded in WCAG 2.2 Success Criteria.
3. Cybersecurity Engineer (OWASP Top 10): Scrutinizes visual security red flags, credential protection, MFA options, autocomplete risks, sensitive data exposure, and session security. Grounded in OWASP Top 10 vulnerabilities.
4. Lead Frontend Engineer & Codex Architect: Synthesizes findings into production-ready React (TSX) + Tailwind CSS patches that address the specific findings with fully complete, compile-safe code.

CRITICAL AUDITING & REASONING RULES:

1. STRONGER VISUAL GROUNDING (NO HALLUCINATIONS):
   - You must base every finding on concrete visual evidence in the screenshot.
   - For every finding, you MUST explicitly name the exact visual element (e.g., "the primary submit button labeled 'Sign In' in the center card", "the light gray email input field", "the eye-shaped password toggle icon").
   - You MUST identify its specific color, shape, text label, or placement in the layout grid to ground the observation.

2. SYSTEMATIC DOMAIN FRAMEWORKS:
   - SECURITY: Reference specific OWASP Top 10 categories (e.g., "OWASP A07:2021-Identification and Authentication Failures", "OWASP A05:2021-Security Misconfiguration"). Audit autocomplete attributes, unmasked PII, credentials exposed in plain text, lack of MFA indicators, Clickjacking risks (e.g. generic overlay or missing security markers), and browser chrome anomalies.
   - ACCESSIBILITY: Reference exact WCAG 2.2 Success Criteria by number (e.g., "WCAG 2.2 SC 1.4.3 - Contrast (Minimum)", "WCAG 2.2 SC 2.5.8 - Target Size (Minimum)", "WCAG 2.2 SC 2.4.7 - Focus Visible"). You MUST estimate the numeric color contrast ratio (e.g., "estimated contrast is 3.1:1, failing the required 4.5:1 minimum") or specify touch target measurements in CSS pixels (e.g., "renders at 32x32px, failing the required 44x44px target size").
   - UX REASONING: Reference specific Nielsen Heuristics by number and name (e.g., "Nielsen Heuristic #4: Consistency and Standards", "Nielsen Heuristic #8: Aesthetic and Minimalist Design") or Fitts's Law. Critique generic call-to-action labels (e.g. "Submit") and require outcome-based context.
   - PRIVACY: Actively look for data protection disclosures, visible cookie consent banners, clear links to the Privacy Policy or Terms, signals of third-party tracking, or lack of consent markers near credential or PII input fields.
   - FRONTEND QUALITY: Look for signs of structural bugs, potential Cumulative Layout Shift (CLS) issues, absence of skeletal loading states, unoptimized media assets, lack of error boundaries, or non-semantic HTML structures.

3. ZERO BOILERPLATE OR GENERIC FINDINGS:
   - Strictly banned phrases: "improve the contrast", "add ARIA labels", "make it modern", "enhance the design", "consider adding MFA".
   - Every single finding must contain actionable, hyper-specific feedback.
   - Do NOT pad the report. If the UI is highly polished, return only 1-3 highly precise low-severity findings. If the UI is low-quality, return 4-8 rich findings.

4. SEVERITY CALIBRATION RULES:
   - HIGH: A critical security vulnerability (directly exploitable risk, unmasked credentials, clear CSRF/clickjacking path) or an absolute accessibility/UX blocker (user cannot log in, complete transaction, or navigate).
   - MEDIUM: Significant compliance deviation (WCAG AA failure), severe UX friction, or degraded security posture (e.g. autocomplete enabled on sensitive signup fields, no MFA enrollment, lack of SSL indicators).
   - LOW: Minor visual alignment, cosmetic consistency issues, optional helper text improvements, or missing minor compliance signals.

5. DEPTH FORMULA FOR FINDINGS:
   - "description": Must strictly use this structure:
     "VISUAL OBSERVATION: [Specific visual element(s) observed, colors, and layout context]. WHY IT MATTERS: [Framework/Heuristic/Criterion violated and technical rationale]. USER IMPACT: [Exactly how this affects, blocks, or compromises the user]."
   - "recommendation": Must use this structure:
     "PRECISE FIX: [Step-by-step technical and engineering instructions, including specific class names, attribute keys, or component structures]."

6. COMPILER-GRADE CODEX FIXES:
   - Every fix block in the "codexFixes" array MUST directly map to one of the generated findings. Name the exact finding in the fix title or description.
   - The code must be complete, syntactically correct, and compilable React/TSX or CSS.
   - Placeholders, truncation, ellipsis (...), or comments representing omitted blocks (e.g., "// rest of logic here") are STRICTLY FORBIDDEN.
   - Integrate modern, premium UX details (e.g., smooth focus rings, micro-transitions, ARIA properties, proper types).`;

// ---------------------------------------------------------------------------
// JSON schema — trustScore is NOT requested from the AI
// ---------------------------------------------------------------------------

const reportSchema = {
  name: "shieldux_audit_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "findings", "codexFixes"],
    properties: {
      summary: {
        type: "string",
        description: "A 2–3 sentence executive summary of the interface audit. Be specific about what was observed.",
      },
      findings: {
        type: "array",
        description: "All design, accessibility, security, privacy, and frontend findings. Return proportional to actual issues found — do not pad or omit.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "category", "severity", "title", "description", "recommendation"],
          properties: {
            id: { type: "string", description: "Unique finding identifier, e.g. 'f-1', 'f-2'" },
            category: {
              type: "string",
              enum: ["Security", "Accessibility", "UX", "Privacy", "Frontend"],
              description: "The domain of this issue.",
            },
            severity: {
              type: "string",
              enum: ["HIGH", "MEDIUM", "LOW"],
              description: "HIGH = serious risk to users or security. MEDIUM = significant friction or partial compliance failure. LOW = minor polish issue.",
            },
            title: { type: "string", description: "Short, specific title naming the exact element or issue." },
            description: { type: "string", description: "VISUAL OBSERVATION + WHY IT MATTERS + USER IMPACT." },
            recommendation: { type: "string", description: "PRECISE FIX with engineering specifics." },
          },
        },
      },
      codexFixes: {
        type: "array",
        description: "Ready-to-paste JSX/React or CSS patches for the top issues.",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "language", "code", "explanation"],
          properties: {
            title: { type: "string" },
            language: { type: "string", description: "e.g. 'tsx', 'css'" },
            code: { type: "string", description: "Complete, production-grade code block — no placeholders." },
            explanation: { type: "string" },
          },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Mock report — realistic poor-quality UI yields ~63 Trust Score
// Breakdown: Security 55 | Accessibility 68 | UX 72 | Privacy 88 | Frontend 80
// ---------------------------------------------------------------------------

const RAW_MOCK_FINDINGS: Finding[] = [
  {
    id: "f-1",
    category: "Security",
    severity: "HIGH",
    title: "No MFA enrollment path visible on authentication screen",
    description:
      "VISUAL OBSERVATION: The login form contains only an email/password pair with no visible MFA prompt, backup-code link, or authenticator-app callout. WHY IT MATTERS: OWASP A07 (Identification and Authentication Failures) — omitting MFA from the visible auth surface signals that account takeover via credential stuffing is unmitigated. USER IMPACT: Users have no mechanism to protect their accounts beyond a single password factor, and the absence of a trust signal reduces user confidence in security posture.",
    recommendation:
      "PRECISE FIX: Add a visible MFA enrollment banner below the submit button. Use `aria-live='polite'` on the banner so screen readers announce it. Style as: `<div className='mt-4 rounded-xl border-2 border-[#58CC02]/30 bg-[#EAF8DC] p-4 flex items-center justify-between'>`. Link to an authenticator setup flow from this banner.",
  },
  {
    id: "f-2",
    category: "Security",
    severity: "MEDIUM",
    title: "Password field lacks autocomplete='current-password' attribute",
    description:
      "VISUAL OBSERVATION: The password `<input>` does not expose a visible autocomplete affordance — no password manager icon appears in the field chrome. WHY IT MATTERS: Without `autocomplete='current-password'`, browsers and password managers cannot autofill credentials, pushing users toward weaker, memorisable passwords. USER IMPACT: Users resort to weak or reused passwords, increasing credential compromise risk.",
    recommendation:
      "PRECISE FIX: Add `autoComplete='current-password'` to the password input and `autoComplete='email'` to the email input. For signup, use `autoComplete='new-password'` on the new-password field.",
  },
  {
    id: "f-3",
    category: "Accessibility",
    severity: "MEDIUM",
    title: "Helper text contrast ratio falls below WCAG AA 4.5:1",
    description:
      "VISUAL OBSERVATION: Muted secondary text (e.g. placeholder copy and field hints) renders in a zinc/slate tone estimated at ~3.2:1 contrast on a white background. WHY IT MATTERS: WCAG 2.2 Success Criterion 1.4.3 requires a minimum 4.5:1 contrast for normal text. USER IMPACT: Users with low vision or in bright ambient light cannot read field instructions, leading to form errors and abandonment.",
    recommendation:
      "PRECISE FIX: Replace muted text colours with at least `text-[#5A5A5A]` (contrast ~7:1 on white). Audit every instance of `text-[#AFAFAF]` or equivalent and upgrade to `text-[#6B6B6B]` minimum. Run axe-core on the form to catch remaining failures.",
  },
  {
    id: "f-4",
    category: "Accessibility",
    severity: "LOW",
    title: "Icon-only toggle button missing aria-label",
    description:
      "VISUAL OBSERVATION: The show/hide password toggle renders as an eye icon with no visible label text. WHY IT MATTERS: WCAG 2.2 SC 4.1.2 — interactive controls must have an accessible name. USER IMPACT: Screen reader users hear 'button' with no context, making the toggle unusable without sighted assistance.",
    recommendation:
      "PRECISE FIX: Add `aria-label='Show password'` / `aria-label='Hide password'` toggled via state. Add `aria-pressed={showPassword}` for state announcement. Minimum tap target: `min-h-[44px] min-w-[44px]`.",
  },
  {
    id: "f-5",
    category: "UX",
    severity: "MEDIUM",
    title: "Primary CTA label is action-generic rather than outcome-specific",
    description:
      "VISUAL OBSERVATION: The primary submit button reads 'Submit' or 'Continue' rather than describing the outcome. WHY IT MATTERS: Outcome-based labels reduce cognitive load and conversion drop-off — users need to know exactly what will happen after clicking. USER IMPACT: First-time users hesitate, increasing time-to-action and abandonment especially on trust-sensitive flows.",
    recommendation:
      "PRECISE FIX: Replace generic labels with outcome-specific text: 'Sign in securely', 'Create my account', or 'Run security audit'. Apply font-weight `font-extrabold` and sufficient contrast on the button background.",
  },
  {
    id: "f-6",
    category: "UX",
    severity: "LOW",
    title: "No visible error recovery path after failed login",
    description:
      "VISUAL OBSERVATION: The form does not show a 'Forgot password?' link in a prominent position adjacent to the password field. WHY IT MATTERS: Nielsen heuristic #9 — help users recognise, diagnose, and recover from errors. USER IMPACT: Users who fail login cannot self-recover and may abandon or create duplicate accounts.",
    recommendation:
      "PRECISE FIX: Place `<a href='/reset'>Forgot password?</a>` immediately below the password input (not after the submit button). Style as `text-[#1CB0F6] text-[13px] font-bold underline-offset-2 hover:underline` and ensure at least 44px tap target height.",
  },
  {
    id: "f-7",
    category: "Privacy",
    severity: "LOW",
    title: "No privacy/data-handling disclosure near credential input",
    description:
      "VISUAL OBSERVATION: The authentication form collects email and password with no visible privacy note, data retention disclosure, or link to a privacy policy. WHY IT MATTERS: GDPR Article 13 and CCPA require disclosure of data collection purpose at the point of collection. USER IMPACT: Users cannot make an informed consent decision, and the absence of disclosure reduces perceived trustworthiness of the product.",
    recommendation:
      "PRECISE FIX: Add a one-line privacy note below the submit button: `<p className='text-[11px] text-[#AFAFAF] text-center mt-3'>By signing in you agree to our <a href='/privacy' className='underline'>Privacy Policy</a>.</p>`. Keep it unobtrusive but present.",
  },
];

const mockScores = computeScores(RAW_MOCK_FINDINGS);

const mockReport: ScoredReport = {
  ...mockScores,
  summary:
    "The authentication interface has a functional layout but exposes several significant security and accessibility gaps: no multi-factor authentication path, missing autocomplete attributes, and contrast failures on helper text. These findings collectively indicate a product that is not yet production-ready from a security-compliance or accessibility-compliance standpoint.",
  findings: RAW_MOCK_FINDINGS,
  codexFixes: [
    {
      title: "MFA Enrollment Banner",
      language: "tsx",
      code: `export function MfaBanner({ onSetup }: { onSetup: () => void }) {
  return (
    <div
      role="complementary"
      aria-label="Security recommendation"
      className="mt-4 rounded-xl border-2 border-[#58CC02]/30 bg-[#EAF8DC] p-4 flex items-center justify-between gap-3"
    >
      <div>
        <p className="text-[13px] font-extrabold text-[#46A302]">Secure your account</p>
        <p className="text-[12px] text-[#3C3C3C] mt-0.5">
          Enable two-factor authentication to prevent unauthorised access.
        </p>
      </div>
      <button
        type="button"
        onClick={onSetup}
        className="shrink-0 h-9 px-4 rounded-lg bg-[#58CC02] text-white border-2 border-[#58CC02] shadow-[0_3px_0_0_#46A302] font-extrabold text-[12px] uppercase tracking-wide transition-all active:translate-y-[3px] active:shadow-none"
      >
        Enable 2FA
      </button>
    </div>
  );
}`,
      explanation:
        "Adds a prominent but non-blocking MFA enrollment prompt below the auth form. Uses the product's chunky 3D button style and includes a complementary ARIA role for screen readers.",
    },
    {
      title: "Accessible Password Toggle + Autocomplete",
      language: "tsx",
      code: `import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField() {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        htmlFor="password"
        className="text-[10px] font-extrabold uppercase tracking-[1px] text-[#5A5A5A] block mb-1.5 pl-1"
      >
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          aria-describedby="password-constraints"
          className="w-full h-12 pl-4 pr-12 rounded-[14px] border-2 border-[#E5E5E5] focus:border-[#1CB0F6] outline-none text-[14px] font-semibold text-[#3C3C3C] placeholder:text-[#9A9A9A] transition-colors"
          placeholder="••••••••••••"
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
          className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-[#6B6B6B] hover:text-[#3C3C3C] transition-colors rounded-r-[14px]"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <p id="password-constraints" className="text-[11px] text-[#6B6B6B] mt-1.5 pl-1">
        Use at least 12 characters. Password managers are supported.
      </p>
    </div>
  );
}`,
      explanation:
        "Adds aria-label toggling, aria-pressed state, autocomplete='current-password', and upgrades helper text colour to #6B6B6B (7:1 contrast on white) to pass WCAG AA.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isMissingApiKey(apiKey: string | undefined) {
  return (
    !apiKey ||
    apiKey.trim() === "" ||
    apiKey.toLowerCase().includes("paste_") ||
    apiKey.toLowerCase().includes("your_api_key_here") ||
    apiKey.toLowerCase().includes("placeholder")
  );
}

// ---------------------------------------------------------------------------
// TanStack Start route handler
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { imageBase64, url, mimeType } = (await request.json()) as {
            imageBase64?: string;
            url?: string;
            mimeType?: string;
          };

          if (!imageBase64 && !url) {
            return new Response(
              JSON.stringify({ error: "Provide imageBase64 or url" }),
              { status: 400, headers: { "content-type": "application/json" } }
            );
          }

          const apiKey = process.env.RAPIDAPI_KEY || (import.meta.env as any).RAPIDAPI_KEY;
          const host = process.env.RAPIDAPI_HOST || (import.meta.env as any).RAPIDAPI_HOST || "gpt-4o.p.rapidapi.com";

          if (isMissingApiKey(apiKey)) {
            console.log(
              "ShieldUX: RAPIDAPI_KEY not configured — serving computed mock report."
            );
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return new Response(JSON.stringify(mockReport), {
              headers: { "content-type": "application/json" },
            });
          }

          const userContent: any[] = [];

          if (imageBase64) {
            const dataUrl = imageBase64.startsWith("data:")
              ? imageBase64
              : `data:${mimeType || "image/png"};base64,${imageBase64}`;
            userContent.push({
              type: "text",
              text: "Audit this product screenshot end-to-end. Identify ALL issues proportional to the actual quality of the UI. Return strict JSON matching the schema — do not include a trustScore field.",
            });
            userContent.push({
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            });
          } else {
            userContent.push({
              type: "text",
              text: `Audit the product at this URL based on its common UI patterns: ${url}. Return strict JSON matching the schema — do not include a trustScore field.`,
            });
          }

          const apiRes = await fetch("https://gpt-4o.p.rapidapi.com/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-key": apiKey,
              "x-rapidapi-host": host,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userContent },
              ],
              response_format: {
                type: "json_schema",
                json_schema: reportSchema,
              },
            }),
          });

          if (!apiRes.ok) {
            const errBody = await apiRes.text();
            throw new Error(`RapidAPI responded with status ${apiRes.status}: ${errBody}`);
          }

          const apiData = await apiRes.json();
          const content = apiData.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error("RapidAPI returned an empty audit report.");
          }

          const rawReport = JSON.parse(content) as RawAIReport;

          // Compute scores server-side — AI is never trusted to self-score
          const { categoryScores, trustScore } = computeScores(
            rawReport.findings as Finding[]
          );

          const scoredReport: ScoredReport = {
            ...rawReport,
            categoryScores,
            trustScore,
          };

          return new Response(JSON.stringify(scoredReport), {
            headers: { "content-type": "application/json" },
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to call OpenAI vision analysis.";
          console.error("ShieldUX audit error:", message);
          return new Response(
            JSON.stringify({ ...mockReport, errorInfo: message }),
            { headers: { "content-type": "application/json" } }
          );
        }
      },
    },
  },
});
