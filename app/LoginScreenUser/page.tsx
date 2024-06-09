"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Transition } from '@headlessui/react';
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import logo from "@/assets/azul.png";
import { loginUserService } from "@/services/authService";
import { AxiosError } from "axios";
import { loginUser } from "@/redux/slices/authSlice";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { clearAllCart } from "@/redux/slices/basketSlice";

const LoginScreenUser: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);

  useEffect(() => {
    dispatch(clearAllCart());
  }, [dispatch]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const startTime = performance.now();
      const resJson = await loginUserService(username, password);

      const endTime = performance.now();
      console.log(`completeOrderRequest took ${(endTime - startTime) / 1000} seconds`);

      if (resJson.is_customer === true) {
        dispatch(loginUser(resJson));
        alert("Você se conectou com sucesso! Agora você pode saborear sua refeição");
        router.push("/HomeScreen");
      } else if (resJson.is_customer === false) {
        dispatch(loginUser(resJson));
        alert("Você se conectou com sucesso!");
        router.push("/RestaurantDashboad");
      } else {
        alert(resJson.message);
      }
    } catch (error) {
      console.error(error);
      const err = error as AxiosError;
      if (err.response && err.response.data && typeof err.response.data === "object" && "message" in err.response.data) {
        alert((err.response.data as any).message);
      } else if (err.response && err.response.status) {
        switch (err.response.status) {
          case 400:
            alert("Erro de solicitação. Por favor, tente novamente.");
            break;
          case 401:
            alert("Senha incorreta. Por favor, tente novamente.");
            break;
          case 404:
            alert("Usuário não encontrado. Por favor, Cadastra se.");
            break;
          default:
            alert("Login falhou. Por favor, tente novamente.");
        }
      } else {
        alert("Login falhou. Por favor, tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <>
      <div className="w-full h-screen px-4 py-16 flex flex-col items-center justify-center bg-gray-100">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[#FCB61A] to-[#0171CE] rounded-md filter blur-3xl opacity-50 -z-20" />
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 30, 60, 240, 360] }}
          className="w-full p-10 mt-16 bg-white rounded-lg shadow-lg lg:w-1/3 md:w-1/2"
        >
          <div className="flex justify-center mb-6">
            <Image src={logo} alt="logo" width={100} height={100} />
          </div>
          <p className="text-2xl font-extrabold leading-6 text-gray-800 text-center mb-4">
            Faça login na sua conta
          </p>
          <Link href={"/SignupScreen"}>
            <p className="mt-4 text-sm font-medium leading-none text-gray-500 text-center">
              Não tem uma conta?{" "}
              <span className="text-sm font-medium leading-none text-indigo-700 underline cursor-pointer">
                Assine aqui
              </span>
            </p>
          </Link>
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700">Nome do Usuário</label>
            <input
              placeholder="Nome do Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full py-3 px-4 mt-2 text-sm font-medium leading-none text-gray-800 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Digite a Sua Senha</label>
            <div className="relative mt-2">
              <input
                value={password}
                placeholder="Digite a Sua Senha"
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                className="w-full py-3 px-4 text-sm font-medium leading-none text-gray-800 bg-gray-200 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="mt-4 text-right">
            <span
              className="text-sm text-indigo-700 hover:underline cursor-pointer"
              onClick={() => setShowForgotPasswordModal(true)}
            >
              Esqueceu a senha?
            </span>
          </div>
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              role="button"
              type="submit"
              aria-label="entrar na minha conta"
              className="w-full py-4 text-sm font-semibold leading-none text-white bg-indigo-700 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:outline-none hover:bg-indigo-600"
              disabled={loading}
            >
              Entrar na Minha Conta
            </button>
          </div>
        </motion.div>
      </div>

      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>

      <ForgotPasswordModal show={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </>
  );
};

export default LoginScreenUser;
