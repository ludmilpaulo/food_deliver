import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, updateBasket } from '../redux/slices/basketSlice';
import Image from "next/image";

interface CartItem {
    id: number;
    image?: string;
    name?: string;
    price?: number;
    quantity?: number;
}

const CartMenu: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  console.log('all in', cartItems)

  const incrementQuantity = (item: CartItem) => {
    const updatedQuantity = (item.quantity || 0) + 1;
    const updatedPrice = updatedQuantity * (item.price || 0);
    dispatch(updateBasket({ 
      ...item, 
      quantity: updatedQuantity, 
      price: updatedPrice,
      resName: item.name || "",
      resImage: item.image || "",
      resId: item.id
    }));
  }
  
  const decrementQuantity = (item: CartItem) => {
    if ((item.quantity || 0) > 0) {
      const updatedQuantity = (item.quantity || 0) - 1;
      const updatedPrice = updatedQuantity > 0 ? updatedQuantity * (item.price || 0) : 0;
      dispatch(updateBasket({ 
        ...item, 
        quantity: updatedQuantity, 
        price: updatedPrice,
        resName: item.name || "",
        resImage: item.image || "",
        resId: item.id
      }));
    }
  }
  
  
  

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        {cartItems.map((item: CartItem) => {
          const totalPrice = (item.price || 0) * (item.quantity || 0);

          return (
            <div key={item.id} className="flex flex-col items-center bg-gray-200 p-4 rounded-md w-full md:w-1/2 lg:w-1/3">
              <Image
                className="w-32 h-32 mb-4 rounded-full sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-64 lg:h-32 xl:w-32 xl:h-32"
                width={300}
                height={300}
                src={item.image || "/path/to/default/image.jpg"}
                alt={item.name || "Default name"}
              />
              <p className="text-xl font-bold">{item.name}</p>
              <p className="text-lg">Price: {item.price}</p>
              <p className="text-lg">Quantity: {item.quantity}</p>
              <p className="text-lg">Total: {totalPrice}</p>
              <div className="flex space-x-4">
                <button onClick={() => incrementQuantity(item)} className="bg-blue-500 text-white p-2 rounded">+</button>
                <button onClick={() => decrementQuantity(item)} className="bg-red-500 text-white p-2 rounded">-</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default CartMenu;
