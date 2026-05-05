/*
 * ============================================================================
 * FILE: theme.js — THE APP'S DESIGN SYSTEM / COLOR PALETTE
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This file defines the "design tokens" for the entire app — meaning the
 * consistent colors, fonts, and border radius values used everywhere.
 *
 * Instead of typing '#ff3c3c' (a red color) in 50 different places,
 * we define it ONCE here as COLORS.accent, and use that everywhere.
 * This way, if we ever want to change the red color, we change it in
 * ONE place and it updates across the entire app.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Design Tokens": Named constants for design values (colors, fonts, sizes).
 *   They create consistency across the app and make theme changes easy.
 *
 * - "HEX Color": Colors written as #RRGGBB where R=Red, G=Green, B=Blue.
 *   Each pair is a value from 00 (none) to FF (max).
 *   Example: '#ff3c3c' = lots of Red, a little Green, a little Blue = bright red
 *
 * - "rgba()": Color format with transparency. rgba(R, G, B, Alpha)
 *   Alpha ranges from 0 (invisible) to 1 (fully visible).
 *
 * - "Border Radius": How rounded the corners of a box are.
 *   0 = sharp corners, higher = more rounded, very high = circle/pill shape.
 *
 * CONNECTIONS:
 * -----------
 * - These constants CAN be imported by any component for consistent styling.
 * - Currently, many components use the raw color values directly in their
 *   styles instead of importing from here (a pattern that could be improved).
 */

/*
 * COLORS — The app's color palette
 * ---------------------------------
 * The app uses a DARK THEME with red accents (cinema/movie theater vibe).
 */
export const COLORS = {
  bg: '#0a0a0f',           // Background: Very dark blue-black (the main background color)
  surface: '#12121a',      // Surface: Slightly lighter dark (for cards on top of the background)
  card: '#1c1c2e',         // Card: Dark purple-gray (for elevated card elements)
  cardBorder: 'rgba(255,255,255,0.07)', // Card border: Very faint white (subtle separation)
  accent: '#ff3c3c',       // Accent: Bright red (the primary action color — buttons, highlights)
  accentOrange: '#ff8c42', // Accent Orange: Used in gradients alongside the red
  gold: '#ffd166',         // Gold: Yellow-gold (for winner highlights, special badges)
  green: '#00c864',        // Green: Bright green (for success states, "live" indicators)
  blue: '#3c82f6',         // Blue: Bright blue (for links, info badges)
  text: '#ffffff',         // Text: Pure white (primary text on dark backgrounds)
  textMuted: '#6b6b88',    // Text Muted: Gray-purple (secondary/less important text)
  textSoft: '#aaaaaa',     // Text Soft: Light gray (tertiary text, tags)
};

/*
 * FONTS — Typography (text styles)
 * ---------------------------------
 * The app uses Google Fonts:
 * - "Bebas Neue": A bold, condensed display font (used for big titles, numbers)
 * - "DM Sans": A clean, modern body font (used for regular text, labels)
 *
 * The different weights (400, 500, 600, 700) control how thick/bold the text is:
 *   400 = Regular, 500 = Medium, 600 = Semi-Bold, 700 = Bold
 *
 * NOTE: These fonts need to be loaded by Expo before they can be used.
 */
export const FONTS = {
  display: 'BebasNeue_400Regular',    // Display font: For big headings and numbers
  body: 'DMSans_400Regular',          // Body Regular: Normal paragraph text
  bodyMedium: 'DMSans_500Medium',     // Body Medium: Slightly bolder than regular
  bodySemiBold: 'DMSans_600SemiBold', // Body Semi-Bold: For emphasis
  bodyBold: 'DMSans_700Bold',         // Body Bold: For strong emphasis, headings
};

/*
 * RADIUS — Border radius sizes
 * -----------------------------
 * Pre-defined corner roundness values for consistency.
 * Using these ensures all cards, buttons, etc. have matching roundness.
 */
export const RADIUS = {
  sm: 10,   // Small: Slightly rounded (for tags, small badges)
  md: 14,   // Medium: Moderately rounded (for buttons, inputs)
  lg: 18,   // Large: Well-rounded (for cards, containers)
  xl: 24,   // Extra Large: Very rounded (for hero cards, large containers)
  pill: 40, // Pill: Fully rounded ends (for pill-shaped badges, status indicators)
};
