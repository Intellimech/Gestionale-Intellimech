import React, { useState, useEffect } from 'react';
import { it } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { startOfMonth, endOfMonth, eachDayOfInterval, isToday, format, addDays, subDays } from 'date-fns';
import CalendarPopup from './calendarpopup';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';


function generateCalendarArrayWithLocations(targetDate, calendars = [], locations = []) {
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);
  const firstDayOfMonth = startDate.getDay();
  const lastDayOfMonth = endDate.getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const adjustedLastDay = lastDayOfMonth === 0 ? 6 : lastDayOfMonth - 1;
  const days = [];
  const prevMonthEndDate = subDays(startDate, 1);
  const prevMonthDays = [];

  // Creazione dei giorni del mese precedente
  for (let i = 0; i < adjustedFirstDay; i++) {
    const date = subDays(startDate, adjustedFirstDay - i);
    prevMonthDays.push({
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
      morningLocation: null,
      afternoonLocation: null,
      id_calendar: null
    });
  }
  days.push(...prevMonthDays);

  // Creazione dei giorni del mese corrente
  const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
  const currentMonthDays = datesInRange.map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
    isCurrentMonth: true,
    isToday: isToday(date),
    morningLocation: null,
    afternoonLocation: null,
    id_calendar: null
  }));
  days.push(...currentMonthDays);

  // Aggiunta dei giorni del mese successivo
  const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= remainingDays; i++) {
    const date = addDays(endDate, i);
    nextMonthDays.push({
      date: format(date, 'yyyy-MM-dd'),
      isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
      isCurrentMonth: false,
      morningLocation: null,
      afternoonLocation: null,
      id_calendar: null
    });
  }
  days.push(...nextMonthDays);

 // Funzione per ottenere il nome della location tramite id_location
const getLocationNameById = (id) => {
  console.log("Cercando la location con id:", id); // Debugging: verifica l'id cercato
  console.log("Locations disponibili:", JSON.stringify(locations, null, 2)); // Visualizza tutte le locations

  // Match per id_location
  const location = locations.find(loc => loc.id_location === id); 
  console.log("Location trovata:", JSON.stringify(location, null, 2)); // Debugging: verifica la location trovata

  return location ? location.name : null; // Restituisce la proprietà name o null
};


  // Assegna le locations (mattina e pomeriggio)
  days.forEach((day) => {
    const dayLocations = calendars?.filter(loc => loc.date === day.date) || [];
    
    // Debugging: verifica le locations per il giorno corrente
    console.log("Locations per il giorno:", day.date, " -> ", dayLocations);

    if (dayLocations.length > 0) {
      dayLocations.forEach(loc => {
        console.log("Location dettagli:", loc); // Debugging: verifica i dettagli della location

        if (loc.period === 'morning') {
          // Ricerca del nome della location per il mattino
          const morningLocationName = getLocationNameById(loc.location);
          console.log("Nome della location mattutina:", morningLocationName); // Debugging: verifica il nome trovato
          day.morningLocation = morningLocationName || null; // Assegna il nome della location o null
          day.morningStatus = loc.status; // Mantiene lo stato
        } else if (loc.period === 'afternoon') {
          // Ricerca del nome della location per il pomeriggio
          const afternoonLocationName = getLocationNameById(loc.location);
          console.log("Nome della location pomeridiana:", afternoonLocationName); // Debugging: verifica il nome trovato
          day.afternoonLocation = afternoonLocationName || null; // Assegna il nome della location o null
          day.afternoonStatus = loc.status; // Mantiene lo stato
        }
        day.id_calendar = loc.id_calendar; // Assegna l'id del calendario
      });

      // Debugging: verifica il giorno aggiornato con le locations
      console.log("Giorno aggiornato con locations:", day);
    } else {
      console.log("Nessuna location trovata per il giorno:", day.date); // Debugging: verifica se non ci sono location
    }
  });

  return days;
}
const formatLocations = (locations) => {
  return locations.map(location => ({
    id_location: location.id_location, // Ensure this matches what you expect
    name: location.name,
  }));
};


