import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LivePollCard({
  pollTitle,
  pollSubtitle,
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
}) {
  const totalInitialSeconds = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
  const [timeLeft, setTimeLeft] = useState(totalInitialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.livePill}>
          <Text style={styles.liveDot}>●</Text>
          <Text style={styles.liveText}>LIVE POLL</Text>
        </View>
        <View style={styles.activePill}>
          <Text style={styles.activeText}>ACTIVE</Text>
        </View>
      </View>
      <Text style={styles.title}>{pollTitle}</Text>
      <Text style={styles.subtitle}>{pollSubtitle}</Text>
      <View style={styles.countdownRow}>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(h)}</Text>
          <Text style={styles.labelText}>HOURS</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(m)}</Text>
          <Text style={styles.labelText}>MINUTES</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(s)}</Text>
          <Text style={styles.labelText}>SECONDS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 20,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,200,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,100,0.25)',
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  liveDot: {
    color: '#00c864',
    fontSize: 8,
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00c864',
    letterSpacing: 1,
  },
  activePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 40,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  activeText: {
    fontSize: 11,
    color: '#aaaaaa',
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Bebas Neue',
    letterSpacing: 1,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b6b88',
    marginTop: 4,
    marginBottom: 16,
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  numberText: {
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 32,
  },
  labelText: {
    fontSize: 10,
    color: '#6b6b88',
    letterSpacing: 1.5,
    marginTop: 4,
  },
});
