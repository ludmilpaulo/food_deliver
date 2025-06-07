"use client";
import React from "react";
import { CareerPosition } from "./types";
import { t } from "@/configs/i18n";
import { MapPin } from "lucide-react"; // optional: use your favorite icon library

interface CareerCardProps {
  career: CareerPosition;
  onClick: () => void;
  applyLabel?: string;
}

export const CareerCard: React.FC<CareerCardProps> = ({
  career,
  onClick,
  applyLabel,
}) => (
  <div className="relative group bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[340px]">
    <div>
      <div className="flex items-center mb-3">
        <span className="inline-flex items-center bg-gradient-to-r from-blue-600 to-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          <MapPin className="w-4 h-4 mr-1" />
          {career.location}
        </span>
      </div>
      <h2 className="text-2xl font-extrabold mb-4 text-blue-800 group-hover:text-yellow-500 transition-colors duration-200">
        {career.title}
      </h2>
      <div
        className="text-gray-700 prose prose-sm mb-4 line-clamp-4"
        dangerouslySetInnerHTML={{ __html: career.description }}
      />
    </div>
    <button
      onClick={onClick}
      className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-yellow-400 hover:from-yellow-500 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      aria-label={applyLabel || t("applyNow") || "Candidatar-se"}
    >
      <span>🚀</span> {applyLabel || t("applyNow") || "Candidatar-se"}
    </button>
  </div>
);
