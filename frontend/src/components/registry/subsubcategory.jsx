import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from "react-tailwindcss-select";
import { Dialog } from '@headlessui/react';

import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import toast, { Toaster } from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SubcategoryTable() {
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('name');
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [SubSubcategoryName, setSubSubcategoryName] = useState('');
  const [SubSubcategoryCode, setSubSubcategoryCode] = useState('');
  const [SubSubcategoryID, setSubSubcategoryID] = useState('');
  
  const [deletedItem, setDeleteItem] = useState('');
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: '', subcategory: '' });
  const [searchQueries, setSearchQueries] = useState({ name: '', id_subsubcategory: '', category: '' ,subcategory: '' });

  const tableRef = useRef(null);

  useEffect(() => {
    // Fetch all subcategories
    axios
      .get(`${process.env.REACT_APP_API_URL}/subsubcategory/read`)
      .then((response) => {
        console.log('Fetched subsubcategories:', response.data.subsubcategories);
        setSubsubcategories(response.data.subsubcategories || []);
      })
      .catch((error) => {
        console.error('Error fetching subsubcategories:', error);
      });

    // Fetch all categories for dropdown
    axios
      .get(`${process.env.REACT_APP_API_URL}/subcategory/read`)
      .then((response) => {
        console.log('Fetched categories:', response.data.subcategories);
        setSubcategories(response.data.subcategories || []);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#subsubcategory-modal');
      if (modal) {
        const modalRect = modal.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${tableRect.top + window.scrollY + (tableRect.height - modalRect.height) / 2}px`;
        modal.style.left = `${tableRect.left + window.scrollX + (tableRect.width - modalRect.width) / 2}px`;
      }
    }
  }, [isModalOpen]);

  
  const handleDeleteSubcategory = () => {
    
    setIsConfirmDeleteModalOpen(false);
    try {
      const response = axios.delete(
        `${process.env.REACT_APP_API_URL}/subsubcategory/delete/${deletedItem}`
      );
  
      // Mostra una notifica di successo
      toast.success('Sottocategoria cancellata');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setSubcategories((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== deletedItem)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
    }
    
  };
  
  const confirmUpdateSubcategory = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/subsubcategory/update`, 
        { id: SubSubcategoryID, name: SubSubcategoryName, }
      )
      .then((response) => {
        setSubcategories([...subcategories, response.data.subcategories]);
        setSubSubcategoryName('');
        setUpdate(false);
        setIsConfirmModalOpen(false); // Chiude la modale di conferma
  
        // Mostra la notifica di successo
        toast.success('Sottocategoria creata con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica della sottocategoria:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica della sottocategoria fallita.');
      });
  };

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      // Toggle sorting direction or reset if already descending
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn('');
        setSortDirection('');
      } else {
        setSortDirection('asc');
      }
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

  const filteredSubcategories = subsubcategories.filter((item) => {
    return (
      (searchQueries.id_subsubcategory === '' || item.id_subsubcategory.toString().includes(searchQueries.id_subsubcategory.toString())) &&
      (searchQueries.category === '' || item.Subcategory?.Category?.name.toLowerCase().includes(searchQueries.category.toLowerCase())) && 
       (searchQueries.subcategory === '' || item.Subcategory?.name.toLowerCase().includes(searchQueries.subcategory.toLowerCase())) &&
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
      ['ID,Name,Subcategory'].concat(
        sortedSubcategories.map((subsubcategory) =>
          [subsubcategory.id_subsubcategory, subsubcategory.name, subsubcategory.category].join(',')
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
 

  const handleSubmitNewSubcategory = (event) => {
    event.preventDefault();
    setIsConfirmModalOpen(true); // Show the confirmation modal
  };
  const cancelUpdateSubcategory = () => {
    setIsConfirmUpdateModalOpen(false);
  };


  const cancelDeleteSubcategory = () => {
    setIsConfirmDeleteModalOpen(false);
  };


  const handleCreateSubcategory = () => {
    setIsConfirmModalOpen(true);
  };
  const handleUpdateSubcategory = () => {
    setIsConfirmUpdateModalOpen(true);
  };

  const submitNewSubcategory = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/subsubcategory/create`, newSubcategory)
      .then((response) => {
        // Check if response is valid
       
          setSubsubcategories([...subcategories, response.data.subsubcategory]);
          setNewSubcategory({ name: '', subcategory: '' });
          setIsModalOpen(false);
          setIsConfirmModalOpen(false); // Close confirmation modal
          toast.success('Sottocategoria creata con successo!', {});
            
      })
      .catch((error) => {
        console.error('Error creating subsubcategory:', error.response ? error.response.data : error.message);
        console.log(newSubcategory)
    
    toast.error('Errore durante la creazione della categoria!',);
  });
};

const deleteItem = async (SubSubcategoryID) => {
  setDeleteItem(SubSubcategoryID);
 setIsConfirmDeleteModalOpen(true);
 };
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <Toaster/>
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
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_subsubcategory')}>
                      <br />ID
                        {sortColumn === 'id_subsubcategory' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                      <br />
                      <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"                          type="text"
                          value={searchQueries.id_subsubcategory}
                          onChange={handleSearchInputChange('id_subsubcategory')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                      <br /> Nome
                        {sortColumn === 'name' && sortDirection !== ''? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          type="text"
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                      <th scope="col" className="px-20 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('subcategory')}>
                         <br />Categoria
                        {sortColumn === 'subcategory' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          type="text"
                          value={searchQueries.subcategory}
                          onChange={handleSearchInputChange('subcategory')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>                     
                       <th scope="col" className="px-20 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                       Macro<br />Categoria
                        {sortColumn === 'category' && sortDirection !== '' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          type="text"
                          value={searchQueries.category}
                          onChange={handleSearchInputChange('category')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                    </tr>
                    
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedSubcategories.map((subsubcategory) => (
                      <tr key={subsubcategory?.id_subsubcategory}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{subsubcategory?.id_subsubcategory}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{subsubcategory?.name}</td>
                        <td className="whitespace-nowrap px-20 py-2 text-sm text-gray-500">{subsubcategory?.Subcategory?.name}</td>
                        <td className="whitespace-nowrap px-20 py-2 text-sm text-gray-500">{subsubcategory?.Subcategory?.Category?.name}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setSubSubcategoryCode(subsubcategory?.subcategory);
                              setSubSubcategoryName(subsubcategory?.name);
                              setSubSubcategoryID(subsubcategory?.id_subsubcategory);
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
                              deleteItem(subsubcategory.id_subsubcategory);
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

        {isModalOpen && (
  <Dialog as="div" className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center" style={{ marginLeft: '15%' }}>
      <div className="flex justify-center">
        <Dialog.Panel className="mx-auto bg-white p-4 mt-3" style={{ width: '600px', maxWidth: '90%', height: '260px'}}> {/* Set custom width */}
          <Dialog.Title className="text-lg mt-2 font-bold">Crea Nuova Sotto Categoria</Dialog.Title>
          <form  className="mt-4"onSubmit={handleSubmitNewSubcategory}>
            
          <Select
            isSearchable
            isClearable
            placeholder="Seleziona una categoria"
            value={selectedSubcategory ? { label: selectedSubcategory.name, value: selectedSubcategory.id_subcategory } : null}
            options={subcategories.map(subcategory => ({ label: subcategory.name, value: subcategory.id_subcategory }))}
            onChange={(selectedOption) => {
              setNewSubcategory({ ...newSubcategory, subcategory: selectedOption.value });
              setSelectedSubcategory({ name: selectedOption.label, id_subcategory: selectedOption.value }); // Mantieni selezione
            }}
            className="mt-2"
          />

            <input
              type="text"
              placeholder="Nome Sotto Categoria"
              value={newSubcategory.name}
              onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
              className="block w-full mt-3 border border-gray-300 rounded-md shadow-sm focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
            />
            <button
              type="submit"
              className="block w-full mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4]"
            >
              Crea
            </button>
            <button
              type="submit"
              onClick={() => handleCreateSubcategory(false)}
              className="block w-full mt-4 rounded-md bg-white px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-white"
            >
              Annulla
            </button>
            
          </form>
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
)}
   
   {isConfirmModalOpen && (
          <Dialog as="div" className="relative z-10" open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
                <Dialog.Title>Conferma Creazione</Dialog.Title>
                <p>Sei sicuro di voler creare questa sotto categoria?</p>
                <div className="flex justify-end mt-4">
                  <button onClick={submitNewSubcategory} className="mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-xs font-bold text-black hover:bg-[#7fb7d4]">
                    Conferma
                  </button>
                  <button onClick={() => setIsConfirmModalOpen(false)} className="rounded-md bg-white px-2 py-1 text-xs font-bold ">
                    Annulla
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}

        


<Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica una Sottocategoria</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Sottocategoria"
                value={SubSubcategoryName}
                onChange={(e) => setSubSubcategoryName(e.target.value)}
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
                onClick={handleUpdateSubcategory}
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
                <button onClick={confirmUpdateSubcategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdateSubcategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
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
                <button onClick={handleDeleteSubcategory} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelDeleteSubcategory} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}


      
    

        
        
        
      </div>
    </>
  );
}
