import React, { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import router from "next/router";

import Image from "next/image";

import { motion } from "framer-motion";

import { logoutUser, selectUser } from "@/redux/slices/authSlice";
import { updateBusket } from "@/redux/slices/basketSlice";

const UserProfile = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [image, setImage] = useState<any>(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");

  const [photo, setPhoto] = useState(null);

  const [Type, setType] = useState("");

  const uploadToClient = (e: { target: { files: any[] } }) => {
    let file = e.target.files[0]
    setImage(e.target.files[0])
    console.log(e.target.files, "primeiro");
    //console.log(e.target.files[0], "segundo");
  };

  const userUpdate = async () => {
    let tokenvalue = user?.token;

    // Upload the image using the fetch and FormData APIs
    let formData = new FormData();
    // Assume "photo" is the name of the form field the server expects
    formData.append("avatar", image);
    formData.append("access_token", tokenvalue);
    formData.append("address", address);
    formData.append("first_name", first_name);
    formData.append("last_name", last_name);
    formData.append("phone", phone);

    console.log("shool ==>", formData);

    try {
      let response = await fetch(
        'https://www.sunshinedeliver.com/api/customer/profile/update/',
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );
      //response = await response.json();

      if (response.status == 200) {
        let data = await response.json();

        alert(data.status);
        router.push("HomeScreen");
        return true;
      } else {
        let resp = await response.json();
        alert("" + resp.non_field_errors);
        console.log("err", resp);
      }
    } catch (e) {
      console.log("alila", e);
      alert("O usuário não existe, inscreva-se ou tente fazer login novamente");
      dispatch(updateBusket([]));
      dispatch(logoutUser());
    }
  };

  return (
    <>
      <div className="h-screen bg-bg_image bg-cover w-full py-16 px-4">
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1, 1, 1, 1],
              rotate: [0, 30, 60, 240, 360],
            }}
            className="bg-white shadow rounded lg:w-1/3  md:w-1/2 w-full p-10 mt-16"
          >
            <div className="rounded-full  w-48 h-48 mt-4">
              {image && (
                <Image
                  width={100}
                  height={100}
                  src={image}
                  className="w-48 h-48"
                  alt={""}
                />
              )}
            </div>

            <div>
              <input
                className="bg-gray-200 border rounded focus:outline-none text-xs font-medium leading-none text-gray-800 py-3 w-full pl-3 mt-2"
                type="file"
                name="myImage"
                onChange={(e)=>uploadToClient(e)}
               // value={image}
              />
            </div>

            <div>
              <input
                placeholder="Primeiro Nome"
                onChange={(text) => setFirst_name(text.target.value)}
                value={first_name}
                className="bg-gray-200 border rounded focus:outline-none text-xs font-medium leading-none text-gray-800 py-3 w-full pl-3 mt-2"
              />
            </div>

            <div>
              <input
                placeholder="Ultimo Nome"
                onChange={(text) => setLast_name(text.target.value)}
                value={last_name}
                type="text"
                className="bg-gray-200 border rounded focus:outline-none text-xs font-medium leading-none text-gray-800 py-3 w-full pl-3 mt-2"
              />
            </div>

            <div className="mt-6  w-full">
              <div className="relative flex items-center justify-center">
                <input
                  placeholder="Número de Telefone"
                  value={phone}
                  onChange={(text) => setPhone(text.target.value)}
                  className="bg-gray-200 border rounded focus:outline-none text-xs font-medium leading-none text-gray-800 py-3 w-full pl-3 mt-2"
                />
              </div>

              <div>
                <input
                  placeholder="Seu Endereço"
                  value={address}
                  onChange={(text) => setAddress(text.target.value)}
                  className="bg-gray-200 border rounded focus:outline-none text-xs font-medium leading-none text-gray-800 py-3 w-full pl-3 mt-2"
                />
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={userUpdate}
                role="button"
                type="submit"
                aria-label="entrar na minha conta"
                className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 text-sm font-semibold leading-none text-white focus:outline-none bg-indigo-700 border rounded hover:bg-indigo-600 py-4 w-full"
              >
                Inscreva-se Agora
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <></>
    </>
  );
};

export default UserProfile;
