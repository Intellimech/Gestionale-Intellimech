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

  function handleSearchInputChange(event) {
    setSearchQuery(event.target.value);
  }

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
  

  
  const filteredJob = 
  jobs.filter((item) => {
    switch (filterType) {
      case 'name':
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      case 'Company':
        return item.SalesOrders[0]?.Offer.QuotationRequest.Company.name.toLowerCase().includes(searchQuery.toLowerCase());
      case 'SaleOrders.name':
        return item.SalesOrders[0]?.name.toLowerCase().includes(searchQuery.toLowerCase());
      case 'total':
        return item.SalesOrders[0]?.amount.toString().includes(searchQuery);
       case 'offerhour':
        return item.SalesOrder[0]?.hour.toString().includes(searchQuery.toLowerCase());
      case 'status':
        return item.status===selectedStatus;
      // case 'reportedhour':
      //   return item.status.toLowerCase().includes(searchQuery.toLowerCase());
      case 'createdByUser':
        return (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return false;
    }
  });
  
  const sortedJob = filteredJob.sort((a, b) =>  {
    const getValue = (item, column) => {
      switch (column) {
        case 'Company':
          return item.SalesOrders[0]?.Offer.QuotationRequest.Company.name || '';
        case 'Saleorder.name':
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
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
          <div className="flex items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block  px-6 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="name">Nome</option>
              <option value="Company">Azienda</option>
              <option value="SaleOrders.name">Ordine</option>
              
              <option value="status">Stato</option>
              {/* <option value="offerhour">Ore Stimate</option>
              <option value="total">Valore</option>
              <option value="reportedhour">Ore Lavorate</option> non so se ha senso filtrare per questi valori, essendoci la possibiliutà di ordinare le colonne */}
              <option value="createdByUser">Proprietario</option>
            </select>
            {filterType === 'status' ? (
              <select
                value={selectedStatus}
                onChange={(e) => setselectedStatus(e.target.value)}
                className="block w-48 px-4 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                
                <option value="Nessuno"> Nessuno </option>
                <option value="Scaduta"> Scaduta </option>
                <option value="Chiusa"> Chiusa </option>
                <option value="Aperta"> Aperta </option>
              </select>
            ) :
            ( 
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="block px-6 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder={`Cerca per ${filterType === 'name' ? 'Nome' : filterType === 'Company' ? 'Azienda' : filterType === 'SaleOrders.name' ? 'Ordine':  filterType === 'createdByUser' ? 'Proprietario': 'Nome' }`}
            />
             )}
          </div> 
          <div className="flex-grow w-full max-w-xs flex items-end px-36 mb-4">
            

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
                    <th scope="col" className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                        onClick={() => handleSort('name')}>
                      Nome
                      {sortColumn === 'name' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('Company')}>
                      Azienda
                      {sortColumn === 'Company' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('Saleorder.name')}>
                      Ordini di vendita
                      {sortColumn === 'Saleorder.name' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('offertotal')}>
                      Valore Contrattuale
                      {sortColumn === 'offertotal' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('offerhour')}>
                      Ore Stimate
                      {sortColumn === 'offerhour' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('total')}>
                      Valore Reale
                      {sortColumn === 'total' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('reportedhour')}>
                      Ore Lavorate
                      {sortColumn === 'reportedhour' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('createdByUser')}>
                      Proprietario
                      {sortColumn === 'createdByUser' && (
                        <span>
                          {sortDirection === 'createdByUser' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      onClick={() => handleSort('status')}>
                      Stato
                      {sortColumn === 'status' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
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
                            selectedJobs.includes(job) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {job.name}
                        </td>
                        <td className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedJobs.includes(job) ? 'text-red-600' : 'text-gray-900'
                          )}>
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
