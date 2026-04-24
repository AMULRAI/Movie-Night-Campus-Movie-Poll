import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Dimensions, Modal, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import BottomTabBar from '../../components/BottomTabBar';
import { getMoviesByUser, subscribeToActivePoll, getPastEvents } from '../../services/firestoreService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 24 * 2 - 12) / 2;



export default function StudentDashboard() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();

  const [stats, setStats] = useState({ suggested: 0, votes: 0, booked: 0, history: 0 });
  const [activePoll, setActivePoll] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    getMoviesByUser(user.uid).then(movies => {
      setStats(prev => ({ ...prev, suggested: movies.length }));
    }).catch(() => { });

    getPastEvents().then(events => {
      setStats(prev => ({ ...prev, history: events.length }));
    }).catch(() => { });

    const unsub = subscribeToActivePoll(poll => setActivePoll(poll));
    return () => unsub();
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
    { title: 'Active Polls', subtitle: 'Vote on this week\'s movie', icon: '🗳️', route: '/student/polls', color: '#ff3c3c' },
    { title: 'Suggest Movie', subtitle: 'Submit your movie idea', icon: '🎬', route: '/student/suggest', color: '#8b5cf6' },
    { title: 'Book My Seat', subtitle: 'Reserve for movie night', icon: '🎟️', route: '/student/booking', color: '#f59e0b' },
    { title: 'Past Events', subtitle: 'Revisit event history', icon: '📜', route: '/student/history', color: '#10b981' },
    { title: 'Poll Results', subtitle: 'See live results', icon: '📊', route: '/student/results', color: '#3b82f6' },
    { title: 'My Profile', subtitle: 'Settings & logout', icon: '👤', route: '/student/profile', color: '#6b7280' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
          </View>



          <View style={styles.headerRight}>
            {/* PROFILE AVATAR */}
            <TouchableOpacity
              onPress={() => navigation.navigate('/student/profile')}
              activeOpacity={0.8}
              style={styles.avatarBtn}
            >
              <LinearGradient colors={['#ff3c3c', '#8b5cf6']} style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── HERO POLL BANNER ── */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('/student/polls')}>
          <LinearGradient
            colors={activePoll ? ['#ff3c3c', '#c026d3'] : ['#1c1c2e', '#12121e']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.heroBannerContent}>
              {activePoll ? (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.livePillText}>LIVE NOW</Text>
                </View>
              ) : (
                <View style={[styles.livePill, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.livePillText, { color: 'rgba(255,255,255,0.5)' }]}>NO ACTIVE POLL</Text>
                </View>
              )}
              <Text style={styles.heroTitle}>
                {activePoll ? `${activePoll.title || 'Tonight\'s Poll'}\nis Live! 🎬` : 'No Poll Yet\nCheck back soon'}
              </Text>
              <Text style={styles.heroSub}>
                {activePoll ? 'Cast your vote for this week\'s screening' : 'Your admin will start a poll soon'}
              </Text>
              <View style={[styles.heroBtn, !activePoll && { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.heroBtnText, !activePoll && { color: 'rgba(255,255,255,0.5)' }]}>
                  {activePoll ? 'Vote Now →' : 'See Results →'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('/student/suggest')}
          >
            <Text style={styles.statEmoji}>🎬</Text>
            <Text style={styles.statNum}>{stats.suggested}</Text>
            <Text style={styles.statLabel}>Suggested</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardMid]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('/student/polls')}
          >
            <Text style={styles.statEmoji}>🗳️</Text>
            <Text style={styles.statNum}>{activePoll ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Active Poll</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('/student/history')}
          >
            <Text style={styles.statEmoji}>📽️</Text>
            <Text style={styles.statNum}>{stats.history}</Text>
            <Text style={styles.statLabel}>History</Text>
          </TouchableOpacity>
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
              <View style={[styles.gridCard, { borderColor: action.color + '25', backgroundColor: action.color + '10' }]}>
                <View style={[styles.gridIconBox, { borderColor: action.color + '40', backgroundColor: action.color + '18' }]}>
                  <Text style={styles.gridIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.gridTitle}>{action.title}</Text>
                <Text style={styles.gridSub}>{action.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>



      <BottomTabBar activeTab="home" role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050d' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 110 },

  // ── Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 },
  headerLeft: { flex: 1, paddingRight: 12 },
  greeting: { fontSize: 14, color: '#6b6b88', fontWeight: '500', marginBottom: 4 },
  name: { fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: -0.8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Avatar
  avatarBtn: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  initials: { fontSize: 16, fontWeight: '900', color: '#ffffff' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#00ff88', borderWidth: 2, borderColor: '#05050d' },

  // ── Hero Banner
  heroBanner: { borderRadius: 28, padding: 24, marginBottom: 28, overflow: 'hidden', minHeight: 190, shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 },
  heroCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -50 },
  heroCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: 30 },
  heroBannerContent: { position: 'relative', zIndex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00ff88', marginRight: 8, shadowColor: '#00ff88', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4 },
  livePillText: { fontSize: 10, fontWeight: '900', color: '#ffffff', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#ffffff', lineHeight: 34, marginBottom: 10, letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24, lineHeight: 20 },
  heroBtn: { backgroundColor: '#ffffff', borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12, alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  heroBtnText: { color: '#ff3c3c', fontWeight: '800', fontSize: 14, letterSpacing: -0.2 },

  // ── Stats
  statsRow: { flexDirection: 'row', marginBottom: 28, gap: 12 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#12121e', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)', 
    padding: 16, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4
  },
  statCardMid: { 
    borderColor: 'rgba(255,60,60,0.15)', 
    backgroundColor: '#1a0d10',
  },
  statEmoji: { fontSize: 24, marginBottom: 6 },
  statNum: { fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#6b6b88', marginTop: 3, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  // ── Actions Grid
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#6b6b88', letterSpacing: 2, marginBottom: 18, paddingLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem: { width: CARD_W },
  gridCard: { borderRadius: 24, padding: 20, borderWidth: 1, minHeight: 140, justifyContent: 'space-between' },
  gridIconBox: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  gridIcon: { fontSize: 24 },
  gridTitle: { fontSize: 15, fontWeight: '800', color: '#ffffff', marginBottom: 4, letterSpacing: -0.3 },
  gridSub: { fontSize: 12, color: '#6b6b88', lineHeight: 18, fontWeight: '500' },


});
