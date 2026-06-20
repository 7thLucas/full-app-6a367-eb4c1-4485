import { useEffect } from "react";
import { useConfigurables } from "../hooks/use-configurables";

/**
 * ConfigurablesCSSBridge — Syncs brandColor and font from configurables into
 * CSS custom properties so Tailwind utilities and font-family declarations
 * reflect the DB-driven config in real time.
 *
 * How it works:
 *   1. Tailwind config maps e.g. `primary` → `var(--primary)`.
 *   2. tailwind.css defines the default CSS variable values.
 *   3. This component overrides those CSS vars at runtime on <html>,
 *      so every Tailwind utility referencing var(--primary) updates instantly.
 *   4. For fonts, a <link> tag is injected/updated to load the chosen Google
 *      Fonts, and --heading-font / --text-font vars drive font-family usage.
 *   5. When the portal sends QB_MIDDLE_EDITOR_UPDATE, useConfigurables()
 *      re-renders → effects re-run → CSS vars + fonts update.
 *
 * Mount this INSIDE <ConfigurablesProvider>, but outside <ThemeProvider> so it
 * applies before any themed children paint.
 */
export function ConfigurablesCSSBridge() {
  const { config } = useConfigurables();

  // ── Brand colors ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    const brandColor = config?.brandColor;
    if (!brandColor || typeof brandColor !== "object") return;

    const root = document.documentElement;
    const isValidColor = (v: unknown): v is string =>
      typeof v === "string" && v.length > 0;

    // Declarative map: configurable field name → CSS custom property name.
    // Mirrors every var defined in tailwind.css so a single loop covers all.
    const COLOR_MAP: Record<string, string> = {
      // Base
      background:               "--background",
      foreground:               "--foreground",
      // Card
      card:                     "--card",
      cardForeground:           "--card-foreground",
      // Popover
      popover:                  "--popover",
      popoverForeground:        "--popover-foreground",
      // Primary
      primary:                  "--primary",
      primaryForeground:        "--primary-foreground",
      // Secondary
      secondary:                "--secondary",
      secondaryForeground:      "--secondary-foreground",
      // Muted
      muted:                    "--muted",
      mutedForeground:          "--muted-foreground",
      // Accent
      accent:                   "--accent",
      accentForeground:         "--accent-foreground",
      // Destructive
      destructive:              "--destructive",
      destructiveForeground:    "--destructive-foreground",
      // Border / Input / Ring
      border:                   "--border",
      input:                    "--input",
      ring:                     "--ring",
      // Charts
      chart1:                   "--chart-1",
      chart2:                   "--chart-2",
      chart3:                   "--chart-3",
      chart4:                   "--chart-4",
      chart5:                   "--chart-5",
      // Navbar
      navbarBackground:         "--navbar-background",
      // Sidebar
      sidebarBackground:        "--sidebar-background",
      sidebarForeground:        "--sidebar-foreground",
      sidebarPrimary:           "--sidebar-primary",
      sidebarPrimaryForeground: "--sidebar-primary-foreground",
      sidebarAccent:            "--sidebar-accent",
      sidebarAccentForeground:  "--sidebar-accent-foreground",
      sidebarBorder:            "--sidebar-border",
      sidebarRing:              "--sidebar-ring",
    };

    for (const [field, cssVar] of Object.entries(COLOR_MAP)) {
      const value = (brandColor as Record<string, unknown>)[field];
      if (isValidColor(value)) {
        root.style.setProperty(cssVar, value);
      }
    }
  }, [config?.brandColor]);


  // ── Typography ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === "undefined") return;

    const font = config?.font;
    if (!font || typeof font !== "object") return;

    const headingFont = font.headingFont;
    const textFont = font.textFont;

    // Collect unique fonts to load
    const fontsToLoad = [...new Set([headingFont, textFont].filter(Boolean))];
    if (fontsToLoad.length === 0) return;

    // Build a Google Fonts URL for all required fonts
    const familyParams = fontsToLoad
      .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,100..900;1,100..900`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;

    // Reuse or create the managed <link> tag
    const LINK_ID = "qb-configurables-fonts";
    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;

    // List of known serif fonts to use correct fallback
    const SERIF_FONTS = new Set([
      "Playfair Display",
      "Lora",
      "Merriweather",
      "EB Garamond",
      "Cinzel",
      "Cormorant Garamond",
      "Libre Baskerville",
      "PT Serif"
    ]);

    const getFallback = (f: string) => SERIF_FONTS.has(f) ? "serif" : "sans-serif";

    // Set CSS custom properties so any element can reference them
    const root = document.documentElement;
    if (headingFont) {
      root.style.setProperty("--heading-font", `'${headingFont}', ${getFallback(headingFont)}`);
    }
    if (textFont) {
      root.style.setProperty("--text-font", `'${textFont}', ${getFallback(textFont)}`);
    }
  }, [config?.font]);

  return null; // renderless component
}

