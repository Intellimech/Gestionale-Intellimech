import React, { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import { startOfMonth, endOfMonth, eachDayOfInterval, isToday, format, addDays, subDays } from 'date-fns';
import CalendarPopup from './calendarpopup';

function generateCalendarArrayWithLocations(targetDate, locations) {
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

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
          day.morningLocation = loc.name;
        } else if (loc.period === 'afternoon') {
          day.afternoonLocation = loc.name;
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

  useEffect(() => {
    async function fetchLocations() {
      try {
        // Simulating fetching locations from API
        setLocations([
          { id: 1, name: 'Permesso', date: '2024-06-24', period: 'morning' },
          { id: 2, name: 'Fuori Ufficio', date: '2024-06-24', period: 'afternoon' },
          { id: 3, name: 'Ferie', date: '2024-06-25', period: 'morning' },
          { id: 4, name: 'Trasferta', date: '2024-06-25', period: 'afternoon' },
          { id: 5, name: 'SmartWorking', date: '2024-06-27', period: 'morning' },
          { id: 6, name: 'Malattia', date: '2024-06-27', period: 'afternoon' },
          { id: 7, name: 'Presenza', date: '2024-06-26', period: 'morning' },
        ]);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, []);

  const days = generateCalendarArrayWithLocations(currentMonth, locations);

  const handleTodayClick = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date) => {
    console.log('Clicked date:', date);
    //check is the morning or afternoon location is already set
    //if morning or afternoon location is already set, then show a popup to edit the location else show a popup to add location
    setAddLocationPopupOpen(true);
    setSelectedDate(date);
  };

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <>
      <CalendarPopup open={addLocationPopupOpen} setOpen={setAddLocationPopupOpen} date={selectedDate} />
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
                day.isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-300',
                'relative px-3 py-2 items-center justify-center text-center text-gray-900'
              )}
              onClick={() => handleDayClick(day.date)}
            >
              <div className={classNames(
                'text-xs px-1 py-1 ',
                !day.isWorkingDay && 'text-red-600',
                isToday(new Date(day.date)) && ' bg-red-500 px-1 py-1 rounded-full flex items-center justify-center text-white text-xs font-bold',
              )}>
                {day.date.split('-').pop().replace(/^0/, '')}
              </div>
              <div className="mt-1 ">
                {day.morningLocation && (
                  <p className={classNames(
                    'rounded-full flex items-center justify-center px-1 py-1 text-xs inline-block',
                    day.morningLocation === 'Presenza' ? 'bg-green-200 text-green-800'
                      : day.morningLocation === 'SmartWorking' ? 'bg-yellow-200 text-yellow-800'
                        : day.morningLocation === 'Malattia' ? 'bg-red-200 text-red-800'
                          : day.morningLocation === 'Permesso' ? 'bg-blue-200 text-blue-800'
                            : day.morningLocation === 'Ferie' ? 'bg-purple-200 text-purple-800'
                              : day.morningLocation === 'Trasferta' ? 'bg-pink-200 text-pink-800'
                                : day.morningLocation === 'Fuori Ufficio' ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                  )}>
                    Mattina: {day.morningLocation}
                  </p>
                )}
                {day.afternoonLocation && (
                  <p className={classNames(
                    'rounded-full flex items-center justify-center px-1 py-1 text-xs inline-block mt-1',
                    day.afternoonLocation === 'Presenza' ? 'bg-green-200 text-green-800'
                      : day.afternoonLocation === 'SmartWorking' ? 'bg-yellow-200 text-yellow-800'
                        : day.afternoonLocation === 'Malattia' ? 'bg-red-200 text-red-800'
                          : day.afternoonLocation === 'Permesso' ? 'bg-blue-200 text-blue-800'
                            : day.afternoonLocation === 'Ferie' ? 'bg-purple-200 text-purple-800'
                              : day.afternoonLocation === 'Trasferta' ? 'bg-pink-200 text-pink-800'
                                : day.afternoonLocation === 'Fuori Ufficio' ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                  )}>
                    Pomeriggio: {day.afternoonLocation}
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
