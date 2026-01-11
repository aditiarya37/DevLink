import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";

const NotificationItem = ({ notification, navigation, onRead }) => {
  const sender = notification.sender || {};
  const isRead = notification.read;

  const handlePress = async () => {
    if (!isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        onRead(notification._id);
      } catch (e) {
        console.error(e);
      }
    }

    if (notification.type === "follow") {
      navigation.navigate("Profile", { username: sender.username });
    } else if (notification.post) {
      const postId =
        typeof notification.post === "object"
          ? notification.post._id
          : notification.post;
      navigation.navigate("SinglePost", { postId });
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "follow":
        return <Ionicons name="person-add" size={20} color="#38BDF8" />;
      case "like_post":
        return <Ionicons name="heart" size={20} color="#F87171" />;
      case "comment_post":
        return <Ionicons name="chatbubble" size={20} color="#34D399" />;
      default:
        return <Ionicons name="at" size={20} color="#A78BFA" />;
    }
  };

  const getMessage = () => {
    const name = sender.displayName || sender.username || "Someone";
    switch (notification.type) {
      case "follow":
        return (
          <Text>
            <Text className="font-bold text-white">{name}</Text> followed you.
          </Text>
        );
      case "like_post":
        return (
          <Text>
            <Text className="font-bold text-white">{name}</Text> liked your
            post.
          </Text>
        );
      case "comment_post":
        return (
          <Text>
            <Text className="font-bold text-white">{name}</Text> commented on
            your post.
          </Text>
        );
      default:
        return (
          <Text>
            <Text className="font-bold text-white">{name}</Text> mentioned you.
          </Text>
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center p-4 border-b border-gray-800 ${
        isRead ? "bg-gray-900" : "bg-gray-800/50"
      }`}
    >
      <View className="mr-4 relative">
        <Image
          source={{
            uri: sender.profilePicture || "https://ui-avatars.com/api/?name=?",
          }}
          className="w-12 h-12 rounded-full"
        />
        <View className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1">
          {getIcon()}
        </View>
      </View>

      <View className="flex-1">
        <Text className="text-gray-300 text-base">{getMessage()}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {notification.createdAt
            ? formatDistanceToNow(new Date(notification.createdAt))
            : ""}{" "}
          ago
        </Text>
      </View>
      {!isRead && <View className="w-3 h-3 bg-sky-500 rounded-full ml-2" />}
    </TouchableOpacity>
  );
};

export default NotificationItem;
