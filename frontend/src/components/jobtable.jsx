import { Fragment, useState, useRef, useEffect } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie';
import JobInformation from './jobinformation';


import OfferCreate from './jobcreate';
import { set } from 'date-fns';

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
  const [showInfo, setShowInfo] = useState(false);
  const [selectedJob, setSelectedJob] = useState({});

  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
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
  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };


  const getColumnValue = (job, columnName) => {
    const parts = columnName.split('.');
    let value = job;
    for (const part of parts) {
      if (value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return value;
  };

  const compareValues = (a, b) => {
    if (a === undefined || b === undefined) return 0;
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      return a.length - b.length;
    } else if (typeof a === 'object' && typeof b === 'object') {
      // Example for sorting by nested object properties
      return compareValues(a.value, b.value);
    }
    return a < b ? -1 : a > b ? 1 : 0;
  };
  

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    Company: '',
    status: '',
    offer: '',
    offerhour: '',
    total: '',
   
    reportedhour: '',
    offertotal: '',
    createdByUser: ''
  });


  const filteredJob = jobs.filter((item) => {
    // Default filter to true for all conditions
    return (
      (searchQueries.name === '' || (item.name && item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))) &&
      (searchQueries.offer === '' || (item.SalesOrders[0] && item.SalesOrders[0].name && item.SalesOrders[0].name.toLowerCase().includes(searchQueries.offer.toLowerCase()))) &&
      (searchQueries.Company === '' || (item.SalesOrders[0] && item.SalesOrders[0].Offer && item.SalesOrders[0].Offer.QuotationRequest && item.SalesOrders[0].Offer.QuotationRequest.Company && item.SalesOrders[0].Offer.QuotationRequest.Company.name && item.SalesOrders[0].Offer.QuotationRequest.Company.name.toLowerCase().includes(searchQueries.Company.toLowerCase()))) &&
      (searchQueries.status === '' || (item.status.toLowerCase().includes(searchQueries.status.toLowerCase()))) &&
      (searchQueries.reportedhour === '' || (item.Reportings && item.Reportings.some(report => report.hour.toString().includes(searchQueries.reportedhour.toString())))) &&
      (searchQueries.offerhour === '' || (item.SalesOrders[0] && item.SalesOrders[0].Offer && item.SalesOrders[0].Offer.hour && item.SalesOrders[0].Offer.hour.toString().includes(searchQueries.offerhour.toString()))) &&
      (searchQueries.total === '' || (item.Reportings && item.Reportings.total.toString().includes(searchQueries.total.toString()))) &&
      (searchQueries.offertotal === '' || (item.SalesOrders[0] && item.SalesOrders[0].Offer && item.SalesOrders[0].Offer.amount && item.SalesOrders[0].Offer.amount.toString().includes(searchQueries.offertotal.toString()))) &&
      (searchQueries.createdByUser === '' || (item.createdByUser && (item.createdByUser.name + ' ' + item.createdByUser.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase())))
    );
  });
  
  
  const sortedJob = filteredJob.sort((a, b) =>  {
    const getValue = (item, column) => {
      switch (column) {
        case 'Company':
          return item.SalesOrders[0]?.Offer.QuotationRequest.Company.name || '';
        case 'Saleorder':
          return item.SalesOrders[0]?.name || '';
        case 'offertotal':
          return item.SalesOrders[0]?.Offer.amount || '';
        case 'offerhour':
          return item.SalesOrders[0]?.Offer.hour || '';
        case 'reportedhour':
          return item.Reportings.hour|| '';
        case 'total':
          return item.Reportings.hour || ''; //non corretto
        case 'createdByUser':
          return item.createdByUser ? `${item.createdByUser.name} ${item.createdByUser.surname}` : '';
        case 'status':
          return item.status || '';
        default:
          return item[column] || '';
      }
    };
  
    const valueA = getValue(a, sortColumn);
    const valueB = getValue(b, sortColumn);
  
    if (sortDirection === 'asc') {
      return compareValues(valueA, valueB);
    } else {
      return compareValues(valueB, valueA);
    }
  });

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
  
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
    

  function handleJobClick(job) {
    setSelectedJob(job);
    setShowInfo(true);
  }


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Transition.Root show={showInfo} as={Fragment}>
        <Dialog className="relative z-50" onClose={setShowInfo}>
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Informazioni Commessa
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowInfo(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <JobInformation job={selectedJob}/> }</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
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




      <div className="py-4">
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Commesse</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle commesse presenti a sistema</p>
          </div>

          {/* Contenitore per i pulsanti Export e Create */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportUsers}
               className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Export
            </button>
            <button
              onClick={() => setOpen(true)}
               className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Nome Commessa
                    {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.name}
                      onChange={handleSearchInputChange('name')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Commessa"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Company')}>
                    Azienda
                    {sortColumn === 'Company' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.Company}
                      onChange={handleSearchInputChange('Company')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Azienda"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('SaleOrder')}>
                    Ordine di Vendita
                    {sortColumn === 'SaleOrder' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.SaleOrder}
                      onChange={handleSearchInputChange('SaleOrder')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Ordine di Vendita"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('offertotal')}>
                    Valore Contrattuale
                    {sortColumn === 'offertotal' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.offertotal}
                      onChange={handleSearchInputChange('offertotal')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Valore Contrattuale"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('offerhour')}>
                    Ore Stimate
                    {sortColumn === 'offerhour' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.offerhour}
                      onChange={handleSearchInputChange('offerhour')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Ore Stimate"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('total')}>
                    Valore Reale
                    {sortColumn === 'total' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.total}
                      onChange={handleSearchInputChange('total')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Valore Reale"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('reportedhour')}>
                    Ore Lavorate
                    {sortColumn === 'reportedhour' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.reportedhour}
                      onChange={handleSearchInputChange('reportedhour')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Ore Lavorate"
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
                      placeholder="Stato"
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    Creata da
                    {sortColumn === 'createdByUser' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.createdByUser}
                      onChange={handleSearchInputChange('createdByUser')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder="Creatore"
                      rows={1}
                    />
                  </th>
                </tr>
              </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(sortedJob) && sortedJob.length > 0  ? (
                    sortedJob.map((job) => (
                      <tr key={job.id_user} onClick={() => handleJobClick(job)}
                      className={selectedJobs.includes(job) ? 'bg-gray-50' : undefined}>
                        <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedJobs.includes(job) ? 'text-[#7fb7d4]' : 'text-gray-700'
                          )}
                        >
                          {job.name}
                        </td>
                        <td className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedJobs.includes(job) ? 'text-[#7fb7d4]' : 'text-gray-700'
                          )}>
                          {
                            job.SalesOrders.length > 1 ? job.SalesOrders[0].Offer.QuotationRequest.Company.name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.Offer.QuotationRequest.Company.name
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {
                            job.SalesOrders.length > 1 ? job.SalesOrders[0].name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.name
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.amount), 0).toFixed(2) + ' €'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.hour), 0) + ' h'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {
                            (job.Reportings.reduce((total, reported) => total + reported.hour, 0) * (job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.amount), 0).toFixed(2) / job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.hour), 0).toFixed(2))).toFixed(2) + '€'
                          }
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {
                            job.Reportings.reduce((total, reported) => total + reported.hour, 0) + ' h'
                          }
                        </td> 
                        <td className="px-3 py-4 text-sm text-gray-700">
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
                        <td className="px-3 py-4 text-sm text-gray-700">
                          {job.createdByUser?.name.slice(0, 2).toUpperCase() + job.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
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
