/*
 * ============================================================================
 * FILE: firestoreService.js — ALL DATABASE (FIRESTORE) OPERATIONS
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is the BIGGEST and most important service file. It contains ALL the
 * functions that read from and write to the Firestore database.
 *
 * It's organized into sections:
 *   1. USER OPERATIONS — Create/fetch user profiles
 *   2. MOVIE OPERATIONS — Suggest, approve, reject movies
 *   3. POLL OPERATIONS — Create polls, listen for active polls, close polls
 *   4. VOTE OPERATIONS — Submit votes, check existing votes, count votes
 *   5. BOOKING OPERATIONS — Book seats, check bookings, listen to events
 *   6. ADMIN DASHBOARD — Get stats, flagged users, ban users
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Firestore": Google's cloud database. Data is organized as:
 *   Database → Collections (folders) → Documents (individual records)
 *
 * - "Query": A request to the database with specific filters.
 *   Example: "Give me all polls WHERE status equals 'active'"
 *
 * - "Snapshot": The result of reading from Firestore. It's a "snapshot"
 *   (photo) of the data at that moment. Contains the documents that matched.
 *
 * - "Real-time Listener" (onSnapshot): Instead of reading data once,
 *   a listener continuously watches for changes. When data changes in
 *   the database, the callback function runs automatically.
 *   Example: When someone votes, the vote count updates on everyone's screen.
 *
 * - "serverTimestamp()": A special value that tells Firestore to use the
 *   SERVER's current time (not the phone's time). This ensures consistency
 *   since phone clocks might be wrong.
 *
 * - "increment(n)": A special Firestore operation that adds `n` to a number
 *   field. It's "atomic" — meaning even if 100 people vote at the same
 *   second, every vote is counted correctly (no data is lost).
 *
 * - "Composite Index": Firestore needs special indexes for queries that
 *   filter and sort on multiple fields. To avoid needing these (they
 *   require manual setup), some queries here don't use orderBy.
 *
 * CONNECTIONS:
 * -----------
 * - Used by almost EVERY screen in the app (student and admin)
 * - Depends on: src/config/firebaseConfig.js (for the `db` object)
 * - Depends on: src/services/apiClient.jsx (for banUserAPI)
 */

// Import our Firestore database instance
import { db } from '../config/firebaseConfig'

// Import the backend API function for banning users
import { banUserAPI } from './apiClient';

// Import Firestore functions:
import {
  doc,            // Creates a reference to a specific document
  getDoc,         // Reads a single document
  setDoc,         // Writes/creates a document with a specific ID
  addDoc,         // Adds a new document with an auto-generated ID
  updateDoc,      // Updates specific fields in an existing document
  deleteDoc,      // Deletes a document
  collection,     // Creates a reference to a collection (group of documents)
  query,          // Builds a database query with filters
  where,          // Adds a filter condition to a query (e.g., where status == 'active')
  orderBy,        // Sorts query results (not used here to avoid composite index issues)
  onSnapshot,     // Sets up a real-time listener that fires when data changes
  serverTimestamp, // Gets the server's current time for consistent timestamps
  increment,      // Atomically increases a number field (safe for concurrent updates)
  getDocs         // Executes a query and returns all matching documents at once
} from 'firebase/firestore';

// ─── USER OPERATIONS ──────────────────────────────

/*
 * FUNCTION: createUserProfile
 * ----------------------------
 * Creates a new user profile document in the "users" collection.
 * Called after a user signs up via Firebase Auth.
 *
 * The document ID is set to the user's Firebase Auth UID, which links
 * their authentication account to their profile data.
 *
 * PARAMETERS:
 * - uid: The user's Firebase Auth unique ID
 * - userData: Object containing { firstName, lastName, email, studentId, role }
 *
 * USED BY: Could be used as an alternative to authService's registerUser
 */
