import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import axios from 'axios';
import Cookies from 'js-cookie';

import UserCreateForm from './userscreate';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [people, setPeople] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

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

  const ForceLogout = (user) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/user/force/logout/${user}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.offer);
      axios
      .get(`${process.env.REACT_APP_API_URL}/user/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setOffer(response.data.offer);
      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
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



  function handleSearchInputChange(event) {
    setSearchQuery(event.target.value);
  }

  function handleStatusSelectChange(event) {
    setSelectedYear(event.target.value);
  }

  function exportUsers() {
    //export user in the csv file
    const csvContent =
    'data:text/csv;charset=utf-8,' +
    people.map((user) => Object.values(user).join(',')).join('\n');
    // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users.csv');
    document.body.appendChild(link);
    link.click();
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Transition.Root show={open} as={Fragment}>
       <Dialog as="div" className="relative z-20" onClose={setOpen}>
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
                            Crea un nuovo utente
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => setOpen(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<UserCreateForm />}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Utenti</h1>
          <p className="mt-2 text-sm text-gray-700">Lista utenti presenti nel sistema</p>
        </div>
        {/* Search box and Year filter */}
        <Notify showPopup={showPopup} />
        <div className="flex flex-wrap justify-between mt-4 mb-4">
          <div className="flex-grow w-full max-w-xs mr-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search by invoice ID or company name"
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div className="flex-grow w-full max-w-xs flex items-end mb-4">
            <select
              value={selectedStatus}
              onChange={handleStatusSelectChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {/* get the status from user */}
              {people.map((person) => (
                <option key={person.id_user} value={person.id_user}>
                  {person.name}
                </option>
              ))}
            </select>
            <div className="px-4">
              <button
                onClick={exportUsers}
                className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                Export
              </button>
            </div>
            <div className="">
            {permissions && permissions.some(permission => permission.actionType === 'Create') && (
              <button
                onClick={() => setOpen(true)}
                className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Create
              </button>
            )}
            </div>
          </div>
        </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedPeople.length > 0 && (
                <>
                  <div className="absolute left-14 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                    <button
                      type="button"
                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                      onClick={deleteAll}
                    >
                      Delete all
                    </button>
                  </div>
                </>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>                    
                    <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">
                      
                    </th>
                    <th scope="col" className="py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Surname
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Username
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Updated at
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created at
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Login
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Login IP
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {people.map((person) => (
                    <tr key={person.id_user} className={selectedPeople.includes(person) ? 'bg-gray-50' : undefined}>
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedPeople.includes(person) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-red-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600"
                          value={person.email}
                          checked={selectedPeople.includes(person)}
                          onChange={(e) =>
                            setSelectedPeople(
                              e.target.checked
                                ? [...selectedPeople, person]
                                : selectedPeople.filter((p) => p !== person)
                            )
                          }
                        />
                      </td>
                      <td
                        className={classNames(
                          'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                          selectedPeople.includes(person) ? 'text-red-600' : 'text-gray-900'
                        )}
                      >
                        <img src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + person.id_user + '&background=%23fff&radius=50'} className="h-8 w-8 rounded-full" alt="" />
                      </td>
                      <td className="whitespace-nowrap py-4 text-sm text-gray-500">{person.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.surname}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.updatedAt ? new Date(person.updatedAt).toLocaleString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.createdAt ? new Date(person.createdAt).toLocaleString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.lastLoginAt ? new Date(person.lastLoginAt).toLocaleString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.lastLoginIp}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Role.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.isActive ? (
                          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                            <svg className="h-1.5 w-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Online
                          </span>
                        ) : (
                        <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                          <svg className="h-1.5 w-1.5 fill-red-500" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx={3} cy={3} r={3} />
                          </svg>
                          Offline
                        </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          {permissions && permissions.some(permission => permission.actionType === 'Update') && (
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => console.log(person)}>
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                          )}
                          <button type="button" 
                                  className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                  onClick={() => ForceLogout(person.id_user)}>
                            <ArrowRightStartOnRectangleIcon className="h-5 w-4 text-gray-500" />
                          </button>
                        </div>
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
