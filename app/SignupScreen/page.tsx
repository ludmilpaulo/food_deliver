"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/azul.png";
import { signup } from "@/services/authService";

const SignupScreen = () => {
  const router = useRouter();

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    logo: null as File | null,
    restaurant_license: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [licencaLoading, setLicencaLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"client" | "restaurant">("client");

  const dispatch = useDispatch();

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as "client" | "restaurant");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      if (name === "logo") {
        setLogoLoading(true);
        setTimeout(() => {
          setSignupData((prevState) => ({ ...prevState, [name]: files[0] }));
          setLogoLoading(false);
        }, 2000);
      } else if (name === "restaurant_license") {
        setLicencaLoading(true);
        setTimeout(() => {
          setSignupData((prevState) => ({ ...prevState, [name]: files[0] }));
          setLicencaLoading(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { status, data } = await signup(role, signupData);
      console.log("recebido", data);

      if (status === 201 || data.status === "201") {
        dispatch(loginUser(data));
        alert("Você se conectou com sucesso. Agora você pode saborear sua refeição.");
        if (role === "restaurant") {
          router.push("/RestaurantDashboad"); // Redirect to Dashboard
        } else {
          router.push("/HomeScreen");
        }
      } else {
        handleErrorResponse(status, data);
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleErrorResponse = (status: number, data: any) => {
    switch (status) {
      case 400:
        alert(data.message || "Requisição inválida.");
        break;
      case 401:
        alert(data.message || "Não autorizado.");
        break;
      case 404:
        alert(data.message || "Recurso não encontrado.");
        break;
      case 200:
        alert(data.message || "Você se conectou com sucesso. Agora você pode saborear sua refeição.");
        break;
      default:
        alert(data.message || "Ocorreu um erro.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg lg:w-1/3">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400 to-blue-600 rounded-md filter blur-3xl opacity-50 -z-20" />
          <motion.div
            animate={{ scale: [1, 1, 1, 1, 1], rotate: [0, 30, 60, 240, 360] }}
            className="w-full p-10 bg-white rounded shadow"
          >
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="Logo" width={100} height={100} />
            </div>
            <h1 className="text-2xl font-extrabold text-center text-gray-800">
              Inscreva-se Para ter uma Conta
            </h1>
            <p className="mt-4 text-sm font-medium text-center text-gray-500">
              Se você tem uma conta?{" "}
              <Link href="/LoginScreenUser">
                <span className="text-gray-800 underline">Entre aqui</span>
              </Link>
            </p>
            <div className="my-6 text-center">
              <label className="mr-4">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === "client"}
                  onChange={handleRoleChange}
                  className="mr-1"
                />
                Cliente
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="restaurant"
                  checked={role === "restaurant"}
                  onChange={handleRoleChange}
                  className="mr-1"
                />
                Fornecedor de Negocio
              </label>
            </div>
            <Transition
              show={loading}
              as="div"
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {loading && (
                <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50">
                  <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </Transition>
            {!loading && (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                  name="username"
                  placeholder="Usuario"
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Senha"
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {role === "restaurant" && (
                  <>
                    <input
                      name="name"
                      placeholder="Nome do Fornecedor ou do Negocio"
                      onChange={handleInputChange}
                      className="p-2 border rounded"
                    />
                    <input
                      name="phone"
                      placeholder="Telefone"
                      onChange={handleInputChange}
                      className="p-2 border rounded"
                    />
                    <input
                      name="address"
                      placeholder="Endereço"
                      onChange={handleInputChange}
                      className="p-2 border rounded"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        name="logo"
                        onChange={handleFileChange}
                        className="absolute w-full h-full p-2 border rounded opacity-0 cursor-pointer"
                      />
                      <div className="p-2 border rounded cursor-pointer">
                        {logoLoading ? (
                          <span className="w-5 h-5 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
                        ) : (
                          "Carregar o Logo"
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        name="restaurant_license"
                        onChange={handleFileChange}
                        className="absolute w-full h-full p-2 border rounded opacity-0 cursor-pointer"
                      />
                      <div className="p-2 border rounded cursor-pointer">
                        {licencaLoading ? (
                          <span className="w-5 h-5 mx-auto border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></span>
                        ) : (
                          "Carregar a Licença"
                        )}
                      </div>
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  aria-label="Entrar na minha conta"
                  className="w-full py-4 text-sm font-semibold text-white bg-indigo-700 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700"
                >
                  Inscreva-se Agora
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignupScreen;
