import React, { useState } from 'react'
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import Select from 'react-tailwindcss-select'

const Locations = [
    { value: '1', label: 'Ferie' },
    { value: '2', label: 'Permesso' },
    { value: '3', label: 'Malattia' },
    { value: '4', label: 'Presenza' },
    { value: '5', label: 'Trasferta' },
    { value: '6', label: 'Smartworking' },
    { value: '7', label: 'Fuori Ufficio' },
];

const Parts = [
    { value: '1', label: 'Mattina' },
    { value: '2', label: 'Pomeriggio' },
];

export default function Example({ date }) {
    const [Location, setLocation] = useState(null);
    const [Part, setPart] = useState(null);

    const handleLocationChange = value => {
        setLocation(value);
    };

    const handlePartChange = value => {
        setPart(value);
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
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                    Data selezionata
                </label>
                    <div className="mt-2">
                        <input
                        type="date"
                        value={new Date(date)?.toISOString().split('T')[0]}
                        id="name"
                        name="name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                        disabled
                        />
                    </div>
                </div>

                <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                        Seleziona un periodo della giornata
                    </label>
                    <div className="mt-2">
                        <Select
                            value={Part}
                            onChange={handlePartChange}
                            options={Parts}
                            primaryColor={"red"}
                            isMultiple={true}
                        />
                    </div>
                </div>

                <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                        Seleziona un luogo
                    </label>
                    <div className="mt-2">
                        <Select
                            value={Location}
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
            type="submit"
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
            Save
            </button>
        </div>
        </form>
    )
}
