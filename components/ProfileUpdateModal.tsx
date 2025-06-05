"use client";
import React, { useEffect, useState } from "react";

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  first_name: string;
  last_name: string;
  initialPhone?: string;
  initialAddress?: string;
  initialLocation?: string;
  initialAvatar?: string;
  updateUserDetails: (token: string, data: FormData) => Promise<Response>;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  first_name,
  last_name,
  initialPhone = "",
  initialAddress = "",
  initialLocation = "",
  initialAvatar = "",
  updateUserDetails,
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [firstName, setFirstName] = useState(first_name);
  const [lastName, setLastName] = useState(last_name);
  const [address, setAddress] = useState(initialAddress);
  const [location, setLocation] = useState(initialLocation);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Detect location on open
  useEffect(() => {
    if (!isOpen) return;
    if (location) return; // Don't overwrite if already set

    setGeoLoading(true);
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data.display_name) {
            setLocation(data.display_name);
          } else {
            setGeoError("Unable to detect address from location.");
          }
        } catch {
          setGeoError("Could not fetch location address.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoError("Could not detect your location. Please enter it manually.");
        setGeoLoading(false);
      }
    );
    // eslint-disable-next-line
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("access_token", token);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("location", location);
      if (avatar) formData.append("avatar", avatar);

      const response = await updateUserDetails(token, formData);
      if (!response.ok) {
        setError("Update failed. Please try again.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 relative shadow-lg min-w-[320px] w-full max-w-md">
        <button className="absolute right-4 top-2 text-2xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="font-bold text-lg mb-4">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
            className="border rounded p-2"
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              className="border rounded p-2 pr-12"
            />
            {geoLoading && (
              <span className="absolute right-3 top-2 text-xs text-gray-500">
                Detecting...
              </span>
            )}
          </div>
          {geoError && (
            <span className="text-yellow-700 text-xs">{geoError}</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => setAvatar(e.target.files?.[0] || null)}
            className="border rounded p-2"
          />
          {error && <span className="text-red-600">{error}</span>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;
