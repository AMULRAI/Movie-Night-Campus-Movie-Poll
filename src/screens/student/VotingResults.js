import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Animated, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { subscribeToActivePoll, subscribeToVoteCounts, getApprovedMovies } from '../../services/firestoreService';
import { LinearGradient } from 'expo-linear-gradient';

export default function VotingResults() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [poll, setPoll] = useState(null);
  const [movies, setMovies] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [remainingText, setRemainingText] = useState("Ended");
  const [isUnder10Mins, setIsUnder10Mins] = useState(false);

  // Pulse animation for Active Status
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Progress bar animations
  const progressAnims = useRef({}).current;
  const winnerGlowAnim = useRef(new Animated.Value(0)).current;

  // 1. Fetch Poll, Movies, and Vote Counts
  useEffect(() => {
    let unsubscribeVotes = () => {};

    const unsubscribePoll = subscribeToActivePoll(activePoll => {
      setPoll(activePoll);
      if (activePoll) {
        // Get movies in this poll
        getApprovedMovies().then(allMovies => {
          const pollMovies = allMovies.filter(m => 
            activePoll.movieIds?.includes(m._id) || activePoll.movieIds?.includes(m.id)
          );
          setMovies(pollMovies);
          setLoading(false);
        });

        // Get live vote counts
        unsubscribeVotes = subscribeToVoteCounts(activePoll._id || activePoll.id, counts => {
          setVoteCounts(counts);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribePoll();
      unsubscribeVotes();
    };
  }, []);

  // Set up pulsed animation for active status banner
  useEffect(() => {
    if (poll?.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [poll]);

  // Derived Values
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);
  
  const sortedMovies = movies.map((m, index) => {
    const votes = voteCounts[m._id || m.id] || 0;
    const percentage = totalVotes > 0 ? parseFloat(((votes / totalVotes) * 100).toFixed(1)) : 0;
    return {
      ...m,
      votes,
      percentage
    };
  }).sort((a, b) => b.votes - a.votes);

  const winner = sortedMovies.length > 0 ? sortedMovies[0] : null;
  const turnout = Math.round((totalVotes / 270) * 100); 

  // Live Countdown calculation
  useEffect(() => {
    let intervalId = null;

    const calculateRemaining = () => {
      if (!poll || !poll.endTime) {
        setRemainingText("Ended");
        setIsUnder10Mins(false);
        return;
      }
      const end = poll.endTime.toDate ? poll.endTime.toDate() : new Date(poll.endTime);
      const diff = Math.floor((end.getTime() - new Date().getTime()) / 1000);
      
      if (diff > 0) {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        setRemainingText(`${h}:${m.toString().padStart(2, '0')}`);
        setIsUnder10Mins(h === 0 && m < 10);
      } else {
        setRemainingText("0:00");
        setIsUnder10Mins(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    calculateRemaining(); // initial call

    if (poll?.status === 'active') {
      intervalId = setInterval(calculateRemaining, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [poll?.endTime, poll?.status]);

  // Animation triggers when vote counts/movies update
  useEffect(() => {
    if (sortedMovies.length > 0 && totalVotes > 0 && winner) {
      // Winner bar animation
      Animated.timing(winnerGlowAnim, {
        toValue: winner.percentage,
        duration: 1000,
        useNativeDriver: false
      }).start();

      // Distribution bars animation
      sortedMovies.forEach((m, i) => {
        if (!progressAnims[i]) {
            progressAnims[i] = new Animated.Value(0);
        }
        Animated.timing(progressAnims[i], {
          toValue: m.percentage,
          duration: 800,
          delay: i * 250, // stagger updated
          useNativeDriver: false
        }).start();
      });
    }
  }, [totalVotes, sortedMovies.length]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3c3c" />
        <Text style={{ fontSize: 14, color: '#8e8e93', marginTop: 12 }}>Loading results...</Text>
      </View>
    );
  }

  const isPollActive = poll?.status === 'active';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backSymbol}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voting Results</Text>
          {isPollActive ? (
             <View style={styles.activeBadge}>
               <Text style={styles.activeText}>ACTIVE</Text>
             </View>
          ) : (
             <View style={styles.closedBadge}>
               <Text style={styles.closedText}>CLOSED</Text>
             </View>
          )}
        </View>

        {/* ── STATS SUMMARY CARD ── */}
        <View style={styles.statsCard}>
          <View style={styles.statsLayout}>
            <View style={styles.statsLeft}>
              <Text style={styles.statsTotalTitle}>TOTAL VOTES CAST</Text>
              <Text style={styles.statsBigNumber}>{totalVotes}</Text>
            </View>
            <View style={styles.statsRight}>
              <View style={styles.statBlock}>
                <Text style={styles.statBlockValue}>{sortedMovies.length}</Text>
                <Text style={styles.statBlockLabel}>Options</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statBlockValue}>{turnout}%</Text>
                <Text style={styles.statBlockLabel}>Turnout</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={[styles.statBlockValue, isUnder10Mins && { color: '#ff3c3c' }]}>{remainingText}</Text>
                <Text style={styles.statBlockLabel}>Remaining</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── LEADING / CURRENT WINNER CARD ── */}
        {winner && (
          <View style={styles.winnerCardWrapper}>
            <View style={styles.winnerCard}>
              <View style={styles.winnerTopRow}>
                <Text style={styles.winnerEmoji}>🏆</Text>
                <Text style={styles.winnerLeadingText}>LEADING — CURRENT WINNER</Text>
              </View>
              
              <View style={styles.winnerContentRow}>
                <View style={styles.winnerPoster}>
                  <View style={styles.posterIconPlaceholder} />
                  <Text style={styles.posterText}>POSTER</Text>
                </View>
                <View style={styles.winnerInfo}>
                  <Text style={styles.winnerTitle}>{winner.title}</Text>
                  <Text style={styles.winnerGenreDuration}>{winner.genre || 'Adventure'} · {winner.duration || '166 min'}</Text>
                  <Text style={styles.winnerVotes}>{winner.votes}</Text>
                  <Text style={styles.winnerVotesDesc}>votes — {winner.percentage}%</Text>
                </View>
              </View>

              <View style={styles.winnerProgressBarContainer}>
                <Animated.View style={[
                  styles.winnerProgressBarFill, 
                  { 
                    width: winnerGlowAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    }) 
                  }
                ]}>
                  <LinearGradient
                    colors={['#ffd166', '#ff8c42']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>

              <LinearGradient
                colors={['transparent', 'rgba(255,209,102,0.04)']}
                style={styles.winnerSubtleGlow}
                pointerEvents="none"
              />
            </View>
          </View>
        )}

        {/* ── VOTE DISTRIBUTION CARD ── */}
        <View style={styles.distCard}>
          <View style={styles.distHeaderRow}>
            <Text style={styles.distEmoji}>📊</Text>
            <Text style={styles.distTitle}>Vote Distribution</Text>
          </View>
          
          {sortedMovies.map((movie, index) => {
            const fillAnim = progressAnims[index] || new Animated.Value(0);

            return (
              <View key={movie._id || movie.id || index} style={styles.distRow}>
                <View style={styles.distTitleRow}>
                  <Text style={styles.distMovieTitle}>{movie.title}</Text>
                  <Text style={styles.distMoviePercentage}>{movie.percentage.toFixed(0)}%</Text>
                </View>
                <View style={styles.distTrack}>
                  <Animated.View style={[
                      styles.distFill, 
                      { width: fillAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%']
                      }) },
                      index === 0 && { backgroundColor: '#1c1c2e' },
                      index === 1 && { backgroundColor: '#c7c7cc' },
                      index >= 2 && { backgroundColor: '#e5e5ea' }
                  ]} />
                </View>
              </View>
            );
          })}

          <View style={styles.liveChartPlaceholder}>
            <Text style={styles.liveChartText}>[ Live Animated Chart — Real-time ]</Text>
          </View>
        </View>

        {/* ── PERCENTAGE DISTRIBUTION CARD ── */}
        <View style={styles.percCard}>
          <Text style={styles.percTitle}>Percentage Distribution</Text>
          
          {sortedMovies.map((movie, index) => {
            let numColor = '#8e8e93';
            let barColor = '#e5e5ea';
            
            if (index === 0) {
              numColor = '#0a0a0f';
              barColor = '#1c1c2e';
            } else if (index === 1) {
              numColor = '#3c3c43';
              barColor = '#c7c7cc';
            }

            const maxPercentage = sortedMovies[0]?.percentage || 100;
            const barWidth = maxPercentage > 0 ? (movie.percentage / maxPercentage) * 56 : 0;
            const isLast = index === sortedMovies.length - 1;

            return (
              <View key={movie._id || movie.id || index} style={[styles.percRow, !isLast && { borderBottomWidth: 1, borderBottomColor: '#f0f0f5' }]}>
                <View style={styles.percPoster}>
                  <View style={styles.percPosterIcon} />
                  <Text style={styles.percPosterText}>POSTER</Text>
                </View>
                <View style={styles.percMiddle}>
                  <Text style={styles.percMovieTitle}>{movie.title}</Text>
                  <Text style={styles.percMovieVotes}>{movie.votes} votes</Text>
                </View>
                <View style={styles.percRight}>
                  <Text style={[styles.percNumber, { color: numColor }]}>{movie.percentage}</Text>
                  <View style={styles.percMiniTrack}>
                    <View style={[styles.percMiniFill, { width: barWidth, backgroundColor: barColor }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── STATUS FOOTER BANNER ── */}
        <View style={styles.footerBanner}>
          <View style={styles.footerLeft}>
            <Text style={[styles.footerStateText, !isPollActive && styles.footerStateTextClosed]}>
              STATE: {isPollActive ? 'POLL ACTIVE' : 'POLL CLOSED'}
            </Text>
            <Text style={styles.footerDescText}>
              {isPollActive ? 'Results update in real-time' : 'Final results locked in'}
            </Text>
          </View>
          <View style={styles.footerRight}>
            {isPollActive ? (
              <Animated.View style={[styles.pulsingDot, { opacity: pulseAnim }]} />
            ) : (
              <View style={styles.pollClosedPill}>
                <Text style={styles.pollClosedPillText}>POLL CLOSED</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#05050d'
  },
  container: {
    flex: 1,
    backgroundColor: '#05050d',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: '#05050d',
  },
  
  // Header
  header: {
    backgroundColor: '#05050d',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: '#1c1c2e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backSymbol: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeBadge: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  closedBadge: {
    backgroundColor: 'rgba(255,60,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,60,60,0.3)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff3c3c',
  },

  // Common Card Style
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#12121e',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statsLayout: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
  },
  statsLeft: {
    flex: 1.2,
  },
  statsTotalTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b6b88',
    letterSpacing: 1.2,
  },
  statsBigNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 56,
    marginTop: 2,
  },
  statsRight: {
    flexDirection: 'row',
    gap: 0,
    flex: 1,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.07)',
  },
  statBlockValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  statBlockLabel: {
    fontSize: 11,
    color: '#6b6b88',
    marginTop: 2,
  },

  // Winner Card (Dark)
  winnerCardWrapper: {
    position: 'relative',
    marginHorizontal: 12,
    marginTop: 12,
  },
  winnerCard: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  winnerSubtleGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  winnerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  winnerEmoji: {
    fontSize: 16,
  },
  winnerLeadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffd166',
    letterSpacing: 1.5,
  },
  winnerContentRow: {
    flexDirection: 'row',
    gap: 14,
  },
  winnerPoster: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterIconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 4,
  },
  posterText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
  },
  winnerInfo: {
    flex: 1,
  },
  winnerTitle: {
    fontSize: 24,
    fontFamily: 'Bebas Neue',
    color: '#ffffff',
    letterSpacing: 1,
    lineHeight: 26,
  },
  winnerGenreDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  winnerVotes: {
    fontSize: 42,
    fontFamily: 'Bebas Neue',
    color: '#ffffff',
    marginTop: 10,
    lineHeight: 44,
  },
  winnerVotesDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  winnerProgressBarContainer: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginTop: 16,
    overflow: 'hidden',
  },
  winnerProgressBarFill: {
    height: '100%',
    borderRadius: 10,
  },

  // Distribution Card
  distCard: {
    backgroundColor: '#12121e',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  distHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  distEmoji: {
    fontSize: 18,
  },
  distTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  distRow: {
    marginBottom: 14,
  },
  distTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distMovieTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  distMoviePercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  distTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#ff3c3c',
  },
  liveChartPlaceholder: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  liveChartText: {
    fontSize: 13,
    color: '#6b6b88',
    fontStyle: 'italic',
  },

  // Percentage Distribution
  percCard: {
    backgroundColor: '#12121e',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  percTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  percRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  percPoster: {
    width: 52,
    height: 66,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percPosterIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  percPosterText: {
    fontSize: 8,
    color: '#6b6b88',
    marginTop: 4,
  },
  percMiddle: {
    flex: 1,
    paddingLeft: 12,
  },
  percMovieTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  percMovieVotes: {
    fontSize: 12,
    color: '#6b6b88',
    marginTop: 2,
  },
  percRight: {
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  percNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  percMiniTrack: {
    width: 56,
    height: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 6,
  },
  percMiniFill: {
    height: '100%',
    borderRadius: 10,
  },

  // Footer Banner
  footerBanner: {
    backgroundColor: '#12121e',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  footerLeft: {
    flex: 1,
  },
  footerStateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00c864',
    letterSpacing: 1,
  },
  footerStateTextClosed: {
    color: '#0a0a0f',
  },
  footerDescText: {
    fontSize: 12,
    color: '#6b6b88',
    marginTop: 3,
  },
  footerRight: {
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00c864',
  },
  pollClosedPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  pollClosedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    color: '#3c3c43',
    letterSpacing: 0.5,
  }
});
