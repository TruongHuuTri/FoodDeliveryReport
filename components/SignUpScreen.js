import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format.";
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else {
      const phoneRegex = /^[0-9]{10}$/; // Định dạng số điện thoại 10 chữ số
      if (!phoneRegex.test(phone)) {
        newErrors.phone = "Invalid phone number format.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Trả về `true` nếu không có lỗi
  };

  const handleSignUp = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      await axios.post("https://6736bc5faafa2ef2223158d1.mockapi.io/api/user", {
        email,
        password,
        phone,
        fullName,
      });

      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("LogIn", { email });
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error", "Unable to sign up, please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={styles.text}>Sign Up</Text>

          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={[styles.input, errors.fullName && { borderColor: "red", borderWidth: 1 }]}
              placeholder="Full Name"
              placeholderTextColor="#391713"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
              }}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={[styles.input, errors.email && { borderColor: "red", borderWidth: 1 }]}
              placeholder="Email"
              placeholderTextColor="#391713"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={[styles.input, errors.password && { borderColor: "red", borderWidth: 1 }]}
              placeholder="Password"
              placeholderTextColor="#391713"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={{ marginBottom: 20 }}>
            <TextInput
              style={[styles.input, errors.phone && { borderColor: "red", borderWidth: 1 }]}
              placeholder="Phone"
              placeholderTextColor="#391713"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <TouchableOpacity style={styles.view2} onPress={handleSignUp}>
            <Text style={styles.text6}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.text7}>
            Already have an account?{" "}
            <Text style={styles.text8} onPress={() => navigation.navigate("LogIn")}>
              Log In
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5CB58",
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#F5CB58",
  },
  text: {
    color: "#FFF5F4",
    fontSize: 32,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    fontSize: 16,
    color: "#391713",
    backgroundColor: "#F3E9B5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  view2: {
    alignItems: "center",
    backgroundColor: "#E95322",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 20,
  },
  text6: {
    color: "#FFF5F4",
    fontSize: 20,
    textAlign: "center",
  },
  text7: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },
  text8: {
    color: "#E95322",
    fontSize: 18,
    textDecorationLine: "underline",
  },
});

export default SignUpScreen;