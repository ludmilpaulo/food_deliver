import React, { ChangeEvent, useEffect, useState } from "react";
import { MdEdit, MdSave, MdCancel } from "react-icons/md";
import { Store as StoreType, CategoryType } from "@/services/types";
import { updatestore, fetchstoreCategorias } from "@/services/apiService";

type StoreProfileProps = {
  store: StoreType;
  setstore: (store: StoreType) => void;
};

const StoreProfile: React.FC<StoreProfileProps> = ({ store, setstore }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [formData, setFormData] = useState({
    name: store.name,
    phone: store.phone,
    address: store.address,
    logo: null as File | null,
    store_license: null as File | null,
    category: store.category?.id || "", // Initialize with the store's current category ID
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchstoreCategorias();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

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
    updatedData.append("category", String(formData.category)); // Add category to the form data
    if (formData.logo) {
      updatedData.append("logo", formData.logo);
    }
    if (formData.store_license) {
      updatedData.append("store_license", formData.store_license);
    }

    try {
      const updatedstore = await updatestore(store.id, updatedData);
      setstore(updatedstore);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating store data", error);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: store.name,
      phone: store.phone,
      address: store.address,
      logo: null,
      store_license: null,
      category: store.category?.id || "", // Reset category
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Perfil do storee</h2>
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
          <label className="block text-sm font-medium">Nome do storee</label>
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
          <label className="block text-sm font-medium">Telefone do storee</label>
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
          <label className="block text-sm font-medium">Endereço do storee</label>
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
          <label className="block text-sm font-medium">Logotipo do storee</label>
          <input
            type="file"
            name="logo"
            onChange={handleFileChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Licença do storee</label>
          <input
            type="file"
            name="store_license"
            onChange={handleFileChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={!editMode}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
