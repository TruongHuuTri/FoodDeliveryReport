import React from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "../redux/store"; // Import action logOut

const UserScreen = ({ navigation }) => {
  const user = useSelector((state) => state.user); // Lấy thông tin từ Redux
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logOut()); // Xóa thông tin người dùng
    navigation.replace("LogIn"); // Điều hướng về màn hình đăng nhập
  };

  if (!user.isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No user is currently logged in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Information</Text>
      <View style={styles.userInfo}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{user.fullName}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phone}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEA",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E95322",
    textAlign: "center",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#391713",
  },
  value: {
    fontSize: 16,
    color: "#676767",
  },
  logoutButton: {
    backgroundColor: "#E95322",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#E95322",
    textAlign: "center",
  },
});

export default UserScreen;
