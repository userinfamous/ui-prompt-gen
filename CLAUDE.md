# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test suite is configured.

## Architecture

This is a single-page React 19 + Vite + Tailwind v4 app — a UI prompt generator for Next.js projects.

**Entire app lives in `src/App.jsx`** — no routing, no separate component files. The file is organized into four sections:

1. **Data** — Static config arrays: `HEADING_FONTS`, `BODY_FONTS`, `PALETTES`, `VIBES`, `VIBE_TRAITS`, `PRESETS`, `DEFAULT_CFG`. These drive all dropdowns and prompt logic.

2. **Helpers** — `lightenHex(hex, factor)` derives surface/border colors from a base neutral hex. `generatePrompt(cfg)` assembles the final text prompt from the current config object — this is the core output of the app.

3. **`DesignPreview` component** — Live mini-UI mockup that renders inline using `style={}` props (intentionally, not Tailwind utilities) to reflect the user's exact chosen colors, fonts, and button shapes in real time.

4. **`App` component** — Holds all state in a single `cfg` object (via `useState`). Uses `useMemo` for derived values (effective palette with color overrides, prompt text) and `useCallback` for handlers. The UI is a two-column layout: left = controls panel, right = live preview + generated prompt output.

**Config shape** (`DEFAULT_CFG`):
- `heading` / `body` — font names from the static arrays
- `palette` — name string referencing a `PALETTES` entry
- `colorOverrides` — `{ neutral, primary, secondary }` for per-color hex overrides
- `themes` — array of vibe strings (supports multi-select)
- `buttonShape` — `"rounded" | "pill" | "sharp"`
- `buttonStyle` — `"filled" | "outline" | "ghost"`
- `animationType` — `"subtle" | "precise" | "dramatic" | "bouncy" | "glitch"`
- `animationIntensity` — 0–100 slider
- `gridType` — `"12-col" | "fluid" | "masonry"`
- `spacingScale` — `"sm" | "md" | "lg" | "xl"`
- `outputMode` — `"concise" | "verbose" | "experimental"` (controls prompt verbosity and experimental effects section)

Presets overwrite the entire `cfg` object when selected.

## Tailwind

Uses Tailwind v4 via `@tailwindcss/vite` plugin. Config is zero-config (no `tailwind.config.js`). Import is `@import "tailwindcss"` in `src/index.css`.

The `DesignPreview` component deliberately uses inline `style={}` props rather than Tailwind utilities so dynamic color values (hex strings from state) can be applied — Tailwind v4 cannot generate arbitrary dynamic classes at runtime.
