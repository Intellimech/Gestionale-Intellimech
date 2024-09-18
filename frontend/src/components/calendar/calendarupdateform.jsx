import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';
import Cookies from 'js-cookie';
export default function CalendarUpdateForm({ open, setOpen, date, initialData, onSubmit }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [IdCalendar, setIdCalendar] = useState(null);
  const [dataSelezionata, setDataSelezionata] = useState(null);
  const [pomeriggio, setPomeriggio] = useState(null);
  const [mattina,  setMattina] = useState(null);
  useEffect(() => {
    if (initialData) {
    const dataP = initialData.split(',');
    setIdCalendar(dataP[0]);
    setDataSelezionata(dataP[1]); 
    console.log("la data è" +dataP[1]);
    console.log(mattina)
      const dataParts = dataP[2].split(';');
      dataParts.forEach(part => {
        const [period, location] = part.split(':');
        if (period === 'morning') {
          setMorningLocation(location ? { value: location, label: location } : null);
        } else if (period === 'afternoon') {
          setAfternoonLocation(location ? { value: location, label: location } : null);
        }
      });
    }
  }, [initialData]);

  const handleMorningLocationChange = (selectedOption) => {
    setMorningLocation(selectedOption);
    setMattina(true);
  };

  const handleAfternoonLocationChange = (selectedOption) => {
    setAfternoonLocation(selectedOption);
    setPomeriggio(true);
  };

  const handleSubmit = () => {
    // Invia richiesta per la mattina, se presente
    if (mattina) {
      axios.post('http://localhost:3000/calendar/update', {
        headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          },

        id_calendar: IdCalendar,
        date: dataSelezionata,
        period: 'morning',
        location: morningLocation.value,
        
      })
      .then((response) => {
        console.log('Morning update response:', response);
      })
      .catch((error) => {
        console.error('Error updating morning location:', error);
      });
    }
  
    // Invia richiesta per il pomeriggio, se presente
    else if (pomeriggio) {
      axios.post('http://localhost:3000/calendar/update', {
        headers: {
            Authorization: `Bearer ${Cookies.get('token')}`
          },
        id_calendar: IdCalendar, 
        date: dataSelezionata,
        period: 'afternoon',
        location: afternoonLocation.value,
      })
      .then((response) => {
        console.log('Afternoon update response:', response);
      })
      .catch((error) => {
        console.error('Error updating afternoon location:', error);
      });
    }
    console.log("guarda qua: "+ IdCalendar, dataSelezionata, morningLocation.value, mattina)
  
    // Chiudi il modulo
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

  return (
    open ? (
      <form>
        <div className="space-y-12">
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
                    primaryColor='#7fb7d4'
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
                    primaryColor='#7fb7d4'
                    isSearchable
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
            type="button"
            onClick={handleSubmit}
            className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Salva
          </button>
        </div>
      </form>
    ) : null
  );
}
