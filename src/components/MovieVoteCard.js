import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PillTag from './PillTag';

export default function MovieVoteCard({
  id, title, genre, duration, language,
  votes = 0, totalVotes = 1,
  hasVoted, isUserVoted, onVote
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage, progressAnim]);

  const widthStyle = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.posterBox}>
          <Text style={styles.posterIcon}>🎬</Text>
          <Text style={styles.posterText}>POSTER</Text>
        </View>
        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {hasVoted && (
              <View style={styles.votedBadge}>
                <Text style={styles.votedBadgeText}>✓</Text>
              </View>
            )}
          </View>
          <View style={styles.tagsRow}>
            {genre && <PillTag label={genre} color="#aaaaaa" />}
            {duration && <PillTag label={duration} color="#aaaaaa" />}
            {language && <PillTag label={language} color="#aaaaaa" />}
          </View>
          <View style={styles.progressSection}>
            <View style={styles.track}>
              <Animated.View style={[styles.fillContainer, { width: widthStyle }]}>
                <LinearGradient
                  colors={['#ff3c3c', '#ff8c42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={styles.votesText}>{votes} votes</Text>
          </View>
        </View>
      </View>
      
      {isUserVoted && hasVoted ? (
        <TouchableOpacity style={styles.votedBtnBase} disabled>
          <Text style={styles.votedBtnText}>✓  VOTED</Text>
        </TouchableOpacity>
      ) : isUserVoted && !hasVoted ? (
        <TouchableOpacity style={styles.dimmedBtnBase} disabled>
          <Text style={styles.dimmedBtnText}>VOTE</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.voteBtnBase} onPress={() => onVote(id)}>
          <Text style={styles.voteBtnText}>VOTE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
  },
  posterBox: {
    width: 80,
    height: 104,
    backgroundColor: '#12121a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  posterText: {
    fontSize: 10,
    color: '#6b6b88',
  },
  infoBlock: {
    flex: 1,
    paddingLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  votedBadge: {
    width: 20,
    height: 20,
    backgroundColor: '#3c82f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  votedBadgeText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  progressSection: {
    marginTop: 12,
  },
  track: {
    height: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  fillContainer: {
    height: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ff3c3c',
  },
  votesText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6b6b88',
    marginTop: 6,
  },
  votedBtnBase: {
    marginTop: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ff3c3c',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  votedBtnText: {
    color: '#ff3c3c',
    fontSize: 13,
    fontWeight: '600',
  },
  dimmedBtnBase: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  dimmedBtnText: {
    color: '#6b6b88',
    fontSize: 13,
    fontWeight: '600',
  },
  voteBtnBase: {
    marginTop: 12,
    backgroundColor: '#12121a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  voteBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
