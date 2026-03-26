import { useState, useMemo, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const HEADING_FONTS = [
  "Playfair Display", "Fraunces", "DM Serif Display",
  "Cormorant Garamond", "Bebas Neue", "Syne",
  "Instrument Serif", "Abril Fatface",
];

const BODY_FONTS = [
  "DM Sans", "Manrope", "Plus Jakarta Sans",
  "IBM Plex Sans", "Nunito Sans", "Lato", "Source Sans 3",
];

const PALETTES = [
  { name: "Violet",   primary: "#7c3aed", secondary: "#a78bfa", neutral: "#0d0b14" },
  { name: "Ember",    primary: "#ea580c", secondary: "#fb923c", neutral: "#160800" },
  { name: "Sage",     primary: "#15803d", secondary: "#4ade80", neutral: "#071209" },
  { name: "Electric", primary: "#0891b2", secondary: "#22d3ee", neutral: "#020c14" },
  { name: "Rose",     primary: "#be123c", secondary: "#fb7185", neutral: "#150308" },
  { name: "Obsidian", primary: "#e5e5e5", secondary: "#737373", neutral: "#0a0a0a" },
  { name: "Amber",    primary: "#d97706", secondary: "#fbbf24", neutral: "#120a00" },
  { name: "Teal",     primary: "#0d9488", secondary: "#2dd4bf", neutral: "#030e0d" },
];

const VIBES = [
  "Minimalist", "Brutalist", "Glassmorphism", "Neumorphism",
  "Cyberpunk", "Luxury", "Playful", "Editorial", "Organic", "Art Deco",
];

const VIBE_TRAITS = {
  Minimalist:    "Extreme whitespace · Typography-led · 1–2 active colors · Zero decoration",
  Brutalist:     "Raw borders · High contrast · Visible grid · Monospace accents",
  Glassmorphism: "Frosted glass surfaces · backdrop-blur · Translucency layers",
  Neumorphism:   "Soft emboss/deboss · Single-tone palette · Tactile depth",
  Cyberpunk:     "Neon on dark · Scanlines · Glitch type · Grid overlays",
  Luxury:        "Metallic accents · Refined serifs · Generous spacing · No clutter",
  Playful:       "Rounded shapes · Bright pops · Wobble animations · Friendly",
  Editorial:     "Magazine grid · Strong typographic hierarchy · Ruled lines",
  Organic:       "Curved shapes · Earth tones · Biomorphic patterns · Soft gradients",
  "Art Deco":    "Geometric symmetry · Gold/black/white · Ornamental dividers",
};

const PRESETS = [
  {
    name: "SaaS Dashboard", icon: "⬡",
    config: { heading: "Syne", body: "DM Sans", palette: "Violet", themes: ["Minimalist"], buttonShape: "rounded", buttonStyle: "filled", animationType: "subtle", animationIntensity: 30, gridType: "12-col", spacingScale: "md", outputMode: "verbose" },
  },
  {
    name: "Landing Page", icon: "◆",
    config: { heading: "Fraunces", body: "Manrope", palette: "Ember", themes: ["Editorial", "Luxury"], buttonShape: "pill", buttonStyle: "filled", animationType: "dramatic", animationIntensity: 65, gridType: "fluid", spacingScale: "lg", outputMode: "verbose" },
  },
  {
    name: "Portfolio", icon: "▣",
    config: { heading: "Cormorant Garamond", body: "IBM Plex Sans", palette: "Obsidian", themes: ["Minimalist", "Editorial"], buttonShape: "sharp", buttonStyle: "ghost", animationType: "precise", animationIntensity: 40, gridType: "masonry", spacingScale: "xl", outputMode: "verbose" },
  },
  {
    name: "Web3 / Cyber", icon: "◈",
    config: { heading: "Bebas Neue", body: "IBM Plex Sans", palette: "Electric", themes: ["Cyberpunk", "Glassmorphism"], buttonShape: "sharp", buttonStyle: "outline", animationType: "glitch", animationIntensity: 80, gridType: "12-col", spacingScale: "md", outputMode: "experimental" },
  },
  {
    name: "Mobile App", icon: "◉",
    config: { heading: "Plus Jakarta Sans", body: "Plus Jakarta Sans", palette: "Rose", themes: ["Playful"], buttonShape: "pill", buttonStyle: "filled", animationType: "bouncy", animationIntensity: 60, gridType: "fluid", spacingScale: "sm", outputMode: "concise" },
  },
];

const DEFAULT_CFG = {
  heading: "Fraunces",
  body: "Manrope",
  palette: "Ember",
  themes: ["Editorial"],
  buttonShape: "rounded",
  buttonStyle: "filled",
  animationType: "subtle",
  animationIntensity: 40,
  gridType: "12-col",
  spacingScale: "md",
  outputMode: "verbose",
  colorOverrides: { neutral: null, primary: null, secondary: null },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lightenHex(hex, factor) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const ch = (n) => Math.min(255, Math.round(n + (255 - n) * factor)).toString(16).padStart(2, "0");
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

function generatePrompt(cfg) {
  const palette = PALETTES.find((p) => p.name === cfg.palette) || PALETTES[0];
  const ov = cfg.colorOverrides || {};
  const effectiveNeutral   = ov.neutral   || palette.neutral;
  const effectivePrimary   = ov.primary   || palette.primary;
  const effectiveSecondary = ov.secondary || palette.secondary;
  const { heading, body, themes, buttonShape, buttonStyle, animationType, animationIntensity, gridType, spacingScale, outputMode } = cfg;
  const isVerbose = outputMode !== "concise";
  const isExp = outputMode === "experimental";
  const dur = animationIntensity < 33 ? "150–200ms" : animationIntensity < 66 ? "250–350ms" : "400–600ms";
  const easeMap = { subtle: "ease-out", precise: "cubic-bezier(0.16, 1, 0.3, 1)", dramatic: "cubic-bezier(0.34, 1.56, 0.64, 1)", bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", glitch: "steps(4, end)" };
  const easing = easeMap[animationType] || "ease-in-out";
  const containerMap = { sm: "max-w-3xl", md: "max-w-5xl", lg: "max-w-6xl", xl: "max-w-7xl" };
  const surface = lightenHex(effectiveNeutral, 0.07);
  const border  = lightenHex(effectiveNeutral, 0.15);
  const activeThemes = themes.length > 0 ? themes : ["Minimalist"];
  const vibeLines = activeThemes.map((t) => VIBE_TRAITS[t]).filter(Boolean).join("\n");

  return `You are a senior frontend engineer with exceptional design taste.

Build a Next.js 15 + React 19 + Tailwind v4 UI using the following design system:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Heading: ${heading}
Body:    ${body}${isVerbose ? `
Load via: next/font/google
Heading weights: 400, 700, 900 (if available)
Body weights: 400, 500, 600
Line height: heading 1.1 · body 1.6
Letter spacing: heading −0.02em · body 0.01em` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary:    ${effectivePrimary}
Secondary:  ${effectiveSecondary}
Background: ${effectiveNeutral}
Surface:    ${surface}
Border:     ${border}${isVerbose ? `
Success:    #22c55e
Warning:    #f59e0b
Error:      #ef4444
→ Define all as CSS custom properties in :root
→ Dark mode default` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THEME / VIBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Style: ${activeThemes.join(" + ")}
${vibeLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Buttons:
  Shape: ${buttonShape}${buttonShape === "pill" ? " (border-radius: 9999px)" : buttonShape === "sharp" ? " (border-radius: 0)" : " (border-radius: 8px)"}
  Style: ${buttonStyle}${isVerbose ? `
  States: default · hover · active · disabled
  Hover: translateY(−1px) + brightness shift
  Disabled: 40% opacity, cursor-not-allowed
  Variants: sm / md / lg` : ""}

Cards:${isVerbose ? `
  Background: Surface color (${surface})
  Border: 1px solid Border color (${border})
  Padding: 24px
  Hover: subtle shadow elevation` : `
  Surface bg · 1px border · 24px padding`}

Inputs:${isVerbose ? `
  Border: 1px solid Border color
  Focus: 2px ring in Primary color
  Error: #ef4444 ring
  Placeholder: 50% opacity
  Padding: 10px 14px` : `
  Bordered · primary focus ring · error state`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Motion style:  ${animationType}
Duration:      ${dur}
Easing:        ${easing}${isVerbose ? `
Page load:     Staggered fade-in from bottom (50ms delay per element)
Hover:         Smooth transitions on all interactive elements
Accessibility: Respect prefers-reduced-motion` : ""}${isExp ? `

EXPERIMENTAL EFFECTS:
→ Subtle SVG noise/grain texture overlay (opacity 0.03–0.05)
→ Cursor-following gradient glow on hero sections
→ Scroll-triggered reveals via IntersectionObserver
→ Animated gradient mesh on background` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grid:      ${gridType}
Spacing:   ${spacingScale}${isVerbose ? `
Container: ${containerMap[spacingScale] || "max-w-6xl"}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tailwind v4 utilities only — no inline styles
• WCAG AA contrast · aria labels · keyboard navigation
• Production-ready — no placeholder content
• Dark mode default · Mobile-first responsive
• No external UI libraries unless specified`.trim();
}

// ─── Live Design Preview ──────────────────────────────────────────────────────

function DesignPreview({ cfg, effectivePalette }) {
  const palette = effectivePalette;
  const surface = lightenHex(palette.neutral, 0.09);
  const borderCol = lightenHex(palette.neutral, 0.18);
  const activeThemes = cfg.themes.length > 0 ? cfg.themes : ["Minimalist"];

  const btnRadius = cfg.buttonShape === "pill" ? "9999px" : cfg.buttonShape === "sharp" ? "0px" : "8px";
  const motionLabel = { subtle: "Ease · Soft", precise: "Precise · Snap", dramatic: "Spring · Overshoot", bouncy: "Bouncy · Pop", glitch: "Glitch · Steps" };
  const intensityLabel = cfg.animationIntensity < 33 ? "Minimal motion" : cfg.animationIntensity < 66 ? "Moderate motion" : "Expressive motion";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: palette.neutral, fontFamily: `'${cfg.body}', sans-serif`, border: "1px solid var(--border-2)", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
      {/* Mini top bar */}
      <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: borderCol, background: surface }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: palette.primary }} />
          <span className="text-xs font-semibold" style={{ color: palette.primary, fontFamily: `'${cfg.heading}', serif` }}>
            YourApp
          </span>
        </div>
        <div className="flex gap-3">
          {["Home", "About", "Docs"].map((l) => (
            <span key={l} className="text-xs" style={{ color: lightenHex(palette.neutral, 0.5) }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Hero area */}
      <div className="px-5 pt-6 pb-5">
        <h2
          className="leading-tight mb-2"
          style={{
            fontFamily: `'${cfg.heading}', serif`,
            fontSize: "clamp(20px, 3vw, 28px)",
            color: lightenHex(palette.neutral, 0.92),
          }}
        >
          Design without limits
        </h2>
        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: lightenHex(palette.neutral, 0.55), maxWidth: "340px" }}
        >
          A system built on {activeThemes.join(" + ")} principles. Every detail considered.
        </p>

        <div className="flex gap-3 flex-wrap mb-5">
          <button
            type="button"
            style={{
              borderRadius: btnRadius,
              background: cfg.buttonStyle === "filled" ? palette.primary : "transparent",
              border: cfg.buttonStyle === "ghost" ? "none" : `1.5px solid ${palette.primary}`,
              color: cfg.buttonStyle === "filled" ? "#fff" : palette.primary,
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: `'${cfg.body}', sans-serif`,
            }}
          >
            Get started
          </button>
          <button
            type="button"
            style={{
              borderRadius: btnRadius,
              background: "transparent",
              border: `1.5px solid ${borderCol}`,
              color: lightenHex(palette.neutral, 0.55),
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: `'${cfg.body}', sans-serif`,
            }}
          >
            Learn more
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Primary",   color: palette.primary },
            { label: "Secondary", color: palette.secondary },
            { label: "Surface",   color: surface, border: borderCol },
          ].map(({ label, color, border: bc }) => (
            <div
              key={label}
              className="rounded-lg p-3"
              style={{ background: color, border: `1px solid ${bc || "transparent"}` }}
            >
              <div className="text-[10px] font-semibold mb-1" style={{ color: bc ? lightenHex(palette.neutral, 0.5) : "#fff" }}>
                {label}
              </div>
              <div className="text-[10px]" style={{ color: bc ? lightenHex(palette.neutral, 0.35) : "rgba(255,255,255,0.7)" }}>
                {color}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-lg px-3 py-2.5 mb-4 text-sm"
          style={{
            background: surface,
            border: `1.5px solid ${borderCol}`,
            color: lightenHex(palette.neutral, 0.45),
            fontFamily: `'${cfg.body}', sans-serif`,
            fontSize: "13px",
          }}
        >
          Search components...
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t pt-4" style={{ borderColor: borderCol }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: lightenHex(palette.neutral, 0.35) }}>Type</span>
            <span className="text-[11px] font-bold" style={{ color: lightenHex(palette.neutral, 0.7), fontFamily: `'${cfg.heading}', serif` }}>{cfg.heading}</span>
            <span className="text-[11px]" style={{ color: lightenHex(palette.neutral, 0.4) }}>+</span>
            <span className="text-[11px]" style={{ color: lightenHex(palette.neutral, 0.6) }}>{cfg.body}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: lightenHex(palette.neutral, 0.35) }}>Motion</span>
            <span className="text-[11px]" style={{ color: lightenHex(palette.neutral, 0.6) }}>{motionLabel[cfg.animationType] || cfg.animationType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: lightenHex(palette.neutral, 0.35) }}>Grid</span>
            <span className="text-[11px]" style={{ color: lightenHex(palette.neutral, 0.6) }}>{cfg.gridType} / {cfg.spacingScale.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: lightenHex(palette.neutral, 0.35) }}>FX</span>
            <span className="text-[11px]" style={{ color: lightenHex(palette.neutral, 0.6) }}>{intensityLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`card-ui rounded-2xl overflow-hidden ${className}`}
      style={{ border: "1px solid var(--border-2)", background: "var(--surface)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "var(--text-4)" }}>{children}</p>
  );
}

function FontCard({ font, selected, onClick, large }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${font}`}
      className="p-3 rounded-xl text-left transition-all duration-150 select-none hover:scale-[1.02] active:scale-[0.97]"
      style={{
        border: selected ? "1px solid var(--accent)" : "1px solid var(--border-2)",
        background: selected ? "var(--accent-dim)" : "var(--surface-2)",
      }}
    >
      <div
        className={`leading-none mb-2 ${large ? "text-3xl" : "text-xl"}`}
        style={{ fontFamily: `'${font}', serif`, color: selected ? "var(--accent-text)" : "var(--text-2)" }}
      >
        Aa
      </div>
      <div
        className="text-[11px] leading-tight truncate font-medium"
        style={{ color: selected ? "var(--accent-text)" : "var(--text-4)" }}
      >
        {font}
      </div>
    </button>
  );
}

function ToggleChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
      style={active ? {
        background: "var(--accent)",
        border: "1px solid var(--accent)",
        color: "var(--accent-dark)",
        boxShadow: "0 2px 16px var(--accent-glow)",
      } : {
        background: "var(--surface-2)",
        border: "1px solid var(--border-2)",
        color: "var(--text-3)",
      }}
    >
      {label}
    </button>
  );
}

