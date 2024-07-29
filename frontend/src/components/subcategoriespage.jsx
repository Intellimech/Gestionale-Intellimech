import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SubcategoryTable() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Added state
  const [newSubcategory, setNewSubcategory] = useState({ name: '', category: '' });

  const tableRef = useRef(null); // Reference for the table div

  useEffect(() => {
    // Fetch all subcategories
    axios
      .get(`${process.env.REACT_APP_API_URL}/subcategory/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        console.log('Fetched subcategories:', response.data.subcategories);
        setSubcategories(response.data.subcategories || []);
      })
      .catch((error) => {
        console.error('Error fetching subcategories:', error);
      });

    // Fetch all categories for dropdown
    axios
      .get(`${process.env.REACT_APP_API_URL}/category/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        console.log('Fetched categories:', response.data.categories);
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#subcategory-modal');
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

  const filteredSubcategories = subcategories.filter((subcategory) => {
    if (!subcategory) return false; // Check if subcategory is defined

    if (filterType === 'name') {
      return subcategory.name && subcategory.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (filterType === 'category') {
      return subcategory.category && subcategory.category.toString() === selectedCategory;
    } else if (filterType === 'id') {
      return subcategory.id_subcategory && subcategory.id_subcategory.toString().includes(searchQuery);
    }
    return false;
  });

  const sortedSubcategories = filteredSubcategories.sort((a, b) => {
    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });

  const exportSubcategories = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Category'].concat(
        sortedSubcategories.map((subcategory) =>
          [subcategory.id_subcategory, subcategory.name, subcategory.category].join(',')
        )
      ).join('\n');

    // Initiate download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'subcategories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSubcategory = () => {
    setIsModalOpen(true); // Show the creation modal
  };

  const handleSubmitNewSubcategory = (event) => {
    event.preventDefault();
    setIsConfirmModalOpen(true); // Show the confirmation modal
  };

  const submitNewSubcategory = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/subcategory/create`, newSubcategory, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        // Check if response is valid
        if (response.data && response.data.subcategory) {
          setSubcategories([...subcategories, response.data.subcategory]);
          setNewSubcategory({ name: '', category: '' });
          setIsModalOpen(false);
          setIsConfirmModalOpen(false); // Close confirmation modal
        } else {
          console.error('Unexpected response format:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error creating subcategory:', error.response ? error.response.data : error.message);
      });
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Sotto Categorie</h1>
          <p className="mt-2 text-sm text-gray-700">Lista delle sotto categorie</p>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-4 mb-4">
          <div className="flex items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-32 px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="id">ID</option>
            </select>
            {filterType === 'category' ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-48 px-4 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id_category} value={category.id_category}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={`Cerca per ${filterType === 'name' ? 'Nome' : filterType === 'id' ? 'ID' : 'Category'}`}
                className="block w-48 px-4 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportSubcategories}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Export
            </button>
            <button
              onClick={handleCreateSubcategory}
              className="block rounded-md bg-red-600 px-3 py-1.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Create
            </button>
          </div>
        </div>
        <div className="flow-root">
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div ref={tableRef} className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 cursor-pointer w-20"
                      onClick={() => handleSort('id_subcategory')}
                    >
                      ID{' '}
                      {sortColumn === 'id_subcategory' && (
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
                      onClick={() => handleSort('category')}
                    >
                      Category{' '}
                      {sortColumn === 'category' && (
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
                  {sortedSubcategories.map((subcategory) => (
                    <tr key={subcategory.id_subcategory}>
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 w-20">{subcategory.id_subcategory}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{subcategory.name}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{subcategory.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating a New Subcategory */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div id="subcategory-modal" className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Dialog.Panel className="max-w-sm p-6 bg-white rounded shadow-md">
              <Dialog.Title className="text-lg font-semibold">Create New Subcategory</Dialog.Title>
              <form onSubmit={handleSubmitNewSubcategory}>
                <div className="mt-4">
                  <label htmlFor="subcategory-category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="subcategory-category"
                    value={newSubcategory.category}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, category: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id_category} value={category.id_category}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <label htmlFor="subcategory-name" className="block text-sm font-medium text-gray-700">Subcategory Name</label>
                  <input
                    id="subcategory-name"
                    type="text"
                    value={newSubcategory.name}
                    onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
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
              <Dialog.Title className="text-lg font-semibold">Confirm Creation</Dialog.Title>
              <p className="mt-2 text-sm text-gray-500">Are you sure you want to create this subcategory?</p>
              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitNewSubcategory}
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
