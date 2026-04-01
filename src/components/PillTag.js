import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PillTag({ label, color = '#aaaaaa' }) {
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

  const bgColor = color.startsWith('#') ? hexToRgba(color, 0.1) : color;
  const bdColor = color.startsWith('#') ? hexToRgba(color, 0.25) : color;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor: bdColor }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 40,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
