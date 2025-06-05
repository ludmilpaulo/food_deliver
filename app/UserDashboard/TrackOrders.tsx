import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { baseAPI } from '@/services/types';
import { selectUser } from '@/redux/slices/authSlice';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';

interface LocationType {
  latitude: number;
  longitude: number;
}

const toRadians = (degrees: number) => degrees * (Math.PI / 180);

const haversineDistance = (coords1: LocationType, coords2: LocationType) => {
  const R = 6371;
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLng = toRadians(coords2.longitude - coords1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.latitude)) *
      Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  const duration = (distance / 50) * 60;
  return { distance, duration };
};

const parseLocation = (location: string): LocationType => {
  const cleanedLocation = location.replace(/[{}]/g, '').replace(/[\s]/g, '').split(',');
  const latitude = parseFloat(cleanedLocation[0].split(':')[1]);
  const longitude = parseFloat(cleanedLocation[1].split(':')[1]);
  return { latitude, longitude };
};

const toLatLng = (loc: LocationType) => [loc.latitude, loc.longitude] as [number, number];

const DEFAULT_CENTER: LocationType = { latitude: -8.8399876, longitude: 13.2894368 }; // Fallback: Luanda

const TrackOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [orderLocations, setOrderLocations] = useState<{ [key: number]: any }>({});
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [distances, setDistances] = useState<{ [key: number]: any }>({});
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [newMessageCount, setNewMessageCount] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');

  const user = useSelector(selectUser);

  // Fix leaflet marker icon for Next.js
  useEffect(() => {
    delete (L.Icon.Default as any).prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }, []);

  // Fetch orders & driver locations
  useEffect(() => {
    if (!user?.token) return;
    axios
      .post(`${baseAPI}/customer/customer/order/latest/`, { access_token: user.token })
      .then((response) => setOrders(response.data.orders || []))
      .catch((error) => console.error('Error fetching the orders:', error));
    axios
      .post(`${baseAPI}/customer/customer/driver/location/`, { access_token: user.token })
      .then((response) => {
        const locations = response.data.order_locations.reduce((acc: any, loc: any) => {
          acc[loc.order_id] = loc;
          return acc;
        }, {});
        setOrderLocations(locations);
      })
      .catch((error) => console.error('Error fetching driver locations:', error));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, [user?.token]);

  // Calculate distances
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
            duration: `${Math.ceil(result.duration)} mins`,
          };
        }
      });
      setDistances(newDistances);
    }
  }, [userLocation, orders, orderLocations, distances]);

  useEffect(() => {
    calculateDistanceAndTime();
  }, [userLocation, orders, orderLocations, calculateDistanceAndTime]);

  // Fetch chat messages for an order
  const fetchChatMessages = useCallback((order: any) => {
    axios
      .get(`${baseAPI}/info/get_order_chat/${order.id}/`)
      .then((response) => {
        const newMessages = response.data;
        if (newMessages.length > 0) {
          const latestMessage = newMessages[newMessages.length - 1];
          if (lastMessageId === null || latestMessage.id > lastMessageId) {
            setLastMessageId(latestMessage.id);
            setNewMessageCount((prevCount) => prevCount + 1);
            if (Notification.permission === 'granted') {
              new Notification('New message', { body: latestMessage.message });
            }
          }
        }
        setChatMessages(newMessages);
      })
      .catch((error) => console.error('Error fetching chat messages:', error));
  }, [lastMessageId]);

  useEffect(() => {
    if (currentOrder) {
      fetchChatMessages(currentOrder);
      const interval = setInterval(() => fetchChatMessages(currentOrder), 3000);
      return () => clearInterval(interval);
    }
  }, [currentOrder, fetchChatMessages]);

  const handleOrderSelection = (order: any) => {
    setCurrentOrder(order);
    fetchChatMessages(order);
    setIsChatOpen(true);
    setNewMessageCount(0);
  };

  const handleNewUserMessage = () => {
    if (currentOrder && chatInput.trim()) {
      axios
        .post(`${baseAPI}/info/send_chat_message/`, {
          user_id: user?.user_id,
          order_id: currentOrder.id,
          message: chatInput.trim(),
        })
        .then(() => {
          setChatInput('');
          fetchChatMessages(currentOrder);
        })
        .catch((error) => console.error('Error sending chat message:', error));
    }
  };

  const openGoogleMaps = (location: LocationType) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Rastrear Pedidos</h1>
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold mb-2">Pedido ID: {order.id}</h2>
              <p className="text-gray-700 mb-1"><strong>Status:</strong> {order.status}</p>
              {orderLocations[order.id]?.driver_location ? (
                <>
                  <p className="text-gray-700 mb-1"><strong>Coordenadas do Motorista:</strong> {orderLocations[order.id].driver_location}</p>
                  {distances[order.id] ? (
                    <>
                      <p className="text-gray-700 mb-1"><strong>Distância:</strong> {distances[order.id].distance}</p>
                      <p className="text-gray-700 mb-1"><strong>Tempo Estimado:</strong> {distances[order.id].duration}</p>
                    </>
                  ) : (
                    <p className="text-gray-700 mb-1">Calculando distância e tempo...</p>
                  )}
                  <button
                    onClick={() => openGoogleMaps(parseLocation(orderLocations[order.id].driver_location))}
                    className="mt-2 w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Ver no Google Maps
                  </button>
                  <div className="h-64 w-full mt-4">
                    <MapContainer
                      center={
                        orderLocations[order.id]?.driver_location
                          ? toLatLng(parseLocation(orderLocations[order.id].driver_location))
                          : toLatLng(DEFAULT_CENTER)
                      }
                      zoom={15}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker
                        position={toLatLng(parseLocation(orderLocations[order.id].driver_location))}
                      >
                        <Popup>Motorista está aqui</Popup>
                      </Marker>
                      {userLocation && (
                        <Marker position={toLatLng(userLocation)}>
                          <Popup>Você está aqui</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </>
              ) : (
                <p className="text-gray-700 mb-1"><strong>O pedido está sendo preparado por:</strong> {orderLocations[order.id]?.store}</p>
              )}
              <p className="text-gray-700 mb-1"><strong>PIN Secreto:</strong> {orderLocations[order.id]?.secret_pin}</p>
              <button
                onClick={() => handleOrderSelection(order)}
                className="mt-4 w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Ver Detalhes e Conversar com o Motorista
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-700">Carregando informações dos pedidos...</p>
      )}
      {/* Floating chat button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsChatOpen(true)}
          className="relative p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition duration-300"
        >
          <FontAwesomeIcon icon={faComments} size="lg" />
          {newMessageCount > 0 && (
            <span className="absolute top-0 right-0 inline-block w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full text-center">
              {newMessageCount}
            </span>
          )}
        </button>
      </div>
      {/* Chat modal */}
      {isChatOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto relative">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
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
            <div className="flex">
              <input
                type="text"
                className="flex-1 p-2 rounded-l-lg border border-gray-300"
                placeholder="Digite sua mensagem..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim() !== '') {
                    handleNewUserMessage();
                  }
                }}
              />
              <button
                onClick={handleNewUserMessage}
                className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition duration-300"
              >
                Enviar
              </button>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="mt-4 w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrders;
