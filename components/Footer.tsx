import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaApple,
  FaGooglePlay,
} from "react-icons/fa";
import { AiFillPhone } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="px-2 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-10 text-xs sm:text-sm md:text-base text-white bg-[#0171CE]">
      <div className="flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-0 md:flex-row md:items-start md:space-x-4 lg:space-x-6 justify-between">
        <div className="mb-2 sm:mb-4">
          <Image src={logo} alt="Logo" width={100} height={30} />
        </div>
        <div className="mb-2 sm:mb-4 text-center md:text-left">
          <Link href={"/AboutPage"}>
          <h2 className="mb-2 text-lg font-bold">Sobre nós</h2>
          </Link>
          <Link href="https://www.privacypolicygenerator.info/live.php?token=wwVCZyy12vbw2T3Q7AAqYntKTKTMDq5Q">
          <h2 className="mb-2 text-lg font-bold">política de Privacidade</h2>
        </Link>
        
        </div>
        <div className="mb-2 sm:mb-4 text-center md:text-left">
          <h2 className="mb-2 text-lg font-bold">Contate-nos</h2>
  
        </div>
        <div className="mb-2 sm:mb-4 text-center md:text-left">
          <h2 className="mb-2 text-lg font-bold">Siga-nos</h2>
          <div className="flex justify-center md:justify-start space-x-3">
            <FaFacebookF className="w-5 h-5" />
            <FaTwitter className="w-5 h-5" />
            <FaInstagram className="w-5 h-5" />
          </div>
        </div>
        <div className="mb-2 sm:mb-4 text-center md:text-left">
          <h2 className="mb-2 text-lg font-bold">Baixar aplicativo</h2>
          <div className="flex justify-center md:justify-start space-x-3">
            <FaApple className="w-5 h-5" />
            <FaGooglePlay href="https://play.google.com/store/apps/details?id=com.ludmil.kudyaclient" className="w-5 h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
