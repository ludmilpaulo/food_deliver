import { useLoadScript, GoogleMap } from '@react-google-maps/api';
import type { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import styles from '../styles/Home.module.css';

const RestaurantMap: NextPage = () => {

    const [coordinates, setCoordinates] = useState({});
 
    useEffect(() => {
      // get the users current location on intial login
  
      navigator.geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          console.log({ latitude, longitude });
          setCoordinates({ lat: latitude, lng: longitude });
        }
      );
    }, []);
  


  const libraries = useMemo(() => ['places'], []);
  const mapCenter = useMemo(
    () => (coordinates),
    []
  );

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: false,
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBBkDvVVuQBVSMOt8wQoc_7E-2bvDh2-nw" as string,
    libraries: libraries as any,
  });

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (

    <div>
      <GoogleMap
        options={mapOptions}
        zoom={14}
       // center={mapCenter}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
       // mapContainerStyle='absolute w-full h-full text-gray-200 max-h-[500px] bg-black/40 flex flex-col justify-center'
        mapContainerStyle={{ width: '800px', height: '500px' }}
        onLoad={() => console.log('Map Component Loaded...')}
      />
      </div>
    

  );
};

export default RestaurantMap