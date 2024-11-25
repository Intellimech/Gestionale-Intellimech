import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import DatePicker from 'react-datepicker';
import Cookies from 'js-cookie';
import 'react-datepicker/dist/react-datepicker.css';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';

// const Locations = [
//   { value: 'Ferie', label: 'Ferie' },
//   { value: 'Permesso', label: 'Permesso' },
//   { value: 'Malattia', label: 'Malattia' },
//   { value: 'Ufficio', label: 'Ufficio' },
//   { value: 'Trasferta', label: 'Trasferta' },
//   { value: 'Smartworking', label: 'Smartworking' },
//   { value: 'Fuori Ufficio', label: 'Fuori Ufficio' },
//   { value: 'Non Lavorativo', label: 'Non Lavorativo' },
// ];

export default function Example({ date, setOpen }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [startDate, setStartDate] = useState(date ? new Date(date) : null);
  const [endDate, setEndDate] = useState(null);
  const [Locations, setLocations] = useState([]);
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
    

    const fetchLocations = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`);
         
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
      
      
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`, );
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

   // New function to fetch all calendar data
  const fetchAllCalendarData = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read/all`, {
            
            params: { date: startDate },
        });
        
        setAllCalendarData(response.data); // Set the state
    } catch (error) {
        console.error('Error fetching all calendar data:', error);
    }
};


    fetchLocations();
    fetchUsers();
    fetchAllCalendarData();
  }, []);


  // Funzione per mostrare il toast di conferma
  const notifyConfirmation = (onConfirm) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Stai inserendo Ferie o Permesso, confermi l'inserimento?</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                
                onConfirm();
                closeToast();  // Chiude il toast dopo conferma
              }}
              className="bg-[#A7D0EB] hover:bg-[#7fb7d4] text-white rounded px-2 py-1 text-xs"
            >
              Conferma
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-300 hover:bg-gray-400 text-black rounded px-2 py-1 text-xs"
            >
              Annulla
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false }  // Disabilita la chiusura automatica
    );
  };

  // Funzione per mostrare notifiche di successo o errore
  const notifySuccess = () => toast.success('Inserimento avvenuto con successo!');
  const notifyError = () => toast.error('Errore nell\'inserimento!');
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert(
        'Seleziona un intervallo di date valido. Per Ferie, Permesso o Trasferta non ci sono limiti, ma non puoi selezionare date singole oltre la fine della prossima settimana per le altre posizioni.'
      );
      return;
    }
    const createEntry = (part, location) => {
      // Imposta lo status in base alla posizione selezionata
      const status = ['1', '2'].includes(location.value) ? 'In Attesa di Approvazione' : 'Approvata';
    
      // Invia la richiesta al server con lo status
      return axios.post('http://localhost:3000/calendar/create', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        part: part,
        location: location.value,
        status: status, // Aggiungi lo status nel payload
      });
    };
    

    const submitEntries = () => {
      const morningPromise = createEntry('morning', morningLocation);
      const afternoonPromise = createEntry('afternoon', afternoonLocation);

      Promise.all([morningPromise, afternoonPromise])
        .then((responses) => {
          notifySuccess();  // Notifica di successo
        })
        .catch((error) => {
         notifyError();  // Notifica di errore
        });
    };

    const isSpecialLocation = (location) => ['Ferie', 'Permesso'].includes(location?.value);

    // Se è una posizione speciale (Ferie o Permesso), richiedi conferma tramite toast
    if (isSpecialLocation(morningLocation) || isSpecialLocation(afternoonLocation)) {
      notifyConfirmation(() => {
        submitEntries(); // Esegui l'inserimento solo dopo la conferma
      });
    } else {
      submitEntries(); // Nessuna conferma necessaria, esegui direttamente l'inserimento
    }
  };

  const isFormValid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 7); // Fine della prossima settimana
  
    // Controllo per posizioni speciali
    const isSpecialLocation = (location) => ['Ferie', 'Permesso', 'Trasferta'].includes(location?.label);
  
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
      const userEntries = allCalendarData.filter((entry) => {
        const entryDate = new Date(entry.startDate || entry.date);
        if (isNaN(entryDate)) {
          console.error('Invalid entry date:', entry.startDate || entry.date);
          return false; // Skip invalid dates
        }

        const startDateFormatted = startDate ? startDate.toISOString().split('T')[0] : null;
        const entryDateFormatted = entryDate.toISOString().split('T')[0];

        const userId = entry.owner; // Using 'owner' as user ID
       
        return entryDateFormatted === startDateFormatted && userId === user.id_user; // Updated condition
      });

      let morningLocation = 'Non disponibile';
      let afternoonLocation = 'Non disponibile';

      userEntries.forEach(entry => {
        if (entry.period === 'morning') { // Check for the correct field for morning
          morningLocation = ['4', '6'].includes(entry.location) ? entry.location : 'Non disponibile';
        } else if (entry.period === 'afternoon') { // Check for the correct field for afternoon
          afternoonLocation = ['4', '6'].includes(entry.location) ? entry.location : 'Non disponibile';
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
      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
        Nessun utente trovato.
      </td>
    </tr>
  )}
</tbody>


        </table>
      
      <Toaster />
    </form>
  );
}
