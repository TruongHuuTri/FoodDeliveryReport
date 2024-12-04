import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { order } = route.params;

  // Tính toán tổng giá trị đơn hàng
  const calculateTotalPrice = () => {
    return (
      (order.total_food || 0) + (order.total_tax || 0) + (order.delivery_fee || 0)
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Chi tiết đơn hàng</Text>

        {/* Địa chỉ giao hàng */}
        <Text style={styles.infoText}>Địa chỉ giao hàng: {order.address}</Text>
        <Text style={styles.infoText}>
          Ngày đặt hàng: {new Date(order.created_at).toLocaleString()}
        </Text>
        <Text style={styles.infoText}>
          Thời gian giao hàng dự kiến:{' '}
          {order.estimated_delivery_time
            ? new Date(order.estimated_delivery_time).toLocaleTimeString('vi-VN')
            : 'Chưa xác định'}
        </Text>

        {/* Danh sách sản phẩm */}
        {order.items && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name || 'Sản phẩm'}</Text>
                <Text>
                  {item.quantity} x {item.price} VND
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Không có sản phẩm nào trong đơn hàng</Text>
        )}

        {/* Tổng giá */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Tổng giá món: {order.total_food || 0} VND
          </Text>
          <Text style={styles.summaryText}>
            Thuế: {order.total_tax || 0} VND
          </Text>
          <Text style={styles.summaryText}>
            Phí vận chuyển: {order.delivery_fee || 0} VND
          </Text>
          <Text style={styles.summaryText}>
            Tổng cộng: {calculateTotalPrice()} VND
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <AntDesign name="home" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <AntDesign name="barschart" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
          <AntDesign name="customerservice" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
    textAlign: 'center',
    color: '#E95322',
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#676767',
    marginTop: 20,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    marginVertical: 10,
  },
  summaryText: {
    fontSize: 16,
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
    borderTopWidth: 0,
  },
});

export default OrderDetailsScreen;
