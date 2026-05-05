/*
 * ============================================================================
 * FILE: LivePollCard.js — COUNTDOWN TIMER CARD FOR ACTIVE POLLS
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * Displays a card showing the time remaining in an active poll.
 * It features:
 *   - A "LIVE POLL" badge with a green dot
 *   - The poll title and subtitle
 *   - A countdown timer showing hours, minutes, and seconds
 *
 * The countdown ticks down every second in real-time using setInterval.
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "setInterval": A JavaScript function that repeatedly calls a function
 *   at a set time interval. Here, it runs every 1000ms (1 second) to
 *   decrease the countdown by 1 second.
 *
 * - "clearInterval": Stops a setInterval from running. Called in the
 *   useEffect cleanup to prevent "memory leaks" — when the component is
 *   removed from the screen, we stop the timer.
 *
 * - "pad(n)": A helper function that pads a number with a leading zero.
 *   pad(5) → "05", pad(12) → "12". This makes the countdown display neat.
 *
 * - "padStart(2, '0')": A built-in JavaScript string method.
 *   Makes the string at least 2 characters long, padding with '0' at the start.
 *
 * PROPS (inputs from parent component):
 * - pollTitle: The name of the poll (e.g., "Friday Movie Night")
 * - pollSubtitle: Extra description text
 * - initialHours/Minutes/Seconds: Starting time for the countdown
 *
 * CONNECTIONS:
 * -----------
 * - Used by: StudentHome.js (shows the countdown for the active poll)
 * - The initial time values are typically calculated from the poll's endTime
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LivePollCard({
  pollTitle,
  pollSubtitle,
  initialHours = 0,
  initialMinutes = 0,
  initialSeconds = 0,
}) {
  // Convert hours/minutes/seconds into total seconds for easier countdown math
  const totalInitialSeconds = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
  
  // State: tracks how many seconds are left on the countdown
  const [timeLeft, setTimeLeft] = useState(totalInitialSeconds);

  /*
   * THE COUNTDOWN TIMER
   * --------------------
   * Sets up a setInterval that runs every 1 second (1000ms).
   * Each tick, it decreases timeLeft by 1. When it reaches 0, it stops.
   *
   * The "return () => clearInterval(timer)" is the CLEANUP function.
   * It runs when the component is removed from the screen (unmounted),
   * stopping the timer to prevent memory leaks.
   */
  useEffect(() => {
    if (timeLeft <= 0) return; // Don't start timer if already at 0
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0)); // Decrease by 1, but never below 0
    }, 1000);
    return () => clearInterval(timer); // Stop timer on cleanup
  }, [timeLeft]);

  // Convert total seconds back into hours, minutes, seconds for display
  const h = Math.floor(timeLeft / 3600);        // Hours = total seconds ÷ 3600
  const m = Math.floor((timeLeft % 3600) / 60); // Minutes = remaining ÷ 60
  const s = timeLeft % 60;                       // Seconds = the remainder

  // Pad function: ensures numbers always show 2 digits (e.g., "05" not "5")
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <View style={styles.card}>
      {/* ── TOP ROW: "LIVE POLL" badge and "ACTIVE" indicator ── */}
      <View style={styles.topRow}>
        {/* Green "LIVE POLL" badge with green dot */}
        <View style={styles.livePill}>
          <Text style={styles.liveDot}>●</Text>
          <Text style={styles.liveText}>LIVE POLL</Text>
        </View>
        {/* "ACTIVE" status pill */}
        <View style={styles.activePill}>
          <Text style={styles.activeText}>ACTIVE</Text>
        </View>
      </View>

      {/* ── POLL TITLE AND SUBTITLE ── */}
      <Text style={styles.title}>{pollTitle}</Text>
      <Text style={styles.subtitle}>{pollSubtitle}</Text>

      {/* ── COUNTDOWN TIMER: Three boxes showing HRS, MIN, SEC ── */}
      <View style={styles.countdownRow}>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(h)}</Text>
          <Text style={styles.labelText}>HRS</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(m)}</Text>
          <Text style={styles.labelText}>MIN</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.numberText}>{pad(s)}</Text>
          <Text style={styles.labelText}>SEC</Text>
        </View>
      </View>
    </View>
  );
}

/*
 * STYLES — Dark card with green "live" accents and countdown boxes
 */
const styles = StyleSheet.create({
  // Card container: dark background, rounded corners
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 20,
    marginBottom: 20,
  },
  // Top row: horizontal layout for badges
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // "LIVE POLL" badge: green-tinted with green border
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
  // Green dot indicator
  liveDot: { color: '#00c864', fontSize: 8, marginRight: 6 },
  // "LIVE POLL" text
  liveText: { fontSize: 11, fontWeight: '600', color: '#00c864', letterSpacing: 1 },
  // "ACTIVE" pill
  activePill: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 40, paddingVertical: 5, paddingHorizontal: 12 },
  activeText: { fontSize: 11, color: '#aaaaaa', letterSpacing: 1 },
  // Poll title text
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff', fontFamily: 'Bebas Neue', letterSpacing: 1, marginTop: 14 },
  // Poll subtitle text
  subtitle: { fontSize: 13, color: '#6b6b88', marginTop: 4, marginBottom: 16 },
  // Countdown boxes row
  countdownRow: { flexDirection: 'row', gap: 8 },
  // Each time unit box (HRS, MIN, SEC)
  box: { flex: 1, backgroundColor: '#0a0a0f', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' },
  // The big number in each box
  numberText: { fontFamily: 'Bebas Neue', fontSize: 32, color: '#ffffff', lineHeight: 32 },
  // The small label below the number
  labelText: { fontSize: 10, color: '#6b6b88', letterSpacing: 1.5, marginTop: 4 },
});
