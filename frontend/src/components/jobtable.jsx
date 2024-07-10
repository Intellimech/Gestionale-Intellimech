import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie';


import OfferCreate from './jobcreate';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions, user }) {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [jobs, setJob] = useState([]);
  const [open, setOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

  useEffect(() => {
    const isIndeterminate = selectedJobs.length > 0 && selectedJobs.length < jobs.length;
    setChecked(selectedJobs.length === jobs.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedJobs, jobs]);

  function toggleAll() {
    setSelectedJobs(checked || indeterminate ? [] : jobs);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/job/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setJob(response.data.jobs);
        console.log(user)
        console.log(response.data.jobs);
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
    jobs.map((user) => Object.values(user).join(',')).join('\n');
    // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'job.csv');
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
                            Crea una commessa
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <OfferCreate /> }</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Commesse</h1>
          <p className="mt-2 text-sm text-gray-700">Lista commesse presenti a sistema</p>
        </div>
        {/* Search box and Year filter */}
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
              {/* get the status from user */}
              {jobs.map((job) => (
                <option key={job.status} value={job.status}>
                  {job.status}
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
              <button
                onClick={() => setOpen(true)}
                className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>                
                    <th scope="col" className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Azienda
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ordini di vendita
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Valore Contrattuale
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ore Stimate
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Valore Reale
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ore Lavorate
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Proprietario
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <tr key={job.id_user} onClick={() => console.log('banana' + job.id_job)} className={selectedJobs.includes(job) ? 'bg-gray-50' : undefined}>
                        <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedJobs.includes(job) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {job.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            job.SalesOrders.length > 1 ? job.SalesOrders[0].Offer.QuotationRequest.Company.name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.Offer.QuotationRequest.Company.name
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            job.SalesOrders.length > 1 ? job.SalesOrders[0].name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.name
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.amount), 0).toFixed(2) + ' €'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.hour), 0) + ' h'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            (job.Reportings.reduce((total, reported) => total + reported.hour, 0) * (job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.amount), 0).toFixed(2) / job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.hour), 0).toFixed(2))).toFixed(2) + '€'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {
                            job.Reportings.reduce((total, reported) => total + reported.hour, 0) + ' h'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {job.createdByUser?.name.slice(0, 2).toUpperCase() + job.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td> 
                        <td className="px-3 py-4 text-sm text-gray-500">
                        {
                            // Use a ternary operator to determine the status class
                            job.status === 'Aperta' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Aperta
                              </span>
                            ) : job.status === 'Chiusa' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Chiusa
                              </span>
                            ) : job.status === 'Scaduta' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Scaduta
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Nessuno
                              </span>
                            )
                          }                 
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
