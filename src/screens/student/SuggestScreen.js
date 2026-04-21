import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { 
  suggestMovie, 
  getPendingMovies, 
  getMoviesByUser,
  approveMovie,
  rejectMovie
} from '../../services/firestoreService';

const GENRES = ['Action', 'Adventure', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Romance', 'Thriller', 'Animation'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Korean', 'Japanese', 'French'];

export default function SuggestScreen() {
  const navigation = useNavigation();
  const { user, userProfile } = useAuth();
  
  // Form State
  const [movieName, setMovieName] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [movieNameFocused, setMovieNameFocused] = useState(false);
  const [durationFocused, setDurationFocused] = useState(false);

  // Admin View & Suggestions State
  const [showAdminView, setShowAdminView] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'organizer';

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      if (isAdmin) {
        const pending = await getPendingMovies();
        setSuggestions(pending);
      } else if (user?.uid) {
        const userMovies = await getMoviesByUser(user.uid);
        setSuggestions(userMovies);
      }
    } catch (err) {
      console.log('Error fetching suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [isAdmin, user?.uid, showAdminView]);

  async function handleSubmit() {
    if (!movieName.trim()) {
      Alert.alert('Missing Field', 'Please enter the movie name.');
      return;
    }
    if (!genre) {
      Alert.alert('Missing Field', 'Please select a genre.');
      return;
    }
    if (!language) {
      Alert.alert('Missing Field', 'Please select a language.');
      return;
    }
    if (!duration || isNaN(duration)) {
      Alert.alert('Missing Field', 'Please enter a valid duration in minutes.');
      return;
    }

    setLoading(true);
    try {
      await suggestMovie(user.uid, {
        title: movieName.trim(),
        genre: genre,
        language: language,
        duration: duration + ' min',
        posterUrl: '',
        description: '',
      });
      Alert.alert(
        '🎬 Suggestion Submitted!',
        'Your movie has been sent to the admin for approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (movieId) => {
    try {
      await approveMovie(movieId);
      setSuggestions(prev => prev.filter(m => m._id !== movieId));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReject = async (movieId) => {
    try {
      await rejectMovie(movieId);
      setSuggestions(prev => prev.filter(m => m._id !== movieId));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#05050d" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Suggest a Movie</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.separator} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={{ fontSize: 20 }}>🎬</Text>
            <Text style={styles.cardHeaderText}>Movie Details</Text>
          </View>

          {/* MOVIE NAME */}
          <Text style={styles.label}>MOVIE NAME</Text>
          <TextInput
            style={[styles.textInput, movieNameFocused && styles.inputFocused]}
            placeholder="e.g. The Dark Knight"
            placeholderTextColor="#6b6b88"
            value={movieName}
            onChangeText={setMovieName}
            onFocus={() => setMovieNameFocused(true)}
            onBlur={() => setMovieNameFocused(false)}
          />

          {/* GENRE */}
          <Text style={styles.label}>GENRE</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn} 
            onPress={() => {
              setShowGenreDropdown(!showGenreDropdown);
              setShowLanguageDropdown(false);
            }}
          >
            <Text style={[styles.dropdownTxt, { color: genre ? '#ffffff' : '#6b6b88' }]}>
              {genre || 'Select genre...'}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
          {showGenreDropdown && (
            <View style={styles.dropdownListContainer}>
              {GENRES.map((item, index) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.dropdownItem, index === GENRES.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setGenre(item);
                    setShowGenreDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemTxt, genre === item && styles.dropdownItemSelectedTxt]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* LANGUAGE */}
          <Text style={styles.label}>LANGUAGE</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn} 
            onPress={() => {
              setShowLanguageDropdown(!showLanguageDropdown);
              setShowGenreDropdown(false);
            }}
          >
            <Text style={[styles.dropdownTxt, { color: language ? '#ffffff' : '#6b6b88' }]}>
              {language || 'Select language...'}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
          {showLanguageDropdown && (
            <View style={styles.dropdownListContainer}>
              {LANGUAGES.map((item, index) => (
                <TouchableOpacity 
                  key={item} 
                  style={[styles.dropdownItem, index === LANGUAGES.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setLanguage(item);
                    setShowLanguageDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemTxt, language === item && styles.dropdownItemSelectedTxt]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* DURATION */}
          <Text style={styles.label}>DURATION (MINUTES)</Text>
          <TextInput
            style={[styles.textInput, durationFocused && styles.inputFocused]}
            placeholder="e.g. 152"
            placeholderTextColor="#6b6b88"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            onFocus={() => setDurationFocused(true)}
            onBlur={() => setDurationFocused(false)}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitBtnWrapper}>
            <LinearGradient colors={['#ff3c3c', '#ff8c42']} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>SUBMIT SUGGESTION</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ADMIN VIEW TOGGLE BANNER */}
        {isAdmin && (
          <TouchableOpacity style={styles.adminBanner} onPress={() => setShowAdminView(!showAdminView)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeTxt}>ADMIN VIEW</Text>
              </View>
              <Text style={styles.adminBannerSub}>
                {showAdminView ? "Approve / Reject controls visible" : "Tap to show admin controls"}
              </Text>
            </View>
            <Text style={{ color: '#6b6b88', fontSize: 12 }}>{showAdminView ? "▲" : "▼"}</Text>
          </TouchableOpacity>
        )}

        {/* SUGGESTIONS LIST HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SUGGESTIONS ({suggestions.length})</Text>
          <Text style={styles.sectionSubtitle}>
            {isAdmin ? "Pending approval" : "Your submissions"}
          </Text>
        </View>

        {/* SUGGESTION CARDS */}
        {loadingSuggestions ? (
          <ActivityIndicator color="#ff3c3c" style={{ marginTop: 20 }} />
        ) : (
          suggestions.map((movie) => (
            <View key={movie._id} style={styles.suggestionCard}>
              <View style={styles.suggestionRow}>
                <View style={styles.poster}>
                  <Text style={{ fontSize: 20 }}>🎬</Text>
                </View>
                
                <View style={styles.infoBlock}>
                  <Text style={styles.movieTitle}>{movie.title}</Text>
                  <View style={styles.tagsRow}>
                    {movie.genre && <View style={styles.tag}><Text style={styles.tagText}>{movie.genre}</Text></View>}
                    {movie.language && <View style={styles.tag}><Text style={styles.tagText}>{movie.language}</Text></View>}
                  </View>
                  <Text style={styles.movieDuration}>{movie.duration}</Text>
                  
                  {/* Status Badge (if student view) */}
                  {!isAdmin && (
                    <View style={movie.isApproved ? styles.statusApproved : styles.statusPending}>
                      <Text style={movie.isApproved ? styles.statusApprovedTxt : styles.statusPendingTxt}>
                        {movie.isApproved ? "Approved" : "Pending"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Admin Actions */}
                {showAdminView && isAdmin && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(movie._id)}>
                      <Text style={styles.approveBtnTxt}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(movie._id)}>
                      <Text style={styles.rejectBtnTxt}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05050d',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#0a0a0f',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  backButtonText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  spacer: {
    width: 36,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  formCard: {
    backgroundColor: '#1c1c2e',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 20,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b6b88',
    letterSpacing: 1.5,
    marginBottom: 6,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#ffffff',
  },
  inputFocused: {
    borderColor: '#ff3c3c',
  },
  dropdownBtn: {
    backgroundColor: '#12121a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTxt: {
    fontSize: 15,
  },
  chevron: {
    fontSize: 12,
    color: '#6b6b88',
  },
  dropdownListContainer: {
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemTxt: {
    fontSize: 14,
    color: '#ffffff',
  },
  dropdownItemSelectedTxt: {
    color: '#ff3c3c',
    fontWeight: '600',
  },
  submitBtnWrapper: {
    marginTop: 24,
  },
  submitBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  adminBanner: {
    backgroundColor: '#1c1c2e',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminBadge: {
    backgroundColor: '#ff3c3c',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  adminBadgeTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  adminBannerSub: {
    fontSize: 13,
    color: '#6b6b88',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
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
  suggestionCard: {
    backgroundColor: '#1c1c2e',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
  },
  suggestionRow: {
    flexDirection: 'row',
  },
  poster: {
    width: 56,
    height: 72,
    backgroundColor: '#12121a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBlock: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#0a0a0f',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#aaaaaa',
  },
  movieDuration: {
    fontSize: 12,
    color: '#6b6b88',
    marginTop: 4,
  },
  statusPending: {
    backgroundColor: 'rgba(255,209,102,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.2)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusPendingTxt: {
    color: '#ffd166',
    fontSize: 11,
  },
  statusApproved: {
    backgroundColor: 'rgba(0,200,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,100,0.2)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusApprovedTxt: {
    color: '#00c864',
    fontSize: 11,
  },
  adminActions: {
    justifyContent: 'center',
    gap: 6,
    marginLeft: 10,
  },
  approveBtn: {
    backgroundColor: 'rgba(0,200,100,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,100,0.25)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  approveBtnTxt: {
    color: '#00c864',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectBtn: {
    backgroundColor: 'rgba(255,60,60,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,60,60,0.25)',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  rejectBtnTxt: {
    color: '#ff3c3c',
    fontSize: 12,
    fontWeight: '600',
  },
});
