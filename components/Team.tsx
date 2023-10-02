// components/Team.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SocialIcon } from 'react-social-icons';

// Define a type for the team member
type TeamMember = {
  id: number;
  name_complete: string;
  avatar: string;
  about: string;
  position: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
};

type TeamProps = {
  teamData: TeamMember[];
};

const Team: React.FC = () => {
  const [data, setData] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Fetch data from the API endpoint
    const fetchData = async () => {
      try {
        const response = await fetch('https://www.sunshinedeliver.com/api/team/');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };

    // Call the fetch function
    fetchData();
  }, []); // Empty dependency array ensures the effect runs once after the initial render

  return (
  
        <div>
          <div className="container flex justify-center mx-auto pt-16">
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
            <div>
              <p className="text-gray-500 text-lg text-center font-normal pb-3">Esquadrão da plataforma</p>
              <h1 className="xl:text-4xl text-3xl text-center text-gray-800 font-extrabold pb-6 sm:w-4/6 w-5/6 mx-auto">
                As pessoas talentosas nos bastidores da organização
              </h1>
            </div>
          </div>
          <div className="w-full bg-gray-100 px-10 pt-10">
            <div className="container mx-auto">
              <div className="lg:flex md:flex sm:flex items-center xl:justify-between flex-wrap md:justify-around sm:justify-around lg:justify-around">
                {data.map((member) => (
                  <div
                    key={member.id}
                    className="xl:w-1/3 sm:w-3/4 md:w-2/5 relative mt-16 mb-32 sm:mb-24 xl:max-w-sm lg:w-2/5"
                  >
                    <div className="rounded overflow-hidden shadow-md bg-white">
                      <div className="absolute -mt-20 w-full flex justify-center">
                        <div className="h-32 w-32">
                          <Image
                            src={member.avatar}
                            alt={`${member.name_complete}'s Profile Image`}
                            className="rounded-full object-cover h-full w-full shadow-md"
                            width={128}
                            height={128}
                          />
                        </div>
                      </div>
    
                      <div className="px-6 mt-16">
                        <div className="font-bold text-3xl text-center pb-1">{member.name_complete}</div>
                        <p className="text-gray-800 text-sm text-center">{member.position}</p>
                       
                        <p className="text-center text-gray-600 text-base pt-3 font-normal" dangerouslySetInnerHTML={{ __html: member.about }} />
                        <div className="w-full flex justify-center pt-5 pb-5">
                          <SocialIcon url={member.linkedin} className="mx-5" />
                          <SocialIcon url={member.facebook} className="mx-5" />
                          <SocialIcon url={member.twitter} className="mx-5" />
                          <SocialIcon url={member.instagram} className="mx-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
};

export default Team;
