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
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
  
      const fetchCalendarData = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read`, {
            headers: { authorization: `Bearer ${token}` },
          });
          setCalendarData(Array.isArray(response.data.calendars) ? response.data.calendars: []);
          console.log('Fetched Calendar Data:', response.data.calendars);
          //come mai prende solo i valori con il mio id?
        } catch (error) {
          console.error('Error fetching calendar data:', error);
        }
      };
  
  
    fetchLocations();
    fetchUsers();
    fetchCalendarData();
  }, []);

  const isFormValid = () => {
    const clickedDate = new Date();
    clickedDate.setHours(0, 0, 0, 0);
    if (!morningLocation || !afternoonLocation || !startDate || startDate < clickedDate) return false;

    const isSpecialLocation =
      ['Ferie', 'Permesso', 'Trasferta'].includes(morningLocation.value) ||
      ['Ferie', 'Permesso', 'Trasferta'].includes(afternoonLocation.value);

    if (isSpecialLocation) {
      return true; // Nessuna limitazione per le opzioni speciali
    }

    const today = new Date();
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 7);

    return endDate === null || endDate <= endOfNextWeek;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Seleziona un intervallo di date valido. Per Ferie, Permesso o Trasferta non ci sono limiti, ma non puoi selezionare date passate.');
      return;
    }

    axios
      .post('http://localhost:3000/calendar/create', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        part: 'morning',
        location: morningLocation.value,
      })
      .then((response) => {
        console.log('Morning entry created:', response);
      })
      .catch((error) => {
        console.error('Error creating morning entry:', error);
      });

    axios
      .post('http://localhost:3000/calendar/create', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        part: 'afternoon',
        location: afternoonLocation.value,
      })
      .then((response) => {
        console.log('Afternoon entry created:', response);
      })
      .catch((error) => {
        console.error('Error creating afternoon entry:', error);
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
          // Filtra tutte le entries per la data specificata
          const userEntries = calendarData.filter((entry) => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
            return entryDate === startDateFormatted; // Solo entries per la data specificata
          });

          let morningLocation = 'Non disponibile';
          let afternoonLocation = 'Non disponibile';

          // Controlla se ci sono entries per l'utente
          const relevantEntries = userEntries.filter(entry => entry.owner === user.id_user);

          relevantEntries.forEach((entry) => {
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




    </form>
  );
}
