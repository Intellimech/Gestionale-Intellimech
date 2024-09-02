import { Fragment, useState, useRef, useEffect, useContext } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie';

import { UserContext } from '../module/userContext'

import OfferCreate from './offercreate';
import OfferInformation from './offerinformation';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState([]);
  const [offers, setOffer] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  
  const [purchaseOrder, setPurchaseOrder] = useState([])
  const [areas, setTechnicalArea] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedOfferInfo, setSelectedOfferInfo] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');

  useEffect(() => {
    const isIndeterminate = selectedOffer.length > 0 && selectedOffer.length < offers.length;
    setChecked(selectedOffer.length === offers.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedOffer, offers]);

  function toggleAll() {
    setSelectedOffer(checked || indeterminate ? [] : offers);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  


  const compareValues = (a, b) => {
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
    description: '',
    Company: '',
    category: '',
    subcategory: '',
    technicalarea: '',
    status: '',
    revision: '',
    hour: '',
    amount: '',
    estimatedstart: '',
    estimatedend: '',
    deadline: '',
    
    createdByUser: ''
  });


  
  
  const filteredSaleOrder = offers.filter((item) => {
    return (
    (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
    (searchQueries.description=== '' || item.description.toLowerCase().includes(searchQueries.description.toLowerCase())) &&
    (searchQueries.revision=== '' || item.revision.toString().includes(searchQueries.revision.toString())) &&
    (searchQueries.Company === '' || item.QuotationRequest.Company?.name.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
    (searchQueries.category === '' || 
      [item.QuotationRequest.Category?.name, item.QuotationRequest.Subcategory?.name].some(value => value?.toLowerCase().includes(searchQueries.category.toLowerCase()))
    ) &&
    (searchQueries.subcategory === '' || item.QuotationRequest.Subcategory?.name.toLowerCase().includes(searchQueries.subcategory.toLowerCase())) &&
    (searchQueries.technicalarea === '' || item.QuotationRequest.TechnicalArea?.code.toLowerCase().includes(searchQueries.technicalarea.toLowerCase())) &&
    (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
    
    (searchQueries.hour=== '' || item.hour.toString().includes(searchQueries.hour.toString())) &&
    (searchQueries.amount=== '' || item.amount.toString().includes(searchQueries.amount.toString())) &&
    (searchQueries.estimatedstart=== '' || item.estimatedstart.includes(searchQueries.estimatedstart)) &&
    (searchQueries.estimatedend=== '' || item.estimatedend.includes(searchQueries.estimatedend)) &&
    (searchQueries.deadline === '' || item.deadlineDate.includes(searchQueries.deadline)) &&
    (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
  );
});

  const sortedSaleOrder = filteredSaleOrder.sort((a, b) => {

    const getValue = (item, column) => {
      switch (column) {
        case 'Company':
          return item.QuotationRequest?.Company?.name || '';
        case 'category':
          return item.QuotationRequest?.Category?.name || '';
        case 'subcategory':
          return item.QuotationRequest?.Subcategory?.name || '';
        case 'technicalarea':
          return item.QuotationRequest?.TechnicalArea?.name || '';
        case 'description':
          return item.QuotationRequest?.description || '';
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
      offers.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const download = 'data.csv'
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
  }

  const Accept = (offer) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/offer/accept/${offer}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.offer);
      axios
      .get(`${process.env.REACT_APP_API_URL}/offer/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setOffer(response.data.offer);
      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
    
  }

  const Refuse = (offer) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/offer/refuse/${offer}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.offer);
      axios
      .get(`${process.env.REACT_APP_API_URL}/offer/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setOffer(response.data.offer);
      })
      .catch((error) => {
        console.log(error);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const Sent = (offer) => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/offer/sent/${offer}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
    .then((response) => {
      console.log(response.data.offer);
      axios
      .get(`${process.env.REACT_APP_API_URL}/offer/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setOffer(response.data.offer);
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
      .get(`${process.env.REACT_APP_API_URL}/offer/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setOffer(response.data.offer);
        console.log(user)
        console.log(response.data.offer);
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
    setSelectedStatus(event.target.value);
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
                            {selectedOfferInfo?.name}
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <OfferInformation offer={selectedOfferInfo} /> }</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={showCreate} as={Fragment}>
        <Dialog className="relative z-50" onClose={setShowCreate}>
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
                            Crea una nuova offerta
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowCreate(false)}
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
        {/* Contenitore principale con Flexbox */}
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Offerte</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle offerte presenti a sistema</p>
          </div>

          {/* Bottoni Export e Create */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Export
            </button>
            <button
              onClick={() => setShowCreate(true)}
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
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('revision')}>
                    Revisione
                    {sortColumn === 'revision' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.revision}
                      onChange={handleSearchInputChange('revision')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('hour')}>
                    Ore
                    {sortColumn === 'hour' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.hour}
                      onChange={handleSearchInputChange('hour')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('amount')}>
                    Valore
                    {sortColumn === 'amount' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.amount}
                      onChange={handleSearchInputChange('amount')}
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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('estimatedstart')}>
                    Inizio Stimato
                    {sortColumn === 'estimatedstart' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.estimatedstart}
                      onChange={handleSearchInputChange('estimatedstart')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('estimatedend')}>
                    Fine Stimata
                    {sortColumn === 'estimatedend' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.estimatedend}
                      onChange={handleSearchInputChange('estimatedend')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('deadline')}>
                    Scadenza
                    {sortColumn === 'deadline' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                    <input
                      value={searchQueries.deadline}
                      onChange={handleSearchInputChange('deadline')}
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
                </tr>
</thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                {Array.isArray(sortedSaleOrder) && sortedSaleOrder.length > 0 ? (
                    sortedSaleOrder.map((offer) => (
                      <tr
                        key={offer.id_user}
                        className={selectedOffer.includes(offer) ? 'bg-gray-50' : undefined}
                      >
                        <td
                          onClick={() => {
                            setShowInfo(true);
                            setSelectedOfferInfo(offer);
                            console.log(offer);
                          }}
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedOffer.includes(offer) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {offer.name}
                        </td>
                        <td className="whitespace-normal max-w-[300px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {offer.description || offer.QuotationRequest.description}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {offer.QuotationRequest.Company.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.revision}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {`${offer.hour} h`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {`${offer.amount} €`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.QuotationRequest.Category.name}
                          <br />
                          {offer.QuotationRequest.Subcategory.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.QuotationRequest.TechnicalArea.code}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.estimatedstart ? new Date(offer.estimatedstart).toLocaleDateString() : ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.estimatedend ? new Date(offer.estimatedend).toLocaleDateString() : ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {['Scaduta', 'Approvata', 'Rifiutata'].includes(offer.status)
                            ? 'Nessuna'
                            : new Date(offer.deadlineDate).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.status === 'Inviata al cliente' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Inviata
                            </span>
                          ) : offer.status === 'Approvata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approvata
                            </span>
                          ) : offer.status === 'Rifiutata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rifiutata
                            </span>
                          ) : offer.status === 'Scaduta' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-zinc-100 text-zinc-800">
                              Scaduta
                            </span>
                          ) : offer.status === 'Nuova' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Nuova
                            </span>
                          ) : offer.status === 'Revisionata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Revisionata
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Nessuno
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {offer.createdByUser?.name.slice(0, 2).toUpperCase() + offer.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {offer.createdByUser === user.id_user && (
                              <>
                                {offer.status === 'Inviata al cliente' && (
                                  <>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Accept(offer.id_offer)}
                                      title="Approva"
                                    >
                                      <CheckIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Refuse(offer.id_offer)}
                                      title="Rifiuta"
                                    >
                                      <XMarkIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Revision()}
                                      title="Revisione"
                                    >
                                      <ArrowPathIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                  </>
                                )}
                                {offer.status === 'Nuova' && (
                                  <>
                                    {false && (
                                      <button
                                        type="button"
                                        className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                        onClick={() => console.log(user)}
                                        title="Visualizza"
                                      >
                                        <EyeIcon className="h-5 w-4 text-gray-500" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Sent(offer.id_offer)}
                                      title="Invia al cliente"
                                    >
                                      <PaperAirplaneIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Revision()}
                                      title="Revisione"
                                    >
                                      <ArrowPathIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Non ci sono offerte
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
