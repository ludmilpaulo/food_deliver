import React from 'react';
import { FaApple, FaGooglePlay, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-yellow-400 to-blue-600 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Download Our App</h4>
            <div className="flex space-x-4">
              <Link href="https://apps.apple.com">
                <span className="flex items-center space-x-2 hover:text-gray-200 transition duration-300">
                  <FaApple className="w-5 h-5" />
                  <span>App Store</span>
                </span>
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient">
                <span className="flex items-center space-x-2 hover:text-gray-200 transition duration-300">
                  <FaGooglePlay className="w-5 h-5" />
                  <span>Google Play</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2">Contact Us</h4>
            <p className="flex items-center justify-center md:justify-start space-x-2">
              <FaEnvelope className="w-5 h-5" />
              <span>info@yourcompany.com</span>
            </p>
            <p className="flex items-center justify-center md:justify-start space-x-2">
              <FaPhone className="w-5 h-5" />
              <span>+123 456 7890</span>
            </p>
            <p className="flex items-center justify-center md:justify-start space-x-2">
              <FaMapMarkerAlt className="w-5 h-5" />
              <span>123 Main Street, Anytown, USA</span>
            </p>
          </div>
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact">
                  <span className="hover:text-gray-200 transition duration-300">Contate-nos</span>
                </Link>
              </li>
              <li>
                <Link href="/careers">
                  <span className="hover:text-gray-200 transition duration-300">Carreiras</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-gray-200 transition duration-300">Acerca de Nós</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-sm">&copy; 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
