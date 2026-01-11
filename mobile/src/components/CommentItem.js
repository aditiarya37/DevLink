import React from "react";
import { View, Text, Image } from "react-native";
import { formatDistanceToNow } from "date-fns";

const CommentItem = ({ comment }) => {
  const user = comment.user || {};

  return (
    <View className="flex-row mb-4 border-b border-gray-800 pb-3">
      <Image
        source={{
          uri: user.profilePicture || "https://ui-avatars.com/api/?name=?",
        }}
        className="w-8 h-8 rounded-full mr-3 bg-gray-700"
      />
      <View className="flex-1">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-white font-bold text-sm mr-2">
            {user.displayName || user.username}
          </Text>
          <Text className="text-gray-500 text-xs">
            {comment.createdAt
              ? formatDistanceToNow(new Date(comment.createdAt))
              : ""}{" "}
            ago
          </Text>
        </View>

        <Text className="text-gray-300 mt-1 text-sm leading-5">
          {comment.text}
        </Text>

        {/* Simple Reply Count Indicator */}
        {comment.replyCount > 0 && (
          <Text className="text-sky-500 text-xs mt-2 font-semibold">
            View {comment.replyCount} replies
          </Text>
        )}
      </View>
    </View>
  );
};

export default CommentItem;
