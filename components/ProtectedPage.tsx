"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { selectUser } from "@/redux/slices/authSlice";
import ProfileUpdateModal from "@/components/ProfileUpdateModal";
import { getCurrentUser, updateUserDetails } from "@/services/authService";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const Wrapper: React.FC<any> = (props) => {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState<{
        access_token?: string;
        phone?: string;
        address?: string;
        location?: string;
        avatar?: string;
        first_name?: string;
        last_name?: string;
      }>({});

    useEffect(() => {
      if (!user || !user.user_id || !user.token) {
        router.replace("/LoginScreenUser");
        return;
      }

      const fetchProfile = async () => {
        setLoading(true);
        try {
          // Use token for authentication
          const profileRes = await getCurrentUser(user.user_id); // ✅ THIS IS CORRECT, user_id is a number!


          // Use correct path for data if needed (depends on backend response structure)
          const profile = profileRes.customer_details || profileRes;
          
          // Check if profile is incomplete
          if (!profile || !profile.phone || !profile.address) {
            setShowModal(true);
            setProfileData({
              phone: profile?.phone || "",
              address: profile?.address || "",
              location: profile?.location || "",
              avatar: profile?.avatar || "",
            });
          }
        } catch (e) {
          // If fetch fails (e.g., not found), show modal for first-time profile
          setShowModal(true);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [user, router]);

    if (!user || loading) return null;

    return (
      <>
        <WrappedComponent {...props} />
        <ProfileUpdateModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => setShowModal(false)}
            token={user.token}
            first_name={profileData.first_name || ""}
            last_name={profileData.last_name  || ""}
            initialPhone={profileData.phone}
            initialAddress={profileData.address}
            initialLocation={profileData.location}
            initialAvatar={profileData.avatar}
            updateUserDetails={updateUserDetails}
          />

      </>
    );
  };

  return Wrapper;
};

export default withAuth;
