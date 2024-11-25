import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from "react-tailwindcss-select";
import { Toaster, toast } from 'react-hot-toast';

export default function ContractCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([{
    category: '',
    subcategory: '',
    unit_price: '',
    quantity: 1,
    description: ''
  }]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [currency, setCurrency] = useState({ value: 'EUR', label: 'EUR' });
  const [recurrence, setRecurrence] = useState(null);
  const [contractStartDate, setContractStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [contractEndDate, setContractEndDate] = useState('');
  const [IVA, setIVA] = useState(0);
  const [total, setTotal] = useState(0);

  const currencies = ['EUR', 'USD', 'GBP'];
  const recurrences = ['Mensile', 'Bimestrale', 'Trimestrale', 'Annuale', 'Biannuale'];
  const paymentMethods = ['Bonifico Bancario', 'Carta di Credito_Floreani', 'Carta di Credito_Fasanotti', 'Carta di Credito_Ierace', 'Paypal'];

  const fetchCompanies = async () => {
    try {
      const { data: { value: companies } } = await axios.get(`${process.env.REACT_APP_API_URL}/company/read`);
      setCompanies(companies.map(({ id_company, name }) => ({ value: id_company, label: name })));
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const createContract = async (event) => {
    event.preventDefault();

    const contractData = {
      id_company: selectedCompany?.value,
      total: parseFloat(total),
      payment_method: paymentMethod?.value,
      currency: currency?.value,
      recurrence: recurrence?.value,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
      IVA: parseFloat(IVA),
    };

    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/contract/create`, contractData),
      {
        loading: 'Creating contract...',
        success: 'Contract created successfully!',
        error: 'Error creating contract',
      }
    )
      .then(() => setCreateSuccess(true))
      .catch((error) => {
        setErrorMessages(error.response?.data?.message || 'Unexpected error occurred');
        setCreateSuccess(false);
      });
  };

  return (
    <form onSubmit={createContract}>
      <Toaster />
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Contract Details</h2>
          <p className="mt-1 text-sm leading-6 text-gray-700">Enter the details to create a new contract.</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-900">
                Fornitore
              </label>
              <Select
                id="company"
                value={selectedCompany}
                onChange={setSelectedCompany}
                options={companies}
                isSearchable
                primaryColor="#7fb7d4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-900">
                Metodo di Pagamento
              </label>
              <Select
                id="paymentMethod"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={paymentMethods.map((method) => ({ value: method, label: method }))}
                isSearchable
                primaryColor="#7fb7d4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="iva" className="block text-sm font-medium text-gray-900">
                Prezzo
              </label>
              <input
                type="number"
                id="price"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-900">
                Valuta
              </label>
              <Select
                id="currency"
                value={currency}
                onChange={setCurrency}
                options={currencies.map((cur) => ({ value: cur, label: cur }))}
                primaryColor="#7fb7d4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-900">
                Ricorrenza
              </label>
              <Select
                id="recurrence"
                value={recurrence}
                onChange={setRecurrence}
                options={recurrences.map((rec) => ({ value: rec, label: rec }))}
                primaryColor="#7fb7d4"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-900">
                Data di inizio
              </label>
              <input
                type="date"
                id="startDate"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-900">
                Data di fine
              </label>
              <input
                type="date"
                id="endDate"
                value={contractEndDate}
                onChange={(e) => setContractEndDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="iva" className="block text-sm font-medium text-gray-900">
                IVA (%)
              </label>
              <input
                type="number"
                id="iva"
                value={IVA}
                onChange={(e) => setIVA(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#639fb8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#639fb8]"
        >
          Crea
        </button>
      </div>
    </form>
  );
}
