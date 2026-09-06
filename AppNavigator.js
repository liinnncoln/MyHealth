import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';

import HealthProfileScreen from '../screens/HealthProfileScreen';
import AddRecordScreen from '../screens/AddRecordScreen';
import RecordDetailsScreen from '../screens/RecordDetailsScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import EmergencyProfileScreen from '../screens/EmergencyProfileScreen';
import ShareRecordsScreen from '../screens/ShareRecordsScreen';
import AccessLogScreen from '../screens/AccessLogScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, profile, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return null; // could add a lightweight loading state here
  }

  const isAuthed = Boolean(session);
  const needsOnboarding = isAuthed && profile && !profile.onboarding_complete;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthed ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
            <Stack.Screen name="AddRecord" component={AddRecordScreen} />
            <Stack.Screen name="RecordDetails" component={RecordDetailsScreen} />
            <Stack.Screen name="Medications" component={MedicationsScreen} />
            <Stack.Screen name="EmergencyProfile" component={EmergencyProfileScreen} />
            <Stack.Screen name="ShareRecords" component={ShareRecordsScreen} />
            <Stack.Screen name="AccessLog" component={AccessLogScreen} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
