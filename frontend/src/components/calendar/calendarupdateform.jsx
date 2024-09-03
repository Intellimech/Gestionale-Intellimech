

    import axios from 'axios';
    import Select from 'react-tailwindcss-select';
    
import React, { useState, useEffect } from 'react';
    
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
    
    export default function CalendarUpdateForm({ open, setOpen, date, part, initialLocation, onUpdate }) {
        const [location, setLocation] = useState(null);
    
        const handleLocationChange = (selected) => {
            setLocation(selected);
        };
        
    useEffect(() => {
        setLocation(initialLocation);
    }, [initialLocation]);

        const handlePartChange = (selected) => {
            setPart(selected);
        };
    
        const createCalendar = () => {
            if (!location || !part) {
                alert('Please select both location and period!');
                return;
            }
    
            axios.post('http://localhost:3000/calendar/create', {
                date: date,
                part: part.value,
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
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Na Posizione</h2>
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
                                        value={date ? new Date(date)?.toISOString().split('T')[0] : ''}
                                        id="selectedDate"
                                        name="selectedDate"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                                        disabled
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
                                        isMultiple={false} // Corrected to false for single selection
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
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={createCalendar}
                        className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]">
                        Save
                    </button>
                </div>
            </form>
        );
    }
    