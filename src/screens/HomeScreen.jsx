import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function HomeScreen() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);



    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.statusBadge}>ACTIVE</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.cardSubtitle}>Current Leader: <Text style={styles.bold}>{item.topMovie}</Text></Text>
            <Text style={styles.cardText}>Total Votes: {item.votes}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 10 }}>Loading active polls...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Active Polls</Text>
                <Text style={styles.headerSubtitle}>Vote to decide what we watch next!</Text>
            </View>

            <FlatList
                data={polls}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 15 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
    headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
    card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', flex: 1 },
    statusBadge: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    cardSubtitle: { fontSize: 15, color: '#475569', marginBottom: 6 },
    cardText: { fontSize: 14, color: '#64748b' },
    bold: { fontWeight: '700', color: '#3b82f6' }
});
