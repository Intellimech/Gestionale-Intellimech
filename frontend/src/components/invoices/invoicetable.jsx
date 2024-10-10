import React, { useState, useEffect } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import Cookies from 'js-cookie';
import axios from 'axios';

export default function InvoiceTable({ invoicetype }) {
  const [invoices, setInvoices] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    Number: '',
    DocumentType: '',
    Company: '',
    Date: '',
    Amount: '',
    Lines: '',
    InvoiceType: '',
    status: ''
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/invoice/read`);
      const filteredInvoices = response.data.value
        .filter((invoice) => invoice.InvoiceType === invoicetype)
        .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
        .slice(0, 100);
      setInvoices(filteredInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const filteredInvoices = invoices.filter((item) => {
    const lowercaseQuery = (query) => query.toLowerCase();
    const includesQuery = (field, query) => field && field.toString().toLowerCase().includes(lowercaseQuery(query));

    return (
      (searchQueries.Number === '' || includesQuery(item.name, searchQueries.Number)) &&
      (searchQueries.Company === '' || includesQuery(item.Company?.name, searchQueries.Company)) &&
      (searchQueries.DocumentType === '' || includesQuery(item.DocumentType, searchQueries.DocumentType)) &&
      (searchQueries.InvoiceType === '' || includesQuery(item.InvoiceType, searchQueries.InvoiceType)) &&
      (searchQueries.Lines === '' || item.InvoiceLines.length.toString() === searchQueries.Lines) &&
      (searchQueries.Date === '' || (item.Date && new Date(item.Date).toISOString().split('T')[0].includes(searchQueries.Date))) &&
      (searchQueries.status === '' || includesQuery(item.status, searchQueries.status)) &&
      (searchQueries.Amount === '' || item.Amount.toString() === searchQueries.Amount)
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

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const exportInvoices = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['Invoice ID', 'Company', 'Document Type', 'Date', 'Invoice Type', 'Amount', 'VAT', 'Fiscal Code'].join(';'),
        ...sortedInvoices.map((invoice) => [
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
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'invoices.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="py-4">
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Fatture {invoicetype === 'Passiva' ? 'passive' : 'attive'}</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle fatture</p>
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
                      {sortColumn === 'Number' && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        onClick={(e) => e.stopPropagation()}
                        value={searchQueries.Number}
                        onChange={handleSearchInputChange('Number')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Company')}>
                      Azienda
                      {sortColumn === 'Company' && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        onClick={(e) => e.stopPropagation()}
                        value={searchQueries.Company}
                        onChange={handleSearchInputChange('Company')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('DocumentType')}>
                      Tipo di Documento
                      {sortColumn === 'DocumentType' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                        value={searchQueries.DocumentType}
                        onChange={handleSearchInputChange('DocumentType')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Date')}>
                      Data
                      {sortColumn === 'Date' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        type="text"
                        value={searchQueries.Date}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('Date')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('InvoiceType')}>
                      Tipo Fattura
                      {sortColumn === 'InvoiceType' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        type="text"
                        value={searchQueries.InvoiceType}
                        onClick={(e) => e.stopPropagation()}
                        onChange={handleSearchInputChange('InvoiceType')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Lines')}>
                      Numero Righe
                      {sortColumn === 'Lines' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                        value={searchQueries.Lines}
                        onChange={handleSearchInputChange('Lines')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Amount')}>
                      Valore
                      {sortColumn === 'Amount' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                        value={searchQueries.Amount}
                        onChange={handleSearchInputChange('Amount')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                      />
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