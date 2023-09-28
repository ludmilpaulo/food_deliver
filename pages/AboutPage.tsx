// pages/about.tsx
import React, { useEffect, useState } from 'react';
import AboutUs from '../components/AboutUs';
import Footer from '@/components/Footer';
import Nav from '@/components/Nav';



const AboutPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('https://www.sunshinedeliver.com/api/information/');
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
  
          const result = await response.json();
          setData(result);
          setLoading(false);
        } catch (error) {
          setError('An error occurred while fetching data.');
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (error) {
      return <div>Error: {error}</div>;
    }
  
    if (!data) {
      return <div>No data available</div>;
    }
  return (   <><Nav /><div className="flex justify-center items-center h-screen">

      <AboutUs />

  </div><Footer /></>
  );
};

export default AboutPage;
