import React from "react";
import Image from "next/image";
import { RestaurantType } from "@/services/types";

interface RestaurantCardProps {
  restaurant: RestaurantType;
  onActivate: (id: number) => void;
  onDeactivate: (id: number) => void;
  onEdit: (restaurant: RestaurantType) => void;
  onDelete: (id: number) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onActivate, onDeactivate, onEdit, onDelete }) => {
  return (
    <div className="mb-4 p-4 border rounded-lg">
      <div className="flex items-center">
        <Image
          src={restaurant.logo}
          alt={restaurant.name}
          width={64}
          height={64}
          className="rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl font-bold">{restaurant.name}</h2>
          <p>{restaurant.address}</p>
          <p>{restaurant.phone}</p>
          <p>Status: {restaurant.is_approved ? "Ativo" : "Inativo"}</p>
        </div>
      </div>
      <div className="flex mt-4">
        <button
          className={`py-2 px-4 mr-2 ${restaurant.is_approved ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
          onClick={() => (restaurant.is_approved ? onDeactivate(restaurant.id) : onActivate(restaurant.id))}
        >
          {restaurant.is_approved ? "Desativar" : "Ativar"}
        </button>
        <button
          className="py-2 px-4 bg-yellow-500 text-white mr-2"
          onClick={() => onEdit(restaurant)}
        >
          Editar
        </button>
        <button
          className="py-2 px-4 bg-red-500 text-white"
          onClick={() => onDelete(restaurant.id)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
