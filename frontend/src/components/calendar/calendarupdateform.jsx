import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function CalendarUpdateForm({ open, setOpen, date, initialData }) {
  const [morningLocation, setMorningLocation] = useState(null);
  const [afternoonLocation, setAfternoonLocation] = useState(null);
  const [morningId, setMorningId] = useState(null);
  const [afternoonId, setAfternoonId] = useState(null);
  const [dataSelezionata, setDataSelezionata] = useState(null);

  useEffect(() => {
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

  const handleMorningLocationChange = (selectedOption) => {
    setMorningLocation(selectedOption);
    console.log('Morning location changed:', selectedOption);
  };

  const handleAfternoonLocationChange = (selectedOption) => {
    setAfternoonLocation(selectedOption);
    console.log('Afternoon location changed:', selectedOption);
  };

  const handleFormSubmit = () => {
    const morningLocationValue = morningLocation ? morningLocation.value : initialData.morningLocation;
    const afternoonLocationValue = afternoonLocation ? afternoonLocation.value : initialData.afternoonLocation;

    console.log('Submitting data:', {
      morning_id: morningId,
      afternoon_id: afternoonId,
      date: dataSelezionata,
      morning_location: morningLocationValue,
      afternoon_location: afternoonLocationValue,
    });

    // Verifica se almeno uno dei valori è cambiato
    if (morningLocationValue !== initialData.morningLocation || afternoonLocationValue !== initialData.afternoonLocation) {
      axios.post('http://localhost:3000/calendar/update', {
          morning_id: morningId,
          afternoon_id: afternoonId,
          date: dataSelezionata,
          morning_location: morningLocationValue,
          afternoon_location: afternoonLocationValue,
        }, {
          headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        console.log('Update response:', response);
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error('Error updating locations:', error);
      });
    }

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

  const formContainerStyle = {
    position: 'fixed',
    right: open ? '0' : '-100%',
    top: '6',
    height: '100vh',
    width: '550px',
    transform: 'translateY(0)',
    transition: 'right 0.3s ease-in-out',
    zIndex: 10,
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  return (
    open ? (
      <div style={formContainerStyle}>
        <form>
          <div className="space-y-12 p-4">
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
                      primaryColor="#7fb7d4"
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
                      primaryColor="#7fb7d4"
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
              onClick={handleFormSubmit}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    ) : null
  );
}
