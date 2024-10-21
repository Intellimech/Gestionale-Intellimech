import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { PhotoIcon, UserCircleIcon, XCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import Select from "react-tailwindcss-select";
import toast, { Toaster } from 'react-hot-toast';

export default function UpdateForm({ person, onClose }) {
  const [formData, setFormData] = useState(person);
  const [UpdateSuccess, setUpdateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [workingsites, setWorkingsite] = useState([]);
  const [contracttypes, setContracttype] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subgroups, setSubgroups] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');
  const [selectedWorkingsite, setSelectedWorkingsite] = useState('');
  const [selectedcontracttype, setSelectedContracttype] = useState('');


    useEffect(() => {
      // Set form data and selected values based on the 'person' object
      setFormData(person);
      setSelectedRole({ value: person?.role});
    
      // Log the values to the console
      console.log('Form Data:', person);
      console.log('Selected Role:', { value: person?.role });
    }, [person]);
    useEffect(() => {  
    axios.get(`${process.env.REACT_APP_API_URL}/role/read`)
      .then((response) => {
        console.log('response', response);
        setRoles(response.data.roles);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    axios.get(`${process.env.REACT_APP_API_URL}/group/read`)
      .then((response) => {
        console.log('response', response);
        setGroups(response.data.groups);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    axios.get(`${process.env.REACT_APP_API_URL}/subgroup/read`)
      .then((response) => {
        console.log('response subgroup', response);
        setSubgroups(response.data.subgroups);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      axios.get(`${process.env.REACT_APP_API_URL}/workingsite/read`)
      .then((response) => {
        console.log('response workingsite', response.data.sites);
        setWorkingsite(response.data.sites);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

      axios.get(`${process.env.REACT_APP_API_URL}/contracttype/read`)
      .then((response) => {
        console.log('response contracttype', response);
        setContracttype(response.data.contracts);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);

  const updateUser = async (event) => {
    event.preventDefault();
  
    setLoading(true); // Start loading
  
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/user/update`, formData);
      
      setUpdateSuccess(true);
      toast.success('Utente aggiornato con successo!'); // Corrected message
    } catch (error) {
      console.error('Errore:', error);
      setUpdateSuccess(false);
      setErrorMessages(error.response?.data?.message || ['Si è verificato un errore inaspettato']);
      toast.error('Aggiornamento dell\'utente fallito.'); // Corrected message
    } finally {
      setLoading(false); // End loading
    }
  };
  
  
  // Button with loading state
  <button
    onClick={updateUser}
    type="submit"
    disabled={loading}
  >
    {loading ? 'Creating...' : 'Aggiorna'}
  </button>
  
  return (
    <form name='updateuser'>
      <Toaster/>
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
                  value={formData?.email } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} // Update on change
                  autoComplete="email-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Utilizzeremo questa email per comunicare la password dell'utente.</p>
            </div>
  
            <div className="sm:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
                Permesso
              </label>
              <div className="mt-2">
                <Select
                   value={formData?.role } // Bind to formData
                   onChange={(e) => setFormData({ ...formData, role: e.target.value })} // Update on change
                  options={roles.map((role) => ({ value: role.id_role, label: role.name }))}
                  placeholder="Seleziona un ruolo"
                />
              </div>
            </div>
  
            <div className="sm:col-span-2">
              <label htmlFor="group" className="block text-sm font-medium leading-6 text-gray-900">
                Gruppo
              </label>
              <div className="mt-2">
                <Select
                   value={formData?.group } // Bind to formData
                   onChange={(e) => setFormData({ ...formData, group: e.target.value })} // Update on change
                  options={groups.map((group) => ({ value: group.id_group, label: group.name }))}
                  placeholder="Seleziona un gruppo"
                />
              </div>
            </div>
  
            <div className="sm:col-span-2">
              <label htmlFor="subgroup" className="block text-sm font-medium leading-6 text-gray-900">
                Sotto gruppo
              </label>
              <div className="mt-2">
                <Select
                 value={formData?.subgroup } // Bind to formData
                 onChange={(e) => setFormData({ ...formData, subgroup: e.target.value })} // Update on change
                  options={subgroups.map((subgroup) => ({ value: subgroup.id_subgroup, label: subgroup.name }))}
                  placeholder="Seleziona un sotto gruppo"
                />
              </div>
            </div> 

            {/* <div className="sm:col-span-2">
              <label htmlFor="workingsite" className="block text-sm font-medium leading-6 text-gray-900">
                Luogo di Lavoro
              </label>
              <div className="mt-2">
                <Select
                  value={selectedWorkingsite}
                  onChange={(value) => setSelectedWorkingsite(value)}
                  options={workingsites?.map((workingsite) => ({
                    value: workingsite.id_workingsite,
                    label: workingsite.GeneralName,
                  }))}
                  placeholder="Seleziona un luogo di lavoro"
                />
              </div>
            </div> */}

            <div className="sm:col-span-2">
              <label htmlFor="contracttype" className="block text-sm font-medium leading-6 text-gray-900">
                Rapporto
              </label>
              <div className="mt-2">
                <Select
                  value={formData?.contracttype ? { value: formData.contracttype.id, label: formData.contracttype.name } : null}
                  onChange={(selectedOption) => {
                    setFormData({
                      ...formData,
                      contracttype: {
                        id: selectedOption.value,
                        name: selectedOption.label
                      }
                    });
                  }}
                  options={contracttypes?.map((contracttype) => ({
                    value: contracttype?.id_contracttype,
                    label: contracttype?.name,
                  }))}
                  placeholder="Seleziona un contratto"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="hWeek" className="block text-sm font-medium leading-6 text-gray-900">
                Ore settimanali 
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="hWeek"
                  id="hWeek"
                  value={formData?.hWeek } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, hWeek: e?.target?.value })} // Update on change
                  autoComplete="hWeek"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  placeholder="0"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
  
      <br />
  
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p>
  
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nome
              </label>
              <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                value={formData?.name } // Bind to formData
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} // Update on change
                autoComplete="given-name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
              />

              </div>
            </div>
  
            <div className="sm:col-span-3">
              <label htmlFor="surname" className="block text-sm font-medium leading-6 text-gray-900">
                Cognome
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="surname"
                  id="surname"
                  value={formData?.surname } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })} // Update on change
                  autoComplete="family-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="cf" className="block text-sm font-medium leading-6 text-gray-900">
                Codice Fiscale
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="cf"
                  id="cf"
                  value={formData?.TaxIdCode } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, TaxIdCode: e.target.value })} // Update on change
                  autoComplete="cf"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            
            <div className="sm:col-span-3">
  <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
    Nazione
  </label>
  <div className="mt-2">
    <Select
      // Check if formData?.country is defined and map it to the right object
      value={formData?.country ? { value: formData.country, label: formData.countryName } : null}
      // Handle the change event to update formData correctly
      onChange={(selectedOption) => {
        // Update formData with the selected country value and label
        setFormData({
          ...formData,
          country: selectedOption.value,
          countryName: selectedOption.label // Assuming you want to save the label as well
        });
      }}
      options={[
        { value: 'IT', label: 'Italy' },
        { value: 'CA', label: 'Canada' },
        { value: 'MX', label: 'Mexico' },
      ]}
      placeholder="Seleziona un paese"
    />
  </div>
</div>

            <div className="sm:col-span-3">
              <label htmlFor="birthday" className="block text-sm font-medium leading-6 text-gray-900">
                Data di nascita
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  name="birthdate"
                  id="birthdate"
                  value={formData?.birthday } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} // Update on change
                  autoComplete="birthdate"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div className="col-span-full">
              <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                Indirizzo
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="streetaddress"
                  id="street-address" 
                  value={formData?.streetaddress } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, streetaddress: e.target.value })} // Update on change
                  autoComplete="street-address"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                Città
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  value={formData?.city } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} // Update on change
                  autoComplete="address-level2"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div className="sm:col-span-2">
              <label htmlFor="birthregion" className="block text-sm font-medium leading-6 text-gray-900">
                Provincia di Nascita
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="birthprovince"
                  id="birthprovince"
                  value={formData?.birthprovince } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, birthprovince: e.target.value })} // Update on change
                  autoComplete="address-level1"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                Provincia di Residenza
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="province"
                  id="province"
                  value={formData?.province } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })} // Update on change
                  autoComplete="address-level1"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>
  
            <div className="sm:col-span-2">
              <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                CAP
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="zip"
                  id="postalcode"
                  value={formData?.zip } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })} // Update on change
                  autoComplete="postalcode"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                Telefono
              </label>
              <div className="mt-2">
                <input
                  type="tel"  // Use 'tel' input type for phone numbers
                  name="phone"
                  id="phone" // Changed id for better semantics
                  value={formData?.phone } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} // Update on change
                  autoComplete="tel"  // Use tel for autocomplete
                  pattern="[0-9]*"  // Optional: restrict to numbers only
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  placeholder="Es. +39 332 345 6789"  // Add a placeholder for better UX
                  required // Optionally make the field required
                />
              </div>
            </div>

            
            <div className="sm:col-span-2">
              <label htmlFor="businessphone" className="block text-sm font-medium leading-6 text-gray-900">
                Telefono Aziendale
              </label>
              <div className="mt-2">
                <input
                  type="tel"  // Use 'tel' input type for phone numbers
                  name="businessphone"
                  id="businessphone" // Changed id for better semantics
                  value={formData?.businessphone } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, businessphone: e.target.value })} // Update on change
                  autoComplete="tel"  // Use tel for autocomplete
                  pattern="[0-9]*"  // Optional: restrict to numbers only
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  placeholder="Es. +39 332 345 6789"  // Add a placeholder for better UX
                  required // Optionally make the field required
                />
              </div>
            </div>



            <div className="sm:col-span-2">
              <label htmlFor="drivingLicenseExp" className="block text-sm font-medium leading-6 text-gray-900">
                Scadenza Patente
                </label>
              <div className="mt-2">
                <input
                  type="date"
                  name="drivingLicenseExp"
                  id="drivingLicenseExp"
                  value={formData?.drivingLicenseExp } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, drivingLicenseExp: e.target.value })} // Update on change
                  autoComplete="drivingLicenseExp"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="qualification" className="block text-sm font-medium leading-6 text-gray-900">
               Titolo di Studio
                </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="qualification"
                  id="qualification"
                  value={formData?.qualification } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} // Update on change
                  autoComplete="qualification"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="institute" className="block text-sm font-medium leading-6 text-gray-900">
                Istituto
                </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="institute"
                  id="institute"
                  value={formData?.institute } // Bind to formData
                  onChange={(e) => setFormData({ ...formData, institute: e.target.value })} // Update on change
                  autoComplete="institute"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            </div>


  

          </div>
        </div>
      </div>

      { /* Update User Button */ }
      
      <div className="mt-6 flex items-center justify-end gap-x-6">
        {UpdateSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">User updated successfully</h3>
              </div>
            </div>
          </div>
        )}

        {UpdateSuccess === false && (
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
          onClick={updateUser}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
          Crea
        </button>
      </div>
    </form>
  )
}
