import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from '../../module/userContext';
import PurchaseCreateForm from './purchasecreate';
import PurchaseInfo from './purchaseinfo';
import PurchaseUpdateForm from './purchaseupdate';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [items, setItems] = useState([]);
  
  const [selectedUpdate, setSelectedUpdate] = useState({});
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [sortColumn, setSortColumn] = useState('name'); // Imposta 'name' come colonna di ordinamento predefinita
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [filterType, setFilterType] = useState('name');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedItemInfo, setSelectedItemInfo] = useState({});

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_company: '',
    category: '',
    subcategory: '',
    subsubcategory: '',
    payment_method: '',
    total: '',
    taxed_total: '',
    status: '',
    createdByUser: '',
    purchaserows : '',
  });

  const handlectrlClick = (purchase) => {
    window.open(`/app/purchase/${purchase.id_purchase}`, '_blank'); // Apre in una nuova scheda
    
    return <PurchaseInfo purchase={purchase} />;
  };


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
      .get(`${process.env.REACT_APP_API_URL}/purchase/read`, )
      .then((response) => {
        console.log(response.data)
        setPurchaseOrder(Array.isArray(response.data.purchases) ? response.data.purchases : []);
        setItems(Array.isArray(response.data.purchases) ? response.data.purchases : []);
      })
      .catch((error) => {
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

 
  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const compareValues = (a, b) => {
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
  
    if (typeof a === 'string' && typeof b === 'string') {
      // Sensitivity 'base' ignora le differenze tra maiuscole e minuscole
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };
  
  
  const filteredPurchase = purchaseOrder.filter((item) => {
    return (
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
      (searchQueries.id_company === '' || item.Company?.name.toLowerCase().includes(searchQueries.id_company.toLowerCase())) &&
      (searchQueries.category === '' || item.category?.name.toLowerCase().includes(searchQueries.category.toLowerCase())) &&
      (searchQueries.subcategory === '' || item.subcategory?.name.toLowerCase().includes(searchQueries.subcategory.toLowerCase())) &&
      (searchQueries.subsubcategory === '' || item.subsubcategory?.name.toLowerCase().includes(searchQueries.subsubcategory.toLowerCase())) &&
      (searchQueries.payment_method === '' || item.payment_method.toLowerCase().includes(searchQueries.payment_method.toLowerCase())) &&
      (searchQueries.total === '' || item.total.toString().includes(searchQueries.total)) &&
      (searchQueries.taxed_total === '' || item.taxed_total?.toLowerCase().includes(searchQueries.taxed_total?.toLowerCase())) &&
      (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
      (searchQueries.purchaserows === '' || item.purchaserows.toString().includes(searchQueries.purchaserows.toString())) &&
      (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
    );
  });


  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Reset to default
        setSortColumn('');
        setSortDirection('asc');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const sortedPurchase = filteredPurchase.sort((a, b) => {
    // Se sortColumn è vuota, ordina per id per impostazione predefinita
    if (!sortColumn) {
      setSortColumn('name');
    }
  
    // Altrimenti, ordina per la colonna specificata
    const valueA = sortColumn === 'Company' ? a.Company?.name :
                    sortColumn === 'createdByUser' ? (a.createdByUser?.name + ' ' + a.createdByUser?.surname) :
                    a[sortColumn];
    const valueB = sortColumn === 'Company' ? b.Company?.name :
                    sortColumn === 'createdByUser' ? (b.createdByUser?.name + ' ' + b.createdByUser?.surname) :
                    b[sortColumn];
    
      if (sortColumn) {
        if (sortDirection === 'asc') {
          return compareValues(a[sortColumn], b[sortColumn]);
        } else {
          return compareValues(b[sortColumn], a[sortColumn]);
        }
      }
      // Default sorting by id_category
      return a.name - b.name;
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
                            {selectedItemInfo.name }
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
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

      
      <Transition.Root show={showUpdate} as={Fragment}>
        <Dialog className="relative z-50" onClose={setShowUpdate}>
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
                          {selectedUpdate.name }
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                              onClick={() => setShowUpdate(false)}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <PurchaseUpdateForm purchase={selectedUpdate} /> }</div>
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
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-8xl">
                      <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                        <div className="px-4 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              Crea un nuovo ordine di acquisto
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
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

      <div className="px-2 sm:px-1 lg:px-1 py-4">
        {/* Contenitore principale con Flexbox */}
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">Ordini di Acquisto</h1>
            <p className="mt-2 text-sm text-gray-700">Lista degli ordini di acquisto presenti a sistema</p>
          </div>

          {/* Contenitore Bottoni */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button
              onClick={() => setShowCreate(true)}

             className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
             >
              Crea
            </button>
          </div>
        </div>
      </div>


        <div className="mx-2 -my-1 overflow-x-auto sm:-mx-3 lg:-mx-4">          
          <div className="inline-block min-w-full py-1 align-middle sm:px-3 lg:px-4">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                     <br/> Codice Ordine
                      <br />
                      <input
                        value={searchQueries.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('name')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('id_company')}>
                    <br />Fornitore
                      <br />
                      <input
                        value={searchQueries.id_company}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('id_company')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('payment_method')}>
                      Metodo <br/>Pagamento
                      <br />
                      <input
                        value={searchQueries.payment_method}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('payment_method')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('total')}>
                    Importo Totale   <br /> IVA Esclusa
                     <br/>
                      <input
                        value={searchQueries.total}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('total')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('taxed_total')}>
                  Importo Totale   <br /> IVA Inclusa
                    <br />
                      <input
                        value={searchQueries.taxed_total}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('taxed_total')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('purchaserows')}>
                    <br /> Nr Righe
                    <br />
                      <input
                        value={searchQueries.purchaserows}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('purchaserows')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                 
                 
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                    <br /> Stato
                    <br />
                      <input
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('Company')}>
                    <br /> Fatturazione
                    <br />
                      <input
                        value={searchQueries.Invoices}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Invoices')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('date')}>
                    <br /> Data
                      <br />
                      <input
                        value={searchQueries.date}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('date')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="px-1 py-1.5 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    <br />  Creata  da
                      <br />
                      <input
                        value={searchQueries.createdByUser}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('createdByUser')}
                        className="mt-0.5 px-1 py-0.5 w-16 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    <th scope="col" className="relative px-1 py-1.5">
                      <span className="sr-only">Azioni</span>
                    </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedPurchase.map((item) => (
                  <tr key={item.id}>
                    <td
                      onClick={(event) => {
                        if (event.ctrlKey) {
                          handlectrlClick(item);
                        } else {
                          setShowInfo(true);
                          setSelectedItemInfo(item);
                        }
                      }}
                      className={classNames(
                        'whitespace-nowrap px-1 py-1.5 text-xs font-medium',
                        selectedItems.includes(item) ? 'text-red-600' : 'text-gray-700'
                      )}
                    >
                      {item.name}
                    </td>
                    <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-700 px-1 py-1.5 break-words">
                      {item.Company?.name}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.payment_method}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.taxed_total + ' ' + item.currency}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.total + ' ' + item.Currency?.name}
                    </td>
                  
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.purchaserows}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.status === 'In Approvazione' ? (
                        <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-yellow-500">
                          In Approvazione
                        </span>
                      ) : item.status === 'Approvato' ? (
                        <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-green-600">
                          Approvato
                        </span>
                      ) : item.status === 'Rifiutato' ? (
                        <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-red-600">
                          Rifiutato
                        </span>
                      ) : item.status === 'Revisionato' ? (
                        <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-purple-800">
                          Revisionato
                        </span>
                      ) : (
                        <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Nessuno
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                          {item?.Invoices?.length > 0 ? (
                            <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-green-500">
                              Fatturato
                            </span>
                          ) : (
                            <span className="px-1 inline-flex text-[0.6rem] leading-4 font-semibold rounded-full bg-gray-100 text-black-500">
                              Non Fatturato
                            </span>
                          )}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                   
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">
                      {item.createdByUser?.name.slice(0, 2).toUpperCase() + item.createdByUser?.surname.slice(0, 2).toUpperCase()}
                    </td>

                    <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        {true && (
                          <button
                            type="button"
                            className="inline-flex items-center rounded bg-white px-1 py-0.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={(event) => {
                              setShowUpdate(true);
                              setSelectedUpdate(item);
                            }}
                            title="Modifica"
                          >
                            <PencilSquareIcon className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
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
}