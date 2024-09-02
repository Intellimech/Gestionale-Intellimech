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

  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  
  const [areas, setTechnicalArea] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    description: '',
    Company: '',
    category: '',
    subcategory: '',
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
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
      (searchQueries.description=== '' || item.description.toLowerCase().includes(searchQueries.description.toLowerCase())) &&
      (searchQueries.Company === '' || item.Company?.name.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
      (searchQueries.category === '' || 
        [item.Category?.name, item.Subcategory?.name].some(value => value?.toLowerCase().includes(searchQueries.category.toLowerCase()))
      ) &&
      (searchQueries.subcategory === '' || item.Subcategory?.name.toLowerCase().includes(searchQueries.subcategory.toLowerCase())) &&
      (searchQueries.technicalarea === '' || item.TechnicalArea?.code.toLowerCase().includes(searchQueries.technicalarea.toLowerCase())) &&
      (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
      (searchQueries.data === '' || item.createdAt.includes(searchQueries.data)) &&
      (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
    );
  });

  
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  
  const sortedRequest = filteredRequest.sort((a, b) => {
    const getValue = (item, column) => {
      switch (column) {
        case 'Company':
          return item.Company?.name || '';
        case 'category':
          return item.Category?.name || '';
        case 'subcategory':
          return item.Subcategory?.name || '';
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
  
    if (sortDirection === 'asc') {
      return compareValues(valueA, valueB);
    } else {
      return compareValues(valueB, valueA);
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
      axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, { 
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
        .then((response) => {
          setTechnicalArea(response.data.technicalareas);
        })
        .catch((error) => {
          console.error('Error fetching technical area data:', error);
        });
      
      axios
        .get(`${process.env.REACT_APP_API_URL}/subcategory/read`, {
          headers: { authorization: `Bearer ${Cookies.get('token')}` },
        })
        .then((response) => {
          console.log('Fetched subcategories:', response.data.subcategories);
          setSubcategories(response.data.subcategories || []);
        })
        .catch((error) => {
          console.error('Error fetching subcategories:', error);
        });
  
      axios
        .get(`${process.env.REACT_APP_API_URL}/category/read`, {
          headers: { authorization: `Bearer ${Cookies.get('token')}` },
        })
        .then((response) => {
          console.log('Fetched categories:', response.data.categories);
          setCategories(response.data.categories || []);
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
     
      
      <div className="py-4">
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Richieste di Offerta</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle richieste di offerta presenti a sistema</p>
          </div>

          {/* Bottoni Export e Create */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"            >
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




      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Ordine
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
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                    Descrizione
                    {sortColumn === 'description' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.description}
                      onChange={handleSearchInputChange('description')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
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
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                    Categoria
                    {sortColumn === 'category' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.category}
                      onChange={handleSearchInputChange('category')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('technicalarea')}>
                    Area Tecnica
                    {sortColumn === 'technicalarea' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.technicalarea}
                      onChange={handleSearchInputChange('technicalarea')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('data')}>
                    Data
                    {sortColumn === 'data' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.data}
                      onChange={handleSearchInputChange('data')}
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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    Creata da
                    {sortColumn === 'createdByUser' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.createdByUser}
                      onChange={handleSearchInputChange('createdByUser')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedRequest.map((quotationrequest) => (
                      <tr key={quotationrequest.id_user}>
                      
                        <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedQuotationRequest.includes(quotationrequest) ? 'text-[#7fb7d4]' : 'text-gray-900'
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
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}