export async function createUserProfile(uid, userData) {
  await setDoc(doc(db, 'users', uid), {
    _id: uid,                                        // Store the UID inside the document too
    name: userData.firstName + ' ' + userData.lastName, // Full name combined
    firstName: userData.firstName,                    // First name
    lastName: userData.lastName,                      // Last name
    email: userData.email,                            // Email address
    studentId: userData.studentId,                    // Roll number
    role: userData.role || 'student',                 // Default to 'student' if not specified
    createdAt: serverTimestamp(),                     // Use server time for consistency
  })
}

/*
 * FUNCTION: getUserProfile
 * -------------------------
 * Fetches a single user's profile from the database.
 *
 * PARAMETER: uid — The user's Firebase Auth UID
 * RETURNS: The user profile data object, or null if not found
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  // If the document exists, return it with its ID included.
  // The "spread operator" (...) copies all fields from snap.data() into a new object.
  if (snap.exists()) return { _id: snap.id, ...snap.data() }
  return null
}

// ─── MOVIE OPERATIONS ─────────────────────────────

/*
 * FUNCTION: suggestMovie
 * -----------------------
 * A student suggests a new movie to be added to future polls.
 * The movie starts as "not approved" (isApproved: false).
 * An admin must approve it before it can appear in a poll.
 *
 * PARAMETERS:
 * - userId: The UID of the student suggesting the movie
 * - movieData: Object with { title, genre, language, duration, posterUrl, description }
 *
 * RETURNS: The auto-generated document ID of the new movie
 * USED BY: SuggestScreen.js
 */
export async function suggestMovie(userId, movieData) {
  // addDoc creates a new document with a random auto-generated ID
  const ref = await addDoc(collection(db, 'movies'), {
    ...movieData,                // Spread all movie details (title, genre, etc.)
    suggestedBy: userId,         // Record WHO suggested it
    isApproved: false,           // Not approved yet — admin must review
    createdAt: serverTimestamp(), // When it was suggested
  })
  return ref.id  // Return the new document's ID
}

/*
 * FUNCTION: approveMovie
 * -----------------------
 * Admin approves a movie suggestion, making it available for polls.
 * Simply updates the isApproved field to true.
 *
 * PARAMETER: movieId — The document ID of the movie to approve
 * USED BY: AdminMovies.js, SuggestScreen.js (admin view)
 */
export async function approveMovie(movieId) {
  await updateDoc(doc(db, 'movies', movieId), {
    isApproved: true,
  })
}

/*
 * FUNCTION: getApprovedMovies
 * ----------------------------
 * Fetches ALL movies that have been approved by an admin.
 * These are the movies available to be included in polls.
 *
 * NOTE: We don't use orderBy here to avoid needing a "composite index"
 * in Firestore (which requires manual setup in the Firebase console).
 *
 * RETURNS: Array of approved movie objects
 * USED BY: StudentHome.js, AdminManagePolls.js, VotingResults.js
 */
export async function getApprovedMovies() {
  try {
    // Build a query: FROM 'movies' collection WHERE isApproved == true
    const q = query(
      collection(db, 'movies'),
      where('isApproved', '==', true)
    )
    // Execute the query and get all matching documents
    const snap = await getDocs(q)
    // Convert each document to a plain object with its ID included
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getApprovedMovies error:', err.message);
    return [];  // Return empty array on error so the app doesn't crash
  }
}

/*
 * FUNCTION: getMoviesByUser
 * --------------------------
 * Fetches all movies suggested by a specific user.
 * Used on the student's profile and suggestion screen to show "Your Suggestions".
 *
 * PARAMETER: userId — The UID of the student
 * RETURNS: Array of movie objects suggested by this user
 * USED BY: SuggestScreen.js, StudentProfile.js, StudentDashboard.js
 */
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

/*
 * FUNCTION: rejectMovie
 * ----------------------
 * Admin rejects/deletes a movie suggestion permanently.
 * The movie document is completely removed from the database.
 *
 * PARAMETER: movieId — The document ID of the movie to delete
 * USED BY: AdminMovies.js, SuggestScreen.js (admin view)
 */
