import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { basAPI } from "@/configs/variable";

import { useSelector } from "react-redux";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";
import { selectUser } from "@/redux/slices/authSlice";

// Define the TypeScript type for a product based on the response structure.
type Product = {
  user_id?: number;
  id?: number;
  name: string;
  short_description: string;
  image: string;
  price: string;
  category: string | number;
  // Add other fields if necessary...
};

type Categoria = {
  id: number;
  name: string;
  slug: string;
};

interface ProductsProps {
  products?: Product[];
}

const Products: React.FC<ProductsProps> = () => {
  const user = useSelector(selectUser);

  const [products, setProducts] = useState<Product[] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Product>();

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${basAPI}api/categorias/`);
        if (response.ok) {
          const data = await response.json();
          setCategorias(data);
          setLoading(false);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    fetchCategorias();
  }, []);

  const onSubmit = async (data: Product) => {
    setLoading(true);
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, String(value));
    }
    if (user.user_id !== undefined) {
      formData.append("user_id", String(user.user_id));
      formData.append("access_token", String(user.token));
    }

    if (data.image) {
      formData.append("image", data.image[0]);
    }

    try {
      const response = await fetch(`${basAPI}api/add-product/`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("adiocionar", result);
      alert("produto adicionado com sucesso");
      setLoading(false);
      fetchProductData();
    } catch (error) {
      console.error("An exception occurred:", error);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchProductData = useCallback(async () => {
    setLoading(true);

    if (user?.user_id) {
      try {
        const response = await fetch(
          `${basAPI}api/get_products/?user_id=${user.user_id}`,
        );
        if (response.ok) {
          const data = await response.json();

          console.log("produtos==>", data);
          if (data && data.length > 0) {
            setProducts(data);
            setLoading(false);
          }
        } else {
          console.error("Failed to fetch product data");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }, [user]);

  
  useEffect(() => {
  

    fetchProductData();
  }, [fetchProductData, user]);

  const handleUpdate = async (
    productId: number,
    updatedProductData: Product,
  ) => {
    try {
      // Include the user_id in the updatedProductData object
      updatedProductData.user_id = user.user_id;

      const response = await fetch(`${basAPI}/api/update-product/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProductData),
      });
      console.log("update=>", response);

      if (response.ok) {
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        "An error occurred while trying to update the product. Please try again.",
      );
    }
  };

  const handleDelete = async (productId: number) => {
    const user_id = user?.user_id;

    if (!user_id) {
      alert("User ID not provided.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `${basAPI}/api/delete-product/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user_id }),
          },
        );

        if (response.ok) {
          alert("Product deleted successfully!");
          setProducts((prevProducts) => {
            if (prevProducts) {
              return prevProducts.filter((product) => product.id !== productId);
            } else {
              return null;
            }
          });
        } else {
          alert("Failed to delete product. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(
          "An error occurred while trying to delete the product. Please try again.",
        );
      }
    }
  };

  // Function to open the edit modal with the selected product
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="container px-4 mx-auto">
        <div className="content-wrapper">
          <div className="flex items-center justify-center page-header">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 ml-4 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Adicionar produto
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
            <>
              {isAddModalOpen && (
                <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                  <div className="w-1/2 p-6 bg-white rounded-lg">
                    <h2 className="mb-4 text-xl font-bold">
                      Adicionar Produto
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                        <label className="block mb-2">Nome</label>
                        <input
                          {...register("name", { required: true })}
                          className="w-full p-2 border"
                        />
                        {errors.name && (
                          <span className="text-red-500">Nome is required</span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Descrição Curta</label>
                        <input
                          {...register("short_description", { required: true })}
                          className="w-full p-2 border"
                        />
                        {errors.short_description && (
                          <span className="text-red-500">
                            Descrição Curta is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Imagem URL</label>
                        <input
                          type="file"
                          {...register("image", { required: true })}
                          className="w-full p-2 border"
                        />

                        {errors.image && (
                          <span className="text-red-500">
                            Imagem URL is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Preço</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register("price", { required: true })}
                          className="w-full p-2 border"
                        />
                        {errors.price && (
                          <span className="text-red-500">
                            Preço is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Categoria</label>
                        <input
                          list="category"
                          {...register("category", { required: true })}
                          className="w-full p-2 border"
                        />
                        <datalist id="categorias">
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.name} />
                          ))}
                        </datalist>

                        {errors.category && (
                          <span className="text-red-500">
                            Categoria is required
                          </span>
                        )}
                      </div>

                      {/* ... (Add other form fields similarly) */}

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {isEditModalOpen && (
                <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                  <div className="w-1/2 p-6 bg-white rounded-lg">
                    <h2 className="mb-4 text-xl font-bold">Editar Produto</h2>
                    <form
                      onSubmit={handleSubmit((data) =>
                        handleUpdate(editingProduct?.id || 0, data),
                      )}
                    >
                      <div className="mb-4">
                        <label className="block mb-2">Nome</label>
                        <input
                          {...register("name", { required: true })}
                          className="w-full p-2 border"
                          defaultValue={editingProduct?.name}
                        />
                        {/* ... other form fields similarly */}
                      </div>
                      {/* ... other modal content */}

                      <div className="mb-4">
                        <label className="block mb-2">Descrição Curta</label>
                        <input
                          {...register("short_description", { required: true })}
                          className="w-full p-2 border"
                          defaultValue={editingProduct?.short_description}
                        />
                        {errors.short_description && (
                          <span className="text-red-500">
                            Descrição Curta is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Imagem URL</label>
                        <input
                          type="file"
                          {...register("image", { required: true })}
                          className="w-full p-2 border"
                        />

                        {errors.image && (
                          <span className="text-red-500">
                            Imagem URL is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Preço</label>
                        <input
                          type="number"
                          step="0.01"
                          {...register("price", { required: true })}
                          className="w-full p-2 border"
                        />
                        {errors.price && (
                          <span className="text-red-500">
                            Preço is required
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block mb-2">Categoria</label>
                        <input
                          list="category"
                          {...register("category", { required: true })}
                          className="w-full p-2 border"
                        />
                        <datalist id="categorias">
                          {categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.name} />
                          ))}
                        </datalist>

                        {errors.category && (
                          <span className="text-red-500">
                            Categoria is required
                          </span>
                        )}
                      </div>

                      {/* ... (Add other form fields similarly) */}

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          {editingProduct ? "Update" : "Salvar"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditModalOpen(false);
                            setEditingProduct(null); // Reset the editing product when modal is closed.
                          }}
                          className="px-4 py-2 ml-4 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap">
                <div className="w-full">
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="min-w-full bg-white border rounded-lg">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 border">No</th>
                              <th className="px-4 py-2 border">Nome</th>
                              <th className="px-4 py-2 border">
                                Pequena descrição
                              </th>
                              <th className="px-4 py-2 border">Preço</th>
                              <th className="px-4 py-2 border">Imagem</th>
                              <th className="px-4 py-2 border">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products?.map((product, index) => (
                              <tr key={index} className="table-info">
                                <td className="px-4 py-2 border">
                                  {product.id}
                                </td>
                                <td className="px-4 py-2 text-black border">
                                  <Link
                                    href={`/restaurant/edit-product/${product.id}`}
                                  >
                                    <p className="text-black">{product.name}</p>
                                  </Link>
                                </td>
                                <td className="px-4 py-2 border">
                                  {product.short_description}
                                </td>
                                <td className="px-4 py-2 border">
                                  {product.price} Kz
                                </td>
                                <td className="relative px-4 py-2 text-center border">
                                  <div className="absolute inset-0">
                                    <Image
                                      className="object-cover rounded-full"
                                      src={
                                        product.image ||
                                        "/path/to/default/image.png"
                                      }
                                      layout="fill"
                                      alt={product.name}
                                    />
                                  </div>
                                </td>
                                <td className="flex justify-around px-4 py-2 border">
                                  {/** <button
                                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                    onClick={() => openEditModal(product)}
                                  >
                                    <FaEdit />
                                  </button>
                                  */}
                                  <button
                                    className="text-red-600 hover:text-red-800 focus:outline-none"
                                    onClick={() =>
                                      handleDelete(product?.id || 0)
                                    }
                                  >
                                    <FaTrash />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;
