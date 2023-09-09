import React, { useEffect, useState } from "react";
import Link from "next/link";
import { local } from "@/configs/variable";
import { User } from "@/redux/authReducer";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/router";
import { Transition } from "@headlessui/react";

// Define the TypeScript type for a product based on the response structure.
type Product = {
  user_id?:number;
  id?: number;
  nome: string;
  descricao_curta: string;
  imagem: string;
  preco: string;
  categoria: string | number;
  // Add other fields if necessary...
};

type Categoria = {
  id: number;
  nome: string;
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
        const response = await fetch(`${local}/api/categorias/`);
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
      formData.append("fornecedor", String(user.user_id));
    }

    if (data.imagem) {
      formData.append("imagem", data.imagem[0]);
    }

    try {
      const response = await fetch(`${local}/api/add-product/?`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("adiocionar", result)
      alert("produto adicionado com sucesso");
      setLoading(false);
    } catch (error) {
      console.error("An exception occurred:", error);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

      if (user?.user_id) {
        try {
          const response = await fetch(
            `${local}/api/get_products/?user_id=${user.user_id}`
          );
          if (response.ok) {
            const data = await response.json();

            console.log("produtos", data)
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
    };

    fetchProductData();
  }, [user]);

  const handleUpdate = async (productId: number, updatedProductData: Product) => {
    try {
      // Include the user_id in the updatedProductData object
      updatedProductData.user_id = user.user_id;
  
      const response = await fetch(
        `${local}/api/update-product/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProductData),
        }
      );
      console.log("update=>", response);
  
      if (response.ok) {
        alert("Product updated successfully!");
      } else {
        alert("Failed to update product. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while trying to update the product. Please try again.");
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
          `${local}/api/delete-product/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user_id }),
          }
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
        alert("An error occurred while trying to delete the product. Please try again.");
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
      <div className="container mx-auto px-4">
        <div className="content-wrapper">
          <div className="page-header flex justify-center items-center">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
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
            <div className="w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </Transition>

          {!loading && (
            <>
              {isAddModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg w-1/2">
                    <h2 className="text-xl font-bold mb-4">
                      Adicionar Produto
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                  <label className="block mb-2">Nome</label>
                  <input
                    {...register("nome", { required: true })}
                    className="w-full p-2 border"
                  />
                  {errors.nome && (
                    <span className="text-red-500">Nome is required</span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Descrição Curta</label>
                  <input
                    {...register("descricao_curta", { required: true })}
                    className="w-full p-2 border"
                  />
                  {errors.descricao_curta && (
                    <span className="text-red-500">
                      Descrição Curta is required
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Imagem URL</label>
                  <input
                    type="file"
                    {...register("imagem", { required: true })}
                    className="w-full p-2 border"
                  />

                  {errors.imagem && (
                    <span className="text-red-500">Imagem URL is required</span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("preco", { required: true })}
                    className="w-full p-2 border"
                  />
                  {errors.preco && (
                    <span className="text-red-500">Preço is required</span>
                  )}
                </div>

                <div className="mb-4">
                <label className="block mb-2">Categoria</label>
                <input
                    list="categorias"
                    {...register("categoria", { required: true })}
                    className="w-full p-2 border"
                />
                <datalist id="categorias">
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.nome} />
                    ))}
                </datalist>

                {errors.categoria && (
                    <span className="text-red-500">Categoria is required</span>
                )}
            </div>

                {/* ... (Add other form fields similarly) */}

                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                  >
                    Cancelar
                  </button>
                </div>
                    </form>
                  </div>
                </div>
              )}

              {isEditModalOpen && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg w-1/2">
                    <h2 className="text-xl font-bold mb-4">Editar Produto</h2>
                    <form
                      onSubmit={handleSubmit((data) =>
                        handleUpdate(editingProduct?.id || 0, data)
                      )}
                    >
                            <div className="mb-4">
                  <label className="block mb-2">Nome</label>
                  <input
                    {...register("nome", { required: true })}
                    className="w-full p-2 border"
                    defaultValue={editingProduct?.nome}
                  />
                  {/* ... other form fields similarly */}
                </div>
                {/* ... other modal content */}

                <div className="mb-4">
                  <label className="block mb-2">Descrição Curta</label>
                  <input
                    {...register("descricao_curta", { required: true })}
                    className="w-full p-2 border"
                    defaultValue={editingProduct?.descricao_curta}
                  />
                  {errors.descricao_curta && (
                    <span className="text-red-500">
                      Descrição Curta is required
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Imagem URL</label>
                  <input
                    type="file"
                    {...register("imagem", { required: true })}
                    className="w-full p-2 border"
                  />

                  {errors.imagem && (
                    <span className="text-red-500">Imagem URL is required</span>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("preco", { required: true })}
                    className="w-full p-2 border"
                  />
                  {errors.preco && (
                    <span className="text-red-500">Preço is required</span>
                  )}
                </div>

                <div className="mb-4">
                <label className="block mb-2">Categoria</label>
                <input
                    list="categorias"
                    {...register("categoria", { required: true })}
                    className="w-full p-2 border"
                />
                <datalist id="categorias">
                    {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.nome} />
                    ))}
                </datalist>

                {errors.categoria && (
                    <span className="text-red-500">Categoria is required</span>
                )}
            </div>


                {/* ... (Add other form fields similarly) */}

                <div className="flex justify-end mt-4">
                <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              {editingProduct ? "Update" : "Salvar"}
            </button>
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProduct(null);  // Reset the editing product when modal is closed.
              }}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
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
                              <th className="py-2 px-4 border">No</th>
                              <th className="py-2 px-4 border">Nome</th>
                              <th className="py-2 px-4 border">
                                Pequena descrição
                              </th>
                              <th className="py-2 px-4 border">Preço</th>
                              <th className="py-2 px-4 border">Imagem</th>
                              <th className="py-2 px-4 border">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products?.map((product, index) => (
                              <tr key={index} className="table-info">
                                <td className="py-2 px-4 border">{product.id}</td>
                                <td className="py-2 px-4 border text-black">
                                  <Link
                                    href={`/restaurant/edit-product/${product.id}`}
                                  >
                                    <p className="text-black">{product.nome}</p>
                                  </Link>
                                </td>
                                <td className="py-2 px-4 border">
                                  {product.descricao_curta}
                                </td>
                                <td className="py-2 px-4 border">
                                  {product.preco} Kz
                                </td>
                                <td className="py-2 px-4 border text-center relative">
                                  <div className="absolute inset-0">
                                    <Image
                                      className="rounded-full object-cover"
                                      src={
                                        product.imagem ||
                                        "/path/to/default/image.png"
                                      }
                                      layout="fill"
                                      alt={product.nome}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 px-4 border flex justify-around">
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
