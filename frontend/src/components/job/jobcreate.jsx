import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Select from 'react-tailwindcss-select';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [salesorder, setSalesOrder] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState([]);

  useEffect(() => {
    
    axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read/`, )
    .then((response) => {
      const salesorder = response.data.salesorders.map((salesorder) => ({
        value: salesorder.id_salesorder,
        label: salesorder.name,
      }));
      setSalesOrder(salesorder);
    })
    .catch((error) => {
      console.error('Error fetching sales orders:', error);
    });
  }, []);

  const handleSalesOrderChange = (value) => {
    setSelectedSalesOrder(value);
  };

  const createJob = (event) => {
    event.preventDefault();
  
    const jsonObject = {
      SalesOrders: selectedSalesOrder.map((salesorder) => salesorder.value),
    };

    // Using toast.promise for notifications
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/job/create`, jsonObject,),
     toast.loading ("In Creazione")
    )
    .then((response) => {
       toast.success('Job creato con successo!');
     
    })
    .catch((error) => {
      toast.error('Errore durante la creazione del job');
    });
  };

  return (
    <form name="createoffer">
      <Toaster /> {/* Renders the toast notifications */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="salesorder" className="block text-sm font-medium leading-6 text-gray-900">
                Ordine di vendita
              </label>
              <div className="mt-2">
                <Select
                  options={salesorder}
                  id="salesorder"
                  name="salesorder"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  value={selectedSalesOrder}
                  onChange={handleSalesOrderChange}
                  isMultiple={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          onClick={createJob}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea
        </button>
      </div>
    </form>
  );
}
