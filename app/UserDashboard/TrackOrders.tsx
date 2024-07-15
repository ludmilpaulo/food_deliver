import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { toggleWidget, deleteMessages, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import { baseAPI } from '@/services/types';
import { selectUser } from '@/redux/slices/authSlice';
import { useSelector } from 'react-redux';
import useLoadScript from '@/hooks/useLoadScript';

interface LocationType {
  latitude: number;
  longitude: number;
}

interface RestaurantType {
  id: number;
  name: string;
  phone: string;
  address: string;
  logo: string;
  location: LocationType;
  restaurant_license: string;
  banner: string;
  is_approved: boolean;
}

const toRadians = (degrees: number) => {
  return degrees * (Math.PI / 180);
};

const haversineDistance = (coords1: LocationType, coords2: LocationType) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLng = toRadians(coords2.longitude - coords1.longitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(coords1.latitude)) * Math.cos(toRadians(coords2.latitude)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in km
  const duration = (distance / 50) * 60; // Estimate duration assuming average speed of 50 km/h

  return { distance, duration };
};

const parseLocation = (location: string): LocationType => {
  const cleanedLocation = location.replace(/[{}]/g, '').replace(/[\s]/g, '').split(',');
  const latitude = parseFloat(cleanedLocation[0].split(':')[1]);
  const longitude = parseFloat(cleanedLocation[1].split(':')[1]);
  return { latitude, longitude };
};

const getGeocodedAddress = async (location: LocationType): Promise<string> => {
  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`);
  if (response.data.results && response.data.results.length > 0) {
    return response.data.results[0].formatted_address;
  }
  return 'Endereço não disponível';
};

const TrackOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderLocations, setOrderLocations] = useState<{ [key: number]: any }>({});
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [distances, setDistances] = useState<{ [key: number]: any }>({});
  const [addresses, setAddresses] = useState<{ [key: number]: string }>({});
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);

  const user = useSelector(selectUser);

  // Load the Google Maps script
  useLoadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&callback=initMap`, () => {
    (window as any).initMap = (location: LocationType) => {
      const mapElement = document.getElementById('map');
      if (mapElement) {
        const map = new google.maps.Map(mapElement, {
          center: { lat: location.latitude, lng: location.longitude },
          zoom: 15
        });
        new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: 'Driver Location',
          icon: 'path/to/your/delivery_person_with_logo_final.png' // Update this path as needed
        });
      } else {
        console.error('Map element not found');
      }
    };
  });

  useEffect(() => {
    // Fetch all non-delivered orders
    axios.post(`${baseAPI}/customer/customer/order/latest/`, { access_token: user.token })
      .then(response => {
        console.log('Orders response:', response.data);
        setOrders(response.data.orders);
      })
      .catch(error => {
        console.error('Error fetching the orders:', error);
      });

    // Fetch driver locations for all non-delivered orders
    axios.post(`${baseAPI}/customer/customer/driver/location/`, { access_token: user.token })
      .then(async (response) => {
        console.log('Driver locations response:', response.data);
        const locations = response.data.order_locations.reduce((acc: any, loc: any) => {
          acc[loc.order_id] = loc;
          return acc;
        }, {});
        setOrderLocations(locations);

        // Get addresses for driver locations
        const newAddresses: { [key: number]: string } = { ...addresses };
        for (const orderId in locations) {
          if (locations[orderId].driver_location) {
            const parsedLocation = parseLocation(locations[orderId].driver_location);
            newAddresses[parseInt(orderId)] = await getGeocodedAddress(parsedLocation);
          }
        }
        setAddresses(newAddresses);
      })
      .catch(error => {
        console.error('Error fetching driver locations:', error);
      });

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    }
  }, [user.token, addresses]);

  const fetchChatMessages = useCallback((order: any) => {
    console.log('Fetching chat messages for order:', order.id);
    // Fetch chat messages for the selected order
    axios.get(`${baseAPI}/info/get_order_chat/${order.id}/`)
      .then(response => {
        console.log('Chat messages response:', response.data);
        const newMessages = response.data;
        if (newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          if (lastMessageId === null || latestMessage.id > lastMessageId) {
            setLastMessageId(latestMessage.id);
            // Send notification if new message
            if (Notification.permission === "granted") {
              new Notification("New message", {
                body: latestMessage.message,
              });
            }
          }
        }
        setChatMessages(newMessages);
        deleteMessages(newMessages.length);
        newMessages.forEach((msg: any) => {
          addResponseMessage(msg.message);
        });
      })
      .catch(error => {
        console.error('Error fetching chat messages:', error);
      });
  }, [lastMessageId]);

  useEffect(() => {
    if (currentOrder) {
      const interval = setInterval(() => fetchChatMessages(currentOrder), 3000); // Poll every 3 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [currentOrder, fetchChatMessages]);

  const handleOrderSelection = (order: any) => {
    console.log('Order selected:', order.id);
    setCurrentOrder(order);
    fetchChatMessages(order);
    toggleWidget();
  };

  const handleNewUserMessage = (newMessage: string) => {
    if (currentOrder) {
      console.log('Sending new message:', newMessage);
      // Send chat message
      axios.post(`${baseAPI}/info/send_chat_message/`, {
        user_id: user.user_id,
        order_id: currentOrder.id,
        message: newMessage
      })
        .then(response => {
          console.log('Send message response:', response.data);
          fetchChatMessages(currentOrder); // Refetch chat messages to include the new message
        })
        .catch(error => {
          console.error('Error sending chat message:', error);
        });
    }
  };

  const openGoogleMaps = (location: LocationType) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const calculateDistanceAndTime = useCallback(() => {
    if (userLocation) {
      const newDistances = { ...distances };
      orders.forEach((order) => {
        const driverLocation = orderLocations[order.id]?.driver_location;
        if (driverLocation) {
          const parsedLocation = parseLocation(driverLocation);
          const result = haversineDistance(userLocation, parsedLocation);
          newDistances[order.id] = {
            distance: `${result.distance.toFixed(2)} km`,
            duration: `${Math.ceil(result.duration)} mins`
          };
        }
      });
      setDistances(newDistances);
    }
  }, [userLocation, orders, orderLocations, distances]);

  useEffect(() => {
    calculateDistanceAndTime();
  }, [userLocation, orders, orderLocations, calculateDistanceAndTime]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Rastrear Pedidos</h1>
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Pedido ID: {order.id}</h2>
              <p className="text-gray-700"><strong>Status:</strong> {order.status}</p>
              {orderLocations[order.id]?.driver_location ? (
                <>
                  <p className="text-gray-700"><strong>Endereço do Motorista:</strong> {addresses[order.id] || 'Carregando endereço...'}</p>
                  {distances[order.id] ? (
                    <>
                      <p className="text-gray-700"><strong>Distância:</strong> {distances[order.id].distance}</p>
                      <p className="text-gray-700"><strong>Tempo Estimado:</strong> {distances[order.id].duration}</p>
                    </>
                  ) : (
                    <p className="text-gray-700">Calculando distância e tempo...</p>
                  )}
                  <button
                    onClick={() => openGoogleMaps(parseLocation(orderLocations[order.id].driver_location))}
                    className="mt-2 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                  >
                    Ver no Google Maps
                  </button>
                  <div id="map" className="h-64 w-full mt-4"></div>
                  <button
                    onClick={() => (window as any).initMap(parseLocation(orderLocations[order.id].driver_location))}
                    className="mt-2 w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-300"
                  >
                    Ver Mapa
                  </button>
                </>
              ) : (
                <p className="text-gray-700"><strong>O pedido está sendo preparado por:</strong> {orderLocations[order.id]?.restaurant}</p>
              )}
              <p className="text-gray-700"><strong>PIN Secreto:</strong> {orderLocations[order.id]?.secret_pin}</p>
              <button
                onClick={() => handleOrderSelection(order)}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
              >
                Ver Detalhes e Conversar com o Motorista
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-700">Carregando informações dos pedidos...</p>
      )}
      <div className={`chat-widget bg-white rounded-lg shadow-md mt-6 p-4 ${currentOrder ? 'block' : 'hidden'}`}>
        <h2 className="text-2xl font-bold mb-4">Chat com o Motorista</h2>
        <div className="chat-messages overflow-y-scroll h-64 p-4 rounded-lg shadow-inner mb-4 bg-gray-50">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`message mb-2 p-2 rounded-lg ${message.sender_username === 'driver' ? 'bg-blue-200 text-right' : 'bg-green-200 text-left'}`}
            >
              <strong>{message.sender_username}</strong>: {message.message}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="w-full p-2 rounded-lg border border-gray-300"
          placeholder="Digite sua mensagem..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
              handleNewUserMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};

export default TrackOrders;
