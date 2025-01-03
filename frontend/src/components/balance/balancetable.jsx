import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from '../../module/userContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [Contract, setContract] = useState([]);
  const [items, setItems] = useState([]);
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
    payment_method: '',
    total: '',
    IVA: '',
    status: '',
    createdByUser: ''
  });

  const handlectrlClick = (contract) => {
    window.open(`/app/contract/${contract.id_contract}`, '_blank'); // Apre in una nuova scheda
    
    return <ContractInfo contract={contract} />;
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
      .get(`${process.env.REACT_APP_API_URL}/contract/read`, )
      .then((response) => {
        setContract(Array.isArray(response.data.contracts) ? response.data.contracts : []);
        setItems(Array.isArray(response.data.contracts) ? response.data.contracts : []);
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
  
  
  const filteredcontract = Contract.filter((item) => {
    return (
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
      (searchQueries.id_company === '' || item.Company?.name.toLowerCase().includes(searchQueries.id_company.toLowerCase())) &&
      (searchQueries.category === '' || item.category?.name.toLowerCase().includes(searchQueries.category.toLowerCase())) &&
      (searchQueries.subcategory === '' || item.subcategory?.name.toLowerCase().includes(searchQueries.subcategory.toLowerCase())) &&
      (searchQueries.payment_method === '' || item.payment_method.toLowerCase().includes(searchQueries.payment_method.toLowerCase())) &&
      (searchQueries.total === '' || item.total.toString().includes(searchQueries.total)) &&
      (searchQueries.IVA === '' || item.IVA.toLowerCase().includes(searchQueries.IVA.toLowerCase())) &&
      (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
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

  const sortedcontract = filteredcontract.sort((a, b) => {
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
     

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Contenitore principale con Flexbox */}
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">Contratti</h1>
            <p className="mt-2 text-sm text-gray-700">Lista dei Contratti presenti a sistema</p>
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


      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                    Ordine
                    {sortColumn === 'name' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('name')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_company')}>
                    Cliente
                    {sortColumn === 'id_company'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.id_company}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('id_company')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                    Data di Inizio
                    {sortColumn === 'category'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.category}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('category')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('subcategory')}>
                    Data di Fine
                    {sortColumn === 'subcategory'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.subcategory}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('subcategory')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('payment_method')}>
                    Metodo di Pagamento
                    {sortColumn === 'payment_method' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.payment_method}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('payment_method')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('total')}>
                    Totale
                    {sortColumn === 'total'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.total}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('total')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('IVA')}>
                    IVA
                    {sortColumn === 'IVA' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.IVA}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('IVA')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                    Stato
                    {sortColumn === 'status'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('status')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    Creata da
                    {sortColumn === 'createdByUser'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.createdByUser}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('createdByUser')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="relative px-3 py-3.5">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedcontract.map((item) => (
                    <tr key={item.id}>
                      <td
                     onClick={(event) => {
                      // ctrl + click per aprire un nuovo tab
                      if (event.ctrlKey) {
                        handlectrlClick(item);
                      } else {
                        setShowInfo(true);
                        setSelectedItemInfo(item); // Mostra il form nella stessa finestra
                      }}  
                    }
                        className={classNames(
                          'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                          selectedItems.includes(item) ? 'text-red-600' : 'text-gray-700'
                        )}
                      >
                        {item.name}
                      </td>
                      <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-700 px-3 py-4 break-words">
                          {item.Company?.name}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-700 px-3 py-4 break-words">
                          {item.contract_start_date}
                        </td>
                        <td className="whitespace-normal max-w-[200px] overflow-hidden text-sm text-gray-700 px-3 py-4 break-words">
                          {item.contract_end_date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {item.payment_method}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {item.total + ' ' + item.currency}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {item.IVA + ' %'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {item.status === 'In Approvazione' ? (
                            
                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-yellow-500">
                             In Approvazione
                           </span>
                          ) : item.status === 'Approvato' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100  text-green-600">
                              Approvato
                            </span>
                          ) : item.status === 'Rifiutato' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100  text-red-600">
                              Rifiutato
                            </span>
                          ): item.status === 'Scaduto' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100  text-zinc-800">
                              Scaduto
                            </span>
                          // ) : item.status === 'Nuovo' ? (
                          //   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100   text-blue-800">
                          //     Nuovo
                          //   </span>
                          ) : item.status === 'Revisionato' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100   text-purple-800">
                              Revisionato
                            </span> //solo se è stato approvato
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100   text-gray-800">
                              Nessuno
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                          {item.createdByUser?.name.slice(0, 2).toUpperCase() + item.createdByUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}