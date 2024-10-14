import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import DatePicker from 'react-datepicker';
import Cookies from 'js-cookie';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HolidayCreateForm() {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isForAllUsers, setIsForAllUsers] = useState(false);

  const handleMorningLocationChange = (selected) => {
    setMorningLocation(selected);
  };

  const handleAfternoonLocationChange = (selected) => {
    setAfternoonLocation(selected);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const handleUserChange = (selected) => {
    setSelectedUser(selected);
  };

  const handleIsForAllUsersChange = (e) => {
    setIsForAllUsers(e.target.checked);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`);
        const formattedLocations = response.data.locations.map(location => ({
          value: location.id_location,
          label: location.name
        }));
        setLocations(formattedLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`);
        const formattedUsers = response.data.users.map(user => ({
          value: user.id_user,
          label: `${user.name} ${user.surname}`
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchLocations();
    fetchUsers();
  }, []);

  const notifySuccess = () => toast.success('Inserimento avvenuto con successo!');
  const notifyError = () => toast.error('Errore nell\'inserimento!');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !selectedUser || !morningLocation || !afternoonLocation) {
      notifyError('Tutti i campi sono obbligatori!');
      return;
    }
    const handleFormSubmit = (e) => {
      e.preventDefault();
    
      // Controllo dei campi obbligatori
      if (!startDate || !morningLocation || !afternoonLocation) {
        notifyError('Tutti i campi sono obbligatori!');
        return;
      }
    
      // Verifica che l'utente selezionato non sia null
      if (!selectedUser) {
        notifyError('Seleziona un utente!');
        return;
      }
    
      const createEntry = (part, location) => {
        const payload = {
          startDate: startDate.toISOString().split('T')[0], // solo la parte della data
          endDate: endDate ? endDate.toISOString().split('T')[0] : null,
          period: part,
          location: location.value,
          owner: selectedUser.value,  // Assicurati che selectedUser sia corretto
          status: 'Approvato'
        };
    
        console.log('Request Payload:', payload);
    
        return axios.post(`${process.env.REACT_APP_API_URL}/calendar/create`, payload);
      };
    
      const submitEntries = () => {
        const morningPromise = createEntry('morning', morningLocation);
        const afternoonPromise = createEntry('afternoon', afternoonLocation);
    
        Promise.all([morningPromise, afternoonPromise])
          .then((responses) => {
            console.log('Entries created:', responses);
            notifySuccess();  // Notifica di successo
          })
          .catch((error) => {
            console.error('Error creating entries:', error);
            notifyError();  // Notifica di errore
          });
      };
    
      submitEntries();
    };
  }
  return (
    <form onSubmit={handleFormSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Nuova Posizione</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Aggiungendo una posizione, verrà visualizzata nel calendario.
          </p>
  
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="user" className="block text-sm font-medium leading-6 text-gray-900">
                Utente
              </label>
              <div className="mt-2">
                <Select
                  value={selectedUser}
                  onChange={handleUserChange}
                  options={users}
                  primaryColor={'[#7fb7d4]'}
                  placeholder="Seleziona un utente"
                  isDisabled={isForAllUsers} // Disable user selection if for all users
                />
              </div>
            </div>
  
            <div className="sm:col-span-4">
              <label htmlFor="dateRange" className="block text-sm font-medium leading-6 text-gray-900">
                Data
              </label>
              <div className="mt-2">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  dateFormat="dd/MM/yyyy"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  placeholderText={`Seleziona una data`}
                  minDate={new Date()}
                />
              </div>
            </div>
  
            <div className="sm:col-span-4">
              <label htmlFor="morningLocation" className="block text-sm font-medium leading-6 text-gray-900">
                Mattina
              </label>
              <div className="mt-2">
                <Select
                  value={morningLocation}
                  onChange={handleMorningLocationChange}
                  options={locations}
                  primaryColor={'[#7fb7d4]'}
                  placeholder="Seleziona una posizione"
                />
              </div>
            </div>
  
            <div className="sm:col-span-4">
              <label htmlFor="afternoonLocation" className="block text-sm font-medium leading-6 text-gray-900">
                Pomeriggio
              </label>
              <div className="mt-2">
                <Select
                  value={afternoonLocation}
                  onChange={handleAfternoonLocationChange}
                  options={locations}
                  primaryColor={'[#7fb7d4]'}
                  placeholder="Seleziona una posizione"
                />
              </div>
            </div>
  
            <div className="sm:col-span-4">
              <label htmlFor="isForAllUsers" className="block text-sm font-medium leading-6 text-gray-900">
                Per tutti gli utenti
              </label>
              <div className="mt-2">
                <input
                  type="checkbox"
                  id="isForAllUsers"
                  checked={isForAllUsers}
                  onChange={handleIsForAllUsersChange}
                  className="h-4 w-4 text-[#7fb7d4] border-gray-300 rounded focus:ring-[#7fb7d4]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-gray-200 focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Annulla
        </button>
        <button
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Salva
        </button>
      </div>
  
      <ToastContainer />
    </form>
  );
}