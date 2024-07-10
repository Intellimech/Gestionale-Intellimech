import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, ArrowRightStartOnRectangleIcon, UsersIcon, EnvelopeOpenIcon, CursorArrowRaysIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import axios from 'axios';
import Cookies from 'js-cookie';

import QuotationRequestCreate from './quotationrequestcreate';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState([]);
  const [quotationrequests, setQuotationRequest] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

  useEffect(() => {
    const isIndeterminate = selectedQuotationRequest.length > 0 && selectedQuotationRequest.length < quotationrequests.length;
    setChecked(selectedQuotationRequest.length === quotationrequests.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedQuotationRequest, quotationrequests]);

  function toggleAll() {
    setSelectedQuotationRequest(checked || indeterminate ? [] : quotationrequests);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function handleReloadQuotationRequests() {
    axios
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
      })
      .catch((error) => {
        console.log(error);
      });
  }  

  const Accept = (quotationrequest) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/quotationrequest/accept/${quotationrequest}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.quotationrequest);
      axios
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const Refuse = (quotationrequest) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/quotationrequest/refuse/${quotationrequest}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.quotationrequest);
      axios
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
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
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
        console.log(response.data.quotationrequest);
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
    quotationrequests.map((quotationrequest) => Object.values(quotationrequest).join(',')).join('\n');
    // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'quotationrequest.csv');
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
                            Crea una nuova richiesta di offerta
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<QuotationRequestCreate />}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Richieste di Offerta</h1>
          <p className="mt-2 text-sm text-gray-700">Lista richieste di offerta presenti a sistema</p>
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
              {quotationrequests.map((quotationrequest) => (
                <option key={quotationrequest.status} value={quotationrequest.status}>
                  {quotationrequest.status}
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
                      
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 max-w-[200px] overflow-hidden whitespace-normal break-words max-h-1 overflow-y-auto">
                      Descrizione
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 max-w-[200px] overflow-hidden whitespace-normal break-words">
                      Azienda
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Categoria
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Area Tecnica
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Creazione
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Autore
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {quotationrequests.length > 0 ? (
                    quotationrequests.map((quotationrequest) => (
                      <tr
                        key={quotationrequest.id_user}
                        className={selectedQuotationRequest.includes(quotationrequest) ? 'bg-gray-50' : undefined}
                      >
                        <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedQuotationRequest.includes(quotationrequest) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {quotationrequest.name}
                        </td>
                        <td className="whitespace-normal max-w-[100px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words max-h-[100px] overflow-y-auto">
                          {quotationrequest.description}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {quotationrequest.Company.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quotationrequest.Category.name}
                          <br />
                          {quotationrequest.Subcategory.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quotationrequest.TechnicalArea.code}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quotationrequest.createdAt ? new Date(quotationrequest.createdAt).toLocaleDateString() : ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quotationrequest.status === 'In Attesa' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              In Attesa
                            </span>
                          ) : quotationrequest.status === 'Approvata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approvata
                            </span>
                          ) : quotationrequest.status === 'Rifiutata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rifiutata
                            </span>
                          ) : quotationrequest.status === 'Scaduta' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Scaduta
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Nessuno
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {quotationrequest.createdByUser?.name.slice(0, 2).toUpperCase() + quotationrequest.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                              onClick={() => Accept(quotationrequest.id_quotationrequest)}
                              disabled={['Approvata', 'Rifiutata', 'Scaduta'].includes(quotationrequest.status)}
                            >
                              <CheckIcon className="h-5 w-4 text-gray-500" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                              onClick={() => Refuse(quotationrequest.id_quotationrequest)}
                              disabled={['Approvata', 'Rifiutata', 'Scaduta'].includes(quotationrequest.status)}
                            >
                              <XMarkIcon className="h-5 w-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Non ci sono richieste di offerta
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
