import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AiOutlineMenu,
  AiOutlineSearch,
  AiOutlineClose,
  AiFillTag,
} from "react-icons/ai";
import { BsFillCartFill, BsFillSaveFill } from "react-icons/bs";
import { RiLogoutBoxLine } from "react-icons/ri";
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

  useEffect(() => {
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
        },
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
    pickUser();
  }, [user?.user_id]);

  const onLogout = async () => {
    try {
      dispatch(logoutUser());
      // await AsyncStorage.removeItem("authUser");
      // Updates.reloadAsync();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <div className="max-w-[1640px] bg-bg_image bg-cover bg-center bg-no-repeat mx-auto flex justify-between items-center p-4">
        {/* Left side */}
        <div className="flex items-center">
          <div onClick={() => setNav(!nav)} className="cursor-pointer">
            <AiOutlineMenu size={30} />
          </div>

          <h1 className="px-2 h2-2xl sm:h2-3xl lg:h2-4xl">
            {username} <span className="font-bold"></span>
          </h1>
        </div>

        {/* Cart button */}
        {!!count && (
          <Link href={"/CartScreen"}>
            <button className="items-center hidden py-2 text-white bg-black rounded-full h2-white md:flex">
              <BsFillCartFill size={20} className="mr-2" /> {total}Kz ({count})
            </button>
          </Link>
        )}

        {/* Overlay */}
        {nav ? (
          <div className="fixed top-0 left-0 z-10 w-full h-screen bg-black/80"></div>
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
            className="absolute cursor-pointer right-4 top-4"
          />
          <Link href={"/"}>
            <h2 className="p-4 h2-2xl">
              SD <span className="font-bold">Kudya</span>
            </h2>
          </Link>
          <nav>
            <ul className="flex flex-col p-4 h2-gray-800">
              <Link href={"/OrderScreen"}>
                <li className="flex py-4 h2-xl">
                  <TbTruckDelivery size={25} className="mr-4" /> Pedidos
                </li>
              </Link>

              <Link href={"/OrderHistory"}>
                <li className="flex py-4 h2-xl">
                  <MdFavorite size={25} className="mr-4" /> Favoritos
                </li>
              </Link>
              <li className="flex py-4 h2-xl">
                <FaWallet size={25} className="mr-4" /> Carteira
              </li>
              <li className="flex py-4 h2-xl">
                <MdHelp size={25} className="mr-4" /> Ajuda
              </li>
              <li className="flex py-4 h2-xl">
                <AiFillTag size={25} className="mr-4" /> Promoções
              </li>
              <li className="flex py-4 h2-xl">
                <BsFillSaveFill size={25} className="mr-4" /> Melhores
              </li>
              <li className="flex py-4 h2-xl">
                <FaUserFriends size={25} className="mr-4" /> Invite Friends
              </li>

              <a href={"/"} onClick={onLogout}>
                <li className="flex py-4 h2-xl">
                  <RiLogoutBoxLine size={25} className="mr-4" /> Sair
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
