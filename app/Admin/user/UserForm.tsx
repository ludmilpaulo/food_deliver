import { useForm } from 'react-hook-form';
import { User } from '@/services/adminTypes';

interface UserFormProps {
  user: User;
  onSubmit: (data: User) => void;
}

const UserForm = ({ user, onSubmit }: UserFormProps) => {
  const { register, handleSubmit, setValue } = useForm<User>({
    defaultValues: user,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="block text-gray-700">Username</label>
        <input
          type="text"
          className="w-full px-4 py-2 border"
          {...register('username')}
          disabled
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Email</label>
        <input
          type="email"
          className="w-full px-4 py-2 border"
          {...register('email')}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">First Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border"
          {...register('first_name')}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Last Name</label>
        <input
          type="text"
          className="w-full px-4 py-2 border"
          {...register('last_name')}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Is Customer</label>
        <input type="checkbox" {...register('is_customer')} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Is Driver</label>
        <input type="checkbox" {...register('is_driver')} />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
        Save
      </button>
    </form>
  );
};

export default UserForm;
