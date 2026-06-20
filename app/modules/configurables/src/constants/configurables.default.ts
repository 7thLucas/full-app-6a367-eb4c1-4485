/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  font: TFont;
  // Game fields
  gameTitle: string;
  gameSubtitle?: string;
  playerXLabel: string;
  playerOLabel: string;
  playerXColor: string;
  playerOColor: string;
  winHighlightColor: string;
  resetButtonLabel: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Tic Tac Toe",
  logoUrl: "",
  brandColor: {
    // Base
    background:        "#ffffff",
    foreground:        "#1f2937",
    // Card
    card:              "#f9fafb",
    cardForeground:    "#1f2937",
    // Popover
    popover:           "#ffffff",
    popoverForeground: "#1f2937",
    // Primary
    primary:           "#2563eb",
    primaryForeground: "#ffffff",
    // Secondary
    secondary:           "#ef4444",
    secondaryForeground: "#ffffff",
    // Muted
    muted:           "#f3f4f6",
    mutedForeground: "#6b7280",
    // Accent
    accent:           "#dbeafe",
    accentForeground: "#1e40af",
    // Destructive
    destructive:           "#ef4444",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#e5e7eb",
    input:  "#e5e7eb",
    ring:   "#2563eb",
    // Charts
    chart1: "#f97316",
    chart2: "#0d9488",
    chart3: "#1e3a5f",
    chart4: "#d4a017",
    chart5: "#ea580c",
    // Navbar
    navbarBackground: "#1f2937",
    // Sidebar
    sidebarBackground:        "#111827",
    sidebarForeground:        "#f9fafb",
    sidebarPrimary:           "#2563eb",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#1e40af",
    sidebarAccentForeground:  "#dbeafe",
    sidebarBorder:            "#374151",
    sidebarRing:              "#2563eb",
  },
  font: {
    headingFont: "Poppins",
    textFont: "Inter",
  },
  // Game defaults
  gameTitle: "Tic Tac Toe",
  gameSubtitle: "Game sederhana untuk dua pemain",
  playerXLabel: "Player X",
  playerOLabel: "Player O",
  playerXColor: "#2563eb",
  playerOColor: "#ef4444",
  winHighlightColor: "#fbbf24",
  resetButtonLabel: "New Game",
};
