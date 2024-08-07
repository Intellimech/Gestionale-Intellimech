import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TechnicalAreaTable() {
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newTechnicalAreaName, setNewTechnicalAreaName] = useState('');
  const [newTechnicalAreaCode, setNewTechnicalAreaCode] = useState('');
  const tableRef = useRef(null); // Reference for the table div

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        console.log('Fetched technical areas:', response.data.technicalareas);
        setTechnicalAreas(response.data.technicalareas || []);
      })
      .catch((error) => {
        console.error('Error fetching technical areas:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#technical-area-modal');
      if (modal) {
        const modalRect = modal.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${tableRect.top + window.scrollY + (tableRect.height - modalRect.height) / 2}px`;
        modal.style.left = `${tableRect.left + window.scrollX + (tableRect.width - modalRect.width) / 2}px`;
      }
    }
  }, [isModalOpen]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
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

  const filteredTechnicalAreas = technicalAreas.filter((technicalArea) => {
    const searchQueryLower = searchQuery.toLowerCase();
    const technicalAreaId = technicalArea.id_technicalarea ? technicalArea.id_technicalarea.toString() : '';
    
    if (filterType === 'name') {
      return technicalArea.name.toLowerCase().includes(searchQueryLower);
    } else if (filterType === 'id_technicalarea') {
      return technicalAreaId.includes(searchQueryLower);
    } else if (filterType === 'code') {
      return technicalArea.code.toLowerCase().includes(searchQueryLower);
    }
    return false;
  });

  const sortedTechnicalAreas = filteredTechnicalAreas.sort((a, b) => {
    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });

  const exportTechnicalAreas = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Code'].concat(
        sortedTechnicalAreas.map((technicalArea) =>
          [technicalArea.id_technicalarea, technicalArea.name, technicalArea.code].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'technical_areas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTechnicalArea = () => {
    setIsConfirmModalOpen(true); // Show the confirmation modal
  };

  const confirmCreateTechnicalArea = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/technicalarea/create`, 
      { name: newTechnicalAreaName, code: newTechnicalAreaCode }, 
      { headers: { authorization: `Bearer ${Cookies.get('token')}` } })
      .then((response) => {
        setTechnicalAreas([...technicalAreas, response.data.technicalarea]);
        setNewTechnicalAreaName('');
        setNewTechnicalAreaCode('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false); // Close the confirmation modal
      })
      .catch((error) => {
        console.error('Error creating technical area:', error);
      });
  };

  const cancelCreateTechnicalArea = () => {
    setIsConfirmModalOpen(false); // Close the confirmation modal
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Technical Areas</h1>
          <p className="mt-2 text-sm text-gray-700">List of technical areas</p>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-4 mb-4">
          <div className="flex items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-32 px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="name">Name</option>
              <option value="id_technicalarea">ID</option>
              <option value="code">Code</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder={`Search by ${filterType === 'name' ? 'Name' : filterType === 'id_technicalarea' ? 'ID' : 'Code'}`}
              className="block w-48 px-4 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportTechnicalAreas}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Create
            </button>
          </div>
        </div>
        <div className="flow-root" ref={tableRef}>
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 cursor-pointer w-20"
                      onClick={() => handleSort('id_technicalarea')}
                    >
                      ID{' '}
                      {sortColumn === 'id_technicalarea' && (
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
                      className="whitespace-nowrap px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer w-64"
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
                      className="whitespace-nowrap px-2 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer w-64"
                      onClick={() => handleSort('code')}
                    >
                      Code{' '}
                      {sortColumn === 'code' && (
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
                  {sortedTechnicalAreas.map((technicalArea) => (
                    <tr key={technicalArea.id_technicalarea}>
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 w-20">{technicalArea.id_technicalarea}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea.name}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea.code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating a New Technical Area */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div id="technical-area-modal" className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Dialog.Panel className="max-w-sm p-6 bg-white rounded shadow-md">
              <Dialog.Title className="text-lg font-semibold">Create New Technical Area</Dialog.Title>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateTechnicalArea();
              }}>
                <div className="mt-4">
                  <label htmlFor="technical-area-name" className="block text-sm font-medium text-gray-700">Technical Area Name</label>
                  <input
                    id="technical-area-name"
                    type="text"
                    value={newTechnicalAreaName}
                    onChange={(e) => setNewTechnicalAreaName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div className="mt-4">
                  <label htmlFor="technical-area-code" className="block text-sm font-medium text-gray-700">Technical Area Code</label>
                  <input
                    id="technical-area-code"
                    type="text"
                    value={newTechnicalAreaCode}
                    onChange={(e) => setNewTechnicalAreaCode(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Create
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Dialog.Panel className="max-w-sm p-6 bg-white rounded shadow-md">
              <Dialog.Title className="text-lg font-semibold">Confirm Action</Dialog.Title>
              <p className="mt-2 text-sm text-gray-500">Are you sure you want to create this technical area?</p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={cancelCreateTechnicalArea}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmCreateTechnicalArea}
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Confirm
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