export async function rejectMovie(movieId) {
  await deleteDoc(doc(db, 'movies', movieId))
}

/*
 * FUNCTION: getPendingMovies
 * ---------------------------
 * Fetches all movies that are NOT yet approved (waiting for admin review).
 * Used on the admin panel to show the list of suggestions to review.
 *
 * RETURNS: Array of unapproved movie objects
 * USED BY: AdminMovies.js, AdminHome.js, SuggestScreen.js (admin view)
 */
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

/*
 * FUNCTION: createPoll
 * ---------------------
 * Admin creates a new voting poll. Students will see this poll and can
 * vote for their preferred movie from the list.
 *
 * PARAMETERS:
 * - adminId: The UID of the admin creating the poll
 * - pollData: Object with { title, movieIds } where movieIds is an array
 *             of approved movie document IDs
 *
 * RETURNS: The auto-generated document ID of the new poll
 * USED BY: AdminManagePolls.js
 */
export async function createPoll(adminId, pollData) {
  const ref = await addDoc(collection(db, 'polls'), {
    ...pollData,                 // title, movieIds, etc.
    status: 'active',            // New polls are immediately active (voting is open)
    totalVotes: 0,               // Start with zero votes
    winnerMovieId: '',           // No winner yet (set when poll closes)
    createdBy: adminId,          // Who created it
    createdAt: serverTimestamp(), // When it was created
  })
  return ref.id
}

/*
 * FUNCTION: subscribeToActivePoll — REAL-TIME LISTENER
 * -----------------------------------------------------
 * Sets up a LIVE connection to Firestore that watches for the currently
 * active poll. Whenever the active poll changes (created, closed, updated),
 * the callback function is called automatically with the latest data.
 *
 * This is what makes the "LIVE POLL" feature work — when an admin creates
 * or closes a poll, ALL students see the change instantly.
 *
 * HOW REAL-TIME LISTENERS WORK:
 * Instead of the app asking "is there a new poll?" every few seconds,
 * Firestore PUSHES updates to the app whenever data changes.
 * It's like subscribing to a YouTube channel — you get notified of new videos
 * instead of checking the channel page every hour.
 *
 * PARAMETER: callback — A function that receives the active poll data
 *            (or null if no poll is active)
 *
 * RETURNS: An "unsubscribe" function. Call this to STOP listening
 *          (important for cleanup when a screen is closed).
 *
 * USED BY: StudentDashboard.js, StudentHome.js, AdminHome.js, AdminDashboard.js,
 *          AdminManagePolls.js, VotingResults.js
 */
export function subscribeToActivePoll(callback) {
  // Query: FROM 'polls' WHERE status == 'active'
  const q = query(
    collection(db, 'polls'),
    where('status', '==', 'active')
  )
  // onSnapshot sets up the real-time listener.
  // It returns an "unsubscribe" function that we pass back to the caller.
  return onSnapshot(q, {
    // "next" is called every time the data changes (or on initial load)
    next: (snap) => {
      // Convert all matching documents to objects
      const polls = snap.docs.map(d => ({ _id: d.id, ...d.data() }))
      console.log("Active Polls found:", polls.length);
      // We only expect ONE active poll at a time, so return the first one
      // (or null if no active polls exist)
      callback(polls[0] || null)
    },
    // "error" is called if the listener fails (e.g., permission denied)
    error: (error) => {
      console.error("🔥 Firestore: subscribeToActivePoll failed!", {
        message: error.message,
        code: error.code,
        hint: "Check if your Firestore Security Rules allow reading from 'polls' collection."
      });
      callback(null);  // Return null so the app shows "no active poll"
    }
  })
}

