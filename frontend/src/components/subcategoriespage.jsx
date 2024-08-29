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
     <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Sotto categorie</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle sotto categorie</p>
          </div>

          {/* Bottoni Export e Create */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportSubcategories}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Crea
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
                      <br />
                      < input
                        value={searchQueries.id_subcategory}
                        onChange={handleSearchInputChange('id_subcategory')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                      Nome
                      {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      < input
                        value={searchQueries.name}
                        onChange={handleSearchInputChange('name')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                      Categoria
                      {sortColumn === 'category' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      < input
                        value={searchQueries.category}
                        onChange={handleSearchInputChange('category')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
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
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Crea una nuova Sotto categoria</Dialog.Title>
            <form onSubmit={handleSubmitNewSubcategory} className="mt-4">
              <div>
                <label htmlFor="subcategory-category" className="block text-sm font-medium text-gray-700">Categoria</label>
                <select
                  id="subcategory-category"
                  value={newSubcategory.category}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, category: e.target.value })}
                  required
                  className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                >
                  <option value="">Seleziona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id_category} value={category.id_category}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="subcategory-name" className="block text-sm font-medium text-gray-700">Nome della sottocategoria</label>
                <input
                  id="subcategory-name"
                  type="text"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                  required
                  className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Crea
              </button>
            </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>


      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Conferma della creazione</Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-700">Sicuro di voler creare questa nuova sotto categoria</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}  // Fixed here
              className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Cancella
            </button>

              <button
                onClick={submitNewSubcategory}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Conferma
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}