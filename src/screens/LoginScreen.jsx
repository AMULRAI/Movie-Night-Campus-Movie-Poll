import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            setErrorMessage('Please enter both email and password.');
            return;
        }
        setErrorMessage('');
        navigation.navigate('Home');
    };
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                    {/* Hero Section */}
                    <LinearGradient colors={['#3a0c0c', '#0a0a0f']} style={styles.heroSection}>
                        <View style={styles.marquee}>
                            {/* Simple static mockup of a marquee */}
                            <View style={styles.chip}><Text style={styles.chipText}>🎥 Inception</Text></View>
                            <View style={styles.chip}><Text style={styles.chipText}>🍿 Dune Part 2</Text></View>
                            <View style={styles.chip}><Text style={styles.chipText}>🎬 Interstellar</Text></View>
                        </View>
                        <View style={styles.titleRow}>
                            <Text style={styles.titleMovie}>MOVIE</Text>
                            <Text style={styles.titleNight}>NIGHT</Text>
                        </View>
                        <Text style={styles.subtitle}>Campus Movie Poll Platform</Text>
                    </LinearGradient>

                    <View style={styles.formSection}>
                        <Text style={styles.welcomeTitle}>Welcome back 👋</Text>
                        <Text style={styles.welcomeSub}>Sign in to vote & join movie nights</Text>

                        <Text style={styles.label}>STUDENT ID / EMAIL</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>📧</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="student@campus.edu"
                                placeholderTextColor="#6b6b88"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <Text style={styles.label}>PASSWORD</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#6b6b88"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotLink}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                        <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} style={{ marginTop: errorMessage ? 8 : 24 }}>
                            <LinearGradient colors={['#ff3c3c', '#ff8c42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
                                <Text style={styles.primaryButtonText}>Sign In →</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-google" size={20} color="#4285F4" />
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Ionicons name="logo-apple" size={20} color="#fff" />
                                <Text style={styles.socialText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('SignUp')}>
                            <Text style={{ color: '#6b6b88' }}>Don't have an account? <Text style={styles.registerTextRed}>Sign up</Text></Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    heroSection: { height: 240, justifyContent: 'flex-end', paddingBottom: 30, alignItems: 'center' },
    marquee: { flexDirection: 'row', position: 'absolute', top: 50, opacity: 0.6, gap: 12 },
    chip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2d2d3d' },
    chipText: { color: '#fff', fontSize: 13 },
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
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 32, gap: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#2d2d3d' },
    dividerText: { color: '#6b6b88', fontSize: 13 },
    socialRow: { flexDirection: 'row', gap: 16 },
    socialButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a26', borderWidth: 1, borderColor: '#2d2d3d', borderRadius: 16, height: 56 },
    socialText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    registerLink: { marginTop: 40, alignItems: 'center' },
    registerTextRed: { color: '#ff3c3c', fontWeight: 'bold' }
});
