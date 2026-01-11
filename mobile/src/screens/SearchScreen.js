import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/axiosConfig";
import PostCard from "../components/PostCard";

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'posts'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const endpoint =
        activeTab === "users"
          ? `/users/search?q=${encodeURIComponent(query)}`
          : `/posts/search?q=${encodeURIComponent(query)}`;

      const res = await api.get(endpoint);
      setResults(activeTab === "users" ? res.data.users : res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Profile", { username: item.username })
      }
      className="flex-row items-center bg-gray-800 p-4 mb-2 mx-4 rounded-lg"
    >
      <Image
        source={{
          uri: item.profilePicture || "https://ui-avatars.com/api/?name=User",
        }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <View>
        <Text className="text-white font-bold text-lg">{item.displayName}</Text>
        <Text className="text-gray-400">@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Search Bar */}
      <View className="p-4 border-b border-gray-800">
        <View className="flex-row items-center bg-gray-800 rounded-lg px-4 border border-gray-700">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 text-white py-3 px-3 text-lg"
            placeholder="Search..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            onPress={() => setActiveTab("users")}
            className={`flex-1 pb-2 items-center ${
              activeTab === "users" ? "border-b-2 border-sky-500" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                activeTab === "users" ? "text-sky-500" : "text-gray-500"
              }`}
            >
              Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("posts")}
            className={`flex-1 pb-2 items-center ${
              activeTab === "posts" ? "border-b-2 border-sky-500" : ""
            }`}
          >
            <Text
              className={`font-bold ${
                activeTab === "posts" ? "text-sky-500" : "text-gray-500"
              }`}
            >
              Posts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" className="mt-10" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={
            activeTab === "users"
              ? renderUserItem
              : ({ item }) => (
                  <View className="mx-4 mt-2">
                    <PostCard
                      post={item}
                      navigation={navigation}
                      onPress={() =>
                        navigation.navigate("SinglePost", { postId: item._id })
                      }
                    />
                  </View>
                )
          }
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-500">No results found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
