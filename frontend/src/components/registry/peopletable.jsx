import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Menu, Transition, Disclosure } from '@headlessui/react'
import { ChevronRightIcon, XMarkIcon, CheckBadgeIcon  } from '@heroicons/react/20/solid'
import axios from 'axios';
import Cookies from 'js-cookie';

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
    // Make a copy of selectedPeople before modifying it
    const selectedPeopleCopy = [...selectedPeople];
    // Make a request for each selected user
    selectedPeopleCopy.forEach((person) => {
      axios
        .delete(`${process.env.REACT_APP_API_URL}/user/delete`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Cookies.get('token'),
          },
          data: {
            user_id: person.id_user,
          },
        })
        .then((response) => {
          console.log(response);
          // After deletion, refresh the list of users
          axios
            .get(`${process.env.REACT_APP_API_URL}/user/read`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + Cookies.get('token'),
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
    // Clear the selectedPeople state after deletion
    setSelectedPeople([]);
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setPeople(response.data.users);
        console.log(response.data.users);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []); // Empty dependency array
  

  return (
    
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the users in the system and their details.</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {people.map((person) => (
                    <tr key={person.id_user} className={selectedPeople.includes(person) ? 'bg-gray-50' : undefined}>
                      <td className="whitespace-nowrap py-4 text-sm text-gray-500">{person.name.slice(0, 2).toUpperCase() + person.surname.slice(0, 2).toUpperCase()}</td>                      
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.surname}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                                                        {person && person.birthdate && (
                                                                                          <>
                                                                                            {new Date(person.birthdate).toLocaleDateString()}{' '}
                                                                                            {isToday(person.birthdate) && <span>🎂</span>}
                                                                                          </>
                                                                                        )}
                                                                                        </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Group.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Subgroup.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.ContractType.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.taxidcode}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.WorkingSite.SiteCode /*+ " - " + person.WorkingSite.GeneralName */}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.country}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.province}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.city}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.streetaddress}</td>                     
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.zip}</td>                     
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
