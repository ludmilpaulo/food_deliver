"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { selectUser, selectAuthHydrated } from "@/redux/slices/authSlice";
import ProfileUpdateModal from "@/components/ProfileUpdateModal";
import { getCurrentUser, updateUserDetails } from "@/services/authService";
import { isDevLoginEnabled, isSeedTestUsername } from "@/configs/devTestLogin";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const Wrapper: React.FC<any> = (props) => {
    const router = useRouter();
    const user = useAppSelector(selectUser);
    const authHydrated = useAppSelector(selectAuthHydrated);
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
      if (!authHydrated) return;

      if (!user || !user.user_id || !user.token) {
        router.replace("/LoginScreenUser");
        return;
      }

      const fetchProfile = async () => {
        setLoading(true);
        const skipProfileModal =
          isDevLoginEnabled() && isSeedTestUsername(user.username);

        try {
          const profileRes = await getCurrentUser(user.user_id);
          const profile = profileRes.customer_details || profileRes;

          if (!skipProfileModal && (!profile || !profile.phone || !profile.address)) {
            setShowModal(true);
            setProfileData({
              phone: profile?.phone || "",
              address: profile?.address || "",
              location: profile?.location || "",
              avatar: profile?.avatar || "",
            });
          } else {
            setShowModal(false);
          }
        } catch {
          if (!skipProfileModal) {
            setShowModal(true);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [authHydrated, user, router]);

    if (!authHydrated || !user || loading) return null;

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
