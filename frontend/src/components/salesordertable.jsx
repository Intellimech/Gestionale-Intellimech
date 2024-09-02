import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';


import OfferCreate from './offercreate';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState([]);
  const [salesorders, setSalesOrder] = useState([]);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');

  const statusOptions = ['Da fatturare', 'Fatturata', 'Nessuna'];

  useEffect(() => {
    const isIndeterminate = selectedOffer.length > 0 && selectedOffer.length < salesorders.length;
    setChecked(selectedOffer.length === salesorders.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedOffer, salesorders]);

  function toggleAll() {
    setSelectedOffer(checked || indeterminate ? [] : salesorders);
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
    offer: '',
    status: '',
    createdByUser: ''
  });


    
  const filteredSaleOrder= salesorders.filter((item) => {
    return (
    (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
    (searchQueries.description=== '' || item.Offer.QuotationRequest.description.toLowerCase().includes(searchQueries.description.toLowerCase())) &&
    (searchQueries.Company === '' || item.Offer.QuotationRequest.Company?.name.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
  
   
    (searchQueries.offer === '' || item.Offer.name.toLowerCase().includes(searchQueries.offer.toLowerCase())) &&
    (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&

    (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
  );
});

    
  
  
  const sortedSaleOrder = filteredSaleOrder.sort((a, b) => {
    const getValue = (item, column) => {
      switch (column) {
        case 'Company':
          return item.Offer.QuotationRequest.Company.name || '';
        case 'description':
          return item.Offer.QuotationRequest.description || '';
        case 'offer':
          return item.Offer.name || '';
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

  const handleStatusSelectChange = (event) => {
    setSelectedStatus(event.target.value);
  };


  

  const exportUsers = () => {
    // Export users in the CSV file
    const csvContent = 'data:text/csv;charset=utf-8,' +
      salesorders.map((salesorder) => Object.values(salesorder).join(',')).join('\n');
    // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'salesorder.csv');
    document.body.appendChild(link);
    link.click();
  };

  const Accept = (salesorderId) => {
    axios.post(`${process.env.REACT_APP_API_URL}/salesorder/accept/${salesorderId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Cookies.get('token'),
          },
        })
          .then((response) => {
            setSalesOrder(response.data.salesorders);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };


  const Refuse = (salesorderId) => {
    axios.post(`${process.env.REACT_APP_API_URL}/salesorder/refuse/${salesorderId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Cookies.get('token'),
          },
        })
          .then((response) => {
            setSalesOrder(response.data.salesorders);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const Sent = (salesorderId) => {
    axios.post(`${process.env.REACT_APP_API_URL}/salesorder/sent/${salesorderId}`, {}, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Cookies.get('token'),
          },
        })
          .then((response) => {
            setSalesOrder(response.data.salesorders);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Cookies.get('token'),
      },
    })
      .then((response) => {
        console.log(response.data.salesorders);
        setSalesOrder(response.data.salesorders);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {/* Contenitore principale con Flexbox */}
          <div className="flex items-center justify-between">
            {/* Titolo e descrizione */}
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">Ordini di vendita</h1>
              <p className="mt-2 text-sm text-gray-700">Lista offerte presenti a sistema</p>
            </div>

            {/* Contenitore Bottone Export */}
            <div className="flex items-center space-x-4">
              <button
                onClick={exportUsers}
                className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Esporta
              </button>
            </div>
          </div>
        </div>




      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                      Ordine
                      {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.name}
                        onChange={handleSearchInputChange('name')}
                       className="mt-1 px-2 py-1       w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Company')}>
                      Azienda
                      {sortColumn === 'Company' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="input"
                        value={searchQueries.Company}
                        onChange={handleSearchInputChange('Company')}
                        className="mt-1       w-20 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}

                      />
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('offer')}>
                      Offerta
                      {sortColumn === 'offer' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.offer}
                        onChange={handleSearchInputChange('offer')}
                        className="mt-1 px-2 py-1       w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                      Descrizione
                      {sortColumn === 'description' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.description}
                        onChange={handleSearchInputChange('description')}
                       className="mt-1 px-2 py-1       w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                      Stato
                      {sortColumn === 'status' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onChange={handleSearchInputChange('status')}
                       className="mt-1 px-2 py-1       w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                      Creata da
                      {sortColumn === 'createdByUser' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.createdByUser}
                        onChange={handleSearchInputChange('createdByUser')}
                       className="mt-1 px-2 py-1       w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(sortedSaleOrder) && sortedSaleOrder.length > 0 ? (
                    sortedSaleOrder.map((salesorder) => (
                      <tr
                        key={salesorder.id}
                        className={selectedOffer.includes(salesorder) ? 'bg-gray-50' : undefined}
                      >
                        <td className="whitespace-nowrap px-2 py-4 text-sm font-medium text-gray-900">
                          {salesorder.name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          {salesorder.Offer.QuotationRequest.Company.name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          <a href={`/offer/${salesorder.Offer.id_offer}`} className="truncate">{salesorder.Offer.name}</a>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          <span className="truncate">{salesorder.Offer.description || salesorder.Offer.QuotationRequest.description}</span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          {salesorder.status === 'Da Fatturare' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Da fatturare
                            </span>
                          ) : salesorder.status === 'Fatturata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Fatturata
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Nessuno
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          {salesorder.createdByUser?.name.slice(0, 2).toUpperCase() + salesorder.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Non ci sono ordini di vendita
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
