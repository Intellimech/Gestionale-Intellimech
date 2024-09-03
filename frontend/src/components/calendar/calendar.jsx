import React, { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import { startOfMonth, endOfMonth, eachDayOfInterval, isToday, format, addDays, subDays } from 'date-fns';
import CalendarPopup from './calendarpopup';
import axios from 'axios';
import Cookies from 'js-cookie';

function generateCalendarArrayWithLocations(targetDate, locations) {
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);


  // Monday is 0, Sunday is 6
  const firstDayOfMonth = startDate.getDay();
  const lastDayOfMonth = endDate.getDay();

  // Now set Monday as the first day of the week
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const adjustedLastDay = lastDayOfMonth === 0 ? 6 : lastDayOfMonth - 1;

  const days = [];

  // Add days for the preceding month
  const prevMonthEndDate = subDays(startDate, 1);
  const prevMonthDays = [];
  for (let i = 0; i <= adjustedFirstDay; i++) {
    const date = subDays(prevMonthEndDate, adjustedFirstDay - i);
    prevMonthDays.push({
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
      morningLocation: null,
      afternoonLocation: null
    });
  }
  days.push(...prevMonthDays);

  // Add days for the current month
  const datesInRange = eachDayOfInterval({ start: startDate, end: endDate });
  const currentMonthDays = datesInRange.map(date => ({
    date: format(date, 'yyyy-MM-dd'),
    isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
    isCurrentMonth: true,
    isToday: isToday(date),
    morningLocation: null,
    afternoonLocation: null
  }));
  days.push(...currentMonthDays);

  // Add days for the next month to complete the grid
  const remainingDays = 42 - (prevMonthDays.length + currentMonthDays.length);
  const nextMonthDays = [];
  for (let i = 1; i <= remainingDays; i++) {
    const date = addDays(endDate, i);
    nextMonthDays.push({
      date: format(date, 'yyyy-MM-dd'),
      isWorkingDay: date.getDay() !== 0 && date.getDay() !== 6,
      isCurrentMonth: false,
      morningLocation: null,
      afternoonLocation: null
    });
  }
  days.push(...nextMonthDays);

  // Populate days with working locations
  days.forEach((day) => {
    const dayLocations = locations.filter(loc => loc.date === day.date);
    if (dayLocations.length > 0) {
      dayLocations.forEach(loc => {
        if (loc.period === 'morning') {
          day.morningLocation = loc.location;
        } else if (loc.period === 'afternoon') {
          day.afternoonLocation = loc.location;
        }
      });
    }
  });

  return days;
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [locations, setLocations] = useState([]);
  const [addLocationPopupOpen, setAddLocationPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmPopupOpen, setConfirmPopupOpen] = useState(false);


  useEffect(() => {
    async function fetchLocations() {
      try {
        // Simulating fetching locations from API
        // setLocations([
        //   { id: 1, location: 'Permesso', date: '2024-06-24', period: 'morning' },
        //   { id: 2, location: 'Fuori Ufficio', date: '2024-06-24', period: 'afternoon' },
        //   { id: 3, location: 'Ferie', date: '2024-06-25', period: 'morning' },
        //   { id: 4, location: 'Trasferta', date: '2024-06-25', period: 'afternoon' },
        //   { id: 5, location: 'SmartWorking', date: '2024-06-27', period: 'morning' },
        //   { id: 6, location: 'Malattia', date: '2024-06-27', period: 'afternoon' },
        //   { id: 7, location: 'Ufficio', date: '2024-06-26', period: 'morning' },
        // ]);
        axios.get('http://localhost:3000/calendar/read', {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          }
        })
          .then(response => {
            console.log('Locations:', response.data.calendars);
            setLocations(response.data.calendars);
          })
          .catch(error => {
            console.error('Error fetching locations:', error);
          });
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
      setSelectedDate(date);
      setConfirmPopupOpen(true);
    } else {
      setSelectedDate(date);
      setAddLocationPopupOpen(true);
    }
  };
  

  // New function to handle form submission
  const handleFormSubmit = async (newLocation) => {
    try {
      // Make API call to add or update location
      await axios.post('http://localhost:3000/calendar/create-or-update', newLocation, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      });
      // After successful submission, refetch locations
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
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                Conferma
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setOpen(false)}
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
      onConfirm={() => setAddLocationPopupOpen(true)} 
    />
    

      <CalendarPopup 
        open={addLocationPopupOpen} 
        setOpen={setAddLocationPopupOpen} 
        date={selectedDate} 
        onSubmit={handleFormSubmit} 
      />
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              <time dateTime={format(currentMonth, 'yyyy-MM')}>{format(currentMonth, 'MMMM yyyy')}</time>
            </h1>
            <div className="flex items-center">
              <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                <button
                  type="button"
                  className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <span className="sr-only">Previous month</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
                  onClick={handleTodayClick}
                >
                  Today
                </button>
                <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                <button
                  type="button"
                  className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <span className="sr-only">Next month</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>
          <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
            <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
              <div className="bg-white py-2">Sun</div>
              <div className="bg-white py-2">Mon</div>
              <div className="bg-white py-2">Tue</div>
              <div className="bg-white py-2">Wed</div>
              <div className="bg-white py-2">Thu</div>
              <div className="bg-white py-2">Fri</div>
              <div className="bg-white py-2">Sat</div>
              
            </div>
            <div className="hidden w-full h-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
          {days.map((day) => (
            <div
              key={day.date}
              className={classNames(
                !day.isWorkingDay && 'text-[#7fb7d4] bg-[#808080]' ,
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-300',
                'relative px-3 py-2 items-center justify-center text-center text-gray-900'
              )}
              onClick={() => handleDayClick(day.date)}
            >
              <div className={classNames(
                'text-xs px-1 py-1 ',
                !day.isWorkingDay && 'text-black ' ,
                isToday(new Date(day.date)) && ' text-black',
              )}>
                {day.date.split('-').pop().replace(/^0/, '')}
              </div>
              <div className="mt-1 ">
                {day.morningLocation && (
                  <p className={classNames(
                    'rounded-md flex items-right justify-center px-3 py-1 text-xs inline-block',
                    day.morningLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                      : day.morningLocation === 'Trasferta' ? 'bg-[#FFFF00]  text-gray-900'
                        : day.morningLocation === 'Malattia' ? 'bg-[#FF9966]  text-gray-900'
                          : day.morningLocation === 'Permesso' ? 'bg-[#8ED973]  text-gray-900'
                            : day.morningLocation === 'Ferie' ? 'bg-[#8ED973]  text-gray-900'
                              : day.morningLocation === 'SmartWorking' ? 'bg-[#FFCCFF]  text-gray-900'
                                : day.morningLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0]  text-gray-900'
                                  : 'bg-gray-200 text-gray-800'
                  )}>
                  {day.morningLocation}
                  </p>
                )}
                {day.afternoonLocation && (
                  <p className={classNames(
                    'rounded-md flex items-center justify-center px-1 py-1 text-xs inline-block mt-1',
                    day.afternoonLocation === 'Ufficio' ? 'bg-[#CC99FF] text-gray-900'
                      : day.afternoonLocation === 'Trasferta' ? 'bg-[#FFFF00] text-gray-900'
                        : day.afternoonLocation === 'Malattia' ? 'bg-[#FF9966]  text-gray-900'
                          : day.afternoonLocation === 'Permesso' ? 'bg-[#8ED973]  text-gray-900'
                            : day.afternoonLocation === 'Ferie' ? 'bg-[#8ED973] text-gray-900'
                              : day.afternoonLocation === 'SmartWorking' ? 'bg-[#FFCCFF]  text-gray-900'
                                : day.afternoonLocation === 'Fuori Ufficio' ? 'bg-[#00D5D0] text-gray-900'
                                  : 'bg-gray-200 text-gray-800'
                  )}>
                   {day.afternoonLocation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}

//#FF3399 colore per le festività #808080 per sbaato e domenica #94DCF8 chiusura aziendale 