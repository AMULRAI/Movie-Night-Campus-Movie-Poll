import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, StatusBar, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';
import { getMoviesByUser, getUserBooking } from '../../services/firestoreService';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({ suggested: 0, votes: 0, booked: 0 });

  useEffect(() => {
    if (!user?.uid) return;
    getMoviesByUser(user.uid).then(movies => {
      setStats(prev => ({ ...prev, suggested: movies.length }));
    }).catch(() => {});
  }, [user?.uid]);

  const firstName = userProfile?.firstName || 'Student';
  const lastName = userProfile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = (firstName[0] + (lastName[0] || '')).toUpperCase();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const actions = [
    { title: 'Active Polls', subtitle: 'Vote on this week\'s movie', icon: '🗳️', route: '/student/polls', color: ['#ff3c3c', '#ff6b6b'] },
    { title: 'Suggest a Movie', subtitle: 'Submit your movie idea', icon: '🎬', route: '/student/suggest', color: ['#8b5cf6', '#a78bfa'] },
    { title: 'Book My Seat', subtitle: 'Reserve for movie night', icon: '🎟️', route: '/student/booking', color: ['#f59e0b', '#fbbf24'] },
    { title: 'Past Movie Nights', subtitle: 'Revisit event history', icon: '📜', route: '/student/history', color: ['#10b981', '#34d399'] },
    { title: 'Voting Results', subtitle: 'See live poll results', icon: '📊', route: '/student/results', color: ['#3b82f6', '#60a5fa'] },
    { title: 'My Profile', subtitle: 'Account settings & logout', icon: '👤', route: '/student/profile', color: ['#6b7280', '#9ca3af'] },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{fullName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('/student/profile')}>
            <LinearGradient colors={['#ff3c3c', '#8b5cf6']} style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── HERO BANNER ── */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('/student/polls')}>
          <LinearGradient
            colors={['#ff3c3c', '#c026d3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            {/* decorative circles */}
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.heroBannerContent}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE NOW</Text>
              </View>
              <Text style={styles.heroTitle}>Tonight's Poll{'\n'}is Live! 🎬</Text>
              <Text style={styles.heroSub}>Cast your vote for this week's screening</Text>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>Vote Now →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎬</Text>
            <Text style={styles.statNum}>{stats.suggested}</Text>
            <Text style={styles.statLabel}>Suggested</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMid]}>
            <Text style={styles.statEmoji}>🗳️</Text>
            <Text style={styles.statNum}>{stats.votes}</Text>
            <Text style={styles.statLabel}>Votes Cast</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎟️</Text>
            <Text style={styles.statNum}>{stats.booked}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.grid}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.gridItem}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(action.route)}
            >
              <LinearGradient
                colors={[action.color[0] + '22', action.color[0] + '08']}
                style={styles.gridCard}
              >
                <View style={[styles.gridIconBox, { borderColor: action.color[0] + '40', backgroundColor: action.color[0] + '18' }]}>
                  <Text style={styles.gridIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.gridTitle}>{action.title}</Text>
                <Text style={styles.gridSub}>{action.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
      <BottomTabBar activeTab="home" role="student" />
    </SafeAreaView>
  );
}

const CARD_W = (width - 24 * 2 - 12) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050d' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 110 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: {},
  greeting: { fontSize: 13, color: '#6b6b88', marginBottom: 2 },
  name: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 16, fontWeight: '800', color: '#ffffff' },

  // Hero Banner
  heroBanner: { borderRadius: 24, padding: 24, marginBottom: 20, overflow: 'hidden', minHeight: 180 },
  heroCircle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -40 },
  heroCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20 },
  heroBannerContent: { position: 'relative', zIndex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00ff88', marginRight: 6 },
  livePillText: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#ffffff', lineHeight: 32, marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },
  heroBtn: { backgroundColor: '#ffffff', borderRadius: 25, paddingHorizontal: 22, paddingVertical: 11, alignSelf: 'flex-start' },
  heroBtnText: { color: '#ff3c3c', fontWeight: '700', fontSize: 14 },

  // Stats
  statsRow: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#12121e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14, alignItems: 'center' },
  statCardMid: { borderColor: 'rgba(255,60,60,0.2)', backgroundColor: '#1a0d10' },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  statLabel: { fontSize: 11, color: '#6b6b88', marginTop: 2 },

  // Actions Grid
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: CARD_W },
  gridCard: { borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minHeight: 130 },
  gridIconBox: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridIcon: { fontSize: 22 },
  gridTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 3 },
  gridSub: { fontSize: 11, color: '#6b6b88', lineHeight: 16 },
});
