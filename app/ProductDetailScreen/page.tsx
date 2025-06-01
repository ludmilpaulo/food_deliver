"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";
import { Product, Review } from "@/services/types";
import { addItem } from "@/redux/slices/basketSlice";
import { t } from "@/configs/i18n";
import Image from "next/image";
import { formatCurrency } from "@/utils/currency";
import { fetchRelatedProducts } from "@/redux/slices/relatedProductsSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faSolidHeart, faShareNodes, faStar as faSolidStar, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart, faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";
import Link from "next/link";

type Props = {};

const ProductDetailPage: React.FC<Props> = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  // Get productId from route
  const productId = Number(params?.id);

  // Redux state
  const reduxState = useAppSelector((state) => state);
  const product: Product | undefined = useMemo(
    () =>
      reduxState.products.data.find((p) => p.id === productId) ||
      reduxState.relatedProducts.data.find((p) => p.id === productId),
    [reduxState, productId]
  );

  // Local fallback fetch if not in Redux
  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!product);
  useEffect(() => {
    setFetchedProduct(null);
    setLoading(!product);

    if (!product && productId) {
      fetch(`/api/product/${productId}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data || data.detail === "Not found.") {
            setFetchedProduct(null);
            setLoading(false);
            return;
          }
          setFetchedProduct(data);
        })
        .catch(() => setFetchedProduct(null))
        .finally(() => setLoading(false));
    }
  }, [productId, product]);

  const productToShow: Product | undefined = product || fetchedProduct || undefined;

  // UI state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // Cart state
  const cartItems = useAppSelector((state) => state.basket.items);
  const isInCart =
    !!(
      productToShow &&
      selectedSize &&
      cartItems.some(
        (item) => item.id === productToShow.id && item.size === selectedSize
      )
    );

  // Related products (redux)
  useEffect(() => {
    if (productId) dispatch(fetchRelatedProducts(productId));
  }, [dispatch, productId]);
  const relatedProducts = useAppSelector(
    (state: RootState) =>
      state.relatedProducts.data.filter((p) => p.id !== productId)
  );

  // Reviews
  useEffect(() => {
    if (!productToShow) return;
    fetch(`/api/product/${productToShow.id}/reviews`)
      .then((r) => r.json())
      .then((data: Review[]) => {
        setReviews(data);
        const avg =
          data.length > 0
            ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
            : 0;
        setAverageRating(Number(avg.toFixed(1)));
      });
  }, [productToShow]);

  // Share product (web)
  const handleShare = () => {
    if (!productToShow) return;
    if (navigator.share) {
      navigator.share({
        title: productToShow.name,
        text: `${productToShow.name} - ${t("share")}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t("copiedToClipboard"));
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!productToShow) return;
    if (productToShow.sizes && productToShow.sizes.length > 0 && !selectedSize) {
      alert(t("selectSize"));
      return;
    }
    if (productToShow.stock === 0) {
      alert(t("outOfStock"));
      return;
    }
    const price = productToShow.on_sale
      ? Number(productToShow.price) -
        (Number(productToShow.price) * productToShow.discount_percentage) / 100
      : Number(productToShow.price);
    dispatch(
      addItem({
        id: productToShow.id,
        name: productToShow.name,
        size: selectedSize || "",
        price,
        image: productToShow.images?.[0]?.image || "",
        store: productToShow.store_id,
        quantity,
      })
    );
    alert(`${productToShow.name} ${t("addToCart")}!`);
  };

  if (loading || !productToShow) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar actions */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label={t("back")}
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => setIsWishlisted((w) => !w)}
            aria-label={isWishlisted ? t("removeFromWishlist") : t("addToWishlist")}
          >
            <FontAwesomeIcon
              icon={isWishlisted ? faSolidHeart : faRegularHeart}
              size="lg"
              className={isWishlisted ? "text-red-600" : "text-gray-700"}
            />
          </button>
          <button onClick={handleShare} aria-label={t("share")}>
            <FontAwesomeIcon icon={faShareNodes} size="lg" />
          </button>
        </div>
      </div>

      {/* Product Images Carousel */}
      <div className="w-full relative aspect-square bg-gray-100">
        {productToShow.images?.length ? (
          <Image
            src={productToShow.images[0].image}
            alt={productToShow.name}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{productToShow.name}</h1>
        {/* Pricing */}
        <div className="flex items-center gap-2 mb-1">
          {productToShow.on_sale ? (
            <>
              <span className="text-gray-400 line-through text-lg">
                {formatCurrency(Number(productToShow.price), "ZA", "en")}
              </span>
              <span className="text-xl font-bold text-green-700">
                {formatCurrency(
                  Number(productToShow.price) -
                    (Number(productToShow.price) * productToShow.discount_percentage) / 100,
                  "ZA",
                  "en"
                )}
              </span>
              <span className="ml-2 text-xs bg-red-500 text-white rounded px-2">
                -{productToShow.discount_percentage}%
              </span>
            </>
          ) : (
            <span className="text-xl text-green-700">
              {formatCurrency(Number(productToShow.price), "ZA", "en")}
            </span>
          )}
        </div>
        <span className={`text-sm ${productToShow.stock <= 3 ? "text-red-500" : "text-green-600"}`}>
          {productToShow.stock === 0
            ? t("outOfStock")
            : productToShow.stock === 1
            ? t("lastOne")
            : productToShow.stock <= 3
            ? t("lowStock")
            : `${productToShow.stock} ${t("inStock")}`}
        </span>

        {/* Sizes */}
        {Array.isArray(productToShow.sizes) && productToShow.sizes.length > 0 && (
          <div className="mt-6">
            <span className="font-semibold mb-2 text-gray-800 block">{t("selectSize")}</span>
            <div className="flex flex-wrap gap-2">
              {productToShow.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-full font-bold ${
                    selectedSize === size
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mt-6">
          <span className="font-semibold mb-2 text-gray-800 block">{t("quantity")}</span>
          <div className="flex items-center">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2 bg-gray-200 rounded-l"
              aria-label={t("decrease")}
            >
              -
            </button>
            <span className="px-4 py-2 border-t border-b border-gray-300">{quantity}</span>
            <button
              onClick={() => {
                if (quantity < (productToShow.stock || 1)) {
                  setQuantity((q) => q + 1);
                } else {
                  alert(`${t("only")} ${productToShow.stock} ${t("itemsAvailable")}.`);
                }
              }}
              className="px-4 py-2 bg-gray-200 rounded-r"
              aria-label={t("increase")}
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (productToShow.stock === 0) return;
              if (isInCart) {
                router.push("/cart");
              } else {
                handleAddToCart();
              }
            }}
            disabled={productToShow.stock === 0}
            className={`w-full py-4 rounded-xl shadow-lg font-bold text-lg ${
              productToShow.stock === 0
                ? "bg-gray-400"
                : isInCart
                ? "bg-blue-600"
                : "bg-green-600"
            } text-white`}
          >
            {productToShow.stock === 0
              ? t("outOfStock")
              : isInCart
              ? t("goToCart")
              : t("addToCart")}
          </button>
        </div>

        {/* Ratings & Reviews */}
        <div className="mt-10">
          <span className="font-bold text-gray-800 mb-2 block">
            {t("rating")}: {averageRating} / 5
          </span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FontAwesomeIcon
                key={i}
                icon={i < Math.round(averageRating) ? faSolidStar : faRegularStar}
                className="text-yellow-400 mr-1"
              />
            ))}
          </div>
        </div>
        {/* Reviews */}
        <div className="mt-6">
          <span className="font-bold text-gray-800 mb-2 block">
            {t("customerReviews")}
          </span>
          {reviews.length === 0 ? (
            <span className="text-gray-500">{t("noReviews")}</span>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="mb-4 bg-gray-100 p-3 rounded-lg">
                <span className="font-semibold text-gray-700">{review.user}</span>
                <span className="block text-sm text-gray-600">{review.comment}</span>
                <span className="block text-xs text-gray-400 mt-1">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-8 px-4 pb-20">
        <span className="text-xl font-bold text-gray-900 mb-2 block">{t("youMayAlsoLike")}</span>
        <div className="flex overflow-x-auto gap-4">
          {relatedProducts.length === 0 ? (
            <span className="text-gray-400">{t("noReviews")}</span>
          ) : (
            relatedProducts.map((rel) => (
              <Link key={rel.id} href={`/product/${rel.id}`} className="w-36 flex-shrink-0">
                <div className="relative w-full h-32 rounded-lg bg-gray-200 overflow-hidden">
                  <Image
                    src={rel.images?.[0]?.image || "/no-image.png"}
                    alt={rel.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="mt-2 text-sm font-semibold text-gray-800 block truncate">{rel.name}</span>
                <span className="text-xs font-bold text-blue-700 block">
                  {formatCurrency(
                    rel.on_sale
                      ? rel.price - (rel.price * rel.discount_percentage) / 100
                      : rel.price,
                    "ZA",
                    "en"
                  )}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
