import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';

import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LocationTable() {
  const [locations, setLocations] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_location: '',
    hours: ''
  });
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    hours: 0,
    needApproval: false
  });
  
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false)
  const [update, setUpdate] = useState(false);
  const [LocationName, setLocationName] = useState('');
  const [LocationHour, setLocationHour] = useState('');
  const [LocationApproval, setLocationApproval] = useState('');
  const [LocationID, setLocationID] = useState('');
  const [deletedItem, setDeleteItem] = useState('');
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`);
        setLocations(response.data.locations || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);
  const cancelUpdateLocation = () => {
    setIsConfirmUpdateModalOpen(false);
  };

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const deleteItem = async (LocationID) => {
    setDeleteItem(LocationID);
    console.log("ho cliccato delete ", LocationID);
   setIsConfirmDeleteModalOpen(true);
   };

  const handleDeleteLocation = async (LocationID) => {
    setIsConfirmDeleteModalOpen(false);
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/locations/delete/${deletedItem}`
      );
  
      // Mostra una notifica di successo
      toast.success('Location cancellata');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setLocations((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== LocationID)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
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
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredLocations = locations.filter((item) => {
    return (
      (searchQueries.id_location === '' || item.id_location?.toString().includes(searchQueries.id_location?.toString())) &&
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase())) &&
      (searchQueries.hours === '' || item.hours.toString().includes(searchQueries.hours.toString()))
    );
  });

  const sortedLocations = filteredLocations.sort((a, b) => {
    if (sortColumn) {
      return sortDirection === 'asc' ? compareValues(a[sortColumn], b[sortColumn]) : compareValues(b[sortColumn], a[sortColumn]);
    }
    return a.id_location - b.id_location; // Default sorting by id_location
  });

  const handleCreateLocation = () => {
    setIsConfirmModalOpen(true);
  };
  const handleUpdateLocation = () => {
    setIsConfirmUpdateModalOpen(true);
  };
  const cancelDeleteLocation = () => {
    setIsConfirmDeleteModalOpen(false);
  };
  
  const cancelCreateLocation = () => {
    setIsConfirmModalOpen(false);
  };

  
  const confirmUpdateLocation = () => {
    setIsConfirmUpdateModalOpen(false);

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/locations/update`, 
        { id: LocationID, name: LocationName , hour : LocationHour, approval : LocationApproval}
      )
      .then((response) => {
        setLocations([...locations, response.data.locations]);
        setLocationName('');
        setLocationHour('');
        setLocationApproval('');
        setUpdate(false);
  
        // Mostra la notifica di successo
        toast.success('Nuova posizione modificata con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica della posizione:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica della posizione fallita.');
      });
  };

  const confirmCreateLocation = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/locations/create`,
        newLocation,
      
      );
      
      // Aggiunge la nuova location alla lista esistente
      setLocations([...locations, response.data.location]);
  
      // Resetta il form e chiude le modali
      setNewLocation({ name: '', hours: 0, needApproval: false });
      setIsModalOpen(false);
      setIsConfirmModalOpen(false);
  
      // Mostra la notifica di successo
      toast.success('Location creata con successo!');
    } catch (error) {
      console.error('Errore durante la creazione della location:', error);
  
      // Mostra la notifica di errore
      toast.error('Creazione della location fallita.');
    }
  };
  

  const handleApprovalChange = async (id, currentValue) => {
    const updatedValue = !currentValue; // Inverte il valore attuale
    try {
      // Effettua la richiesta di aggiornamento
      await axios.put(
        `${process.env.REACT_APP_API_URL}/locations/update/${id}`,
        { needApproval: updatedValue },
     
      );
  
      // Aggiorna lo stato locale
      setLocations(locations.map(location => 
        location?.id_location === id ? { ...location, needApproval: updatedValue } : location
      ));
  
      // Mostra la notifica di successo
      toast.success('Location aggiornata con successo!');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento della location:', error);
  
      // Mostra la notifica di errore
      toast.error('Aggiornamento della location fallito.');
    }
  };
  

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <Toaster/>

        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Locations</h1>
            <p className="mt-2 text-sm text-gray-700">List of all locations</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none"
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
                      <th className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_location')}>
                        ID
                        {sortColumn === 'id_location'  ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.id_location}
                          onChange={handleSearchInputChange('id_location')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome
                        {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('hours')}>
                        Ore
                        {sortColumn === 'hours'? (
                      sortDirection === 'asc' ? null : null 
                    ) : null}
                        <br />
                        <input
                          value={searchQueries.hours}
                          onChange={handleSearchInputChange('hours')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th 
                        className="px-1.5 py-3.5 text-center text-sm font-semibold text-gray-900" 
                        style={{ verticalAlign: "top" }}
                      >
                        Necessita di approvazione
                      </th>
                      
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedLocations.map((location) => (
                      <tr key={location?.id_location}>
                        <td className="whitespace-nowrap px-0 py-4 text-sm text-gray-900">{location?.id_location}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900">{location?.name}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900">{location?.hours}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900 text-center">
                          <input
                            type="checkbox"
                            checked={location?.needApproval}
                            onChange={() => handleApprovalChange(location?.id_location, location?.needApproval)}
                          />
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setLocationName(location?.name);
                              setLocationHour(location?.hours);
                              setLocationApproval(location?.needApproval);
                              setLocationID(location?.id_location);
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
                              deleteItem(location?.id_location);
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

      {/* Modal for creating a new location */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 z-10 bg-black opacity-30" aria-hidden="true" />
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
            <Dialog.Title className="text-lg font-medium">Crea una nuova posizione</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              
            </Dialog.Description>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Ore</label>
              <input
                type="number"
                value={newLocation.hours}
                onChange={(e) => setNewLocation({ ...newLocation, hours: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLocation.needApproval}
                  onChange={(e) => setNewLocation({ ...newLocation, needApproval: e.target.checked })}
                  className="h-4 w-4 text-[#7fb7d4] border-gray-300 rounded focus:ring-[#7fb7d4]"
                />
                <span className="ml-2 text-sm">Necessita Approvazione</span>
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateLocation}
                className="w-full rounded-md bg-[#7fb7d4] px-4 py-2 text-white font-semibold hover:bg-[#5e9fbd]"
              >
                Crea
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>


      {/* Confirm modal for creating a new location */}
      <Dialog open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="fixed inset-0 z-10 bg-black opacity-30" aria-hidden="true" />
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
            <Dialog.Title className="text-lg font-medium">Conferma</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Sei sicuro di voler creare una nuova posizione?
            </Dialog.Description>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                 Annulla
              </button>
              <button
                onClick={confirmCreateLocation}
                className="rounded-md bg-[#7fb7d4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5e9fbd]"
              >
                Conferma
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica Incarico</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome Posione"
                value={LocationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Ore</label>
              <input
                type="number"
                value={LocationHour}
                onChange={(e) => setLocationHour(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                value={LocationApproval}
                onChange={(e) => setLocationApproval(e.target.value)}
                  className="h-4 w-4 text-[#7fb7d4] border-gray-300 rounded focus:ring-[#7fb7d4]"
                />
                <span className="ml-2 text-sm">Necessita Approvazione</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
           
              <button
                onClick={() => setUpdate(false)}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={handleUpdateLocation}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Modifica
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      

      {isConfirmDeleteModalOpen && (
        <Dialog as="div" open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Eliminazione</Dialog.Title>
              <p>Sei sicuro di voler eliminare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeleteLocation} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelDeleteLocation} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
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
                <button onClick={confirmUpdateLocation} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdateLocation} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      
    </>
  );
}
