import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { AntDesign, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import axios from "axios";

export default function ContactScreen({ navigation }) {
  const [chatVisible, setChatVisible] = useState(false); // Hiển thị khung chat
  const [messages, setMessages] = useState([]); // Lưu trữ tin nhắn
  const [inputMessage, setInputMessage] = useState(""); // Tin nhắn người dùng nhập
  const [loading, setLoading] = useState(false); // Trạng thái loading

  const handlePress = (type) => {
    switch (type) {
      case "phone":
        Linking.openURL("tel:0838849375").catch(() =>
          Alert.alert("Error", "Unable to make a call.")
        );
        break;
      case "website":
        Linking.openURL("https://shopeefood.vn/").catch(() =>
          Alert.alert("Error", "Unable to open the website.")
        );
        break;
      case "facebook":
        Linking.openURL("https://www.facebook.com/minhquang.tran.9822/").catch(() =>
          Alert.alert("Error", "Unable to open Facebook.")
        );
        break;
      case "instagram":
        Linking.openURL("https://www.instagram.com/_minhhquag.263/").catch(() =>
          Alert.alert("Error", "Unable to open Instagram.")
        );
        break;
      default:
        break;
    }
  };

 const sendMessageToAI = async () => {
  if (!inputMessage.trim()) return;

  const userMessage = { sender: "user", text: inputMessage };
  setMessages((prevMessages) => [...prevMessages, userMessage]);

  setInputMessage(""); 
  setLoading(true);

  try {
    const response = await axios.post(
      "https://api.cohere.com/v1/generate",
      {
        prompt: inputMessage,
        model: "command", 
        max_tokens: 50,
        temperature: 0.5, // Thêm để điều chỉnh độ ngẫu nhiên
        return_likelihoods: "NONE" // Tùy chọn
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer z8ixT9lmYVtacIVkvneTWekiaxNz96KMC5VMX1vT`, // Khuyến nghị dùng environment
        },
      }
    );

    const aiResponse = response.data.generations[0].text.trim() || "Sorry, I didn't get that.";
    setMessages((prevMessages) => [...prevMessages, { sender: "ai", text: aiResponse }]);
  } catch (error) {
    console.error("Error sending message to AI:", error.response?.data || error.message);
    const errorMessage = { 
      sender: "ai", 
      text: error.response?.data?.message || "Unable to connect to AI. Please try again later." 
    };
    setMessages((prevMessages) => [...prevMessages, errorMessage]);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.text}>Contact Us</Text>
        <Text style={styles.text2}>How Can We Help You?</Text>
      </View>

      <View style={styles.column2}>
        <TouchableOpacity style={styles.row} onPress={() => handlePress("phone")}>
          <AntDesign name="customerservice" size={24} color="#FFA500" />
          <Text style={styles.text3}>Customer service</Text>
          <AntDesign name="right" size={18} color="#FFA500" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handlePress("website")}>
          <MaterialCommunityIcons name="web" size={24} color="#FFA500" />
          <Text style={styles.text3}>Website</Text>
          <AntDesign name="right" size={18} color="#FFA500" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handlePress("facebook")}>
          <FontAwesome name="facebook" size={24} color="#FFA500" />
          <Text style={styles.text3}>Facebook</Text>
          <AntDesign name="right" size={18} color="#FFA500" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => handlePress("instagram")}>
          <FontAwesome name="instagram" size={24} color="#FFA500" />
          <Text style={styles.text3}>Instagram</Text>
          <AntDesign name="right" size={18} color="#FFA500" />
        </TouchableOpacity>
      </View>

      {/* Bong bóng chat */}
      {chatVisible && (
        <View style={styles.chatContainer}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "user" ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.chatList}
            inverted
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendMessageToAI}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>{loading ? "..." : "Send"}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Nút mở chat */}
      <TouchableOpacity
        style={styles.chatBubbleButton}
        onPress={() => setChatVisible(!chatVisible)}
      >
        <AntDesign name="message1" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <AntDesign name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
          <AntDesign name="barschart" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Contact")}>
          <AntDesign name="customerservice" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  column: {
    backgroundColor: "#FFA500",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  column2: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  text2: {
    color: "#FFD580",
    fontSize: 16,
    marginTop: 5,
  },
  text3: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: "#4F4F4F",
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    backgroundColor: "#E95322",
  },
  chatContainer: {
    position: "absolute",
    bottom: 130,
    right: 10,
    width: "90%",
    height: "50%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 10,
    justifyContent: "space-between",
  },
  chatList: {
    flexGrow: 1,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#E95322",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD580",
  },
  messageText: {
    color: "#391713",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E95322",
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#E95322",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  chatBubbleButton: {
    position: "absolute",
    bottom: 70,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E95322",
    justifyContent: "center",
    alignItems: "center",
  },
});
