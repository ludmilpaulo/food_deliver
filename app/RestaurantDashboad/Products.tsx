import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Transition } from "@headlessui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { selectUser } from "@/redux/slices/authSlice";
import { fetchCategorias, fetchProducts, addProduct, updateProduct, deleteProduct } from "@/services/apiService";
import { Product, Category, Categoria } from "@/services/types";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";

const Products: React.FC = () => {
  const user = useSelector(selectUser);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Product>();

  useEffect(() => {
    const loadCategorias = async () => {
      setLoading(true);
      try {
        const data = await fetchCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Falha ao buscar categorias:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategorias();
  }, []);

  const loadProducts = useCallback(async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      const data = await fetchProducts(user.user_id);
      console.log("products==>", data)
      setProducts(data);
    } catch (error) {
      console.error("Falha ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onSubmit = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("short_description", data.short_description);
    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }
    formData.append("price", String(data.price));
    formData.append("category", selectedCategory);
    formData.append("user_id", String(user.user_id));
    formData.append("access_token", user.token);
  
    setLoading(true);
    try {
      await addProduct(formData);
      alert("Produto adicionado com sucesso!");
      setIsAddModalOpen(false);
      reset();
      loadProducts();
    } catch (error) {
      console.error("Falha ao adicionar produto:", error);
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async (data: Product) => {
    if (!editingProduct) return;
  
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("short_description", data.short_description);
    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }
    formData.append("price", String(data.price));
    formData.append("category", selectedCategory);
    formData.append("user_id", String(user.user_id));
    formData.append("access_token", user.token);
  
    setLoading(true);
    try {
      await updateProduct(editingProduct.id!, formData);
      alert("Produto atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Falha ao atualizar produto:", error);
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const handleDelete = async (productId: number) => {
    if (!user?.user_id) return;
    if (!confirm("Tem certeza de que deseja excluir este produto?")) return;
    setLoading(true);
    try {
      await deleteProduct(productId, user.user_id);
      alert("Produto excluído com sucesso!");
      loadProducts();
    } catch (error) {
      console.error("Falha ao excluir produto:", error);
      if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategory(product.category.toString());
    setIsEditModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-end py-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Adicionar Produto
        </button>
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
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full">
          <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Transition>

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-200 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-200 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-200 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-200 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider">Imagem</th>
                <th className="px-6 py-3 border-b-2 border-gray-300 bg-gray-200 text-left text-xs leading-4 text-gray-600 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-6 py-4 border-b border-gray-300">{product.name}</td>
                  <td className="px-6 py-4 border-b border-gray-300">{product.short_description}</td>
                  <td className="px-6 py-4 border-b border-gray-300">{product.price} Kz</td>
                  <td className="px-6 py-4 border-b border-gray-300">
                    <div className="relative w-16 h-16">
                      <Image
                        src={product.image || "https://ludmil.pythonanywhere.com/media/logo/azul.png"}
                        alt={product.name}
                        layout="fill"
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 border-b border-gray-300">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 focus:outline-none"
                        onClick={() => openEditModal(product)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                        onClick={() => handleDelete(product.id!)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        onSubmit={onSubmit}
        errors={errors}
      />

      <EditProductModal
        categorias={categorias}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingProduct={editingProduct}
        handleUpdate={handleUpdate}
        errors={errors}
      />
    </div>
  );
};

export default Products;
