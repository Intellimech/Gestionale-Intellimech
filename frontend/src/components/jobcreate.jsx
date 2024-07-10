import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from 'react-tailwindcss-select';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { set } from 'date-fns';

export default function UserCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [salesorder, setSalesOrder] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    // Fetching company data
    axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read/`, { 
      headers: { authorization: `Bearer ${token}` },
    })
    .then((response) => {
      const salesorder = response.data.salesorders.map((salesorder) => {
        return {
          value: salesorder.id_salesorder,
          label: salesorder.name,
        };
      });
      console.log(salesorder);
      setSalesOrder(salesorder);
    })
    .catch((error) => {
      console.error('Error fetching company data:', error);
    });
  }, []);

  const handleSalesOrderChange = value => {
    setSelectedSalesOrder(value);
    console.log(value);
  };


  const createJob = (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    const form = document.forms.createoffer;
    const formData = new FormData(form);
    // Converting formData to JSON
    let jsonObject = {};

    jsonObject.SalesOrders = selectedSalesOrder.map((salesorder) => salesorder.value);
    console.log(jsonObject);
  
    axios.post(`${process.env.REACT_APP_API_URL}/job/create`, jsonObject, { headers: { authorization: `Bearer ${token}` } })
    .then((response) => {
      setCreateSuccess(true);
    })
    .catch((error) => {
      setErrorMessages(error.response.data.message);
      setCreateSuccess(false);
    });
  };

  return (
    <form name='createoffer'>
      {/* Account Information */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="col-span-full">
              <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
                Ordine di vendita
              </label>
              <div className="mt-2">
                <Select
                  options={salesorder}
                  id="team"
                  name="team"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  value={selectedSalesOrder}
                  onChange={handleSalesOrderChange}
                  isMultiple={true}
                />
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
          onClick={createJob}
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          Crea
        </button>
      </div>
    </form>
  );
}
