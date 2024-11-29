import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Make sure to import the close icon
import PermissionsRole from '../registry/permissionsrole.jsx'
import UsersRole from '../registry/usersrole.jsx'
import RoleCreate from './rolecreate.jsx';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function RolePage() {
  const [roles, setRoles] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    id_role: '',
    name: '',
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const [open, setOpen] = useState(false);
  const [showUsersPanel, setShowUsersPanel] = useState(false);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [selectedRole, setSelectedRole] = useState({});

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/role/read`, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => setRoles(response.data.roles))
      .catch(console.error);
  }, []);

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries((prevQueries) => ({
      ...prevQueries,
      [column]: event.target.value,
    }));
  };

  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sortedRoles = [...roles].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setRoles(sortedRoles);
  };

  // Filtro dei ruoli in base alle query di ricerca per ogni colonna
  const filteredRoles = roles.filter((role) => {
    return (
      role.id_role?.toString().includes(searchQueries.id_role.toString()) &&
      role.name?.toLowerCase().includes(searchQueries.name.toLowerCase())
    );
  });

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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<RoleCreate />}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Gestione Ruoli</h1>
            <p className="mt-2 text-sm text-gray-700">Gestisci i ruoli, gli utenti e i permessi associati ai ruoli.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button 
            onClick={() => setOpen(true)}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Crea
            </button>
          </div>
        </div>
      


      <div className="mt-4">
        <table className="min-w-full table-fixed divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('id_role')}
              >
                ID Ruolo  
                <br />
                <input
                  value={searchQueries.id_role}
                  onChange={handleSearchInputChange('id_role')}
                  className="mt-1 px- py-1 w-30 border border-gray-300 rounded-md shadow-sm sm:text-xs"
                />
              </th>
              <th
                scope="col"
                className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Nome
                <br />
                <input
                  value={searchQueries.name}
                  onChange={handleSearchInputChange('name')}
                  className="mt-1 py-1 w-30 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4] shadow-sm sm:text-xs"
                />
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                <br />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRoles.map((role) => (
              <tr key={role.id_role}>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">{role.id_role}</td>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">{role.name}</td>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowUsersPanel(true);
                    }}
                    className="text-black hover:text-gray-700"
                  >
                    Visualizza Utenti
                  </button>
                  </td>
                  <td className="whitespace-nowrap py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowPermissionsPanel(true);
                    }}
                    className="text-black hover:text-gray-700"
                  >
                    Visualizza Permessi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog per gli utenti */}
      <Transition.Root show={showUsersPanel} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowUsersPanel}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Utenti Associati al Ruolo {selectedRole.id_role}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowUsersPanel(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                         <UsersRole roleId={selectedRole.id_role} />
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Dialog per i permessi */}
      <Transition.Root show={showPermissionsPanel} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setShowPermissionsPanel}>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Permessi Associati al Ruolo {selectedRole.id_role}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowPermissionsPanel(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                       
                      <PermissionsRole roleId={selectedRole.id_role} />
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
