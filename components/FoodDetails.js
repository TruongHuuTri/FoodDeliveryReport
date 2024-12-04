import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList,Alert } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

const FoodDetails = ({ route, navigation }) => {
  const { food, addToCart } = route.params; // Dữ liệu từ Home
  const [quantity, setQuantity] = useState(1);

const handleAddToCart = () => {
    const cartItem = {
      ...food,
      quantity,
    };

    addToCart(cartItem); // Gọi hàm addToCart từ Home
    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng!');
    navigation.goBack(); // Quay lại màn hình trước (Home)
  };

  // Ingredients mặc định
  const [ingredients, setIngredients] = useState([
    { id: 1, name: 'Source', price: 0, selected: false },
    { id: 2, name: 'Crisp Onion', price: 0, selected: false },
    { id: 3, name: 'Salad', price: 0, selected: false },
    { id: 4, name: 'Chili', price: 0, selected: false },
    { id: 5, name: 'Lemon', price: 0, selected: false },
  ]);

  const toggleIngredient = (id) => {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id
          ? { ...ingredient, selected: !ingredient.selected }
          : ingredient
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.foodTitle}>{food.name}</Text>
        {food.liked && ( // Chỉ hiển thị trái tim nếu liked = true
          <TouchableOpacity>
            <AntDesign name="hearto" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
      {/* Rating */}
      <Text style={styles.foodRate}>⭐ {food.rate}</Text>

      {/* Food Image */}
      <Image source={{ uri: food.image }} style={styles.foodImage} />

      {/* Description */}
      <Text style={styles.foodDescription}>{food.description}</Text>

      {/* Price and Quantity */}
      <View style={styles.priceContainer}>
        <Text style={styles.foodPrice}>{food.price} VND</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
          >
            <AntDesign name="minus" size={20} color="#FF6D00" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity((prev) => prev + 1)}>
            <AntDesign name="plus" size={20} color="#FF6D00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Add on ingredients</Text>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.ingredientContainer}
            onPress={() => toggleIngredient(item.id)}
          >
            <Text style={styles.ingredientName}>{item.name}</Text>
            <AntDesign
              name={item.selected ? 'checkcircle' : 'checkcircleo'}
              size={20}
              color={item.selected ? '#FF6D00' : '#ccc'}
            />
          </TouchableOpacity>
        )}
      />

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>

      {/* Footer NavBar giữ nguyên style */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  foodTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  foodRate: { fontSize: 16, color: '#E95322', marginVertical: 5 },
  foodImage: { width: '100%', height: 200, borderRadius: 15, marginVertical: 20 },
  foodDescription: { fontSize: 16, color: '#555', marginBottom: 20 },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  foodPrice: { fontSize: 22, fontWeight: 'bold', color: '#FF6D00' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    borderRadius: 20,
    padding: 10,
  },
  quantity: { fontSize: 16, marginHorizontal: 10, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  ingredientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ingredientName: { fontSize: 16, color: '#333' },
  addToCartButton: {
    position: 'absolute',
    bottom: 70, // Đặt ngay trên thanh footer
    left: 20,
    right: 20,
    backgroundColor: '#FF6D00',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    zIndex: 10, // Đảm bảo nút nổi lên trên các thành phần khác
  },
  addToCartText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
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
});

export default FoodDetails;
