import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '../../components/BottomTabBar';
import { getPendingMovies, approveMovie, rejectMovie } from '../../services/firestoreService';

export default function AdminMovies() {
  const navigation = useNavigation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const pending = await getPendingMovies();
      setMovies(pending);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const handleApprove = (movie) => {
    Alert.alert('Approve Movie', `Approve "${movie.title || 'Untitled'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        try {
          await approveMovie(movie._id);
          setMovies(prev => prev.filter(m => m._id !== movie._id));
          Alert.alert('✅ Approved!');
        } catch (err) {
          Alert.alert('Error', err.message);
        }
      }}
    ]);
  };

  const handleReject = (movie) => {
    Alert.alert('Reject Movie', `Delete "${movie.title || 'Untitled'}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        try {
          await rejectMovie(movie._id);
          setMovies(prev => prev.filter(m => m._id !== movie._id));
          Alert.alert('Rejected.');
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

        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Approve Movies</Text>
        <Text style={styles.pageSub}>{movies.length} suggestions pending your review</Text>

        {movies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No pending movie suggestions right now.</Text>
          </View>
        ) : (
          movies.map((movie) => (
            <View key={movie._id} style={styles.movieCard}>
              <View style={styles.movieTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.movieTitle}>{movie.title || 'Untitled Movie'}</Text>
                  <Text style={styles.movieMeta}>Genre: {movie.genre || 'N/A'}</Text>
                  <Text style={styles.movieMeta}>By: {movie.suggestedBy || 'Unknown'}</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>PENDING</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(movie)}>
                  <LinearGradient colors={['#00c864', '#00a050']} style={styles.gradientBtn}>
                    <Text style={styles.btnText}>✓ Approve</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(movie)}>
                  <Text style={styles.rejectBtnText}>✗ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

      </ScrollView>
      <BottomTabBar activeTab="movies" role="admin" />
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
  emptyCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  emptySub: { fontSize: 14, color: '#6b6b88' },
  movieCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 18, marginBottom: 14 },
  movieTop: { flexDirection: 'row', marginBottom: 14 },
  movieTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  movieMeta: { fontSize: 13, color: '#6b6b88', marginTop: 3 },
  pendingBadge: { backgroundColor: 'rgba(255,209,102,0.15)', borderWidth: 1, borderColor: 'rgba(255,209,102,0.3)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' },
  pendingText: { fontSize: 10, fontWeight: '700', color: '#ffd166', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', gap: 10 },
  approveBtn: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  rejectBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', backgroundColor: 'rgba(255,60,60,0.08)', paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { color: '#ff3c3c', fontSize: 14, fontWeight: '600' },
});
