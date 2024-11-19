import { Fragment, useState, useRef, useEffect } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie';
import JobInformation from './jobinformation';
import { useNavigate } from 'react-router-dom';


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

  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('desc');
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
      .get(`${process.env.REACT_APP_API_URL}/job/read`, )
      .then((response) => {
        setJob(response.data.jobs);
       
      })
      .catch((error) => {
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
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    
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
      (searchQueries.total === '' || (item.Reportings && item.Reportings.some(report => report.total.toString().includes(searchQueries.total.toString())))) &&
      (searchQueries.offertotal === '' || (item.SalesOrders[0] && item.SalesOrders[0].Offer && item.SalesOrders[0].Offer.amount && item.SalesOrders[0].Offer.amount.toString().includes(searchQueries.offertotal.toString()))) &&
      (searchQueries.createdByUser === '' || (item.createdByUser && (item.createdByUser.name + ' ' + item.createdByUser.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase())))
    );
  });
  
  

  const sortedJob = filteredJob.sort((a, b) => {
    // Se sortColumn è vuota, ordina per id per impostazione predefinita
    if (!sortColumn) {
      setSortColumn('name');
    }
  
    // Altrimenti, ordina per la colonna specificata
    const valueA = sortColumn === 'Company' ? a.SalesOrders[0].Offer?.QuotationRequest?.Company?.name :
                    sortColumn === 'reportedhour' ? a.SalesOrders[0].name :
                    sortColumn === 'offerhour' ? a.SalesOrders[0].name :
                    sortColumn === 'total' ? a.SalesOrders[0].name :
                    sortColumn === 'offertotal' ? a.SalesOrders[0].name :
                   
                    sortColumn === 'offer' ? a.SalesOrders[0].name :
                    sortColumn === 'createdByUser' ? (a.createdByUser?.name + ' ' + a.createdByUser?.surname) :
                    a[sortColumn];
    const valueB = sortColumn === 'Company' ? b.SalesOrders[0].Offer?.QuotationRequest?.Company?.name :
                    sortColumn === 'reportedhour' ? b.SalesOrders[0].name :
                    sortColumn === 'offerhour' ? b.SalesOrders[0].name :
                    sortColumn === 'total' ? b.SalesOrders[0].name :
                    sortColumn === 'offertotal' ? b.SalesOrders[0].name :
                   
                    sortColumn === 'offer' ? b.SalesOrders[0].name :
                    sortColumn === 'createdByUser' ? (b.createdByUser?.name + ' ' + b.createdByUser?.surname) :
                    b[sortColumn];
      if (sortColumn) {
        if (sortDirection === 'asc') {
          return compareValues(valueA, valueB);
        } else {
          return compareValues(valueB, valueA);
        }
      }
      // Default sorting by id_category
      return a.name - b.name;
  });
    
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Reset to default
        setSortColumn('name');
        setSortDirection('asc');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

    

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
  
  
  const handlectrlClick = (job) => {
    window.open(`/app/job/${job.id_job}`, '_blank'); // Apre in una nuova scheda
  };

  function handleJobClick(job) {
    setSelectedJob(job);
    setShowInfo(true);
  }


  return (
    <div className="px-2 sm:px-6 lg:px-8">
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
      </div>


      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-4 lg:px-6">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Commessa
                    {sortColumn === 'name' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.name}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('name')}
                    className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer"onClick={() => handleSort('Company')}>
                    Azienda
                    {sortColumn === 'Company' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.Company}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('Company')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('SaleOrder')}>
                    Ordine di Vendita
                    {sortColumn === 'SaleOrder' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.SaleOrder}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('SaleOrder')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('offertotal')}>
                    Valore Contrattuale
                    {sortColumn === 'offertotal' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.offertotal}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('offertotal')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('offerhour')}>
                    Ore Stimate
                    {sortColumn === 'offerhour' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.offerhour}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('offerhour')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('total')}>
                    Valore Reale
                    {sortColumn === 'total'&& sortDirection !== ''? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.total}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('total')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('reportedhour')}>
                    Ore Lavorate
                    {sortColumn === 'reportedhour' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.reportedhour}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('reportedhour')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                    Stato
                    {sortColumn === 'status' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.status}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('status')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col"  className="px-2 py-2 text-left text-xs font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    Creata da
                    {sortColumn === 'createdByUser' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.createdByUser}
                      onClick={(e) => e.stopPropagation()} 
                      onChange={handleSearchInputChange('createdByUser')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(sortedJob) && sortedJob.length > 0 ? (
                    sortedJob.map((job) => (
                      <tr key={job.id_user} className={selectedJobs.includes(job) ? 'bg-gray-50' : undefined}>
                              <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedJobs.includes(job) ? 'text-[#7fb7d4]' : 'text-gray-700'
                          )}
                          onClick={(event) => {
                            // ctrl + click per aprire un nuovo tab
                            if (event.ctrlKey) {
                              handlectrlClick(job);
                            } else {
                              handleJobClick(job); // Mostra il form nella stessa finestra
                            }
                          }}
                        >
                          {job.name}
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            job?.SalesOrders.length > 1 ? job.SalesOrders[0].Offer?.QuotationRequest?.Company?.name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.Offer?.QuotationRequest?.Company?.name
                          }
                        </td>
                        <td className={classNames(
                           "whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words",
                            selectedJobs.includes(job) ? 'text-[#7fb7d4]' : 'text-gray-700'
                          )}>
                          {
                            job?.SalesOrders.length > 1 ? job.SalesOrders[0].Offer?.QuotationRequest?.Company?.name + '...' + " (" + job.SalesOrders.length + ")" : job.SalesOrders[0]?.Offer?.QuotationRequest?.Company?.name
                          }
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            job.SalesOrders.length > 1 ? job.SalesOrders[0].name + '...' + " (" + job?.SalesOrders?.length + ")" : job?.SalesOrders[0]?.name
                          }
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order?.Offer?.amount), 0).toFixed(2) + ' €'
                          }
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            job.SalesOrders.reduce((total, order) => total + parseFloat(order?.Offer?.hour), 0) + ' h'
                          }
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            (job.Reportings.reduce((total, reported) => total + reported.hour, 0) * (job.SalesOrders.reduce((total, order) => total + parseFloat(order?.Offer?.amount), 0).toFixed(2) / job?.SalesOrders?.reduce((total, order) => total + parseFloat(order?.Offer?.hour), 0).toFixed(2))).toFixed(2) + '€'
                          }
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {
                            job.Reportings.reduce((total, reported) => total + reported.hour, 0) + ' h'
                          }
                        </td> 
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        {
                            // Use a ternary operator to determine the status class
                            job.status === 'Aperta' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-green-800">
                                Aperta
                              </span>
                            ) : job.status === 'Chiusa' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-red-800">
                                Chiusa
                              </span>
                            ) : job.status === 'Scaduta' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-red-800">
                                Scaduta
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Nessuno
                              </span>
                            )
                          }                 
                        </td>
                        <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
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
