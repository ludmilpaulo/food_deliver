import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";

import { useRouter } from "next/router";
import Link from "next/link";

type Inputs = {
  username: string;
  password: string;
};

type Props = {};

const SignupScreen = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  let handleSubmit = async () => {
    try {
      let res = await fetch("https://www.sunshinedeliver.com/signup/", {
        method: "POST",
        // mode: 'no-cors',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          password2: password,
        }),
      });
      let resJson = await res.json();
      console.log("recebido", resJson);

      if (res.status === 200) {
        dispatch(loginUser(resJson));
        alert(
          "Você se conectou com sucesso Agora você pode saborear sua refeição"
        );
        router.push("/HomeScreen");
      } else {
        alert(Object.values(resJson));
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full h-screen px-4 py-16 bg-cover bg-bg_image">
      <div className="flex flex-col items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1, 1, 1, 1],
            rotate: [0, 30, 60, 240, 360],
          }}
          className="w-full p-10 mt-16 bg-white rounded shadow lg:w-1/3 md:w-1/2"
        >
         <h1
  tabIndex={0}
  aria-label="Login to your account"
  className="text-2xl font-extrabold leading-6 text-gray-800"
>
  Inscreva-se Para ter uma Conta
</h1>

          
          <Link href={"/LoginScreenUser"}>
            <p className="mt-4 text-sm font-medium leading-none text-gray-500">
              Se você tem uma conta?{" "}
              <span
                tabIndex={0}
                role="link"
                aria-label="Sign up here"
                className="text-sm font-medium leading-none text-gray-800 underline cursor-pointer"
              >
                {" "}
                Entre aqui
              </span>
            </p>
          </Link>
          <div>
            <input
              placeholder="Nome do Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full py-3 pl-3 mt-2 text-xs font-medium leading-none text-gray-800 bg-gray-200 border rounded focus:outline-none"
            />
          </div>

          <div>
            <input
              placeholder="Email do Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full py-3 pl-3 mt-2 text-xs font-medium leading-none text-gray-800 bg-gray-200 border rounded focus:outline-none"
            />
          </div>

          <div className="w-full mt-6">
            <div className="relative flex items-center justify-center">
              <input
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full py-3 pl-3 mt-2 text-xs font-medium leading-none text-gray-800 bg-gray-200 border rounded focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              role="button"
              type="submit"
              aria-label="entrar na minha conta"
              className="w-full py-4 text-sm font-semibold leading-none text-white bg-indigo-700 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:outline-none hover:bg-indigo-600"
            >
              Inscreva-se Agora
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupScreen;
