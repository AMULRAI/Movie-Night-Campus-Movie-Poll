import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';
import { getMoviesByUser } from '../../services/firestoreService';

export default function StudentProfile() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();
  const [suggestionCount, setSuggestionCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    getMoviesByUser(user.uid).then(m => setSuggestionCount(m.length)).catch(() => {});
  }, [user?.uid]);

  const firstName = userProfile?.firstName || 'Student';
  const lastName = userProfile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = userProfile?.email || user?.email || '';
  const studentId = userProfile?.studentId || 'N/A';
  const initials = (firstName[0] + (lastName[0] || '')).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            await logoutUser();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) { Alert.alert('Error', e.message); }
        }
      }
    ]);
  };



  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── AVATAR HERO ── */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#ff3c3c', '#8b5cf6']} style={styles.avatarRing}>
            <Text style={styles.initials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>🎓 STUDENT</Text>
          </View>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{suggestionCount}</Text>
            <Text style={styles.statLabel}>Suggested</Text>
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(139,92,246,0.2)' }]}>
            <Text style={styles.statNum}>🎟️</Text>
            <Text style={styles.statLabel}>Student</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>✓</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>

        {/* ── INFO CARD ── */}
        <View style={styles.infoCard}>
          <Text style={styles.cardHeading}>ACCOUNT DETAILS</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID</Text>
            <Text style={styles.infoVal}>{studentId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoVal} numberOfLines={1}>{email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Student</Text>
            </View>
          </View>
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
      <BottomTabBar activeTab="profile" role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050d' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 110 },

  // Avatar hero
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  avatarRing: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  initials: { fontSize: 32, fontWeight: '800', color: '#ffffff' },
  name: { fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  email: { fontSize: 13, color: '#6b6b88', marginBottom: 10 },
  rolePill: { backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#8b5cf6', letterSpacing: 1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#12121e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b6b88' },

  // Info card
  infoCard: { backgroundColor: '#12121e', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 20, marginBottom: 24 },
  cardHeading: { fontSize: 10, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 14, color: '#6b6b88' },
  infoVal: { fontSize: 14, fontWeight: '600', color: '#ffffff', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  roleBadge: { backgroundColor: 'rgba(139,92,246,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  roleBadgeText: { color: '#8b5cf6', fontWeight: '600', fontSize: 12 },

  // Menu
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 12 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121e', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 14, marginBottom: 8 },
  menuIconBox: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,60,60,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ffffff' },
  menuArrow: { fontSize: 22, color: '#6b6b88' },

  // Logout
  logoutBtn: { backgroundColor: 'rgba(255,60,60,0.08)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.2)', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#ff3c3c', fontSize: 16, fontWeight: '700' },
});
