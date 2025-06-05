import { useRouter } from "next/navigation";
import Image from "next/image";
import { baseAPI, Product } from "@/services/types";
import { formatCurrency, getCurrencyForCountry } from "@/utils/currency";

interface ProductCardProps {
  product: Product;
  regionCode?: string;
  language?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, regionCode = "ZA", language = "en" }) => {
  const router = useRouter();
  const price =
    product.on_sale && product.discount_percentage > 0
      ? product.price - (product.price * product.discount_percentage) / 100
      : product.price;
  const currencyCode = getCurrencyForCountry(regionCode);

  // Render category name safely
  const categoryLabel =
    typeof product.category === "string"
      ? product.category
      : product.category
      ? product.category.name
      : "";

  return (
    <div
      className="bg-white rounded-2xl p-3 shadow-md relative cursor-pointer transition hover:scale-[1.03]"
      onClick={() => router.push(`/products/${product.id}`)}
      tabIndex={0}
      role="button"
      aria-label={product.name}
    >
      <div className="w-full h-40 rounded-lg bg-gray-200 overflow-hidden mb-2 relative">
        <Image
          src={
            product.image_url?.[0]
              ? product.image_url[0].startsWith("/media/")
                ? `${baseAPI}${product.image_url[0]}`
                : product.image_url[0]
              : "/no-image.png"
          }
          alt={product.name}
          fill
          className="object-cover rounded-lg"
        />
        {product.on_sale && product.discount_percentage > 0 && (
          <div className="absolute top-2 right-2 bg-blue-500 rounded-lg px-2 py-1 flex items-center">
            <span className="text-white text-xs font-bold">
              -{product.discount_percentage}%
            </span>
          </div>
        )}
      </div>
      <div className="truncate font-bold text-gray-800 mt-1">{product.name}</div>
      <div className="mt-1 text-blue-500 text-xs">
        {categoryLabel}
      </div>
      <div className="flex items-center mt-2 mb-2">
        {product.on_sale && product.discount_percentage > 0 && (
          <span className="text-gray-400 line-through text-xs mr-2">
            {formatCurrency(product.price, currencyCode, language)}
          </span>
        )}
        <span className="text-blue-700 font-semibold text-base">
          {formatCurrency(price, currencyCode, language)}
        </span>
      </div>
    </div>
  );
};
export default ProductCard;
