import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getAdminStats, getFlaggedUsers, banUser, subscribeToActivePoll, subscribeToVoteCounts } from '../../services/firestoreService';
import BottomTabBar from '../../components/BottomTabBar';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [dashStats, setDashStats] = useState(null);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [oneVoteEnforced, setOneVoteEnforced] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getFlaggedUsers()
    ]).then(([stats, flags]) => {
      setDashStats(stats);
      setFlaggedUsers(flags);
      setLoading(false);
    }).catch((err) => {
      console.log('Error fetching stats:', err);
      setLoading(false);
    });

    const unsubPoll = subscribeToActivePoll((poll) => {
      setActivePoll(poll);
    });

    return () => unsubPoll();
  }, []);

  useEffect(() => {
    let unsubVotes = () => {};
    if (activePoll && (activePoll._id || activePoll.id)) {
      unsubVotes = subscribeToVoteCounts(activePoll._id || activePoll.id, (counts) => {
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        setTotalVotes(total);
      });
    }
    return () => unsubVotes();
  }, [activePoll]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
        <ActivityIndicator color="#ff3c3c" size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const st = dashStats || {};
  const stats = {
    totalUsers: st.totalUsers || 0,
    activePolls: st.activePolls || 0,
    eventsScheduled: st.eventsScheduled || 0,
    seatsBooked: st.seatsBooked || 0,
    seatsRemaining: st.seatsRemaining || 0,
  };

  const handleBanUser = (flaggedUser) => {
    Alert.alert('Confirm Ban', `Are you sure you want to ban ${flaggedUser.username || 'this user'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ban', style: 'destructive', onPress: async () => {
        try {
          await banUser(flaggedUser.userId || flaggedUser._id);
          setFlaggedUsers(prev => prev.filter(f => f._id !== flaggedUser._id));
          Alert.alert('User banned');
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>ADMIN DASHBOARD</Text>
            <Text style={styles.headerTitle}>Analytics & Moderation</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('/admin/students')}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('/admin/polls')}>
            <Text style={styles.statEmoji}>🗳️</Text>
            <Text style={styles.statValue}>{stats.activePolls}</Text>
            <Text style={styles.statLabel}>Active Polls</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => navigation.navigate('/admin/movies')}>
            <Text style={styles.statEmoji}>🎬</Text>
            <Text style={styles.statValue}>{stats.eventsScheduled}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎟️</Text>
            <Text style={styles.statValue}>{stats.seatsBooked}</Text>
            <Text style={styles.statLabel}>Seats Booked</Text>
          </View>
        </View>

        {/* Live Vote Counter */}
        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveTitle}>LIVE VOTE COUNTER</Text>
          </View>
          <Text style={styles.liveBigNumber}>{totalVotes}</Text>
          <Text style={styles.liveSub}>total votes · {activePoll?.title || 'No active poll'}</Text>
        </View>

        {/* Moderation Panel */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🛡️</Text>
            <Text style={styles.sectionName}>Moderation Panel</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{flaggedUsers.length} PENDING</Text>
            </View>
          </View>

          {flaggedUsers.length === 0 ? (
            <Text style={styles.emptyText}>No pending moderation items.</Text>
          ) : (
            flaggedUsers.map((userObj, idx) => (
              <View key={userObj._id || idx} style={[styles.modRow, idx < flaggedUsers.length - 1 && styles.modRowBorder]}>
                <View style={[styles.severityDot, { backgroundColor: userObj.severity === 'high' ? '#ff3c3c' : '#ffd166' }]} />
                <View style={styles.modInfo}>
                  <Text style={styles.modUsername}>{userObj.username || 'anon_user'}</Text>
                  <Text style={styles.modReason}>{userObj.reason || 'Flagged activity'}</Text>
                </View>
                <TouchableOpacity style={styles.banBtn} onPress={() => handleBanUser(userObj)}>
                  <Text style={styles.banBtnText}>Ban</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Spam Detection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🤖</Text>
            <Text style={styles.sectionName}>Spam Detection</Text>
          </View>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>One Vote Per User</Text>
              <Text style={styles.toggleSub}>Enforcement: {oneVoteEnforced ? 'Active' : 'Inactive'}</Text>
            </View>
            <Switch
              value={oneVoteEnforced}
              onValueChange={setOneVoteEnforced}
              trackColor={{ false: '#333', true: '#ff3c3c' }}
              thumbColor={oneVoteEnforced ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          <View style={styles.adminBanner}>
            <Text style={{ fontSize: 14 }}>🔒</Text>
            <Text style={styles.adminBannerText}>Admin-only controls — hidden from students</Text>
          </View>
        </View>

      </ScrollView>
      <BottomTabBar activeTab="home" role="admin" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#8e8e93', marginTop: 12 },
  safeArea: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 24 },
  headerSub: { fontSize: 11, fontWeight: '600', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingVertical: 18, paddingHorizontal: 16, marginBottom: 10 },
  statEmoji: { fontSize: 24, marginBottom: 10 },
  statValue: { fontSize: 32, color: '#ffffff', fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#6b6b88', marginTop: 4 },
  liveCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 20, marginBottom: 16 },
  liveHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00c864', marginRight: 8 },
  liveTitle: { fontSize: 12, fontWeight: '700', color: '#ffffff', letterSpacing: 1.5 },
  liveBigNumber: { fontSize: 52, fontWeight: '800', color: '#ffffff', lineHeight: 54 },
  liveSub: { fontSize: 13, color: '#6b6b88', marginTop: 4 },
  sectionCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionEmoji: { fontSize: 18, marginRight: 8 },
  sectionName: { fontSize: 16, fontWeight: '600', color: '#ffffff', flex: 1 },
  pendingBadge: { backgroundColor: 'rgba(255,60,60,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  pendingBadgeText: { fontSize: 11, fontWeight: '700', color: '#ff3c3c', letterSpacing: 0.5 },
  emptyText: { textAlign: 'center', color: '#6b6b88', marginTop: 8 },
  modRow: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  modRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  modInfo: { flex: 1 },
  modUsername: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  modReason: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  banBtn: { backgroundColor: 'rgba(255,60,60,0.15)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  banBtnText: { fontSize: 12, fontWeight: '600', color: '#ff3c3c' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleTitle: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  toggleSub: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  adminBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  adminBannerText: { fontSize: 12, color: '#6b6b88', marginLeft: 8 },
});
