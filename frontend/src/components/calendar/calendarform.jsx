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

const Parts = [
    { value: 'morning', label: 'Mattina' },
    { value: 'afternoon', label: 'Pomeriggio' },
];

export default function Example({ date, onUpdate }) {
    const [location, setLocation] = useState(null);
    const [part, setPart] = useState([]); // Modifica il tipo di stato per gestire più selezioni
    const [startDate, setStartDate] = useState(date ? new Date(date) : null);
    const [endDate, setEndDate] = useState(null);
    const [selectingRange, setSelectingRange] = useState(false);

    const handleLocationChange = (selected) => {
        setLocation(selected);
    };

    const handlePartChange = (selected) => {
        setPart(selected);
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const formatDate = (date) => date ? date.toLocaleDateString('it-IT') : '';

    const createCalendar = () => {
        if (!location || !part.length || !startDate) {
            alert('Please select all required fields!');
            return;
        }

        axios.post('http://localhost:3000/calendar/create', {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            parts: part.map(p => p.value), // Mappa i valori selezionati
            location: location.value,
        })
        .then((response) => {
            console.log(response);
            if (onUpdate) onUpdate(); // Trigger parent's state update if provided
        })
        .catch((error) => {
            console.error(error);
        });
    };

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

                        <div className="sm:col-span-4">
                            <label htmlFor="part" className="block text-sm font-medium leading-6 text-gray-900">
                                Orario
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={part}
                                    onChange={handlePartChange}
                                    options={Parts}
                                    primaryColor={"[#7fb7d4]"}
                                    isMultiple={true} // Permette la selezione multipla
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                                Stato
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={location}
                                    onChange={handleLocationChange}
                                    options={Locations}
                                    primaryColor={"[#7fb7d4]"}
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
                    className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
                >
                    Salva
                </button>
            </div>
        </form>
    );
}
