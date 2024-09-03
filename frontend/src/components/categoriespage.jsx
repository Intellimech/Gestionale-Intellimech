import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const tableRef = useRef(null); // Reference for the table div

  useEffect(() => {
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
      const modal = document.querySelector('#category-modal');
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
   id_category: ''
  });

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };
  
  // Filter and sort invoices based on search query, selected year, and sorting
  const filteredCategories = categories.filter((item) => {
    return (
    (searchQueries.id_category === '' || item.id_category.toString().includes(searchQueries.id_category.toString())) &&
    
    (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))
  );
});

  const sortedCategories = filteredCategories.sort((a, b) => {
    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });
  
  

  const exportCategories = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name'].concat(
        sortedCategories.map((category) =>
          [category.id_category, category.name].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateCategory = () => {
    setIsConfirmModalOpen(true); // Show the confirmation modal
  };

  const confirmCreateCategory = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/category/create`, 
      { name: newCategoryName }, 
      { headers: { authorization: `Bearer ${Cookies.get('token')}` } })
      .then((response) => {
        setCategories([...categories, response.data.category]);
        setNewCategoryName('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false); // Close the confirmation modal
      })
      .catch((error) => {
        console.error('Error creating category:', error);
      });
  };

  const cancelCreateCategory = () => {
    setIsConfirmModalOpen(false); // Close the confirmation modal
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Categorie</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle categorie</p>
          </div>

          {/* Bottoni Export e Create */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportCategories}
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
                    <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_category')}>
                      ID
                      {sortColumn === 'id_category' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.id_category}
                        onChange={handleSearchInputChange('id_category')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>

                    <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                      Name
                      {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                        value={searchQueries.name}
                        onChange={handleSearchInputChange('name')}
                        className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                        placeholder=""
                        rows={1}
                      />
                    </th>
                  </tr>
                </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedCategories.map((category) => (
                      <tr key={category.id_category}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 w-20">{category.id_category}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{category.name}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
      {/* Modal for Creating a New Category */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Crea una nuova Categoria</Dialog.Title>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateCategory();
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <input
                id="category-name"
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
              >
                Cancella
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-[#7fb7d4] px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-[#7fb7d4] hover:bg-[#6aaedb] focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
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
            <Dialog.Title className="text-lg font-semibold text-gray-900">Conferma di creazione</Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-700">Sicuro di voler creare questa nuova categoria?</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelCreateCategory}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={confirmCreateCategory}
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