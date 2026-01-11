import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = ({ route, navigation }) => {
  const { user: currentUser, logout } = useAuth();

  // Determine which profile to show.
  const username = route.params?.username || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Get User Info
      const userRes = await api.get(`/users/profile/${username}`);
      setProfile(userRes.data);

      // 2. Check Follow Status (if viewing someone else)
      if (currentUser && userRes.data._id !== currentUser._id) {
        try {
          const meRes = await api.get("/users/me");
          const myFollowing = meRes.data.following || [];
          const isFound = myFollowing.some(
            (f) => (typeof f === "string" ? f : f._id) === userRes.data._id
          );
          setIsFollowing(isFound);
        } catch (err) {
          console.log("Check follow status failed", err);
        }
      }

      // 3. Get User's Posts
      if (userRes.data._id) {
        const postsRes = await api.get(`/posts/user/${userRes.data._id}`);
        setPosts(postsRes.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    try {
      const action = previousState ? "unfollow" : "follow";
      await api.put(`/users/${profile._id}/${action}`);

      setProfile((prev) => ({
        ...prev,
        followerCount: previousState
          ? prev.followerCount - 1
          : prev.followerCount + 1,
      }));
    } catch (error) {
      setIsFollowing(previousState);
      Alert.alert("Error", "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    setProfile((prev) => ({
      ...prev,
      postCount: Math.max(0, (prev.postCount || 0) - 1),
    }));
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-lg">User not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-sky-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isMe = currentUser?.username === profile.username;

  const renderHeader = () => (
    <View className="bg-gray-800 p-6 rounded-b-3xl mb-6 shadow-lg">
      <View className="items-center">
        {/* Avatar */}
        <Image
          source={{
            uri: profile.profilePicture || "https://ui-avatars.com/api/?name=?",
          }}
          className="w-28 h-28 rounded-full border-4 border-sky-500 mb-4"
        />

        {/* Name & Username */}
        <Text className="text-white text-2xl font-bold text-center">
          {profile.displayName}
        </Text>
        <Text className="text-sky-400 text-base mb-4">@{profile.username}</Text>

        {/* Main Action Button (Edit or Follow) */}
        <View className="flex-row gap-3 mb-4 flex-wrap justify-center">
          {isMe ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
              className="bg-gray-700 px-8 py-2 rounded-full border border-gray-600 flex-row items-center"
            >
              <Ionicons
                name="pencil"
                size={16}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white font-semibold">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleFollowToggle}
              className={`px-8 py-2 rounded-full flex-row items-center ${
                isFollowing
                  ? "bg-gray-700 border border-gray-600"
                  : "bg-sky-500"
              }`}
            >
              <Text
                className={`font-bold ${
                  isFollowing ? "text-gray-300" : "text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bio */}
        {profile.bio ? (
          <Text className="text-gray-300 text-center mb-4 leading-5 px-4">
            {profile.bio}
          </Text>
        ) : null}

        {/* Stats Row */}
        <View className="flex-row space-x-8 mt-2">
          <View className="items-center">
            <Text className="text-white font-bold text-xl">{posts.length}</Text>
            <Text className="text-gray-400 text-xs">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-white font-bold text-xl">
              {profile.followerCount || 0}
            </Text>
            <Text className="text-gray-400 text-xs">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-white font-bold text-xl">
              {profile.followingCount || 0}
            </Text>
            <Text className="text-gray-400 text-xs">Following</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      {/* 1. Back Button (Top Left) - Only if navigated here */}
      {route.params?.username && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-4 left-4 z-50 bg-black/30 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* 2. Logout Button (Top Right) - Only if it's MY profile */}
      {isMe && (
        <TouchableOpacity
          onPress={logout}
          className="absolute top-4 right-4 z-50 bg-black/30 p-2 rounded-full"
        >
          <Ionicons name="log-out-outline" size={24} color="#F87171" />
        </TouchableOpacity>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="mx-4">
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10 italic">
            {isMe ? "You haven't posted anything yet." : "No posts yet."}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
