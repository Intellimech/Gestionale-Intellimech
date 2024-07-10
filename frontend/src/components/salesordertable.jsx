import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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
  const [selectedStatus, setSelectedStatus] = useState('');

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

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

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
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900">Ordini di vendita</h1>
        <p className="mt-2 text-sm text-gray-700">Lista offerte presenti a sistema</p>
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
            <option value="">All</option>
          </select>

          <div className="px-4">
            <button
              onClick={exportUsers}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Export
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Azienda
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Offerta
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Descrizione
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Proprietario
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {salesorders.length > 0 ? (
                    salesorders.map((salesorder) => (
                      <tr
                        key={salesorder.id_user}
                        onClick={() => console.log('banana' + salesorder.id_offer)}
                        className={selectedOffer.includes(salesorder) ? 'bg-gray-50' : undefined}
                      >
                        <td
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedOffer.includes(salesorder) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {salesorder.name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {salesorder.Offer.QuotationRequest.Company.name}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          <a href={`/offer/${salesorder.Offer.id_offer}`}>{salesorder.Offer.name}</a>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {salesorder.Offer.description || salesorder.Offer.QuotationRequest.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
