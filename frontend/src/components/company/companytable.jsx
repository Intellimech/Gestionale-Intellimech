import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { Fragment, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function company({ companytype }) {
  // State for managing companies, search query, selected year, and sorting
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch companies from the backend
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/company/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
        params: { filter: companytype }
      })
      .then((response) => {
        // Filter and sort companies
        console.log('response', response);
        setCompanies(
          response.data.value
            .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        );
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, []);

  // Function to handle search query change
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Function to handle year select change
  const handleYearSelectChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Function to export companies
  const exportInvoices = () => {
    // Generate export data (for example, as a CSV string)
        // const csvContent =
        //   'data:text/csv;charset=utf-8,' +
        //   [
        //     ['Invoice ID', 'Company', 'Document Type', 'Date', 'Invoice Type', 'Amount', 'VAT', 'Fiscal Code'].join(';'),
        //     ...companies.map((invoice) => [
        //       invoice.Number,
        //       invoice.Company.name,
        //       invoice.DocumentType,
        //       invoice.Date ? new Date(invoice.Date).toLocaleDateString() : '',
        //       invoice.InvoiceType,
        //       invoice.Amount,
        //       invoice.Company.VAT,
        //       invoice.Company.FiscalCode,
        //     ].join(';'))
        //   ].join('\n');
        //   // Initiate download
        // const encodedUri = encodeURI(csvContent);
        // const link = document.createElement('a');
        // link.setAttribute('href', encodedUri);
        // link.setAttribute('download', 'companies.csv');
        // document.body.appendChild(link);
        // link.click();
  };

  // Function to sort companies by column
  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

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

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Fatture</h1>
          <p className="mt-2 text-sm text-gray-700">Lista delle fatture</p>
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
              value={selectedYear}
              onChange={handleYearSelectChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {/* get the year from companies */}
              {companies.map((invoice) => new Date(invoice.ReceptionDate).getFullYear().toString()).filter((value, index, self) => self.indexOf(value) === index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="px-4">
              <button
                onClick={exportInvoices}
                className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="flow-root">
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 cursor-pointer"
                      onClick={() => handleSort('Number')}
                    >
                      Company code{' '}
                      {sortColumn === 'Number' && (
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
                      className="whitespace-nowrap px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('DocumentType')}
                    >
                      VAT{' '}
                      {sortColumn === 'DocumentType' && (
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
                      className="whitespace-nowrap px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('Date')}
                    >
                      Fiscal Code{' '}
                      {sortColumn === 'Date' && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 inline" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 inline" />
                          )}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {companies.map((invoice) => (
                    <tr key={invoice.id_invoices}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">{invoice.Code}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.name}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.VAT}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{invoice.Fiscal_Code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
