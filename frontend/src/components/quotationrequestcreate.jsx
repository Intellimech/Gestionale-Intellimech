import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';

export default function UserCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [company, setCompany] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  
  const [purchaseOrder, setPurchaseOrder] = useState([])
  const [technicalArea, setTechnicalArea] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    // Fetching company data
    axios.get(`${process.env.REACT_APP_API_URL}/company/read`, { 
      headers: { authorization: `Bearer ${token}` },
      params: { filter: "client" }
    })
    .then((response) => {
      setCompany(response.data.value);
    })
    .catch((error) => {
      console.error('Error fetching company data:', error);
    });

    // Fetching category data
    axios.get(`${process.env.REACT_APP_API_URL}/category/read`, { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      setCategory(response.data.categories);
    })
    .catch((error) => {
      console.error('Error fetching category data:', error);
    });

    // Fetching technical area data
    axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      setTechnicalArea(response.data.technicalareas);
    })
    .catch((error) => {
      console.error('Error fetching technical area data:', error);
    });
  }, []);

  const handleCategoryChange = (event) => {
    const token = Cookies.get('token');
    // Fetching subcategories with the selected category
    axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`, { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      setSubcategory(response.data.subcategories);
      console.log(response.data.subcategories)
      console.log(event.target.value)
    })
    .catch((error) => {
      console.error('Error fetching subcategory data:', error);
    });
  };

  const createQuotationRequest = (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    const form = document.forms.createquotationrequest;
    const formData = new FormData(form);
    // Converting formData to JSON
    let jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });
    // Posting data to create quotation request
    axios.post(`${process.env.REACT_APP_API_URL}/quotationrequest/create`, jsonObject, { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      
      setCreateSuccess(true);
    })
    .catch((error) => {
      setCreateSuccess(false);
      setErrorMessages(error.response.data.message);
    });
  };

  return (
    <form name='createquotationrequest'>
      {/* Account Information */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="col-span-full">
              <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
                Azienda
              </label>
              <div className="mt-2">
                <select
                  id="company"
                  name="company"
                  autoComplete="company-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                >
                  {company.map((item) => (
                    <option key={item.id_company} value={item.id_company}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Categoria
              </label>
              <div className="mt-2">
                <select
                  id="category"
                  name="category"
                  onChange={handleCategoryChange}
                  autoComplete="category-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  {category.map((item) => (
                    <option key={item.id_category} value={item.id_category}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subcategory" className="block text-sm font-medium leading-6 text-gray-900">
                Sotto Categoria
              </label>
              <div className="mt-2">
                <select
                  id="subcategory"
                  name="subcategory"
                  autoComplete="subcategory-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  disabled={subcategory.length === 0}
                >
                  {subcategory.map((item) => (
                    <option key={item.id_subcategory} value={item.id_subcategory}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="technicalarea" className="block text-sm font-medium leading-6 text-gray-900">
                Area Tecnica
              </label>
              <div className="mt-2">
                <select
                  id="technicalarea"
                  name="technicalarea"
                  autoComplete="technicalarea-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  {technicalArea.map((item) => (
                    <option key={item.id_technicalarea} value={item.id_technicalarea}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Descrizione
              </label>
              <div className="mt-2">
                <textarea
                  rows={4}
                  maxLength={150}
                  name="description"
                  id="description"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  defaultValue={''}
                />
                <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Create Quotation Request Button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        {createSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-green-800">Richiesta di offerta creata con successo</h3>
            </div>
          </div>
        )}

        {createSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-red-800">{errorMessages}</h3>
            </div>
          </div>
        )}

        <button
          onClick={createQuotationRequest}
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          Crea
        </button>
      </div>
    </form>
  );
}
