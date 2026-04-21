import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import BottomTabBar from '../../components/BottomTabBar';
import { getApprovedMovies, createPoll, closePoll, subscribeToActivePoll } from '../../services/firestoreService';

export default function AdminManagePolls() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [approvedMovies, setApprovedMovies] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [pollTitle, setPollTitle] = useState('');
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const movies = await getApprovedMovies();
        setApprovedMovies(movies);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadMovies();

    const unsub = subscribeToActivePoll((poll) => {
      setActivePoll(poll);
    });

    return () => unsub();
  }, []);

  const toggleMovie = (id) => {
    setSelectedMovieIds(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreatePoll = async () => {
    if (!pollTitle.trim()) {
      Alert.alert('Error', 'Please enter a poll title.');
      return;
    }
    if (selectedMovieIds.length < 2) {
      Alert.alert('Error', 'Select at least 2 movies for the poll.');
      return;
    }

    setCreating(true);
    try {
      // Close existing active poll if any
      if (activePoll) {
        await closePoll(activePoll._id, '');
      }

      await createPoll(user?.uid || 'admin', {
        title: pollTitle.trim(),
        movieIds: selectedMovieIds,
      });

      Alert.alert('🗳️ Poll Created!', 'Students can now vote on this poll.');
      setPollTitle('');
      setSelectedMovieIds([]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
    setCreating(false);
  };

  const handleClosePoll = () => {
    if (!activePoll) return;
    Alert.alert('Close Poll', 'Are you sure you want to end the current poll?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Close', style: 'destructive', onPress: async () => {
        try {
          await closePoll(activePoll._id, '');
          Alert.alert('Poll closed.');
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
        <Text style={styles.pageTitle}>Manage Polls</Text>
        <Text style={styles.pageSub}>Create polls for students to vote on</Text>

        {/* Current Active Poll */}
        {activePoll && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View style={styles.livePill}>
                <Text style={styles.liveDot}>●</Text>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.activeVotes}>{activePoll.totalVotes || 0} votes</Text>
            </View>
            <Text style={styles.activeTitle}>{activePoll.title}</Text>
            <Text style={styles.activeSub}>{activePoll.movieIds?.length || 0} movies in this poll</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClosePoll}>
              <Text style={styles.closeBtnText}>Force Close Poll</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create New Poll Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create New Poll</Text>

          <Text style={styles.label}>POLL TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Friday Sci-Fi Night"
            placeholderTextColor="#6b6b88"
            value={pollTitle}
            onChangeText={setPollTitle}
          />

          <Text style={[styles.label, { marginTop: 20 }]}>SELECT MOVIES ({selectedMovieIds.length} chosen)</Text>

          {approvedMovies.length === 0 ? (
            <Text style={styles.emptyText}>No approved movies yet. Approve some first!</Text>
          ) : (
            approvedMovies.map((movie) => {
              const isSelected = selectedMovieIds.includes(movie._id);
              return (
                <TouchableOpacity
                  key={movie._id}
                  style={[styles.movieRow, isSelected && styles.movieRowSelected]}
                  onPress={() => toggleMovie(movie._id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.movieName}>{movie.title || 'Untitled'}</Text>
                    <Text style={styles.movieGenre}>{movie.genre || 'No genre'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity
            style={[styles.createBtn, creating && { opacity: 0.5 }]}
            onPress={handleCreatePoll}
            disabled={creating}
          >
            <LinearGradient colors={['#ff3c3c', '#ff8c42']} style={styles.createGradient}>
              <Text style={styles.createBtnText}>{creating ? 'Publishing...' : '🚀 Publish Live Poll'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <BottomTabBar activeTab="polls" role="admin" />
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

  // Active Poll card
  activeCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,200,100,0.2)', padding: 18, marginBottom: 20 },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,100,0.1)', borderWidth: 1, borderColor: 'rgba(0,200,100,0.25)', borderRadius: 40, paddingVertical: 4, paddingHorizontal: 10 },
  liveDot: { color: '#00c864', fontSize: 8, marginRight: 6 },
  liveText: { fontSize: 11, fontWeight: '600', color: '#00c864', letterSpacing: 1 },
  activeVotes: { fontSize: 13, fontWeight: '600', color: '#ff3c3c' },
  activeTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  activeSub: { fontSize: 13, color: '#6b6b88', marginTop: 4 },
  closeBtn: { marginTop: 14, backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  closeBtnText: { color: '#ff3c3c', fontWeight: '600', fontSize: 14 },

  // Form card
  formCard: { backgroundColor: '#1c1c2e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', padding: 20 },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: '#0a0a0f', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 16 },
  emptyText: { color: '#6b6b88', textAlign: 'center', paddingVertical: 20 },

  // Movie selection
  movieRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0f', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  movieRowSelected: { borderColor: 'rgba(255,60,60,0.4)', backgroundColor: 'rgba(255,60,60,0.05)' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#6b6b88', marginRight: 14, justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: '#ff3c3c', borderColor: '#ff3c3c' },
  checkmark: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  movieName: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
  movieGenre: { fontSize: 12, color: '#6b6b88', marginTop: 2 },

  // Create button
  createBtn: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  createGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  createBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
