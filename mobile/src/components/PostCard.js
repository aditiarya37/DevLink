import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const PostCard = ({ post, navigation, onPress, onPostDeleted }) => {
  const { user: currentUser } = useAuth();

  // Local state for immediate UI updates (Optimistic UI)
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Check if the current user has already liked this post
  useEffect(() => {
    if (post && currentUser) {
      setLikeCount(post.likeCount || 0);
      // The backend 'likes' array usually contains IDs. Check if our ID is in there.
      const isLiked = post.likes?.some((id) =>
        typeof id === "object"
          ? id._id === currentUser._id
          : id === currentUser._id
      );
      setLiked(!!isLiked);
    }
  }, [post, currentUser]);

  const handleLike = async () => {
    // Optimistic update: update UI immediately before server responds
    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      await api.put(`/posts/${post._id}/like`);
    } catch (error) {
      // Revert if error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error("Like failed", error);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/posts/${post._id}`);
            if (onPostDeleted) onPostDeleted(post._id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  const handleProfilePress = () => {
    if (post.user?.username) {
      navigation.navigate("Profile", { username: post.user.username });
    }
  };

  const isOwner = currentUser && post.user && currentUser._id === post.user._id;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-gray-800 mb-4 p-4 rounded-xl shadow-sm"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={handleProfilePress}>
            <Image
              source={{
                uri:
                  post.user?.profilePicture ||
                  "https://ui-avatars.com/api/?name=User",
              }}
              className="w-10 h-10 rounded-full border border-sky-500 mr-3"
            />
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={handleProfilePress}>
              <Text className="text-white font-bold text-lg">
                {post.user?.displayName || "Unknown"}
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-400 text-xs">
              @{post.user?.username} •{" "}
              {post.createdAt
                ? formatDistanceToNow(new Date(post.createdAt))
                : ""}{" "}
              ago
            </Text>
          </View>
        </View>

        {/* Delete Button (Only visible if you own the post) */}
        {isOwner && (
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text className="text-gray-200 mb-4 leading-6">{post.content}</Text>

      {/* Image */}
      {post.mediaUrl && (
        <Image
          source={{ uri: post.mediaUrl }}
          className="w-full h-60 rounded-lg mb-3 bg-gray-700"
          resizeMode="cover"
        />
      )}

      {/* Footer (Likes & Comments) */}
      <View className="flex-row pt-3 border-t border-gray-700 items-center">
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center mr-6 py-1"
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#F87171" : "#9CA3AF"}
            style={{ marginRight: 6 }}
          />
          <Text className={liked ? "text-red-400" : "text-gray-400"}>
            {likeCount} Likes
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color="#9CA3AF"
            style={{ marginRight: 6 }}
          />
          <Text className="text-gray-400">
            {post.commentCount || 0} Comments
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PostCard;
