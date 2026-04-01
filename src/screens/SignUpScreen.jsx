import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerUser } from '../services/authService';

export default function SignUpScreen({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!firstName.trim() || !lastName.trim() || !studentId.trim() || !email.trim() || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address with an @ symbol.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            await registerUser(firstName.trim(), lastName.trim(), studentId.trim(), email.trim(), password, role);
            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 28 }} keyboardShouldPersistTaps="handled">
                
                {/* Header */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.titleRow}>
                    <Text style={styles.joinText}>Join </Text>
                    <Text style={styles.titleMovie}>MOVIE</Text>
                    <Text style={styles.titleNight}>NIGHT</Text>
                </View>
                <Text style={styles.subtitle}>Create your campus account to start voting</Text>

                {/* Form Elements */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>FIRST NAME</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput style={styles.input} placeholderTextColor="#6b6b88" placeholder="First" value={firstName} onChangeText={setFirstName} />
                        </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.label}>LAST NAME</Text>
                        <View style={styles.inputContainer}>
                            <TextInput style={[styles.input, { marginLeft: 0 }]} placeholderTextColor="#6b6b88" placeholder="Last" value={lastName} onChangeText={setLastName} />
                        </View>
                    </View>
                </View>

                <Text style={styles.label}>STUDENT ID / ROLL NO.</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🪪</Text>
                    <TextInput style={styles.input} placeholder="PST-_-_" placeholderTextColor="#6b6b88" value={studentId} onChangeText={setStudentId} />
                </View>

                <Text style={styles.label}>CAMPUS EMAIL</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>📧</Text>
                    <TextInput style={styles.input} placeholder="student@campus.edu" placeholderTextColor="#6b6b88" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <Text style={styles.label}>YOUR ROLE</Text>
                <View style={styles.roleRow}>
                    <TouchableOpacity 
                        style={[styles.roleCard, role === 'student' && styles.roleCardActive]} 
                        onPress={() => setRole('student')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.roleIcon}>🎓</Text>
                        <Text style={[styles.roleTitle, role === 'student' && {color: '#fff'}]}>Student</Text>
                        <Text style={styles.roleSub}>Suggest & vote on movies</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleCard, role === 'admin' && styles.roleCardActive]} 
                        onPress={() => setRole('admin')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.roleIcon}>🛡️</Text>
                        <Text style={[styles.roleTitle, role === 'admin' && {color: '#fff'}]}>Admin</Text>
                        <Text style={styles.roleSub}>Manage polls & moderate</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput style={styles.input} placeholder="Create a strong password" placeholderTextColor="#6b6b88" secureTextEntry value={password} onChangeText={setPassword} />
                </View>
                
                {/* Password Strength Indicator */}
                <View style={styles.strengthRow}>
                    <View style={styles.strengthBarBg}>
                        <LinearGradient colors={['#ff8c42', '#ffd166']} style={[styles.strengthBarFill, { width: '60%' }]} start={{x:0,y:0}} end={{x:1,y:0}} />
                    </View>
                    <Text style={styles.strengthText}>Medium strength — add a number or symbol</Text>
                </View>

                <View style={styles.checkboxRow}>
                    <View style={styles.checkbox}><Text style={{ color: '#ff3c3c', fontSize: 12 }}>✓</Text></View>
                    <Text style={styles.checkboxText}>I agree to the <Text style={styles.redText}>Terms of Service</Text> and <Text style={styles.redText}>Privacy Policy</Text> of MovieNight</Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 24 }} onPress={handleSignup} disabled={loading}>
                    <LinearGradient colors={['#ff3c3c', '#ff8c42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButton}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>🎬 Create Account</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: '#6b6b88' }}>Already have an account? <Text style={styles.redText}>Sign in</Text></Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    backButton: { marginBottom: 24, paddingVertical: 8 },
    backText: { color: '#6b6b88', fontSize: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    joinText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
    titleMovie: { fontSize: 32, color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
    titleNight: { fontSize: 32, color: '#ff3c3c', fontWeight: 'bold', letterSpacing: 1 },
    subtitle: { color: '#6b6b88', fontSize: 15, marginTop: 8, marginBottom: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { color: '#6b6b88', fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16, letterSpacing: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a26', borderRadius: 16, borderWidth: 1, borderColor: '#2d2d3d', paddingHorizontal: 16, height: 56 },
    inputIcon: { fontSize: 18, marginRight: 12 },
    input: { flex: 1, color: '#fff', fontSize: 16 },
    roleRow: { flexDirection: 'row', gap: 16 },
    roleCard: { flex: 1, backgroundColor: '#1a1a26', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: '#2d2d3d', alignItems: 'center' },
    roleCardActive: { borderColor: '#ff3c3c', backgroundColor: 'rgba(255, 60, 60, 0.08)' },
    roleIcon: { fontSize: 24, marginBottom: 8 },
    roleTitle: { color: '#6b6b88', fontSize: 13, fontWeight: '600', marginBottom: 4 },
    roleSub: { color: '#6b6b88', fontSize: 11, textAlign: 'center' },
    strengthRow: { marginTop: 12 },
    strengthBarBg: { height: 4, backgroundColor: '#2d2d3d', borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
    strengthBarFill: { height: '100%', borderRadius: 2 },
    strengthText: { color: '#ffd166', fontSize: 12 },
    checkboxRow: { flexDirection: 'row', marginTop: 32, alignItems: 'center', paddingRight: 20 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: '#ff3c3c', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    checkboxText: { color: '#6b6b88', fontSize: 13, lineHeight: 20 },
    redText: { color: '#ff3c3c' },
    primaryButton: { padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
    primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    loginLink: { marginTop: 32, alignItems: 'center', marginBottom: 40 }
});
