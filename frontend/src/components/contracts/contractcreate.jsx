import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckBadgeIcon, XCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import ContractRowInput from './contractrowinput.jsx';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEndDate, setSelectedEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrenceNumber, setRecurrenceNumber] = useState();
  const [contracts, setContracts] = useState([{
    category: '',
    subcategory: '',
    subsubcategory: null,
    subcategories: [],
    subsubcategories: [],
    description: '',
    quantity: 1,
    unit_price: '',
    total_price: '',
    total: '',
    taxedtotal: '',
    vat: '',
    unit_price_excl_vat: '',
    total_excl_vat: '',
    recurrence: '',
    recurrence_number: '',
    
  }]);
  const [recurrence, setRecurrence] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [currencies, setCurrencies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recurrences, setRecurrences] = useState([]);
  const calculateTotalSum = () => {
    
    return contracts.reduce((sum, contract) => sum + (parseFloat(contract.unit_price*recurrenceNumber) || 0), 0);
  };
  
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/paymentmethod/read`)
      .then((response) => {
        setPaymentMethods(response.data.paymentmethods);
      })
      .catch((error) => {
        console.error('Error fetching paymentmethods:', error);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/currency/read`)
      .then((response) => {
        setCurrencies(response.data.currencies);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching currencies:', error);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/recurrence/read`)
      .then((response) => {
        setRecurrences(response.data.recurrences);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching recurrences:', error);
      });
  }, []);
  useEffect(() => {
    if (recurrence && recurrenceNumber && selectedStartDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(start);
  
      switch (recurrence.label) {  // Usa recurrence.value se è un oggetto di Select
        case 'Mensile':
          end.setMonth(start.getMonth() + parseInt(recurrenceNumber));
          break;
        case 'Bimestrale':
          end.setMonth(start.getMonth() + (parseInt(recurrenceNumber) * 2));
          break;
        case 'Trimestrale':
          end.setMonth(start.getMonth() + (parseInt(recurrenceNumber) * 3));
          break;
        case 'Annuale':
          end.setFullYear(start.getFullYear() + parseInt(recurrenceNumber));
          break;
        case 'Biannuale':
          end.setFullYear(start.getFullYear() + (parseInt(recurrenceNumber) * 2));
          break;
        default:
          return;
      }
      
      // Sottrae un giorno per essere l'ultimo giorno del periodo
      end.setDate(end.getDate() - 1);
  
      // Imposta direttamente la data di fine
      setSelectedEndDate(end.toISOString().split('T')[0]);
    }
  }, [selectedStartDate, recurrence, recurrenceNumber]);
  // Rest of the existing useEffect hooks remain the same...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: { categories } },
          { data: { value: companies } },
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/company/read`),
        ]);

        setCategories(categories);
        setCompanies(companies
          .sort((a, b) => new Date(b.ReceptionDate) - new Date(a.ReceptionDate))
          .map(({ id_company, name }) => ({ value: id_company, label: name })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = async (event, index) => {
    const updatedContracts = [...contracts];
    updatedContracts[index].category = event.target.value;
  
    try {
      const { data: { subcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`);
      updatedContracts[index].subcategories = subcategories;
      setContracts(updatedContracts);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };

  const handleSubcategoryChange = async (event, index) => {
    const updatedContracts = [...contracts];
    updatedContracts[index].subcategory = event.target.value;
  
    try {
      const { data: { subsubcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read/${event.target.value}`);
      updatedContracts[index].subsubcategories = subsubcategories;
      updatedContracts[index].subsubcategory = '';
      setContracts(updatedContracts);
    } catch (error) {
      console.error('Error fetching subsubcategory data:', error);
    }
  };
  const handleCompanyChange = setSelectedCompany;
  const handlePaymentMethodChange = setSelectedPaymentMethod;
  const handleCurrencyChange = setCurrency;
  const handleStartDateChange = (event) => setSelectedStartDate(event.target.value);

  const addContract = () => setContracts([...contracts, { 
    category: '', 
    subcategory: '',  
    subsubcategory: null, 
    description: '',
    quantity: 1,
    unit_price: '',
    total: '',
    taxedtotal: '',
    vat: '',
    unit_price_excl_vat: '',
    total_excl_vat: '',
    recurrence: '',
    recurrence_number: '', 
    subcategories: [],
    subsubcategories: []
  }]);

  const removeContract = (index) => setContracts(contracts.filter((_, i) => i !== index));
  const updateContract = (index, updatedContract) => setContracts(contracts.map((contract, i) => (i === index ? updatedContract : contract)));

  const createContract = async (event) => {
    event.preventDefault();

    const jsonObject = {
      id_company: selectedCompany?.value,
      payment: selectedPaymentMethod.value,
      date_start: selectedStartDate,
      date_end: selectedEndDate,
      currency: currency.value,
      recurrence: recurrence.value,
      recurrence_number: recurrenceNumber,
      total: calculateTotalSum(),
      contracts: contracts.map((contract) => ({
        
        category: contract.category,
        total: contract.total,
        taxedtotal: contract.taxedtotal,
        subcategory: contract.subcategory,
        subsubcategory: contract.subsubcategory,
        description: contract.description || '',
        unit_price: parseFloat(contract.unit_price),
        taxed_unit_price: parseFloat(contract.taxed_unit_price),
        taxed_totalprice: parseFloat( (contract.taxed_unit_price * recurrenceNumber).toFixed(2)),
        totalprice: parseFloat(contract.unit_price * recurrenceNumber).toFixed(2),
        // quantity: parseInt(contract.quantity, 10),
        vat: contract.vat || 0,
        // recurrence: contract.recurrence || '',
        // recurrence_number: contract.recurrence_number || ''
      }))
    };
console.log(jsonObject);
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/contract/create`, jsonObject),
      {
        loading: 'Invio in corso...',
        success: 'Contratto creato con successo!',
        error: 'Errore durante la creazione del Contratto',
      }
    )
      .then((response) => {
        setCreateSuccess(true);
      })
      .catch((error) => {
        setErrorMessages(error.response.data.message);
        setCreateSuccess(false);
      });
  };
  const handleEndDateChange = (event) => setSelectedEndDate(event.target.value);


  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <Toaster />
      <form onSubmit={createContract} className="space-y-8">
        {/* Informazioni Generali */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Informazioni Contratto</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Compila i campi sottostanti per creare un nuovo contratto.
          </p>
          <table className="w-full mt-6 text-[10px]">
          <tbody>
            {/* Cliente */}
            <tr>
              <td className="w-1/3 text-sm font-medium text-gray-700">Fornitore</td>
              <td className="w-2/3">
                <Select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  options={(companies || []).map(({ value, label }) => ({ value, label }))}
                  primaryColor="#7fb7d4"
                  isSearchable
                  placeholder="Seleziona Fornitore"
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                />
              </td>
            </tr>
            {/* Data Inizio */}
            <tr>
              <td className="w-1/3 text-sm font-medium text-gray-700">Data Inizio</td>
              <td className="w-2/3">
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={handleStartDateChange}
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                  min={new Date().toISOString().split('T')[0]}
                />
              </td>
            </tr>
            {/* Data Fine */}
            <tr>
              <td className="w-1/3 text-sm font-medium text-gray-700">Data Fine</td>
              <td className="w-2/3">
              <input
                type="date"
                value={selectedEndDate}
                onChange={handleEndDateChange}
                className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                min={selectedStartDate}  // Assicura che la data di fine non sia precedente a quella di inizio
              />
              </td>
            </tr>
            {/* Metodo di Pagamento */}
            <tr>
              <td className="w-1/3 text-sm font-medium text-gray-700">Metodo di Pagamento</td>
              <td className="w-2/3">
                <Select
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  options={paymentMethods.map((method) => ({ value: method.id_paymentmethod, label: method.name }))}
                  primaryColor="#7fb7d4"
                  isSearchable
                  placeholder="Seleziona Metodo di Pagamento"
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                />
              </td>
            </tr>
            {/* Valuta */}
            <tr>
              <td className="w-1/3 text-sm font-medium text-gray-700">Valuta</td>
              <td className="w-2/3">
                <Select
                  value={currency}
                  onChange={handleCurrencyChange}
                  options={currencies.map((currency) => ({ value: currency.id_currency, label: currency.name }))}
                  primaryColor="#7fb7d4"
                  isSearchable
                  placeholder="Seleziona Valuta"
                  className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                />
              </td>
            </tr>
            {/* Ricorrenza */}
            <tr>
            <td className="w-1/3 text-sm font-medium text-gray-700 align-middle">Ricorrenza</td>
            <td className="w-2/3">
              <div className="flex space-x-4">
                <div className="flex-grow">
                  <Select
                    value={recurrence}
                    onChange={(selectedRecurrence) => {
                      const updatedContracts = contracts.map(contract => ({
                        ...contract,
                        recurrence: selectedRecurrence.value,
                      }));
                      setContracts(updatedContracts);
                      setRecurrence(selectedRecurrence);
                    }}
                    options={recurrences.map((recurrence) => ({
                      value: recurrence.id_recurrence,
                      label: recurrence.name,
                    }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    placeholder="Seleziona Ricorrenza"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </div>
                <div className="w-1/4">
                  <input
                    type="number"
                    value={recurrenceNumber}
                    onChange={(e) => setRecurrenceNumber(e.target.value)}
                    min="1"
                    placeholder="N. di ricorrenze"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </div>
              </div>
            </td>
          </tr>

          </tbody>
        </table>

        </div>
  
        {/* Prodotti */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Servizi</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Aggiungi o modifica i servizi associati al contratto.
          </p>
          <div className="mt-4 space-y-4">
            {contracts.map((contract, index) => (
              <ContractRowInput
                key={index}
                contract={contract}
                onChange={(updatedContract) => updateContract(index, updatedContract)}
                onRemove={() => removeContract(index)}
                currencies={currencies}
                currency={currency}
                setCurrency={setCurrency}
                recurrenceNumber= {recurrenceNumber}
                categories= {categories}
                subcategories= {contract.subcategories}
                subsubcategories= {contract.subsubcategories}
                handleCategoryChange={(e) => handleCategoryChange(e, index)}
                handleSubcategoryChange={(e) => handleSubcategoryChange(e, index)}
              />
            ))}
            <button
              type="button"
              onClick={addContract}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Aggiungi Prodotto
            </button>
          </div>
        </div>
  
        {/* Messaggi di Feedback */}
        {createSuccess !== null && (
          <div className={`mt-4 rounded-md ${createSuccess ? 'bg-green-50' : 'bg-red-50'} p-3`}>
            <div className="flex">
              {createSuccess ? (
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
              <div className="ml-3 text-[10px]">
                <h3 className={`font-medium ${createSuccess ? 'text-green-800' : 'text-red-800'}`}>
                  {createSuccess
                    ? 'Contratto creato con successo!'
                    : 'Errore durante la creazione'}
                </h3>
                {!createSuccess && <ul className="list-disc pl-5 space-y-1 text-red-700">{errorMessages}</ul>}
              </div>
            </div>
          </div>
        )}
        {/* Totale Somma */}
      <div className="border-t border-gray-200 pt-4 text-right text-sm font-medium text-gray-700">
        Totale Complessivo: 
        <span className="ml-2 text-lg font-bold text-gray-900">
          {calculateTotalSum().toFixed(2)} {currency?.label || 'EUR'}
        </span>
      </div>

        {/* Pulsante di Invio */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-[#A7D0EB] px-4 py-2 text-xs font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Crea Contratto
          </button>
        </div>
      </form>
    </div>
  );
}