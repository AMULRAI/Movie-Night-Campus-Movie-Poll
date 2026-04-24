import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomTabBar from '../../components/BottomTabBar';
import { banUser } from '../../services/firestoreService';
import { db } from '../../config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function AdminStudents() {
  const navigation = useNavigation();
  const scrollRef = useRef();
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
    Alert.alert('Ban User', `Are you sure you want to ban ${student.firstName || student.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm Ban', style: 'destructive', onPress: async () => {
        try {
          await banUser(student._id);
          setStudents(prev => {
            const updated = prev.map(s =>
              s._id === student._id ? { ...s, status: 'banned' } : s
            );
            // Re-sort to put banned at bottom
            return updated.sort((a, b) => (a.status === 'banned' ? 1 : 0) - (b.status === 'banned' ? 1 : 0));
          });
          
          // Scroll to bottom to see the banned user moved to the end
          setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }, 500);
          
          Alert.alert('Success', 'User has been banned.');
        } catch (err) {
          Alert.alert('Error', 'Failed to ban user: ' + err.message);
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
      <ScrollView 
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Students</Text>
        <Text style={styles.pageSub}>{students.length} registered users</Text>

        {students.map(student => {
          const isBanned = student.status === 'banned';
          return (
            <View key={student._id} style={[styles.studentCard, isBanned && styles.studentCardBanned]}>
              <View style={[styles.avatarCircle, isBanned && styles.avatarCircleBanned]}>
                <Text style={[styles.avatarText, isBanned && styles.avatarTextBanned]}>
                  {(student.firstName?.[0] || student.email?.[0] || '?').toUpperCase()}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isBanned && styles.studentNameBanned]}>
                  {student.firstName || ''} {student.lastName || ''}
                </Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
                <Text style={styles.studentRole}>
                  {student.role || 'student'}
                  {isBanned ? ' · ACCOUNT SUSPENDED' : ''}
                </Text>
              </View>
              {!isBanned && student.role !== 'admin' && (
                <TouchableOpacity style={styles.banBtn} onPress={() => handleBan(student)}>
                  <Text style={styles.banBtnText}>Ban</Text>
                </TouchableOpacity>
              )}
              {isBanned && (
                <View style={styles.bannedPill}>
                  <Text style={styles.bannedText}>BANNED</Text>
                </View>
              )}
            </View>
          );
        })}

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
  studentCard: { 
    backgroundColor: '#12121e', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.07)', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  studentCardBanned: {
    backgroundColor: 'rgba(255,60,60,0.05)',
    borderColor: 'rgba(255,60,60,0.2)',
    opacity: 0.8,
  },
  avatarCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(139,92,246,0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(139,92,246,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarCircleBanned: {
    backgroundColor: 'rgba(142,142,147,0.1)',
    borderColor: 'rgba(142,142,147,0.2)',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#8b5cf6' },
  avatarTextBanned: { color: '#8e8e93' },
  studentInfo: { flex: 1, paddingLeft: 16 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  studentNameBanned: { color: '#8e8e93', textDecorationLine: 'line-through' },
  studentEmail: { fontSize: 13, color: '#6b6b88', marginTop: 2 },
  studentRole: { fontSize: 11, color: '#8b5cf6', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  banBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  banBtnText: { fontSize: 13, fontWeight: '700', color: '#ff3c3c' },
  bannedPill: { backgroundColor: 'rgba(255,60,60,0.1)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,60,60,0.2)' },
  bannedText: { fontSize: 10, fontWeight: '800', color: '#ff3c3c', letterSpacing: 1 },
});
