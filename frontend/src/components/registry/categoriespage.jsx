import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import 'react-toastify/dist/ReactToastify.css';
import toast, { Toaster } from 'react-hot-toast';

import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [CategoryName, setCategoryName] = useState('');
  const [CategoryCode, setCategoryCode] = useState('');
  const [CategoryID, setCategoryID] = useState('');
  const [deletedItem, setDeleteItem] = useState('');
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const tableRef = useRef(null);

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_category: ''
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/category/read`)
      .then((response) => {
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
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Reset to default
        setSortColumn('');
        setSortDirection('asc');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  
  const confirmUpdateCategory = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/category/update`, 
        { id: CategoryID, name: CategoryName}
      )
      .then((response) => {
        setCategories([...categories, response.data.categories]);
        setCategoryName('');
        setCategoryCode('');
        setUpdate(false);
        setIsConfirmModalOpen(false); // Chiude la modale di conferma
  
        // Mostra la notifica di successo
        toast.success('Categoria modificata con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica della categoria:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica della categoria fallita.');
      });
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

  const handleSearchInputChange = (column) => (event) => {
    event.stopPropagation(); // Prevent click propagation to handleSort
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredCategories = categories.filter((item) => {
    return (
      (searchQueries.id_category === '' || item.id_category?.toString().includes(searchQueries.id_category?.toString())) &&
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))
    );
  });

  const sortedCategories = filteredCategories.sort((a, b) => {
    if (sortColumn) {
      if (sortDirection === 'asc') {
        return compareValues(a[sortColumn], b[sortColumn]);
      } else {
        return compareValues(b[sortColumn], a[sortColumn]);
      }
    }
    // Default sorting by id_category
    return a.id_category - b.id_category;
  });

  const exportCategories = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name'].concat(
        sortedCategories.map((category) =>
          [category?.id_category, category?.name].join(',')
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
    setIsConfirmModalOpen(true);
  };
  const handleUpdateCategory = () => {
    setIsConfirmUpdateModalOpen(true);
  };

  const handleDeleteCategory =  ()=> {
    try {
      const response = axios.delete(
        `${process.env.REACT_APP_API_URL}/category/delete/${deletedItem}`
      );
  
      // Mostra una notifica di successo
      toast.success('Categoria cancellata');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setCategories((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== deletedItem)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
    }
    setIsConfirmDeleteModalOpen(false);
  }
  
    
  const deleteItem = async (CategoryID) => {
   setDeleteItem(CategoryID);
  setIsConfirmDeleteModalOpen(true);
  };

  const confirmCreateCategory = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/category/create`, 
        { name: newCategoryName }, 
      
      )
      .then((response) => {
        setCategories([...categories, response.data.category]);
        setNewCategoryName('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        
        // Notifica di successo
        toast.success('Categoria creata con successo!', );
      })
      .catch((error) => {
        console.error('Error creating category:', error);
        
        // Notifica di errore
        toast.error('Errore durante la creazione della categoria!', );
      });
  };
  

  const cancelCreateCategory = () => {
    setIsConfirmModalOpen(false);
  };

  const cancelUpdateCategory = () => {
    setIsConfirmUpdateModalOpen(false);
  };

  const cancelDeleteCategory = () => {
    setIsConfirmDeleteModalOpen(false);
  };


  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
      <Toaster />
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Categorie</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle categorie</p>
          </div>
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
                        {sortColumn === 'id_category' && sortDirection !== ''? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.id_category}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('id_category')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                      <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome
                        {sortColumn === 'name' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.name}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedCategories.map((category) => (
                      <tr key={category?.id_category}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{category?.id_category}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{category?.name}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setCategoryName(category?.name);
                              setCategoryID(category?.id_category);
                            }}
                          >
            
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                         
                          
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-2 pl-3 pr-4 text-left text-sm font-medium sm:pr-3">
                        <div className="flex items-right space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-right rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              deleteItem(category?.id_category);
                            }}
                          >
            
                            <TrashIcon className="h-5 w-4 text-gray-500" />
                          </button>
                         
                          
                        </div>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
  <Dialog id="category-modal" as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md bg-white rounded shadow-lg p-6" style={{ width: '600px', height: '240px' }}>
        <Dialog.Title className="text-lg font-bold mb-4">Crea Categoria</Dialog.Title>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nome Categoria"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
          <button
            onClick={handleCreateCategory}
            className="block w-full mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4]"
            >
            Crea
          </button>
          <button
              type="submit"
              onClick={() => setIsModalOpen(false)}
              className="block w-full mt-4 rounded-md bg-white px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-white"
            >
              Annulla
            </button>
      </Dialog.Panel>
    </div>
  </Dialog>
)}

<Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica una Categoria</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Categoria"
                value={CategoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
             
            </div>
            <div className="mt-6 flex justify-end space-x-3">
           
              <button
                onClick={() => setUpdate(false)}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={handleUpdateCategory}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Modifica
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      

      {isConfirmUpdateModalOpen && (
        <Dialog as="div" open={isConfirmUpdateModalOpen} onClose={() => setIsConfirmUpdateModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Modifica</Dialog.Title>
              <p>Sei sicuro di voler modificare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmUpdateCategory} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdateCategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      

{isConfirmDeleteModalOpen && (
        <Dialog as="div" open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Eliminazione</Dialog.Title>
              <p>Sei sicuro di voler eliminare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeleteCategory} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelDeleteCategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}



      {isConfirmModalOpen && (
        <Dialog as="div" open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Creazione</Dialog.Title>
              <p>Sei sicuro di voler creare questa categoria?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmCreateCategory} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelCreateCategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
}