export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendars, setCalendars] = useState([]);
  
  const [locations, setLocations] = useState([]);
  const [addLocationPopupOpen, setAddLocationPopupOpen] = useState(false);
  const [updateLocationPopupOpen, setUpdateLocationPopupOpen] = useState(false); // Stato per il popup di aggiornamento
  const [selectedDate, setSelectedDate] = useState(null);
  const [initialDataString, setInitialData] = useState({}); // Store initial data for update formù
  const [action, setAction]= useState({});

  useEffect(() => {
    
      const fetchData = async () => {
        await fetchLocations(); // Assicurati di chiamare la funzione fetchLocations
        await fetchCalendar(); // Se hai bisogno di questo
      };
      
      

    async function fetchCalendar() {
      try {
        const response = await axios.get('http://localhost:3000/calendar/read', );
        console.log('Calendar:', response.data.calendars);
        
        setCalendars(response.data.calendars);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }
    
    fetchData();
    fetchLocations();
  }, []);
  const fetchLocations = async () => {
    try { const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`, );
  
      console.log('Risposta delle locations:', response.data); // Debugging: stampa la risposta dell'API
  
      if (Array.isArray(response.data.locations)) {
        const formattedLocations = formatLocations(response.data.locations);
        setLocations(formattedLocations);
        console.log("Locations disponibili:", formattedLocations); // Debugging: controlla le locations
      } else {
        console.error('Invalid locations data:', response.data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };
  

  const fetchCalendar = async () => {
    try {
      const response = await axios.get('http://localhost:3000/calendar/read', );
      setCalendars(response.data.calendars);
    } catch (error) {
      console.error('Error fetching calendars:', error);
    }

  };

 

  const handleTodayClick = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date) => {
     const today = new Date();
  const clickedDate = new Date(date);

  // Normalizza le date per confrontare solo anno, mese e giorno
  today.setHours(0, 0, 0, 0);
  clickedDate.setHours(0, 0, 0, 0);

  // Verifica se la data cliccata è precedente a oggi
  if (clickedDate < today) {
    return; // Non fare nulla se il giorno è passato
  }
    const selectedDay = days.find(day => day.date === date);
    if (selectedDay.morningLocation || selectedDay.afternoonLocation) {
      if (selectedDay) {
        // Costruisci la stringa di dati iniziali
        let initialDataString = '';
        initialDataString += `${selectedDay.id_calendar},${selectedDay.date},`;

        if (selectedDay.morningLocation) {
          initialDataString += `morning:${selectedDay.morningLocation};`;
        }
        if (selectedDay.afternoonLocation) {
          initialDataString += `afternoon:${selectedDay.afternoonLocation};`;
        }

        // Aggiungi morningStatus e afternoonStatus se disponibili
        if (selectedDay.morningStatus) {
          initialDataString += `morningStatus:${selectedDay.morningStatus};`;
        }
        if (selectedDay.afternoonStatus) {
          initialDataString += `afternoonStatus:${selectedDay.afternoonStatus};`;
        }


        // Rimuovi l'ultimo punto e virgola se presente
        initialDataString = initialDataString.replace(/;$/, '');
        console.log("datiDATI: " + initialDataString);
        setInitialData(initialDataString);
        setSelectedDate(date);
        //setUpdateLocationPopupOpen(true);
        setAction("update");
        setAddLocationPopupOpen(true);
      } else {
        setSelectedDate(date);
        setAction("create");
        setAddLocationPopupOpen(true);
        
      }
    } else {
      setSelectedDate(date);
      setAction("create");
      setAddLocationPopupOpen(true);
      
    }
  };
// Inside Calendar.js
const handleFormSubmit = async (newLocation) => {
  try {
    await axios.post('http://localhost:3000/calendar/create-or-update', newLocation,);

    // Close the popup
    setAddLocationPopupOpen(false);
    // Refresh the locations
    fetchCalendar();
    fetchLocations();
  } catch (error) {
    console.error('Error adding/updating location:', error);
  }
};


  const days = generateCalendarArrayWithLocations(currentMonth, calendars, locations);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }


  return (
    <>
   

    <CalendarPopup
      open={addLocationPopupOpen}
      setOpen={setAddLocationPopupOpen}
      date={selectedDate}
      
        initialData={initialDataString}
      action= {action}
      onSubmit={handleFormSubmit}
    />

    <div className="h-[80vh] flex flex-col"> {/* Adjusted height */}
      <Toaster/>
      <header className="flex items-center justify-between border-b border-gray-200 px-0 lg:flex-none">
        <h1 className="text-sm font-semibold leading-5 text-gray-900">
          <time dateTime={format(currentMonth, 'yyyy-MM', { locale: it })}>
            {format(currentMonth, 'MMMM yyyy', { locale: it }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM yyyy', { locale: it }).slice(1)}
          </time>
        </h1>
        <div className="flex items-center ">
          <div className="relative flex items-center mb-1  rounded-md bg-white shadow-sm md:items-stretch">
            <button
              type="button"
              className="flex h-8 w-10 items-center justify-center rounded-l-md border-y border-l border-gray-300 text-gray-400 hover:text-gray-500 focus:relative md:w-8"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <span className="sr-only">Mese precedente</span>
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-y border-gray-300 px-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              onClick={handleTodayClick}
            >
              Oggi
            </button>
            <span className="relative h-5 w-px bg-gray-300 md:hidden mt-1" />
            <button
              type="button"
              className="flex h-8 w-10 items-center justify-center rounded-r-md border-y border-r border-gray-300 text-gray-400 hover:text-gray-500 focus:relative md:w-8"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <span className="sr-only">Mese successivo</span>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <div className="shadow  ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-5 text-gray-700 lg:flex-none">
          <div className="bg-white py-1">Lun</div>
          <div className="bg-white py-1">Mar</div>
          <div className="bg-white py-1">Mer</div>
          <div className="bg-white py-1">Gio</div>
          <div className="bg-white py-1">Ven</div>
          <div className="bg-white py-1">Sab</div>
          <div className="bg-white py-1">Dom</div>
        </div>
        <div className="w-full h-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
          {days.map((day) => (
            <div
              key={day.date}
              className={classNames(
                day.isToday ? 'bg-blue-00' : '',
                !day.isWorkingDay && 'bg-[#808080]',
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-300',
                'relative px-2 py-1 items-center justify-center text-center text-gray-900 border-b border-r border-gray-300'
              )}
              onClick={() => handleDayClick(day.date)}
            >
              <div className="text-xs px-1 py-1">
        {/* Added gray outline for current day */}
        <span className={day.isToday ? 'border border-gray-400 bg-gray-100 rounded-full px-2 py-1.' : ''}>
          {day.date.split('-').pop().replace(/^0/, '')}
        </span>
      </div>

              {/* Linea di separazione che copre tutta la cella */}
              <div className="border-t border-gray-300 w-full"></div>

              {/* Contenitore con sezioni separate */}
              <div className="flex flex-col h-full mt-1">
                {/* Div mattina */}
              <div className="flex-shrink-0 mt-2  flex items-center justify-center min-h-[20px] mb-0">
              {day.morningLocation ? (
                <div className={classNames(
                  'rounded-md flex items-center justify-center px-2 py-1 text-xs inline-block',
                  day.morningStatus === 'Approvato' 
                    ? day.morningLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                      : day.morningLocation === 'Trasferta' ? 'bg-[#FFFF00] text-gray-900'
                      : day.morningLocation === 'Malattia' ? 'bg-[#FF9966] text-gray-900'
                      : day.morningLocation === 'Permesso' ? 'bg-[#8ED973] text-gray-900'
                      : day.morningLocation === 'Ferie' ? 'bg-[#8ED973] text-gray-900'
                      : day.morningLocation === 'Smartworking' ? 'bg-[#FFCCFF] text-gray-900'
                      : day.morningLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0] text-gray-900'
                      : day.morningLocation === 'Non Lavorativo' ? 'bg-[#00D5D0] text-gray-900'
                      : 'bg-gray-200 text-gray-800'
                    : day.morningLocation === 'Ufficio' ? 'border-2 border-[#CC99FF] text-gray-900'
                      : day.morningLocation === 'Trasferta' ? 'border-2 border-[#FFFF00] text-gray-900'
                      : day.morningLocation === 'Malattia' ? 'border-2 border-[#FF9966] text-gray-900'
                      : day.morningLocation === 'Permesso' ? 'border-2 border-[#8ED973] text-gray-900'
                      : day.morningLocation === 'Ferie' ? 'border-2 border-[#8ED973] text-gray-900'
                      : day.morningLocation === 'Smartworking' ? 'border-2 border-[#FFCCFF] text-gray-900'
                      : day.morningLocation === 'Fuori Ufficio' ? 'border-2 border-[#00D5D0] text-gray-900'
                      : day.morningLocation === 'Non Lavorativo' ? 'border-2  border-[#00D5D0] text-gray-900'
                      : 'border border-gray-200 text-gray-800'
                )}>
                  {day.morningLocation}
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Mattina</span>
              )}
            </div>

            {/* Div pomeriggio */}
            <div className="flex-shrink-0 flex items-center justify-center mt-1 min-h-[20px] mt-0">
              {day.afternoonLocation ? (
                <div className={classNames(
                  'rounded-md flex items-center justify-center px-2 py-1 text-xs inline-block',
                  day.afternoonStatus === 'Approvato' 
                    ? day.afternoonLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                      : day.afternoonLocation === 'Trasferta' ? 'bg-[#FFFF00] text-gray-900'
                      : day.afternoonLocation === 'Malattia' ? 'bg-[#FF9966] text-gray-900'
                      : day.afternoonLocation === 'Permesso' ? 'bg-[#8ED973] text-gray-900'
                      : day.afternoonLocation === 'Ferie' ? 'bg-[#8ED973] text-gray-900'
                      : day.afternoonLocation === 'Smartworking' ? 'bg-[#FFCCFF] text-gray-900'
                      : day.afternoonLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0] text-gray-900'
                      : day.afternoonLocation === 'Non Lavorativo' ? 'bg-[#00D5D0] text-gray-900'
                      : 'bg-gray-200 text-gray-800'
                    : day.afternoonLocation === 'Ufficio' ? 'border-2 border-[#CC99FF] text-gray-900'
                      : day.afternoonLocation === 'Trasferta' ? 'border-2 border-[#FFFF00] text-gray-900'
                      : day.afternoonLocation === 'Malattia' ? 'border-2 border-[#FF9966] text-gray-900'
                      : day.afternoonLocation === 'Permesso' ? 'border-2 border-[#8ED973] text-gray-900'
                      : day.afternoonLocation === 'Ferie' ? 'border-2 border-[#8ED973] text-gray-900'
                      : day.afternoonLocation === 'Smartworking' ? 'border-2 border-[#FFCCFF] text-gray-900'
                      : day.afternoonLocation === 'Fuori Ufficio' ? 'border-2 border-[#00D5D0] text-gray-900'
                      : day.afternoonLocation === 'Non Lavorativo' ? 'border-2 border-[#00D5D0] text-gray-900'
                      : 'border border-gray-200 text-gray-800'
                )}>
                  {day.afternoonLocation}
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Pomeriggio</span>
              )}
            </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);
}