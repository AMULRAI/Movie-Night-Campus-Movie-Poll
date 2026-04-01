import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import { COLORS } from '../../constants/theme';
import LivePollCard from '../../components/LivePollCard';
import MovieVoteCard from '../../components/MovieVoteCard';
import NotificationBanner from '../../components/NotificationBanner';
import BottomTabBar from '../../components/BottomTabBar';

const POLL = {
  title: 'FRIDAY MOVIE NIGHT',
  subtitle: "Vote for this week's campus screening",
  hours: 2, minutes: 45, seconds: 30,
  totalVotes: 128,
};

const MOVIES = [
  { id:'1', title:'Interstellar', genre:'Sci-Fi', duration:'169 min', language:'English', votes: 42 },
  { id:'2', title:'Dune: Part Two', genre:'Adventure', duration:'166 min', language:'English', votes: 58 },
  { id:'3', title:'The Dark Knight', genre:'Action', duration:'152 min', language:'English', votes: 28 },
];

export default function StudentHome() {
  const { userProfile } = useAuth();
  const navigation = useNavigation();
  const [showBanner, setShowBanner] = useState(true);
  const [votedMovieId, setVotedMovieId] = useState(null);

  const firstName = userProfile?.firstName || 'Alex';
  const lastName = userProfile?.lastName || 'Johnson';
  const fullName = userProfile ? `${firstName} ${lastName}`.trim() : 'Alex Johnson';
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'AJ';

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* SECTION 1: Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Evening 👋</Text>
              <Text style={styles.name}>{fullName}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn}>
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <LinearGradient colors={['#ff3c3c', '#ff8c42']} style={styles.avatar}>
                <Text style={styles.initials}>{initials}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* SECTION 2: Notification Banner */}
          <NotificationBanner
            visible={showBanner && votedMovieId !== null} 
            type="warning"
            title="Duplicate Vote Blocked"
            subtitle="You've already voted in this poll"
            onDismiss={() => setShowBanner(false)}
          />

          {/* SECTION 3: Live Poll Card */}
          <LivePollCard 
            pollTitle={POLL.title}
            pollSubtitle={POLL.subtitle}
            initialHours={POLL.hours}
            initialMinutes={POLL.minutes}
            initialSeconds={POLL.seconds}
          />

          {/* SECTION 4: Movies Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MOVIE OPTIONS (3)</Text>
            <Text style={styles.sectionSubtitle}>{POLL.totalVotes} total votes</Text>
          </View>

          {/* SECTION 5: Movie Vote Cards */}
          {MOVIES.map(movie => (
            <MovieVoteCard
              key={movie.id}
              {...movie}
              hasVoted={votedMovieId === movie.id}
              isUserVoted={votedMovieId !== null}
              onVote={(id) => setVotedMovieId(id)}
              totalVotes={POLL.totalVotes}
            />
          ))}

          {/* BOTTOM SPACER */}
          <View style={{ height: 20 }} />

        </ScrollView>
      </SafeAreaView>
      <BottomTabBar activeTab="home" role="student" />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  greeting: {
    fontSize: 13,
    color: '#6b6b88',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bellBtn: {
    position: 'relative',
  },
  bellIcon: {
    fontSize: 22,
    color: '#ffffff',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff3c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b6b88',
    letterSpacing: 1.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b6b88',
  },
});
