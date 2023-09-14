import React, { useCallback } from "react";
import {
  useLoadScript,
  GoogleMap,
  Polygon,
  Marker,
} from "@react-google-maps/api";
import type { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";
import Navbar from "@/components/Navbar";
import { selectTotalItems, selectTotalPrice } from "@/redux/slices/basketSlice";
import Map from "../components/Map";
import GoogleMapReact from "google-map-react";

type Props = {
  latitude?: number;
  longitude?: number;
  altitude: number;
  heading: number;
  altitudeAccuracy: number;
  speed: number;
  accuracy: number;
  center?: google.maps.LatLng | google.maps.LatLngLiteral | undefined;
};

interface LatLon {
  latitude: number;
  longitude: number;
  altitude: number;
  heading: number;
  altitudeAccuracy: number;
  speed: number;
  accuracy: number;
}

const OrderScreen = (props: Props) => {
  const defaultProps = {
    center: {
      lat: 37.7749,
      lng: -122.4194,
    },
    zoom: 11,
  };

  const dispatch = useDispatch();

  const user = useSelector(selectUser);

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);

  const [coordinates, setCoordinates] = useState<any>({});
  const [driverLocation, setDriverLocation] = useState<any>();
  const [userId, setUserId] = useState<any>(user?.user_id);

  const getDriverLocation = useCallback(async () => {
    let tokenvalue = user?.token;
    let userName = user?.username;

    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/driver/location/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: tokenvalue,
        }),
      },
    );
    const locationData = await response.json();
    let result = locationData?.location;
    let blah2 = result.replace(/['']/g, '"');

    setDriverLocation(JSON.parse(blah2));
  }, [user?.token, user?.username]);

  useEffect(() => {
    getDriverLocation();
    // get the users current location on intial login
    console.log("driver location==>", driverLocation?.latitude);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        console.log({ latitude, longitude });
        setCoordinates({ lat: latitude, lng: longitude });
      },
    );
  }, [getDriverLocation, driverLocation?.latitude]);

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

  const containerStyle = {
    width: "400px",
    height: "400px",
  };

  const center = {
    lat: driverLocation?.latitude,
    lng: driverLocation?.longitude,
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={{ height: "1000px", width: "1000%" }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={coordinates}
          zoom={10}
          //style={{ height: '1000px', width: '1000%' }}
        >
          <Marker position={coordinates} />
        </GoogleMap>
      </div>
    </>
  );
};

export default OrderScreen;
