import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../module/userContext';

import PurchaseCreateForm from './purchasecreate';
import PurchaseInfo from './purchaseinfo';
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CompactPurchaseTable({ permissions }) {
  const checkbox = useRef();
  const { user } = useContext(UserContext);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [items, setItems] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [sortColumn, setSortColumn] = useState('name'); // Imposta 'name' come colonna di ordinamento predefinita
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [filterType, setFilterType] = useState('name');
  const [showInfo, setShowInfo] = useState(false);
  const [selectedItemInfo, setSelectedItemInfo] = useState({});
  const [searchQueries, setSearchQueries] = useState({
    name: '', id_company: '', category: '', subcategory: '', 
    subsubcategory: '', unit_price: '', totalprice: '', taxed_unit_price: '',
    taxed_totalprice: '', status: '', createdByUser: ''
  });

  const fetchOrders = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/purchaserow/read`)
      .then((response) => {
        setPurchaseOrder(Array.isArray(response.data.purchaserows) ? response.data.purchaserows : []);
        setItems(Array.isArray(response.data.purchaserows) ? response.data.purchaserows : []);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
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
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };
  
  const filteredPurchase = purchaseOrder.filter((item) => {
    return Object.keys(searchQueries).every(key => 
      searchQueries[key] === '' || 
      (item[key]?.toString().toLowerCase().includes(searchQueries[key].toLowerCase()) || 
       (key === 'id_company' && item.Company?.name.toLowerCase().includes(searchQueries[key].toLowerCase())) ||
       (key === 'category' && item.Category?.name.toLowerCase().includes(searchQueries[key].toLowerCase())) ||
       (key === 'subcategory' && item.Subcategory?.name.toLowerCase().includes(searchQueries[key].toLowerCase())) ||
       (key === 'subsubcategory' && item.Subsubcategory?.name.toLowerCase().includes(searchQueries[key].toLowerCase())))
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

  const sortedPurchase = filteredPurchase.sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    
    return sortDirection === 'asc' 
      ? compareValues(valueA, valueB) 
      : compareValues(valueB, valueA);
  });
  const handlectrlClick = (purchase) => {
    window.open(`/app/purchase/${purchase.id_purchase}`, '_blank'); // Apre in una nuova scheda
    
    return <PurchaseInfo purchase={purchase} />;
  };


  return (
    <div className="px-4 sm:px-6 lg:px-8">
       <div className="px-2 sm:px-1 lg:px-1 py-4">
     <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">Righe di Ordine di Acquisto</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle righe di ordine di acquisto presenti a sistema</p>
          </div>

          {/* Contenitore Bottoni */}
          <div className="flex items-center space-x-4">
            <button
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
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
                  <th scope="col" className="px- py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                  <br/><br/>Ordine
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
                  <th scope="col" className=" py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                  <br/> <br/>Descrizione
                    {sortColumn === 'description'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.description}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('description')}
                      className="mt-1 px-2 py-1 w-[180px] border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                       <th scope="col" className=" py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('quantity')}>
                       <br/> <br/>Quantità
                    {sortColumn === 'quantity' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.quantity}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('quantity')}
                       className="mt-1 px-2 py-1 w-12 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className=" py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('unit_price')}>
                  Importo<br/>Unitario <br/>IVA Esclusa
                    {sortColumn === 'unit_price' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.unit_price}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('unit_price')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className=" py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('taxed_unit_price')}>
                  Importo <br/>Unitario  <br/> IVA Inclusa
                    {sortColumn === 'taxed_unit_price'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.taxed_unit_price}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('taxed_unit_price')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
            
                  <th scope="col" className=" text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('vat')}>
                  <br/><br/> IVA
                    {sortColumn === 'vat'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.vat}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('vat')}
                       className="mt-1 px-2 py-1 w-12 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className=" py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('totalprice')}>
                  Importo<br/> Totale<br/> IVA Esclusa
                    {sortColumn === 'totalprice' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.totalprice}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('totalprice')}
                       className="mt- px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('taxed_totalprice')}>
                  Importo<br/> Totale<br/> IVA Inclusa
                    {sortColumn === 'taxed_totalprice' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.taxed_totalprice}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('taxed_totalprice')}
                       className="mt- px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                  <br/> Macro<br/>Categoria
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
                  <br/><br/>Categoria
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
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('subsubcategory')}>
                  <br/> <br/>Sottocategoria
                    {sortColumn === 'subsubcategory'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.subsubcategory}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('subsubcategory')}
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                    <br/> <br/>Stato di <br/>Fatturazione
                    {sortColumn === 'status'  && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                    <br />
                    <input
                      value={searchQueries.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleSearchInputChange('status')}
                      width="100px"
                      className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                      rows={1}
                    />        
                  </th>        
                 
                  <th scope="col" className="relative px-2 py-3.5">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>

          <tbody className="divide-y divide-gray-200 bg-white text-[10px]">
            {sortedPurchase.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                  <td
                        className={classNames(
                          'whitespace-nowrap px-1 py-1.5 text-xs font-medium',
                          selectedItems.includes(item) ? 'text-red-600' : 'text-gray-700'
                        )}
                      >
                        {item.name}
                      </td>
                <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-700 px-1 py-1.5 break-words">{item.description}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.quantity}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.unit_price}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.taxed_unit_price}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.vat}%</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.totalprice}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.taxed_totalprice}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.Category?.name}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.Subcategory?.name}</td>
                <td className="whitespace-nowrap px-1 py-1.5 text-xs text-gray-700">{item.Subsubcategory?.name}</td>
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
                    </td>              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      </div>
    </div>
  );
}