import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const EditProfileScreen = ({ navigation }) => {
  const { user, token } = useAuth(); // We can trigger a refresh of user data later if needed
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/users/me/update", formData);
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-gray-400 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#38BDF8" />
          ) : (
            <Text className="text-sky-500 font-bold text-lg">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <Text className="text-gray-400 mb-1 ml-1">Display Name</Text>
        <TextInput
          className="bg-gray-800 text-white p-3 rounded-lg mb-4 border border-gray-700"
          value={formData.displayName}
          onChangeText={(t) => setFormData({ ...formData, displayName: t })}
        />

        <Text className="text-gray-400 mb-1 ml-1">Bio</Text>
        <TextInput
          className="bg-gray-800 text-white p-3 rounded-lg mb-4 border border-gray-700 h-24"
          multiline
          value={formData.bio}
          onChangeText={(t) => setFormData({ ...formData, bio: t })}
          style={{ textAlignVertical: "top" }}
        />

        <Text className="text-gray-400 mb-1 ml-1">Location</Text>
        <TextInput
          className="bg-gray-800 text-white p-3 rounded-lg mb-4 border border-gray-700"
          value={formData.location}
          onChangeText={(t) => setFormData({ ...formData, location: t })}
        />

        <Text className="text-gray-400 mb-1 ml-1">Profile Picture URL</Text>
        <TextInput
          className="bg-gray-800 text-white p-3 rounded-lg mb-4 border border-gray-700"
          value={formData.profilePicture}
          onChangeText={(t) => setFormData({ ...formData, profilePicture: t })}
          placeholder="https://..."
          placeholderTextColor="#555"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
