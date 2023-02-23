import React, { useEffect, useState } from 'react'

import RestaurantMap from '../components/RestaurantMap';

type Props = {}

const CheckoutScreen = (props: Props) => {

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



  return (
   
    <div><RestaurantMap/></div>
  )
}

export default CheckoutScreen