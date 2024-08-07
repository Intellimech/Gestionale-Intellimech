import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Company({ companytype }) {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('Code');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/company/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
        params: { filter: companytype }
      })
      .then((response) => {
        console.log('response', response);
        setCompanies(
          response.data.value
            .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        );
      })
      .catch((error) => {
        console.log('error', error);
      });
  }, [companytype]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleYearSelectChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const exportInvoices = () => {
    // Define CSV header based on companytype
    const header = [
      'Company code',
      'Name',
      'VAT',
      'Fiscal Code'
    ];

    // Generate CSV rows
    const rows = companies.map((company) => [
      company.Code,
      company.name,
      company.VAT,
      company.Fiscal_Code
    ]);

    // Convert header and rows to CSV string
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        header.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

    // Create a link and trigger download
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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
    const sortedCompanies = [...companies].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[columnName] > b[columnName] ? 1 : -1;
      } else {
        return a[columnName] < b[columnName] ? 1 : -1;
      }
    });
    setCompanies(sortedCompanies);
  };

  const filteredCompanies = companies.filter((company) => {
    if (!filterValue) return true;
    const value = company[filterType]?.toString().toLowerCase() || '';
    return value.includes(filterValue.toLowerCase());
  });

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {companytype === 'Suppliers' ? 'Fornitori' : 'Clienti'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista dei {companytype === 'Suppliers' ? 'fornitori' : 'clienti'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-4 mb-4">
          <div className="flex items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-32 px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="Code">Code</option>
              <option value="name">Name</option>
              <option value="VAT">VAT</option>
              <option value="Fiscal_Code">Fiscal Code</option>
            </select>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder={`Cerca per ${filterType === 'Code' ? 'codice' : filterType === 'name' ? 'nome' : filterType.toLowerCase().replace('_', ' ')}`}
              className="block w-48 px-4 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportInvoices}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Export
            </button>
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
                      onClick={() => handleSort('Code')}
                    >
                      Company code{' '}
                      {sortColumn === 'Code' && (
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
                      onClick={() => handleSort('name')}
                    >
                      Name{' '}
                      {sortColumn === 'name' && (
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
                      onClick={() => handleSort('VAT')}
                    >
                      VAT{' '}
                      {sortColumn === 'VAT' && (
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
                      onClick={() => handleSort('Fiscal_Code')}
                    >
                      Fiscal Code{' '}
                      {sortColumn === 'Fiscal_Code' && (
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
                  {filteredCompanies.map((company) => (
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
    </>
  );
}
