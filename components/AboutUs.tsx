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
    console.log("data about",data)
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
      <div className="w-full 2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
    <div
          className="absolute top-0
          left-0
          w-full
          h-96
          bg-gradient-to-br
          from-[#FCB61A]
          to-[#0171CE]
          rounded-md
          filter
          blur-3xl
          opacity-50
          -z-20"
        />
       
          <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">Sobre nós</h1>
          <p className="font-normal text-base leading-6 text-gray-600 w-full lg:max-w-[5/12]" dangerouslySetInnerHTML={{ __html: data.about }} />
        </div>

    
    );
};

export default AboutUs;

