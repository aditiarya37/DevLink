import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native"; // Removed SafeAreaView
import { SafeAreaView } from "react-native-safe-area-context"; // Added this
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    const success = await login(email, password);
    // Navigation is handled automatically by the App.js logic (see Phase 5)
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 justify-center p-6">
      <Text className="text-3xl font-bold text-sky-400 text-center mb-8">
        DevLink
      </Text>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-300 mb-2">Email or Username</Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholderTextColor="#9CA3AF"
            placeholder="Enter credentials"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-gray-300 mb-2">Password</Text>
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholderTextColor="#9CA3AF"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-sky-600 p-4 rounded-lg mt-6"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold text-lg">
            Log In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          className="mt-6"
        >
          <Text className="text-gray-400 text-center">
            Don't have an account? <Text className="text-sky-400">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
