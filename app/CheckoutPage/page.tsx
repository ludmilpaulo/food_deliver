"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from '@/redux/slices/authSlice';
import { selectCartItems, clearCart } from '@/redux/slices/basketSlice';
import dynamic from 'next/dynamic';
import { Transition } from '@headlessui/react';
import Image from 'next/image';
import { fetchRestaurantDetails, fetchUserDetails, completeOrderRequest } from '@/services/checkoutService';
import ProfileModal from '@/components/ProfileModal';

const AddressInput = dynamic(() => import('./AddressInput'), { ssr: false });
const PaymentDetails = dynamic(() => import('./PaymentDetails'), { ssr: false });

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Entrega");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

      if (user?.user_id && user?.token) {
        fetchUserDetails(user.user_id, user.token)
          .then((details) => {
            setUserDetails(details);
            if (!details.avatar) {
              setIsProfileModalOpen(true);
            }
          })
          .catch((error) => {
            console.error('Erro ao buscar detalhes do usuário:', error);
            dispatch(logoutUser());
          });
      }
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
          alert("Não foi possível obter sua localização");
        },
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador.");
    }
  };

  const completeOrder = async () => {
    console.log("order");
    setLoading(true);
    setError(null);
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
    console.log("order data=>", orderData);

    try {
      const responseData = await completeOrderRequest(orderData);
      if (responseData.status === "success") {
        dispatch(clearCart(parseInt(restaurantId))); // Dispatch clearCart with restaurant ID
        router.push("/SuccessScreen");
      } else {
        alert(responseData.status);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      setError("An error occurred while completing the order.");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {restaurant && (
        <>
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">Checkout - {restaurant.name}</h1>
          <div className="flex justify-center mb-6">
            <Image src={restaurant.logo} alt={restaurant.name} width={200} height={200} className="rounded-lg" />
          </div>
        </>
      )}

      {typeof window !== "undefined" && (
        <>
          <AddressInput useCurrentLocation={useCurrentLocation} setUseCurrentLocation={setUseCurrentLocation} userAddress={userAddress} setUserAddress={setUserAddress} />
          <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        </>
      )}

      <div className="flex justify-between items-center my-4">
        <p className="text-lg font-semibold text-gray-800">Total: {totalPrice} Kz</p>
      </div>

      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
      </Transition>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <button
        className={`flex items-center justify-center w-full h-10 my-4 bg-blue-600 text-white font-semibold rounded-full ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 transition duration-300'}`}
        onClick={completeOrder}
        disabled={loading}
      >
        FAÇA SEU PEDIDO
      </button>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userDetails={userDetails}
        onUpdate={(updatedDetails: any) => setUserDetails(updatedDetails)}
      />
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
