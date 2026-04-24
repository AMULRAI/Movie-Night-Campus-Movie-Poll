import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import BottomTabBar from '../../components/BottomTabBar';

export default function AdminProfile() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();

  const firstName = userProfile?.firstName || 'Admin';
  const lastName = userProfile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = userProfile?.email || user?.email || '';
  const initials = (firstName.charAt(0) + (lastName.charAt(0) || '')).toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>ADMIN</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>Administrator</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar activeTab="profile" role="admin" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1c1c2e', borderWidth: 2, borderColor: 'rgba(255,60,60,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#ff3c3c' },
  name: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  email: { fontSize: 14, color: '#6b6b88', marginBottom: 10 },
  rolePill: { backgroundColor: 'rgba(255,60,60,0.15)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 14 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#ff3c3c', letterSpacing: 1 },
  infoCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 18, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoLabel: { fontSize: 14, color: '#6b6b88' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  logoutBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: '#ff3c3c', fontSize: 16, fontWeight: '600' },
});
