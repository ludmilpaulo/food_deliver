import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { selectUser } from "@/redux/slices/authSlice";
import { clearCart, selectCartItems } from "@/redux/slices/basketSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';


  

const CheckoutScreen =() => {
    const [userAddress, setUserAddress] = useState<string>("");
    const router = useRouter();

   // const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    const [location, setLocation] = useState<{ latitude: number, longitude: number }>({ latitude: 0, longitude: 0 });

    const dispatch = useDispatch();

    const user = useSelector(selectUser);

    const allCartItems = useSelector(selectCartItems);

    const formattedCartItems = allCartItems.map(item => ({
        meal_id: item.id,
        quantity: item.quantity
    }));
    
    console.log(formattedCartItems);
    
    
      let resId = allCartItems.map(({ resId }: { resId: number }) => {
        return `${resId}`.toString();
      });

      let restaurantId = resId.toString();

    // This would use the web navigator to get location data
    const getUserLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
        } else {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }, () => {
                alert('Unable to retrieve your location');
            });
        }
    };

    const completeOrder = async () => {
       
        const tokenValue = user?.token;  
    

        const orderDetails = formattedCartItems;  
        let response = await fetch(
            "https://www.sunshinedeliver.com/api/customer/order/add/",
            {
               // mode: "no-cors",
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: tokenValue,
                    restaurant_id: restaurantId[0],
                    address: userAddress,
                    order_details: orderDetails,
                }),
            }
        );

        const responseData = await response.json();
        console.log(responseData)
        if(responseData.status ==='success'){
            dispatch(clearCart());
            router.push('/')

        }
        else{
            alert(responseData.status)
        }

       
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    return (
        <div>
            <div className="bg-blue-300 relative h-60">
                <MapContainer center={[location.latitude, location.longitude]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.latitude, location.longitude]} />
                </MapContainer>
            </div>

            <div className="flex-1 p-4">
                {/* Placeholder for Google Places Autocomplete. You'll need a web-compatible component. */}
                <input 
                    className="w-full p-2 border border-gray-300 rounded" 
                    placeholder="Adicione seu endereço" 
                    onChange={e => setUserAddress(e.target.value)} 
                    value={userAddress}
                />

                <div 
                    className="h-10 w-full bg-blue-500 my-4 rounded-full flex items-center justify-center border border-blue-500 cursor-pointer"
                    onClick={completeOrder}
                >
                    <p>Pagar na entrega</p>
                </div>
                <div 
                    className="h-10 w-full bg-blue-500 rounded-full flex items-center justify-center border border-blue-500 cursor-pointer"
                    onClick={completeOrder}
                >
                    <p>FAÇA SEU PEDIDO</p>
                </div>
            </div>
        </div>
    );
}

export default  CheckoutScreen;
