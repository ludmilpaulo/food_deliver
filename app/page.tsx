"use client";
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/store"; // Only use these!
import { getLanguage, setLanguageFromBrowser } from "@/configs/i18n";
import { fetchStoreTypes } from "@/redux/slices/storeTypeSlice";
import { fetchAllProducts } from "@/redux/slices/allProductsSlice";
import { fetchAllStores } from "@/redux/slices/allStoresSlice";

export default function Home() {
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [lang, setLang] = useState(getLanguage());



  useEffect(() => {
    dispatch(fetchStoreTypes());
    dispatch(fetchAllStores());
    dispatch(fetchAllProducts());
    setLanguageFromBrowser();
    setLang(getLanguage());
  }, [dispatch]);

  return (
    <>
      {/* Your UI here */}
    </>
  );
}
