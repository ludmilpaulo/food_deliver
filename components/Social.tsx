import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { SocialIcon } from "react-social-icons";

type Props = {
  id: 1;
  name_complete: string;
  avatar: string;
  mini_about: string;
  born_date: string;
  address: string;
  phone: string;
  email: string;
  cv: string;
  github: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

const Social = () => {
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
  return (
    <header className="sticky top-0 p-5 flex items-start justify-between max-w-7xl mx-auto z-20 xl:items-center">
      <motion.div
        initial={{
          x: -500,
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          x: 0,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 2,
        }}
        className="flex flex-row items-center"
      >
       
       <div className="flex space-x-4">
    {data?.linkedin && <SocialIcon url={data.linkedin} bgColor="#fcb61a" fgColor="#0171ce" style={{ height: 90, width: 90 }} />}
    {data?.facebook && <SocialIcon url={data.facebook} bgColor="#fcb61a" fgColor="#0171ce" style={{ height: 90, width: 90 }} />}
    {data?.twitter && <SocialIcon url={data.twitter} bgColor="#fcb61a" fgColor="#0171ce" style={{ height: 90, width: 90 }} />}
    {data?.instagram && <SocialIcon url={data.instagram} bgColor="#fcb61a" fgColor="#0171ce" style={{ height: 90, width: 90 }} />}
    </div>

    
      </motion.div>

      <motion.div
        initial={{
          x: 500,
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          x: 0,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 2,
        }}
        className="flex flex-row items-center text-gray-300 cursor-pointer"
      >

      </motion.div>
    </header>
  );
};

export default Social;