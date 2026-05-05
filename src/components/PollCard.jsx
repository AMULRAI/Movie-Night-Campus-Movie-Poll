/*
 * ============================================================================
 * FILE: PollCard.jsx — SIMPLE POLL SUMMARY CARD COMPONENT
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * Displays a compact card showing a poll's summary information:
 *   - Poll title
 *   - "ACTIVE" status badge
 *   - Current leading movie
 *   - Total vote count
 *
 * Tapping the card triggers the onPress callback (usually navigates
 * to the full poll details or voting screen).
 *
 * NOTE: This card uses a LIGHT theme (white background) unlike most of
 * the app which uses a dark theme. It was designed for use on admin
 * dashboard screens that may have lighter sections.
 *
 * PROPS:
 * - title: The poll name (e.g., "Friday Movie Night")
 * - leadingMovie: The name of the movie currently winning
 * - votes: Total number of votes cast in this poll
 * - onPress: Function called when the card is tapped
 *
 * CONNECTIONS:
 * - Used by: Admin screens to display poll summaries
 * - Tapping navigates to poll management or results screens
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PollCard({ title, leadingMovie, votes, onPress }) {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            {/* Header row: poll title + "ACTIVE" badge */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.statusBadge}>ACTIVE</Text>
            </View>
            {/* Divider line */}
            <View style={styles.divider} />
            {/* Leading movie info */}
            <Text style={styles.cardSubtitle}>
                Current Leader: <Text style={styles.bold}>{leadingMovie}</Text>
            </Text>
            {/* Total vote count */}
            <Text style={styles.cardText}>Total Votes: {votes}</Text>
        </TouchableOpacity>
    );
}

/* STYLES: Light-themed card with shadow elevation */
const styles = StyleSheet.create({
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    cardSubtitle: { fontSize: 15, color: '#475569', marginBottom: 6 },
    cardText: { fontSize: 14, color: '#64748b' },
    bold: { fontWeight: '700', color: '#3b82f6' }
});
