import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';

import { ToastContainer } from 'react-toastify';
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
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    hours: 0,
    needApproval: false
  });
  const tableRef = useRef(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`, {
          headers: { authorization: `Bearer ${Cookies.get('token')}` },
        });
        setLocations(response.data.locations || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

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

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredLocations = locations.filter((item) => {
    return (
      (searchQueries.id_location === '' || item.id_location.toString().includes(searchQueries.id_location.toString())) &&
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

  const confirmCreateLocation = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/locations/create`,
        newLocation,
        { headers: { authorization: `Bearer ${Cookies.get('token')}` } }
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
        { headers: { authorization: `Bearer ${Cookies.get('token')}` } }
      );
  
      // Aggiorna lo stato locale
      setLocations(locations.map(location => 
        location.id_location === id ? { ...location, needApproval: updatedValue } : location
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
              Create Location
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
                        {sortColumn === 'id_location' && (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />)}
                        <br />
                        <input
                          value={searchQueries.id_location}
                          onChange={handleSearchInputChange('id_location')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Name
                        {sortColumn === 'name' && (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />)}
                        <br />
                        <input
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('hours')}>
                        Hours
                        {sortColumn === 'hours' && (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : <ArrowDownIcon className="h-5 w-5 inline ml-2" />)}
                        <br />
                        <input
                          value={searchQueries.hours}
                          onChange={handleSearchInputChange('hours')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                      <th className="px-1.5 py-3.5 text-center  text-sm font-semibold text-gray-900">
                        Need Approval
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedLocations.map((location) => (
                      <tr key={location.id_location}>
                        <td className="whitespace-nowrap px-0 py-4 text-sm text-gray-900">{location.id_location}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900">{location.name}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900">{location.hours}</td>
                        <td className="whitespace-nowrap px-1.5 py-4 text-sm text-gray-900 text-center">
                          <input
                            type="checkbox"
                            checked={location.needApproval}
                            onChange={() => handleApprovalChange(location.id_location, location.needApproval)}
                          />
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
            <Dialog.Title className="text-lg font-medium">Create New Location</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Fill in the details for the new location.
            </Dialog.Description>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Hours</label>
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
                <span className="ml-2 text-sm">Need Approval</span>
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateLocation}
                className="w-full rounded-md bg-[#7fb7d4] px-4 py-2 text-white font-semibold hover:bg-[#5e9fbd]"
              >
                Create
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
            <Dialog.Title className="text-lg font-medium">Confirm Creation</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Are you sure you want to create this location?
            </Dialog.Description>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateLocation}
                className="rounded-md bg-[#7fb7d4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5e9fbd]"
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
