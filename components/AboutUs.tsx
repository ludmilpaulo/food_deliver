// components/AboutUs.tsx
import React, { useState, useEffect } from 'react';
import { SocialIcon } from 'react-social-icons';
import Image from "next/image";


type Props = {};

const AboutUs: React.FC<Props> = () => {
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
        setData(result[0]); // Assuming the API response is an array with a single object
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

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex relative">
    {/* Image Div */}
    <div className="w-full h-screen">
    <Image
          className="w-full h-full object-cover"
          src={data.avatar}
          alt={data.name_complete}
          width={0}
          height={0}
        />
    </div>
  
    {/* Text Div */}
    <div className="w-1/2 pr-4 absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-white text-center">
        <h2 className="text-2xl font-semibold mb-4">{data.name_complete}</h2>
        <p className="text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: data.about }} />
      </div>
    </div>
  </div>
  


  );
};

export default AboutUs;
