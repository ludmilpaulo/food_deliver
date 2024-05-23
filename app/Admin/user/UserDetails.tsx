'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, updateUser } from '@/services/adminService';
import { User } from '@/services/adminTypes';

import UserForm from './UserForm';



const UserDetails = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser(Number(id))
      .then(setUser)
      .catch(console.error);
  }, [id]);

  const handleUpdate = async (updatedUser: User) => {
    try {
      await updateUser(Number(id), updatedUser);
      router.push('/admin/users');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      {user && <UserForm user={user} onSubmit={handleUpdate} />}
    </div>
  );
};

export default UserDetails;
