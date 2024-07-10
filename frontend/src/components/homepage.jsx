import React, { useState, useContext } from 'react';
import { UserContext } from '../module/userContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";

const initialStats = [
  { label: 'Commesse di cui fai parte', value: 12, link: '/app/job/' },
  { label: 'Commesse di cui sei project manager', value: 4, link: '/app/job/' },
  { label: 'Offerte da accettare/rifiutare', value: 4, link: '/app/offer/' },
  { label: 'Giorni da rendicontare', value: 4, link: '/app/reporting/' },
];

export default function Homepage() {
  const [stats, setStats] = useState(initialStats);
  const { user } = useContext(UserContext);

  return (
    <div className="flex justify-center w-full">
      {/* Combined Welcome and Work Location Panel */}
      <section aria-labelledby="profile-overview-title" className="w-full">
        <div className="overflow-hidden rounded-lg bg-white shadow p-6 w-full">
          <h2 className="sr-only" id="profile-overview-title">Profile Overview</h2>
          <div className="flex justify-between">
            {/* Welcome Section */}
            <div className="flex md:space-x-5">
              <div className="hidden md:block flex-shrink-0">
                <img className="mx-auto h-20 w-20 rounded-full" src={user?.propic} alt="" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-600">
                  {
                    new Date().getHours() < 12 ? 'Buongiorno,' :
                    new Date().getHours() < 18 ? 'Buon pomeriggio,' :
                    'Buona sera,'
                  }
                </p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {user?.name + ' ' + user?.surname}
                </p>
                <p className="text-sm font-medium text-gray-600">{user?.role}</p>
              </div>
            </div>
            {/* Work Location Section */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">
                Adesso sei in:
              </p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {
                  new Date().getHours() < 12 ? 'Smartworking' :
                  new Date().getHours() < 19 ? 'Presenza' :
                  'Fuori sede'
                }
              </p>
              <p className="text-sm font-medium text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <a href={stat.link} className="text-gray-600 hover:text-gray-800">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
