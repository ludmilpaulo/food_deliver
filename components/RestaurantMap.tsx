import { useLoadScript, GoogleMap } from "@react-google-maps/api";
import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/Home.module.css";

const RestaurantMap: NextPage = () => {
  const [coordinates, setCoordinates] = useState<
    google.maps.LatLngLiteral | undefined
  >(undefined);

  useEffect(() => {
    // get the users current location on intial login
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        console.log({ latitude, longitude });
        setCoordinates({ lat: latitude, lng: longitude });
      },
    );
  }, []);

  const libraries = useMemo(() => ["places"], []);
  const mapCenter = useMemo(() => coordinates, [coordinates]);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: false,
    }),
    [],
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBBkDvVVuQBVSMOt8wQoc_7E-2bvDh2-nw" as string,
    libraries: libraries as any,
  });

  if (!isLoaded || !coordinates) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <GoogleMap
        options={mapOptions}
        zoom={14}
        center={mapCenter}
        mapTypeId={google.maps.MapTypeId.ROADMAP}
        mapContainerStyle={{ width: "800px", height: "500px" }}
        onLoad={() => console.log("Map Component Loaded...")}
      />
    </div>
  );
};

export default RestaurantMap;
