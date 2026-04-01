import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import StudentHome from './student/StudentHome';
import AdminHome from './admin/AdminHome';

export default function HomeScreen() {
    const { role, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#ff3c3c" />
            </View>
        );
    }

    if (isAdmin || role === 'admin') {
        return <AdminHome />;
    }

    return <StudentHome />;
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#0a0a0f' 
    }
});
