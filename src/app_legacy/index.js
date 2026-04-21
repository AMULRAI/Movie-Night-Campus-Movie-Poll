import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function InitialRedirect() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (isAdmin) return <Redirect href="/admin/dashboard" />;
  return <Redirect href="/student/dashboard" />;
}
