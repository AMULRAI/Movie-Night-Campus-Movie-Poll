import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

// Ignore internal Firebase logs that trigger the red screen even when caught
LogBox.ignoreLogs([
  '@firebase/firestore:',
  'Uncaught Error in snapshot listener',
]);
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
