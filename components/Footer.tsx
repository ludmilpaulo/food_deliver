import { FaFacebookF, FaTwitter, FaInstagram, FaApple, FaGooglePlay } from 'react-icons/fa';
import { AiFillPhone } from 'react-icons/ai';
import Image from 'next/image';
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-0 px-6 py-10 text-white bg-[#0171CE]">
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="mb-4">
          <Image src={logo} alt="Logo" width={150} height={50} />
        </div>
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-bold">About Us</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque euismod.</p>
        </div>
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-bold">Contact Us</h2>
          <p><AiFillPhone /> +1 234 567 890</p>
        </div>
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-bold">Follow Us</h2>
          <div className="flex space-x-3">
            <FaFacebookF className="w-5 h-5" />
            <FaTwitter className="w-5 h-5" />
            <FaInstagram className="w-5 h-5" />
          </div>
        </div>
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-bold">Download App</h2>
          <div className="flex space-x-3">
            <FaApple className="w-5 h-5" />
            <FaGooglePlay className="w-5 h-5" />
          </div>
        </div>
      </div>
    </footer>
  )
}
