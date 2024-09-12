import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function invoicetable({ invoicetype }) {
  // State for managing invoices, search query, selected year, and sorting
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch invoices from the backend
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/invoice/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` }
      })
      .then((response) => {
        // Filter and sort invoices
        setInvoices(
          response.data.value
            //filter if invoicetype equal to passive show only passive invoices else show only the firt 100 invoices
            .filter((invoice) => invoice.InvoiceType === invoicetype)
            .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
            .slice(0, 100)

        );

        console.log(response.data.value
          .filter((invoice) => invoice.InvoiceType === invoicetype)
          .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        );
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, []);
 
  // Filter and sort invoices based on search query, selected year, and sorting
  const filteredInvoices = invoices.filter((item) => {
    return (
    (searchQueries.Number === '' || item.name.toLowerCase().includes(searchQueries.Number.toLowerCase())) &&
    
    (searchQueries.Company === '' || item.Company?.name.toLowerCase().includes(searchQueries.Company.toLowerCase())) &&
  
    (searchQueries.DocumentType === '' || item.DocumentType.toLowerCase().includes(searchQueries.DocumentType.toLowerCase())) &&
    (searchQueries.InvoiceType === '' || item.InvoiceType.toLowerCase().includes(searchQueries.InvoiceType.toLowerCase())) &&
    
    (searchQueries.Lines === '' || item.InvoiceLines.length.toString().includes(searchQueries.Lines.toString())) &&
    
    (searchQueries.Date=== '' || item.Date.includes(searchQueries.Date)) &&
    (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
    (searchQueries.Amount=== '' || item.Amount.toString().includes(searchQueries.Amount.toString())) 
  
  );
});

  // Function to handle year select change
  const handleYearSelectChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Function to export invoices
  const exportInvoices = () => {
    // Generate export data (for example, as a CSV string)
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Invoice ID', 'Company', 'Document Type', 'Date', 'Invoice Type', 'Amount', 'VAT', 'Fiscal Code'].join(';'),
        ...invoices.map((invoice) => [
          invoice.Number,
          invoice.Company.name,
          invoice.DocumentType,
          invoice.Date ? new Date(invoice.Date).toLocaleDateString() : '',
          invoice.InvoiceType,
          invoice.Amount,
          invoice.Company.VAT,
          invoice.Company.FiscalCode,
        ].join(';'))
      ].join('\n');
      // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'invoices.csv');
    document.body.appendChild(link);
    link.click();
  };

  const [searchQueries, setSearchQueries] = useState({
    Number: '',
    DocumentType: '',
    Company: '',
    Date: '',
    Amount: '',
    Lines: '',
    InvoiceType: ''
  });

  

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

const sortedInvoices = filteredInvoices.sort((a, b) => {
  if (!sortColumn) {
    
    return a.Number - b.Number;
  }

  if (sortDirection === 'asc') {
    return compareValues(a[sortColumn], b[sortColumn]);
  } else {
    return compareValues(b[sortColumn], a[sortColumn]);
  }
});

 

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

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };



  // Filter and sort invoices based on search query, selected year, and sorting
  // const filteredInvoices = invoices
  //   .filter((invoice) =>
  //     (selectedYear === '' ||
  //       new Date(invoice.Date).getFullYear().toString() === selectedYear) &&
  //     (invoice.Number.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       invoice.Company.name.toLowerCase().includes(searchQuery.toLowerCase()))
  //   )
  //   .sort((a, b) => {
  //     if (sortColumn !== '') {
  //       const aValue = a[sortColumn];
  //       const bValue = b[sortColumn];
  //       return sortDirection === 'asc' ? compareValues(aValue, bValue) : compareValues(bValue, aValue);
  //     }
  //     return 0;
  //   });

  return (
    
    <div className="px-4 sm:px-6 lg:px-8">


      <div className="py-4">
        {/* Contenitore principale con Flexbox */}
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Fatture {invoicetype === 'Passiva' ? 'passive' : 'attive'}</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle fatture</p>
          </div>

          {/* Bottoni Export */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportInvoices}
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
              <table className="min-w-full table-fixed divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Number')}>
                    N° Fattura
                    {sortColumn === 'Number'   && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                        onClick={(e) => e.stopPropagation()} // Stop click propagation
                      value={searchQueries.Number}
                      onChange={handleSearchInputChange('Number')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Company')}>
                    Azienda
                    {sortColumn === 'Company'  && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                        onClick={(e) => e.stopPropagation()} // Stop click propagation
                      value={searchQueries.Company}
                      onChange={handleSearchInputChange('Company')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('DocumentType')}>
                    Tipo di Documento
                    {sortColumn === 'DocumentType' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                      type="text"
                      onClick={(e) => e.stopPropagation()} // Stop click propagation
                      value={searchQueries.DocumentType}
                      onChange={handleSearchInputChange('DocumentType')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Date')}>
                    Data
                    {sortColumn === 'Date' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                      type="text"
                      value={searchQueries.Date}
                      onClick={(e) => e.stopPropagation()} // Stop click propagation
                      onChange={handleSearchInputChange('Date')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('InvoiceType')}>
                    Tipo Fattura
                    {sortColumn === 'InvoiceType' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                      type="text"
                      value={searchQueries.InvoiceType}
                      onClick={(e) => e.stopPropagation()} // Stop click propagation
                      onChange={handleSearchInputChange('InvoiceType')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Lines')}>
                    Numero Righe
                    {sortColumn === 'Lines' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                      type="text"
                      onClick={(e) => e.stopPropagation()} // Stop click propagation
                      value={searchQueries.Lines}
                      onChange={handleSearchInputChange('Lines')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1} />
                  </th>

                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Amount')}>
                    Valore
                    {sortColumn === 'Amount' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                    <br />
                     <input
                      type="text"
                      onClick={(e) => e.stopPropagation()} // Stop click propagation
                      value={searchQueries.Amount}
                      onChange={handleSearchInputChange('Amount')}
                       className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                      placeholder=""
                     rows= {1}/>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedInvoices.map((invoice) => (
                  <tr key={invoice.id_invoices}>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">{invoice.name}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">{invoice.Company.name}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">{invoice.DocumentType}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.Date ? new Date(invoice.Date).toLocaleDateString() : ''}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.InvoiceType}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.InvoiceLines.length}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.Amount + " €"}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.Status}</td>
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
