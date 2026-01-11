import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";
import CommentItem from "../components/CommentItem";

const SinglePostScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const postRes = await api.get(`/posts/${postId}`);
      setPost(postRes.data);
      const commentsRes = await api.get(`/posts/${postId}/comments`);
      setComments(commentsRes.data.comments || []);
    } catch (error) {
      console.error("Error loading post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        text: newComment,
      });
      setComments([res.data, ...comments]);
      setNewComment("");
      setPost((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      }));
    } catch (error) {
      console.error("Comment failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Post</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <CommentItem comment={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListHeaderComponent={() => (
          <View className="mb-6">
            {post && <PostCard post={post} navigation={navigation} />}
            <Text className="text-gray-400 font-bold mb-4 text-lg">
              Comments
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="flex-row items-center p-3 bg-gray-800 border-t border-gray-700">
          <TextInput
            className="flex-1 bg-gray-900 text-white p-3 rounded-full mr-3 border border-gray-700"
            placeholder="Write a comment..."
            placeholderTextColor="#9CA3AF"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={handleSendComment} disabled={submitting}>
            <Ionicons
              name="send"
              size={24}
              color={newComment.trim() ? "#38BDF8" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SinglePostScreen;
