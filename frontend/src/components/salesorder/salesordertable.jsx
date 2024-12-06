import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import SalesOrderInfo from './salesorderinfo';
import { PaperClipIcon } from '@heroicons/react/20/solid';


function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example({ permissions }) {
  const checkbox = useRef();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState({});
  const [salesorders, setSalesOrder] = useState([]);
  const [selectedSaleOrder, setSelectedSaleOrder] = useState([]);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(false);
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setselectedStatus] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterType, setFilterType] = useState('name');

  const [showInfo, setShowInfo] = useState(false);
  const statusOptions = ['Da fatturare', 'Fatturata', 'Nessuna'];

  useEffect(() => {
    const isIndeterminate = selectedOffer?.length > 0 && selectedOffer?.length < salesorders.length;
    setChecked(selectedOffer?.length === salesorders.length);
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
      // Se la colonna è già ordinata in modo ascendente, passa a discendente
      // Se è discendente, torna all'ordinamento predefinito (non ordinato)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(''); // Resetta la colonna di ordinamento per tornare all'ordinamento predefinito
        setSortDirection('asc');
      }
    } else {
      // Se la colonna non è quella corrente, imposta l'ordinamento ascendente
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
    (searchQueries.description=== '' || item.Offer?.QuotationRequest.description.toLowerCase().includes(searchQueries.description.toLowerCase())) &&
    (searchQueries.Company === '' || item.Offer?.QuotationRequest.Company?.name.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
  
   
    (searchQueries.offer === '' || item.Offer?.name.toLowerCase().includes(searchQueries.offer.toLowerCase())) &&
    (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&

    (searchQueries.createdByUser === '' || (item.createdByUser?.name + ' ' + item.createdByUser?.surname).toLowerCase().includes(searchQueries.createdByUser.toLowerCase()))
  );
});

    
  const handlectrlClick = (salesorder) => {
    window.open(`/app/sales-order/${salesorder.id_salesorder}`, '_blank'); // Apre in una nuova scheda
    return <SalesOrderInfo salesorder = {salesorder}/>;
  };
  
  
const sortedSaleOrder = filteredSaleOrder.sort((a, b) => {
  if (!sortColumn) {
    return 0; // Nessun ordinamento
  }
  const getValue = (item, column) => {
    switch (column) {
      case 'Company':
        return item.Offer?.QuotationRequest.Company.name || '';
      case 'description':
        return item.Offer?.QuotationRequest.description || '';
      case 'offer':
        return item.Offer?.name || '';
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
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
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
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
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
      },
    })
      .then(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read`, {
          headers: {
            'Content-Type': 'application/json',
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
  
 function handleClick(salesorder) {
  // Access the ID directly from the salesorder object
  let id = salesorder.id_salesorder;

  // Log the ID for debugging purposes
  console.log("ID Sales Order: " + id); // Log the ID

  // Set the ID in state (this will be just the number, e.g., 1)
  setSelectedSaleOrder(salesorder);
  setId(id);

  // Show additional information
  setShowInfo(true);
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
                          Informazioni Ordine di Acquisto
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                            onClick={() => setShowInfo(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <SalesOrderInfo salesOrder={selectedSaleOrder} />
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
   
        <div className="px-2 sm:px-6 lg:px-2 py-4">
          {/* Contenitore principale con Flexbox */}
          <div className="flex items-left justify-between">
            {/* Titolo e descrizione */}
            <div className="sm:flex-auto text-left">
              <h1 className="text-base text-left font-semibold leading-6 text-gray-900">Ordini di vendita</h1>
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




        <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="relative">
            {/* Updated table style */}
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead>
                  <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer"  onClick={() => handleSort('name')}>
                      Ordine
                      {sortColumn === 'name'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('name')}
                     className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer ellipsis" onClick={() => handleSort('Company')}>
                      Cliente
                      {sortColumn === 'Company' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="input"
                        value={searchQueries.Company}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Company')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}

                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('offer')}>
                      Offerta
                      {sortColumn === 'offer' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.offer}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('offer')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                      </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                      Descrizione
                      {sortColumn === 'description'? (
                        sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.description}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('description')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer"  onClick={() => handleSort('status')}>
                      Ore Stimate <br/> in Offerta 
                      {sortColumn === 'status' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                     <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('description')}>
                      Valore in Offerta
                      {sortColumn === 'description'? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.description}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('description')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer"  onClick={() => handleSort('status')}>
                      Tipo Cliente
                      {sortColumn === 'status' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                       className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                      Tipo Progetto
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                      Area Tecnica
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                      Data Inizio Stimata <br /> in Offerta
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('status')}>
                      Data Fine Stimata <br /> in Offerta
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? null : null // Non renderizzare nulla
                      ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('status')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                      Stato
                      {sortColumn === 'createdByUser' ?  (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.createdByUser}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('createdByUser')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
                        placeholder=""
                        rows= {1}
                      />
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-900 cursor-pointer" onClick={() => handleSort('createdByUser')}>
                      Project Leader
                      {sortColumn === 'createdByUser' ?  (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.createdByUser}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('createdByUser')}
                        className="mt-1 px-1 py-0.5 w-16 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] text-xs"
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
                      onClick={(event) => {
                        // ctrl + click per aprire un nuovo tab
                        if (event.ctrlKey) {
                          handlectrlClick(salesorder);
                        } else {
                          console.log("Ecco: "+ salesorder)
                          handleClick(salesorder); // Mostra il form nella stessa finestra
                        }
                      }}
                    >
                      <td className="whitespace-normal overflow-hidden font-medium text-xs text-gray-900 px-2 py-2 break-words">
                        {salesorder.name}
                      </td>
                      <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        {salesorder.Offer?.QuotationRequest.Company.name}
                      </td>
                      <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        <a href={`/offer/${salesorder.Offer?.id_offer}`} className="truncate">{salesorder.Offer?.name}</a>
                      </td>
                      
                      <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        <span className="truncate">{salesorder.Offer.QuotationRequest.description.split(" ").slice(0, 4).join(" ") + (salesorder.Offer.QuotationRequest.description.split(" ")?.length > 2 ? "..." : "")}</span>
                      </td>                       
                        <td className="whitespace-normal text-right max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words pr-6">
                         {`${salesorder.Offer.hour} h`}
                        </td>
                        <td className="whitespace-normal text-right max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words pr-6">
                        {`${Number(salesorder.Offer.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}     
                        </td>
                        <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                          {salesorder.Offer?.QuotationRequest?.companytype? salesorder.Offer.QuotationRequest?.companytype : 'EST'}
                        </td>
                        <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        {salesorder.Offer.QuotationRequest?.ProjectType?.code}
                        </td>
                        <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                         {salesorder.Offer?.QuotationRequest?.TechnicalArea?.code}
                        </td>
                        <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                         {salesorder.Offer.estimatedstart ? new Date(salesorder.Offer.estimatedstart).toLocaleDateString() : ''}
                        </td>
                        <td className="whitespace-normal max-w-[150px] overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        {salesorder.Offer.estimatedend ? new Date(salesorder.Offer.estimatedend).toLocaleDateString() : ''}
                        </td>
                      <td className="whitespace-normal overflow-hidden text-xs text-gray-500 px-2 py-2 break-words">
                        {salesorder.status === 'Da Fatturare' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-yellow-600">
                            Da fatturare
                          </span>
                        ) : salesorder.status === 'Fatturata' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-green-800">
                            Fatturata
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Nessuno
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-xs text-gray-500 text-left">
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
