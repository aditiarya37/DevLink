import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
// 1. Fix Warning: Import from safe-area-context
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/axiosConfig";
// 2. Import Auth Hook for auto-login
import { useAuth } from "../context/AuthContext";

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Get the login function from our context
  const { login } = useAuth();

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    // 1. Validation
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // 2. Register User
      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.username,
      });

      // 3. Auto-Login immediately
      // This updates the AuthContext token, which triggers App.js to switch stacks to "Home"
      const success = await login(formData.email, formData.password);

      if (!success) {
        Alert.alert(
          "Success",
          "Account created, but auto-login failed. Please log in manually."
        );
        navigation.navigate("Login");
      }
      // If success is true, App.js automatically shows the Home screen!
    } catch (error) {
      console.log("Registration Error:", error.response?.data);
      const serverMessage =
        error.response?.data?.message || "Something went wrong";
      Alert.alert("Registration Failed", serverMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text className="text-3xl font-bold text-sky-400 text-center mb-8">
          Create Account
        </Text>

        <View className="space-y-4">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 mb-2"
            placeholderTextColor="#9CA3AF"
            placeholder="Username"
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
            autoCapitalize="none"
          />
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 mb-2"
            placeholderTextColor="#9CA3AF"
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 mb-2"
            placeholderTextColor="#9CA3AF"
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
          />
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg border border-gray-700 mb-2"
            placeholderTextColor="#9CA3AF"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            secureTextEntry
          />

          <TouchableOpacity
            className="bg-sky-600 p-4 rounded-lg mt-4"
            onPress={handleRegister}
          >
            <Text className="text-white text-center font-bold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            className="mt-4"
          >
            <Text className="text-gray-400 text-center">
              Already have an account?{" "}
              <Text className="text-sky-400">Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
