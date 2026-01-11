import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons"; // Import Icons
import api from "../api/axiosConfig";

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to upload images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // FIXED: MediaTypeOptions is deprecated, use MediaType
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !image) {
      Alert.alert("Error", "Please add some content or an image.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("tags", tags);

      if (image) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("postImage", {
          uri: image,
          name: filename,
          type: type,
        });
      }

      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Post created!");
      navigation.goBack();
    } catch (error) {
      console.error("Post Error:", error.response?.data);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not create post"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-gray-400 text-lg">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#38BDF8" />
          ) : (
            <Text className="text-sky-400 font-bold text-lg">Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <TextInput
          className="text-white text-lg mb-4"
          placeholder="What's on your mind?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          value={content}
          onChangeText={setContent}
          style={{ textAlignVertical: "top" }}
        />

        {image && (
          <View className="mb-4 relative">
            <Image
              source={{ uri: image }}
              className="w-full h-64 rounded-lg"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setImage(null)}
              className="absolute top-2 right-2 bg-black/60 p-1 rounded-full"
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={pickImage}
          className="flex-row items-center bg-gray-800 p-3 rounded-lg mb-4"
        >
          <Ionicons
            name="camera"
            size={24}
            color="#38BDF8"
            style={{ marginRight: 8 }}
          />
          <Text className="text-sky-400 font-semibold">Add Photo</Text>
        </TouchableOpacity>

        <TextInput
          className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
          placeholder="Tags (comma separated)"
          placeholderTextColor="#9CA3AF"
          value={tags}
          onChangeText={setTags}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
