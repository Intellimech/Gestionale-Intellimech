import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, ArrowRightStartOnRectangleIcon, UsersIcon, EnvelopeOpenIcon, CursorArrowRaysIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

import QuotationRequestCreate from './quotationrequestcreate';
import QuotationRequestInfo from './quotationrequestinfo';


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

  const [showInfo, setShowInfo] = useState(false);
  const [selectedQuotationInfo, setSelectedQuotationInfo] = useState({});

  const [assignment, setCategory] = useState([]);
  const [projecttype, setProjectType] = useState([]);
  
  const [areas, setTechnicalArea] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [assignments, setAssignment] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    description: '',
    Company: '',
    clienttype: '',
    assignment: '',
    projecttype: '',
    technicalarea: '',
    status: '',
    data: '',
    createdByUser: ''
  });
  
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
  
  const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };
  const filteredRequest = quotationrequests.filter((item) => {
    return (
      (searchQueries?.name === '' || item?.name?.toLowerCase().includes(searchQueries?.name?.toLowerCase())) &&
      (searchQueries.description=== '' || item.description.toLowerCase().includes(searchQueries.description.toLowerCase())) &&
      (searchQueries.Company === '' || item.Company?.name?.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
      (searchQueries.clienttype === '' || item?.companytype.toLowerCase().includes(searchQueries.clienttype.toLowerCase())) &&
      (searchQueries.assignment === '' || 
        [item.Assignment?.code].some(value => value?.toLowerCase().includes(searchQueries.assignment.toLowerCase()))
      ) &&
      (searchQueries.projecttype === '' || item.ProjectType?.code?.toLowerCase().includes(searchQueries.projecttype.toLowerCase())) &&
      (searchQueries.technicalarea === '' || item.TechnicalArea?.code.toLowerCase().includes(searchQueries.technicalarea.toLowerCase())) &&
      (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
      (searchQueries.data === '' || item.createdAt.includes(searchQueries.data)) &&
      (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
    );
  });

  
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        // Reset to default
        setSortColumn('');
        setSortDirection('desc');
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('desc');
    }
  };
  
const sortedRequest = filteredRequest.sort((a, b) => {
  const getValue = (item, column) => {
    switch (column) {
      case 'Company':
        return item.Company?.name || '';
      case 'clienttype':
        return item?.companytype || '';
      case 'assignment':
        return item.Assignment?.code || '';
      case 'data':
        return item.createdAt || '';
      case 'projecttype':
        return item.ProjectType?.code || '';
      case 'area':
        return item.Technicaltechnicalarea?.name || '';
      case 'createdByUser':
        return item.createdByUser ? `${item.createdByUser.name} ${item.createdByUser.surname}` : '';
      default:
        return item[column] || '';
    }
  };
  const valueA = getValue(a, sortColumn);
  const valueB = getValue(b, sortColumn);

  if (sortDirection === 'desc') {
    return compareValues(valueB, valueA); // Invertito l'ordine qui per sort decrescente
  } else {
    return compareValues(valueA, valueB);
  }
});

  function exportData() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      quotationrequests.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const download = 'data.csv'
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
  }


  function handleReloadQuotationRequests() {
    axios
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`)
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
      })
      .catch((error) => {
        console.log(error);
      });
  }  

  const Accept = (quotationrequest) => {
    toast.promise(
        axios
          .post(`${process.env.REACT_APP_API_URL}/quotationrequest/accept/${quotationrequest}`)
          .then((response) => {
            console.log(response.data.quotationrequest);
            handleReloadQuotationRequests();
          })
          .catch((error) => {
            console.log(error);
            throw new Error('Errore durante l\'accettazione della richiesta di offerta');
          }),
        {
          loading: 'Loading...',
          success: 'Richiesta di offerta accettata',
          error: 'Errore durante l\'accettazione della richiesta di offerta',
        }
      )
  };

  const Refuse = (quotationrequest) => {
    toast.promise(
      axios
        .post(`${process.env.REACT_APP_API_URL}/quotationrequest/refuse/${quotationrequest}`)
        .then((response) => {
          console.log(response.data.quotationrequest);
          handleReloadQuotationRequests();
        })
        .catch((error) => {
          console.log(error);
          throw new Error('Errore durante il rifiuto della richiesta di offerta');
        }),
      {
        loading: 'Loading...',
        success: 'Richiesta di offerta è stata rifiutata',
        error: 'Errore durante il rifiuto della richiesta di offerta',
      }
    )
  }

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`)
      .then((response) => {
        setQuotationRequest(response.data.quotationrequest);
        console.log(response.data.quotationrequest);
      })
      .catch((error) => {
        console.log(error);
      });
      axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`)
        .then((response) => {
          setTechnicalArea(response.data.technicalareas);
        })
        .catch((error) => {
          console.error('Error fetching technical area data:', error);
        });
      
      axios
        .get(`${process.env.REACT_APP_API_URL}/projecttype/read`)
        .then((response) => {
          console.log('Fetched subcategories:', response.data.subcategories);
          setSubcategories(response.data.subcategories || []);
        })
        .catch((error) => {
          console.error('Error fetching subcategories:', error);
        });
  
      axios
        .get(`${process.env.REACT_APP_API_URL}/assignment/read`, )
        .then((response) => {
         
          setAssignment(response.data.assignments || []);
        })
        .catch((error) => {
          console.error('Error fetching categories:', error);
        });
  }, []); // Empty dependency array

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };


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
    
  const handlectrlClick = (quotationrequest) => {
    console.log("ho cliccato "+ quotationrequest.id_quotationrequest)
    window.open(`/app/quotation-request/${quotationrequest.id_quotationrequest}`, '_blank'); // Apre in una nuova scheda
    
  };
  
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        
      />
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
                            {selectedQuotationInfo?.name}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowInfo(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <QuotationRequestInfo quotationrequest={selectedQuotationInfo} /> }</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<QuotationRequestCreate />}</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
     
       
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-sm font-semibold leading-6 text-gray-900">Richieste di Offerta</h1>
            <p className="mt-1 text-xs text-gray-700">Lista delle richieste di offerta presenti a sistema</p>
          </div>

           {/* Bottoni Export e Create */}
           <div className="flex items-center space-x-2">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-0.5 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button
              onClick={() => setOpen(true)}
              className="block rounded-md bg-[#A7D0EB] px-2 py-0.5 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Crea
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="mb-2">
                <tr>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br /> RDO
                    {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries?.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('name')}
                      className=" mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/5 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br /> Cliente
                    {sortColumn === 'Company'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.Company}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('Company')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className=" mb-1w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Tipo  <br /> Cliente
                    {sortColumn === 'clienttype'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.clienttype}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('clienttype')}
                      className=" mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br /> Incarico
                    {sortColumn === 'assignment'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.assignment}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('assignment')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Tipo  <br />
                    Progetto
                    {sortColumn === 'projecttype' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.projecttype}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('projecttype')}
                      className="mt-1 px-1 py-0.5  w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Area  <br /> Tecnica
                    {sortColumn === 'technicalarea'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.technicalarea}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('technicalarea')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  
                  <th scope="col" className="w-1/4 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                  <br />Descrizione
                    {sortColumn === 'description' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.description}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('description')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br />Creazione
                    {sortColumn === 'data' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.data}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('data')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br />Stato
                    {sortColumn === 'status' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('status')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="w-1/8 px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br /> Creata da
                    {sortColumn === 'createdByUser' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.createdByUser}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('createdByUser')}
                      className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                      placeholder=""
                    />
                  </th>
                  <th scope="col" className="relative py-2 pl-2 pr-2">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedRequest.map((quotationrequest) => (
                  <tr key={quotationrequest.id_user} className="h-8">
                    <td
                      onClick={(event) => {
                        if (event.ctrlKey) {
                          handlectrlClick(quotationrequest);
                        } else {
                          setShowInfo(true);
                          setSelectedQuotationInfo(quotationrequest);
                        }
                      }}
                      className={classNames(
                        'whitespace-nowrap px-2 py-2 text-xs font-medium',
                        selectedQuotationRequest.includes(quotationrequest) ? 'text-[#7fb7d4]' : 'text-gray-900'
                      )}
                    >
                      {quotationrequest?.name}
                    </td>
                    <td className="text-xs text-gray-500 px-2 py-2 max-w-[160px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {quotationrequest.Company?.name}
                    </td>
                    <td className="text-xs text-left text-gray-500 px-2 py-2 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
                       {quotationrequest.companytype}
                    </td>

                  
                    <td className="text-xs text-gray-500 text-left  px-2 py-2 max-w-[90px]  whitespace-nowrap overflow-hidden text-ellipsis">
                    {quotationrequest.Assignment?.code}
                    </td>
                    <td className="text-xs text-gray-500 text-left px-2 py-2 max-w-[90px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {quotationrequest.ProjectType?.code}
                    </td>
                    <td className="text-xs text-gray-500 text-left  px-2 py-2 max-w-[90px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {quotationrequest.TechnicalArea?.code}
                    </td>

                      <td className="text-xs text-gray-500 px-2 py-2 min-w-[170px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {quotationrequest.description.split(" ").slice(0, 10).join(" ") + (quotationrequest.description.split(" ").length > 2 ? "..." : "")}
                    </td>
                    
                    <td className="text-xs text-gray-500 px-2 py-2 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {quotationrequest.createdAt ? new Date(quotationrequest.createdAt).toLocaleDateString() : ''}
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis px-2 py-2 text-xs">
                      {quotationrequest.status === 'In Attesa' ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-yellow-500">
                          In Approvazione
                        </span>
                      ) : quotationrequest.status === 'Approvata' ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-green-600">
                          Approvata
                        </span>
                      ) : quotationrequest.status === 'Rifiutata' ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-red-600">
                          Rifiutata
                        </span>   ) : quotationrequest.status === 'Utilizzata' ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-blue-600">
                          Utilizzata
                        </span>
                      ) : quotationrequest.status === 'Scaduta' ? (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-red-600">
                          Scaduta
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 inline-flex text-xs leading-4 font-medium rounded-full bg-gray-100 text-gray-800">
                          Nessuno
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-gray-500 px-2 py-2 max-w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
                     {quotationrequest.createdByUser?.name?.slice(0, 2).toUpperCase() + quotationrequest.createdByUser?.surname?.slice(0, 2).toUpperCase()}
                    </td>
                    <td className="whitespace-nowrap py-2 pl-2 pr-2 text-right text-xs font-medium">
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          className="inline-flex items-center rounded bg-white px-1.5 py-0.5 text-xs font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                          onClick={() => Accept(quotationrequest.id_quotationrequest)}
                          disabled={['Approvata', 'Rifiutata', 'Scaduta', 'Utilizzata'].includes(quotationrequest.status)}
                        >
                          <CheckIcon className="h-4 w-3 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center rounded bg-white px-1.5 py-0.5 text-xs font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                          onClick={() => Refuse(quotationrequest.id_quotationrequest)}
                          disabled={['Approvata', 'Rifiutata', 'Scaduta', 'Utilizzata'].includes(quotationrequest.status)}
                        >
                          <XMarkIcon className="h-4 w-3 text-gray-500" />
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
  );
};