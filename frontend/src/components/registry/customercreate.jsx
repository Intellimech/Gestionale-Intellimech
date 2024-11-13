import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientForm() {
  const [clienttypes, setClienttypes] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedClienttype, setSelectedClienttype] = useState(null);
  const [isClient, setIsClient] = useState(true); // Stato per radio button

  useEffect(() => {
    // Fetching client types data
    axios
      .get(`${process.env.REACT_APP_API_URL}/clienttype/read`)
      .then((response) => {
        setClienttypes(
          response.data.clients.map((item) => ({
            value: item.id_clienttype,
            label: item.description,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching client type data:', error);
      });
  }, []);

  const handleClientChange = (value) => {
    setSelectedClienttype(value);
  }

  const handleCompanyTypeChange = (event) => {
    setIsClient(event.target.value === 'client');
  }

  const createCustomer = (event) => {
    event.preventDefault();
   
    const form = document.forms.createquotationrequest;
    const formData = new FormData(form);
  
    formData.append('isClient', isClient ? 1 : 0);
    formData.append('isSuppliers', isClient ? 0 : 1);
    formData.append('clienttype', selectedClienttype?.value || '');
  
    // Convert formData to JSON
    let jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });
  
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/company/create`, jsonObject),
      {
        loading: 'Creazione in corso...',
        success: 'Cliente creato con successo!',
        error: 'Errore durante la creazione del Cliente',
      }
    )
    .catch((error) => {
      console.error('Errore durante la creazione del cliente:', error);
      throw new Error('Errore durante la creazione del cliente');
    });
  };
  
  return (
      <div className="space-y-12">
          <Toaster/>
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Azienda</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Inserisci i dettagli completi dell'azienda.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Nome Cliente */}
            <div className="col-span-full">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Nome Cliente
              </label>
              <input
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
              />
            </div>

            {/* Tipo di Azienda */}
            <div className="col-span-full">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Tipo di Azienda
              </label>
              <div className="flex gap-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="client"
                    checked={isClient}
                    onChange={handleCompanyTypeChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Cliente</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="supplier"
                    checked={!isClient}
                    onChange={handleCompanyTypeChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Fornitore</span>
                </label>
              </div>
            </div>

            {/* Categoria */}
            <div className="sm:col-span-2 w-full">
              <label htmlFor="clienttype" className="block text-sm font-medium leading-6 text-gray-900">
                Tipo Cliente
              </label>
              <div className="mt-2 w-full">
                <Select
                  id="clienttype"
                  name="clienttype"
                  options={clienttypes}
                  value={selectedClienttype}
                  onChange={handleClientChange}
                  placeholder="Seleziona"
                  isSearchable
                />
              </div>
            </div>

            {/* VAT */}
            <div className="col-span-full">
              <label htmlFor="vat" className="block text-sm font-medium leading-6 text-gray-900">
                VAT
              </label>
              <input
                name="VAT"
                id="vat"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
              />
            </div>

            {/* Codice Fiscale */}
            <div className="col-span-full">
              <label htmlFor="fiscalcode" className="block text-sm font-medium leading-6 text-gray-900">
                Codice Fiscale
              </label>
              <input
                name="fiscalcode"
                id="fiscalcode"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
              />
            </div>

            {/* SDI, PEC, Address, ZIP, City, Province, Country */}
            {['SDI', 'PEC', 'Address', 'ZIP', 'City', 'Province', 'Country'].map((field) => (
              <div key={field} className="col-span-full">
                <label htmlFor={field.toLowerCase()} className="block text-sm font-medium leading-6 text-gray-900">
                  {field}
                </label>
                <input
                  name={field}
                  id={field.toLowerCase()}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                />
              </div>
            ))}
          </div>
        </div>
    

      {/* Submit Button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          onClick={createCustomer}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea
        </button>
      </div>  </div>
  );
}
