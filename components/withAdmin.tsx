import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/slices/authSlice';
import { checkAdmin } from '@/services/adminService';

const withAdmin = (WrappedComponent: React.ComponentType) => {
  const WithAdmin = (props: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const user = useSelector(selectUser);

    const user_id = user?.user_id || 0;
    const token = user?.token;

    useEffect(() => {
      const verifyAdmin = async () => {
        try {
          
          if (user_id && token) {
            const adminStatus = await checkAdmin(user_id);
            setIsAdmin(adminStatus);
            setLoading(false);
            if (!adminStatus) {
              router.push('/');
            }
          } else {
            router.push('/login');
          }
        } catch (error) {
          router.push('/login');
        }
      };
      verifyAdmin();
    }, [router, user]);

    if (loading) {
      return <p>Loading...</p>;
    }

    return isAdmin ? <WrappedComponent {...props} /> : null;
  };

  WithAdmin.displayName = `WithAdmin(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAdmin;
};

export default withAdmin;
