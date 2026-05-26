// ShieldUX audit edge function - calls Lovable AI Gateway with Gemini multimodal
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are ShieldUX, an expert AI auditor for digital product UX, accessibility, privacy, frontend quality, and security.

You analyze a screenshot (or described URL) of a product UI and act as four expert agents in one pass:
1. UX Auditor — confusing flows, hierarchy issues, friction, weak CTAs, onboarding gaps.
2. Accessibility Agent — contrast, readability, WCAG, labels, touch targets.
3. Security Agent — insecure auth UX, missing MFA, weak trust signals, privacy concerns, unsafe flows.
4. Codex Fix Agent — concrete React/Tailwind code snippets and implementation guidance.

Return STRICT JSON only (no markdown fences), matching this TypeScript type:

{
  "trustScore": number, // 0-100 overall risk/quality score, 100 = best
  "summary": string,    // 1-2 sentence executive summary
  "findings": Array<{
    "id": string,
    "category": "UX" | "Accessibility" | "Security" | "Privacy" | "Frontend",
    "severity": "HIGH" | "MEDIUM" | "LOW",
    "title": string,
    "description": string,
    "recommendation": string
  }>,
  "codexFixes": Array<{
    "title": string,
    "language": string, // e.g. "tsx", "css"
    "code": string,
    "explanation": string
  }>
}

Be specific, actionable, and grounded in what's visible. Aim for 5-10 findings and 2-4 codex fixes.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, url, mimeType } = await req.json();

    if (!imageBase64 && !url) {
      return new Response(JSON.stringify({ error: "Provide imageBase64 or url" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const userContent: any[] = [];
    if (imageBase64) {
      const dataUrl = imageBase64.startsWith("data:")
        ? imageBase64
        : `data:${mimeType || "image/png"};base64,${imageBase64}`;
      userContent.push({
        type: "text",
        text: "Audit this product screenshot end-to-end. Return strict JSON per the schema.",
      });
      userContent.push({ type: "image_url", image_url: { url: dataUrl } });
    } else {
      userContent.push({
        type: "text",
        text: `Audit the product at this URL based on common patterns for such products: ${url}. Return strict JSON per the schema.`,
      });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please retry shortly." }),
          { status: 429, headers: { ...corsHeaders, "content-type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "content-type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      parsed = { trustScore: 0, summary: "Failed to parse audit", findings: [], codexFixes: [], raw };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
