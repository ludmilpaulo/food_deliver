import { useRouter } from "next/router";
import React, { useEffect } from "react";
//import { useAuth } from 'your-auth-library';
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "@/redux/slices/authSlice";

const withAuth = (WrappedComponent: any) => {
  const AuthComponent = (props: any) => {
    const router = useRouter();
    const user = useSelector(selectUser);

    const isAuthenticated = user; // replace this with your own auth hook

    useEffect(() => {
      if (!isAuthenticated) {
        router.push("/LoginScreenUser");
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
