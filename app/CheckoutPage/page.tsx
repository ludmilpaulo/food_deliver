'use client'; // Indicate that this code should run on the client side

import React, { useEffect, useState, Suspense } from 'react'; // Import necessary React hooks and components
import { useRouter, useSearchParams } from 'next/navigation'; // Import Next.js navigation hooks
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks for dispatching actions and selecting state
import { selectUser, logoutUser } from '@/redux/slices/authSlice'; // Import actions and selectors from authSlice
import { selectCartItems, clearCart } from '@/redux/slices/basketSlice'; // Import actions and selectors from basketSlice
import dynamic from 'next/dynamic'; // Import dynamic for lazy loading components
import { Transition } from '@headlessui/react'; // Import Transition component from Headless UI
import Image from 'next/image'; // Import Image component from Next.js
import { fetchstoreDetails, fetchUserDetails, completeOrderRequest, validateCouponRequest, checkUserCoupon } from '@/services/checkoutService'; // Import service functions
import ProfileModal from '@/components/ProfileModal'; // Import ProfileModal component
import { getDistance } from 'geolib'; // Import getDistance function from geolib

const AddressInput = dynamic(() => import('./AddressInput'), { ssr: false }); // Dynamically import AddressInput component
const PaymentDetails = dynamic(() => import('./PaymentDetails'), { ssr: false }); // Dynamically import PaymentDetails component

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]); // State for cart items
  const [store, setstore] = useState<any | null>(null); // State for store details
  const [userAddress, setUserAddress] = useState<string>(""); // State for user address
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 }); // State for user location
  const [userDetails, setUserDetails] = useState<any | null>(null); // State for user details
  const [paymentMethod, setPaymentMethod] = useState<string>("Entrega"); // State for payment method
  const [deliveryNotes, setDeliveryNotes] = useState<string>(""); // State for delivery notes
  const [couponCode, setCouponCode] = useState<string>(""); // State for coupon code
  const [discountAmount, setDiscountAmount] = useState<number>(0); // State for discount amount
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false); // State for profile modal visibility
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(true); // State for using current location
  const [loading, setLoading] = useState<boolean>(false); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error message
  const router = useRouter(); // Router instance for navigation
  const searchParams = useSearchParams(); // Hook for accessing search params
  const storeId = searchParams.get('store_id'); // Get store_id from search params
  const dispatch = useDispatch(); // Redux dispatch function
  const user = useSelector(selectUser); // Selector for user state
  const allCartItems = useSelector(selectCartItems); // Selector for cart items

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedItems = sessionStorage.getItem('checkoutItems'); // Retrieve stored items from session storage
      if (storedItems) {
        setItems(JSON.parse(storedItems)); // Set items state from stored items
      }

      if (storeId) {
        fetchstoreDetails(storeId)
          .then(setstore) // Fetch and set store details
          .catch((error) => console.error('Erro ao buscar detalhes do storee:', error)); // Handle errors
      }

      if (user?.user_id && user?.token) {
        fetchUserDetails(user.user_id, user.token)
          .then((details) => {
            setUserDetails(details); // Fetch and set user details
            checkUserCoupon(user.token)
              .then((couponResponse) => {
                if (couponResponse.status === "success") {
                  setCouponCode(couponResponse.coupon_code); // Set coupon code if available
                  alert(`Você tem um cupom de desconto! Código: ${couponResponse.coupon_code}`);
                }
              })
              .catch((error) => console.error('Erro ao verificar cupom do usuário:', error)); // Handle errors

            if (!details.avatar) {
              setIsProfileModalOpen(true); // Open profile modal if avatar is missing
            }
          })
          .catch((error) => {
            console.error('Erro ao buscar detalhes do usuário:', error); // Handle errors
            dispatch(logoutUser()); // Logout user on error
          });
      }
      getUserLocation(); // Get user location
    }
  }, [storeId, user?.user_id, user?.token, dispatch]); // Dependency array for useEffect

  const getUserLocation = async () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }); // Set user location from geolocation API
        },
        () => {
          alert("Não foi possível obter sua localização"); // Handle geolocation errors
        },
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador."); // Handle unsupported geolocation
    }
  };

  const calculateDeliveryFee = () => {
    if (!store || !location.latitude || !location.longitude) return 100; // Return minimum fee if data is missing

    const userLocation = { latitude: location.latitude, longitude: location.longitude }; // User location
    const storeLocation = { latitude: parseFloat(store.location.split(',')[0]), longitude: parseFloat(store.location.split(',')[1]) }; // store location
    const distance = getDistance(userLocation, storeLocation) / 1000; // Calculate distance in kilometers

    const additionalFee = distance * 20; // 20 Kz per km
    return additionalFee < 20 ? 100 : 100 + additionalFee; // Ensure minimum fee is 100 Kz
  };

  const applyCoupon = async () => {
    setLoading(true); // Set loading state
    setError(null); // Clear previous errors

    try {
      const response = await validateCouponRequest(couponCode); // Validate coupon
      if (response.status === "success") {
        setDiscountAmount(response.discount_amount); // Set discount amount if successful
      } else {
        setError(response.error); // Set error message if failed
      }
    } catch (error) {
      console.error('Erro ao validar o cupom:', error); // Handle validation errors
      setError("Ocorreu um erro ao validar o cupom.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const completeOrder = async () => {
    setLoading(true); // Set loading state
    setError(null); // Clear previous errors
    const formattedCartItems = allCartItems.map((item) => ({
      meal_id: item.id,
      quantity: item.quantity,
    })); // Format cart items for order
    const resId = allCartItems.map(({ store }) => store);
    const storeId = resId[0].toString(); // Get store ID
    const orderDetails = formattedCartItems; // Set order details
    const deliveryFee = calculateDeliveryFee(); // Calculate delivery fee

    const orderData = {
      access_token: user.token,
      store_id: storeId,
      address: useCurrentLocation ? `${location.latitude},${location.longitude}` : userAddress,
      order_details: orderDetails,
      payment_method: paymentMethod,
      delivery_notes: deliveryNotes,
      delivery_fee: deliveryFee,
      coupon_code: couponCode,
      use_current_location: useCurrentLocation,
      location: location
    }; // Prepare order data

    try {
      const responseData = await completeOrderRequest(orderData); // Complete order request

      if (responseData.status === "success") {
        dispatch(clearCart(parseInt(storeId))); // Clear cart if successful
        alert("Pedido Realizado com Sucesso!"); // Show success message
        router.push("/SuccessScreen"); // Navigate to success screen
      } else {
        alert(responseData.status); // Show error message
      }
    } catch (error) {
      console.error('Erro ao completar pedido:', error); // Handle order errors
      setError("Ocorreu um erro ao completar o pedido.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0); // Calculate total price
  const deliveryFee = calculateDeliveryFee(); // Calculate delivery fee
  const finalPrice = totalPrice + deliveryFee - discountAmount; // Calculate final price

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {store && (
        <>
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">Checkout - {store.name}</h1>
          <div className="flex justify-center mb-6">
            <Image src={store.logo} alt={store.name} width={200} height={200} className="rounded-lg" />
          </div>
        </>
      )}

      {typeof window !== "undefined" && (
        <>
          <AddressInput useCurrentLocation={useCurrentLocation} setUseCurrentLocation={setUseCurrentLocation} userAddress={userAddress} setUserAddress={setUserAddress} />
          <PaymentDetails paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          <textarea
            className="w-full p-2 border border-gray-300 rounded mt-4"
            placeholder="Notas de entrega para o motorista"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
          ></textarea>
          <input
            className="w-full p-2 border border-gray-300 rounded mt-4"
            placeholder="Código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            className="w-full h-10 mt-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition duration-300"
            onClick={applyCoupon}
            disabled={loading}
          >
            Aplicar Cupom
          </button>
        </>
      )}

      <div className="flex justify-between items-center my-4">
        <p className="text-lg font-semibold text-gray-800">Total: {totalPrice.toFixed(2)} Kz</p>
        <p className="text-lg font-semibold text-gray-800">Taxa de Entrega: {deliveryFee.toFixed(2)} Kz</p>
        <p className="text-lg font-semibold text-gray-800">Desconto: -{discountAmount.toFixed(2)} Kz</p>
        <p className="text-lg font-semibold text-gray-800">Preço Final: {finalPrice.toFixed(2)} Kz</p>
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
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
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
    <Suspense fallback={<div>Carregando...</div>}>
      <CheckoutPage />
    </Suspense>
  );
};

export default CheckoutPageWrapper;
