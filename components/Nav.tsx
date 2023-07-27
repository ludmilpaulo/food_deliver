import { useState } from 'react';
import { IoIosSearch, IoIosLogIn } from 'react-icons/io';
import { IoLocationSharp } from 'react-icons/io5';


import Link from 'next/link';
import { useRouter } from 'next/router';

interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { href: '/home', label: 'Home' },
  // add more menu items as needed
];

const Nav = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search?query=${searchText}`);
  }

  return (
    <nav className="flex items-center justify-between p-6 bg-[#0171CE]">
      <div className="flex items-center">
        <img src="/logo.png" alt="logo" className="w-10 h-10 mr-2" />
        
        <div className="flex ml-16 space-x-4 rounded-full">
    


          <input
            type="text"
            className="w-full p-2 mr-2 bg-white rounded-full"
            placeholder="Search address"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
       
      

        <button className="flex items-center space-x-2">
  <span>localização Atual</span>
  <IoLocationSharp size={20} />
</button>

          
          
        </div>
      </div>
      <div className="flex items-center">
        
        <Link 
        className="flex items-center space-x-2"
        href="/login">
            <span>Conecte-se</span>
          <IoIosLogIn size={20} />
         
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
