import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineClose,
  AiFillTag,
} from "react-icons/ai";
import { BsFillCartFill, BsFillSaveFill } from "react-icons/bs";
import { RiLogoutBoxLine} from "react-icons/ri"
import { TbTruckDelivery } from "react-icons/tb";
import { FaUserFriends, FaWallet } from "react-icons/fa";
import { MdFavorite, MdHelp } from "react-icons/md";

import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectTotalItems, selectTotalPrice } from "@/redux/slices/basketSlice";


const Navbar = ({ total, count }: { total: any; count: any }) => {
  const user = useSelector(selectUser);

  const totalPrice = useSelector(selectTotalPrice);
  const getAllItems = useSelector(selectTotalItems);

  const dispatch = useDispatch();

  const url = "https://www.sunshinedeliver.com";

  const [nav, setNav] = useState(false);

  const [username, setUsername] = useState(user?.username);
  const [userPhoto, setUserPhoto] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userId, setUserId] = useState<any>();


  const customer_avatar = `${userPhoto}`;
  const customer_image = `${url}${customer_avatar}`;

  console.log("resposan", userId);

  const pickUser = async () => {
    let response = await fetch(
      "https://www.sunshinedeliver.com/api/customer/profile/",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.user_id,
        }),
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setUserPhone(responseJson.customer_detais.phone);
        setUserAddress(responseJson.customer_detais.address);
        setUserPhoto(responseJson.customer_detais.avatar);
      })
      .catch((error) => {
        // console.error(error);
      });
  };

  const onLogout = async () => {
    try {
      dispatch(logoutUser());
      // await AsyncStorage.removeItem("authUser");
      // Updates.reloadAsync();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    pickUser();
   //setUserId(user?.user_id);
    //setUsername(user?.username);
  }, []);

  return (
    <>
      <div className="max-w-[1640px] mx-auto flex justify-between items-center p-4">
        {/* Left side */}
        <div className="flex items-center">
          <div onClick={() => setNav(!nav)} className="cursor-pointer">
            <AiOutlineMenu size={30} />
          </div>
          <h1 className="h2-2xl sm:h2-3xl lg:h2-4xl px-2">
            {username} <span className="font-bold"></span>
          </h1>
          <div className="hidden lg:flex items-center bg-gray-200 rounded-full p-1 h2-[14px]">
            <p className="bg-black h2-white rounded-full p-2">Delivery</p>
            <p className="p-2">Pickup</p>
          </div>
        </div>

        {/* Cart button */}
        {!!count && (
          <Link href={"/CartScreen"}>
            <button className="bg-black text-white h2-white hidden md:flex items-center py-2 rounded-full">
              <BsFillCartFill size={20} className="mr-2" /> {total}Kz ({count})
            </button>
          </Link>
        )}

        {/* Overlay */}
        {nav ? (
          <div className="bg-black/80 fixed w-full h-screen z-10 top-0 left-0"></div>
        ) : (
          ""
        )}

        {/* Side drawer menu */}
        <div
          className={
            nav
              ? "fixed top-0 left-0 w-[300px] h-screen bg-bg_image bg-cover bg-center bg-no-repeat md:h-screen z-10 duration-300"
              : "fixed top-0 left-[-100%] w-[300px] h-screen bg-bg_image bg-cover bg-center bg-no-repeat md:h-screen z-10 duration-300"
          }
        >
          <AiOutlineClose
            onClick={() => setNav(!nav)}
            size={30}
            className="absolute right-4 top-4 cursor-pointer"
          />
          <h2 className="h2-2xl p-4">
            SD <span className="font-bold">Kudya</span>
          </h2>
          <nav>
            <ul className="flex flex-col p-4 h2-gray-800">
              <Link href={"/OrderScreen"}>
              <li className="h2-xl py-4 flex">
                <TbTruckDelivery 
                size={25} className="mr-4" /> Pedidos
              </li>
              </Link>
              <li className="h2-xl py-4 flex">
                <MdFavorite size={25} className="mr-4" /> Favoritos
              </li>
              <li className="h2-xl py-4 flex">
                <FaWallet size={25} className="mr-4" /> Carteira
              </li>
              <li className="h2-xl py-4 flex">
                <MdHelp size={25} className="mr-4" /> Ajuda
              </li>
              <li className="h2-xl py-4 flex">
                <AiFillTag size={25} className="mr-4" /> Promoções
              </li>
              <li className="h2-xl py-4 flex">
                <BsFillSaveFill size={25} className="mr-4" /> Melhores
              </li>
              <li className="h2-xl py-4 flex">
                <FaUserFriends size={25} className="mr-4" /> Invite Friends
              </li>

         
              <a href={"/"} onClick={onLogout} >
              <li
             
               className="h2-xl py-4 flex">
                <RiLogoutBoxLine
                 
                size={25} className="mr-4" /> Sair
              </li>
              </a>
          
          
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;