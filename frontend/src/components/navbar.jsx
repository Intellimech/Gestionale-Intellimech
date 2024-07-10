import React, { Fragment, useState, useEffect } from 'react'
import { Dialog, Menu, Transition, Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Cog6ToothIcon, HomeIcon, ClipboardIcon, ShoppingBagIcon, CalendarIcon, ArchiveBoxIcon, FolderIcon, DocumentDuplicateIcon, ChartPieIcon, UsersIcon, TagIcon, CheckBadgeIcon, ClockIcon, CalendarDaysIcon, DocumentTextIcon, Squares2X2Icon, BanknotesIcon, DocumentPlusIcon, DocumentMinusIcon } from '@heroicons/react/24/outline';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const [logo, setLogo] = useState()
  const [color, setColor] = useState()
  const [fullNavigation, setFullNavigation] = useState([])

  useEffect(() => {
    // check if the configuration is present in the local storage
      axios.get(`${process.env.REACT_APP_API_URL}/user/config`, { headers: { authorization: `Bearer ${Cookies.get('token')}` } })
        .then((response) => {
          console.log('response', response);
          // Fix the fullnavigation icons with the correct icon
          const navigationData = response.data.userNavigation;
          const iconComponents = {
            Cog6ToothIcon,
            HomeIcon, 
            CalendarIcon, 
            ArchiveBoxIcon, 
            FolderIcon, 
            DocumentDuplicateIcon, 
            ChartPieIcon, 
            UsersIcon, 
            TagIcon, 
            CheckBadgeIcon, 
            ClockIcon, 
            CalendarDaysIcon, 
            DocumentTextIcon, 
            Squares2X2Icon, 
            BanknotesIcon,
            DocumentPlusIcon,
            DocumentMinusIcon,
            ShoppingBagIcon,
            ClipboardIcon
          };
          
          const updatedNavigationData = navigationData.map(item => ({
            ...item,
            options: item.options.map(option => ({
              ...option,
              icon: iconComponents[option.icon] || HomeIcon, // Default to HomeIcon if no matching icon found
            })),
          }));
          setFullNavigation(updatedNavigationData);
          setLogo("/assets/" + response.data.logo);
          setColor(response.data.color);
        })
        .catch((error) => {
          console.error('Error:', error);
        })
  }, []);



  
  return (
    <>
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto"
          src={logo}
          alt="Consorzio Intellimech"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {fullNavigation.map((item, index) => (
            <li key={index}>
              <div className="text-xs font-semibold leading-6 text-gray-400">{item.showedname}</div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {item.options.map((subItem, subIndex) => (
                  <li key={subIndex}>
                    <a
                      href={subItem.href}
                      className={classNames(
                        subItem.current
                          ? `bg-gray-50 text-red-300`  // For background color and text color when current
                          : `text-gray-700 hover:text-red-500 hover:bg-gray-50`, // For text color on hover and background color
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}                      
                    >
                      {subItem.icon && <subItem.icon
                        className={classNames(
                          subItem.current ? `text-red-600` : `text-gray-400 group-hover:text-red-300`,
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />}
                      {subItem.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}