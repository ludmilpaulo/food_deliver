// components/CareerCard.tsx
import React from "react";
import { CareerPosition } from "./types";

interface CareerCardProps {
  career: CareerPosition;
  onClick: () => void;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career, onClick }) => (
  <div className="bg-white p-6 rounded-lg shadow transition duration-300 ease-in-out hover:shadow-lg">
    <h2 className="text-2xl font-semibold mb-4">{career.title}</h2>
    <div
      className="text-gray-600 mb-6"
      dangerouslySetInnerHTML={{ __html: career.description }}
    />
    <button
      onClick={onClick}
      className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Candidatar-se Agora
    </button>
  </div>
);
