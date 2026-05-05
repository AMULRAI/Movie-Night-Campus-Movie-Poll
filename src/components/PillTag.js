/*
 * ============================================================================
 * FILE: PillTag.js — SMALL PILL-SHAPED LABEL/BADGE COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * Renders a small pill-shaped tag/badge with text. Used for labeling things
 * like genres ("Action"), languages ("English"), or statuses ("Approved").
 *
 * The pill automatically generates its background and border colors from
 * the provided text color — making it transparent and matching.
 *
 * EXAMPLE: PillTag({ label: "Sci-Fi", color: "#3c82f6" })
 * Renders: A blue-tinted pill with "Sci-Fi" text in blue.
 *
 * PROPS:
 * - label: The text to display inside the pill
 * - color: The accent color for the text (default: '#aaaaaa')
 *          Background and border are auto-calculated at lower opacity
 *
 * TECHNICAL TERMS:
 * - "hexToRgba": Converts a HEX color (#3c82f6) to rgba() with transparency.
 *   The background uses 10% opacity, the border uses 25% opacity.
 *   This creates a subtle, tinted appearance without specifying separate colors.
 *
 * CONNECTIONS:
 * - Used by various screens to display genre, language, and status tags
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PillTag({ label, color = '#aaaaaa' }) {
  /*
   * hexToRgba — Converts HEX color to rgba() with specified opacity.
   * Handles both short (#fff) and long (#ffffff) HEX formats.
   *
   * How it works:
   * 1. Takes the hex string and extracts R, G, B values
   * 2. Converts each pair from hexadecimal (base 16) to decimal
   * 3. Returns an rgba() string with the given opacity
   *
   * Example: hexToRgba('#ff3c3c', 0.1) → 'rgba(255,60,60,0.1)'
   */
  const hexToRgba = (hex, opacity) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r},${g},${b},${opacity})`;
  };

  // Auto-generate background (10% opacity) and border (25% opacity) from the text color
  const bgColor = color.startsWith('#') ? hexToRgba(color, 0.1) : color;
  const bdColor = color.startsWith('#') ? hexToRgba(color, 0.25) : color;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: bdColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Pill container: fully rounded, with border and padding
  container: { borderWidth: 1, borderRadius: 40, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' },
  // Label text: small and semi-bold
  text: { fontSize: 11, fontWeight: '500' },
});
