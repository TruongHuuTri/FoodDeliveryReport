import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabaseFetch } from '../supabase'; // Import hàm supabaseFetch

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tải danh sách đơn hàng ban đầu
    loadOrdersFromSupabase();

    // Đặt lịch kiểm tra trạng thái đơn hàng định kỳ
    const interval = setInterval(() => {
      updateExpiredOrders();
    }, 60000); // Mỗi phút kiểm tra một lần

    return () => clearInterval(interval);
  }, []);

  const loadOrdersFromSupabase = async () => {
    setLoading(true);
    try {
      const orders = await supabaseFetch('orders');
      setOrders(orders);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await supabaseFetch(`orders?id=eq.${id}`, 'PATCH', { status });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );

      Alert.alert('Thành công', `Trạng thái đơn hàng đã được cập nhật thành "${status}".`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  const updateExpiredOrders = async () => {
    const now = new Date();

    const updatedOrders = orders.map((order) => {
      if (
        order.status === 'active' &&
        new Date(order.estimated_delivery_time) < now
      ) {
        updateOrderStatus(order.id, 'cancelled');
      }
      return order;
    });

    setOrders(updatedOrders);
  };

  const handleConfirm = (id) => {
    Alert.alert('Xác nhận hành động', 'Bạn muốn làm gì với đơn hàng này?', [
      {
        text: 'Hủy đơn hàng',
        onPress: () => updateOrderStatus(id, 'cancelled'),
        style: 'destructive',
      },
      {
        text: 'Xác nhận nhận hàng',
        onPress: () => updateOrderStatus(id, 'completed'),
      },
      {
        text: 'Đóng',
        style: 'cancel',
      },
    ]);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'Active') return order.status === 'active';
    if (filter === 'Completed') return order.status === 'completed';
    if (filter === 'Cancelled') return order.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        {['Active', 'Completed', 'Cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.activeFilterButton]}
            onPress={() => setFilter(status)}>
            <Text style={[styles.filterButtonText, filter === status && styles.activeFilterText]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#E95322" />
        ) : filteredOrders.length === 0 ? (
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity key={order.id} onPress={() => navigation.navigate('OrderDetails', { order })}>
              <View style={styles.orderCard}>
                <Image source={{ uri: order.items[0]?.image || 'https://via.placeholder.com/80' }} style={styles.image} />
                <View style={styles.infoContainer}>
                  <Text style={styles.itemName}>{order.items[0]?.name || 'Sản phẩm không rõ'}</Text>
                  <Text style={styles.date}>{new Date(order.created_at).toLocaleString()}</Text>
                  <Text style={styles.status}>
                    {order.status === 'completed'
                      ? 'Order delivered'
                      : order.status === 'active'
                      ? 'In progress'
                      : 'Cancelled'}
                  </Text>
                </View>
                <View style={styles.actionContainer}>
                  <Text style={styles.price}>{order.total_price} VND</Text>
                  {filter === 'Active' && (
                    <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirm(order.id)}>
                      <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  filterButton: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#FFD7C6',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#E95322',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#E95322',
  },
  activeFilterText: {
    color: '#FFF',
  },
  scrollContainer: {
    padding: 10,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#676767',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: '#E95322',
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E95322',
    marginBottom: 10,
  },
  confirmButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E95322',
    borderRadius: 5,
  },
  confirmText: {
    fontSize: 14,
    color: '#FFF',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#E95322',
  },
});

export default OrdersScreen;
