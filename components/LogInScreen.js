import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Colors, FontSize } from "../constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/store"; // Assuming you want to store user info after login
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const googleClientId = "796081438482-5d8ffrkvuv6gsb773r12kk7fsbmjhlk6.apps.googleusercontent.com"; // Thay bằng Google Client ID của bạn
const facebookAppId = "YOUR_FACEBOOK_APP_ID"; // Thay bằng Facebook App ID của bạn

const LoginScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Google Login configuration
  const [googleRequest, googleResponse, promptGoogleLogin] = Google.useAuthRequest({
    clientId: googleClientId,
  });

  // Facebook Login configuration
  const [facebookRequest, facebookResponse, promptFacebookLogin] = Facebook.useAuthRequest({
    clientId: facebookAppId,
  });

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { authentication } = googleResponse;
      Alert.alert("Google Login", `Access Token: ${authentication.accessToken}`);
      console.log("Google Token:", authentication.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (facebookResponse?.type === "success") {
      const { authentication } = facebookResponse;
      Alert.alert("Facebook Login", `Access Token: ${authentication.accessToken}`);
      console.log("Facebook Token:", authentication.accessToken);
    }
  }, [facebookResponse]);

  const handleSignIn = async () => {
    try {
      const response = await axios.get("https://6736bc5faafa2ef2223158d1.mockapi.io/api/user");
      const user = response.data.find((u) => u.email === email && u.password === password);

      if (user) {
        dispatch(
          setUser({
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
          })
        );
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Something went wrong, please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Image source={require("../ImageLocal/giaohang.png")} resizeMode={"stretch"} style={styles.image} />
          <Text style={styles.text}>{"Welcome"}</Text>
          <Text style={styles.text2}>{"Email or Mobile Number"}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.text2}>{"Password "}</Text>
          <TextInput
            style={styles.textInput}
            placeholder="*************"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.text5}>{"Forgot password?"}</Text>
          <TouchableOpacity style={styles.view2} onPress={handleSignIn}>
            <Text style={styles.text6}>{"Log In"}</Text>
          </TouchableOpacity>

          {/* Google Login Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptGoogleLogin()}
            disabled={!googleRequest}
          >
            <Text style={styles.text6}>{"Log In with Google"}</Text>
          </TouchableOpacity>

          {/* Facebook Login Button */}
          <TouchableOpacity
            style={styles.facebookButton}
            onPress={() => promptFacebookLogin()}
            disabled={!facebookRequest}
          >
            <Text style={styles.text6}>{"Log In with Facebook"}</Text>
          </TouchableOpacity>

          <Text style={styles.text7}>
            {"Don’t have an account? "}
            <Text style={styles.text8} onPress={() => navigation.navigate("SignUp")}>
              Sign Up
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
    backgroundColor: Colors.surfaceContainerLowest,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#F5CB58",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
    alignSelf: "center",
  },
  text: {
    color: "#FFF5F4",
    fontSize: FontSize.headline_large,
    marginBottom: 20,
    textAlign: "center",
  },
  text2: {
    color: "#391713",
    fontSize: 20,
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
    color: "#391713",
    backgroundColor: "#F3E9B5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  text5: {
    color: "#E95322",
    fontSize: FontSize.body_large,
    marginBottom: 20,
    textAlign: "right",
  },
  view2: {
    alignItems: "center",
    backgroundColor: "#E95322",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 20,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#4285F4",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 20,
  },
  facebookButton: {
    alignItems: "center",
    backgroundColor: "#3b5998",
    borderRadius: 30,
    paddingVertical: 14,
    marginBottom: 20,
  },
  text6: {
    color: Colors.surfaceContainerLowest,
    fontSize: FontSize.headline_small,
    textAlign: "center",
  },
  text7: {
    fontSize: FontSize.body_large,
    marginTop: 20,
    textAlign: "center",
  },
  text8: {
    color: "#E95322",
    fontSize: FontSize.body_large,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
