import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [salesorder, setSalesOrder] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState([]);
  const [quotationRequestsToUpdate, setQuotationRequestsToUpdate] = useState([]);
  const [showAdditionalInput, setShowAdditionalInput] = useState(false);
  const [additionalInputValue, setAdditionalInputValue] = useState("");

  // Fetch sales orders and set them up
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read/`)
      .then((response) => {
        const salesorder = response.data.salesorders.map((salesorder) => ({
          value: salesorder.id_salesorder,
          label: salesorder.name,
          offer: salesorder.Offer, // We need this for the QuotationRequest check
        }));
        setSalesOrder(salesorder);
      })
      .catch((error) => {
        console.error('Error fetching sales orders:', error);
      });
  }, []);

  // Handle sales order selection
  const handleSalesOrderChange = (values) => {
    setSelectedSalesOrder(values);

    // Find orders with ProjectType id_projecttype === 5
    const quotationRequests = values
      .filter(order => order?.offer?.QuotationRequest?.ProjectType?.id_projecttype === 5)
      .map(order => order.offer.QuotationRequest.id_quotationrequest);

    setQuotationRequestsToUpdate(quotationRequests);

    // Show additional input only if there's at least one matching ProjectType
    setShowAdditionalInput(quotationRequests.length > 0);
  };

  // Handle additional input change
  const handleAdditionalInputChange = (e) => {
    setAdditionalInputValue(e.target.value);
  };

  // Create job handler
  const createJob = (event) => {
    event.preventDefault();

    const jsonObject = {
      SalesOrders: selectedSalesOrder.map((salesorder) => salesorder.value),
    };

    // Create the job
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/job/create`, jsonObject),
      {
        loading: "In Creazione...",
        success: "Job creato con successo!",
        error: "Errore durante la creazione del job.",
      }
    );

    // Update QuotationRequests if any
    if (quotationRequestsToUpdate.length > 0) {
      quotationRequestsToUpdate.forEach((id_quotationrequest) => {
        toast.promise(
          axios.put(`${process.env.REACT_APP_API_URL}/quotationrequest/update/${id_quotationrequest}`, {externalcode: additionalInputValue}),
          {
            loading: `Aggiornamento QuotationRequest ${id_quotationrequest}...`,
            success: `QuotationRequest ${id_quotationrequest} aggiornata con successo!`,
            error: `Errore durante l'aggiornamento della QuotationRequest ${id_quotationrequest}.`,
          }
        );
      });
    }
    console.log(additionalInputValue);
    window.location.reload();
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
                  isClearable
                />
              </div>
            </div>

            {/* Additional Input Field */}
            {showAdditionalInput && (
              <div className="col-span-full">
                <label htmlFor="additionalInput" className="block text-sm font-medium leading-6 text-gray-900">
                  CUP
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="additionalInput"
                    name="additionalInput"
                    value={additionalInputValue}
                    onChange={handleAdditionalInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
                    placeholder="Inserisci valore aggiuntivo"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          onClick={createJob}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-4 py-2 text-center text-sm font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea Job
        </button>
      </div>
    </form>
  );
}
