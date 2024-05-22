import React, { ChangeEvent, useState } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { Restaurant, RestaurantType } from "@/services/types";
import { updateRestaurant } from "@/services/apiService";


type RestaurantProfileProps = {
    restaurant: RestaurantType;
    setRestaurant: (restaurant: RestaurantType) => void;
  };

const RestaurantProfile: React.FC<RestaurantProfileProps> = ({ restaurant, setRestaurant }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: restaurant.name,
    phone: restaurant.phone,
    address: restaurant.address,
    logo: null as File | null,
    restaurant_license: null as File | null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    }
  };

  const handleSave = async () => {
    const updatedData = new FormData();
    updatedData.append("name", formData.name);
    updatedData.append("phone", formData.phone);
    updatedData.append("address", formData.address);
    if (formData.logo) {
      updatedData.append("logo", formData.logo);
    }
    if (formData.restaurant_license) {
      updatedData.append("restaurant_license", formData.restaurant_license);
    }

    try {
      const updatedRestaurant = await updateRestaurant(restaurant.id, updatedData);
      setRestaurant(updatedRestaurant);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating restaurant data", error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: restaurant.name,
      phone: restaurant.phone,
      address: restaurant.address,
      logo: null,
      restaurant_license: null,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Perfil do Restaurante</h2>
        {editMode ? (
          <div className="flex space-x-2">
            <button onClick={handleSave} className="text-green-500"><MdSave size={24} /></button>
            <button onClick={handleCancel} className="text-red-500"><MdCancel size={24} /></button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} className="text-blue-500"><MdEdit size={24} /></button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome do Restaurante</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Telefone do Restaurante</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Endereço do Restaurante</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Logotipo do Restaurante</label>
          <input
            type="file"
            name="logo"
            onChange={handleFileChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Licença do Restaurante</label>
          <input
            type="file"
            name="restaurant_license"
            onChange={handleFileChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
