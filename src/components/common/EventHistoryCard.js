import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function EventHistoryCard({
  title,
  date,
  venue,
  attendance,
  totalSeats,
  popularityTrend = [],
  status
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = totalSeats > 0 ? (attendance / totalSeats) * 100 : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false
    }).start();
  }, [percentage]);

  const barColor = percentage >= 90 ? '#1c1c2e' : percentage >= 70 ? '#ff8c42' : '#ff3c3c';

  return (
    <View style={styles.cardContainer}>
      {/* ── TOP SECTION ── */}
      <View style={styles.topSection}>
        <View style={styles.posterBox}>
          <View style={styles.posterPlaceholder} />
          <Text style={styles.posterText}>POSTER</Text>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>PAST</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.infoText}>{date}</Text>
          </View>

          <View style={styles.venueRow}>
            <Text style={styles.emoji}>📍</Text>
            <Text style={styles.infoText}>{venue}</Text>
          </View>
        </View>
      </View>

      {/* ── BOTTOM SECTION ── */}
      <View style={styles.separator} />
      
      <View style={styles.bottomSection}>
        <View style={styles.attendanceBlock}>
          <Text style={styles.attendanceLabel}>Attendance</Text>
          <Text style={styles.attendanceValue}>{attendance}/{totalSeats}</Text>
        </View>
        
        <View style={styles.trendBlock}>
          <Text style={styles.trendLabel}>Popularity Trend</Text>
          <View style={styles.miniChart}>
            {popularityTrend.map((value, idx) => {
              const maxVal = Math.max(...popularityTrend, 1);
              const height = (value / maxVal) * 24;
              const isLast = idx === popularityTrend.length - 1;
              return (
                <View 
                  key={idx} 
                  style={[
                    styles.miniBar, 
                    { height: height, backgroundColor: isLast ? '#ff3c3c' : 'rgba(255,255,255,0.1)' }
                  ]} 
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* ── FULL WIDTH PROGRESS BAR ── */}
      <View style={styles.progressTrack}>
        <Animated.View style={[
          styles.progressFill, 
          { 
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }), 
            backgroundColor: barColor 
          }
        ]} />
      </View>
      <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  posterBox: {
    width: 72,
    height: 90,
    backgroundColor: '#12121e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholder: {
    width: 28,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
  },
  posterText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#6b6b88',
    marginTop: 6,
  },
  infoBlock: {
    flex: 1,
    paddingLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  pastBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pastBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b6b88',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  emoji: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6b6b88',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  attendanceBlock: {
  },
  attendanceLabel: {
    fontSize: 11,
    color: '#6b6b88',
    letterSpacing: 0.5,
  },
  attendanceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  trendBlock: {
    alignItems: 'flex-end',
  },
  trendLabel: {
    fontSize: 11,
    color: '#6b6b88',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  miniChart: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
    height: 24,
    marginTop: 4,
  },
  miniBar: {
    width: 4,
    borderRadius: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#12121e',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  percentageText: {
    textAlign: 'right',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  }
});
