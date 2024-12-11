import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';


export default function CalendarUpdateForm({ open, setOpen, date, initialData }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [morningId, setMorningId] = useState(null);
  const [afternoonId, setAfternoonId] = useState(null);
  const [dataSelezionata, setDataSelezionata] = useState(null);
  const [users, setUsers] = useState([]);
  const [calendarData, setCalendarData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allCalendarData, setAllCalendarData] = useState([]);
  const [morningStatus, setMorningStatus] = useState(null);
  const [afternoonStatus, setAfternoonStatus] = useState(null);
  
  useEffect(() => {
   

    if (initialData) {
      const dataP = initialData.split(','); 
      setDataSelezionata(dataP[1]); // Data selezionata, esempio "2024-10-03"
    
      const dataParts = dataP[2].split(';'); // Esempio: ["morning:Permesso", "afternoon:Malattia", "morningStatus:Approvata", "afternoonStatus:Approvata"]
    
      // Analizza ogni parte
      dataParts.forEach((part) => {
        const [key, value] = part.split(':'); // Dividi in chiave e valore
    
        if (key === 'morning') {
          setMorningLocation(value ? { value: value, label: value } : null);
        } else if (key === 'afternoon') {
          setAfternoonLocation(value ? { value: value, label: value } : null);
        } else if (key === 'morningStatus') {
          setMorningStatus(value); // Popola lo status mattutino
        } else if (key === 'afternoonStatus') {
          setAfternoonStatus(value); // Popola lo status pomeridiano
        }
      });
    }
    
  }, [initialData]);

  useEffect(() => {
  

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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`, );
        if (Array.isArray(response.data.locations)) {
          const formattedLocations = response.data.locations.map(location => ({
            value: location.id_location,
            label: location.name
          }));
          setLocations(formattedLocations);
        } else {
          console.error('Invalid locations data:', response.data.locations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
    fetchUsers();

    // Fetch calendar data if dataSelezionata is available
    if (dataSelezionata) {
      fetchCalendarData(dataSelezionata); // Pass the selected date
    }

    // Fetch all calendar data on component mount
    fetchAllCalendarData(); // New function call

  }, [dataSelezionata]);

  const fetchCalendarData = async (selectedDate) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read`, {
       
        params: { date: selectedDate },
      });
      setCalendarData(Array.isArray(response.data.calendars) ? response.data.calendars : []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  // New function to fetch all calendar data
  const fetchAllCalendarData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read/all`, );
      setAllCalendarData(response.data); // Set the state
    } catch (error) {
      console.error('Error fetching all calendar data:', error);
    }
  };

  useEffect(() => {
  
  }, [allCalendarData]);

  useEffect(() => {
    if (calendarData.length > 0) {
      const morningEntry = calendarData.find(entry => entry.period === 'morning' && entry.date === dataSelezionata);
      const afternoonEntry = calendarData.find(entry => entry.period === 'afternoon' && entry.date === dataSelezionata);

      if (morningEntry) {
        setMorningId(morningEntry.id_calendar);
      }
      if (afternoonEntry) {
        setAfternoonId(afternoonEntry.id_calendar);
      }
    }
  }, [calendarData, dataSelezionata]);

  const handleMorningLocationChange = (selectedOption) => {
    // Controlla se la nuova location è "Ferie" o "Permesso"
    if (selectedOption && (selectedOption.label === "Ferie" || selectedOption.label === "Permesso")) {
      setMorningStatus("In Attesa di Approvazione"); // Imposta lo stato
    } else {
      // Controlla se la location precedente era "Ferie" o "Permesso"
      if (morningLocation && (morningLocation.label === "Ferie" || morningLocation.label === "Permesso")) {
        // Controlla se la nuova location è diversa dalla precedente
        if (selectedOption && selectedOption.label !== morningLocation.label) {
          setMorningStatus("In Attesa di Approvazione"); // Imposta lo stato
        }
      }
    }
    setMorningLocation(selectedOption);
  };
  
  const handleAfternoonLocationChange = (selectedOption) => {
    // Controlla se la nuova location è "Ferie" o "Permesso"
    if (selectedOption && (selectedOption.label === "Ferie" || selectedOption.label === "Permesso")) {
      setAfternoonStatus("In Attesa di Approvazione"); // Imposta lo stato
    } else {
      // Controlla se la location precedente era "Ferie" o "Permesso"
      if (afternoonLocation && (afternoonLocation.label === "Ferie" || afternoonLocation.label === "Permesso")) {
        // Controlla se la nuova location è diversa dalla precedente
        if (selectedOption && selectedOption.label !== afternoonLocation.label) {
          setAfternoonStatus("In Attesa di Approvazione"); // Imposta lo stato
        }
      }
    }
    setAfternoonLocation(selectedOption);
  };
  
  // Funzione per ottenere l'id_location tramite il nome della location
  const getLocationIdByName = (name) => {
    // Trim degli spazi bianchi e comparazione case-insensitive sul campo 'label'
    const location = locations.find(loc => loc.label.trim().toLowerCase() === name.trim().toLowerCase());
  
    if (!location) {
      console.error(`Nessuna location trovata per il nome: ${name}`);
    }
  
    return location ? location.value : null; // Restituisce l'id_location tramite 'value'
  };
                                                

  const handleFormSubmit = () => {
    // Trova l'ID corrispondente al nome della location
    const morningLocationId = morningLocation ? getLocationIdByName(morningLocation.label) : initialData.morningLocation;
    const afternoonLocationId = afternoonLocation ? getLocationIdByName(afternoonLocation.label) : initialData.afternoonLocation;
    const selectedDate = dataSelezionata || date;
  
    const requestData = {
      morning_id: morningId,
      afternoon_id: afternoonId,
      date: selectedDate,
      morning_location_id: morningLocationId,
      afternoon_location_id: afternoonLocationId,
      morning_status: morningStatus, // Aggiungi lo status mattutino
      afternoon_status: afternoonStatus // Aggiungi lo status pomeridiano
    };

  
    if (morningLocationId !== initialData.morningLocation || afternoonLocationId !== initialData.afternoonLocation) {
      axios.post('http://localhost:3000/calendar/update', requestData)
        .then((response) => {
        
          toast.success('Aggiornamento riuscito!', {
            position: toast.POSITION.TOP_RIGHT
          });
        })
        .catch((error) => {
         
          toast.error('Errore nell\'aggiornamento delle location.', {
            position: toast.POSITION.TOP_RIGHT
          });
        });
    }
  };

  
  

  return (
    <div>
      <form>
        <div className="space-y-8 p-2">
          <Toaster/>
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
                    options={locations}
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
                    options={locations}
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
        // Find morning and afternoon entries for this user from allCalendarData
        const userEntries = allCalendarData.filter(entry => entry.owner === user.id_user);
        console.log(userEntries);
        

        // Loop through the user's entries to assign morning and afternoon locations
        let morningLocation = "Non disponibile";
        let afternoonLocation = "Non disponibile";
        
        userEntries.forEach(entry => {
           const period = entry.period?.trim().toLowerCase();
           const location = parseInt(entry.location);
        
           if (period === 'afternoon') {
               if (location === 4) {
                   afternoonLocation = "Ufficio";
               } else if (location === 6) {
                   afternoonLocation = "Smartworking";
               }
           } else if (period === 'morning') {
               if (location === 4) {
                   morningLocation = "Ufficio";
               } else if (location === 6) {
                   morningLocation = "Smartworking";
               }
           }
        });
        
        console.log("Morning Location:", morningLocation);
        console.log("Afternoon Location:", afternoonLocation);
        

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
  );
}
