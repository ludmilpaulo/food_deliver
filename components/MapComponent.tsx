import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import logo from "@/assets/azul.png";
import L from 'leaflet';
import Image from 'next/image';

type MapComponentProps = {
  latitude: number;
  longitude: number;
  avatarUrl: string;
};

const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude, avatarUrl }) => {
  const icon = L.icon({
    iconUrl:  "https://www.kudya.shop/media/logo/azul.png", // You can customize the marker icon
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="relative bg-blue-300 h-60 mb-6">
      <MapContainer center={[latitude, longitude]} zoom={30} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <div className="flex items-center">
              <Image src={avatarUrl} width={50} height={50} className="rounded-full" alt="User avatar" />
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
