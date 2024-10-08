import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from "react-tailwindcss-select";
import { Dialog } from '@headlessui/react';
import { ToastContainer } from 'react-toastify';
import toast, { Toaster } from 'react-hot-toast';

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: '', category: '' });
  const [searchQueries, setSearchQueries] = useState({ name: '', id_subcategory: '', category: '' });

  const tableRef = useRef(null);

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

  // axios
  // .post(`${process.env.REACT_APP_API_URL}/category/create`, 
  //   { name: newCategoryName }, 
  //   { headers: { authorization: `Bearer ${Cookies.get('token')}` } }
  // )
  // .then((response) => {
  //   setCategories([...categories, response.data.category]);
  //   setNewCategoryName('');
  //   setIsModalOpen(false);
  //   setIsConfirmModalOpen(false);
    
  //   // Notifica di successo
  //   toast.success('Categoria creata con successo!', {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // })
  // .catch((error) => {
  //   console.error('Error creating category:', error);
    
  //   // Notifica di errore
  //   toast.error('Errore durante la creazione della categoria!', {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // });

  const submitNewSubcategory = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/subcategory/create`, newSubcategory, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        // Check if response is valid
       
          setSubcategories([...subcategories, response.data.subcategory]);
          setNewSubcategory({ name: '', category: '' });
          setIsModalOpen(false);
          setIsConfirmModalOpen(false); // Close confirmation modal
          toast.success('Categoria creata con successo!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            
      })
      .catch((error) => {
        console.error('Error creating subcategory:', error.response ? error.response.data : error.message);
    
    toast.error('Errore durante la creazione della categoria!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  });
};

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <ToastContainer/>
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
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_subcategory')}>
                        ID
                        {sortColumn === 'id_subcategory' && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                      <br />
                      <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"                          type="text"
                          value={searchQueries.id_subcategory}
                          onChange={handleSearchInputChange('id_subcategory')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome
                        {sortColumn === 'name' && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
                        <br />
                        <input
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          type="text"
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </th>
                      <th scope="col" className="px-20 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('category')}>
                        Categoria
                        {sortColumn === 'category' && sortDirection !== '' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />) : null}
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
                    {sortedSubcategories.map((subcategory) => (
                      <tr key={subcategory.id_subcategory}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{subcategory.id_subcategory}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{subcategory.name}</td>
                        <td className="whitespace-nowrap px-20 py-2 text-sm text-gray-500">{subcategory.category}</td>
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
              placeholder="Select Category"
              value={selectedCategory.name}
              options={categories.map(category => ({ label: category.name, value: category.id_category }))}
              onChange={(value) => setNewSubcategory({ ...newSubcategory, category: value.value })}
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
              onClick={() => setIsModalOpen(false)}
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


        {/* Modal di conferma */}
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
      </div>
    </>
  );
}
