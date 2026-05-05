/*
 * ============================================================================
 * FILE: NotificationBanner.js — DISMISSABLE ALERT BANNER COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * A reusable alert/notification banner that shows a message at the top of
 * a screen. It supports different types (info, warning, success), each with
 * its own color and icon. Users can dismiss (close) it by tapping the "×" button.
 *
 * PROPS:
 * - type: 'info' | 'warning' | 'success' — determines the icon and color
 * - title: The main message text (bold)
 * - subtitle: Secondary descriptive text (muted)
 * - onDismiss: Function called when the user taps the close button
 * - visible: If false, the banner is hidden entirely
 *
 * TECHNICAL TERMS:
 * - "hexToRgba": A helper function that converts HEX colors (#ff3c3c) to
 *   rgba() format with transparency. This lets us create semi-transparent
 *   backgrounds automatically from any color.
 *
 * CONNECTIONS:
 * - Can be used by any screen that needs to show temporary messages
 * - Currently used in admin screens for moderation notifications
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NotificationBanner({ type = 'info', title, subtitle, onDismiss, visible = true }) {
  // If the banner is not visible, render nothing
  if (!visible) return null;

  // Configure the icon and colors based on the notification type
  let config = { icon: 'ℹ️', color: '#6b6b88', border: 'rgba(255,255,255,0.07)' };
  if (type === 'warning') config = { icon: 'ℹ️', color: '#6b6b88', border: 'rgba(255,255,255,0.07)' };
  else if (type === 'success') config = { icon: '✅', color: '#00c864', border: 'rgba(0,200,100,0.2)' };

  /*
   * hexToRgba — Converts a HEX color to rgba() with specified opacity.
   * Example: hexToRgba('#ff3c3c', 0.1) → 'rgba(255,60,60,0.1)'
   * This is used to create semi-transparent background/border colors.
   */
  const hexToRgba = (hex, opacity) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
    else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); }
    return `rgba(${r},${g},${b},${opacity})`;
  };

  return (
    <View style={[styles.container, { borderColor: config.border }]}>
      {/* Icon circle with the notification type emoji */}
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      {/* Title and subtitle text */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {/* Dismiss (close) button */}
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1c1c2e', borderRadius: 14, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 16 },
  textBlock: { flex: 1, paddingLeft: 14 },
  title: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  subtitle: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 18, color: '#6b6b88' },
});
