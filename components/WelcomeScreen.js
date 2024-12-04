import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default () => {
  const navigation = useNavigation();

  // Hàm điều hướng
  const goToLogin = () => {
    navigation.navigate('LogIn');
  };

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Hình ảnh ở giữa màn hình */}
        <Image
          source={require('../ImageLocal/giaohang.png')}
          style={styles.image}
        />

        {/* Tiêu đề */}
        <Text style={styles.text}>{'Foodie'}</Text>
        <Text style={styles.text2}>
          {'Bringing delicious food to your doorstep'}
        </Text>

        {/* Nút Đăng nhập */}
        <TouchableOpacity style={styles.button} onPress={goToLogin}>
          <Text style={styles.buttonText}>{'Log In'}</Text>
        </TouchableOpacity>

        {/* Nút Đăng ký */}
        <TouchableOpacity style={styles.buttonAlt} onPress={goToSignUp}>
          <Text style={styles.buttonText}>{'Sign Up'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E95322',
    padding: 20,
  },
  image: {
    width: 150, // Chiều rộng của ảnh
    height: 150, // Chiều cao của ảnh
    marginBottom: 20, // Khoảng cách dưới ảnh
    resizeMode: 'contain', // Đảm bảo ảnh không bị cắt
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  text2: {
    color: '#F8F8F8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#F5CB58',
    borderRadius: 30,
    paddingVertical: 15,
    marginBottom: 20,
  },
  buttonAlt: {
    width: '80%',
    alignItems: 'center',
    backgroundColor: '#F3E9B5',
    borderRadius: 30,
    paddingVertical: 15,
    marginBottom: 20,
  },
  buttonText: {
    color: '#E95322',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
