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
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ open, setOpen }) {
  const [rawQuery, setRawQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [offers, setOffers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const headers = { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${Cookies.get('token')}`
      };

      const [
        { data: usersData },
        { data: projectsData },
        { data: offersData },
        { data: invoicesData },
        { data: quotationRequestsData },
        { data: purchaseOrdersData },
      ] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/user/read`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/job/read`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/offer/read`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/invoice/read`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/purchase/read`, { headers }),
      ]);

      setUsers(usersData.users.map(user => ({
        id: user.id_user,
        name: `${user.name} ${user.surname}`,
        url: '#',
        imageUrl: `https://api.dicebear.com/8.x/lorelei/svg?seed=${user.id_user}`,
      })));

      setProjects(projectsData.jobs.map(job => ({
        id: job.id_job,
        name: job.name,
        category: 'Projects',
        url: '/app/job/',
      })));

      setOffers(offersData.offer.map(offer => ({
        id: offer.id_offer,
        name: offer.name,
        category: 'Offers',
        url: '/app/offer/',
      })));

      setInvoices(invoicesData.value.map(invoice => ({
        id: invoice.id_invoice,
        name: invoice.name,
        category: 'Invoices',
        url: '/app/invoice/',
      })));

      setQuotationRequests(quotationRequestsData.quotationrequest.map(quotationRequest => ({
        id: quotationRequest.id_quotationrequest,
        name: quotationRequest.name,
        category: 'Quotation Requests',
        url: '/app/quotationrequest/',
      })));

      setPurchaseOrders(purchaseOrdersData.purchases?.map(purchaseOrder => ({
        id: purchaseOrder.id_purchase,
        name: purchaseOrder.name,
        category: 'Purchase Orders',
        url: '/app/purchase/' + purchaseOrder.id_purchase,
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const query = rawQuery.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filterItems = (items) => {
    if (!query || query.startsWith('#') || query.startsWith('>') || query.startsWith('?')) return [];
    return items.filter(item => item.name.toLowerCase().includes(query));
  };

  const filteredProjects = filterItems(projects);
  const filteredUsers = filterItems(users);
  const filteredOffers = filterItems(offers);
  const filteredInvoices = filterItems(invoices).slice(0, 5);
  const filteredQuotationRequests = filterItems(quotationRequests);
  const filteredPurchaseOrders = filterItems(purchaseOrders);

  const handleInputChange = useCallback((event) => {
    setRawQuery(event.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setRawQuery('');
  }, []);

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
          <Combobox onChange={(item) => item && (window.location = item.url)}>
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <ComboboxInput
                autoFocus
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                onChange={handleInputChange}
                onBlur={handleBlur}
              />
            </div>

            {(filteredProjects.length > 0 || filteredUsers.length > 0 || filteredOffers.length > 0 || filteredInvoices.length > 0 || filteredQuotationRequests.length > 0 || filteredPurchaseOrders.length > 0) && (
              <ComboboxOptions
                static
                as="ul"
                className="max-h-80 transform-gpu scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                {filteredProjects.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Projects</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredProjects.map(project => (
                        <ComboboxOption
                          as="li"
                          key={project.id}
                          value={project}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
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
                    <h2 className="text-xs font-semibold text-gray-900">Users</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredUsers.map(user => (
                        <ComboboxOption
                          as="li"
                          key={user.id}
                          value={user}
                          className="flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
                        >
                          <img src={user.imageUrl} alt="" className="h-6 w-6 flex-none rounded-full" />
                          <span className="ml-3 flex-auto truncate">{user.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredOffers.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Offers</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredOffers.map(offer => (
                        <ComboboxOption
                          as="li"
                          key={offer.id}
                          value={offer}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
                        >
                          <FolderIcon
                            className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                            aria-hidden="true"
                          />
                          <span className="ml-3 flex-auto truncate">{offer.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredInvoices.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Invoices</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredInvoices.map(invoice => (
                        <ComboboxOption
                          as="li"
                          key={invoice.id}
                          value={invoice}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
                        >
                          <FolderIcon
                            className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                            aria-hidden="true"
                          />
                          <span className="ml-3 flex-auto truncate">{invoice.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredQuotationRequests.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Quotation Requests</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredQuotationRequests.map(quotationRequest => (
                        <ComboboxOption
                          as="li"
                          key={quotationRequest.id}
                          value={quotationRequest}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
                        >
                          <FolderIcon
                            className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                            aria-hidden="true"
                          />
                          <span className="ml-3 flex-auto truncate">{quotationRequest.name}</span>
                        </ComboboxOption>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredPurchaseOrders.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">Purchase Orders</h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredPurchaseOrders.map(purchaseOrder => (
                        <ComboboxOption
                          as="li"
                          key={purchaseOrder.id}
                          value={purchaseOrder}
                          className="group flex cursor-default select-none items-center px-4 py-2 data-[focus]:bg-red-600 data-[focus]:text-white"
                        >
                          <FolderIcon
                            className="h-6 w-6 flex-none text-gray-400 group-data-[focus]:text-white"
                            aria-hidden="true"
                          />
                          <span className="ml-3 flex-auto truncate">{purchaseOrder.name}</span>
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
                <p className="mt-4 font-semibold text-gray-900">Help with Search</p>
                <p className="mt-2 text-gray-500">
                  Use this tool to quickly search for the information you need.
                  You can use <kbd>#</kbd> for projects, <kbd>&gt;</kbd> for users, and{' '}
                  <kbd>?</kbd> for help.
                </p>
              </div>
            )}

            {query !== '' && rawQuery !== '?' && filteredProjects.length === 0 && filteredUsers.length === 0 && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <ExclamationTriangleIcon className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                <p className="mt-4 font-semibold text-gray-900">No Results</p>
                <p className="mt-2 text-gray-500">Nothing found for your search.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
              Use{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('#') ? 'border-red-600 text-red-600' : 'border-gray-400 text-gray-900',
                )}
              >
                #
              </kbd>{' '}
              <span className="sm:hidden">for projects,</span>
              <span className="hidden sm:inline">to access projects,</span>
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('>') ? 'border-red-600 text-red-600' : 'border-gray-400 text-gray-900',
                )}
              >
                &gt;
              </kbd>{' '}
              for users, and{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery === '?' ? 'border-red-600 text-red-600' : 'border-gray-400 text-gray-900',
                )}
              >
                ?
              </kbd>{' '}
              for help.
            </div>
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
