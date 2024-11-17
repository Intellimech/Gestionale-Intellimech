import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Menu, Transition, Disclosure } from '@headlessui/react';
import { ChevronRightIcon, XMarkIcon, CheckBadgeIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import Cookies from 'js-cookie';
import UpdateForm from './peopleupdate';

import {  PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'

import UserCreateForm from './userscreate';
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function isToday(date) {
  const today = new Date();
  const daten = new Date(date);
  console.log(daten.getDate() === today.getDate() &&
  daten.getMonth() === today.getMonth())
  return daten.getDate() === today.getDate() &&
    daten.getMonth() === today.getMonth();
}

export default function Example() {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null); // Stato per la persona selezionata

  useEffect(() => {
    const isIndeterminate = selectedPeople.length > 0 && selectedPeople.length < people.length;
    setChecked(selectedPeople.length === people.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedPeople, people]);

  function toggleAll() {
    setSelectedPeople(checked || indeterminate ? [] : people);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function deleteAll() {
    const selectedPeopleCopy = [...selectedPeople];
    selectedPeopleCopy.forEach((person) => {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/user/delete`, {
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            user_id: person.id_user,
          },
        })
        .then((response) => {
          console.log(response);
          axios
            .get(`${process.env.REACT_APP_API_URL}/user/read`, {
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then((response) => {
              setPeople(response.data.users);
              console.log(response.data.users);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    });
    setSelectedPeople([]);
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/read`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        setPeople(response.data.users);
        console.log(response.data.users);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  function exportData() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      people.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const download = 'data.csv'
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
  }



  return (
    <div className="px-4 sm:px-6 lg:px-8">
     <Transition.Root show={open} as={Fragment}>
       <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <div className="fixed inset-0" />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Modifica utente
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<UpdateForm person={selectedPerson}/>}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

<div className="py-4">
        
      </div>

      <div className="flex items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Utenti</h1>
          <p className="mt-2 text-sm text-gray-700">Lista di tutti gli utenti nel sistema e anagrafiche.</p>
        </div>
        <div className="flex items-center mt-5 space-x-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"            >
              Esporta
            </button>
            
          </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedPeople.length > 0 && (
                <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                  <button
                    type="button"
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                    onClick={deleteAll}
                  >
                    Delete all
                  </button>
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
    
                    <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Codice
                    
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Cognome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data di Nascita
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Divisione
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Reparto
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Rapporto di Lavoro
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Giorni Lavorativi
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                     Ore Lavorative
                    </th>
          
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Codice Fiscale
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sede
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Provincia
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Città
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Indirizzo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Cap
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Telefono
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Telefono aziendale
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data di assunzione
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                     Scadenza della patente
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                     Provincia di Nascita
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                     Qualifica
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                     Istituto 
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {people.map((person) => (
                    <tr key={person.id_user} className={selectedPeople.includes(person) ? 'bg-gray-50' : undefined}>
                      <td className="whitespace-nowrap py-4 text-sm text-gray-500">{person?.name.slice(0, 2).toUpperCase() + person.surname.slice(0, 2).toUpperCase()}</td>                      
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person?.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.surname}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person && person.birthdate && (
                          <>
                            {new Date(person.birthdate).toLocaleDateString()}{' '}
                            {isToday(person.birthdate) && <span>🎂</span>}
                          </>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Group?.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Subgroup?.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.ContractType?.name}</td>     
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.workingdays}</td>        
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.hWeek}</td> 
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person?.taxidcode}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person?.WorkingSite?.SiteCode}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.country}</td>        
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.province}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.city}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.streetaddress}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.zip}</td>            
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Phone}</td>   
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.businessphone}</td>   
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.hiringdate}</td>    
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.drivingLicenseExp}</td>           
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.birthprovince}</td>          
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.qualification}</td>        
                       <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.institute}</td>  
                       <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                      
                         
                        <button 
                            type="button" 
                            onClick={() => {
                              setSelectedPerson(person);
                              setOpen(true);
                            }}
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            >
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                      </td> 
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
