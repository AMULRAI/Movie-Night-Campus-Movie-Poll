import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StatusBar, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getPastEvents, getUserAttendedEvents } from '../../services/firestoreService';
import EventHistoryCard from '../../components/common/EventHistoryCard';
import BottomTabBar from '../../components/BottomTabBar';

export default function EventHistory() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [attendedIds, setAttendedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('All');
  const FILTERS = ['All', 'Attended', 'Missed', '2026'];

  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        getPastEvents(),
        getUserAttendedEvents(user.uid)
      ]).then(([allEvents, myEventIds]) => {
        setEvents(allEvents);
        setAttendedIds(myEventIds);
        setLoading(false);
      });
    }
  }, [user?.uid]);

  const eventsWithStatus = useMemo(() => {
    return events.map(e => ({
      ...e,
      userAttended: attendedIds.includes(e._id)
    }));
  }, [events, attendedIds]);

  const totalEvents = eventsWithStatus.length;
  const attended = eventsWithStatus.filter(e => e.userAttended).length;
  const satisfaction = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;

  const filteredEvents = useMemo(() => {
    switch (activeFilter) {
      case 'Attended': return eventsWithStatus.filter(e => e.userAttended);
      case 'Missed':   return eventsWithStatus.filter(e => !e.userAttended);
      case '2026':     return eventsWithStatus.filter(e => e.date?.includes('2026'));
      default:         return eventsWithStatus;
    }
  }, [activeFilter, eventsWithStatus]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#05050d" />
        <ActivityIndicator color="#ff3c3c" size="large" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Event History</Text>
        </View>

        {/* ── FILTER TABS ── */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{filter}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* ── YEAR SCROLL BAR ── */}
        <View style={styles.yearScrollContainer}>
          <View style={styles.arrowBtn}>
            <Text style={styles.arrowText}>◀</Text>
          </View>
          <View style={styles.scrollTrack}>
            <View style={styles.scrollFill} />
          </View>
          <View style={styles.arrowBtn}>
            <Text style={styles.arrowText}>▶</Text>
          </View>
        </View>

        {/* ── STATS SUMMARY CARD ── */}
        <View style={styles.statsCard}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totalEvents}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{attended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>4.2</Text>
              <Text style={styles.starEmoji}>★</Text>
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{satisfaction}%</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
        </View>

        {/* ── SECTION HEADER ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>PAST EVENTS</Text>
          <Text style={styles.sectionCount}>{filteredEvents.length} events</Text>
        </View>

        {/* ── EVENT CARDS ── */}
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventHistoryCard 
              key={event._id || event.id}
              title={event.movieTitle || event.title}
              date={event.date}
              venue={event.venue || 'Main Auditorium'}
              attendance={event.bookedSeats || event.attendance || 0}
              totalSeats={event.totalSeats || 200}
              popularityTrend={event.popularityTrend || [3,5,4,6,5,7,6,9]}
              status="past"
            />
          ))
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptyDesc}>Try a different filter</Text>
          </View>
        )}

      </ScrollView>

      {/* ── BOTTOM TAB BAR ── */}
      <BottomTabBar activeTab="history" role="student" theme="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#05050d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b6b88',
    marginTop: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#05050d',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: '#05050d',
  },
  header: {
    backgroundColor: '#05050d',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 8, // For gap support in older RN
  },
  filterPillActive: {
    backgroundColor: '#1c1c2e',
    borderColor: '#1c1c2e',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c3c43',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  yearScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowText: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
  },
  scrollTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e5ea',
    borderRadius: 10,
    marginHorizontal: 8,
  },
  scrollFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#1c1c2e',
    borderRadius: 10,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Bebas Neue',
    color: '#0a0a0f',
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#f0f0f5',
  },
  ratingRow: {
    flexDirection: 'row',
  },
  starEmoji: {
    fontSize: 16,
    color: '#ffd166',
    marginLeft: 2,
    marginTop: -4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    letterSpacing: 1.5,
  },
  sectionCount: {
    fontSize: 12,
    color: '#8e8e93',
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0f',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 6,
  }
});
