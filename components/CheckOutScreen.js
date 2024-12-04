import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ActivityIndicator, // Thêm ActivityIndicator cho vòng xoay chờ
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import haversine from 'haversine-distance';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage
import { supabaseFetch } from '../supabase'; // Import hàm supabaseFetch

const CheckoutScreen = ({ route, navigation }) => {
  const { cart, clearCart } = route.params || {};
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(15000);
  const [paymentMethod, setPaymentMethod] = useState(
    'Thanh toán khi nhận hàng'
  );
  const [cartItems, setCartItems] = useState(cart);
  const [loading, setLoading] = useState(false); // Thêm state loading để kiểm soát vòng xoay chờ
  const [distance, setDistance] = useState(null); // Thêm state lưu khoảng cách
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(null);

  const saveOrderToSupabase = async (order) => {
  try {
    const response = await supabaseFetch('orders', 'POST', {
      items: order.items,
      address: order.address,
      total_food: order.total_food,
      total_tax: order.total_tax,
      total_price: order.total_price,
      delivery_fee: order.delivery_fee,
      status: order.status,
      created_at: order.created_at,
      estimated_delivery_time: order.estimated_delivery_time,
      first_item_image: order.first_item_image,
    });

    if (response && response.success) {
      console.log('Đơn hàng đã được lưu:', response);
      return response;
    }

    console.warn('Có thể dữ liệu đã được lưu nhưng không xác nhận được.');
    return { success: true, message: 'Order saved but response is empty' };
  } catch (error) {
    console.error('Lỗi khi lưu đơn hàng vào Supabase:', error);
    Alert.alert('Lỗi', 'Không thể lưu đơn hàng. Vui lòng thử lại.');
    throw error;
  }
};


  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // Thuế 10%
    return {
      subtotal,
      tax,
      delivery: deliveryFee,
      total: subtotal + tax + deliveryFee,
    };
  };

  const { subtotal, tax, total } = calculateTotal();

  const calculateDeliveryTime = (distance, speed = 30) => {
    if (distance < 1.5) {
      return 15; // Nếu khoảng cách dưới 1.5 km, thời gian giao hàng là 15 phút
    }

    const deliveryTimeInHours = distance / speed;
    const deliveryTimeInMinutes = deliveryTimeInHours * 60;
    return 10 + deliveryTimeInMinutes.toFixed(0); // Trả về số phút
  };

  const handleConfirmAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ.');
      return;
    }
    const firstItemImage =
      cartItems[0]?.image || 'https://via.placeholder.com/80';
    const order = {
      // Không cần khai báo id, Supabase sẽ tự động tạo
      items: cartItems, // Danh sách sản phẩm
      address: address.trim(), // Địa chỉ giao hàng
      total_food: subtotal, // Tổng giá trị đơn hàng
      total_tax: tax,
      total_price: total,
      delivery_fee: deliveryFee,
      status: 'active', // Trạng thái đơn hàng
      created_at: new Date().toISOString(), // Thời gian tạo
      estimated_delivery_time: estimatedDeliveryTime,
      first_item_image: firstItemImage, // Sử dụng tên trường chính xác trong cơ sở dữ liệu
    };
    setLoading(true); // Hiển thị vòng xoay
    try {
      // Tọa độ mặc định
      const defaultLocation = {
        latitude: 10.784198,
        longitude: 106.695913,
      };

      const addressCoordinates = {
        '167 Hai Bà Trưng, Quận 3': defaultLocation,
        '1 Lê Duẩn, Quận 1': { latitude: 10.776924, longitude: 106.700821 },
        '12 Nguyễn Văn Bảo, Gò Vấp': {
          latitude: 10.820809,
          longitude: 106.687551,
        },
      };

      let userLocation = addressCoordinates[address.trim()];

      // Gọi API nếu không có trong bảng tọa độ
      if (!userLocation) {
        userLocation = await fetchCoordinates(address);
      }

      if (userLocation) {
        const distance = haversine(defaultLocation, userLocation) / 1000;
        let fee = 50000;
        if (distance <= 3) fee = 15000;
        else if (distance <= 5) fee = 20000;
        else if (distance <= 10) fee = 35000;

        const deliveryTimeInMinutes = calculateDeliveryTime(distance);
        const estimatedDeliveryTime = new Date(
          Date.now() + deliveryTimeInMinutes * 60000
        );

        setDeliveryFee(fee);
        setDistance(distance);
        setEstimatedDeliveryTime(estimatedDeliveryTime); // Lưu thời gian dự kiến

        Alert.alert(
          'Địa chỉ hợp lệ',
          `Khoảng cách: ${distance.toFixed(
            2
          )} km\nPhí vận chuyển: ${fee} VND\nThời gian giao hàng dự kiến: ${estimatedDeliveryTime.toLocaleTimeString(
            'vi-VN'
          )}`
        );
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy tọa độ cho địa chỉ này.');
      }
    } catch (error) {
      console.error('Lỗi xử lý:', error);
      Alert.alert('Lỗi', 'Đã xảy ra sự cố. Vui lòng thử lại sau.');
    } finally {
      setLoading(false); // Tắt vòng xoay chờ trong mọi trường hợp
    }
  };

  const fetchCoordinates = async (address) => {
    const apiKey = '04d9cb2c483142d4a2c929d51a93e70a';
    try {
      console.log('Đang gọi API với địa chỉ:', address); // Kiểm tra địa chỉ được gửi đi
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`); // Log lỗi HTTP nếu có
      }

      const data = await response.json();
      console.log('Kết quả từ API:', data); // Log dữ liệu trả về

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        throw new Error('Không tìm thấy tọa độ từ API');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error.message);
      setLoading(false); // Dừng vòng xoay chờ nếu có lỗi
      Alert.alert('Lỗi', 'Không thể lấy tọa độ từ API. Vui lòng thử lại sau.');
      return null;
    }
  };

  const increaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
  };

  const decreaseQuantity = (itemId) => {
    const updatedCart = cartItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    setCartItems(updatedCart);
  };

  const removeItem = (itemId) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    setCartItems(updatedCart);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ trước khi đặt hàng.');
      return;
    }

    const firstItemImage =
      cartItems[0]?.image || 'https://via.placeholder.com/80';
    const order = {
      // Không cần khai báo id, Supabase sẽ tự động tạo
      items: cartItems, // Danh sách sản phẩm
      address: address.trim(), // Địa chỉ giao hàng
      total_food: subtotal, // Tổng giá trị đơn hàng
      total_tax: tax,
      total_price: total,
      delivery_fee: deliveryFee,
      status: 'active', // Trạng thái đơn hàng
      created_at: new Date().toISOString(), // Thời gian tạo
      estimated_delivery_time: estimatedDeliveryTime,
      first_item_image: firstItemImage, // Sử dụng tên trường chính xác trong cơ sở dữ liệu
    };

    try {
      // Hiển thị vòng xoay chờ
      setLoading(true);

      // Cập nhật `status` của từng sản phẩm thành `none` trên API
      await Promise.all(
        cartItems.map(async (item) => {
          await fetch(
            `https://6736bc5faafa2ef2223158d1.mockapi.io/api/food/${item.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'none' }), // Cập nhật trạng thái
            }
          );
        })
      );

      // Gửi yêu cầu lưu vào Supabase
      const savedOrder = await saveOrderToSupabase(order);

      if (savedOrder) {
        Alert.alert(
          'Đặt hàng thành công',
          'Đơn hàng của bạn đã được đặt thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart(); // Xóa giỏ hàng
                navigation.navigate('Orders'); // Chuyển đến màn hình Orders
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Đã xảy ra sự cố khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false); // Tắt vòng xoay chờ
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="#391713" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác nhận đặt hàng</Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa Chỉ Nhận Hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ của bạn"
            onChangeText={setAddress}
          />
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !address?.trim() && styles.disabledButton, // Áp dụng style khi địa chỉ trống
            ]}
            onPress={handleConfirmAddress}
            disabled={!address?.trim()} // Vô hiệu hóa nút nếu địa chỉ trống
          >
            <Text style={styles.confirmButtonText}>Xác nhận địa chỉ</Text>
          </TouchableOpacity>
          {/* Hiển thị vòng xoay chờ nếu đang tải */}
          {loading && <ActivityIndicator size="large" color="#E95322" />}
          {/* Hiển thị số km và phí vận chuyển dưới TextInput */}
          {distance !== null && deliveryFee !== null && !loading && (
            <View style={styles.confirmationMessage}>
              <Text style={styles.messageText}>
                Khoảng cách: {distance.toFixed(2)} KM
              </Text>
              <Text style={styles.messageText}>
                Phí vận chuyển: {deliveryFee} VND
              </Text>
            </View>
          )}
        </View>
        {estimatedDeliveryTime && (
          <View style={styles.deliveryTimeContainer}>
            <Text style={styles.deliveryTimeLabel}>
              Thời gian giao hàng dự kiến:
            </Text>
            <Text style={styles.deliveryTimeValue}>
              {estimatedDeliveryTime.toLocaleTimeString('vi-VN')}
            </Text>
          </View>
        )}
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.cancelOrder}>Xóa món</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.itemControls}>
                <Text style={styles.itemPrice}>{item.price} VND</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => decreaseQuantity(item.id)}>
                    <AntDesign name="minuscircleo" size={18} color="#E95322" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => increaseQuantity(item.id)}>
                    <AntDesign name="pluscircleo" size={18} color="#E95322" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'Thanh toán trực tuyến' && styles.activePayment,
            ]}
            onPress={() => setPaymentMethod('Thanh toán trực tuyến')}>
            <AntDesign name="creditcard" size={20} color="#E95322" />
            <Text style={styles.paymentText}>Thanh toán trực tuyến</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'Thanh toán khi nhận hàng' &&
                styles.activePayment,
            ]}
            onPress={() => setPaymentMethod('Thanh toán khi nhận hàng')}>
            <AntDesign name="wallet" size={20} color="#E95322" />
            <Text style={styles.paymentText}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{subtotal} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax and Fees</Text>
            <Text style={styles.value}>{tax} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>{deliveryFee} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{total} VND</Text>
          </View>
        </View>
      </ScrollView>

      {/* Order Button */}
      <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
        <Text style={styles.orderButtonText}>Đặt hàng</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <AntDesign name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <AntDesign name="barschart" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <AntDesign name="customerservice" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Dành không gian cho nút đặt hàng
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5CB58',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#391713',
    marginLeft: 10,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#E95322',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#391713',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#E95322',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#391713',
  },
  cancelOrder: {
    fontSize: 12,
    color: '#E95322',
  },
  itemControls: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E95322',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#391713',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    marginBottom: 10,
  },
  activePayment: {
    borderColor: '#E95322',
    backgroundColor: '#FFF0E0',
  },
  paymentText: {
    fontSize: 16,
    color: '#391713',
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    color: '#676767',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#391713',
  },
  orderButton: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    paddingVertical: 15,
    backgroundColor: '#E95322',
    borderRadius: 10,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmationMessage: {
    marginTop: 10,
    fontSize: 16,
    color: '#391713',
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#391713',
  },
  disabledButton: {
    backgroundColor: '#CCC', // Màu nhạt hơn để hiển thị trạng thái vô hiệu hóa
  },
  deliveryTimeContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF0E0',
    borderRadius: 5,
  },
  deliveryTimeLabel: {
    fontSize: 16,
    color: '#391713',
    fontWeight: 'bold',
  },
  deliveryTimeValue: {
    fontSize: 16,
    color: '#E95322',
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
