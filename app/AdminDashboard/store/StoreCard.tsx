import React from "react";
import Image from "next/image";
import { Store } from "@/services/types";

interface StoreCardProps {
  store: Store;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onEdit: (store: Store) => void;
  onDelete: (id: number) => void;
}

// You can use any placeholder image here (public folder recommended)
const DEFAULT_STORE_IMAGE = "/store-placeholder.png"; // Place a placeholder image in /public

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onActivate,
  onDeactivate,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mb-4 p-4 border rounded-lg">
      <div className="flex items-center">
        <Image
          src={store.logo || DEFAULT_STORE_IMAGE}
          alt={store.name}
          width={64}
          height={64}
          className="rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl font-bold">{store.name}</h2>
          <p>{store.address}</p>
          <p>{store.phone}</p>
          <p>Status: {store.is_approved ? "Ativo" : "Inativo"}</p>
        </div>
      </div>
      <div className="flex mt-4">
        <button
          className={`py-2 px-4 mr-2 ${store.is_approved ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
          onClick={() =>
            store.is_approved
              ? onDeactivate(store.id)
              : onActivate(store.id)
          }
        >
          {store.is_approved ? "Desativar" : "Ativar"}
        </button>
        <button
          className="py-2 px-4 bg-yellow-500 text-white mr-2"
          onClick={() => onEdit(store)}
        >
          Editar
        </button>
        <button
          className="py-2 px-4 bg-red-500 text-white"
          onClick={() => onDelete(store.id)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

export default StoreCard;
