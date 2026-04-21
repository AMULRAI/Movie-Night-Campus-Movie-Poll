import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function RoleGuard({ children, allowedRoles, fallbackRoute = 'Login' }) {
  const { user, role, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      } else if (!allowedRoles.includes(role)) {
        const routeName = fallbackRoute === '/login' ? 'Login' : fallbackRoute;
        navigation.navigate(routeName);
      }
    }
  }, [loading, user, role, allowedRoles, fallbackRoute, navigation]);

  if (loading || !user || !allowedRoles.includes(role)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  return <>{children}</>;
}
