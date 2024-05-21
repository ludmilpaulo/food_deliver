"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import logo from "@/assets/azul.png"; // Ensure this path is correct

const NotFoundPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/LoginScreenUser");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg bg-white rounded-lg shadow-lg p-6 md:p-10 lg:p-12">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCB61A] to-[#0171CE] rounded-lg blur-lg opacity-50 -z-20" />

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src={logo}
            alt="logo"
            width={100}
            height={100}
            className="w-32 h-32"
          />
        </div>

        {/* 404 Message */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 0, 0] }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold leading-10 text-gray-800 mb-4">
            Página não encontrada
          </h1>
          <p className="text-lg font-medium text-gray-600 mb-6">
            Desculpe, a página que você está procurando não existe.
          </p>
          <p className="text-sm font-medium text-gray-600 mb-4">
            Redirecionando para a tela de login em 3 segundos...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