/*
 * FUNCTION: closePoll
 * --------------------
 * Admin closes/ends a poll. This stops students from voting.
 * The winning movie can optionally be set.
 *
 * PARAMETERS:
 * - pollId: The document ID of the poll to close
 * - winnerMovieId: The ID of the winning movie (can be empty string)
 *
 * USED BY: AdminManagePolls.js
 */
export async function closePoll(pollId, winnerMovieId) {
  await updateDoc(doc(db, 'polls', pollId), {
    status: 'closed',            // Change status from 'active' to 'closed'
    winnerMovieId: winnerMovieId, // Record the winner (if any)
  })
}

// ─── VOTE OPERATIONS ──────────────────────────────

/*
 * FUNCTION: submitVote
 * ---------------------
 * A student casts their vote for a movie in a poll.
 *
 * IMPORTANT: Each student can only vote ONCE per poll. This is enforced by
 * using "{userId}_{pollId}" as the vote document ID. If they try to vote
 * again, the function detects the existing vote and throws an error.
 *
 * ALSO: After saving the vote, it increments the poll's totalVotes counter.
 * The increment() function is "atomic" — safe for many simultaneous votes.
 *
 * PARAMETERS:
 * - userId: The UID of the student voting
 * - pollId: The ID of the poll they're voting in
 * - movieId: The ID of the movie they're voting for
 *
 * RETURNS: The vote document ID (format: "userId_pollId")
 * USED BY: StudentHome.js
 */
export async function submitVote(userId, pollId, movieId) {
  // Create a unique vote ID by combining userId and pollId
  // This ensures one vote per user per poll
  const voteId = userId + '_' + pollId
  const voteRef = doc(db, 'votes', voteId)

  // CHECK: Has this user already voted in this poll?
  const existing = await getDoc(voteRef)
  if (existing.exists()) {
    throw new Error('You have already voted in this poll.')
  }

  // SAVE the vote document
  await setDoc(voteRef, {
    _id: voteId,
    userId: userId,
    pollId: pollId,
    movieId: movieId,
    createdAt: serverTimestamp(),
  })

  // INCREMENT the poll's total vote count by 1.
  // increment() is atomic — even if 100 people vote at the exact same time,
  // every vote is counted correctly (no race conditions).
  await updateDoc(doc(db, 'polls', pollId), {
    totalVotes: increment(1),
  })

  return voteId
}

/*
 * FUNCTION: getUserVote
 * ----------------------
 * Checks if a specific user has already voted in a specific poll.
 *
 * RETURNS: The vote data object if they voted, or null if they haven't.
 * USED BY: StudentHome.js (to show "You already voted" message)
 */
export async function getUserVote(userId, pollId) {
  const voteId = userId + '_' + pollId
  const snap = await getDoc(doc(db, 'votes', voteId))
  if (snap.exists()) return snap.data()
  return null
}

/*
 * FUNCTION: subscribeToVoteCounts — REAL-TIME VOTE COUNTER
 * ---------------------------------------------------------
 * Sets up a LIVE listener that counts votes for each movie in a poll.
 * Every time someone votes, this listener recalculates the counts
 * and calls the callback with updated numbers.
 *
 * This is what powers the "live vote count" feature — vote bars update
 * in real-time as people vote.
 *
 * HOW IT COUNTS:
 * It reads ALL vote documents for this poll, then groups them by movieId
 * and counts how many votes each movie has.
 *
 * PARAMETER: pollId — The ID of the poll to watch
 * PARAMETER: callback — Function that receives a counts object like:
 *            { "movieId1": 15, "movieId2": 23, "movieId3": 8 }
 *
 * RETURNS: An unsubscribe function (call to stop listening)
 * USED BY: StudentHome.js, VotingResults.js, AdminDashboard.js
 */
