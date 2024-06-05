import React, { useState, useEffect, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logoutUser } from '@/redux/slices/authSlice';
import { updateUserDetails } from '@/services/authService';
import { fetchUserDetails } from '@/services/checkoutService';


const UpdateProfile: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [userDetails, setUserDetails] = useState<any>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.token) {
      fetchUserDetails(user.user_id, user.token)
        .then((data) => {
          setUserDetails(data);
          setPhone(data.phone);
          setAddress(data.address);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
          dispatch(logoutUser());
        });
    }
  }, [user, dispatch]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('address', address);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      await updateUserDetails(user.token, formData);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Atualizar Perfil</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Avatar</label>
          <input type="file" onChange={handleAvatarChange} className="w-full p-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Telefone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Endereço</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-gradient-to-r from-yellow-400 to-blue-600 text-white font-semibold rounded"
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar Perfil'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
