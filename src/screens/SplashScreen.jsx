/*
 * ============================================================================
 * FILE: SplashScreen.jsx — THE WELCOME / LANDING SCREEN
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This is the FIRST screen users see when they open the app. It serves as
 * a "welcome page" that:
 *   - Shows the app branding (MovieNight logo + movie emoji)
 *   - Displays 3 feature cards explaining what the app does
 *   - Has a "Get Started" button that takes users to the Login screen
 *   - Shows a decorative film strip at the top for the cinema theme
 *   - Plays a pulsing dot animation for visual appeal
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "Animated": React Native's animation system. It lets you create smooth
 *   visual transitions (fade, move, scale) without choppy frame-by-frame updates.
 *
 * - "Animated.Value": A special number that can change smoothly over time.
 *   Instead of jumping from 0 to 1 instantly, it transitions gradually.
 *
 * - "Animated.loop + Animated.sequence": Creates a repeating animation.
 *   "sequence" runs animations one after another (fade in, then fade out).
 *   "loop" repeats that sequence forever.
 *
 * - "useRef": A React hook that holds a value that persists between renders
 *   (screen refreshes). Used here to keep the animation value stable.
 *
 * - "useNativeDriver: true": Tells React Native to run the animation on the
 *   phone's GPU (graphics chip) instead of JavaScript. This makes animations
 *   much smoother (60 fps vs potentially janky).
 *
 * - "LinearGradient": A component that displays a smooth color transition
 *   (gradient). Used here for the "Get Started" button (red to orange).
 *
 * - "FeatureCard": A small sub-component defined INSIDE this file.
 *   It shows an emoji icon, a bold highlight word, and descriptive text.
 *   (A "sub-component" or "inner component" is a small component only
 *   used within this file, not shared with other files.)
 *
 * - "[...Array(6)]": Creates an array with 6 empty slots, used to render
 *   6 identical film hole decorations without writing each one manually.
 *
 * CONNECTIONS:
 * -----------
 * - Route name: 'Splash' (the initial route in AppNavigator.jsx)
 * - Navigates to: 'Login' screen when "Get Started" is pressed
 * - This is the first screen users see (initialRouteName in AppNavigator)
 */

// React and hooks:
// useEffect: Runs code when the component first appears (starts the animation)
// useRef: Holds the animation value persistently across re-renders
import React, { useEffect, useRef } from 'react';

// React Native components used in this screen
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';

// SafeAreaView: Prevents content from being hidden behind the notch or status bar
import { SafeAreaView } from 'react-native-safe-area-context';

// LinearGradient: Creates a gradient (color transition) effect.
// Used for the "Get Started" button (red → orange gradient).
import { LinearGradient } from 'expo-linear-gradient';

/*
 * THE SPLASH SCREEN COMPONENT
 * ----------------------------
 * Receives `navigation` as a prop from React Navigation.
 * This is how screens navigate to each other — by calling
 * navigation.navigate('ScreenName').
 */
