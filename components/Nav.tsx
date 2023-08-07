import { useEffect, useState } from "react";
import { IoIosSearch, IoIosLogIn } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import Image from "next/image";

import Link from "next/link";
import { useRouter } from "next/router";
import logo from "../assets/logo.png";

interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { href: "/home", label: "Home" },
  // add more menu items as needed
];

const Nav = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    handleLocation()
  }, []);

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Use a service like Google Maps Geocoding API to get the address
      // NOTE: Replace 'YourAPIKey' with your actual API Key
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=YourAPIKey`);

      if (!response.ok) {
        console.error("Geocoding API response was not ok");
        return;
      }

      const data = await response.json();
      setAddress(data.results[0].formatted_address);
    }, (error) => console.error(error));
       

  };

  return (
    <nav className="flex items-center justify-between p-6 max-w-full h-8 bg-[#0171CE]">
      <div className="flex items-center">
      <Link href="/HomeScreen">
        <Image src={logo} alt="logo" width={40} height={40} className="mr-2" />
        </Link>

        <div className="flex ml-16 space-x-4 rounded-full">
          <h1
            className="w-full p-2 mr-2 bg-white"
          >{address}</h1>

          <button 
          onClick={handleLocation}
          className="flex items-center space-x-2">
            <span>localização</span>
            <IoLocationSharp size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center">
        <Link className="flex items-center space-x-2" href="/login">
          <span>Conecte-se</span>
          <IoIosLogIn size={20} />
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
