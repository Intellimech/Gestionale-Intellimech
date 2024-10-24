import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

  
export default function Company({ companytype }) {
  const [companies, setCompanies] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    Name: '',
    VAT: '',
    Code: '',
    Fiscal_Code: ''
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/company/read`)
      .then((response) => {
        setCompanies(
          response.data.value
            .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        );
      })
      .catch((error) => {
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
    const header = ['Company code', 'Name', 'VAT', 'Fiscal Code'];
    const rows = companies.map((company) => [
      company.Code,
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
  
  const filteredCompanies = companies.filter((item) => {
    return (
      (searchQueries.Code === '' || item.Code.toLowerCase().includes(searchQueries.Code.toLowerCase())) &&
      (searchQueries.Name === '' || item.name.toLowerCase().includes(searchQueries.Name.toLowerCase())) &&
      (searchQueries.Fiscal_Code === '' || item.Fiscal_Code.toLowerCase().includes(searchQueries.Fiscal_Code.toLowerCase())) &&
      (searchQueries.VAT === '' || item.VAT.toLowerCase().includes(searchQueries.VAT.toLowerCase()))
    );
  });

  
  const sortedCompanies = filteredCompanies.sort((a, b) => {
    if (!sortColumn) {
      
      return a.Code - b.Code;
    }
  
    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });

  

  return (
    <div className="px-4 sm:px-6 lg:px-8">
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

                    <th
                      scope="col"
                      className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
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
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">{company.Code}</td>
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
