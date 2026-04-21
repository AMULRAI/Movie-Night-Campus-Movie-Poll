import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomTabBar from '../../components/BottomTabBar';
import { banUser } from '../../services/firestoreService';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminStudents() {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        setStudents(list);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadStudents();
  }, []);

  const handleBan = (student) => {
    Alert.alert('Ban User', `Ban ${student.firstName || student.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Ban', style: 'destructive', onPress: async () => {
        try {
          await banUser(student._id);
          setStudents(prev => prev.map(s =>
            s._id === student._id ? { ...s, status: 'banned' } : s
          ));
          Alert.alert('User banned.');
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#ff3c3c" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Students</Text>
        <Text style={styles.pageSub}>{students.length} registered users</Text>

        {students.map(student => (
          <View key={student._id} style={styles.studentCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(student.firstName?.[0] || student.email?.[0] || '?').toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {student.firstName || ''} {student.lastName || ''}
              </Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
              <Text style={styles.studentRole}>{student.role || 'student'}{student.status === 'banned' ? ' · BANNED' : ''}</Text>
            </View>
            {student.role !== 'admin' && student.status !== 'banned' && (
              <TouchableOpacity style={styles.banBtn} onPress={() => handleBan(student)}>
                <Text style={styles.banBtnText}>Ban</Text>
              </TouchableOpacity>
            )}
            {student.status === 'banned' && (
              <View style={styles.bannedPill}>
                <Text style={styles.bannedText}>BANNED</Text>
              </View>
            )}
          </View>
        ))}

      </ScrollView>
      <BottomTabBar activeTab="students" role="admin" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, backgroundColor: '#0a0a0f', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#ff3c3c', fontSize: 14, fontWeight: '600' },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#6b6b88', marginBottom: 24 },
  studentCard: { backgroundColor: '#1c1c2e', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#8b5cf6' },
  studentInfo: { flex: 1, paddingLeft: 14 },
  studentName: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  studentEmail: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  studentRole: { fontSize: 11, color: '#6b6b88', marginTop: 2, textTransform: 'capitalize' },
  banBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  banBtnText: { fontSize: 12, fontWeight: '600', color: '#ff3c3c' },
  bannedPill: { backgroundColor: 'rgba(255,60,60,0.15)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  bannedText: { fontSize: 10, fontWeight: '700', color: '#ff3c3c', letterSpacing: 0.5 },
});
