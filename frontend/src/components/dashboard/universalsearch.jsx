import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogBackdrop,
} from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon, FolderIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ open, setOpen }) {
  const [rawQuery, setRawQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    // Add some dummy recent searches for demonstration
    { name: 'Recent Search 1', href: '#' },
    { name: 'Recent Search 2', href: '#' },
  ]);

  useEffect(() => {
    // Fetch users and projects
    axios.get(`${process.env.REACT_APP_API_URL}/user/read`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      const usersdata = response.data.users.map(user => ({
        id: user.id_user,
        name: user.name + ' ' + user.surname,
        url: '#',
        imageUrl: 'https://api.dicebear.com/8.x/lorelei/svg?seed=' + user.id_user,
      }));
      setUsers(usersdata);
    })
    .catch((error) => {
      console.log(error);
    });

    axios.get(`${process.env.REACT_APP_API_URL}/job/read`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      const projectsdata = response.data.jobs.map(job => ({
        id: job.id_job,
        name: job.name,
        category: 'Projects',
        url: '/app/job/',
      }));
      setProjects(projectsdata);
    })
    .catch((error) => {
      console.log(error);
    });

    // Define navigation pages
    const fullNavigation = [
      { showedname: "Dashboard", options: [
        { name: 'Dashboard', href: '/app/home' },
        { name: 'Rendicontazione', href: '/app/reporting' },
        { name: 'Calendario', href: '/app/calendar' },
      ]},
      { showedname: "Analitycs", options: [
        { name: 'Report', href: '/app/analytics' },
      ]},
      { showedname: "Project Orders", options: [
        { name: 'Richieste di Offerta', href: '/app/quotation-request' },
        { name: 'Offerte', href: '/app/offer' },
        { name: 'Commesse', href: '/app/job' },
        { name: 'Ordine di Vendita', href: '/app/sales-order' },
      ]},
      { showedname: "Costs", options: [
        { name: 'Acquisti', href: '/app/purchase' },
      ]},
      { showedname: "Invoices", options: [
        { name: 'Fatture Attive', href: '/app/invoices/active' },
        { name: 'Fatture Passive', href: '/app/invoices/passive' },
        
      ]},
      { showedname: "Registry", options: [
        { name: 'Costi', href: '/app/purchase' },
        { name: 'Fornitori', href: '/app/company/suppliers' },
        { name: 'Clienti', href: '/app/company/customers' },
        { name: 'Personale', href: '/app/employees-consultants' },
        { name: 'Categorie', href: '/app/category' },
        { name: 'Sottocategorie', href: '/app/subcategory' },
        { name: 'Aree Tecniche', href: '/app/technicalarea' },
        { name: 'Tipo Progetto', href: '/app/projecttype' },
      ]},
      { showedname: "Management", options: [
        { name: 'Users', href: '/app/users' },
        { name: 'Role', href: '7app/roles' },
        { name: 'Permissionss', href: 'app/permissions' },
        
        { name: 'Settings', href: '/app/settings' },
      ]},
    ];
    setNavigation(fullNavigation.flatMap(section => section.options));
  }, []);

  const query = rawQuery.toLowerCase().replace(/^[#>/]/, '');

  const filteredProjects = (rawQuery.startsWith('#') || !rawQuery.startsWith('>') && !rawQuery.startsWith('/'))
    ? projects.filter(project => project.name.toLowerCase().includes(query))
    : [];

  const filteredUsers = (rawQuery.startsWith('>') || !rawQuery.startsWith('#') && !rawQuery.startsWith('/'))
    ? users.filter(user => user.name.toLowerCase().includes(query))
    : [];

  const filteredNavigation = (rawQuery.startsWith('/') || !rawQuery.startsWith('#') && !rawQuery.startsWith('>'))
    ? navigation.filter(page => page.name.toLowerCase().includes(query))
    : [];

  return (
    <Dialog
      className="relative z-50"
      open={open}
      onClose={() => {
        setOpen(false);
        setRawQuery('');
      }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <DialogPanel
          transition
          className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <Combobox
            onChange={(item) => {
              if (item) {
                window.location = item.href || item.url;
              }
            }}
          >
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <ComboboxInput
                autoFocus
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                onChange={(event) => setRawQuery(event.target.value)}
                onBlur={() => setRawQuery('')}
              />
            </div>

            {(filteredProjects.length > 0 || filteredUsers.length > 0 || filteredNavigation.length > 0 || recentSearches.length > 0) && (
              <ComboboxOptions
                static
                as="ul"
                className="max-h-80 transform-gpu scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                {filteredNavigation.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Pagine</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredNavigation.map(page => (
                        <ComboboxOption
                          as="li"
                          key={page.name}
                          value={page}
                          className="flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-[#7fb7d4] data-[focus]:text-white"
                        >
                          <span className="ml-3 flex-auto truncate">{page.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredProjects.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Commesse</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredProjects.map(project => (
                        <ComboboxOption
                          as="li"
                          key={project.id}
                          value={project}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-[#7fb7d4] data-[focus]:text-white"
                        >
                          <FolderIcon
                            className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                            aria-hidden="true"
                          />
                          <span className="ml-3 flex-auto truncate">{project.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredUsers.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Utenti</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredUsers.map(user => (
                        <ComboboxOption
                          as="li"
                          key={user.id}
                          value={user}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-[#7fb7d4] data-[focus]:text-white"
                        >
                          <img
                            src={user.imageUrl}
                            alt=""
                            className="h-6 w-6 flex-none rounded-full"
                          />
                          <span className="ml-3 flex-auto truncate">{user.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                
















              </ComboboxOptions>
            )}
          

            {rawQuery === '?' && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <LifebuoyIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                <p className="mt-4 font-semibold text-gray-900">Aiuto con la ricerca</p>
                <p className="mt-2 text-gray-500">
                  Usa questo strumento per cercare rapidamente utenti, progetti e pagine su tutta la nostra piattaforma. Puoi anche utilizzare
                  i modificatori di ricerca che si trovano nel piè di pagina qui sotto per limitare i risultati solo agli utenti, ai progetti o alle pagine.
                </p>
              </div>
            )}

            {query !== '' && rawQuery !== '?' && filteredProjects.length === 0 && filteredUsers.length === 0 && filteredNavigation.length === 0 && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <ExclamationTriangleIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                <p className="mt-4 font-semibold text-gray-900">Nessun risultato</p>
                <p className="mt-2 text-gray-500">Non è stato trovato nulla per la tua ricerca.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
              Utilizza{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('#') ? 'border-[#7fb7d4] text-[#7fb7d4]' : 'border-gray-400 text-gray-900',
                )}
              >
                #
              </kbd>{' '}
              <span className="sm:hidden">per i progetti,</span>
              <span className="hidden sm:inline">per accedere ai progetti,</span>
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('>') ? 'border-[#7fb7d4] text-[#7fb7d4]' : 'border-gray-400 text-gray-900',
                )}
              >
                &gt;
              </kbd>{' '}
              per gli utenti,{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery === '?' ? 'border-[#7fb7d4] text-[#7fb7d4]' : 'border-gray-400 text-gray-900',
                )}
              >
                ?
              </kbd>{' '}
              per un aiuto, e{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('/') ? 'border-[#7fb7d4] text-[#7fb7d4]' : 'border-gray-400 text-gray-900',
                )}
              >
                /
              </kbd>{' '}
              per le pagine.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}