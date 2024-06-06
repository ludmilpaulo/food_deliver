import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { logoutUser, selectUser } from "../redux/slices/authSlice";
import withAuth from "@/components/ProtectedPage";
import { baseAPI } from "@/services/types";

type ImageInfo = {
  uri: string;
  width: number;
  height: number;
  type: string;
};

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userDetails: any;
  onUpdate: (updatedDetails: any) => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userDetails, onUpdate }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [imageInfo, setImageInfo] = useState<File | null>(null);
  const [address, setAddress] = useState<string>(userDetails?.address || '');
  const [firstName, setFirstName] = useState<string>(userDetails?.first_name || '');
  const [lastName, setLastName] = useState<string>(userDetails?.last_name || '');
  const [phone, setPhone] = useState<string>(userDetails?.phone || '');
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
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=""`
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
        }
      );
    };

    userLocation();
  }, []);

  const handleTakePhotoOrSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageInfo(event.target.files[0]);
    }
  };

  const userUpdate = async () => {
    if (!imageInfo) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', imageInfo);
    formData.append('access_token', userToken);
    formData.append('address', address);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('phone', phone);

    try {
      const response = await fetch(`${baseAPI}/customer/customer/profile/update/`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.status);
        router.push('/HomeScreen');
        onUpdate({
          ...userDetails,
          address,
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar: URL.createObjectURL(imageInfo)
        });
        onClose();
      } else {
        const resp = await response.json();
        alert(resp.non_field_errors);
        console.error(resp);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 relative z-10 w-full max-w-md mx-auto">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center space-y-5">
          <div className="rounded-full overflow-hidden w-48 h-48 mt-4">
            {imageInfo && (
              <Image
                src={URL.createObjectURL(imageInfo)}
                alt="User Image"
                width={192}
                height={192}
                layout="responsive"
                unoptimized={true}
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
          <div className="w-full">
            <input
              className="border w-full p-4 rounded"
              placeholder="Primeiro Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="w-full">
            <input
              className="border w-full mt-5 p-4 rounded"
              placeholder="Ultimo Nome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="w-full">
            <input
              className="border w-full mt-5 p-4 rounded"
              placeholder="Número de Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="w-full">
            <input
              className="border w-full mt-5 p-4 rounded"
              placeholder="Endereço"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <button className="bg-blue-500 text-white p-4 rounded mt-5" onClick={userUpdate}>
              Atualize seu Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfileModal);
