import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { PhotoIcon, UserCircleIcon, XCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function UserCreateForm() {
  const [CreateSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    axios.get(`${process.env.REACT_APP_API_URL}/role/read`,  { headers: { authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('response', response);
        setRoles(response.data.roles);
      })
      .catch((error) => {
        console.error('Error:', error);
      })

    axios.get(`${process.env.REACT_APP_API_URL}/group/read`,  { headers: { authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('response', response);
        setGroups(response.data.groups);
      })
      .catch((error) => {
        console.error('Error:', error);
      })

    axios.get(`${process.env.REACT_APP_API_URL}/subgroup/read`,  { headers: { authorization: `Bearer ${token}` } })
      .then((response) => {
        console.log('response', response);
        setGroups(response.data.groups);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
  }, [])

  const createUser = (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    // get form data using getElementsById
    const form = document.forms.createuser;
    const formData = new FormData(form);

    // convert formData to JSON
    let jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });    
    console.log('json', jsonObject);

    axios.post(`${process.env.REACT_APP_API_URL}/user/create`, jsonObject, { headers: { authorization: `Bearer ${token}` } })
     .then((response) => {
        console.log('response', response);
        setCreateSuccess(true);
     })
      .catch((error) => {
        console.error('Error:', error);
        setCreateSuccess(false);
        setErrorMessages(error.response?.data?.message || ['An unexpected error occurred']);
      })
  };
  

  return (
    <form name='createuser'>
      { /* Account Information */ }
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni sull'utente</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Utilizza un indirizzo email valido e attivo, recapiteremo li eventuali comunicazioni.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email-address"
                  autoComplete="email-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Utilizzeremo questa email per comunicare la password dell'utente.</p>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Ruolo
              </label>
              <div className="mt-2">
                <select
                  id="role"
                  name="role"
                  autoComplete="role-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  {roles.map((role) => (
                    <option value={role.id_role}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Gruppo
              </label>
              <div className="mt-2">
                <select
                  id="group"
                  name="group"
                  autoComplete="group-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  {groups.map((group) => (
                    <option value={group.id_group}>{group.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Sotto gruppo
              </label>
              <div className="mt-2">
                <select
                  id="group"
                  name="group"
                  autoComplete="group-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  {subgroups.map((subgroup) => (
                    <option value={subgroup.id_subgroup}>{subgroup.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br />

      { /* Personal Information */ }
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                First name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="surname" className="block text-sm font-medium leading-6 text-gray-900">
                Last name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="surname"
                  id="surname"
                  autoComplete="family-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Country
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="IT">Italy</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Data di nascita
              </label>
              <div className="mt-2">
                <input
                    type="date"
                    name="birthdate"
                    id="birthdate"
                    autoComplete="birthdate"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                Street address
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="streetaddress"
                  id="street-address"
                  autoComplete="street-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                City
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  autoComplete="address-level2"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                Province
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="province"
                  id="province"
                  autoComplete="address-level1"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                ZIP / Postal code
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="zip"
                  id="postalcode"
                  autoComplete="postalcode"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      { /* Create User Button */ }
      
      <div className="mt-6 flex items-center justify-end gap-x-6">
        {CreateSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">User created successfully</h3>
              </div>
            </div>
          </div>
        )}

        {CreateSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errorMessages}</h3>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={createUser}
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Crea
        </button>
      </div>
    </form>
  )
}
