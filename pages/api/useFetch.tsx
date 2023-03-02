import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser } from "../../redux/slices/authSlice";
import { selectCartItems, selectTotalItems, selectTotalPrice, updateBusket } from "../../redux/slices/basketSlice";
import { useEffect, useState } from "react";

interface Restaurant {
    id?: number;
    name?: string;
    phone?: number;
    address?: string;
    logo?: string;
  }

const useFetch = (params: { endpoint: any; method: any; body?: any; }) => {
    const [status, setStatus] = useState('idle');
    const [restaurantData, setRestaurantData] = useState<Restaurant[]>([]);
    const [refetch, setRefetch] = useState(false)

    const url = "https://www.sunshinedeliver.com/api";

    const dispatch = useDispatch();


    const user = useSelector(selectUser);


    useEffect(() => {
        if (!params) return;

        const fetchData = async () => {
            setStatus('loading');

            let headers = undefined;

            if (params) {

                let token = user?.token;

                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  //  'Authorization': `Token ${token}`
                }
            }
            else {
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            }

            const response = await fetch(url + params.endpoint, {
                headers: headers,
                method: params.method,
                ...(params.method == "POST" && { body: JSON.stringify(params.body) })
            })

            const data = await response.json();
            setRestaurantData(data?.restaurants);
            setStatus('loaded');
        };

        fetchData();
    }, []);

    return { status, restaurantData, refetch, setRefetch };
};

export default useFetch;