export function subscribeToVoteCounts(pollId, callback) {
  const q = query(
    collection(db, 'votes'),
    where('pollId', '==', pollId)
  )
  return onSnapshot(q, {
    next: (snap) => {
      // Build a counts object: { movieId: numberOfVotes }
      const counts = {}
      snap.docs.forEach(d => {
        const { movieId } = d.data()  // Get which movie this vote is for
        counts[movieId] = (counts[movieId] || 0) + 1  // Add 1 to that movie's count
      })
      callback(counts)
    },
    error: (error) => {
      console.error("🔥 Firestore: subscribeToVoteCounts failed!", {
        message: error.message,
        code: error.code,
        hint: "Check if your Firestore Security Rules allow reading from 'votes' collection."
      });
      callback({});  // Return empty counts on error
    }
  })
}

// ─── BOOKING OPERATIONS ──────────────────────────────

/*
 * FUNCTION: bookSeat
 * -------------------
 * A student books seats for a movie screening event.
 *
 * CHECKS: Prevents double-booking — if the user already booked for this
 * event, it throws an error.
 *
 * ALSO: After booking, it increments the event's bookedSeats counter
 * by the number of seats booked.
 *
 * PARAMETERS:
 * - userId: The UID of the student booking
 * - eventId: The ID of the event they're booking for
 * - seatCount: How many seats to book (1-4)
 *
 * RETURNS: The auto-generated booking document ID
 * USED BY: BookSeats.js
 */
export async function bookSeat(userId, eventId, seatCount) {
  // CHECK: Has this user already booked for this event?
  const existingQ = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    where('eventId', '==', eventId)
  );
  const existing = await getDocs(existingQ);
  if (!existing.empty) throw new Error('You have already booked for this event.');

  // CREATE the booking document
  const bookingRef = await addDoc(collection(db, 'bookings'), {
    userId,
    eventId,
    seatCount,
    status: 'confirmed',          // Booking is immediately confirmed
    createdAt: serverTimestamp(),
  });

  // UPDATE the event's booked seat count
  // increment(seatCount) safely adds the number of seats booked
  await updateDoc(doc(db, 'events', eventId), {
    bookedSeats: increment(seatCount),
  });

  return bookingRef.id;
}

/*
 * FUNCTION: getUserBooking
 * -------------------------
 * Checks if a user has already booked seats for a specific event.
 *
 * RETURNS: The booking data if found, or null if they haven't booked.
 * USED BY: BookSeats.js (to show "Already Booked" state)
 */
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

/*
 * FUNCTION: subscribeToEvent — REAL-TIME EVENT LISTENER
 * ------------------------------------------------------
 * Watches a single event document for live updates.
 * When someone books seats, the event's bookedSeats count updates,
 * and this listener fires so the screen can show the updated count.
 *
 * PARAMETER: eventId — The ID of the event to watch
 * PARAMETER: callback — Function that receives the event data (or null)
 *
 * RETURNS: An unsubscribe function
 * USED BY: BookSeats.js
 */
export function subscribeToEvent(eventId, callback) {
  return onSnapshot(doc(db, 'events', eventId), {
    next: (snap) => {
      if (snap.exists()) callback({ _id: snap.id, ...snap.data() })
      else callback(null)
    },
    error: (error) => {
      console.log("subscribeToEvent error:", error.message);
      callback(null);
    }
  })
}

/*
 * FUNCTION: getPastEvents
 * ------------------------
 * Fetches all events that have been completed (past movie nights).
 * Used on the Event History screen.
 *
 * RETURNS: Array of completed event objects
 * USED BY: EventHistory.js, StudentDashboard.js
 */
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

/*
 * FUNCTION: getUserAttendedEvents
 * --------------------------------
 * Gets a list of event IDs that a specific user has booked/attended.
 * Used to mark which past events the student participated in.
 *
 * PARAMETER: userId — The UID of the student
 * RETURNS: Array of event ID strings
 * USED BY: EventHistory.js
 */
export async function getUserAttendedEvents(userId) {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('status', '==', 'confirmed')
    )
    const snap = await getDocs(q)
    // Return only the eventId from each booking (not the full booking data)
    return snap.docs.map(d => d.data().eventId)
  } catch (err) {
    console.log('getUserAttendedEvents error:', err.message);
    return [];
  }
}

