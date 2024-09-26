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
  const [Locations, setLocations]=useState([]);

  const formRef = useRef(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      console.error('No authorization token found');
      return;
    }

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
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`, {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log("Risposta API:", JSON.stringify(response.data, null, 2));
        if (Array.isArray(response.data.locations)) {
          const formattedLocations = response.data.locations.map(location => ({
            value: location.name,
            label: location.name
          }));
          setLocations(formattedLocations);
          console.log("Queste sono le locations formattate: ", JSON.stringify(formattedLocations, null, 2));
        } else {
          console.error('Invalid locations data:', response.data.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
  
    
    fetchLocations();
    fetchUsers();

    // Only fetch calendar data if dataSelezionata is available
    if (dataSelezionata) {
      fetchCalendarData(dataSelezionata); // Pass the selected date
    }
  }, [dataSelezionata]); 

  const fetchCalendarData = async (selectedDate) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
        params: { date: selectedDate }, // Pass the selected date to the API
      });
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

    // Ensure you are sending the correct date for update
    const selectedDate = dataSelezionata || date; // Use dataSelezionata or the provided date

    if (morningLocationValue !== initialData.morningLocation || afternoonLocationValue !== initialData.afternoonLocation) {
      axios.post('http://localhost:3000/calendar/update', {
          morning_id: morningId,
          afternoon_id: afternoonId,
          date: selectedDate, // Use the correct date
          morning_location: morningLocationValue,
          afternoon_location: afternoonLocationValue,
        }, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        // Handle response as needed
      })
      .catch((error) => {
        console.error('Error updating locations:', error);
      });
    }

    setOpen(false);
  };

 

  const formContainerStyle = {
    position: 'fixed',
    right: open ? '0' : '-100%',
    top: '0',
    height: '100vh',
    width: '500px',
    transform: 'translateY(0)',
    transition: 'right 0.3s ease-in-out',
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    maxHeight: '100vh',
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
          <div className="space-y-8 p-2">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-sm font-semibold leading-6 text-gray-900">Aggiorna Posizione</h2>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Aggiornando la posizione, verrà visualizzata nel calendario.
              </p>
  
              <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
                    Data
                  </label>
                  <div className="mt-1">
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
                  <div className="mt-1">
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
                  <div className="mt-1">
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
  
          <div className="mt-4 flex items-center justify-end gap-x-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="block rounded-md px-1 py-0.5 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-gray-200 focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="block rounded-md bg-[#A7D0E4] px-3 py-1.5 text-center text-xs font-semibold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Aggiorna
            </button>
          </div>
        </form>

        {/* Displaying User Calendar Data */}
        <table className="min-w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mattina</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pomeriggio</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => {
                const userEntries = calendarData.filter((entry) => entry.owner === user.id_user && entry.date === dataSelezionata);
                let morningLocation = 'Non disponibile';
                let afternoonLocation = 'Non disponibile';
  
                userEntries.forEach((entry) => {
                  console.log(`Entry found for ${user.name}:`, entry);
                  if (entry.period === 'morning') {
                    morningLocation = ['Ufficio', 'SmartWorking'].includes(entry.location) ? entry.location : 'Non disponibile';
                  } else if (entry.period === 'afternoon') {
                    afternoonLocation = ['Ufficio', 'SmartWorking'].includes(entry.location) ? entry.location : 'Non disponibile';
                  }
                });
  
                return (
                  <tr key={user.id_user}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{morningLocation}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{afternoonLocation}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="px-4 py-2 text-center text-sm text-gray-500">
                  Nessun utente trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    ) : null
  );
}
