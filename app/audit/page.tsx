"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Shield,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

const inputPhases = [
  ["Screenshot Upload", "Live now"],
  ["URL Audit", "Next"],
  ["GitHub Repo", "Soon"],
  ["Figma Frame", "Soon"],
];

export default function AuditPage() {
  const router = useRouter();
  const [screenshot, setScreenshot] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("shieldUxScreenshot");
  });
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a PNG, JPG, JPEG, or WebP screenshot.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please keep screenshots under 10MB for a fast audit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;
      localStorage.setItem("shieldUxScreenshot", image);
      setScreenshot(image);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    localStorage.removeItem("shieldUxScreenshot");
    setScreenshot(null);
    setError(null);
  };

  const startAudit = () => {
    if (!screenshot) {
      setError("Upload a product screenshot before starting the audit.");
      return;
    }

    router.push("/results");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400 text-black">
              <Shield size={20} />
            </span>
            <span>ShieldUX</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/30 hover:text-white"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
            <Sparkles size={16} />
            Phase 1 MVP | Screenshot Upload
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Upload a product screenshot for AI security and UX audit.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">
            ShieldUX runs specialist agents across UX, accessibility, privacy,
            frontend quality, and security patterns, then generates actionable
            fixes for builders.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {inputPhases.map(([name, status]) => (
              <div
                key={name}
                className="rounded-lg border border-white/10 bg-black p-4"
              >
                <p className="font-semibold">{name}</p>
                <p className="mt-1 text-sm text-zinc-500">{status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black p-5 shadow-2xl">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-zinc-500">Audit workspace</p>
              <h2 className="text-2xl font-bold">Screenshot input</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-black">
              <Lock size={14} />
              Local preview
            </span>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            className={`block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-emerald-300 bg-emerald-300/10"
                : "border-zinc-700 bg-zinc-950 hover:border-emerald-300/60"
            }`}
          >
            {screenshot ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshot}
                  alt="Uploaded product screenshot"
                  className="mx-auto max-h-[320px] w-full rounded-lg border border-white/10 object-contain"
                />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 size={16} />
                  Screenshot ready for audit
                </span>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center">
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-400 text-black">
                  <Upload size={30} />
                </span>
                <p className="text-lg font-bold">Drag and drop screenshot here</p>
                <p className="mt-2 text-sm text-zinc-500">
                  PNG, JPG, JPEG, or WebP up to 10MB
                </p>
                <span className="mt-6 rounded-lg bg-white px-5 py-2 text-sm font-bold text-black">
                  Browse files
                </span>
              </div>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) processFile(file);
              }}
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={clearScreenshot}
              disabled={!screenshot}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={18} />
              Clear
            </button>

            <button
              type="button"
              onClick={startAudit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 font-bold text-black transition hover:bg-emerald-300"
            >
              Start agent audit
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
