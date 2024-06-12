import { FC, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Image from 'next/image';

interface BannerProps {
  title: string;
  backgroundImage: string;
  backgroundApp: string;
  restaurants: { location: string; name: string }[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Banner: FC<BannerProps> = ({ title, backgroundImage, backgroundApp, restaurants }) => {
  const [location, setLocation] = useState('');
  const [center, setCenter] = useState({ lat: -25.747868, lng: 28.229271 });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add functionality to change the map center based on user input
  };

  return (
    <div className="relative w-full h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Imagem de Fundo"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
        {/* App Image */}
        <div className="mb-8">
          <Image
            src={backgroundApp}
            alt="Imagem do Aplicativo"
            width={150}
            height={150}
            className="rounded-full shadow-lg"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg md:text-2xl text-white">Peça seus favoritos agora</p>
        </div>

        {/* Location Input */}
        <form onSubmit={handleLocationSubmit} className="w-full max-w-md mb-4">
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="Digite sua localização"
            className="w-full p-2 rounded-lg mb-4"
          />
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-lg">Definir Localização</button>
        </form>

        {/* Google Map */}
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
            {restaurants.map((restaurant, index) => {
              if (restaurant.location) {
                const [lat, lng] = restaurant.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                  return <Marker key={index} position={{ lat, lng }} title={restaurant.name} />;
                }
              }
              return null;
            })}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default Banner;
