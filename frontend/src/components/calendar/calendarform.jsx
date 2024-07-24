import axios from 'axios';
import React, { useState } from 'react';
import Select from 'react-tailwindcss-select';

const Locations = [
    { value: 'Ferie', label: 'Ferie' },
    { value: 'Permesso', label: 'Permesso' },
    { value: 'Malattia', label: 'Malattia' },
    { value: 'Presenza', label: 'Presenza' },
    { value: 'Trasferta', label: 'Trasferta' },
    { value: 'Smartworking', label: 'Smartworking' },
    { value: 'Fuori Ufficio', label: 'Fuori Ufficio' },
];

const Parts = [
    { value: 'morning', label: 'Mattina' },
    { value: 'afternoon', label: 'Pomeriggio' },
];

export default function Example({ date }) {
    const [location, setLocation] = useState(null);
    const [part, setPart] = useState(null);

    const handleLocationChange = (selected) => {
        setLocation(selected);
    };

    const handlePartChange = (selected) => {
        setPart(selected);
    };

    const createCalendar = () => {
        console.log('Data:', date);
        console.log('Periodo:', part.value);
        console.log('Luogo:', location.value);
        axios.post('http://localhost:3000/calendar/create', {
            date: date,
            part: part.value,
            location: location.value,
        })
            .then((response) => {
                console.log(response);
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
                            <label htmlFor="selectedDate" className="block text-sm font-medium leading-6 text-gray-900">
                                Data selezionata
                            </label>
                            <div className="mt-2">
                                <input
                                    type="date"
                                    value={new Date(date)?.toISOString().split('T')[0]}
                                    id="selectedDate"
                                    name="selectedDate"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="part" className="block text-sm font-medium leading-6 text-gray-900">
                                Seleziona un periodo della giornata
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={part}
                                    onChange={handlePartChange}
                                    options={Parts}
                                    primaryColor={"red"}
                                    isMultiple={false}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                                Seleziona un luogo
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={location}
                                    onChange={handleLocationChange}
                                    options={Locations}
                                    primaryColor={"red"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={createCalendar}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                    Save
                </button>
            </div>
        </form>
    );
}
