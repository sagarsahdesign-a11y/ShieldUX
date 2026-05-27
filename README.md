# ShieldUX

AI-powered Product Security, Accessibility, UX & Privacy Auditor.

ShieldUX analyzes screenshots and URL inputs to detect usability issues, accessibility problems, security risks, and product trust gaps - then generates actionable fixes and code recommendations. Repository and design-surface auditing are part of the broader product direction, while the current MVP focuses on screenshot and URL review.

## Core Features

- Screenshot / URL auditing
- UX analysis
- Accessibility analysis
- Security review
- Privacy & trust checks
- AI-generated findings
- Codex-powered fix recommendations
- Dynamic trust scoring

## Problem

Teams ship interfaces with hidden UX, accessibility, and security issues that are hard to catch manually.

## Solution

ShieldUX uses multimodal AI analysis to audit digital products and generate structured findings plus implementation-ready fixes.

## Tech Stack

- TanStack Start / TanStack Router
- Vite
- TypeScript
- React
- Tailwind CSS
- Supabase authentication
- RapidAPI GPT-4o integration for AI analysis
- AI-assisted development workflows

## How It Works

1. Upload a screenshot or enter a URL.
2. AI analyzes the product surface across UX, accessibility, security, privacy, and frontend quality.
3. ShieldUX returns structured findings by category and severity.
4. The server computes category scores and a weighted trust score.
5. The app returns actionable fixes and code recommendations.

## Development Notes

Built using human-led product design, AI-assisted engineering workflows, and Codex-supported development tooling.

The current MVP includes a TanStack Start landing page, guest and Supabase-backed auth entry points, screenshot / URL audit inputs, a server route at `/api/analyze`, deterministic trust scoring, fallback demo results when the AI provider is not configured, and Codex-style fix cards.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite. In this project, Vite may use `http://localhost:8080` by default; if that port is unavailable, run a specific port:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Environment Variables

Create a local `.env.local` file for development. Do not commit real secrets.

Required for Supabase client/auth:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
```

Required for live AI analysis:

```bash
RAPIDAPI_KEY=
RAPIDAPI_HOST=gpt-4o.p.rapidapi.com
```

Optional for trusted server-only Supabase admin usage:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

If `RAPIDAPI_KEY` is missing or configured as a placeholder, ShieldUX serves a computed demo report so the MVP remains demoable without exposing provider credentials.

## Production Safety

- Keep service-role and provider keys server-side only.
- Use Vite-prefixed Supabase variables only for publishable client configuration.
- Never expose RapidAPI or service-role secrets in browser code.
- Validate production environment variables before deployment.
