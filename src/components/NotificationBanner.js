import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NotificationBanner({ type = 'info', title, subtitle, onDismiss, visible = true }) {
  if (!visible) return null;

  let config = { icon: 'ℹ️', color: '#3c82f6', border: 'rgba(60,130,246,0.2)' };
  if (type === 'warning') config = { icon: '⚠️', color: '#ffd166', border: 'rgba(255,209,102,0.2)' };
  else if (type === 'success') config = { icon: '✅', color: '#00c864', border: 'rgba(0,200,100,0.2)' };

  const hexToRgba = (hex, opacity) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
    else if (hex.length === 7) { r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16); }
    return `rgba(${r},${g},${b},${opacity})`;
  };

  return (
    <View style={[styles.container, { borderColor: config.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: hexToRgba(config.color, 0.12) }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1c1c2e',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    paddingLeft: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b6b88',
    marginTop: 2,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 20,
    color: '#6b6b88',
  },
});
