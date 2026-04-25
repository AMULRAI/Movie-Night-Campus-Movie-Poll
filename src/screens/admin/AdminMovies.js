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
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

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

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === movies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(movies.map(m => m._id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    Alert.alert('Approve Selected', `Approve ${selectedIds.length} selected movies?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve All', onPress: async () => {
        setProcessing(true);
        try {
          await Promise.all(selectedIds.map(id => approveMovie(id)));
          setMovies(prev => prev.filter(m => !selectedIds.includes(m._id)));
          setSelectedIds([]);
          Alert.alert('✅ All selected movies approved!');
        } catch (err) {
          Alert.alert('Error', 'Some movies could not be approved.');
        } finally {
          setProcessing(false);
        }
      }}
    ]);
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    Alert.alert('Reject Selected', `Reject and delete ${selectedIds.length} selected movies?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject All', style: 'destructive', onPress: async () => {
        setProcessing(true);
        try {
          await Promise.all(selectedIds.map(id => rejectMovie(id)));
          setMovies(prev => prev.filter(m => !selectedIds.includes(m._id)));
          setSelectedIds([]);
          Alert.alert('Selected movies rejected.');
        } catch (err) {
          Alert.alert('Error', 'Some movies could not be rejected.');
        } finally {
          setProcessing(false);
        }
      }}
    ]);
  };

  const handleApprove = (movie) => {
    Alert.alert('Approve Movie', `Approve "${movie.title || 'Untitled'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        try {
          await approveMovie(movie._id);
          setMovies(prev => prev.filter(m => m._id !== movie._id));
          setSelectedIds(prev => prev.filter(i => i !== movie._id));
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
          setSelectedIds(prev => prev.filter(i => i !== movie._id));
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Approve Movies</Text>
            <Text style={styles.pageSub}>{movies.length} suggestions pending your review</Text>
          </View>
          {movies.length > 0 && (
            <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedIds.length === movies.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {selectedIds.length > 0 && (
          <View style={styles.bulkActionsBar}>
            <View style={styles.bulkInfo}>
              <Text style={styles.bulkCount}>{selectedIds.length} SELECTED</Text>
            </View>
            <View style={styles.bulkButtons}>
              <TouchableOpacity 
                style={[styles.bulkApprove, processing && { opacity: 0.6 }]} 
                onPress={handleBulkApprove}
                disabled={processing}
              >
                <Text style={styles.bulkBtnText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bulkReject, processing && { opacity: 0.6 }]} 
                onPress={handleBulkReject}
                disabled={processing}
              >
                <Text style={styles.bulkBtnText}>REJECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {movies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No pending movie suggestions right now.</Text>
          </View>
        ) : (
          movies.map((movie) => {
            const isSelected = selectedIds.includes(movie._id);
            return (
              <TouchableOpacity 
                key={movie._id} 
                style={[styles.movieCard, isSelected && styles.movieCardSelected]}
                onPress={() => toggleSelect(movie._id)}
                activeOpacity={0.9}
              >
                <View style={styles.movieTop}>
                  <View style={styles.selectColumn}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </View>
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
              </TouchableOpacity>
            );
          })
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  selectAllBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  selectAllText: { color: '#ff3c3c', fontSize: 12, fontWeight: '700' },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  pageSub: { fontSize: 14, color: '#6b6b88' },
  
  bulkActionsBar: { 
    backgroundColor: '#1c1c2e', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#ff3c3c', 
    padding: 16, 
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#ff3c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  bulkInfo: { flex: 1 },
  bulkCount: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  bulkButtons: { flexDirection: 'row', gap: 8 },
  bulkApprove: { backgroundColor: '#00c864', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  bulkReject: { backgroundColor: '#ff3c3c', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  bulkBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },

  emptyCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  emptySub: { fontSize: 14, color: '#6b6b88' },
  movieCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 18, marginBottom: 14 },
  movieCardSelected: { borderColor: '#ff3c3c', backgroundColor: 'rgba(255, 60, 60, 0.04)' },
  movieTop: { flexDirection: 'row', marginBottom: 14 },
  selectColumn: { width: 34, justifyContent: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { borderColor: '#ff3c3c', backgroundColor: '#ff3c3c' },
  checkMark: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  movieTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  movieMeta: { fontSize: 13, color: '#6b6b88', marginTop: 3 },
  pendingBadge: { backgroundColor: 'rgba(255,209,102,0.15)', borderWidth: 1, borderColor: 'rgba(255,209,102,0.3)', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start' },
  pendingText: { fontSize: 10, fontWeight: '700', color: '#ffd166', letterSpacing: 0.5 },
  actionRow: { flexDirection: 'row', gap: 10, paddingLeft: 34 },
  approveBtn: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  gradientBtn: { paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  rejectBtn: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', backgroundColor: 'rgba(255,60,60,0.08)', paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { color: '#ff3c3c', fontSize: 14, fontWeight: '600' },
});
