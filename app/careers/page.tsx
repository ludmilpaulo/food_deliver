"use client";
import { fetchAboutUsData } from "@/services/information";
import { AboutUsData } from "@/services/types";
import { useEffect, useState } from "react";
import { ApplicationModal } from "./ApplicationModal";
import { CareerCard } from "./CareerCard";
import { CareerPosition } from "./types";
import { useCareers } from "./useCareers";


export default function CareersPage() {
  const { careers, loading, error } = useCareers();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState({ id: 0, title: "" });
  const [headerData, setHeaderData] = useState<AboutUsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAboutUsData();
      setHeaderData(data);
    };
    fetchData();
  }, []);

  const handleApplyClick = (career: CareerPosition) => {
    setSelectedCareer(career);
    setModalOpen(true);
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className="mx-auto px-4 py-20"
      style={{
        backgroundImage: `url(${headerData?.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-3xl font-bold text-center mb-10">
        Career Opportunities
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careers.map((career) => (
          <CareerCard
            key={career.id}
            career={career}
            onClick={() => handleApplyClick(career)}
          />
        ))}
      </div>
      <ApplicationModal
        isOpen={modalOpen}
        closeModal={() => setModalOpen(false)}
        careerTitle={selectedCareer.title}
        careerId={selectedCareer.id}
      />
    </div>
  );
}