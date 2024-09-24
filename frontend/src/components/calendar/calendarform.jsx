import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import DatePicker from 'react-datepicker';
import Cookies from 'js-cookie';
import 'react-datepicker/dist/react-datepicker.css';

const Locations = [
  { value: 'Ferie', label: 'Ferie' },
  { value: 'Permesso', label: 'Permesso' },
  { value: 'Malattia', label: 'Malattia' },
  { value: 'Ufficio', label: 'Ufficio' },
  { value: 'Trasferta', label: 'Trasferta' },
  { value: 'SmartWorking', label: 'SmartWorking' },
  { value: 'Fuori Ufficio', label: 'Fuori Ufficio' },
  { value: 'Non Lavorativo', label: 'Non Lavorativo' },
];

export default function Example({ date, setOpen }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [startDate, setStartDate] = useState(date ? new Date(date) : null);
  const [endDate, setEndDate] = useState(null);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [allCalendarData, setAllCalendarData] = useState([]);

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

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      console.error('No authorization token found');
      return;
    }

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setLocations(response.data.locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.users);
        console.log('Fetched Users:', response.data.users); // Log users fetched
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchAllCalendarData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read/all`, {
          headers: { authorization: `Bearer ${token}` },
        });
        setAllCalendarData(Array.isArray(response.data.calendars) ? response.data.calendars : []);
        console.log('Fetched All Calendar Data:', response.data.calendars); // Log all calendar data fetched
      } catch (error) {
        console.error('Error fetching all calendar data:', error);
      }
    };

    fetchLocations();
    fetchUsers();
    fetchAllCalendarData();
  }, []);

  const isFormValid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 7); // Fine della prossima settimana
  
    // Controllo per posizioni speciali
    const isSpecialLocation = (location) => ['Ferie', 'Permesso', 'Trasferta'].includes(location?.value);
  
    // Se la data di inizio è dopo la fine della prossima settimana
    if (startDate && startDate > endOfNextWeek) {
      // Permetti solo se una delle posizioni è speciale
      return isSpecialLocation(morningLocation) || isSpecialLocation(afternoonLocation);
    }
  
    // Seleziona solo date valide e non nel passato
    if (!startDate || startDate < today) {
      return false;
    }
  
    // Permetti le posizioni speciali senza altre restrizioni
    if (isSpecialLocation(morningLocation) || isSpecialLocation(afternoonLocation)) {
      return true;
    }
  
    // Verifica che la data di fine, se presente, sia entro la fine della prossima settimana
    return (morningLocation && afternoonLocation) && (endDate === null || endDate <= endOfNextWeek);
  };
  

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert(
        'Seleziona un intervallo di date valido. Per Ferie, Permesso o Trasferta non ci sono limiti, ma non puoi selezionare date singole oltre la fine della prossima settimana per le altre posizioni.'
      );
      return;
    }

    const createEntry = (part, location) => {
      return axios.post('http://localhost:3000/calendar/create', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        part: part,
        location: location.value,
      });
    };

    const morningPromise = createEntry('morning', morningLocation);
    const afternoonPromise = createEntry('afternoon', afternoonLocation);

    Promise.all([morningPromise, afternoonPromise])
      .then((responses) => {
        console.log('Entries created:', responses);
        // Mostra una notifica toast di conferma qui
      })
      .catch((error) => {
        console.error('Error creating entries:', error);
      });
  };

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
                  options={Locations}
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
                  options={Locations}
                  primaryColor={'[#7fb7d4]'}
                  placeholder="Seleziona una posizione"
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
          disabled={!isFormValid()}
          className={`block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4] ${
            isFormValid() ? 'bg-[#A7D0EB] hover:bg-[#7fb7d4]' : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Salva
        </button>
      </div>

      <div className="mt-8 px-4">
        <h3 className="text-lg font-semibold">Utenti e Disponibilità</h3>
        <table className="min-w-full divide-y mt-4 divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mattina</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pomeriggio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => {
                console.log('Processing User:', user.name);

                const userEntries = allCalendarData.filter((entry) => {
                  const entryDate = new Date(entry.date).toISOString().split('T')[0];
                  const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
                  return entryDate === startDateFormatted;
                });

                console.log(`User: ${user.name} - Entries Found:`, userEntries);

                let morningLocation = 'Non disponibile';
                let afternoonLocation = 'Non disponibile';

                userEntries.forEach((entry) => {
                  if (entry.period === 'morning') {
                    morningLocation = ['Ufficio', 'SmartWorking'].includes(entry.location)
                      ? entry.location
                      : 'Non disponibile';
                  } else if (entry.period === 'afternoon') {
                    afternoonLocation = ['Ufficio', 'Fuori Ufficio', 'SmartWorking'].includes(entry.location)
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
    </form>
  );
}
