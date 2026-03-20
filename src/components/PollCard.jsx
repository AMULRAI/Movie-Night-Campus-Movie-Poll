import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PollCard({ title, leadingMovie, votes, onPress }) {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.statusBadge}>ACTIVE</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.cardSubtitle}>
                Current Leader: <Text style={styles.bold}>{leadingMovie}</Text>
            </Text>
            <Text style={styles.cardText}>Total Votes: {votes}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { 
        backgroundColor: '#fff', 
        padding: 20, 
        borderRadius: 16, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 8, 
        elevation: 3,
        marginBottom: 16
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    cardSubtitle: { fontSize: 15, color: '#475569', marginBottom: 6 },
    cardText: { fontSize: 14, color: '#64748b' },
    bold: { fontWeight: '700', color: '#3b82f6' }
});