function SegmentControl({ options, value, onChange }) {
  return (
    <div className="flex gap-2">
      {options.map(({ val, label, btnStyle }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          aria-pressed={value === val}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={value === val ? {
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent-text)",
            ...btnStyle,
          } : {
            background: "var(--surface-2)",
            border: "1px solid var(--border-2)",
            color: "var(--text-4)",
            ...btnStyle,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [activePreset, setActivePreset] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState("configure");
  const [darkMode, setDarkMode] = useState(true);

  const set = useCallback((key, val) => {
    setCfg((prev) => ({ ...prev, [key]: val }));
    setActivePreset(null);
  }, []);

  const setColorOverride = useCallback((slot, hex) => {
    setCfg((prev) => ({
      ...prev,
      colorOverrides: { ...prev.colorOverrides, [slot]: hex },
    }));
    setActivePreset(null);
  }, []);

  const toggleTheme = useCallback((t) => {
    setCfg((prev) => ({
      ...prev,
      themes: prev.themes.includes(t)
        ? prev.themes.filter((x) => x !== t)
        : [...prev.themes, t],
    }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset, idx) => {
    setCfg((prev) => ({
      ...prev,
      ...preset.config,
      colorOverrides: { neutral: null, primary: null, secondary: null },
    }));
    setActivePreset(idx);
  }, []);

  const prompt = useMemo(() => generatePrompt(cfg), [cfg]);
  const currentPalette = PALETTES.find((p) => p.name === cfg.palette) || PALETTES[0];
  const ov = cfg.colorOverrides || {};
  const effectivePalette = {
    neutral:   ov.neutral   || currentPalette.neutral,
    primary:   ov.primary   || currentPalette.primary,
    secondary: ov.secondary || currentPalette.secondary,
  };

  const copyPrompt = useCallback(() => {
    const doSet = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(prompt).then(doSet).catch(() => {
        const ta = Object.assign(document.createElement("textarea"), { value: prompt });
        Object.assign(ta.style, { position: "fixed", opacity: "0" });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        doSet();
      });
    }
  }, [prompt]);

  const download = useCallback((content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, []);

  // ── Config panel content ──────────────────────────────────────────────────

  const ConfigPanel = (
    <div className="space-y-5">

      {/* Live Preview */}
      <Card>
        <CardHeader title="Live Preview" subtitle="Updates as you configure — reflects all selections" />
        <div className="p-4">
          <DesignPreview cfg={cfg} effectivePalette={effectivePalette} />
        </div>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader title="Quick Start" subtitle="Load a complete pre-built style configuration" />
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p, i)}
              className="flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl text-center transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
              style={activePreset === i ? {
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "var(--accent-dark)",
                boxShadow: "0 4px 24px var(--accent-glow)",
              } : {
                background: "var(--surface-2)",
                border: "1px solid var(--border-2)",
                color: "var(--text-3)",
              }}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-semibold leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader title="Typography" subtitle="Choose a heading and body font pairing" />
        <div className="p-5 space-y-6">
          <div>
            <FieldLabel>Heading Font</FieldLabel>
            <div className="grid grid-cols-4 gap-2">
              {HEADING_FONTS.map((f) => (
                <FontCard key={f} font={f} selected={cfg.heading === f} onClick={() => set("heading", f)} large />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Body Font</FieldLabel>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {BODY_FONTS.map((f) => (
                <FontCard key={f} font={f} selected={cfg.body === f} onClick={() => set("body", f)} large={false} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Color */}
      <Card>
        <CardHeader title="Color System" subtitle="Pick a base palette" />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => set("palette", p.name)}
                aria-pressed={cfg.palette === p.name}
                aria-label={`${p.name} palette`}
                className="rounded-xl p-3 text-center transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                style={cfg.palette === p.name ? {
                  border: "1px solid var(--accent)",
                  background: "var(--accent-dim)",
                } : {
                  border: "1px solid var(--border-2)",
                  background: "var(--surface-2)",
                }}
              >
                <div className="flex justify-center gap-1 mb-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ background: p.neutral }} />
                  <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.primary }} />
                  <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.secondary }} />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: cfg.palette === p.name ? "var(--accent-text)" : "var(--text-4)" }}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
          {/* Clickable color strip */}
          <div className="rounded-xl overflow-hidden border border-[#2a2a2a] h-14 flex cursor-pointer" style={{ isolation: "isolate" }}>
            {[
              { slot: "neutral",   label: "BG",        color: effectivePalette.neutral,   flex: "flex-1" },
              { slot: "primary",   label: "Primary",   color: effectivePalette.primary,   flex: "w-1/4" },
              { slot: "secondary", label: "Secondary", color: effectivePalette.secondary, flex: "w-1/6" },
            ].map(({ slot, label, color, flex }) => (
              <label
                key={slot}
                className={`${flex} relative group flex flex-col items-center justify-center cursor-pointer transition-all`}
                style={{ background: color }}
                title={`Click to pick ${label} color`}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity select-none"
                  style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                >
                  {label}
                </span>
                <span
                  className="text-[9px] opacity-0 group-hover:opacity-80 transition-opacity select-none mt-0.5"
                  style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
                >
                  ✎ pick
                </span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColorOverride(slot, e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`Pick ${label} color`}
                />
              </label>
            ))}
          </div>
          <div className="flex justify-between text-xs px-0.5" style={{ color: "var(--text-3)" }}>
            <span>BG <span className="font-mono">{effectivePalette.neutral}</span>{ov.neutral ? <span className="ml-1" style={{ color: "var(--accent-text)" }}>custom</span> : ""}</span>
            <span>Primary <span className="font-mono">{effectivePalette.primary}</span>{ov.primary ? <span className="ml-1" style={{ color: "var(--accent-text)" }}>custom</span> : ""}</span>
            <span>Secondary <span className="font-mono">{effectivePalette.secondary}</span>{ov.secondary ? <span className="ml-1" style={{ color: "var(--accent-text)" }}>custom</span> : ""}</span>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader title="Theme / Vibe" subtitle="Select one or combine multiple aesthetics" />
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {VIBES.map((v) => (
              <ToggleChip key={v} label={v} active={cfg.themes.includes(v)} onClick={() => toggleTheme(v)} />
            ))}
          </div>
          {cfg.themes.length > 0 && (
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
              {cfg.themes.map((t) =>
                VIBE_TRAITS[t] ? (
                  <div key={t} className="flex gap-3 items-start">
                    <span className="text-xs font-bold shrink-0 w-28 truncate pt-0.5" style={{ color: "var(--accent-text)", opacity: 0.8 }}>{t}</span>
                    <span className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{VIBE_TRAITS[t]}</span>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader title="Components" subtitle="Button shape and visual style" />
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel>Button Shape</FieldLabel>
              <div className="flex gap-2">
                {[
                  { val: "rounded", label: "Rounded", extraStyle: { borderRadius: "8px" } },
                  { val: "pill",    label: "Pill",    extraStyle: { borderRadius: "9999px" } },
                  { val: "sharp",   label: "Sharp",   extraStyle: { borderRadius: "0px" } },
                ].map(({ val, label, extraStyle }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set("buttonShape", val)}
                    aria-pressed={cfg.buttonShape === val}
                    className="flex-1 py-2.5 text-sm font-semibold transition-all duration-150"
                    style={cfg.buttonShape === val ? {
                      background: "var(--accent-dim)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--accent-text)",
                      ...extraStyle,
                    } : {
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-2)",
                      color: "var(--text-4)",
                      ...extraStyle,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Button Style</FieldLabel>
              <SegmentControl
                options={[
                  { val: "filled",  label: "Filled" },
                  { val: "outline", label: "Outline" },
                  { val: "ghost",   label: "Ghost" },
                ]}
                value={cfg.buttonStyle}
                onChange={(v) => set("buttonStyle", v)}
              />
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-3 items-center flex-wrap" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-5)" }}>Preview</span>
            {[
              { label: "Primary",   color: effectivePalette.primary },
              { label: "Secondary", color: effectivePalette.secondary },
            ].map(({ label, color }) => (
              <button
                key={label}
                type="button"
                className="px-5 py-2 text-sm font-semibold transition-all"
                style={{
                  borderRadius: cfg.buttonShape === "pill" ? "9999px" : cfg.buttonShape === "sharp" ? "0" : "8px",
                  background: cfg.buttonStyle === "filled" ? color : "transparent",
                  border: cfg.buttonStyle === "ghost" ? "none" : `1.5px solid ${color}`,
                  color: cfg.buttonStyle === "filled" ? "#fff" : color,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Animations */}
      <Card>
        <CardHeader title="Animations" subtitle="Motion style and timing intensity" />
        <div className="p-5 space-y-5">
          <div>
            <FieldLabel>Motion Style</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {["Subtle", "Precise", "Dramatic", "Bouncy", "Glitch"].map((v) => (
                <ToggleChip
                  key={v}
                  label={v}
                  active={cfg.animationType === v.toLowerCase()}
                  onClick={() => set("animationType", v.toLowerCase())}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <FieldLabel>Intensity</FieldLabel>
              <span className="text-sm font-bold" style={{ color: "var(--accent-text)" }}>
                {cfg.animationIntensity < 33 ? "Subtle" : cfg.animationIntensity < 66 ? "Medium" : "High"} — {cfg.animationIntensity}%
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={cfg.animationIntensity}
              onChange={(e) => set("animationIntensity", parseInt(e.target.value, 10))}
              aria-label="Animation intensity"
              className="range-input w-full"
            />
            <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--text-5)" }}>
              <span>Minimal</span><span>Moderate</span><span>Expressive</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader title="Layout" subtitle="Grid system and spacing scale" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel>Grid Type</FieldLabel>
            <SegmentControl
              options={[
                { val: "12-col",  label: "12‑col" },
                { val: "fluid",   label: "Fluid" },
                { val: "masonry", label: "Masonry" },
              ]}
              value={cfg.gridType}
              onChange={(v) => set("gridType", v)}
            />
          </div>
          <div>
            <FieldLabel>Spacing Scale</FieldLabel>
            <SegmentControl
              options={[
                { val: "sm", label: "SM" },
                { val: "md", label: "MD" },
                { val: "lg", label: "LG" },
                { val: "xl", label: "XL" },
              ]}
              value={cfg.spacingScale}
              onChange={(v) => set("spacingScale", v)}
            />
          </div>
        </div>
      </Card>

    </div>
  );

  // ── Prompt panel content ──────────────────────────────────────────────────

  const PromptPanel = (
    <div className="flex flex-col gap-4 h-full">

      {/* Output mode */}
      <Card>
        <div className="p-4">
          <FieldLabel>Output Mode</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: "concise",      label: "Concise",      desc: "Core spec only" },
              { val: "verbose",      label: "Verbose",      desc: "Full detail" },
              { val: "experimental", label: "Experimental", desc: "+ Creative FX" },
            ].map((m) => (
              <button
                key={m.val}
                type="button"
                onClick={() => set("outputMode", m.val)}
                aria-pressed={cfg.outputMode === m.val}
                className="py-3 px-2 rounded-xl text-center transition-all duration-150"
                style={cfg.outputMode === m.val ? {
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                } : {
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                }}
              >
                <div className="text-sm font-bold" style={{ color: cfg.outputMode === m.val ? "var(--accent-text)" : "var(--text-3)" }}>{m.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lines",      value: prompt.split("\n").length },
          { label: "Characters", value: prompt.length.toLocaleString() },
          { label: "Themes",     value: cfg.themes.length || 1 },
        ].map((s) => (
          <Card key={s.label}>
            <div className="px-4 py-3.5">
              <div className="text-xs mb-1 uppercase tracking-wider font-medium" style={{ color: "var(--text-4)" }}>{s.label}</div>
              <div className="text-xl font-bold" style={{ color: "var(--text-1)" }}>{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Prompt output */}
      <Card className="flex-1 flex flex-col min-h-0">
        <div className="px-5 py-3.5 flex items-center justify-between shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-4)" }}>Generated Prompt</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)", opacity: 0.6, boxShadow: "0 0 6px var(--accent)" }} />
            <span className="text-xs" style={{ color: "var(--text-5)" }}>Ready</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5" style={{ minHeight: "280px", maxHeight: "420px" }}>
          <pre
            className="text-[13px] leading-[1.85] whitespace-pre-wrap break-words"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
          >
            {prompt.split("\n").map((line, i) => {
              const isSep = line.startsWith("━");
              const isSection = /^[A-Z][A-Z /]{2,}$/.test(line.trim()) && !isSep;
              const isKey = /^[A-Z][a-zA-Z ]+:/.test(line.trim()) && !isSection && !isSep;
              const isArrow = line.trim().startsWith("→") || line.trim().startsWith("•");
              return (
                <span
                  key={`${i}:${line.slice(0, 12)}`}
                  className="block"
                  style={{
                    color: isSep ? "var(--border-h)" : isSection ? "var(--accent-text)" : isKey ? "#7ab890" : isArrow ? "#6a9aba" : "var(--text-3)",
                  }}
                >
                  {line || "\u00A0"}
                </span>
              );
            })}
          </pre>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="space-y-3 shrink-0">
        <button
          type="button"
          onClick={copyPrompt}
          className="w-full py-4 text-sm font-bold rounded-xl transition-all duration-200 hover:brightness-105 hover:scale-[1.01]"
          style={copied ? {
            background: "var(--accent)",
            border: "1px solid var(--accent)",
            color: "var(--accent-dark)",
            boxShadow: "0 4px 28px var(--accent-glow)",
          } : {
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent-text)",
          }}
        >
          {copied ? "✓ Copied to clipboard!" : "Copy Prompt →"}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => download(`# UI Style Prompt\n\n\`\`\`\n${prompt}\n\`\`\``, "ui-style-prompt.md", "text/markdown")}
            className="py-3 text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.01]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}
          >
            ↓ Download .md
          </button>
          <button
            type="button"
            onClick={() => download(JSON.stringify(cfg, null, 2), "style-config.json", "application/json")}
            className="py-3 text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.01]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}
          >
            ↓ Export JSON
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Fraunces:ital,wght@0,300;0,400;0,700;1,300&family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:wght@300;400;600;700&family=Bebas+Neue&family=Instrument+Serif:ital@0;1&family=Abril+Fatface&family=DM+Sans:wght@300;400;500&family=Manrope:wght@300;400;600&family=Plus+Jakarta+Sans:wght@300;400;500;700&family=IBM+Plex+Sans:wght@300;400;500&family=Nunito+Sans:wght@300;400;600&family=Lato:wght@300;400;700&family=Source+Sans+3:wght@300;400;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --bg:            #080808;
          --bg-alt:        #0d0d0d;
          --surface:       #111111;
          --surface-2:     #181818;
          --surface-3:     #1e1e1e;
          --border:        #1e1e1e;
          --border-2:      #272727;
          --border-h:      #363636;
          --text-1:        #e8e4dc;
          --text-2:        #c0bdb5;
          --text-3:        #888880;
          --text-4:        #606060;
          --text-5:        #3a3a3a;
          --accent:        #c8f135;
          --accent-dim:    rgba(200,241,53,.07);
          --accent-glow:   rgba(200,241,53,.22);
          --accent-border: rgba(200,241,53,.32);
          --accent-text:   #c8f135;
          --accent-dark:   #0a0a0a;
          --scrollbar-track: #0d0d0d;
          --scrollbar-thumb: #2a2a2a;
          --range-track:   #1e1e1e;
          color-scheme: dark;
        }

        .light {
          --bg:            #f4f2ed;
          --bg-alt:        #eceae4;
          --surface:       #ffffff;
          --surface-2:     #f4f2ed;
          --surface-3:     #eae8e2;
          --border:        #dedad2;
          --border-2:      #cdc9c0;
          --border-h:      #b0aca4;
          --text-1:        #1a1917;
          --text-2:        #3d3b38;
          --text-3:        #6b6865;
          --text-4:        #9a9794;
          --text-5:        #b8b5b0;
          --accent:        #c8f135;
          --accent-dim:    rgba(200,241,53,.15);
          --accent-glow:   rgba(100,120,0,.18);
          --accent-border: rgba(100,130,0,.35);
          --accent-text:   #4d6400;
          --accent-dark:   #1a1917;
          --scrollbar-track: #eceae4;
          --scrollbar-thumb: #cdc9c0;
          --range-track:   #dedad2;
          color-scheme: light;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
        ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--border-h); }

        .card-ui {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .card-ui:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .light .card-ui:hover {
          box-shadow: 0 8px 28px rgba(0,0,0,0.08);
        }

        .range-input {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 4px;
          background: var(--range-track); outline: none; cursor: pointer;
        }
        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: var(--accent);
          border: 2px solid var(--bg); cursor: pointer;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .range-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 6px var(--accent-glow);
        }
        .range-input::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: var(--accent); border: 2px solid var(--bg); cursor: pointer;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-up { animation: slideUp 0.2s ease-out both; }

        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,15px) scale(0.97); }
        }
        .orb { animation: orbFloat 18s ease-in-out infinite; }
        .orb2 { animation: orbFloat 24s ease-in-out infinite reverse; }

        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 20px var(--accent-glow); }
          50% { box-shadow: 0 0 36px var(--accent-glow), 0 0 60px var(--accent-dim); }
        }
        .logo-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <div className={`min-h-screen relative overflow-x-hidden ${darkMode ? "" : "light"}`} style={{ background: "var(--bg)", color: "var(--text-2)", fontFamily: "'Syne', sans-serif" }}>

        {/* ── Background orbs ─────────────────────────────────────────────── */}
        <div className="orb" style={{ position: "fixed", top: "-15%", right: "-10%", width: "600px", height: "600px", borderRadius: "9999px", background: "radial-gradient(circle, rgba(200,241,53,0.055) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div className="orb2" style={{ position: "fixed", bottom: "-20%", left: "-12%", width: "700px", height: "700px", borderRadius: "9999px", background: darkMode ? "radial-gradient(circle, rgba(120,80,255,0.04) 0%, transparent 70%)" : "radial-gradient(circle, rgba(100,130,0,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40" style={{ borderBottom: "1px solid var(--border)", background: darkMode ? "rgba(8,8,8,0.96)" : "rgba(244,242,237,0.96)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-screen-xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between" style={{ position: "relative", zIndex: 1 }}>
            <div className="flex items-center gap-3.5">
              <div className="logo-glow w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent)" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 5h8M4 8h12M4 11h6M4 14h9" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="15.5" cy="14.5" r="2.5" fill="#0a0a0a"/>
                  <path d="M14 16l-2 2" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "var(--accent-text)" }}>Claude Code</div>
                <h1 className="text-base font-bold leading-none" style={{ color: "var(--text-1)" }}>UI Style Prompt Generator</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-2" style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Paste into Claude Code</span>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(d => !d)}
                aria-label="Toggle dark/light mode"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.06 1.06M11.83 11.83l1.07 1.07M3.1 12.9l1.06-1.06M11.83 4.17l1.07-1.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ── Mobile Tab Bar ──────────────────────────────────────────────── */}
        <div className="lg:hidden sticky top-16 z-30 px-4 py-3" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-alt)" }}>
          <div className="flex gap-2">
            {[
              { id: "configure", label: "Configure" },
              { id: "prompt",    label: "Prompt" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMobileTab(tab.id)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-150"
                style={mobileTab === tab.id ? {
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent-text)",
                } : {
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-2)",
                  color: "var(--text-4)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <main className="max-w-screen-xl mx-auto px-5 sm:px-8 py-7" style={{ position: "relative", zIndex: 1 }}>

          {/* Desktop: side by side */}
          <div className="hidden lg:flex gap-7 items-start">
            <div className="flex-1 min-w-0">{ConfigPanel}</div>
            <div className="w-[400px] xl:w-[440px] shrink-0 sticky top-[80px]">
              {PromptPanel}
            </div>
          </div>

          {/* Mobile: tabs */}
          <div className="lg:hidden slide-up">
            {mobileTab === "configure" ? (
              <div>
                {ConfigPanel}
                <div className="mt-6 pb-8">
                  <button
                    type="button"
                    onClick={() => setMobileTab("prompt")}
                    className="w-full py-4 text-base font-bold rounded-2xl transition-all hover:brightness-110 hover:scale-[1.01]"
                    style={{ background: "var(--accent)", color: "var(--accent-dark)", boxShadow: "0 4px 24px var(--accent-glow)" }}
                  >
                    View Generated Prompt →
                  </button>
                </div>
              </div>
            ) : (
              <div className="pb-8">{PromptPanel}</div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}
