import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function CalendarUpdateForm({ open, setOpen, date, initialData }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [morningId, setMorningId] = useState(null);
  const [afternoonId, setAfternoonId] = useState(null);
  const [dataSelezionata, setDataSelezionata] = useState(null);
  const [users, setUsers] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  
  const formRef = useRef(null); // Riferimento al form

  useEffect(() => {
    if (initialData) {
      const dataP = initialData.split(',');
      setDataSelezionata(dataP[1]);
      const dataParts = dataP[2].split(';');
      dataParts.forEach((part) => {
        const [period, location, id] = part.split(':');
        if (period === 'morning') {
          setMorningLocation(location ? { value: location, label: location } : null);
          setMorningId(id);
        } else if (period === 'afternoon') {
          setAfternoonLocation(location ? { value: location, label: location } : null);
          setAfternoonId(id);
        }
      });
    }
  }, [initialData]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      console.error('No authorization token found');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`);
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchCalendarData();
    fetchUsers();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read`);
      setCalendarData(Array.isArray(response.data.calendars) ? response.data.calendars : []);
      console.log('Fetched Calendar Data:', response.data.calendars);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const handleMorningLocationChange = (selectedOption) => {
    setMorningLocation(selectedOption);
  };

  const handleAfternoonLocationChange = (selectedOption) => {
    setAfternoonLocation(selectedOption);
  };

  const handleFormSubmit = () => {
    const morningLocationValue = morningLocation ? morningLocation.value : initialData.morningLocation;
    const afternoonLocationValue = afternoonLocation ? afternoonLocation.value : initialData.afternoonLocation;

    if (morningLocationValue !== initialData.morningLocation || afternoonLocationValue !== initialData.afternoonLocation) {
      axios.post('http://localhost:3000/calendar/update', {
          morning_id: morningId,
          afternoon_id: afternoonId,
          date: dataSelezionata,
          morning_location: morningLocationValue,
          afternoon_location: afternoonLocationValue,
        }, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        // Gestisci la risposta se necessario
      })
      .catch((error) => {
        console.error('Error updating locations:', error);
      });
    }

    setOpen(false);
  };

  const Locations = [
    { value: 'Ufficio', label: 'Ufficio' },
    { value: 'Trasferta', label: 'Trasferta' },
    { value: 'Malattia', label: 'Malattia' },
    { value: 'Permesso', label: 'Permesso' },
    { value: 'Ferie', label: 'Ferie' },
    { value: 'SmartWorking', label: 'SmartWorking' },
    { value: 'Fuori Ufficio', label: 'Fuori Ufficio' },
    { value: 'Non Lavorativo', label: 'Non Lavorativo' },
  ];

  const formContainerStyle = {
    position: 'fixed',
    right: open ? '0' : '-100%',
    top: '0',
    height: '100vh',
    width: '550px',
    transform: 'translateY(0)',
    transition: 'right 0.3s ease-in-out',
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const handleClickOutside = (event) => {
    if (formRef.current && !formRef.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    open ? (
      <div style={formContainerStyle} ref={formRef}>
        <form>
          <div className="space-y-12 p-4">
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">Aggiorna Posizione</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Aggiornando la posizione, verrà visualizzata nel calendario.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                    Data
                  </label>
                  <div className="mt-2">
                    <input
                      id="date"
                      name="date"
                      type="text"
                      readOnly
                      value={date}
                      className="block w-full rounded-md border-gray-300 bg-gray-100 text-gray-900 shadow-sm sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="morningLocation" className="block text-sm font-medium leading-6 text-gray-900">
                    Mattina
                  </label>
                  <div className="mt-2">
                    <Select
                      id="morningLocation"
                      name="morningLocation"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                      value={morningLocation}
                      onChange={handleMorningLocationChange}
                      options={Locations}
                      primaryColor="#7fb7d4"
                      isSearchable
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="afternoonLocation" className="block text-sm font-medium leading-6 text-gray-900">
                    Pomeriggio
                  </label>
                  <div className="mt-2">
                    <Select
                      id="afternoonLocation"
                      name="afternoonLocation"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                      value={afternoonLocation}
                      onChange={handleAfternoonLocationChange}
                      options={Locations}
                      primaryColor="#7fb7d4"
                      isSearchable
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-gray-200 focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="block rounded-md bg-[#A7D0EB] px-2 mr-6 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Salva
            </button>
          </div>
        </form>
        <div className="mt-8 px-4">
          <h3 className="text-lg font-semibold">Utenti e Disponibilità</h3>
          <table className="min-w-full divide-y mt-4 divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Mattina</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Pomeriggio</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => {
                  const userEntries = calendarData.filter((entry) => entry.owner === user.id_user);
                  
                  let morningLocation = 'Non disponibile';
                  let afternoonLocation = 'Non disponibile';

                  userEntries.forEach((entry) => {
                    console.log(`Entry found for ${user.name}:`, entry);
                    if (entry.period === 'morning') {
                      morningLocation = 
                        ['Ufficio', 'Fuori Ufficio', 'SmartWorking'].includes(entry.location) 
                          ? entry.location 
                          : 'Non disponibile';
                    } else if (entry.period === 'afternoon') {
                      afternoonLocation = 
                        ['Ufficio', 'Fuori Ufficio', 'SmartWorking'].includes(entry.location) 
                          ? entry.location 
                          : 'Non disponibile';
                    }
                  });

                  return (
                    <tr key={user.id_user}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{morningLocation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{afternoonLocation}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    Nessun utente trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ) : null
  );
}
