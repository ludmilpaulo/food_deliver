"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { SocialIcon } from "react-social-icons";
import { motion, useAnimation } from 'framer-motion';


import { FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { fetchAboutUsData } from "@/services/information";
import { AboutUsData } from "@/services/types";


const AboutUs = () => {
    const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
   
    const [isHovered, setIsHovered] = useState(false);

  const controls = useAnimation();

  
  
  
  
    useEffect(() => {
      const fetchData = async () => {
        const data = await fetchAboutUsData();
        
        setAboutUsData(data);
      };
      fetchData();
    }, []);
  
    return (
        <>
        <div className="mx-auto p-4 pt-6 md:p-6 lg:p-12"
         style={{
            backgroundImage: `url(${aboutUsData?.backgroundApp})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1 className="text-3xl font-bold mb-4 text-center">About Us</h1>
          {aboutUsData && (
            <div className="prose lg:prose-xl bg-white">
                <strong>{aboutUsData.title}</strong>
             <div dangerouslySetInnerHTML={{ __html: aboutUsData.about }} />
              
              <address>
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
  <>
    {aboutUsData?.facebook && <SocialIcon url={aboutUsData.facebook} />}
    {aboutUsData?.linkedin && <SocialIcon url={aboutUsData.linkedin} />}
    {aboutUsData?.twitter && <SocialIcon url={aboutUsData.twitter} />}
   
    {aboutUsData?.instagram && <SocialIcon url={aboutUsData.instagram} />}
  </>
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
        {aboutUsData.email && (
                    <Link href={`mailto:${aboutUsData.email}`}>
        <SocialIcon
          className="cursor-pointer"
          network="email"
          fgColor="gray"
          bgColor="transparent"
        />
        <p className="uppercase md:inline-flex text-sm text-gray-400">
          {" "}
          {aboutUsData.email}
        </p>
        </Link>
    )}
      </motion.div>
                <p>
                  
                  <br />
                  {aboutUsData.address}
                  <br />
                  
                      <span className="text-blue-600 hover:text-blue-800">
                       
                      </span>
                    
                  <br />
                  {aboutUsData.phone && (
                    <Link href={`tel:${aboutUsData.phone}`}>
                      <span className="text-blue-600 hover:text-blue-800">
                        {aboutUsData.phone}
                      </span>
                    </Link>
                  )}
                </p>
                
              </address>
            </div>
          )}
        </div>
      
        
      </>
      
      
    );
};

export default AboutUs;