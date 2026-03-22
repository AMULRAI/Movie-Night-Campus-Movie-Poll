import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const Redirect = ({ to }) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.replace(to);
  }, [navigation, to]);
  return null;
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff3c3c" />
      </View>
    );
  }

  if (!user) {
    return <Redirect to="Login" />;
  }

  if (adminOnly && !isAdmin) {
    Alert.alert("Unauthorized", "You do not have permission to access this page.");
    return <Redirect to="Home" />;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f'
  }
});

export default ProtectedRoute;
