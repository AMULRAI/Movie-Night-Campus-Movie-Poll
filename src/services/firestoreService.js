import { db } from '../config/firebaseConfig'
import { banUserAPI } from './apiClient';
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot,
  serverTimestamp, increment, getDocs
} from 'firebase/firestore';

// ─── USER OPERATIONS ──────────────────────────────

// Create user profile in Firestore after Firebase Auth signup
export async function createUserProfile(uid, userData) {
  await setDoc(doc(db, 'users', uid), {
    _id: uid,
    name: userData.firstName + ' ' + userData.lastName,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    studentId: userData.studentId,
    role: userData.role || 'student',
    createdAt: serverTimestamp(),
  })
}

// Get a single user profile by UID
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (snap.exists()) return { _id: snap.id, ...snap.data() }
  return null
}

// ─── MOVIE OPERATIONS ─────────────────────────────

// Student suggests a new movie
export async function suggestMovie(userId, movieData) {
  const ref = await addDoc(collection(db, 'movies'), {
    ...movieData,
    suggestedBy: userId,
    isApproved: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// Admin approves a movie suggestion
export async function approveMovie(movieId) {
  await updateDoc(doc(db, 'movies', movieId), {
    isApproved: true,
  })
}

// Get all approved movies (NO orderBy to avoid composite index requirement)
export async function getApprovedMovies() {
  try {
    const q = query(
      collection(db, 'movies'),
      where('isApproved', '==', true)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getApprovedMovies error:', err.message);
    return [];
  }
}

// Get movies suggested by a specific user
export async function getMoviesByUser(userId) {
  try {
    const q = query(
      collection(db, 'movies'),
      where('suggestedBy', '==', userId)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getMoviesByUser error:', err.message);
    return [];
  }
}

// Admin rejects/deletes a movie suggestion
export async function rejectMovie(movieId) {
  await deleteDoc(doc(db, 'movies', movieId))
}

// Get all unapproved movies (for admin panel — NO orderBy)
export async function getPendingMovies() {
  try {
    const q = query(
      collection(db, 'movies'),
      where('isApproved', '==', false)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getPendingMovies error:', err.message);
    return [];
  }
}

// ─── POLL OPERATIONS ──────────────────────────────

// Admin creates a new poll
export async function createPoll(adminId, pollData) {
  const ref = await addDoc(collection(db, 'polls'), {
    ...pollData,
    status: 'active',
    totalVotes: 0,
    winnerMovieId: '',
    createdBy: adminId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// Get the currently active poll (real-time listener — NO orderBy)
export function subscribeToActivePoll(callback) {
  const q = query(
    collection(db, 'polls'),
    where('status', '==', 'active')
  )
  return onSnapshot(q, (snap) => {
    const polls = snap.docs.map(d => ({ _id: d.id, ...d.data() }))
    console.log("Active Polls found:", polls.length);
    callback(polls[0] || null)
  }, (error) => {
    console.log("subscribeToActivePoll error:", error.message);
    callback(null);
  })
}

// Admin closes a poll and sets the winner
export async function closePoll(pollId, winnerMovieId) {
  await updateDoc(doc(db, 'polls', pollId), {
    status: 'closed',
    winnerMovieId: winnerMovieId,
  })
}

// ─── VOTE OPERATIONS ──────────────────────────────

// Student submits a vote
export async function submitVote(userId, pollId, movieId) {
  const voteId = userId + '_' + pollId
  const voteRef = doc(db, 'votes', voteId)

  const existing = await getDoc(voteRef)
  if (existing.exists()) {
    throw new Error('You have already voted in this poll.')
  }

  await setDoc(voteRef, {
    _id: voteId,
    userId: userId,
    pollId: pollId,
    movieId: movieId,
    createdAt: serverTimestamp(),
  })

  await updateDoc(doc(db, 'polls', pollId), {
    totalVotes: increment(1),
  })

  return voteId
}

// Check if a user has already voted in a poll
export async function getUserVote(userId, pollId) {
  const voteId = userId + '_' + pollId
  const snap = await getDoc(doc(db, 'votes', voteId))
  if (snap.exists()) return snap.data()
  return null
}

// Get live vote counts for a poll (real-time)
export function subscribeToVoteCounts(pollId, callback) {
  const q = query(
    collection(db, 'votes'),
    where('pollId', '==', pollId)
  )
  return onSnapshot(q, (snap) => {
    const counts = {}
    snap.docs.forEach(d => {
      const { movieId } = d.data()
      counts[movieId] = (counts[movieId] || 0) + 1
    })
    callback(counts)
  })
}

// ─── BOOKING OPERATIONS ──────────────────────────────

export async function bookSeat(userId, eventId, seatCount) {
  const existingQ = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('eventId', '==', eventId)
  );
  const existing = await getDocs(existingQ);
  if (!existing.empty) throw new Error('You have already booked for this event.');

  const bookingRef = await addDoc(collection(db, 'bookings'), {
    userId,
    eventId,
    seatCount,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'events', eventId), {
    bookedSeats: increment(seatCount),
  });

  return bookingRef.id;
}

export async function getUserBooking(userId, eventId) {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('eventId', '==', eventId)
  )
  const snap = await getDocs(q)
  if (!snap.empty) return { _id: snap.docs[0].id, ...snap.docs[0].data() }
  return null
}

export function subscribeToEvent(eventId, callback) {
  return onSnapshot(doc(db, 'events', eventId), (snap) => {
    if (snap.exists()) callback({ _id: snap.id, ...snap.data() })
    else callback(null)
  })
}

// Get all past events (NO orderBy to avoid composite index)
export async function getPastEvents() {
  try {
    const q = query(
      collection(db, 'events'),
      where('status', '==', 'completed')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getPastEvents error:', err.message);
    return [];
  }
}

export async function getUserAttendedEvents(userId) {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('status', '==', 'confirmed')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data().eventId)
  } catch (err) {
    console.log('getUserAttendedEvents error:', err.message);
    return [];
  }
}

// ─── ADMIN DASHBOARD OPERATIONS ──────────────────────────────

// Get admin dashboard stats (each query wrapped in try/catch)
export async function getAdminStats() {
  let totalUsers = 0, activePolls = 0, eventsScheduled = 0, seatsBooked = 0, seatsRemaining = 0;

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    totalUsers = usersSnap.size;
  } catch (e) { console.log('Stats: users error', e.message); }

  try {
    const pollsSnap = await getDocs(query(collection(db, 'polls'), where('status', '==', 'active')));
    activePolls = pollsSnap.size;
  } catch (e) { console.log('Stats: polls error', e.message); }

  try {
    const eventsSnap = await getDocs(collection(db, 'events'));
    eventsScheduled = eventsSnap.size;
    const totalSeats = eventsSnap.docs.reduce((sum, d) => sum + (d.data().totalSeats || 0), 0);

    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    seatsBooked = bookingsSnap.docs.reduce((sum, d) => sum + (d.data().seatCount || 0), 0);
    seatsRemaining = totalSeats - seatsBooked;
  } catch (e) { console.log('Stats: events/bookings error', e.message); }

  return { totalUsers, activePolls, eventsScheduled, seatsBooked, seatsRemaining };
}

// Get flagged/moderation items (NO orderBy to avoid composite index)
export async function getFlaggedUsers() {
  try {
    const q = query(
      collection(db, 'flags'),
      where('resolved', '==', false)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getFlaggedUsers error:', err.message);
    return [];
  }
}

// Ban a user via Backend
export async function banUser(userId) {
  try {
    const result = await banUserAPI(userId);
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (err) {
    // If backend is not running, fall back to direct Firestore update
    console.log('Backend ban failed, updating Firestore directly:', err.message);
    await updateDoc(doc(db, 'users', userId), { status: 'banned' });
  }
}
