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
import NotificationItem from "../components/NotificationItem";

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#38BDF8" className="mt-10" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              navigation={navigation}
              onRead={handleMarkAsRead}
            />
          )}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#4B5563"
              />
              <Text className="text-gray-500 text-center mt-4">
                No notifications yet.
              </Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchNotifications}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
