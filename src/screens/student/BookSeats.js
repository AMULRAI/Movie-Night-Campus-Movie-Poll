import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Animated, Alert, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { subscribeToEvent, getUserBooking, bookSeat } from '../../services/firestoreService';

export default function BookSeats() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [userBooking, setUserBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [seatCount, setSeatCount] = useState(2);
  const MAX_PER_BOOKING = 4;
  const MIN_SEATS = 1;

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [booking, setBooking] = useState(false);

  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef(new Animated.Value(0)).current;

  // 1. Fetch live event and user booking
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToEvent(eventId, (data) => {
      setEvent(data);
      setLoading(false);
    });

    if (user?.uid) {
      getUserBooking(user.uid, eventId).then(b => setUserBooking(b));
    }

    return () => unsub();
  }, [eventId, user?.uid]);

  // Derived Values
  const remaining = (event?.totalSeats || 0) - (event?.bookedSeats || 0);
  const filledPercent = event?.totalSeats ? Math.round((event.bookedSeats / event.totalSeats) * 100) : 0;
  const isFullyBooked = remaining <= 0;
  const alreadyBooked = userBooking !== null;

  // Progress Bar Animation
  useEffect(() => {
    if (!loading && event) {
      Animated.timing(animRef, {
        toValue: filledPercent / 100,
        duration: 1000,
        useNativeDriver: false
      }).start();
    }
  }, [loading, event, filledPercent]);

  // Modal Animations
  function openModal() {
    setShowConfirmModal(true);
    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1, tension: 120,
        friction: 8, useNativeDriver: true
      }),
      Animated.timing(modalOpacity, {
        toValue: 1, duration: 200, useNativeDriver: true
      })
    ]).start();
  }

  function closeModal() {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.9, duration: 180, useNativeDriver: true
      }),
      Animated.timing(modalOpacity, {
        toValue: 0, duration: 180, useNativeDriver: true
      })
    ]).start(() => setShowConfirmModal(false));
  }

  async function handleConfirmBooking() {
    setBooking(true);
    try {
      await bookSeat(user.uid, event._id, seatCount);
      closeModal();
      setUserBooking(true);
      Alert.alert(
        '🎟️ Booking Confirmed!',
        `${seatCount} seats booked for ${event.movieTitle}`,
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Booking Failed', err.message);
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f2f2f7" />
        <ActivityIndicator color="#ff3c3c" size="large" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Comming Soon...</Text>
      </SafeAreaView>
    );
  }

  const barColor = filledPercent < 60 ? '#00c864' : (filledPercent < 85 ? '#ff8c42' : '#ff3c3c');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backSymbol}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Seats</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── MOVIE INFO HERO CARD ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.posterBox}>
              <View style={styles.posterPlaceholder} />
              <Text style={styles.posterText}>POSTER</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.movieTitle}>{event.movieTitle}</Text>
              <Text style={styles.genreDuration}>{event.genre || 'Adventure'} · {event.duration || '166 min'}</Text>

              <View style={styles.iconRow}>
                <Text style={styles.iconEmoji}>📅</Text>
                <Text style={styles.iconText}>{event.date || 'Fri, Mar 7'} · {event.time || '7:30 PM'}</Text>
              </View>
              <View style={styles.iconRow2}>
                <Text style={styles.iconEmoji}>📍</Text>
                <Text style={styles.iconText}>{event.venue || 'Main Auditorium, Block C'}</Text>
              </View>

              <View style={styles.tagsRow}>
                {(event.isCampusEvent ?? true) && (
                  <View style={styles.campusTag}>
                    <Text style={styles.campusTagText}>CAMPUS EVENT</Text>
                  </View>
                )}
                {(event.isFree ?? true) && (
                  <View style={styles.freeTag}>
                    <Text style={styles.freeTagText}>FREE ENTRY</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ── SEAT AVAILABILITY CARD ── */}
        <View style={styles.availCard}>
          <Text style={styles.availCardTitle}>Seat Availability</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statBigNum}>{event.totalSeats}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statBigNum}>{event.bookedSeats}</Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={[
                styles.statBigNum,
                { color: remaining > 50 ? '#0a0a0f' : (remaining > 20 ? '#ff8c42' : '#ff3c3c') }
              ]}>{remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.hLine} />

          <View style={styles.progressTrack}>
            <Animated.View style={[
              styles.progressFill,
              {
                width: animRef.interpolate({ inputRange: [0, 1], outputRange: ['0%', filledPercent + '%'] }),
                backgroundColor: barColor
              }
            ]} />
          </View>

          <View style={styles.barFooterRow}>
            <Text style={styles.barFooterLeft}>{filledPercent}% filled</Text>
            <Text style={[styles.barFooterRight, { color: remaining > 20 ? '#0a0a0f' : '#ff3c3c' }]}>
              {remaining} seats left
            </Text>
          </View>
        </View>

        {/* ── SEAT SELECTOR CARD ── */}
        <View style={styles.selectCard}>
          <View style={styles.selectHeaderRow}>
            <Text style={styles.selectTitle}>Select Seats</Text>
            <View style={styles.selectHeaderRight}>
              <Text style={styles.selectRightMuted}>Total</Text>
              <Text style={styles.selectFreeText}>FREE</Text>
              <Text style={styles.selectRightMutedTop}>Campus</Text>
              <Text style={styles.selectRightMuted}>Event</Text>
            </View>
          </View>

          <View style={styles.counterRow}>
            <View style={styles.decreaseGroup}>
              <TouchableOpacity
                style={[styles.circleBtn, seatCount === MIN_SEATS && styles.circleBtnDisabled]}
                disabled={seatCount === MIN_SEATS}
                onPress={() => setSeatCount(c => Math.max(MIN_SEATS, c - 1))}
              >
                <Text style={styles.minusIcon}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.circleBtn, { marginLeft: 8 }, seatCount === MIN_SEATS && styles.circleBtnDisabled]}
                disabled={seatCount === MIN_SEATS}
                onPress={() => setSeatCount(c => Math.max(MIN_SEATS, c - 1))}
              >
                <Text style={styles.minusIcon}>−</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.countNumberBlock}>
              <Text style={styles.countNumber}>{seatCount}</Text>
              <Text style={styles.countLabel}>seats</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.circleBtnPlus,
                (seatCount >= Math.min(MAX_PER_BOOKING, remaining)) ? styles.circleBtnPlusDisabled : styles.circleBtnPlusActive
              ]}
              disabled={seatCount >= Math.min(MAX_PER_BOOKING, remaining)}
              onPress={() => setSeatCount(c => Math.min(MAX_PER_BOOKING, remaining, c + 1))}
            >
              <Text style={[styles.plusIcon, (seatCount >= Math.min(MAX_PER_BOOKING, remaining)) && { color: '#c7c7cc' }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── BOOK SEATS BUTTON ── */}
        {remaining === 0 ? (
          <View style={[styles.bookBtn, styles.bookBtnDisabledGrey]}>
            <Text style={styles.bookBtnDisabledText}>NO SEATS AVAILABLE</Text>
          </View>
        ) : alreadyBooked ? (
          <View style={[styles.bookBtn, styles.bookBtnSuccess]}>
            <Text style={styles.bookBtnSuccessText}>✓ ALREADY BOOKED</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.bookBtn, styles.bookBtnActive]} onPress={openModal}>
            <Text style={styles.bookBtnActiveText}>BOOK {seatCount} SEATS</Text>
          </TouchableOpacity>
        )}

        {/* ── CONFIRMATION MODAL CARD ── */}
        {showConfirmModal && (
          <Animated.View style={[styles.modalWrapper, { transform: [{ scale: modalScale }], opacity: modalOpacity }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderEmoji}>🗒️</Text>
              <Text style={styles.modalHeaderTitle}>CONFIRMATION MODAL STATE</Text>
            </View>

            <View style={styles.modalInnerBox}>
              <Text style={{ fontSize: 36, marginBottom: 12 }}>🎟️</Text>
              <Text style={styles.modalConfirmTitle}>Confirm Booking?</Text>
              <Text style={styles.modalConfirmDesc}>{seatCount} seats · {event.movieTitle} · {event.date || 'Fri, Mar 7'}</Text>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={closeModal}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirmBooking}>
                  {booking ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.btnConfirmText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── FULLY BOOKED STATE (DECORATIVE/FALLBACK) ── */}
        <View style={styles.fullyBookedCard}>
          <View style={styles.fullyBookedHeaderRow}>
            <Text style={{ fontSize: 14 }}>⚠️</Text>
            <Text style={styles.fullyBookedTitle}>STATE: FULLY BOOKED</Text>
          </View>
          <View style={styles.fullyBookedContentRow}>
            <View>
              <Text style={styles.fbMovieTitle}>Oppenheimer Night</Text>
              <Text style={styles.fbMovieDate}>Thu Mar 6 · 8:00 PM</Text>
            </View>
            <View style={styles.fbPill}>
              <Text style={styles.fbPillText}>FULLY BOOKED</Text>
            </View>
          </View>
          <View style={styles.fbDisabledBtn}>
            <Text style={styles.fbDisabledBtnText}>NO SEATS AVAILABLE</Text>
          </View>
          <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => Alert.alert('Waitlist', 'You have been added to the waitlist. We will notify you if seats open up!')}>
            <Text style={{ fontSize: 13, color: '#ff3c3c' }}>Join Waitlist →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    paddingBottom: 120,
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

  // Hero Card
  heroCard: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 4,
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
  },
  posterBox: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterPlaceholder: {
    width: 36,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
  },
  posterText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
  },
  infoBlock: {
    flex: 1,
    paddingLeft: 14,
  },
  movieTitle: {
    fontSize: 20,
    fontFamily: 'Bebas Neue',
    letterSpacing: 1,
    color: '#ffffff',
  },
  genreDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  iconRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  iconEmoji: {
    fontSize: 13,
  },
  iconText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  campusTag: {
    backgroundColor: 'rgba(60,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(60,130,246,0.3)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  campusTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3c82f6',
    letterSpacing: 0.5,
  },
  freeTag: {
    backgroundColor: 'rgba(0,200,100,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,100,0.3)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  freeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00c864',
    letterSpacing: 0.5,
  },

  // Availability Card
  availCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  availCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0f',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statBigNum: {
    fontSize: 36,
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
    height: 40,
    backgroundColor: '#f0f0f5',
    alignSelf: 'center',
  },
  hLine: {
    height: 1,
    backgroundColor: '#f0f0f5',
    marginVertical: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f0f0f5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 10,
  },
  barFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barFooterLeft: {
    fontSize: 12,
    color: '#8e8e93',
  },
  barFooterRight: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Select Card
  selectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  selectHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0f',
  },
  selectHeaderRight: {
    alignItems: 'flex-end',
  },
  selectRightMuted: {
    fontSize: 11,
    color: '#8e8e93',
  },
  selectFreeText: {
    fontSize: 26,
    fontFamily: 'Bebas Neue',
    color: '#0a0a0f',
  },
  selectRightMutedTop: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: -2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  decreaseGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnDisabled: {
    opacity: 0.4,
  },
  minusIcon: {
    fontSize: 24,
    fontWeight: '300',
    color: '#8e8e93',
  },
  countNumberBlock: {
    flex: 1,
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 48,
    fontFamily: 'Bebas Neue',
    color: '#0a0a0f',
    lineHeight: 50,
  },
  countLabel: {
    fontSize: 12,
    color: '#8e8e93',
    textAlign: 'center',
  },
  circleBtnPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnPlusActive: {
    backgroundColor: '#1c1c2e',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  circleBtnPlusDisabled: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  plusIcon: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '400',
  },

  // Book Button
  bookBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnActive: {
    backgroundColor: '#1c1c2e',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  bookBtnActiveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bookBtnDisabledGrey: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  bookBtnDisabledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c7c7cc',
  },
  bookBtnSuccess: {
    backgroundColor: 'rgba(0,200,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,100,0.3)',
  },
  bookBtnSuccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00c864',
  },

  // Confirmation Modal
  modalWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    padding: 0,
    overflow: 'hidden',
  },
  modalHeaderRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderEmoji: {
    fontSize: 14,
  },
  modalHeaderTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
    letterSpacing: 1.5,
  },
  modalInnerBox: {
    margin: 12,
    backgroundColor: '#f8f8fb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f5',
    padding: 20,
    alignItems: 'center',
  },
  modalConfirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0a0a0f',
  },
  modalConfirmDesc: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 6,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 12,
    padding: 14,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0f',
    textAlign: 'center',
  },
  btnConfirm: {
    flex: 1,
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
  },
  btnConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },

  // Fully Booked Card
  fullyBookedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  fullyBookedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  fullyBookedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff8c42',
    letterSpacing: 1.5,
  },
  fullyBookedContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fbMovieTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0a0a0f',
  },
  fbMovieDate: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 3,
  },
  fbPill: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  fbPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3c3c43',
    letterSpacing: 0.5,
  },
  fbDisabledBtn: {
    width: '100%',
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  fbDisabledBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c7c7cc',
    letterSpacing: 1.5,
    textAlign: 'center',
  }
});
