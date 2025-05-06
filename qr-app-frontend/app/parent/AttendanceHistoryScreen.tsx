import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AttendanceHistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await apiClient.get("/parent/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update to match the new response structure
      setHistory(response.data.attendance || []);
    } catch (err: any) {
      // Handle API error response
      setError(
        err.response?.data?.error || "Failed to fetch attendance history"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <Text
        style={[
          styles.cell,
          styles.statusCell,
          !item.is_checkin && styles.checkoutStatus,
        ]}
      >
        {item.is_checkin ? "Check-in" : "Check-out"}
      </Text>
      <Text style={styles.cell}>{formatTimestamp(item.timestamp).date}</Text>
      <Text style={styles.cell}>{formatTimestamp(item.timestamp).time}</Text>
    </View>
  );

  // Add key extractor for better list performance
  const keyExtractor = (item: any) => `${item.child_id}-${item.timestamp}`;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Loading History...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={40} color="#E74C3C" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="history" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.statusHeader]}>Status</Text>
            <Text style={styles.headerCell}>Date</Text>
            <Text style={styles.headerCell}>Time</Text>
          </View>
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "rgba(255, 250, 240, 1.00)",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 250, 240, 1.00)",
  },
  loadingText: {
    fontSize: 16,
    color: "#2C3E50",
    marginTop: 20,
    fontFamily: "Roboto-Medium",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    marginTop: 15,
    textAlign: "center",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",

    marginBottom: 25,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
    marginLeft: 15,
    fontFamily: "Roboto-Bold",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#EDE7DC",
    paddingBottom: 12,
    marginBottom: 10,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    fontFamily: "Roboto-Bold",
  },
  statusHeader: {
    flex: 1.2,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F1EB",
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: "#34495E",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
  },
  statusCell: {
    flex: 1.2,
    color: "#27ae60",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 12,
    fontFamily: "Roboto-Italic",
  },
  checkoutStatus: {
    color: "#e74c3c", // Red color for checkouts
  },
});
