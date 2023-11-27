/* eslint-disable react/jsx-no-undef */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/slices/authSlice";
import { Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { basAPI } from "@/configs/variable";
import logo from "../assets/azul.png";
import Nav from "@/components/Nav";

const SignupScreen = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

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

  const [role, setRole] = useState<"client" | "restaurant">("client");

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
      const url =
        role === "client" ? `${basAPI}signup/` : `${basAPI}fornecedor/`;

      let body;

      if (role === "client") {
        body = JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          password2: signupData.password,
        });
      } else if (role === "restaurant") {
        const formData = new FormData();
        (Object.keys(signupData) as Array<keyof typeof signupData>).forEach(
          (key) => {
            const value = signupData[key];
            if (value !== null) formData.append(key, value as Blob | string);
          },
        );

        // Append other form data fields here if needed

        body = formData;
      }

      const res = await fetch(url, {
        method: "POST",
        headers:
          role === "client"
            ? {
                Accept: "application/json",
                "Content-Type": "application/json",
              }
            : {}, // For form data, don't need specific headers
        body: body,
      });

      const resJson = await res.json();
      console.log("recebido", res);

      if (res.status === 201) {
        dispatch(loginUser(resJson));
        alert(
          "Você se conectou com sucesso. Agora você pode saborear sua refeição.",
        );
        if (
          typeof resJson.fornecedor_id === "object" &&
          resJson.fornecedor_id !== null
        ) {
          router.push("/RestaurantDashboad"); // Redirect to Dashboard
        }
      } else if (typeof resJson.user === "object" && resJson.user !== null) {
        dispatch(loginUser(resJson));
        console.log("Redirecting to HomeScreen");
        router.push("/HomeScreen");
      } else {
        alert(Object.values(resJson));
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <><Nav />
    <div className="w-full h-screen px-4 py-16">
    <div
          className="absolute top-0
          left-0
          w-full
          h-96
          bg-gradient-to-br
          from-[#FCB61A]
          to-[#0171CE]
          rounded-md
          filter
          blur-3xl
          opacity-50
          -z-20"
        />
      <div className="flex flex-col items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1, 1, 1, 1],
            rotate: [0, 30, 60, 240, 360],
          }}
          className="w-full p-10 mt-16 bg-white rounded shadow lg:w-1/3 md:w-1/2"
        >
         <div className="flex justify-center mb-6">
              <Image
                src={logo}
                alt="Logo"
                width={100}
                height={100}
              />
            </div>


          <h1
            tabIndex={0}
            aria-label="Login to your account"
            className="text-2xl font-extrabold leading-6 text-gray-800"
          >
            Inscreva-se Para ter uma Conta
          </h1>
          <br></br>

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
            <br></br>
          </Link>

          {/* Role selection */}
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={handleRoleChange}
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
              />
              Fornecedor de Negocio
            </label>
          </div>
          <br></br>
          <Transition
            show={loading}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
           {loading && (
  <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full">
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
              <input
                type="password"
                name="password"
                placeholder="Senha"
                onChange={handleInputChange}
                className="p-2 border rounded"
              />

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

              <div className="mt-8">
                <button
                  type="submit" // Set the button type to submit
                  aria-label="Entrar na minha conta"
                  className="w-full py-4 text-sm font-semibold leading-none text-white bg-indigo-700 border rounded focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:outline-none hover:bg-indigo-600"
                >
                  Inscreva-se Agora
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default SignupScreen;
