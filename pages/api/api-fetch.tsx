import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
;
import { logoutUser, selectUser } from "../../redux/slices/authSlice";
import { selectCartItems, selectTotalItems, selectTotalPrice, updateBusket } from "../../redux/slices/basketSlice";

const apiFetch = async (params: { auth: any; endpoint: string; method: string; body: any; }) => {
    const url = "https://www.sunshinedeliver.com/api";

    const dispatch = useDispatch();


    const user = useSelector(selectUser);

 
    if (!params) return;

    let headers = undefined;

    if (params.auth) {
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
        ...(params.method == "POST" && { body: JSON.stringify(params.body) }),
        ...(params.method == "PUT" && { body: JSON.stringify(params.body) })
    })

    try {
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error)
    }
};

export default apiFetch;