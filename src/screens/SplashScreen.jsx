import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen({ navigation }) {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const FeatureCard = ({ icon, title, highlight }) => (
        <View style={styles.featureCard}>
            <View style={styles.iconBox}><Text style={{ fontSize: 20 }}>{icon}</Text></View>
            <Text style={styles.featureText}>
                <Text style={{ fontWeight: 'bold', color: '#fff' }}>{highlight}</Text> {title}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Film strip decoration mock */}
            <View style={styles.filmStrip}>
                {[...Array(6)].map((_, i) => <View key={i} style={styles.filmHole} />)}
            </View>

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.iconGlow}>
                        <Text style={styles.mainIcon}>🎬</Text>
                    </View>
                    <View style={styles.titleRow}>
                        <Text style={styles.titleMovie}>MOVIE</Text>
                        <Text style={styles.titleNight}>NIGHT</Text>
                    </View>
                    <Text style={styles.subtitle}>CAMPUS MOVIE POLL</Text>
                    
                    {/* Pulsing Dots */}
                    <View style={styles.dotsRow}>
                        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                        <Animated.View style={[styles.dot, { opacity: pulseAnim, animationDelay: '0.2s', backgroundColor: '#ff3c3c' }]} />
                        <Animated.View style={[styles.dot, { opacity: pulseAnim, animationDelay: '0.4s' }]} />
                    </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <FeatureCard icon="🗳️" highlight="Vote" title="for your favourite movie" />
                    <FeatureCard icon="📊" highlight="Live results" title="with charts" />
                    <FeatureCard icon="🎟️" highlight="Book seats" title="for movie nights" />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Login')}>
                        <LinearGradient 
                            colors={['#ff3c3c', '#ff8c42']} 
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Get Started →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.footerText}>By PST-25-0122 & PST-25-0283</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f' },
    filmStrip: { height: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#111', opacity: 0.5, borderBottomWidth: 1, borderColor: '#222' },
    filmHole: { width: 40, height: 20, backgroundColor: '#0a0a0f', borderRadius: 4 },
    content: { flex: 1, padding: 28, justifyContent: 'space-between', marginTop: 40 },
    logoContainer: { alignItems: 'center' },
    iconGlow: { backgroundColor: '#1a1a26', padding: 20, borderRadius: 24, shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 20, marginBottom: 24 },
    mainIcon: { fontSize: 60, alignSelf: 'center' },
    titleRow: { flexDirection: 'row' },
    titleMovie: { fontSize: 48, color: '#fff', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'sans-serif-condensed', letterSpacing: 2 },
    titleNight: { fontSize: 48, color: '#ff3c3c', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Gill Sans' : 'sans-serif-condensed', letterSpacing: 2 },
    subtitle: { color: '#6b6b88', fontSize: 14, letterSpacing: 4, marginTop: 8 },
    dotsRow: { flexDirection: 'row', marginTop: 30, gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6b6b88' },
    featuresContainer: { gap: 16, marginVertical: 40 },
    featureCard: { flexDirection: 'row', backgroundColor: '#1a1a26', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    iconBox: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    featureText: { color: '#6b6b88', fontSize: 15 },
    button: { padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#ff3c3c', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    footerText: { color: '#6b6b88', fontSize: 12, textAlign: 'center', marginTop: 24 }
});
