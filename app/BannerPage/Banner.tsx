import { FC, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Image from 'next/image';
import { Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';

interface BannerProps {
  title: string;
  backgroundImage: string;
  backgroundApp: string;
  bottomImage: string;
  restaurants: { location: string; name: string; logo: string }[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const Banner: FC<BannerProps> = ({ title, backgroundImage, backgroundApp, restaurants, bottomImage }) => {
  const [center, setCenter] = useState({ lat: -25.747868, lng: 28.229271 });
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Add your API key here
  });

  const router = useRouter();

  return (
    <div className="w-full">
      {/* Background Image */}
      <div className="relative w-full h-screen">
        <Image
          src={backgroundImage}
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
          {/* App Image */}
          <div className="mb-8">
            <Image
              src={backgroundApp}
              alt="App Image"
              width={150}
              height={150}
              className="rounded-full shadow-lg"
            />
          </div>
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
           
          </div>
          {/* Navigate Button */}
          <button
            onClick={() => router.push('/HomeScreen')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
          >
            Peça seus favoritos agora
          </button>
        </div>
      </div>
      {/* Bottom Image */}
      <div className="relative w-full h-64">
        <Image
          src={bottomImage}
          alt="Bottom Image"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>
      {/* Google Map */}
      <div className="relative w-full z-20">
        <Transition
          show={!isLoaded}
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
      
      </div>
    </div>
  );
};

export default Banner;
