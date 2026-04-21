import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import LivePollCard from '../../components/LivePollCard';
import MovieVoteCard from '../../components/MovieVoteCard';
import BottomTabBar from '../../components/BottomTabBar';
import {
  subscribeToActivePoll, subscribeToVoteCounts,
  getUserVote, submitVote, getApprovedMovies
} from '../../services/firestoreService';

export default function StudentHome() {
  const { userProfile, user } = useAuth();
  const navigation = useNavigation();

  const [activePoll, setActivePoll] = useState(null);
  const [movies, setMovies] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeVotes = null;

    const unsubscribePoll = subscribeToActivePoll(async (poll) => {
      console.log("StudentHome poll:", poll?.title || 'none');
      setActivePoll(poll);

      if (poll) {
        const approved = await getApprovedMovies();
        let filtered = approved;
        if (poll.movieIds?.length > 0) {
          filtered = approved.filter(m =>
            poll.movieIds.includes(m._id) || poll.movieIds.includes(m.id)
          );
          if (filtered.length === 0) filtered = approved;
        }
        setMovies(filtered);

        const pollId = poll._id || poll.id;
        unsubscribeVotes = subscribeToVoteCounts(pollId, (counts) => setVoteCounts(counts));

        if (user?.uid) {
          const vote = await getUserVote(user.uid, pollId);
          if (vote) setUserVote(vote.movieId);
        }
      } else {
        setMovies([]);
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribePoll) unsubscribePoll();
      if (unsubscribeVotes) unsubscribeVotes();
    };
  }, [user?.uid]);

  const onVote = async (movieId) => {
    const pollId = activePoll?._id || activePoll?.id;
    if (!user?.uid || !pollId) return;
    if (userVote) return Alert.alert('Already Voted', 'You have already cast your vote in this poll.');
    try {
      await submitVote(user.uid, pollId, movieId);
      setUserVote(movieId);
    } catch (err) {
      Alert.alert('Vote Failed', err.message);
    }
  };

  const firstName = userProfile?.firstName || 'Student';
  const lastName = userProfile?.lastName || '';
  const initials = (firstName[0] + (lastName[0] || '')).toUpperCase();
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0) || activePoll?.totalVotes || 0;

  let initialHours = 0, initialMinutes = 59, initialSeconds = 0;
  if (activePoll?.endTime) {
    const end = activePoll.endTime.toDate ? activePoll.endTime.toDate() : new Date(activePoll.endTime);
    const diff = Math.floor((end.getTime() - Date.now()) / 1000);
    if (diff > 0) {
      initialHours = Math.floor(diff / 3600);
      initialMinutes = Math.floor((diff % 3600) / 60);
      initialSeconds = diff % 60;
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="light-content" backgroundColor="#05050d" />
        <ActivityIndicator size="large" color="#ff3c3c" />
        <Text style={styles.loadingText}>Fetching poll...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>LIVE POLLS</Text>
            <Text style={styles.headerTitle}>Vote Now 🗳️</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('/student/profile')}
          >
            <LinearGradient colors={['#ff3c3c', '#8b5cf6']} style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── POLL STATUS BANNER OR LIVE CARD ── */}
        {activePoll ? (
          <>
            {/* Live indicator row */}
            <View style={styles.liveRow}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>LIVE</Text>
              </View>
              <Text style={styles.totalVotesText}>{totalVotes} votes cast</Text>
            </View>

            {/* Poll title card */}
            <LinearGradient
              colors={['#1a0d10', '#1c1c2e']}
              style={styles.pollTitleCard}
            >
              <Text style={styles.pollCardLabel}>THIS WEEK'S POLL</Text>
              <Text style={styles.pollCardTitle}>{activePoll.title}</Text>
              <Text style={styles.pollCardSub}>{activePoll.movieIds?.length || movies.length} movies competing</Text>
            </LinearGradient>

            {/* User already voted banner */}
            {userVote && (
              <View style={styles.votedBanner}>
                <Text style={styles.votedBannerEmoji}>✅</Text>
                <View>
                  <Text style={styles.votedBannerTitle}>Vote Recorded!</Text>
                  <Text style={styles.votedBannerSub}>Results update in real-time below</Text>
                </View>
              </View>
            )}

            {/* Movie cards */}
            <Text style={styles.moviesLabel}>MOVIE OPTIONS — TAP TO VOTE</Text>
            {movies.map(movie => (
              <MovieVoteCard
                key={movie._id || movie.id}
                {...movie}
                votes={voteCounts[movie._id || movie.id] || 0}
                totalVotes={totalVotes || 1}
                hasVoted={userVote === (movie._id || movie.id)}
                isUserVoted={!!userVote}
                onVote={() => onVote(movie._id || movie.id)}
              />
            ))}

            {movies.length === 0 && (
              <View style={styles.emptyMovies}>
                <Text style={styles.emptyMoviesEmoji}>🎬</Text>
                <Text style={styles.emptyMoviesText}>No movies in this poll yet.</Text>
              </View>
            )}
          </>
        ) : (
          /* ── NO ACTIVE POLL STATE ── */
          <View style={styles.noPollWrap}>
            <LinearGradient colors={['#1c1c2e', '#12121e']} style={styles.noPollCard}>
              <Text style={styles.noPollEmoji}>🎬</Text>
              <Text style={styles.noPollTitle}>No Active Poll</Text>
              <Text style={styles.noPollSub}>
                Your admin hasn't started tonight's poll yet.{'\n'}Come back soon!
              </Text>
              <TouchableOpacity
                style={styles.noPollBtn}
                onPress={() => navigation.navigate('/student/results')}
              >
                <Text style={styles.noPollBtnText}>See Past Results →</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Quick Links */}
            <Text style={styles.quickLabel}>WHILE YOU WAIT</Text>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate('/student/suggest')}
            >
              <Text style={styles.quickIcon}>🎬</Text>
              <View>
                <Text style={styles.quickTitle}>Suggest a Movie</Text>
                <Text style={styles.quickSub}>Submit your pick for next week</Text>
              </View>
              <Text style={styles.quickArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate('/student/history')}
            >
              <Text style={styles.quickIcon}>📜</Text>
              <View>
                <Text style={styles.quickTitle}>Event History</Text>
                <Text style={styles.quickSub}>Browse past movie nights</Text>
              </View>
              <Text style={styles.quickArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
      <BottomTabBar activeTab="polls" role="student" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05050d' },
  loadingWrap: { flex: 1, backgroundColor: '#05050d', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#6b6b88', marginTop: 12, fontSize: 14 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#ffffff', marginTop: 2 },
  avatarBtn: {},
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 16, fontWeight: '800', color: '#ffffff' },

  // Live row
  liveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,100,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,100,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00c864', marginRight: 6 },
  livePillText: { fontSize: 11, fontWeight: '700', color: '#00c864', letterSpacing: 1 },
  totalVotesText: { fontSize: 13, color: '#6b6b88' },

  // Poll title card
  pollTitleCard: { borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,60,60,0.15)' },
  pollCardLabel: { fontSize: 10, fontWeight: '700', color: '#ff3c3c', letterSpacing: 1.5, marginBottom: 6 },
  pollCardTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  pollCardSub: { fontSize: 13, color: '#6b6b88' },

  // Voted banner
  votedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,200,100,0.08)', borderWidth: 1, borderColor: 'rgba(0,200,100,0.2)', borderRadius: 14, padding: 14, marginBottom: 16, gap: 12 },
  votedBannerEmoji: { fontSize: 22 },
  votedBannerTitle: { fontSize: 14, fontWeight: '700', color: '#00c864' },
  votedBannerSub: { fontSize: 12, color: '#6b6b88', marginTop: 2 },

  // Movies
  moviesLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 12 },
  emptyMovies: { alignItems: 'center', padding: 40, backgroundColor: '#12121e', borderRadius: 16 },
  emptyMoviesEmoji: { fontSize: 40, marginBottom: 10 },
  emptyMoviesText: { color: '#6b6b88', fontSize: 14 },

  // No Poll
  noPollWrap: { marginTop: 4 },
  noPollCard: { borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 24 },
  noPollEmoji: { fontSize: 56, marginBottom: 14 },
  noPollTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
  noPollSub: { fontSize: 14, color: '#6b6b88', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  noPollBtn: { backgroundColor: 'rgba(255,60,60,0.1)', borderWidth: 1, borderColor: 'rgba(255,60,60,0.3)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  noPollBtnText: { color: '#ff3c3c', fontWeight: '600', fontSize: 14 },

  // Quick links
  quickLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b88', letterSpacing: 1.5, marginBottom: 12 },
  quickCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12121e', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 16, marginBottom: 10, gap: 14 },
  quickIcon: { fontSize: 22 },
  quickTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  quickSub: { fontSize: 12, color: '#6b6b88', marginTop: 2 },
  quickArrow: { marginLeft: 'auto', fontSize: 20, color: '#6b6b88' },
});
