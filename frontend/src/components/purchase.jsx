import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';

import { UserContext } from '../module/userContext';

import PurchaseCreateForm from './purchasecreate';

import PurchaseInfo from './purchaseinfo';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState([]); // Inizializza con array vuoto
  const [items, setItems] = useState([]); // Inizializza con array vuoto
  const [showCreate, setShowCreate] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedItemInfo, setSelectedItemInfo] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;
    setChecked(selectedItems.length === items.length);
    setIndeterminate(isIndeterminate);
    if (checkbox.current) checkbox.current.indeterminate = isIndeterminate;
  }, [selectedItems, items]);

  function toggleAll() {
    setSelectedItems(checked || indeterminate ? [] : items);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }


  const fetchOrders = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/purchase/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setPurchaseOrder(Array.isArray(response.data.purchases) ? response.data.purchases : []);
        setItems(Array.isArray(response.data.purchases) ? response.data.purchases : []);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
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

  
  const filteredPurchase = purchaseOrder.filter((item) => {
    switch (filterType) {
      case 'name':
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      case 'id_company':
        return item.Company?.name.toLowerCase().includes(searchQuery.toLowerCase());
      case 'payment_method':
        return item.payment_method.toLowerCase().includes(searchQuery.toLowerCase());
      case 'total':
        return item.total.toString().includes(searchQuery);
      case 'IVA':
        return item.IVA.toLowerCase().includes(searchQuery.toLowerCase());
      case 'status':
        return item.status.toLowerCase().includes(searchQuery.toLowerCase());
      case 'createdByUser':
        return (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQuery.toLowerCase());
      default:
        return false;
    }
  });
  


  const handleStatusSelectChange = (event) => {
    setSelectedStatus(event.target.value);
  };
  
  const sortedPurchase = filteredPurchase.sort((a, b) => {
    const valueA = sortColumn === 'id_company' ? a.Company?.name : sortColumn === 'createdByUser' ? (a.createdByUser?.name + ' ' + a.createdByUser?.surname) : a[sortColumn];
    const valueB = sortColumn === 'id_company' ? b.Company?.name : sortColumn === 'createdByUser' ? (b.createdByUser?.name + ' ' + b.createdByUser?.surname) : b[sortColumn];

    if (sortDirection === 'asc') {
      return compareValues(valueA, valueB);
    } else {
      return compareValues(valueB, valueA);
    }
  });


  function exportData() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      items.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const download = 'data.csv'
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
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
                            {selectedItemInfo.name + ' - ' + selectedItemInfo.description}
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={() => setShowInfo(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Chiudi pannello</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <PurchaseInfo purchase={selectedItemInfo} /> }</div>
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
                              Crea un nuovo ordine di acquisto
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => setShowCreate(false)}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Chiudi pannello</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative mt-6 flex-1 px-4 sm:px-6"><PurchaseCreateForm /></div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900">Ordini di Acquisto</h1>
        <p className="mt-2 text-sm text-gray-700">Lista degli ordini di acquisto presenti a sistema</p>
      </div>

      <div className="flex flex-wrap justify-between mt-4 mb-4">
        <div className="flex items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block  px-6 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="name">N° Ordine</option>
            <option value="id_company">Azienda</option>
            <option value="payment_method">Metodo di Pagamento</option>
            <option value="total">Totale</option>
            <option value="IVA">IVA</option>
            <option value="createdByUser">Creato Da</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="block px-6 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            placeholder={`Cerca per ${filterType === 'name' ? 'n° ordine' : filterType === 'id_company' ? 'Azienda' : filterType === 'total' ? 'import totale':  filterType === 'payment_method' ? 'pagamento' : filterType === 'IVA' ? 'IVA':  filterType === 'createdByUser' ? 'user creazione': 'n° ordine' }`}
          />
        </div> 
        
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={handleStatusSelectChange}
            className="block px-8 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="In Approvazione">In Approvazione</option>
            <option value="Accettato">Accettato</option>

          </select>
          <button
            onClick={exportData}
            className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Export
          </button>
          <button
            onClick={() =>setShowCreate(true)}
            className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Create
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('id_purchase')}
                    >
                      N° Ordine
                      {sortColumn === 'id_purchase' && (
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
                      className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('id_company')} //non va bene id_company ma non riesco ad indicare come prendere il nome della company 
                    >
                      Azienda
                      {sortColumn === 'id_company' && (
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('payment_method')}
                    >
                      Metodo di Pagamento
                      {sortColumn === 'payment_method' && (
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('total')}
                    >
                      Totale
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('IVA')}
                    >
                      IVA
                      {sortColumn === 'IVA' && (
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
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
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
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('createdByUser')} //non funziona 
                    >
                      Creata da
                      {sortColumn === 'createdByUser' && (
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
                      className="relative py-3.5 pl-3 pr-4 sm:pr-3"
                    ></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(sortedPurchase) && sortedPurchase.length > 0 ? (
                    sortedPurchase.map((item) => (
                      <tr
                        key={item.id_purchase}
                        className={selectedItems.includes(item) ? 'bg-gray-50' : undefined}
                      >
                        <td
                          onClick={(event) => {
                            //ctrl + click per aprire un nuovo tab
                            if (event.ctrlKey) {
                              window.open(`/app/purchase/${item.id_purchase}`);
                            } else {
                              setShowInfo(true);
                              setSelectedItemInfo(item);
                            }
                          }}
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedItems.includes(item) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {item.name}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {item.Company?.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.payment_method}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.total + ' ' + item.currency}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.IVA}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.status === 'In Approvazione' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              In Approvazione
                            </span>
                          ) : item.status === 'Approvata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Approvata
                            </span>
                          ) : item.status === 'Rifiutata' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Rifiutata
                            </span>
                          ) : item.status === 'Scaduta' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-zinc-100 text-zinc-800">
                              Scaduta
                            </span>
                          ) : item.status === 'Nuova' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Nuova
                            </span>
                          ) : item.status === 'Revisionata' ? (
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
                          {item.createdByUser?.name.slice(0, 2).toUpperCase() + item.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            {/* {item.createdByUser?.id_user === user.id_user && (
                              <>
                                {item.status === 'In Approvazione' && (
                                  <>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Accept(item.id_order)}
                                      title="Approva"
                                    >
                                      <CheckIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Refuse(item.id_order)}
                                      title="Rifiuta"
                                    >
                                      <XMarkIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Revision(item.id_order)}
                                      title="Revisione"
                                    >
                                      <ArrowPathIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                  </>
                                )}
                                {item.status === 'Nuova' && (
                                  <>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Sent(item.id_order)}
                                      title="Invia al cliente"
                                    >
                                      <PaperAirplaneIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                      onClick={() => Revision(item.id_order)}
                                      title="Revisione"
                                    >
                                      <ArrowPathIcon className="h-5 w-4 text-gray-500" />
                                    </button>
                                  </>
                                )}
                              </>
                            )} */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        Non ci sono ordini di acquisto
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
