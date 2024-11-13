import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientForm() {
  const [clienttypes, setClienttypes] = useState([]);
  const [selectedClienttype, setSelectedClienttype] = useState(null);
  const [isClient, setIsClient] = useState(true);

  // Riferimenti per ogni campo del form
  const nameRef = useRef(null);
  const vatRef = useRef(null);
  const fiscalcodeRef = useRef(null);
  const SDIRef = useRef(null);
  const PECRef = useRef(null);
  const addressRef = useRef(null);
  const ZIPRef = useRef(null);
  const cityRef = useRef(null);
  const provinceRef = useRef(null);
  const countryRef = useRef(null);

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
  };

  const handleCompanyTypeChange = (event) => {
    setIsClient(event.target.value === 'client');
  };

  const createCustomer = (event) => {
    event.preventDefault();

    // Crea un oggetto JSON con i dati del form
    const jsonObject = {
      name: nameRef.current.value || '',
      isClient: isClient ? 1 : 0,
      isSuppliers: !isClient ? 1 : 0,
      clienttype: selectedClienttype?.value || '',
      vat: vatRef.current.value || '',
      fiscalcode: fiscalcodeRef.current.value || '',
      SDI: SDIRef.current.value || '',
      PEC: PECRef.current.value || '',
      address: addressRef.current.value || '',
      ZIP: ZIPRef.current.value || '',
      city: cityRef.current.value || '',
      province: provinceRef.current.value || '',
      country: countryRef.current.value || '',
    };

    // Invia la richiesta POST con i dati JSON
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/company/create`, jsonObject, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`,
        },
      }),
      {
        loading: 'Creazione in corso...',
        success: 'Cliente creato con successo!',
        error: 'Errore durante la creazione del Cliente',
      }
    ).catch((error) => {
      console.error('Errore durante la creazione del cliente:', error);
      throw new Error('Errore durante la creazione del cliente');
    });
  };

  return (
    <div className="space-y-12">
      <Toaster />
      <div className="border-b border-gray-900/10 pb-12">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Azienda</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Inserisci i dettagli completi dell'azienda.</p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Nome Cliente */}
          <div className="col-span-full">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Nome Cliente
            </label>
            <input
              ref={nameRef}
              id="name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Tipo di Azienda */}
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">Tipo di Azienda</label>
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
            <label htmlFor="vat" className="block text-sm font-medium leading-6 text-gray-900">VAT</label>
            <input
              ref={vatRef}
              id="vat"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Codice Fiscale */}
          <div className="col-span-full">
            <label htmlFor="fiscalcode" className="block text-sm font-medium leading-6 text-gray-900">Codice Fiscale</label>
            <input
              ref={fiscalcodeRef}
              id="fiscalcode"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Altri campi */}
          <div className="col-span-full">
            <label htmlFor="SDI" className="block text-sm font-medium leading-6 text-gray-900">SDI</label>
            <input
              ref={SDIRef}
              id="SDI"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="PEC" className="block text-sm font-medium leading-6 text-gray-900">PEC</label>
            <input
              ref={PECRef}
              id="PEC"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="Address" className="block text-sm font-medium leading-6 text-gray-900">Indirizzo</label>
            <input
              ref={addressRef}
              id="Address"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="ZIP" className="block text-sm font-medium leading-6 text-gray-900">CAP</label>
            <input
              ref={ZIPRef}
              id="ZIP"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="City" className="block text-sm font-medium leading-6 text-gray-900">Città</label>
            <input
              ref={cityRef}
              id="City"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="Province" className="block text-sm font-medium leading-6 text-gray-900">Provincia</label>
            <input
              ref={provinceRef}
              id="Province"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="col-span-full">
            <label htmlFor="Country" className="block text-sm font-medium leading-6 text-gray-900">Paese</label>
            <input
              ref={countryRef}
              id="Country"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>
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
      </div>
    </div>
  );
}
