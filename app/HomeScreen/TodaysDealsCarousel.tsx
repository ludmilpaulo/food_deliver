"use client";
import React from "react";
import { Carousel } from "react-responsive-carousel";
import Image from "next/image";
import { Product } from "@/services/types";
import { t } from "@/configs/i18n";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Props {
  deals: Product[];
}

const TodaysDealsCarousel: React.FC<Props> = ({ deals }) => {
  if (!deals.length) return null;

  return (
    <section className="max-w-6xl mx-auto pt-2 pb-10 px-2">
      {/* Heading with glassmorphism */}
      <div className="glassy px-4 py-2 mb-6 shadow-2xl rounded-xl flex items-center justify-center bg-white/70 backdrop-blur-xl">
        <span className="text-2xl mr-2">🔥</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center">
          {t("todaysDeals")}
        </h2>
        <span className="text-2xl ml-2">⚡️</span>
      </div>
      <Carousel
        showThumbs={false}
        showStatus={false}
        showIndicators={false}  // <---- REMOVE DOTS
        centerMode
        centerSlidePercentage={33}
        infiniteLoop
        autoPlay
        interval={2800}
        swipeable
        emulateTouch
        stopOnHover
        renderArrowPrev={(clickHandler, hasPrev) =>
          hasPrev && (
            <button
              type="button"
              onClick={clickHandler}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white/70 backdrop-blur-lg border border-white/80 shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-blue-600 text-2xl hover:bg-blue-200 transition"
              aria-label="Previous"
            >
              ←
            </button>
          )
        }
        renderArrowNext={(clickHandler, hasNext) =>
          hasNext && (
            <button
              type="button"
              onClick={clickHandler}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white/70 backdrop-blur-lg border border-white/80 shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-blue-600 text-2xl hover:bg-blue-200 transition"
              aria-label="Next"
            >
              →
            </button>
          )
        }
        className="relative"
      >
        {deals.map((product) => (
          <div
            key={product.id}
            className="p-3 md:p-4 flex justify-center items-center"
          >
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl w-80 h-[450px] flex flex-col justify-between overflow-hidden border border-blue-100 relative group transition-all hover:shadow-blue-200">
              {/* Discount Badge */}
              {product.discount_percentage > 0 && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1">
                  <span>🔥</span> -{product.discount_percentage}%
                </div>
              )}
              {/* Product Image */}
              <div className="flex-1 relative mb-2">
                <Image
                  src={product.image_urls?.[0] || "/no-image.png"}
                  alt={product.name}
                  fill
                  sizes="300px"
                  className="object-cover w-full h-52 rounded-t-2xl transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              {/* Product Info */}
              <div className="flex flex-col items-center justify-center flex-1 px-3">
                <h3 className="font-bold text-lg md:text-xl text-center text-black dark:text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="mb-2 text-xs text-gray-500">{product.category?.name}</div>
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-xl font-bold text-blue-700 dark:text-yellow-300">
                    R${" "}
                    {(
                      product.discount_percentage > 0
                        ? product.price * (1 - product.discount_percentage / 100)
                        : product.price
                    ).toFixed(2)}
                  </span>
                  {product.discount_percentage > 0 && (
                    <span className="text-xs line-through text-gray-400">
                      {product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {/* Add to Cart Button */}
              <button className="w-11/12 mx-auto mb-4 py-2 rounded-2xl font-bold text-white shadow bg-gradient-to-r from-blue-700 to-yellow-400 hover:from-blue-800 hover:to-yellow-600 text-base flex items-center justify-center gap-2 transition">
                🛒 {t("addToCart")}
              </button>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default TodaysDealsCarousel;
