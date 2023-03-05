import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
} from "react";

interface Restaurant {
  restaurantData: any;
  map: any;
  id: number;
  name: string;
  phone: number;
  address: string;
  logo: string;
}

export default function RestaurantItem({ restaurantData }: Restaurant) {
  return (
    <>
      {restaurantData.map((item: Restaurant) => (
        <div className="rounded-xl relative" key={item.id}>
          {/* Overlay */}
          <div className="absolute w-full h-full bg-black/50 rounded-xl h2-white">
            <p className="font-bold h2-2xl px-2 pt-4">{item.name}</p>
            <p className="px-2">{item.phone}</p>

            <Link
              href={{
                pathname: "/DetailsScreen",
                query: {
                  name: item.name,
                  restaurantId: item.id,
                  phone: item.phone,
                  image_url: item.logo,
                  address: item.address,
                },
              }}
            >
              <button className="border-white bg-white h2-black mx-2 absolute bottom-4">
                Peça Agora
              </button>
            </Link>
          </div>
          <Image
            className="max-h-[160px] md:max-h-[200px] w-full object-cover rounded-xl"
            src={item.logo}
            width={100}
            height={100}
            alt=""
          />
        </div>
      ))}
    </>
  );
}
