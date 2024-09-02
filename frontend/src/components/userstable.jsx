import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import axios from 'axios';

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
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
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

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

  

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };
  

  
  
  const [searchQueries, setSearchQueries] = useState({
    name: '',
    email: '',
    surname:'',
    username: '',
    updatedAt: '',
    createdAt: '',
    lastLoginIp: '',
    lastLoginAt: '',
    role: '',
  });

const filteredUsers = people.filter((item) => {
    return (
    
    (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
    (searchQueries.email === '' || item.email.toLowerCase().includes(searchQueries.email.toLowerCase())) &&
    
    (searchQueries.surname === '' || item.surname.toLowerCase().includes(searchQueries.surname.toLowerCase())) &&
    
    (searchQueries.username === '' || item.username.toLowerCase().includes(searchQueries.username.toLowerCase())) &&
    
    (searchQueries.updatedAt === '' || item.updatedAt.toLowerCase().includes(searchQueries.updatedAt.toLowerCase())) &&
    
    (searchQueries.createdAt === '' || item.createdAt.toLowerCase().includes(searchQueries.createdAt.toLowerCase())) &&
    
    (searchQueries.lastLoginAt === '' || item.lastLoginAt.toLowerCase().includes(searchQueries.lastLoginAt.toLowerCase())) &&
    
    (searchQueries.lastLoginIp === '' || item.lastLoginIp.toLowerCase().includes(searchQueries.lastLoginIp.toLowerCase())) &&
    
    (searchQueries.role === '' || item.Role.name.toLowerCase().includes(searchQueries.role.toLowerCase())) 

  );
});


const sortedUsers = filteredUsers.sort((a, b) => {
  if (sortDirection === 'asc') {
    return compareValues(a[sortColumn], b[sortColumn]);
  } else {
    return compareValues(b[sortColumn], a[sortColumn]);
  }
});

const handleSearchInputChange = (column) => (event) => {
  setSearchQueries({ ...searchQueries, [column]: event.target.value });
};

  

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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<UserCreateForm />}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>



      <div className="flex items-center justify-between mt-4 mb-4">
        {/* Titolo e descrizione */}
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Utenti</h1>
          <p className="mt-2 text-sm text-gray-700">Lista utenti presenti nel sistema</p>
        </div>
        
        {/* Bottoni Export e Create */}
        <div className="flex items-center space-x-4 ml-auto">
          <button
            onClick={exportUsers}
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"          >
            Esporta
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"          >
            Crea
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              {selectedPeople.length > 0 && (
                <>
                  <div className="absolute left-0 top-0 flex h-12 items-center space-x-3 bg-white sm:left-12">
                    <button
                      type="button"
                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                      onClick={deleteAll}
                    >
                      Elimina tutto
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
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-[#7fb7d4] focus:ring-[#7fb7d4]"
                      ref={checkbox}
                      checked={checked}
                      onChange={toggleAll}
                    />
                  </th>                    
                  
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('email')}>
                    Email
                    {sortColumn === 'email' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.email}
                      onChange={handleSearchInputChange('email')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Name
                    {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.name}
                      onChange={handleSearchInputChange('name')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('surname')}>
                    Surname
                    {sortColumn === 'surname' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.surname}
                      onChange={handleSearchInputChange('surname')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('username')}>
                    Username
                    {sortColumn === 'username' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.username}
                      onChange={handleSearchInputChange('username')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('updatedAt')}>
                    Updated At
                    {sortColumn === 'updatedAt' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.updatedAt}
                      onChange={handleSearchInputChange('updatedAt')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdAt')}>
                    Created At
                    {sortColumn === 'createdAt' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.createdAt}
                      onChange={handleSearchInputChange('createdAt')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('lastLoginAt')}>
                    Last Login
                    {sortColumn === 'lastLoginAt' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.lastLoginAt}
                      onChange={handleSearchInputChange('lastLoginAt')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('role')}>
                    Role
                    {sortColumn === 'role' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.role}
                      onChange={handleSearchInputChange('role')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                    Stato
                    {sortColumn === 'status' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.status}
                      onChange={handleSearchInputChange('status')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                    {/* No search input for this column */}
                  </th>
                </tr>
              </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(sortedUsers) && sortedUsers.length > 0  ? (
                    sortedUsers.map((person) => (
                    <tr key={person.id_user} className={selectedPeople.includes(person) ? 'bg-gray-50' : undefined}>
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedPeople.includes(person) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-[#7fb7d4]" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-[#7fb7d4] focus:ring-[#7fb7d4]"
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
                      {/* <td
                        className={classNames(
                          'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                          selectedPeople.includes(person) ? 'text-[#A7D0EB]' : 'text-gray-900'
                        )}
                      >
                        <img src={'https://api.dicebear.com/7.x/notionists/svg?seed=' + person.id_user + '&background=%23fff&radius=50'} className="h-8 w-8 rounded-full" alt="" />
                      </td> */}
                      <td className="whitespace-nowrap py-4 text-sm text-gray-500">{person.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.surname}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.username}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.updatedAt ? new Date(person.updatedAt).toLocaleString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.createdAt ? new Date(person.createdAt).toLocaleString() : ''}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.lastLoginAt ? new Date(person.lastLoginAt).toLocaleString() : ''}</td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.Role.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {person.isActive ? (
                          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-300 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                            <svg className="h-1.5 w-1.5 fill-green-600" viewBox="0 0 6 6" aria-hidden="true">
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                            Online
                          </span>
                        ) : (
                        <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-300 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                          <svg className="h-1.5 w-1.5 fill-red-700" viewBox="0 0 6 6" aria-hidden="true">
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
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            >
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                          
                         
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                           >
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                          
                          
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                         
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            >
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                          
                          
                        </div>
                      </td>
                    </tr>
                   ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Non ci sono commesse
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
