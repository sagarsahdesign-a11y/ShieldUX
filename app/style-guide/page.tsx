"use client";

import { useState } from "react";

type LanguageId = "es" | "fr" | "de" | "ja";

export default function StyleGuidePage() {
  // Panel 7 Interactions (Toggle Switches)
  const [soundEffects, setSoundEffects] = useState(true);
  const [animations, setAnimations] = useState(false);

  // Panel 8 Interactions (Active Language Pills)
  const [activeLang, setActiveLang] = useState<LanguageId>("es");

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#4b4b4b] font-sans relative overflow-x-hidden antialiased pb-20 font-nunito">
      
      {/* Styles Injection for Fonts and Core Duolingo Variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        @font-face {
          font-family: 'Feather Bold';
          src: url('https://db.onlinewebfonts.com/t/14936bb7a4b6575fd2eee80a3ab52cc2.woff2') format('woff2'),
               url('https://db.onlinewebfonts.com/t/14936bb7a4b6575fd2eee80a3ab52cc2.woff') format('woff');
          font-weight: bold;
          font-style: normal;
        }

        :root {
          --green: rgb(88, 204, 2);
          --green-hover: rgb(75, 178, 0);
          --green-shadow: #61B800;
          --dark-blue: rgb(16, 15, 62);
          --blue: rgb(28, 176, 246);
          --gray-text: rgb(75, 75, 75);
          --gray-light: rgb(119, 119, 119);
          --border-color: rgb(229, 229, 229);
          --nav-text: rgb(175, 175, 175);
          --footer-green: #4EC604;
          --red: #FF4B4B;
          --orange: #FF9600;
          --golden: #FFC800;
        }

        .font-nunito {
          font-family: 'Nunito', 'DIN Round Pro', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .font-feather {
          font-family: 'Feather Bold', 'Nunito', sans-serif;
        }
      `}} />

      {/* 64px Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e5e5e5] z-50 px-6 sm:px-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Duolingo Logo SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://d35aaqx5ub95lt.cloudfront.net/images/splash/f92d5f2f7d56636846861c458c0d0b6c.svg"
            alt="Duolingo logo"
            className="w-[140px] h-[33px] object-contain shrink-0"
          />
          <div className="w-[1px] h-6 bg-[#e5e5e5]" />
          <span className="text-[11px] font-[900] tracking-[1.5px] text-[#777] uppercase font-nunito shrink-0">
            Style Guide
          </span>
        </div>

        {/* Desktop Navbar Links (Hidden under 900px) */}
        <div className="hidden min-[900px]:flex items-center gap-2">
          {["Colors", "Type", "Buttons", "Cards", "Components"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-[13px] font-[800] uppercase tracking-[0.5px] text-[#777] px-3.5 py-2 rounded-xl transition-all duration-200 hover:text-[var(--green)] hover:bg-[#58cc02]/[0.06] active:bg-[#58cc02]/[0.1]"
            >
              {link}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-14 px-6 md:px-10 text-center bg-gradient-to-b from-[#e8ffd8] via-[#f7fff1] to-[#f9f9f9] border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Headline - "duolingo design" in lowercase, Feather Bold */}
          <h1 className="text-[36px] sm:text-[52px] font-bold text-[#58CC02] lowercase font-feather tracking-tight mb-4 select-none leading-tight">
            duolingo design
          </h1>

          {/* Description */}
          <p className="text-[15px] sm:text-[17px] text-[#777] font-semibold max-w-[520px] leading-[1.6] mb-8 font-nunito">
            A comprehensive visual reference for the Duolingo design system covering colors, typography, button variants, cards, and UI components.
          </p>

          {/* Two Interactive 3D Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto max-[900px]:max-w-[280px] max-[900px]:mx-auto">
            {/* Primary Button */}
            <button className="w-full sm:w-auto h-12 px-6 bg-[var(--green)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#61B800] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer flex items-center justify-center">
              Get Started
            </button>

            {/* Secondary Button */}
            <button className="w-full sm:w-auto h-12 px-6 bg-transparent hover:bg-zinc-100/50 active:bg-zinc-200/50 border-2 border-[#CFCFCF] text-[var(--blue)] font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#CFCFCF] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer flex items-center justify-center">
              I already have an account
            </button>
          </div>

        </div>
      </section>

      {/* Main Grid Showcase Container */}
      <section className="max-w-[1440px] mx-auto bg-white border-l border-r border-b border-[#e5e5e5] grid grid-cols-1 lg:grid-cols-2 relative shadow-sm">
        
        {/* PANEL 1: Color Palette */}
        <div id="colors" className="p-7 sm:p-10 border-b lg:border-r border-[#e5e5e5] flex flex-col justify-between">
          <div>
            {/* Header label with line */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[11px] font-[800] tracking-[2px] text-[#AFAFAF] uppercase font-nunito">
                Color Palette
              </span>
              <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
            </div>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 min-[900px]:grid-cols-6 gap-3">
              {[
                { name: "Green", hex: "#58CC02", rgb: "rgb(88, 204, 2)", val: "var(--green)" },
                { name: "Green Hover", hex: "#4BB200", rgb: "rgb(75, 178, 0)", val: "var(--green-hover)" },
                { name: "Blue", hex: "#1CB0F6", rgb: "rgb(28, 176, 246)", val: "var(--blue)" },
                { name: "Dark Blue", hex: "#100F3E", rgb: "rgb(16, 15, 62)", val: "var(--dark-blue)" },
                { name: "Red", hex: "#FF4B4B", rgb: "rgb(255, 75, 75)", val: "var(--red)" },
                { name: "Orange", hex: "#FF9600", rgb: "rgb(255, 150, 0)", val: "var(--orange)" },
                { name: "Golden", hex: "#FFC800", rgb: "rgb(255, 200, 0)", val: "var(--golden)" },
                { name: "Footer Green", hex: "#4EC604", rgb: "rgb(78, 198, 4)", val: "var(--footer-green)" },
                { name: "Gray Text", hex: "#4B4B4B", rgb: "rgb(75, 75, 75)", val: "var(--gray-text)" },
                { name: "Gray Light", hex: "#777777", rgb: "rgb(119, 119, 119)", val: "var(--gray-light)" },
                { name: "Nav Text", hex: "#AFAFAF", rgb: "rgb(175, 175, 175)", val: "var(--nav-text)" },
                { name: "Border", hex: "#E5E5E5", rgb: "rgb(229, 229, 229)", val: "var(--border-color)" }
              ].map((c) => (
                <div key={c.name} className="flex flex-col items-center text-center">
                  <div
                    style={{ backgroundColor: c.val }}
                    className="w-full aspect-square rounded-2xl border border-black/[0.06] transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
                  />
                  <span className="text-[12px] font-[800] text-[#4b4b4b] mt-2 leading-tight block truncate w-full">
                    {c.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#777] mt-0.5">
                    {c.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: Typography */}
        <div id="type" className="p-7 sm:p-10 border-b border-[#e5e5e5]">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-[#AFAFAF] uppercase font-nunito">
              Typography
            </span>
            <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          </div>

          <div className="space-y-6">
            {[
              { size: "48px", label: "FEATHER", text: "Display", styles: "text-[32px] sm:text-[48px] text-[#58CC02] font-feather lowercase leading-none" },
              { size: "32px", label: "BOLD 700", text: "Heading One", styles: "text-[32px] font-[800] text-[#4b4b4b] font-nunito leading-tight" },
              { size: "28px", label: "FEATHER", text: "heading two", styles: "text-[28px] text-[#58CC02] font-feather lowercase leading-tight" },
              { size: "18px", label: "MEDIUM 500", text: "Body text for paragraphs and descriptions with comfortable reading line-height.", styles: "text-[18px] text-[#777] font-semibold leading-[1.6] font-nunito" },
              { size: "14px", label: "BOLD 700", text: "CAPTION LABEL", styles: "text-[14px] font-[800] uppercase text-[#AFAFAF] tracking-[0.5px] font-nunito" },
              { size: "12px", label: "SEMI 600", text: "Small utility text for metadata and hints", styles: "text-[12px] font-semibold text-[#777] font-nunito" }
            ].map((row, idx) => (
              <div key={idx} className="flex gap-5 items-baseline">
                {/* Meta column (Hidden below 600px) */}
                <div className="w-20 text-right shrink-0 max-[600px]:hidden">
                  <span className="text-[11px] font-[800] text-[var(--blue)] block">{row.size}</span>
                  <span className="text-[10px] text-[#AFAFAF] block leading-tight mt-0.5">{row.label}</span>
                </div>
                <div className="flex-1">
                  <p className={row.styles}>{row.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 3: Button Variants */}
        <div id="buttons" className="p-7 sm:p-10 border-b lg:border-r border-[#e5e5e5]">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-[#AFAFAF] uppercase font-nunito">
              Button Variants
            </span>
            <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          </div>

          <div className="space-y-6">
            {/* Primary Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] shrink-0 max-[600px]:hidden">
                Primary
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-12 px-6 bg-[var(--green)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#61B800] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer">
                  Get Started
                </button>
                <button className="h-9 px-4 bg-[var(--green)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[13px] uppercase tracking-wide rounded-xl shadow-[0_3px_0_#61B800] active:shadow-none active:translate-y-[3px] transition-all duration-100 ease-in-out cursor-pointer">
                  Small
                </button>
                <button className="h-12 px-6 bg-[var(--green)] opacity-45 pointer-events-none text-white font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#61B800]">
                  Disabled
                </button>
              </div>
            </div>

            {/* Secondary Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] shrink-0 max-[600px]:hidden">
                Secondary
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-12 px-6 bg-transparent hover:bg-zinc-100/50 active:bg-zinc-200/50 border-2 border-[#CFCFCF] text-[var(--blue)] font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#CFCFCF] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer">
                  Learn More
                </button>
                <button className="h-9 px-4 bg-transparent hover:bg-zinc-100/50 active:bg-zinc-200/50 border-2 border-[#CFCFCF] text-[var(--blue)] font-[800] text-[13px] uppercase tracking-wide rounded-xl shadow-[0_3px_0_#CFCFCF] active:shadow-none active:translate-y-[3px] transition-all duration-100 ease-in-out cursor-pointer">
                  Small
                </button>
                <button className="h-12 px-6 bg-transparent border-2 border-[#CFCFCF] text-[var(--blue)] opacity-45 pointer-events-none font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#CFCFCF]">
                  Disabled
                </button>
              </div>
            </div>

            {/* Danger Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] shrink-0 max-[600px]:hidden">
                Danger
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-12 px-6 bg-[var(--red)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#CC3C3C] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer">
                  Delete
                </button>
                <button className="h-9 px-4 bg-[var(--red)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[13px] uppercase tracking-wide rounded-xl shadow-[0_3px_0_#CC3C3C] active:shadow-none active:translate-y-[3px] transition-all duration-100 ease-in-out cursor-pointer">
                  Remove
                </button>
              </div>
            </div>

            {/* Ghost Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] shrink-0 max-[600px]:hidden">
                Ghost
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-12 px-6 bg-transparent hover:bg-[#58CC02]/[0.08] active:bg-[#58CC02]/[0.15] text-[#58CC02] font-[800] text-[15px] uppercase tracking-wide rounded-xl transition-all duration-150 cursor-pointer">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 4: Dark Theme Buttons (Dark Backdrop) */}
        <div className="p-7 sm:p-10 border-b border-[#e5e5e5] bg-[#100F3E] text-white">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-white/35 uppercase font-nunito">
              Dark Theme Buttons
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="space-y-6">
            {/* Primary / White Buttons on Dark */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-white/30 shrink-0 max-[600px]:hidden">
                Primary
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-12 px-6 bg-white hover:bg-[#c8f040] hover:shadow-[0_4px_0_#a8c030] active:shadow-none active:translate-y-[4px] text-[var(--dark-blue)] font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#88879F] transition-all duration-100 ease-in-out cursor-pointer">
                  Get Started
                </button>
                <button className="h-12 px-6 bg-white hover:bg-[#c8f040] hover:shadow-[0_4px_0_#a8c030] active:shadow-none active:translate-y-[4px] text-[var(--dark-blue)] font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#88879F] transition-all duration-100 ease-in-out cursor-pointer">
                  Try 1 Week Free
                </button>
              </div>
            </div>

            {/* Small variants */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-white/30 shrink-0 max-[600px]:hidden">
                Small
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button className="h-9 px-4 bg-white hover:bg-[#c8f040] hover:shadow-[0_3px_0_#a8c030] active:shadow-none active:translate-y-[3px] text-[var(--dark-blue)] font-[800] text-[13px] uppercase tracking-wide rounded-xl shadow-[0_3px_0_#88879F] transition-all duration-100 ease-in-out cursor-pointer">
                  Get Started
                </button>
                <button className="h-9 px-4 bg-white hover:bg-[#c8f040] hover:shadow-[0_3px_0_#a8c030] active:shadow-none active:translate-y-[3px] text-[var(--dark-blue)] font-[800] text-[13px] uppercase tracking-wide rounded-xl shadow-[0_3px_0_#88879F] transition-all duration-100 ease-in-out cursor-pointer">
                  Try 1 Week Free
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 5: Cards (Light Theme) */}
        <div id="cards" className="p-7 sm:p-10 border-b lg:border-r border-[#e5e5e5]">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-[#AFAFAF] uppercase font-nunito">
              Cards
            </span>
            <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          </div>

          <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-4">
            
            {/* Card 1 */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
              <div>
                {/* Image */}
                <div
                  style={{ backgroundImage: "url('https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop')" }}
                  className="w-full h-[120px] bg-cover bg-center"
                />
                
                {/* Content */}
                <div className="p-4">
                  <span className="inline-block bg-[#58CC02]/10 text-[#58CC02] text-[11px] font-[800] uppercase tracking-wide px-2 py-0.5 rounded-[6px] mb-2">
                    New
                  </span>
                  <h4 className="text-[16px] font-[800] text-[#4b4b4b] leading-tight mb-1">
                    Spanish for Beginners
                  </h4>
                  <p className="text-[13px] text-[#777] leading-[1.5]">
                    Start your language journey with interactive lessons designed to build fluency.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#e5e5e5] flex items-center justify-between">
                <span className="text-[12px] font-[800] text-[#AFAFAF] uppercase tracking-wide">
                  12 Units
                </span>
                <button className="text-[12px] font-[800] text-[var(--blue)] uppercase tracking-wide hover:opacity-75 transition-opacity cursor-pointer">
                  Start
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-2 border-[#e5e5e5] rounded-[16px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
              <div>
                {/* Image */}
                <div
                  style={{ backgroundImage: "url('https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop')" }}
                  className="w-full h-[120px] bg-cover bg-center"
                />
                
                {/* Content */}
                <div className="p-4">
                  <span className="inline-block bg-[var(--blue)]/10 text-[var(--blue)] text-[11px] font-[800] uppercase tracking-wide px-2 py-0.5 rounded-[6px] mb-2">
                    Popular
                  </span>
                  <h4 className="text-[16px] font-[800] text-[#4b4b4b] leading-tight mb-1">
                    French Conversations
                  </h4>
                  <p className="text-[13px] text-[#777] leading-[1.5]">
                    Practice real-world dialogue and improve pronunciation with native speakers.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-[#e5e5e5] flex items-center justify-between">
                <span className="text-[12px] font-[800] text-[#AFAFAF] uppercase tracking-wide">
                  8 Units
                </span>
                <button className="text-[12px] font-[800] text-[var(--blue)] uppercase tracking-wide hover:opacity-75 transition-opacity cursor-pointer">
                  Continue
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* PANEL 6: Dark Theme Cards (Dark Backdrop) */}
        <div className="p-7 sm:p-10 border-b border-[#e5e5e5] bg-[#100F3E] text-white">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-white/35 uppercase font-nunito">
              Dark Theme Cards
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="grid grid-cols-1 min-[900px]:grid-cols-2 gap-4">
            
            {/* Card 1 */}
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-[16px] p-5 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,255,255,0.03)]">
              <div>
                <span className="inline-block bg-[#FFC800]/15 text-[#FFC800] text-[11px] font-[800] uppercase tracking-wide px-2.5 py-0.5 rounded-[6px] mb-3">
                  Super
                </span>
                <h4 className="text-[16px] font-[800] text-white leading-tight mb-1">
                  Unlimited Hearts
                </h4>
                <p className="text-[13px] text-white/50 leading-[1.5]">
                  Keep learning without interruption with Super Duolingo benefits.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/8 pt-3 mt-4">
                <span className="text-[12px] font-[800] text-white/30 uppercase tracking-wide">
                  Premium
                </span>
                <button className="text-[12px] font-[800] text-white/70 hover:text-white uppercase tracking-wide transition-colors cursor-pointer">
                  Upgrade
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-[16px] p-5 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(255,255,255,0.03)]">
              <div>
                <span className="inline-block bg-[#FF9600]/15 text-[#FF9600] text-[11px] font-[800] uppercase tracking-wide px-2.5 py-0.5 rounded-[6px] mb-3">
                  Pro
                </span>
                <h4 className="text-[16px] font-[800] text-white leading-tight mb-1">
                  Mastery Quizzes
                </h4>
                <p className="text-[13px] text-white/50 leading-[1.5]">
                  Challenge yourself with advanced assessments to test your skill level.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/8 pt-3 mt-4">
                <span className="text-[12px] font-[800] text-white/30 uppercase tracking-wide">
                  Advanced
                </span>
                <button className="text-[12px] font-[800] text-white/70 hover:text-white uppercase tracking-wide transition-colors cursor-pointer">
                  Try Now
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* PANEL 7: Components (Light Theme) */}
        <div id="components" className="p-7 sm:p-10 border-b lg:border-r border-[#e5e5e5]">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-[#AFAFAF] uppercase font-nunito">
              Components
            </span>
            <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          </div>

          <div className="space-y-6">
            
            {/* Badges Stack */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] block mb-2.5">
                Badges
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { text: "Completed", styles: "text-[var(--green)] bg-[#58CC02]/12" },
                  { text: "In Progress", styles: "text-[var(--blue)] bg-[#1CB0F6]/12" },
                  { text: "Failed", styles: "text-[var(--red)] bg-[#FF4B4B]/12" },
                  { text: "Streak", styles: "text-[var(--orange)] bg-[#FF9600]/12" },
                  { text: "Premium", styles: "text-[#b8920f] bg-[#FFC800]/15" }
                ].map((b) => (
                  <span
                    key={b.text}
                    className={`inline-block text-[12px] font-[800] uppercase tracking-wide px-3.5 py-1.5 rounded-[20px] ${b.styles}`}
                  >
                    {b.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Input + Button Row */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] block mb-2.5">
                Inputs
              </span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 px-4 border-2 border-[#e5e5e5] focus:border-[var(--blue)] rounded-xl outline-none text-[15px] font-[600] text-[#4b4b4b] placeholder-[#AFAFAF]/70 transition-all font-nunito"
                />
                <button className="h-12 px-6 bg-[var(--green)] hover:brightness-105 active:brightness-95 text-white font-[800] text-[15px] uppercase tracking-wide rounded-xl shadow-[0_4px_0_#61B800] active:shadow-none active:translate-y-[4px] transition-all duration-100 ease-in-out cursor-pointer shrink-0">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Toggles (Functional) */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] block mb-2.5">
                Toggles
              </span>
              <div className="flex flex-wrap gap-6">
                {/* Switch 1 */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={() => setSoundEffects(!soundEffects)}
                      className="sr-only"
                    />
                    {/* Track */}
                    <div className={`w-12 h-7 rounded-full border-2 transition-colors duration-200 ${
                      soundEffects ? "bg-[var(--green)] border-[var(--green)]" : "bg-[#e5e5e5] border-[#e5e5e5]"
                    }`} />
                    {/* Thumb */}
                    <div className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-[1px_3px_5px_rgba(0,0,0,0.15)] transition-transform duration-200 ${
                      soundEffects ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                  <span className="text-[14px] font-[600] text-[#4b4b4b] font-nunito">Sound effects</span>
                </label>

                {/* Switch 2 */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={animations}
                      onChange={() => setAnimations(!animations)}
                      className="sr-only"
                    />
                    {/* Track */}
                    <div className={`w-12 h-7 rounded-full border-2 transition-colors duration-200 ${
                      animations ? "bg-[var(--green)] border-[var(--green)]" : "bg-[#e5e5e5] border-[#e5e5e5]"
                    }`} />
                    {/* Thumb */}
                    <div className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-[1px_3px_5px_rgba(0,0,0,0.15)] transition-transform duration-200 ${
                      animations ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                  <span className="text-[14px] font-[600] text-[#4b4b4b] font-nunito">Animations</span>
                </label>
              </div>
            </div>

            {/* Progress Bars */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] block mb-2.5">
                Progress Status
              </span>
              <div className="space-y-2.5 max-w-md">
                {[
                  { val: 85, color: "bg-[var(--green)]" },
                  { val: 60, color: "bg-[var(--blue)]" },
                  { val: 35, color: "bg-[var(--orange)]" }
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Progress Track */}
                    <div className="flex-1 h-3 bg-[#e5e5e5] rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.val}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${p.color}`}
                      />
                    </div>
                    {/* Label Value */}
                    <span className="w-8 text-[12px] font-[800] text-[#4b4b4b] text-right font-nunito">
                      {p.val}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip & Streak Row */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AFAFAF] block mb-2.5">
                Tooltips & Stats
              </span>
              <div className="flex items-center gap-6">
                
                {/* Interactive Pure CSS Tooltip Bubble */}
                <div className="relative group shrink-0">
                  <div className="text-[13px] font-[800] text-[#58CC02] bg-[#58CC02]/[0.08] hover:bg-[#58CC02]/[0.15] px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 font-nunito">
                    Hover me
                  </div>
                  
                  {/* Tooltip Bubble (Above, absolute) */}
                  <div className="absolute bottom-[130%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--dark-blue)] text-white text-[12px] font-[600] px-3.5 py-2 rounded-xl pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-30 shadow-xl font-nunito">
                    Great choice!
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--dark-blue)]" />
                  </div>
                </div>

                {/* Streak Counter */}
                <div className="inline-flex items-center gap-1.5 bg-[#FF9600]/10 border border-[#FF9600]/15 px-3.5 py-1.5 rounded-full select-none shrink-0">
                  <span className="text-[18px]">🔥</span>
                  <span className="text-[16px] font-[900] text-[var(--orange)] font-nunito">42</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* PANEL 8: Dark Theme Components (Dark Backdrop) */}
        <div className="p-7 sm:p-10 border-b border-[#e5e5e5] bg-[#100F3E] text-white">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[11px] font-[800] tracking-[2px] text-white/35 uppercase font-nunito">
              Dark Theme Components
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="space-y-6">
            
            {/* Language Selection Pills (Functional) */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2.5">
                Language Pills
              </span>
              <div className="flex flex-wrap gap-2.5">
                {([
                  { id: "es", label: "Spanish", flag: "https://d35aaqx5ub95lt.cloudfront.net/vendor/59a90a2cedd48b751a8fd22014768fd7.svg" },
                  { id: "fr", label: "French", flag: "https://d35aaqx5ub95lt.cloudfront.net/vendor/482fda142ee4abd728ebf4ccce5d3307.svg" },
                  { id: "de", label: "German", flag: "https://d35aaqx5ub95lt.cloudfront.net/vendor/c71db846ffab7e0a74bc6971e34ad82e.svg" },
                  { id: "ja", label: "Japanese", flag: "https://d35aaqx5ub95lt.cloudfront.net/vendor/edea4fa18ff3e7d8c0282de3f102aaed.svg" }
                ] satisfies Array<{ id: LanguageId; label: string; flag: string }>).map((l) => {
                  const isActive = activeLang === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setActiveLang(l.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 border-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                        isActive
                          ? "border-[var(--green)] bg-[var(--green)]/10 text-white"
                          : "border-white/12 hover:border-white/20 hover:bg-white/[0.03] text-white/70"
                      }`}
                    >
                      {/* Flag Image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={l.flag}
                        alt={l.label}
                        className="w-6 h-[18px] object-contain shrink-0"
                      />
                      <span className="text-[13px] font-[800] font-nunito">{l.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overlapping Avatar Stack */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2.5">
                Avatar Group
              </span>
              <div className="flex items-center gap-3">
                {/* Stacking element */}
                <div className="flex items-center">
                  {[
                    "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
                    "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
                    "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"
                  ].map((img, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundImage: `url('${img}')`,
                        marginLeft: i > 0 ? "-8px" : "0px"
                      }}
                      className="w-9 h-9 rounded-full bg-cover bg-center border-2 border-white shadow-md shrink-0"
                    />
                  ))}
                  {/* Plus badge circle */}
                  <div className="w-9 h-9 rounded-full bg-[#f0f0f0] border-2 border-white flex items-center justify-center -ml-2 shadow-md shrink-0 select-none">
                    <span className="text-[11px] font-[900] text-[#777] font-nunito">+5</span>
                  </div>
                </div>

                <span className="text-[13px] font-[600] text-white/50 font-nunito select-none">
                  8 learners active
                </span>
              </div>
            </div>

            {/* Dark Mode Progress Loaders */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2.5">
                Progress (Dark Theme)
              </span>
              <div className="space-y-2.5 max-w-md">
                {[
                  { val: 72, color: "bg-[var(--golden)]" },
                  { val: 45, color: "bg-[var(--green)]" }
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-white/8 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.val}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${p.color}`}
                      />
                    </div>
                    <span className="w-8 text-[12px] font-[800] text-white/60 text-right font-nunito">
                      {p.val}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Theme Badges */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2.5">
                Badges (Dark Theme)
              </span>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-block bg-[var(--green)]/15 text-[#7ADB2E] text-[12px] font-[800] uppercase tracking-wide px-3.5 py-1.5 rounded-[20px] font-nunito">
                  Mastered
                </span>
                <span className="inline-block bg-[var(--blue)]/15 text-[#4DC4F8] text-[12px] font-[800] uppercase tracking-wide px-3.5 py-1.5 rounded-[20px] font-nunito">
                  Review
                </span>
                <span className="inline-block bg-[var(--golden)]/15 text-[#FFC800] text-[12px] font-[800] uppercase tracking-wide px-3.5 py-1.5 rounded-[20px] font-nunito">
                  Crown
                </span>
              </div>
            </div>

          </div>
        </div>

      </section>
      
    </main>
  );
}
