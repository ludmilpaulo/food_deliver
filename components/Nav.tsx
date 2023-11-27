import { useEffect, useState } from "react";
import { IoIosSearch, IoIosLogIn } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { useSelector } from "react-redux";

import { RootState } from "../redux/store";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../assets/logo.png";
import { googleAPi } from "@/configs/variable";

const Nav = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [address, setAddress] = useState<string | null>(null);

  // Get user from redux state
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    handleLocation();
  }, []);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Use a service like Google Maps Geocoding API to get the address
        // NOTE: Replace 'YourAPIKey' with your actual API Key
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleAPi}`,
        );

        if (!response.ok) {
          console.error("Geocoding API response was not ok");
          return;
        }

        const data = await response.json();
        console.log("user location", data)
        if (data.results && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          console.log("user location",formattedAddress)
          setAddress(formattedAddress);
        } else {
          console.error("No results found in the API response");
        }
        
      },
      (error) => console.error(error),
    );
  };

  return (
    <nav className="flex items-center justify-between p-6 max-w-full h-8 bg-[#0171CE]">
      
      <div className="flex items-center">
        <Link href="/HomeScreen">
          <Image
            src={logo}
            alt="logo"
            width={75}
            height={10}
            className="mr-2"
          />
        </Link>

        <div className="flex ml-16 space-x-4 rounded-full">
          <h1 className="w-full p-2 mr-2 bg-white">{address}</h1>

          <button
            onClick={handleLocation}
            className="flex items-center space-x-2 text-white"
          >
            <span>localização</span>
            <IoLocationSharp size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center">
        {user ? (
          <Link
            className="flex items-center space-x-2 text-white"
            href={"/UserDashboard"}
          >
            <span>Meu Perfil</span>
            <IoIosLogIn size={20} />
          </Link>
        ) : (
          <Link
            className="flex items-center space-x-2 text-white"
            href={"/LoginScreenUser"}
          >
            <span>Conecte-se</span>
            <IoIosLogIn size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Nav;
