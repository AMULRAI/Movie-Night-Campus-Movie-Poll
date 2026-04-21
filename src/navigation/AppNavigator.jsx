import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';

// Student Screens
import StudentDashboard from '../screens/student/StudentDashboard';
import StudentHome from '../screens/student/StudentHome';
import SuggestScreen from '../screens/student/SuggestScreen';
import BookSeats from '../screens/student/BookSeats';
import VotingResults from '../screens/student/VotingResults';
import EventHistory from '../screens/student/EventHistory';
import StudentProfile from '../screens/student/StudentProfile';

// Admin Screens
import AdminHome from '../screens/admin/AdminHome';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminMovies from '../screens/admin/AdminMovies';
import AdminManagePolls from '../screens/admin/AdminManagePolls';
import AdminStudents from '../screens/admin/AdminStudents';
import AdminProfile from '../screens/admin/AdminProfile';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        
        {/* Student Routes */}
        <Stack.Screen name="/student/dashboard" component={StudentDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="/student/polls" component={StudentHome} options={{ headerShown: false }} />
        <Stack.Screen name="/student/suggest" component={SuggestScreen} options={{ headerShown: false }} />
        <Stack.Screen name="/student/booking" component={BookSeats} options={{ headerShown: false }} />
        <Stack.Screen name="/student/results" component={VotingResults} options={{ headerShown: false }} />
        <Stack.Screen name="/student/history" component={EventHistory} options={{ headerShown: false }} />
        <Stack.Screen name="/student/profile" component={StudentProfile} options={{ headerShown: false }} />
        
        {/* Admin Routes */}
        <Stack.Screen name="/admin/dashboard" component={AdminDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/polls" component={AdminHome} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/movies" component={AdminMovies} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/manage-polls" component={AdminManagePolls} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/students" component={AdminStudents} options={{ headerShown: false }} />
        <Stack.Screen name="/admin/profile" component={AdminProfile} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
