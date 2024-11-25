import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'

import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes?.filter(Boolean).join(' ');
}

export default function ProjectTypeTable() {
  const [projecttypes, setProjectTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newProjectTypeName, setNewProjectTypeName] = useState('');
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  
  const [deletedItem, setDeleteItem] = useState('');
  const [update, setUpdate] = useState(false);
  const [ProjectTypeName, setProjectTypeName] = useState('');
  const [ProjectTypeCode, setProjectTypeCode] = useState('');
  const [ProjectTypeID, setProjectTypeID] = useState('');
  const [newProjectTypeCode, setNewProjectTypeCode] = useState('');
  const tableRef = useRef(null);

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_projecttype: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/projecttype/read`)
      .then((response) => {
        setProjectTypes(response.data.projectypes);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching projecttypes:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#projecttype-modal');
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

  const filteredProjectTypes = projecttypes?.filter((item) => {
    return (
      (searchQueries?.id_projecttype === '' || item.id_projecttype?.toString().includes(searchQueries?.id_projecttype?.toString())) &&
      (searchQueries?.name === '' || item.description.toLowerCase().includes(searchQueries?.name.toLowerCase())) &&
      (searchQueries?.code === '' || item.code.toLowerCase().includes(searchQueries?.code.toLowerCase()))
    );
  });

  const sortedProjectTypes = filteredProjectTypes?.sort((a, b) => {
    if (sortColumn) {
      if (sortDirection === 'asc') {
        return compareValues(a[sortColumn], b[sortColumn]);
      } else {
        return compareValues(b[sortColumn], a[sortColumn]);
      }
    }
    // Default sorting by id_projecttype
    return a.id_projecttype - b.id_projecttype;
  });

  const exportProjectTypes = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name'].concat(
        sortedProjectTypes?.map((projecttype) =>
          [projecttype?.id_projecttype, projecttype?.name].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'projecttypes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateProjectType = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmCreateProjectType = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/projecttype/create`, 
        { description: newProjectTypeName,
        code: newProjectTypeCode,
         }, 
      
      )
      .then((response) => {
        setProjectTypes([...projecttypes, response.data.projecttype]);
        setNewProjectTypeName('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        
        // Notifica di successo
        toast.success('Tipo Progetto creato con successo!',);
      })
      .catch((error) => {
        console.error('Error creating projecttype:', error);
        
        // Notifica di errore
        toast.error('Errore durante la creazione del tipo progetto!', );
      });
  };

  

  const deleteItem = async (ProjectTypeID) => {
    setDeleteItem(ProjectTypeID);
   setIsConfirmDeleteModalOpen(true);
   };
  
  const handleDeleteProjectType =  () => {
    setIsConfirmDeleteModalOpen(false);
    try {
      const response =  axios.delete(
        `${process.env.REACT_APP_API_URL}/projecttype/delete/${deletedItem}`
      );
  
      // Mostra una notifica di successo
      toast.success('Tipo progetto cancellato');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setProjectTypes((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== deletedItem)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
    }
    
  };
  
  const confirmUpdateProjectType = () => {
    setIsConfirmUpdateModalOpen(false);

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/projecttype/update`, 
        { id: ProjectTypeID, description: ProjectTypeName, code: ProjectTypeCode }
      )
      .then((response) => {
        setProjectTypes([...projecttypes, response.data.projecttypes]);
        setProjectTypeName('');
        setProjectTypeCode('');
        setUpdate(false);
  
        // Mostra la notifica di successo
        toast.success('Nuovo tipo modificato con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica del tipo progetto:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica del tipo progetto fallita.');
      });
  };
  

  const cancelCreateProjectType = () => {
    setIsConfirmModalOpen(false);
  };
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false)
  const cancelUpdateProjectType = () => {
    setIsConfirmUpdateModalOpen(false);
  };
  const handleUpdateProjectType = () => {
    setIsConfirmUpdateModalOpen(true);
  };
  const cancelDeleteProjectType = () => {
    setIsConfirmDeleteModalOpen(false);
  };


  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
      <Toaster />
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Tipo Progetti</h1>
            <p className="mt-2 text-sm text-gray-700">Lista dei tipi di progetto</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportProjectTypes}
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
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_projecttype')}>
                        ID
                        {sortColumn === 'id_projecttype' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.id_projecttype}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('id_projecttype')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('code')}>
                        Codice
                        {sortColumn === 'code' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.code}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('code')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                      <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome
                        {sortColumn === 'name' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.name}
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
                    {sortedProjectTypes?.map((projecttype) => (
                      <tr key={projecttype?.id_projecttype}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{projecttype?.id_projecttype}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{projecttype?.code}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{projecttype?.description}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setProjectTypeCode(projecttype?.code);
                              setProjectTypeName(projecttype?.description);
                              setProjectTypeID(projecttype?.id_projecttype);
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
                              deleteItem(projecttype?.id_projecttype);
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
      
<Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica un Tipo Progetto</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Tipo Progetto"
                value={ProjectTypeName}
                onChange={(e) => setProjectTypeName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice Tipo Progetto"
                value={ProjectTypeCode}
                onChange={(e) => setProjectTypeCode(e.target.value)}
                className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
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
                onClick={handleUpdateProjectType}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Modifica
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isModalOpen && (
  <Dialog id="projecttype-modal" as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md bg-white rounded shadow-lg p-6" style={{ width: '800px', height: '300px' }}>
        <Dialog.Title className="text-lg font-bold mb-4">Crea Tipo Progetto</Dialog.Title>
        <input
          type="text"
          value={newProjectTypeName}
          onChange={(e) => setNewProjectTypeName(e.target.value)}
          placeholder="Nome Tipo Progetto"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
        <input
          type="text"
          value={newProjectTypeCode}
          onChange={(e) => setNewProjectTypeCode(e.target.value)}
          placeholder="Codice"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
          <button
            onClick={handleCreateProjectType}
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


{isConfirmDeleteModalOpen && (
        <Dialog as="div" open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Eliminazione</Dialog.Title>
              <p>Sei sicuro di voler eliminare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeleteProjectType} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelDeleteProjectType} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}



 {isConfirmUpdateModalOpen && (
        <Dialog as="div" open={isConfirmUpdateModalOpen} onClose={() => setIsConfirmUpdateModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Modifica</Dialog.Title>
              <p>Sei sicuro di voler modificare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmUpdateProjectType} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdateProjectType} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
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
              <p>Sei sicuro di voler creare questo incarico?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmCreateProjectType} className="block mr-2  rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelCreateProjectType} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
}