// ─── ADMIN DASHBOARD OPERATIONS ──────────────────────────────

/*
 * FUNCTION: getAdminStats
 * ------------------------
 * Fetches summary statistics for the admin dashboard:
 *   - Total registered users
 *   - Number of active polls
 *   - Total events scheduled
 *   - Seats booked vs remaining
 *
 * Each query is wrapped in its own try/catch so that if one fails,
 * the others still work. This is important because some collections
 * might not exist yet or might have permission issues.
 *
 * RETURNS: Object with { totalUsers, activePolls, eventsScheduled, seatsBooked, seatsRemaining }
 * USED BY: AdminDashboard.js
 */
export async function getAdminStats() {
  let totalUsers = 0, activePolls = 0, eventsScheduled = 0, seatsBooked = 0, seatsRemaining = 0;

  // Count total registered users
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    totalUsers = usersSnap.size;  // .size gives the number of documents
  } catch (e) { console.log('Stats: users error', e.message); }

  // Count active polls
  try {
    const pollsSnap = await getDocs(query(collection(db, 'polls'), where('status', '==', 'active')));
    activePolls = pollsSnap.size;
  } catch (e) { console.log('Stats: polls error', e.message); }

  // Count events and calculate seat availability
  try {
    const eventsSnap = await getDocs(collection(db, 'events'));
    eventsScheduled = eventsSnap.size;
    // Sum up all totalSeats across all events
    // .reduce() is an array method that accumulates a value by running
    // a function on each item. Here it sums all totalSeats values.
    const totalSeats = eventsSnap.docs.reduce((sum, d) => sum + (d.data().totalSeats || 0), 0);

    // Sum up all booked seats from the bookings collection
    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    seatsBooked = bookingsSnap.docs.reduce((sum, d) => sum + (d.data().seatCount || 0), 0);
    seatsRemaining = totalSeats - seatsBooked;
  } catch (e) { console.log('Stats: events/bookings error', e.message); }

  return { totalUsers, activePolls, eventsScheduled, seatsBooked, seatsRemaining };
}

/*
 * FUNCTION: getFlaggedUsers
 * --------------------------
 * Fetches all unresolved moderation flags (reports of bad behavior).
 * Flags are created when a user is reported for spam, inappropriate
 * suggestions, or other rule violations.
 *
 * RETURNS: Array of flag objects with { username, reason, severity, userId, etc. }
 * USED BY: AdminDashboard.js
 */
export async function getFlaggedUsers() {
  try {
    const q = query(
      collection(db, 'flags'),
      where('resolved', '==', false)  // Only get unresolved (pending) flags
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ _id: d.id, ...d.data() }))
  } catch (err) {
    console.log('getFlaggedUsers error:', err.message);
    return [];
  }
}

/*
 * FUNCTION: banUser
 * ------------------
 * Bans a user by their userId. First tries to use the backend API
 * (which can disable their Firebase Auth account). If the backend is
 * not running, falls back to directly updating their status in Firestore.
 *
 * FALLBACK EXPLAINED:
 * The ideal way to ban a user is through the backend (which uses Firebase
 * Admin SDK to disable their auth account). But if the backend server isn't
 * running (during development), we fall back to just marking them as "banned"
 * in Firestore. They can still technically log in, but the app can check
 * their status and block access.
 *
 * PARAMETER: userId — The UID of the user to ban
 * USED BY: AdminDashboard.js, AdminStudents.js
 */
export async function banUser(userId) {
  try {
    // Try the backend API first (proper way — disables auth account)
    const result = await banUserAPI(userId);
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (err) {
    // If backend is not running, fall back to direct Firestore update
    // This just sets a 'banned' status field on the user's document
    console.log('Backend ban failed, updating Firestore directly:', err.message);
    await updateDoc(doc(db, 'users', userId), { status: 'banned' });
  }
}
