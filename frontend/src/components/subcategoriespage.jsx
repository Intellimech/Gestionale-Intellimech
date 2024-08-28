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
  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_subcategory: '',
    category: ''
  });
  
  // Filter and sort invoices based on search query, selected year, and sorting
  const filteredSubcategories = subcategories.filter((item) => {
    return (
    (searchQueries.id_subcategory === '' || item.id_subcategory.toString().includes(searchQueries.id_subcategory.toString())) &&
    (searchQueries.category === '' || item.category.toString().includes(searchQueries.category.toString())) &&
    
    (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))
  );
});



  
  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

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
          <p className="mt-2 text-sm text-gray-700">Lista delle Sotto categorie</p>
        </div>


        <div className="flex flex-wrap items-center justify-between mt-4 mb-4">
          
          <div className="flex items-center space-x-4 ml-auto">
            <button
              onClick={exportSubcategories}
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


        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">          
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="relative">
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                  <thead>
                    <tr>       
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_subcategory')}>
                      ID
                      {sortColumn === 'id_subcategory' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.id_subcategory}
                        onChange={handleSearchInputChange('id_subcategory')}
                        className="mt-2 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Cerca per IDD"
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                      Name
                      {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.name}
                        onChange={handleSearchInputChange('name')}
                        className="mt-2 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Cerca per nome "
                      />
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                      Category
                      {sortColumn === 'category' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br></br>
                      <input
                        type="text"
                        value={searchQueries.category}
                        onChange={handleSearchInputChange('category')}
                        className="mt-2 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Cerca per ID categoria "
                      />
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
    </div>
      {/* Modal for Creating a New Subcategory */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div id="subcategory-modal" className="fixed inset-0 flex items-center justify-center p-4"  style={{ transform: 'translateX(10%)' }} >
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
