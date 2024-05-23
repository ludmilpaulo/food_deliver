// hooks/useCareers.ts
import { useState, useEffect } from "react";
import { CareersResponse } from "./types";
import { baseAPI } from "@/services/types";


export const useCareers = () => {
  const [careers, setCareers] = useState<CareersResponse>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseAPI}/careers/careers/`);
        if (!response.ok) throw new Error("Network response was not ok.");
        const data: CareersResponse = await response.json();
        setCareers(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch");
      }
      setLoading(false);
    };

    fetchCareers();
  }, []);

  return { careers, loading, error };
};