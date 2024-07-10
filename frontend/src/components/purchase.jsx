import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';

import { UserContext } from '../module/userContext';

import PurchaseCreateForm from './purchasecreate';
import OfferInformation from './offerinformation';

const mockUp = [
    {
      "id_order": 12,
      "description": "Lorem Ipsum Dolor",
      "category": 2,
      "subcategory": 25,
      "IVA" : "Esclusa",
      "status": "Approvata",
      "createdAt": "2024-05-18T14:17:36.000Z",
      "updatedAt": "2024-06-20T09:03:58.000Z",
      "deletedAt": null,
      "createdBy": 7,
      "updatedBy": null,
      "deletedBy": null,
      "Company": {
        "id_company": 3,
        "name": "ABB SPA"
      },
      "updatedByUser": null,
      "deletedByUser": null,
      "payment_method": "Bonifico",
      "total": "1000.00"
    }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState(mockUp); // Inizializza con mockUp
  const [items, setItems] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  
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

  // Funzione per gestire l'input di ricerca
  function handleSearchInputChange(event) {
    setSearchQuery(event.target.value);
  }

  // Funzione per gestire il cambio di stato
  function handleStatusSelectChange(event) {
    setSelectedStatus(event.target.value);
  }

  // Funzione per esportare i dati in formato CSV
  function exportData() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      items.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data.csv');
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
                            {selectedItemInfo?.description}
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <OfferInformation item={selectedItemInfo} /> }</div>
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
        <div className="flex-grow w-full max-w-xs mr-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Cerca per P.IVA o C.F."
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
          />
        </div>
        <div className="flex-grow w-full max-w-xs flex items-end mb-4">
          <select
            value={selectedStatus}
            onChange={handleStatusSelectChange}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            {/* Popolare lo status con dati */}
            {items.map((item) => (
              <option key={item.status} value={item.status}>
                {item.status}
              </option>
            ))}
          </select>
          <div className="px-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Export
            </button>
          </div>
          <div className="">
            <button
              onClick={() => setShowCreate(true)}
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
                      N.Ordine
                    </th>
                    <th scope="col" className="px-3 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Azienda
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Descrizione
                    </th>    
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      IVA 
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Metodo di Pagamento
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Totale
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stato
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {purchaseOrder.length > 0 ? (
                    purchaseOrder.map((item) => (
                      <tr
                        key={item.id_order}
                        className={selectedItems.includes(item) ? 'bg-gray-50' : undefined}
                      >
                        <td
                          onClick={() => {
                            setShowInfo(true);
                            setSelectedItemInfo(item);
                            console.log(item);
                          }}
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            selectedItems.includes(item) ? 'text-red-600' : 'text-gray-900'
                          )}
                        >
                          {item.id_order}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {item.Company.name}
                        </td>
                        <td className="whitespace-normal max-w-[300px] overflow-hidden text-sm text-gray-500 px-3 py-4 break-words">
                          {item.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.IVA}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.payment_method}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.total}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.status === 'Inviata al cliente' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Inviata
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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
