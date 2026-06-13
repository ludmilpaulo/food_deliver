import React from "react";
import { useForm } from "react-hook-form";
import { Combobox } from "@headlessui/react";
import { Categoria, Product } from "@/services/types";
import { useTranslation } from "@/hooks/useTranslation";

interface EditProductModalProps {
  categorias: Categoria[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (value: boolean) => void;
  editingProduct: Product | null;
  handleUpdate: (data: Product) => void;
  errors: any;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  categorias,
  selectedCategory,
  setSelectedCategory,
  isEditModalOpen,
  setIsEditModalOpen,
  editingProduct,
  handleUpdate,
  errors,
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm<Product>();

  if (!isEditModalOpen || !editingProduct) return null;

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{t("editProduct", "Edit Product")}</h2>
        <form onSubmit={handleSubmit(handleUpdate)}>
          <div className="mb-4">
            <label className="block mb-2">{t("name", "Name")}</label>
            <input
              {...register("name", { required: true })}
              className="w-full p-2 border rounded"
              defaultValue={editingProduct.name}
            />
            {errors.name && <span className="text-red-500">{t("nameRequired", "Name is required")}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t("shortDescription", "Short Description")}</label>
            <input
              {...register("description", { required: true })}
              className="w-full p-2 border rounded"
              defaultValue={editingProduct.description}
            />
            {errors.short_description && (
              <span className="text-red-500">{t("shortDescriptionRequired", "Short description is required")}</span>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t("image", "Image")}</label>
            <input
              type="file"
              {...register("image_url", { required: false })}
              className="w-full p-2 border rounded"
            />
            {errors.image && <span className="text-red-500">{t("imageRequired", "Image is required")}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t("price", "Price")}</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { required: true })}
              className="w-full p-2 border rounded"
              defaultValue={editingProduct.price}
            />
            {errors.price && <span className="text-red-500">{t("priceRequired", "Price is required")}</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">{t("Categories", "Category")}</label>
            <Combobox
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value ?? "")}
            >
              <div className="relative">
                <Combobox.Input
                  className="w-full p-2 border rounded"
                  displayValue={(category: string) => category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <Combobox.Options className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none">
                  {categorias.map((categoria) => (
                    <Combobox.Option key={categoria.id} value={categoria.name}>
                      {({ active, selected }) => (
                        <div
                          className={`cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                          } ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {categoria.name}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
            {errors.category && <span className="text-red-500">{t("categoryRequired", "Category is required")}</span>}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              {t("update", "Update")}
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 ml-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {t("cancel", "Cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
