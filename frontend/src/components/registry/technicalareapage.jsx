import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';

import toast, { Toaster } from 'react-hot-toast';
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TechnicalAreaTable() {
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newTechnicalAreaName, setNewTechnicalAreaName] = useState('');
  const [newTechnicalAreaCode, setNewTechnicalAreaCode] = useState('');
  const [TechnicalAreaID, setTechnicalAreaID] = useState('');
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false);
  const [TechnicalAreaName, setTechnicalAreaName] = useState('');
  const [TechnicalAreaCode, setTechnicalAreaCode] = useState('');
  const [selected, setSelected] = useState({});
  const tableRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/technicalarea/read`)
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

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    code:'',
    id_technicalarea: ''
  });

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredTechnicalAreas = technicalAreas.filter((item) => {
    return (
      (searchQueries.code === '' || item.code.toLowerCase().includes(searchQueries.code.toLowerCase())) &&
      (searchQueries.id_technicalarea === '' || item.id_technicalarea.toString().includes(searchQueries.id_technicalarea.toString())) &&
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))
    );
  });

  const deleteItem = async (technicalAreaId) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/technicalarea/delete/${technicalAreaId}`
      );
  
      // Mostra una notifica di successo
      toast.success('Technical Area deleted successfully');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setTechnicalAreas((prevAreas) =>
        prevAreas.filter((area) => area.id !== technicalAreaId)
      );
    } catch (error) {
      console.error('Error deleting Technical Area:', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Failed to delete Technical Area.');
    }
    navigate('/technicalarea');
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


  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn('');
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const sortedTechnicalAreas = filteredTechnicalAreas.sort((a, b) => {
    if (!sortColumn) {
      
      return a.id_technicalarea - b.id_technicalarea;
    }

    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });

  const cancelUpdateTechnicalArea = () => {
    setIsConfirmUpdateModalOpen(false);
  };

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
  const handleUpdateTechnicalArea = () => {
    setIsConfirmUpdateModalOpen(true);
  };
    
  const confirmCreateTechnicalArea = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/technicalarea/create`, 
        { name: newTechnicalAreaName, code: newTechnicalAreaCode }
      )
      .then((response) => {
        setTechnicalAreas([...technicalAreas, response.data.technicalarea]);
        setNewTechnicalAreaName('');
        setNewTechnicalAreaCode('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false); // Chiude la modale di conferma
  
        // Mostra la notifica di successo
        toast.success('Area tecnica creata con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la creazione dell\'area tecnica:', error);
        
        // Mostra la notifica di errore
        toast.error('Creazione dell\'area tecnica fallita.');
      });
  };

  const confirmUpdateTechnicalArea = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/technicalarea/update`, 
        { id: TechnicalAreaID, name: TechnicalAreaName, code: TechnicalAreaCode }
      )
      .then((response) => {
        setTechnicalAreas([...technicalAreas, response.data.technicalarea]);
        setTechnicalAreaName('');
        setTechnicalAreaCode('');
        setUpdate(false);
        setIsConfirmModalOpen(false); // Chiude la modale di conferma
  
        // Mostra la notifica di successo
        toast.success('Area tecnica creata con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la creazione dell\'area tecnica:', error);
        
        // Mostra la notifica di errore
        toast.error('Creazione dell\'area tecnica fallita.');
      });
  };
  

  const cancelCreateTechnicalArea = () => {
    setIsConfirmModalOpen(false); // Close the confirmation modal
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <Toaster/>
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Aree Tecniche</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle aree tecniche</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportTechnicalAreas}
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
                      <th
                        scope="col"
                        className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('id_technicalarea');
                        }}
                      >
                        ID
                        {sortColumn === 'id_technicalarea' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.id_technicalarea}
                          onChange={handleSearchInputChange('id_technicalarea')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('name');
                        }}
                      >
                        Nome
                        {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('code');
                        }}
                      >
                        Codice
                        {sortColumn === 'code' ? (
                      sortDirection === 'asc' ? null : null // Non renderizzare nulla
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.code}
                          onChange={handleSearchInputChange('code')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedTechnicalAreas.map((technicalArea) => (
                    <tr key={technicalArea.id_technicalarea}>
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 w-20">{technicalArea?.id_technicalarea}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea?.name}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea?.code}</td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setTechnicalAreaCode(technicalArea.code);
                              setTechnicalAreaName(technicalArea.name);
                              setTechnicalAreaID(technicalArea.id_technicalarea);
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
                              deleteItem(technicalArea.id_technicalarea);
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

      {/* Create Technical Area Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Crea una nuova Area Tecnica</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Area Tecnica"
                value={newTechnicalAreaName}
                onChange={(e) => setNewTechnicalAreaName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice Area Tecnica"
                value={newTechnicalAreaCode}
                onChange={(e) => setNewTechnicalAreaCode(e.target.value)}
                className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
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
                onClick={handleCreateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Crea
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>


          <Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica una nuova Area Tecnica</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Area Tecnica"
                value={TechnicalAreaName}
                onChange={(e) => setTechnicalAreaName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice Area Tecnica"
                value={TechnicalAreaCode}
                onChange={(e) => setTechnicalAreaCode(e.target.value)}
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
                onClick={handleUpdateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Crea
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
                <button onClick={confirmUpdateTechnicalArea} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdateTechnicalArea} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}



      {/* Confirm Creation Modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Conferma di creazione</Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-700">Sicuro di voler creare questa nuova area tecnica?</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
             
              <button
                onClick={cancelCreateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={confirmCreateTechnicalArea}
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
