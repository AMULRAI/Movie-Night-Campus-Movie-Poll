/*
 * ============================================================================
 * FILE: LoginScreen.jsx — USER LOGIN FORM
 * ============================================================================
 *
 * WHAT THIS FILE DOES:
 * --------------------
 * This screen shows the login form where users enter their email and password
 * to sign in. It features:
 *   - A hero section with the "MOVIE NIGHT" branding
 *   - Email and password input fields with emoji icons
 *   - A "Forgot password?" link (placeholder, not yet functional)
 *   - A gradient "Sign In" button that shows a loading spinner while authenticating
 *   - A "Sign up" link to navigate to the registration screen
 *
 * TECHNICAL TERMS EXPLAINED:
 * --------------------------
 * - "KeyboardAvoidingView": A component that automatically moves the content
 *   up when the on-screen keyboard appears. Without it, the keyboard would
 *   cover the input fields, making it impossible to see what you're typing.
 *   On iOS it uses 'padding' behavior, on Android it uses 'height' behavior
 *   because the two platforms handle keyboard differently.
 *
 * - "secureTextEntry": A TextInput prop that hides the text with dots (•••)
 *   for password fields, so nobody can see the password over your shoulder.
 *
 * - "keyboardType: 'email-address'": Shows the email-optimized keyboard
 *   (with @ and .com buttons) instead of the regular keyboard.
 *
 * - "autoCapitalize: 'none'": Prevents the keyboard from auto-capitalizing
 *   the first letter (emails should be lowercase).
 *
 * - "navigation.replace('Home')": Navigates to the Home screen but REPLACES
 *   the current screen in the stack (instead of pushing on top). This means
 *   pressing "back" won't return to the login screen (since you're now logged in).
 *
 * - "finally": The "finally" block in try/catch/finally ALWAYS runs, whether
 *   the try succeeded or the catch caught an error. Used here to stop the
 *   loading spinner regardless of login success or failure.
 *
 * CONNECTIONS:
 * -----------
 * - Route name: 'Login' (defined in AppNavigator.jsx)
 * - Navigated to from: SplashScreen.jsx ("Get Started" button)
 * - Uses: loginUser() from authService.js
 * - Navigates to: 'Home' (on success) or 'SignUp' (sign up link)
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation }) {
    // State variables for form inputs and loading indicator
    const [email, setEmail] = useState('');       // Stores the email input
    const [password, setPassword] = useState(''); // Stores the password input
    const [loading, setLoading] = useState(false); // Controls the spinner on the button

    /*
     * LOGIN HANDLER
     * --------------
     * Called when the user taps "Sign In".
     * 1. Validates that both fields are filled in
     * 2. Shows a loading spinner on the button
     * 3. Calls loginUser() from authService to authenticate with Firebase
     * 4. On success: navigates to the Home screen
     * 5. On failure: shows an error alert (e.g., "Wrong password")
     * 6. Always: stops the loading spinner (in the "finally" block)
     */
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        
        setLoading(true);
        try {
            await loginUser(email.trim(), password);
            navigation.replace('Home'); // Replace login screen with Home (can't go back)
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false); // Stop spinner regardless of success/failure
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* KeyboardAvoidingView: Pushes content up when keyboard appears */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* ScrollView: Allows scrolling if content is taller than screen */}
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                    {/* ── HERO SECTION: Gradient header with app branding ── */}
                    <LinearGradient colors={['#3a0c0c', '#0a0a0f']} style={styles.heroSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.titleMovie}>MOVIE</Text>
                            <Text style={styles.titleNight}>NIGHT</Text>
                        </View>
                        <Text style={styles.subtitle}>Campus Movie Poll Platform</Text>
                    </LinearGradient>

                    {/* ── FORM SECTION ── */}
                    <View style={styles.formSection}>
                        <Text style={styles.welcomeTitle}>Welcome back 👋</Text>
                        <Text style={styles.welcomeSub}>Sign in to vote & join movie nights</Text>

                        {/* EMAIL INPUT */}
                        <Text style={styles.label}>STUDENT ID / EMAIL</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>📧</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="student@campus.edu"
                                placeholderTextColor="#6b6b88"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"   // Shows email keyboard with @
                                autoCapitalize="none"          // No auto-capitalization
                            />
                        </View>

                        {/* PASSWORD INPUT */}
                        <Text style={styles.label}>PASSWORD</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#6b6b88"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry                // Hides password text with dots
                            />
                        </View>

                        {/* FORGOT PASSWORD LINK (placeholder) */}
                        <TouchableOpacity style={styles.forgotLink}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>

                        {/* SIGN IN BUTTON with gradient */}
                        <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} style={{ marginTop: 24 }} disabled={loading}>
                            <LinearGradient colors={['#ff3c3c', '#ff8c42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Sign In →</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* SIGN UP LINK — navigates to SignUp screen */}
                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('SignUp')}>
                            <Text style={{ color: '#6b6b88' }}>Don't have an account? <Text style={styles.registerTextRed}>Sign up</Text></Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

/*
 * STYLES — Dark theme login screen with gradient hero section
 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    heroSection: { height: 240, justifyContent: 'flex-end', paddingBottom: 30, alignItems: 'center' },
    titleRow: { flexDirection: 'row' },
    titleMovie: { fontSize: 36, color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
    titleNight: { fontSize: 36, color: '#ff3c3c', fontWeight: 'bold', letterSpacing: 1 },
    subtitle: { color: '#6b6b88', fontSize: 14, marginTop: 4 },
    formSection: { padding: 28, flex: 1 },
    welcomeTitle: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
    welcomeSub: { fontSize: 15, color: '#6b6b88', marginBottom: 32 },
    label: { color: '#6b6b88', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16, letterSpacing: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a26', borderRadius: 16, borderWidth: 1, borderColor: '#2d2d3d', paddingHorizontal: 16, height: 56 },
    inputIcon: { fontSize: 18, marginRight: 12 },
    input: { flex: 1, color: '#fff', fontSize: 16 },
    forgotLink: { alignSelf: 'flex-end', marginTop: 12 },
    forgotText: { color: '#ff3c3c', fontSize: 14, fontWeight: '600' },
    errorText: { color: '#ff3c3c', fontSize: 13, textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
    primaryButton: { padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
    primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    registerLink: { marginTop: 40, alignItems: 'center' },
    registerTextRed: { color: '#ff3c3c', fontWeight: 'bold' }
});
