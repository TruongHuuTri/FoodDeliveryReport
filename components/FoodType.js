import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const FoodType = ({ route, navigation }) => {
  const {
    type = '',
    foodData = [],
    cart = [],
    setCart = () => {},
    isFocused = false,
    setIsFocused = () => {},
    searchText = '',
    setSearchText = () => {},
  } = route.params || {};
 const [cartVisible, setCartVisible] = useState(false); // Hiển thị giỏ hàng
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width)
  ).current; // Giá trị bắt đầu (ngoài màn hình)
  // Lấy sản phẩm trong giỏ hàng từ API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(
          'https://6736bc5faafa2ef2223158d1.mockapi.io/api/food?status=incart'
        );
        const data = await response.json();
        setCart(Array.isArray(data) ? data : []); // Đảm bảo luôn là mảng
      } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
      }
    };

    fetchCart();
  }, [setCart]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (item) => {
    try {
      const existingItem = cart.find((cartItem) => cartItem.id === item.id);

      if (!existingItem) {
        // Sản phẩm chưa có trong giỏ hàng, thêm mới vào giỏ
        await fetch(
          `https://6736bc5faafa2ef2223158d1.mockapi.io/api/food/${item.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'incart',
              quantity: 1,
            }),
          }
        );

        // Thêm sản phẩm vào giỏ hàng
        setCart((prevCart) => [...prevCart, { ...item, quantity: 1 }]);
        // Hiển thị thông báo thành công
        Alert.alert(
          'Thêm vào giỏ hàng',
          'Sản phẩm đã được thêm vào giỏ hàng thành công!',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      } else {
        // Sản phẩm đã có trong giỏ hàng, tăng số lượng
        await fetch(
          `https://6736bc5faafa2ef2223158d1.mockapi.io/api/food/${item.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'incart',
              quantity: existingItem.quantity + 1, // Tăng số lượng
            }),
          }
        );

        // Cập nhật giỏ hàng với số lượng mới
        setCart((prevCart) =>
          prevCart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 } // Cập nhật số lượng
              : cartItem
          )
        );
        // Hiển thị thông báo thành công
        Alert.alert(
          'Thêm vào giỏ hàng',
          'Sản phẩm đã được thêm vào giỏ hàng thành công!',
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
        );
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
    }
  };

  // Giảm số lượng sản phẩm
  const decreaseQuantity = (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);

    if (item.quantity === 1) {
      setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== id));
    } else {
      setCart((prevCart) =>
        prevCart.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    }
  };

  // Tăng số lượng sản phẩm
  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  // Tính tổng giá
  const calculateTotal = () => {
    if (!Array.isArray(cart))
      return { subtotal: 0, taxAndFees: 0, delivery: 0, total: 0 };

    const subtotal = cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const taxAndFees = subtotal * 0.1; // Thuế là 10%
    const delivery = 10000; // Phí giao hàng cố định
    return {
      subtotal,
      taxAndFees,
      delivery,
      total: subtotal + taxAndFees + delivery,
    };
  };

  // Render sản phẩm trong giỏ hàng
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{item.price} VND</Text>
        <View style={styles.cartItemQuantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.id)}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.id)}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Mở modal giỏ hàng
  const openCart = () => {
    setCartVisible(true);
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width * 0.05,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Đóng modal giỏ hàng
  const closeCart = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width, // Đẩy modal ra khỏi màn hình
      duration: 300,
      useNativeDriver: false,
    }).start(() => setCartVisible(false));
  };
  // Kiểm tra params đã được truyền đúng
  console.log('Route params:', route.params);

  // Lọc món ăn theo `type`
  const foodsByType = foodData.filter((item) => item.type === type);
  const renderFoodItem = ({ item }) => (
    <TouchableOpacity
      style={styles.foodItemContainer}
      onPress={() => navigation.navigate('FoodDetails', { food: item })}>
      <Image source={{ uri: item.image }} style={styles.foodItem} />
      {item.liked && (
        <AntDesign
          name="heart"
          size={18}
          color="red"
          style={styles.heartIcon}
        />
      )}
      <View style={styles.suggestedFoodDetails}>
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodPrice}>{item.price} VND</Text>
        </View>
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => {
            console.log('Adding to cart:', item); // Kiểm tra món ăn khi nhấn vào
            addToCart(item);
          }}>
          <AntDesign name="shoppingcart" size={18} color="gold" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal giỏ hàng */}
      {cartVisible && (
        <TouchableWithoutFeedback onPress={closeCart}>
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.cartContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}>
              <Text style={styles.cartTitle}>
                <AntDesign name="shoppingcart" size={24} /> Cart
              </Text>
              <Text style={styles.cartSubtitle}>
                You have {Array.isArray(cart) ? cart.length : 0} items in the
                cart
              </Text>
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
              />
              <View style={styles.cartSummary}>
                <Text>Subtotal: {calculateTotal().subtotal} VND</Text>
                <Text>Tax and Fees: {calculateTotal().taxAndFees} VND</Text>
                <Text>Delivery: {calculateTotal().delivery} VND</Text>
                <Text>Total: {calculateTotal().total} VND</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  cart.length === 0 && styles.disabledButton, // Vô hiệu hóa khi giỏ hàng rỗng
                ]}
                disabled={cart.length === 0}
                onPress={() => {
                  if (cart.length > 0) {
                    navigation.navigate('CheckOut', {
                      cart,
                      clearCart: () => setCart([]),
                    }); // Điều hướng đến CheckoutScreen và truyền giỏ hàng
                  }
                }}>
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Thanh tìm kiếm */}
      <View style={styles.searchBar}>
        <View style={styles.searchLeftContainer}>
          <TextInput
            style={[styles.searchInput, isFocused && styles.searchInputFocused]}
            placeholder="Search"
            placeholderTextColor="#676767"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <TouchableOpacity
            onPress={() => console.log('Search:', searchText)}
            style={styles.searchIconButton}>
            <AntDesign
              name="search1"
              size={24}
              color={isFocused ? '#E95322' : 'black'}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        {/* Icons User và Cart */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={openCart}>
            <AntDesign name="shoppingcart" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <AntDesign name="user" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{type}</Text>
      <FlatList
        data={foodsByType}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.foodList}
      />
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
  container: { flex: 1, backgroundColor: '#FFFBEA' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E95322',
    marginVertical: 20,
  },
  foodList: {
    paddingHorizontal: 10,
  },
  foodItemContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  foodItem: { width: '100%', height: 120, borderRadius: 10 },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  foodDetails: { alignSelf: 'left', marginTop: 5 },
  foodName: { fontSize: 14, fontWeight: 'bold' },
  foodPrice: { fontSize: 12, color: '#888' },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#E95322',
    borderTopWidth: 0,
  },
  suggestedFoodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  cartIcon: {
    marginTop: 5,
    alignSelf: 'right',
    backgroundColor: '#E95322',
    padding: 5,
    borderRadius: 10,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 10,
  },
  searchLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 20,
    width: '70%',
    borderColor: '#E95322',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 30,
    fontSize: 16,
    color: '#676767',
    borderWidth: 0,
    borderRadius: 20,
  },
  searchInputFocused: {
    borderColor: '#E95322',
    borderWidth: 1,
  },
  searchIconButton: {
    position: 'absolute',
    right: 10,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#E95322',
    borderRadius: 15,
    padding: 10,
    marginLeft: 10,
  },
  // Nền mờ phía sau giỏ hàng
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ
    zIndex: 10, // Đảm bảo nền nằm trên các thành phần khác
  },

  // Container của giỏ hàng
  cartContainer: {
    width: Dimensions.get('window').width * 0.7, // Chiếm 70% màn hình
    height: '70%',
    marginTop: 100,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FFA07A',
    padding: 20,
    zIndex: 11, // Đảm bảo nằm trên nền mờ
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  cartSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cartItemImage: {
    width: 50,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#555',
  },
  cartItemQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: '#E95322',
    justifyContent: 'center',
    borderRadius: '50%',
    width: 20,
    height: 20,
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  cartSummary: {
    marginTop: 20,
  },
  checkoutButton: {
    marginTop: 20,
    backgroundColor: '#E95322',
    paddingVertical: 10,
    paddingHorizontal: 20, // Thêm padding ngang để cân đối
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center', // Căn giữa nút
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCC', // Màu nhạt hơn cho nút khi bị vô hiệu hóa
  },
});

export default FoodType;
