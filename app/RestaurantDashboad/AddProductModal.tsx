import React from "react";
import { useForm } from "react-hook-form";
import { Combobox } from "@headlessui/react";
import { Categoria, Product } from "@/services/types";

interface AddProductModalProps {
  categorias: Categoria[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (value: boolean) => void;
  onSubmit: (data: Product) => void;
  errors: any;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  categorias,
  selectedCategory,
  setSelectedCategory,
  isAddModalOpen,
  setIsAddModalOpen,
  onSubmit,
  errors,
}) => {
  const { register, handleSubmit } = useForm<Product>();

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Adicionar Produto</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block mb-2">Nome</label>
            <input
              {...register("name", { required: true })}
              className="w-full p-2 border rounded"
            />
            {errors.name && <span className="text-red-500">Nome é obrigatório</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Pequena Descrição</label>
            <input
              {...register("description", { required: true })}
              className="w-full p-2 border rounded"
            />
            {errors.short_description && <span className="text-red-500">Descrição curta é obrigatória</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Imagem</label>
            <input
              type="file"
              {...register("image_url", { required: true })}
              className="w-full p-2 border rounded"
            />
            {errors.image && <span className="text-red-500">Imagem é obrigatória</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Preço</label>
            <input
              type="number"
              step="0.01"
              {...register("price", { required: true })}
              className="w-full p-2 border rounded"
            />
            {errors.price && <span className="text-red-500">Preço é obrigatório</span>}
          </div>
          <div className="mb-4">
            <label className="block mb-2">Categoria</label>
            <Combobox value={selectedCategory} onChange={setSelectedCategory}>
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
            {errors.category && <span className="text-red-500">Categoria é obrigatória</span>}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 ml-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
