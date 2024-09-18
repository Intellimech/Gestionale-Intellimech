import React, { useState, useEffect } from 'react';
import { it } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { startOfMonth, endOfMonth, eachDayOfInterval, isToday, format, addDays, subDays } from 'date-fns';
import CalendarPopup from './calendarpopup';
import CalendarUpdateForm from './calendarupdateform'; // Importa il nuovo componente
import axios from 'axios';
import Cookies from 'js-cookie';

function generateCalendarArrayWithLocations(targetDate, locations) {
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);
  const firstDayOfMonth = startDate.getDay();
  const lastDayOfMonth = endDate.getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const adjustedLastDay = lastDayOfMonth === 0 ? 6 : lastDayOfMonth - 1;
  const days = [];
  const prevMonthEndDate = subDays(startDate, 1);
  const prevMonthDays = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    const date = subDays(startDate, adjustedFirstDay - i);
    prevMonthDays.push({
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
      morningLocation: null,
      afternoonLocation: null,
      id_calendar: null // Aggiungi l'ID del calendario
    });
  }
  days.push(...prevMonthDays);
  const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
  const currentMonthDays = datesInRange.map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
    isCurrentMonth: true,
    isToday: isToday(date),
    morningLocation: null,
    afternoonLocation: null,
    id_calendar: null // Aggiungi l'ID del calendario
  }));
  days.push(...currentMonthDays);
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
      id_calendar: null // Aggiungi l'ID del calendario
    });
  }
  days.push(...nextMonthDays);

  // Associa i luoghi agli ID del calendario
  days.forEach((day) => {
    const dayLocations = locations.filter(loc => loc.date === day.date);
    if (dayLocations.length > 0) {
      dayLocations.forEach(loc => {
        if (loc.period === 'morning') {
          day.morningLocation = loc.location;
        } else if (loc.period === 'afternoon') {
          day.afternoonLocation = loc.location;
        }
        day.id_calendar = loc.id_calendar; // Aggiungi l'ID del calendario
      });
    }
  });

  return days;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [locations, setLocations] = useState([]);
  const [addLocationPopupOpen, setAddLocationPopupOpen] = useState(false);
  const [updateLocationPopupOpen, setUpdateLocationPopupOpen] = useState(false); // Stato per il popup di aggiornamento
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);
  const [initialDataString, setInitialData] = useState({}); // Store initial data for update form

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await axios.get('http://localhost:3000/calendar/read', {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        });
        console.log('Locations:', response.data.calendars);
        setLocations(response.data.calendars);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:3000/calendar/read', {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      setLocations(response.data.calendars);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleTodayClick = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date) => {
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

        // Rimuovi l'ultimo punto e virgola se presente
        initialDataString = initialDataString.replace(/;$/, '');
        console.log("dati: " + initialDataString);
        setInitialData(initialDataString);
        setSelectedDate(date);
        setConfirmPopupOpen(true);
      } else {
        setSelectedDate(date);
        setAddLocationPopupOpen(true);
      }
    } else {
      setSelectedDate(date);
      setAddLocationPopupOpen(true);
    }
  };

  const handleFormSubmit = async (newLocation) => {
    try {
      await axios.post('http://localhost:3000/calendar/create-or-update', newLocation, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      fetchLocations();
    } catch (error) {
      console.error('Error adding/updating location:', error);
    }
  };

  const days = generateCalendarArrayWithLocations(currentMonth, locations);

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  function ConfirmPopup({ open, setOpen, onConfirm }) {
    return (
      <div className={`fixed z-10 inset-0 overflow-y-auto ${open ? '' : 'hidden'}`}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Modifica luogo</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Questo giorno ha già un luogo inserito. Vuoi modificarlo?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                Conferma
              </button>
              <button
                type="button"
                className="block rounded-md bg-white px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]" onClick={() => setOpen(false)}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmPopup 
        open={confirmPopupOpen} 
        setOpen={setConfirmPopupOpen} 
        onConfirm={() => {
          setConfirmPopupOpen(false); // Chiudi il popup di conferma
          setUpdateLocationPopupOpen(true); // Apri il popup di modifica
        }} 
      />
      {updateLocationPopupOpen && (
        <CalendarUpdateForm 
          open={updateLocationPopupOpen} 
          setOpen={setUpdateLocationPopupOpen} 
          date={selectedDate} 
          initialData={initialDataString} // Passa i dati iniziali per la modifica
          onSubmit={handleFormSubmit} // Funzione per l'invio dei dati modificati
        />
      )}

      <CalendarPopup 
        open={addLocationPopupOpen} 
        setOpen={setAddLocationPopupOpen} 
        date={selectedDate} 
        onSubmit={handleFormSubmit} 
      />
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 lg:flex-none">
          <h1 className="text-sm font-semibold leading-5 text-gray-900">
          <time dateTime={format(currentMonth, 'yyyy-MM', { locale: it })}>
            {format(currentMonth, 'MMMM yyyy', { locale: it }).charAt(0).toUpperCase() + format(currentMonth, 'MMMM yyyy', { locale: it }).slice(1)}
          </time>
          </h1>
          <div className="flex items-center">
            <div className="relative flex items-center rounded-md bg-white shadow-sm  md:items-stretch">
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
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
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
        <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
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
                  day.isToday ? 'bg-blue-100' : '', // Colore per il giorno corrente
                  !day.isWorkingDay && 'bg-[#808080]',
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-300',
                  'relative px-2 py-1 items-center justify-center text-center text-gray-900 border-b border-r border-gray-300' // Aggiungi bordo destro e inferiore
                )}
                onClick={() => handleDayClick(day.date)}
              >
                <div className="text-xs px-1 py-1">
                  {day.date.split('-').pop().replace(/^0/, '')}
                </div>

                {/* Linea di separazione che copre tutta la cella */}
                <div className="border-t border-gray-300 w-full"></div>

                {/* Contenitore con sezioni separate */}
                <div className="flex flex-col h-full mt-2">
                  {/* Div mattina */}
                  <div className="flex-shrink-0 flex items-center justify-center min-h-[20px] mb-0">
                    {day.morningLocation ? (
                      <div className={classNames(
                        'rounded-md flex items-center justify-center px-2 py-1 text-xs inline-block',
                        day.morningLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                          : day.morningLocation === 'Trasferta' ? 'bg-[#FFFF00] text-gray-900'
                            : day.morningLocation === 'Malattia' ? 'bg-[#FF9966] text-gray-900'
                              : day.morningLocation === 'Permesso' ? 'bg-[#8ED973] text-gray-900'
                                : day.morningLocation === 'Ferie' ? 'bg-[#8ED973] text-gray-900'
                                  : day.morningLocation === 'SmartWorking' ? 'bg-[#FFCCFF] text-gray-900'
                                    : day.morningLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0] text-gray-900'
                                      : day.morningLocation === 'Non Lavorativo' ? 'bg-[#00D5D0] text-gray-900'
                                        : 'bg-gray-200 text-gray-800'
                      )}>
                        {day.morningLocation}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Mattina</span> // Placeholder quando vuoto
                    )}
                  </div>

                  {/* Linea di separazione centrata con larghezza w-10 */}
                  <div className="border-t mt-2 border-gray-300 w-10 mx-auto"></div>

                  {/* Div pomeriggio */}
                  <div className="flex-shrink-0 flex items-center justify-center mt-2 min-h-[20px] mt-0">
                    {day.afternoonLocation ? (
                      <div className={classNames(
                        'rounded-md flex items-center justify-center px-2 py-1 text-xs inline-block',
                        day.afternoonLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                          : day.afternoonLocation === 'Trasferta' ? 'bg-[#FFFF00] text-gray-900'
                            : day.afternoonLocation === 'Malattia' ? 'bg-[#FF9966] text-gray-900'
                              : day.afternoonLocation === 'Permesso' ? 'bg-[#8ED973] text-gray-900'
                                : day.afternoonLocation === 'Ferie' ? 'bg-[#8ED973] text-gray-900'
                                  : day.afternoonLocation === 'SmartWorking' ? 'bg-[#FFCCFF] text-gray-900'
                                    : day.afternoonLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0] text-gray-900'
                                      : day.afternoonLocation === 'Non Lavorativo' ? 'bg-[#00D5D0] text-gray-900'
                                        : 'bg-gray-200 text-gray-800'
                      )}>
                        {day.afternoonLocation}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Pomeriggio</span> // Placeholder quando vuoto
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
