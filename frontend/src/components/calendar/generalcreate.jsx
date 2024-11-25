import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Select from 'react-tailwindcss-select'; // Assuming this supports multi-select
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';

export default function HolidayCreateForm() {
    const [morningLocation, setMorningLocation] = useState(null);
    const [afternoonLocation, setAfternoonLocation] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [locations, setLocations] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]); // Changed to an array for multiple selection
    const [isForAllUsers, setIsForAllUsers] = useState(false);

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

    const handleUserChange = (selected) => {
        setSelectedUsers(selected); // Update to handle multiple users
    };

    const handleIsForAllUsersChange = (e) => {
        setIsForAllUsers(e.target.checked);
        if (e.target.checked) {
            setSelectedUsers([]); // Clear selected users if "For all users" is selected
        }
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/read`);
                const formattedLocations = response.data.locations.map(location => ({
                    value: location.id_location,
                    label: location.name
                }));
                setLocations(formattedLocations);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`);
                const formattedUsers = response.data.users.map(user => ({
                    value: user.id_user,
                    label: `${user.name} ${user.surname}`
                }));
                setUsers(formattedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchLocations();
        fetchUsers();
    }, []);

    const notifySuccess = () => toast.success('Inserimento avvenuto con successo!');
    const notifyError = () => toast.error('Errore nell\'inserimento!');

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const createEntry = (part, location, owner) => {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0); // Set to midnight

            const end = endDate ? new Date(endDate) : null;
            if (end) {
                end.setHours(0, 0, 0, 0); // Set end date to midnight if provided
            }

            return axios.post('http://localhost:3000/calendar/generalcreate', {
                startDate: start.toISOString().split('T')[0], // Format to YYYY-MM-DD
                endDate: end ? end.toISOString().split('T')[0] : null, // Format to YYYY-MM-DD if provided
                part: part,
                location: location.value,
                owner: owner,
                status: "Approvata",
            });
        };

        const submitEntries = () => {
            const promises = [];

            if (isForAllUsers) {
                // If "For all users" is selected, send for all users
                users.forEach(user => {
                    if (morningLocation) {
                        promises.push(createEntry('morning', morningLocation, user.value));
                    }
                    if (afternoonLocation) {
                        promises.push(createEntry('afternoon', afternoonLocation, user.value));
                    }
                });
            } else {
                // Send for the selected users
                selectedUsers.forEach(user => {
                    if (morningLocation) {
                        promises.push(createEntry('morning', morningLocation, user.value));
                    }
                    if (afternoonLocation) {
                        promises.push(createEntry('afternoon', afternoonLocation, user.value));
                    }
                });
            }

            Promise.all(promises)
                .then(() => {
                    notifySuccess();
                })
                .catch((error) => {
                    console.error('Error creating entries:', error);
                    notifyError();
                });
        };

        submitEntries();
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">Nuova Posizione</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        Aggiungendo una posizione, verrà visualizzata nel calendario.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="user" className="block text-sm font-medium leading-6 text-gray-900">
                                Utenti
                            </label>
                            <div className="mt-2">
                                <Select
                                    isMultiple
                                    value={selectedUsers}
                                    onChange={handleUserChange}
                                    options={users}
                                    primaryColor={'[#7fb7d4]'}
                                    placeholder="Seleziona uno o più utenti"
                                    isDisabled={isForAllUsers}
                                />
                            </div>
                        </div>

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
                                    minDate={new Date()}
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="morningLocation" className="block text-sm font-medium leading-6 text-gray-900">
                                Mattina
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={morningLocation}
                                    onChange={handleMorningLocationChange}
                                    options={locations}
                                    primaryColor={'[#7fb7d4]'}
                                    placeholder="Seleziona una posizione"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="afternoonLocation" className="block text-sm font-medium leading-6 text-gray-900">
                                Pomeriggio
                            </label>
                            <div className="mt-2">
                                <Select
                                    value={afternoonLocation}
                                    onChange={handleAfternoonLocationChange}
                                    options={locations}
                                    primaryColor={'[#7fb7d4]'}
                                    placeholder="Seleziona una posizione"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="isForAllUsers" className="block text-sm font-medium leading-6 text-gray-900">
                                Per tutti gli utenti
                            </label>
                            <div className="mt-2">
                                <input
                                    type="checkbox"
                                    id="isForAllUsers"
                                    checked={isForAllUsers}
                                    onChange={handleIsForAllUsersChange}
                                    className="h-4 w-4 text-[#7fb7d4] border-gray-300 rounded focus:ring-[#7fb7d4]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="button"
                    onClick={() => setOpen(false)} // Ensure this function is defined in your context
                    className="block rounded-md px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-gray-200 focus:outline-gray focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
                >
                    Salva
                </button>
            </div>

            <Toaster />
        </form>
    );
}
