import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  // We remove 'logout' from here because it's better suited for the Profile screen now

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error("Error fetching posts", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== deletedPostId)
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      {/* Header - Simplified */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
        <Text className="text-sky-400 text-2xl font-bold">DevLink</Text>
        {/* We can add a small logo or just keep it clean */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" className="mt-10" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="mx-4 mt-4">
              <PostCard
                post={item}
                navigation={navigation}
                onPress={() =>
                  navigation.navigate("SinglePost", { postId: item._id })
                }
                onPostDeleted={handlePostDeleted}
              />
            </View>
          )}
          refreshing={loading}
          onRefresh={fetchPosts}
          contentContainerStyle={{ paddingBottom: 100 }} // Add padding for FAB
        />
      )}

      {/* Create Post FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreatePost")}
        className="absolute bottom-6 right-6 bg-sky-500 w-14 h-14 rounded-full justify-center items-center shadow-lg z-50"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
