import axios from 'axios';
import React, { useState } from 'react';
import Select from 'react-tailwindcss-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Locations = [
    { value: 'Ferie', label: 'Ferie' },
    { value: 'Permesso', label: 'Permesso' },
    { value: 'Malattia', label: 'Malattia' },
    { value: 'Ufficio', label: 'Ufficio' },
    { value: 'Trasferta', label: 'Trasferta' },
    { value: 'SmartWorking', label: 'SmartWorking' },
    { value: 'Fuori Ufficio', label: 'Fuori Ufficio' },
];

export default function Example({ date, onUpdate }) {
    const [morningLocation, setMorningLocation] = useState(null);
    const [afternoonLocation, setAfternoonLocation] = useState(null);
    const [startDate, setStartDate] = useState(date ? new Date(date) : null);
    const [endDate, setEndDate] = useState(null);

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

    const formatDate = (date) => date ? date.toLocaleDateString('it-IT') : '';

    const createCalendar = () => {
        // Controllo che sia selezionata sia la mattina che il pomeriggio e la data
        if (!morningLocation || !afternoonLocation || !startDate) {
            alert('Please select all required fields!');
            return;
        }
    
        // Invia la richiesta per la mattina
        axios.post('http://localhost:3000/calendar/create', {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            part: 'morning',  // Indica che si tratta della mattina
            location: morningLocation.value,  // Posizione selezionata per la mattina
        })
        .then((response) => {
            console.log('Morning entry created:', response);
            if (onUpdate) onUpdate(); // Se hai bisogno di aggiornare il frontend dopo il primo invio
        })
        .catch((error) => {
            console.error('Error creating morning entry:', error);
        });
    
        // Invia la richiesta per il pomeriggio
        axios.post('http://localhost:3000/calendar/create', {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            part: 'afternoon',  // Indica che si tratta del pomeriggio
            location: afternoonLocation.value,  // Posizione selezionata per il pomeriggio
        })
        .then((response) => {
            console.log('Afternoon entry created:', response);
            if (onUpdate) onUpdate(); // Se hai bisogno di aggiornare il frontend dopo il secondo invio
        })
        .catch((error) => {
            console.error('Error creating afternoon entry:', error);
        });
    };
    

    const isFormValid = morningLocation && afternoonLocation && startDate;

    return (
        <form>
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
                                />
                            </div>
                        </div>

                        {/* Select per Morning */}
                        <div className="sm:col-span-4">
                            <label htmlFor="morningLocation" className="block text-sm font-medium leading-6 text-gray-900">
                                Mattina
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={morningLocation}
                                    onChange={handleMorningLocationChange}
                                    options={Locations}
                                    primaryColor={"[#7fb7d4]"}
                                    placeholder="Seleziona una posizione"
                                />
                            </div>
                        </div>

                        {/* Select per Afternoon */}
                        <div className="sm:col-span-4">
                            <label htmlFor="afternoonLocation" className="block text-sm font-medium leading-6 text-gray-900">
                                Pomeriggio
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={afternoonLocation}
                                    onChange={handleAfternoonLocationChange}
                                    options={Locations}
                                    primaryColor={"[#7fb7d4]"}
                                    placeholder="Seleziona una posizione"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button type="button" className="block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-gray-200 focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]">
                    Annulla
                </button>
                <button
                    type="button"
                    onClick={createCalendar}
                    disabled={!isFormValid}
                    className={`block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4] ${isFormValid ? 'bg-[#A7D0EB] hover:bg-[#7fb7d4]' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                    Salva
                </button>
            </div>
        </form>
    );
}
