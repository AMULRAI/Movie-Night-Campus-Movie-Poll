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
import { getMoviesByUser, subscribeToActivePoll } from '../../services/firestoreService';

const { width } = Dimensions.get('window');
const CARD_W = (width - 24 * 2 - 12) / 2;

// Static notifications — replace with Firestore later
const NOTIFICATIONS = [
  { id: '1', icon: '🗳️', title: 'New Poll is Live!', body: 'Cast your vote before midnight tonight.', time: '2m ago', unread: true },
  { id: '2', icon: '✅', title: 'Movie Approved', body: 'Your suggestion "Interstellar" was approved.', time: '1h ago', unread: true },
  { id: '3', icon: '🎟️', title: 'Seat Booking Open', body: 'Friday Night screening seats are now open.', time: '3h ago', unread: false },
  { id: '4', icon: '🏆', title: 'Poll Results In', body: 'Oppenheimer won last week\'s poll!', time: 'Yesterday', unread: false },
];

export default function StudentDashboard() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();

  const [stats, setStats] = useState({ suggested: 0, votes: 0, booked: 0 });
  const [activePoll, setActivePoll] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const bellShake = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    if (!user?.uid) return;
    getMoviesByUser(user.uid).then(movies => {
      setStats(prev => ({ ...prev, suggested: movies.length }));
    }).catch(() => {});

    const unsub = subscribeToActivePoll(poll => setActivePoll(poll));
    return () => unsub();
  }, [user?.uid]);

  // Shake bell when there are unread notifications
  useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(bellShake, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: 4, duration: 80, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(bellShake, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

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
            {/* NOTIFICATION BELL */}
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => setShowNotifications(true)}
              activeOpacity={0.8}
            >
              <Animated.Text style={[styles.bellIcon, { transform: [{ translateX: bellShake }] }]}>
                🔔
              </Animated.Text>
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

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
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎬</Text>
            <Text style={styles.statNum}>{stats.suggested}</Text>
            <Text style={styles.statLabel}>Suggested</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMid]}>
            <Text style={styles.statEmoji}>🗳️</Text>
            <Text style={styles.statNum}>{activePoll ? '1' : '0'}</Text>
            <Text style={styles.statLabel}>Active Poll</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔔</Text>
            <Text style={styles.statNum}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
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

      {/* ── NOTIFICATION MODAL ── */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowNotifications(false)}>
          <Pressable style={styles.notifPanel} onPress={() => {}}>
            {/* Panel Handle */}
            <View style={styles.panelHandle} />

            {/* Panel Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>Notifications</Text>
                <Text style={styles.panelSub}>{unreadCount} unread</Text>
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Notification Items */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.notifScroll}>
              {notifications.map(notif => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifItem, notif.unread && styles.notifItemUnread]}
                  onPress={() => setNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, unread: false } : n)
                  )}
                >
                  <View style={styles.notifIconBox}>
                    <Text style={{ fontSize: 20 }}>{notif.icon}</Text>
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {notif.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Close button */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNotifications(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomTabBar activeTab="home" role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050d' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 110 },

  // ── Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flex: 1, paddingRight: 12 },
  greeting: { fontSize: 13, color: '#6b6b88', marginBottom: 2 },
  name: { fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Bell
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1c1c2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 20 },
  bellBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#ff3c3c', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#05050d' },
  bellBadgeText: { fontSize: 9, fontWeight: '800', color: '#ffffff' },

  // Avatar
  avatarBtn: { position: 'relative' },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#00c864', borderWidth: 2, borderColor: '#05050d' },

  // ── Hero Banner
  heroBanner: { borderRadius: 24, padding: 24, marginBottom: 20, overflow: 'hidden', minHeight: 180 },
  heroCircle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -40 },
  heroCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 20 },
  heroBannerContent: { position: 'relative', zIndex: 1 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00ff88', marginRight: 6 },
  livePillText: { fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff', lineHeight: 30, marginBottom: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },
  heroBtn: { backgroundColor: '#ffffff', borderRadius: 25, paddingHorizontal: 22, paddingVertical: 11, alignSelf: 'flex-start' },
  heroBtnText: { color: '#ff3c3c', fontWeight: '700', fontSize: 14 },

  // ── Stats
  statsRow: { flexDirection: 'row', marginBottom: 24, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#12121e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14, alignItems: 'center' },
  statCardMid: { borderColor: 'rgba(255,60,60,0.2)', backgroundColor: '#1a0d10' },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 26, fontWeight: '800', color: '#ffffff' },
  statLabel: { fontSize: 11, color: '#6b6b88', marginTop: 2 },

  // ── Actions Grid
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: CARD_W },
  gridCard: { borderRadius: 20, padding: 18, borderWidth: 1, minHeight: 130 },
  gridIconBox: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridIcon: { fontSize: 22 },
  gridTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 3 },
  gridSub: { fontSize: 11, color: '#6b6b88', lineHeight: 16 },

  // ── Notification Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  notifPanel: { backgroundColor: '#12121e', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingHorizontal: 20, maxHeight: '80%', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  panelHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 18 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  panelSub: { fontSize: 13, color: '#6b6b88', marginTop: 2 },
  markAllBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  markAllText: { color: '#ff3c3c', fontSize: 12, fontWeight: '600' },
  notifScroll: { flexGrow: 0 },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', gap: 14 },
  notifItemUnread: { backgroundColor: 'rgba(255,60,60,0.03)', marginHorizontal: -20, paddingHorizontal: 20 },
  notifIconBox: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#1c1c2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff3c3c' },
  notifBody: { fontSize: 13, color: '#6b6b88', lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#4a4a60', marginTop: 4 },
  closeBtn: { backgroundColor: '#1c1c2e', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 12, marginBottom: 24 },
  closeBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
});
