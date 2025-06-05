"use client";
import React, { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product, baseAPI } from "@/services/types";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { addItem, selectCartItems } from "@/redux/slices/basketSlice";
import { formatCurrency, getCurrencyForCountry, CurrencyCode } from "@/utils/currency";
import { t } from "@/configs/i18n";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Props {
  deals: Product[];
}

const TodaysDealsCarousel: React.FC<Props> = ({ deals }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  const [regionCode, setRegionCode] = useState<string>("ZA");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("ZAR");

  useEffect(() => {
    const region = navigator.language.split("-")[1] || "ZA";
    setRegionCode(region);
    setCurrencyCode(getCurrencyForCountry(region));
  }, []);

  const isInCart = (productId: number) =>
    cartItems.some((item) => item.id === productId);

  const handleRedirect = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItem({
        id: product.id,
        name: product.name,
        price:
          product.discount_percentage > 0
            ? product.price * (1 - product.discount_percentage / 100)
            : product.price,
        image: product.image_url?.[0] || "",
        size: "", // required later from ProductDetailPage
        color: "", // required later from ProductDetailPage
        quantity: 1,
        store: product.store,
      })
    );
  };

  if (!deals.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 pt-4 pb-16">
      {/* Heading */}
      <div className="glassy px-6 py-3 mb-8 rounded-xl bg-white/60 backdrop-blur-md shadow-xl flex items-center justify-center">
        <span className="text-2xl mr-3">🔥</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t("todaysDeals")}
        </h2>
        <span className="text-2xl ml-3">⚡️</span>
      </div>

      {/* Carousel */}
      <Carousel
        showThumbs={false}
        showStatus={false}
        showIndicators={false}
        infiniteLoop
        autoPlay
        interval={3200}
        swipeable
        emulateTouch
        centerMode
        centerSlidePercentage={33}
        className="relative"
      >
        {deals.map((product) => (
          <div key={product.id} className="px-3 py-4">
            <div className="bg-white dark:bg-black/60 backdrop-blur-2xl border border-blue-100 rounded-3xl shadow-xl w-80 h-[500px] flex flex-col justify-between overflow-hidden transition-transform hover:scale-105">
              {/* Discount Badge */}
              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold rounded-full shadow-md z-10">
                  🔥 -{product.discount_percentage}%
                </div>
              )}

              {/* Image */}
              <div
                className="relative h-52 w-full cursor-pointer"
                onClick={() => handleRedirect(product.id)}
              >
                <Image
                  src={
                    product.image_url[0]?.startsWith("http")
                      ? product.image_url[0]
                      : `${baseAPI}${product.image_url[0]}`
                  }
                  alt={product.name}
                  fill
                  sizes="300px"
                  className="object-cover rounded-t-3xl"
                  priority
                />
              </div>

              {/* Info */}
              <div className="flex flex-col items-center px-4 pt-3">
                <h3
                  className="text-lg md:text-xl font-bold text-center text-gray-900 dark:text-white line-clamp-2 cursor-pointer"
                  onClick={() => handleRedirect(product.id)}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2 text-center">
                  {typeof product.category === "string"
                    ? product.category
                    : product.category?.name}
                </p>

                {/* Price */}
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-lg font-bold text-blue-700 dark:text-yellow-300">
                    {formatCurrency(
                      product.discount_percentage > 0
                        ? product.price *
                            (1 - product.discount_percentage / 100)
                        : product.price,
                      currencyCode
                    )}
                  </span>
                  {product.discount_percentage > 0 && (
                    <span className="text-sm line-through text-gray-400">
                      {formatCurrency(product.price, currencyCode)}
                    </span>
                  )}
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() =>
                  isInCart(product.id)
                    ? router.push("/cart")
                    : handleRedirect(product.id)
                }
                className={`w-11/12 mx-auto my-3 py-2 rounded-2xl font-bold text-white text-base shadow bg-gradient-to-r ${
                  isInCart(product.id)
                    ? "from-blue-700 to-blue-500"
                    : "from-green-600 to-green-400"
                } hover:opacity-90 transition-all`}
              >
                {isInCart(product.id) ? t("goToCart") : t("viewDetails")}
              </button>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default TodaysDealsCarousel;
