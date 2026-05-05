/*
 * ============================================================================
 * FILE: MovieVoteCard.js — MOVIE CARD WITH VOTE BUTTON AND PROGRESS BAR
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This component displays a single movie in a poll with:
 *   - Movie poster placeholder (🎬 emoji)
 *   - Movie title, genre, duration, and language tags
 *   - An animated progress bar showing the vote percentage
 *   - A VOTE button that changes state based on whether the user voted:
 *     a) "VOTE" (enabled) — User hasn't voted yet, can tap to vote
 *     b) "✓ VOTED" (red outline) — User voted for THIS movie
 *     c) "VOTE" (dimmed/gray) — User voted for a DIFFERENT movie
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Animated.timing": Creates a smooth animation from one value to another.
 *   Here, it animates the vote progress bar width from 0% to the current
 *   vote percentage over 800ms.
 *
 * - "Animated.Value": A special number used in animations. Unlike regular
 *   numbers, it can smoothly transition between values.
 *
 * - ".interpolate()": Transforms an Animated.Value from one range to another.
 *   Here, it converts a 0-100 number to a '0%'-'100%' string for width.
 *   Example: 45 → '45%'
 *
 * - "useNativeDriver: false": For width/height animations, the native
 *   animation driver can't be used (it only supports opacity/transform).
 *   So we set this to false, which means the animation runs in JavaScript.
 *   It's slightly less smooth but works for layout animations.
 *
 * - "Conditional rendering": Using && and ternary (? :) operators to show
 *   different UI based on conditions. This is how we show different button
 *   states (voted, not voted, etc.)
 *
 * PROPS (inputs):
 * - title, genre, duration, language: Movie details to display
 * - votes: Number of votes this movie has received
 * - totalVotes: Total votes in the entire poll (used for percentage calculation)
 * - hasVoted: true if the user voted for THIS specific movie
 * - isUserVoted: true if the user voted for ANY movie in the poll
 * - onVote: Function to call when the user taps VOTE
 *
 * CONNECTIONS:
 * -----------
 * - Used by: StudentHome.js (renders one card per movie in the active poll)
 * - onVote callback connects to: firestoreService.submitVote()
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MovieVoteCard({
  id, title, genre, duration, language,
  votes = 0, totalVotes = 1,
  hasVoted, isUserVoted, onVote
}) {
  // Animated value for the progress bar width (starts at 0)
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate the vote percentage (guard against division by zero)
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  /*
   * ANIMATE THE PROGRESS BAR
   * --------------------------
   * Whenever the percentage changes (new votes come in), smoothly
   * animate the progress bar to the new width over 800ms.
   */
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false, // Can't use native driver for width animation
    }).start();
  }, [percentage, progressAnim]);

  // Convert the animated number (0-100) into a percentage string ('0%'-'100%')
  const widthStyle = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.card}>
      {/* ── TOP ROW: Movie poster + info ── */}
      <View style={styles.topRow}>
        {/* Poster placeholder (shows 🎬 emoji since we don't have real posters) */}
        <View style={styles.posterBox}>
          <Text style={styles.posterIcon}>🎬</Text>
          <Text style={styles.posterText}>POSTER</Text>
        </View>

        {/* Movie information section */}
        <View style={styles.infoBlock}>
          {/* Title row: movie name + voted checkmark badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {/* Show a blue checkmark badge if the user voted for THIS movie */}
            {hasVoted && (
              <View style={styles.votedBadge}>
                <Text style={styles.votedBadgeText}>✓</Text>
              </View>
            )}
          </View>

          {/* Genre, duration, language tags */}
          <View style={styles.tagsRow}>
            {genre && <View style={styles.tag}><Text style={styles.tagText}>{genre}</Text></View>}
            {duration && <View style={styles.tag}><Text style={styles.tagText}>{duration}</Text></View>}
            {language && <View style={styles.tag}><Text style={styles.tagText}>{language}</Text></View>}
          </View>

          {/* Vote progress bar + vote count */}
          <View style={styles.progressSection}>
            <View style={styles.track}>
              {/* Animated fill bar with red-to-orange gradient */}
              <Animated.View style={[styles.fillContainer, { width: widthStyle }]}>
                <LinearGradient
                  colors={['#ff3c3c', '#ff8c42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            {/* Vote count text */}
            <Text style={styles.votesText}>{votes} votes</Text>
          </View>
        </View>
      </View>
      
      {/* ── VOTE BUTTON — Three possible states ── */}
      {isUserVoted && hasVoted ? (
        // STATE 1: User voted for THIS movie → Show "✓ VOTED" (red outline)
        <TouchableOpacity style={styles.votedBtnBase} disabled>
          <Text style={styles.votedBtnText}>✓  VOTED</Text>
        </TouchableOpacity>
      ) : isUserVoted && !hasVoted ? (
        // STATE 2: User voted for a DIFFERENT movie → Show dimmed "VOTE" (disabled)
        <TouchableOpacity style={styles.dimmedBtnBase} disabled>
          <Text style={styles.dimmedBtnText}>VOTE</Text>
        </TouchableOpacity>
      ) : (
        // STATE 3: User hasn't voted yet → Show active "VOTE" button
        <TouchableOpacity style={styles.voteBtnBase} onPress={() => onVote(id)}>
          <Text style={styles.voteBtnText}>VOTE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/*
 * STYLES — Dark movie card with progress bar and vote buttons
 */
const styles = StyleSheet.create({
  // Card container
  card: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 16, marginBottom: 12 },
  topRow: { flexDirection: 'row' },
  // Poster placeholder
  posterBox: { width: 80, height: 104, backgroundColor: '#12121a', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  posterIcon: { fontSize: 24, marginBottom: 4 },
  posterText: { fontSize: 10, color: '#6b6b88' },
  // Info section
  infoBlock: { flex: 1, paddingLeft: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
  // Blue checkmark badge (shown when user voted for this movie)
  votedBadge: { width: 20, height: 20, backgroundColor: '#3c82f6', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  votedBadgeText: { fontSize: 11, color: '#ffffff', fontWeight: '700' },
  // Genre/duration/language tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: { backgroundColor: '#0a0a0f', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 11, color: '#aaaaaa' },
  // Vote progress bar
  progressSection: { marginTop: 12 },
  track: { height: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  fillContainer: { height: 4, borderRadius: 10, overflow: 'hidden', backgroundColor: '#ff3c3c' },
  votesText: { textAlign: 'right', fontSize: 12, color: '#6b6b88', marginTop: 6 },
  // Button state 1: "✓ VOTED" (red outline, user picked this movie)
  votedBtnBase: { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#ff3c3c', borderRadius: 10, padding: 13, alignItems: 'center' },
  votedBtnText: { color: '#ff3c3c', fontSize: 13, fontWeight: '600' },
  // Button state 2: Dimmed "VOTE" (user voted for another movie)
  dimmedBtnBase: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 13, alignItems: 'center' },
  dimmedBtnText: { color: '#6b6b88', fontSize: 13, fontWeight: '600' },
  // Button state 3: Active "VOTE" button (user hasn't voted yet)
  voteBtnBase: { marginTop: 12, backgroundColor: '#12121a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 13, alignItems: 'center' },
  voteBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
});
