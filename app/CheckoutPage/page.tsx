"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '@/redux/slices/authSlice';
import { selectCartItems, clearCart } from '@/redux/slices/basketSlice';
import MapComponent from '@/components/MapComponent';
import { fetchRestaurantDetails, fetchUserDetails, completeOrderRequest } from '@/services/checkoutService';
import { baseAPI } from '@/services/types';
import AddressInput from './AddressInput';
import PaymentDetails from './PaymentDetails';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Entrega");
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant_id');
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allCartItems = useSelector(selectCartItems);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedItems = sessionStorage.getItem('checkoutItems');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }

      if (restaurantId) {
        fetchRestaurantDetails(restaurantId)
          .then(setRestaurant)
          .catch((error) => console.error('Error fetching restaurant details:', error));
      }

      fetchUserDetails(user?.user_id, user?.token)
        .then(setUserDetails)
        .catch((error) => {
          console.error('Error fetching user details:', error);
          dispatch(logoutUser());
        });

      getUserLocation();
    }
  }, [restaurantId, user?.user_id, user?.token, dispatch]);

  const getUserLocation = async () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          alert("Unable to retrieve your location");
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const completeOrder = async () => {
    const formattedCartItems = allCartItems.map((item) => ({
      meal_id: item.id,
      quantity: item.quantity,
    }));
    const resId = allCartItems.map(({ restaurant }) => restaurant);
    const restaurantId = resId[0].toString();
    const orderDetails = formattedCartItems;

    const orderData = {
      access_token: user.token,
      restaurant_id: restaurantId,
      address: useCurrentLocation ? `${location.latitude},${location.longitude}` : userAddress,
      order_details: orderDetails,
    };

    completeOrderRequest(orderData)
      .then((responseData) => {
        if (responseData.status === "success") {
          dispatch(clearCart(parseInt(restaurantId))); // Dispatch clearCart with restaurant ID
          router.push("/SuccessScreen");
        } else {
          alert(responseData.status);
        }
      })
      .catch((error) => {
        console.error('Error completing order:', error);
        alert("An error occurred while completing the order.");
      });
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {restaurant && (
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Checkout - {restaurant.name}</h1>
      )}

      <MapComponent latitude={location.latitude} longitude={location.longitude} avatarUrl={`${baseAPI}${userDetails?.avatar || "/path/to/default/image.png"}`} />

      <AddressInput useCurrentLocation={useCurrentLocation} setUseCurrentLocation={setUseCurrentLocation} userAddress={userAddress} setUserAddress={setUserAddress} />

      <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />

      <div className="flex justify-between items-center my-4">
        <p className="text-lg font-semibold text-gray-800">Total: {totalPrice} Kz</p>
      </div>

      <div
        className="flex items-center justify-center w-full h-10 my-4 bg-blue-600 text-white font-semibold rounded-full cursor-pointer hover:bg-blue-700 transition duration-300"
        onClick={completeOrder}
      >
        <p>FAÇA SEU PEDIDO</p>
      </div>
    </div>
  );
};

const CheckoutPageWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPage />
    </Suspense>
  );
};

export default CheckoutPageWrapper;
