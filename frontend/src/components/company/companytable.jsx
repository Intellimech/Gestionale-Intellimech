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


  const handleYearSelectChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
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
  
  const [searchQueries, setSearchQueries] = useState({
    Name: '',
    VAT: '',
    Code: '',
    Fiscal_Code: ''
  });

  
  
  // Filter and sort invoices based on search query, selected year, and sorting
  const filteredCompanies = companies.filter((item) => {
    return (
    (searchQueries.Code === '' || item.Code.toLowerCase().includes(searchQueries.Code.toLowerCase())) &&
    
    (searchQueries.Name === '' || item.name.toLowerCase().includes(searchQueries.Name.toLowerCase())) &&
      
    (searchQueries.Fiscal_Code === '' || item.Fiscal_Code.toLowerCase().includes(searchQueries.Fiscal_Code.toLowerCase())) &&
    (searchQueries.VAT === '' || item.VAT.toLowerCase().includes(searchQueries.VAT.toLowerCase())) 
  );
});

  return (
    
    <div className="px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between py-4">
      {/* Titolo e descrizione */}
      <div className="flex-grow">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          {companytype === 'Suppliers' ? 'Fornitori' : 'Clienti'}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Lista dei {companytype === 'Suppliers' ? 'fornitori' : 'clienti'}
        </p>
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
  

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="relative">
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Code')}>
                      Codice
                      {sortColumn === 'Code' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.Code}
                        onChange={handleSearchInputChange('Code')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Name')}>
                      Nome
                      {sortColumn === 'Name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.Name}
                        onChange={handleSearchInputChange('Name')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('VAT')}>
                      VAT
                      {sortColumn === 'VAT' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.VAT}
                        onChange={handleSearchInputChange('VAT')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Fiscal_Code')}>
                      Codice Fiscale
                      {sortColumn === 'Fiscal_Code' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.Fiscal_Code}
                        onChange={handleSearchInputChange('Fiscal_Code')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
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
    </div>
    
  );
}