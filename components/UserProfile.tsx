import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Image from "next/image";

// Replace the redux slices, configs, and other utils you use with their web equivalents.
import { logoutUser, selectUser } from "../redux/slices/authSlice";
import { basAPI, googleAPi } from "../configs/variable";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import withAuth from "@/components/ProtectedPage";

type ImageInfo = {
  uri: string;
  width: number;
  height: number;
  type: string;
};

const UserProfile: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // const [imageInfo, setImageInfo] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<File | null>(null);

  const [address, setAddress] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  // Assume you get the user's token some other way
  const userToken = user.token;

  const router = useRouter();

  useEffect(() => {
    const userLocation = async () => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude);

          try {
            // Here, I'm using Google Maps API as an example for geocoding.
            // You might need to install a relevant package and set up API keys.
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleAPi}`,
            );
            const data = await response.json();
            const formattedAddress = data.results[0].formatted_address;
            setAddress(formattedAddress);
          } catch (error) {
            console.log(error);
          }
        },
        (error) => {
          alert("Permission to access location was denied");
        },
      );
    };

    userLocation();
  }, []);

  const handleTakePhotoOrSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      setImageInfo(event.target.files[0]);
      // You can further process the image if needed, e.g., uploading it to a server
    }
  };

  const userUpdate = async () => {
    if (!imageInfo) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", imageInfo);
    formData.append("access_token", userToken);
    formData.append("address", address);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("phone", phone);

    try {
      const response = await fetch(`${basAPI}api/customer/profile/update/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.status);
        // router.push("/HomeScreen"); // Navigate to HomeScreen in Next.js
      } else {
        const resp = await response.json();
        alert(resp.non_field_errors);
        console.error(resp);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
      // Use Next.js's router to reload the page.
      router.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="flex-1 p-5">
          <div className="flex flex-col items-center space-y-5">
            <div className="w-48 h-48 mt-4 overflow-hidden rounded-full">
              {imageInfo && (
                <Image
                  src={URL.createObjectURL(imageInfo)}
                  alt="User Image"
                  width={192}
                  height={192}
                  layout="responsive"
                  unoptimized={true} // because blob URLs aren't optimized by default
                />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                capture
                onChange={handleTakePhotoOrSelect}
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleTakePhotoOrSelect}
              />
            </div>
            <div className="w-full mx-12">
              <input
                className="w-full p-4 border rounded"
                placeholder="Primeiro Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="w-full">
              <input
                className="w-full p-4 mt-5 border rounded"
                placeholder="Ultimo Nome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="w-full">
              <input
                className="w-full p-4 mt-5 border rounded"
                placeholder="Número de Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <button
                className="p-4 mt-5 text-white bg-blue-500 rounded"
                onClick={userUpdate}
              >
                Atualize seu Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(UserProfile);
