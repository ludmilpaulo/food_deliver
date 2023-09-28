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
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{data.name_complete}</h2>
      <p className="text-gray-700 mb-4"><div dangerouslySetInnerHTML={{ __html: data.about }} /></p>
      <p className="text-gray-700 mb-4">{data.address}</p>
      <p className="text-gray-700 mb-4">{data.phone}</p>
      <p className="text-gray-700 mb-4">{data.email}</p>

     
      <div>
                <Image
                  className="w-64 h-64 mb-4 sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-64 lg:h-32 xl:w-32 xl:h-32"
                  width={300}
                  height={300}
                  src={data.avatar}
                  alt={data.name_complete}
                />
      </div>

      {/* Social Icons */}
      <div className="flex space-x-4">
        {data.linkedin && <SocialIcon url={data.linkedin} bgColor="#fff" fgColor="#000" style={{ height: 30, width: 30 }} />}
        {data.facebook && <SocialIcon url={data.facebook} bgColor="#fff" fgColor="#000" style={{ height: 30, width: 30 }} />}
        {data.twitter && <SocialIcon url={data.twitter} bgColor="#fff" fgColor="#000" style={{ height: 30, width: 30 }} />}
        {data.instagram && <SocialIcon url={data.instagram} bgColor="#fff" fgColor="#000" style={{ height: 30, width: 30 }} />}
      </div>
    </div>
  );
};

export default AboutUs;
