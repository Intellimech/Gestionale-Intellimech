import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientUpdateForm({ company }) {
  const [clienttypes, setClienttypes] = useState([]);
  const [selectedClienttype, setSelectedClienttype] = useState(null);
  const [companyType, setCompanyType] = useState({
    isClient: company?.isClient || false,
    isSupplier: company?.isSupplier || false,
  });
  const [isEditing, setIsEditing] = useState(false);


  // References for each form field
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
    // Fetch client types data
    axios
      .get(`${process.env.REACT_APP_API_URL}/clienttype/read`)
      .then((response) => {
        const clientTypesData = response.data.clients.map((item) => ({
          value: item.id_clienttype,
          label: item.description,
        }));
        setClienttypes(clientTypesData);

        const initialClientType = clientTypesData.find((type) => type.value === company?.clienttype);
        setSelectedClienttype(initialClientType || null);
      })
      .catch((error) => {
        console.error('Error fetching client type data:', error);
      });

    if (company) {
      if (nameRef.current) nameRef.current.value = company.name || '';
      if (vatRef.current) vatRef.current.value = company.VAT|| '';
      if (fiscalcodeRef.current) fiscalcodeRef.current.value = company.Fiscal_Code || '';
      if (SDIRef.current) SDIRef.current.value = company.SDI || '';
      if (PECRef.current) PECRef.current.value = company.PEC || '';
      if (addressRef.current) addressRef.current.value = company.Address || '';
      if (ZIPRef.current) ZIPRef.current.value = company.ZIP || '';
      if (cityRef.current) cityRef.current.value = company.City || '';
      if (provinceRef.current) provinceRef.current.value = company.Province || '';
      if (countryRef.current) countryRef.current.value = company.Country || '';
    }
  }, [company]);

  const handleClientChange = (value) => {
    console.log('Selected client type:', value);
    setSelectedClienttype(value);
  };

  const handleCompanyTypeChange = (event) => {
    const { value, checked } = event.target;
    setCompanyType((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  const updateCustomer = (event) => {
    event.preventDefault();
    const jsonObject = {
      id: company.id_company,
      name: nameRef.current.value || '',
      isClient: companyType.isClient ? 1 : 0,
      isSupplier: companyType.isSupplier ? 1 : 0,
      clienttype: selectedClienttype?.value ,
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
    console.log('Payload inviato:', jsonObject);
  
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/company/update`, jsonObject, {
       
      }),
      {
        loading: 'Updating...',
        success: 'Company updated successfully!',
        error: 'Error updating company',
      }
    ).catch((error) => {
      console.error('Error updating company:', error);
      throw new Error('Error updating company');
    });
  };
  return (
    <div className="space-y-12">
      
      <div className="border-b border-gray pb-12">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Azienda</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Inserisci i dettagli completi dell'azienda.</p>

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Nome Cliente */}
          <div className="col-span-full">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Nome Cliente
            </label>
            <input ref={nameRef} id="name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Tipo di Azienda */}
          <div className="col-span-full">
            <label className="block text-sm font-medium leading-6 text-gray-900">Tipo di Azienda</label>
            <div className="flex gap-4 mt-2">
              <label className="inline-flex items-center">
                <input type="checkbox" value="isClient" checked={companyType.isClient} onChange={handleCompanyTypeChange} />
                <span className="ml-2">Cliente</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" value="isSupplier" checked={companyType.isSupplier} onChange={handleCompanyTypeChange} />
                <span className="ml-2">Fornitore</span>
              </label>
            </div>
          </div>

  {/* Categoria */}
<div className="sm:col-span-2">
  <label htmlFor="clienttype" className="block text-sm font-medium leading-6 text-gray-900">
    Tipo Cliente
  </label>

  <div className="mt-2 w-full flex items-center space-x-2">
    {/* Display the current company clienttype description */}
    <span className="text-md text-bold text-gray-900">
      {company?.ClientType?.description}
    </span>

    {/* Allow the user to change the value by showing the select dropdown */}
    <button
      type="button"
      className="text-gray-600 text-sm hover:underline"
      onClick={() => {
        setIsEditing(true);
      }}
    >
      Modifica
    </button>
  </div>

  {/* Select component for changing the value (conditional rendering) */}
  {isEditing && (
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
  )}
</div>


          {/* VAT */}
          <div className="col-span-full">
            <label htmlFor="vat" className="block text-sm font-medium leading-6 text-gray-900">VAT</label>
            <input ref={vatRef} id="VAT"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Fiscal Code */}
          <div className="col-span-full">
            <label htmlFor="fiscalcode" className="block text-sm font-medium leading-6 text-gray-900">Codice Fiscale</label>
            <input ref={fiscalcodeRef} id="fiscalcode"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* SDI */}
          <div className="col-span-full">
            <label htmlFor="SDI" className="block text-sm font-medium leading-6 text-gray-900">SDI</label>
            <input ref={SDIRef} id="SDI"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* PEC */}
          <div className="col-span-full">
            <label htmlFor="PEC" className="block text-sm font-medium leading-6 text-gray-900">PEC</label>
            <input ref={PECRef} id="PEC"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* Address */}
          <div className="col-span-full">
            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Indirizzo</label>
            <input ref={addressRef} id="address"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
            />
          </div>

          {/* ZIP */}
          <div className="col-span-full">
            <label htmlFor="ZIP" className="block text-sm font-medium leading-6 text-gray-900">CAP</label>
            <input ref={ZIPRef} id="ZIP"  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
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
          onClick={updateCustomer}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea
        </button>
      </div>

      <Toaster />
    </div>
  );
}
