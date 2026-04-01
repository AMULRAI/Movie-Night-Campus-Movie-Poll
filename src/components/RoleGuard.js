import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function RoleGuard({ children, allowedRoles, fallbackRoute = '/login' }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Redirect href={fallbackRoute} />;
  }

  return <>{children}</>;
}
