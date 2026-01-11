import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { View, ActivityIndicator, StatusBar } from "react-native";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import CreatePostScreen from "./src/screens/CreatePostScreen";
import SinglePostScreen from "./src/screens/SinglePostScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ProfileScreen from "./src/screens/ProfileScreen"; // Keep for navigating to OTHER users

// Navigator
import TabNavigator from "./src/navigation/TabNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Group>
          {/* MAIN APP (Tabs) */}
          <Stack.Screen name="Main" component={TabNavigator} />

          {/* MODALS & STACK SCREENS (Screens that cover the tabs) */}
          <Stack.Screen name="SinglePost" component={SinglePostScreen} />
          {/* We keep 'Profile' here to navigate to OTHER users from feed/search */}
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />

          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ presentation: "modal" }}
          />
        </Stack.Group>
      ) : (
        // AUTH STACK
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