export default function SplashScreen({ navigation }) {
    /*
     * PULSE ANIMATION SETUP
     * ----------------------
     * Creates an Animated.Value that will smoothly transition between 0 and 1.
     * This value controls the opacity (transparency) of the decorative dots.
     *
     * useRef ensures the animated value isn't recreated on every re-render.
     * .current gives us the actual Animated.Value.
     */
    const pulseAnim = useRef(new Animated.Value(0)).current;

    /*
     * START THE PULSE ANIMATION
     * --------------------------
     * useEffect with [] runs ONCE when the screen first appears.
     *
     * The animation:
     *   1. Fade the dots in (0 → 1) over 1000ms (1 second)
     *   2. Fade the dots out (1 → 0) over 1000ms
     *   3. Repeat forever (Animated.loop)
     *
     * This creates a gentle "breathing" pulse effect on the dots below the title.
     */
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                // Fade in: opacity goes from 0 (invisible) to 1 (fully visible)
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true, // Uses GPU for smooth animation
                }),
                // Fade out: opacity goes from 1 back to 0
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start(); // .start() actually begins the animation
    }, []);

    /*
     * FEATURE CARD — A SMALL REUSABLE SUB-COMPONENT
     * -----------------------------------------------
     * This is a tiny component defined inside SplashScreen.
     * It displays one feature of the app as a card with:
     *   - An emoji icon (icon)
     *   - A bold highlighted word (highlight)
     *   - Descriptive text (title)
     *
     * Example: icon="🗳️" highlight="Vote" title="for your favourite movie"
     * Shows as: 🗳️ **Vote** for your favourite movie
     */
    const FeatureCard = ({ icon, title, highlight }) => (
        <View style={styles.featureCard}>
            {/* Icon container */}
            <View style={styles.iconBox}><Text style={{ fontSize: 20 }}>{icon}</Text></View>
            {/* Text with the bold highlight word followed by the description */}
            <Text style={styles.featureText}>
                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{highlight}</Text> {title}
            </Text>
        </View>
    );

    /*
     * THE SCREEN UI
     * --------------
     * Structure:
     *   SafeAreaView (dark background, handles notches)
     *     Film Strip (decorative cinema-style strip at top)
     *     Content Area:
     *       Logo Section (emoji, "MOVIE NIGHT", subtitle, pulsing dots)
     *       Features Section (3 feature cards)
     *       Footer Section ("Get Started" button + credits)
     */
    return (
        <SafeAreaView style={styles.container}>
            {/* ── FILM STRIP DECORATION ── */}
            {/* A decorative strip at the top mimicking a movie film reel */}
            {/* Creates 6 dark "holes" on a gray strip (like a film negative) */}
            <View style={styles.filmStrip}>
                {[...Array(6)].map((_, i) => <View key={i} style={styles.filmHole} />)}
            </View>

            <View style={styles.content}>
                {/* ── LOGO SECTION ── */}
                <View style={styles.logoContainer}>
                    {/* Movie emoji with a glowing background */}
                    <View style={styles.iconGlow}>
                        <Text style={styles.mainIcon}>🎬</Text>
                    </View>
                    {/* App name: "MOVIE" in white + "NIGHT" in red */}
                    <View style={styles.titleRow}>
                        <Text style={styles.titleMovie}>MOVIE</Text>
                        <Text style={styles.titleNight}>NIGHT</Text>
                    </View>
                    {/* Subtitle below the app name */}
                    <Text style={styles.subtitle}>CAMPUS MOVIE POLL</Text>
                    
                    {/* Pulsing Dots — decorative animated dots below the subtitle */}
                    <View style={styles.dotsRow}>
                        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                        <Animated.View style={[styles.dot, { opacity: pulseAnim, animationDelay: '0.2s', backgroundColor: '#ff3c3c' }]} />
                        <Animated.View style={[styles.dot, { opacity: pulseAnim, animationDelay: '0.4s' }]} />
                    </View>
                </View>

                {/* ── FEATURES SECTION ── */}
                {/* Three cards explaining the app's main features */}
                <View style={styles.featuresContainer}>
                    <FeatureCard icon="🗳️" highlight="Vote" title="for your favourite movie" />
                    <FeatureCard icon="📊" highlight="Live results" title="with charts" />
                    <FeatureCard icon="🎟️" highlight="Book seats" title="for movie nights" />
                </View>

                {/* ── FOOTER SECTION ── */}
                <View style={styles.footer}>
                    {/* "Get Started" button with a red-to-orange gradient */}
                    {/* When pressed, navigates to the Login screen */}
                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
                        <LinearGradient 
                            colors={['#ff3c3c', '#ff8c42']} 
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Get Started →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    {/* Credits footer */}
                    <Text style={styles.footerText}>By PST-25-0122 & PST-25-0283</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

/*
 * STYLES
 * -------
 * All visual styles for the Splash Screen.
 * Uses a dark cinema theme with red accents.
 */
const styles = StyleSheet.create({
    // Main container: full screen, dark background
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    // Film strip at top: horizontal row of "holes" on a dark strip
    filmStrip: { height: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#111', opacity: 0.5, borderBottomWidth: 1, borderColor: '#222' },
    // Each film hole (dark rectangles on the strip)
    filmHole: { width: 40, height: 20, backgroundColor: '#0a0a0f', borderRadius: 4 },
    // Main content area with padding and spacing
    content: { flex: 1, padding: 28, justifyContent: 'space-between', marginTop: 40 },
    // Logo section: centered alignment
    logoContainer: { alignItems: 'center' },
    // Glow effect behind the movie emoji — dark box with red shadow
    iconGlow: { backgroundColor: '#1a1a26', padding: 20, borderRadius: 24, shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20, marginBottom: 24 },
    // The main 🎬 emoji
    mainIcon: { fontSize: 60, alignSelf: 'center' },
    // Row for "MOVIE" and "NIGHT" side by side
    titleRow: { flexDirection: 'row' },
    // "MOVIE" text: white, bold, condensed font
    titleMovie: { fontSize: 48, color: '#fff', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'sans-serif-condensed', letterSpacing: 2 },
    // "NIGHT" text: red, bold, condensed font
    titleNight: { fontSize: 48, color: '#ff3c3c', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'sans-serif-condensed', letterSpacing: 2 },
    // Subtitle: muted gray, wide letter spacing
    subtitle: { color: '#6b6b88', fontSize: 14, letterSpacing: 4, marginTop: 8 },
    // Pulsing dots row: three small circles
    dotsRow: { flexDirection: 'row', marginTop: 30, gap: 8 },
    // Individual dot: small gray circle
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6b6b88' },
    // Features section: vertical list with spacing
    featuresContainer: { gap: 16, marginVertical: 40 },
    // Each feature card: horizontal layout with icon + text
    featureCard: { flexDirection: 'row', backgroundColor: '#1a1a26', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    // Icon box: small dark square holding the emoji
    iconBox: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    // Feature text: muted gray
    featureText: { color: '#6b6b88', fontSize: 15 },
    // "Get Started" button: gradient with shadow glow effect
    button: { padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
    // Button text: white and bold
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    // Credits text at the bottom: small, centered, muted
    footerText: { color: '#6b6b88', fontSize: 12, textAlign: 'center', marginTop: 24 }
});
