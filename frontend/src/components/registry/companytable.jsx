
import CustomersCreate from './customercreate'

import { Fragment, useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CheckIcon, ArrowRightStartOnRectangleIcon, UsersIcon, EnvelopeOpenIcon, CursorArrowRaysIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import CompanyInfo from './companyinfo'
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

  
export default function Company({ companytype }) {
  const [companies, setCompanies] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    Name: '',
    type: '',
    VAT: '',
    Code: '',
    Fiscal_Code: ''
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  
  const [showInfo, setShowInfo] = useState(false);
  const [selectedCompanyInfo, setSelectedCompanyInfo] = useState({});
  const [open, setOpen] = useState(false); 
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/company/read`)
      .then((response) => {
        console.log(response.data); // Log per verificare la struttura dei dati ricevuti
        setCompanies(
          response.data.value
            .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        );
      })
      .catch((error) => {
        console.error('Error fetching companies:', error);
      });
  }, [companytype]);
  
// Function to compare values of different types
  const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      // Handle comparison for other types (e.g., dates)
      return a < b ? -1 : a > b ? 1 : 0;
    }
  }; 
  const handleYearSelectChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const exportInvoices = () => {
    const header = ['Company code', 'type','Name', 'VAT', 'Fiscal Code'];
    const rows = companies.map((company) => [
      company.Code,
      company.type,
      company.name,
      company.VAT,
      company.Fiscal_Code
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [header.join(','), ...rows.map(row => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'companies.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn('');
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  const handleCreateCompany = () =>{

  }
  
  const filteredCompanies = companies.filter((item) => {
    return (
      (searchQueries.Code === '' || item.Code.toLowerCase().includes(searchQueries.Code.toLowerCase())) &&
      (searchQueries.type === '' || item?.ClientType?.code.toLowerCase().includes(searchQueries.type.toLowerCase())) &&
      (searchQueries.Name === '' || item.name.toLowerCase().includes(searchQueries.Name.toLowerCase())) &&
      (searchQueries.Fiscal_Code === '' || item.Fiscal_Code.toLowerCase().includes(searchQueries.Fiscal_Code.toLowerCase())) &&
      (searchQueries.VAT === '' || item.VAT.toLowerCase().includes(searchQueries.VAT.toLowerCase()))
    );
  });

  
  const sortedCompanies = filteredCompanies.sort((a, b) => {
    if (!sortColumn) {
      return a.Code - b.Code;
    }
  
    if (sortColumn === 'type' && companytype === 'Customers') {
      const aType = a.ClientType?.code || ''; // Assegna una stringa vuota se a.ClientType?.code è undefined
      const bType = b.ClientType?.code || ''; // Assegna una stringa vuota se b.ClientType?.code è undefined
      if (sortDirection === 'asc') {
        return compareValues(aType, bType);
      } else {
        return compareValues(bType, aType);
      }
    } else if (sortColumn === 'Name') {
      if (sortDirection === 'asc') {
        return compareValues(a.name, b.name);
      } else {
        return compareValues(b.name, a.name);
      }
    } else {
      if (sortDirection === 'asc') {
        return compareValues(a[sortColumn], b[sortColumn]);
      } else {
        return compareValues(b[sortColumn], a[sortColumn]);
      }
    }
  });
  
  
  const handlectrlClick = (company) => {
    console.log("ho cliccato "+ company.id_company)
    window.open(`/app/quotation-request/${company.id_company}`, '_blank'); // Apre in una nuova scheda
    
  };
  

  return (
    <div className="px-4 sm:px-6 lg:px-8">
        <Toaster
        position="bottom-right"
        reverseOrder={false}
        
      />
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
                            {selectedCompanyInfo?.name}
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
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{ <CompanyInfo company={selectedCompanyInfo} /> }</div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="flex items-center justify-between py-4">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {companytype === 'Suppliers' ? 'Fornitori' : 'Clienti'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista dei {companytype === 'Suppliers' ? 'fornitori' : 'clienti'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={exportInvoices}
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
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

      {/* Modal for Creating a New Company */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Crea un nuovo Cliente
                          </Dialog.Title>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => setOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">{<CustomersCreate />}</div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('Code')}
                    >
                      Codice
                      {sortColumn === 'Code' && sortDirection && (
                        sortDirection === 'asc' ? 
                          <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : 
                          <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                      )}
                      <br />
                      <input
                        value={searchQueries.Code}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Code')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                    {companytype === 'Customers' && (
                    <th
                      scope="col"
                      className="px-2 py-4.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      Tipo Cliente
                      {sortColumn === 'type' && sortDirection && (
                        sortDirection === 'asc' ? 
                          <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : 
                          <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                      )}
                      <br />
                      <input
                        value={searchQueries.type}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('type')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                  )}


                    <th
                      scope="col"
                      className="px-1.5 py-4.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('Name')}
                    >
                      Nome
                      {sortColumn === 'Name' && sortDirection && (
                        sortDirection === 'asc' ? 
                          <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : 
                          <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                      )}
                      <br />
                      <input
                        value={searchQueries.Name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Name')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th
                      scope="col"
                      className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('VAT')}
                    >
                      VAT
                      {sortColumn === 'VAT' && sortDirection && (
                        sortDirection === 'asc' ? 
                          <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : 
                          <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                      )}
                      <br />
                      <input
                        value={searchQueries.VAT}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('VAT')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th
                      scope="col"
                      className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('Fiscal_Code')}
                    >
                      Codice Fiscale
                      {sortColumn === 'Fiscal_Code' && sortDirection && (
                        sortDirection === 'asc' ? 
                          <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : 
                          <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                      )}
                      <br />
                      <input
                        value={searchQueries.Fiscal_Code}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Fiscal_Code')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedCompanies.map((company) => (
                    <tr key={company.id_invoices}>
                      
                      {companytype === 'Customers' && (
                        <td
                        onClick={(event) => {
                          // ctrl + click per aprire un nuovo tab
                          if (event.ctrlKey) {
                            handlectrlClick(company);
                          } else {
                            setShowInfo(true);
                            setSelectedCompanyInfo(company);
                            console.log(company);// Mostra il form nella stessa finestra
                          }
                        }}
                          className={classNames(
                            'whitespace-nowrap px-3 py-4 pr-3 text-sm font-medium',
                            companies?.includes(company) ? 'text-gray-900' : 'text-gray-900'
                          )}
                        >
                           {company?.Code}
                        </td>
                      )}
                     
                     <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{company?.ClientType?.code}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{company.name}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{company.VAT}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{company.Fiscal_Code}</td>
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
