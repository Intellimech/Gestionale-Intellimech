import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckBadgeIcon, XCircleIcon, PlusIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseRowInput from './purchaserowinput.jsx';
import toast, { Toaster } from 'react-hot-toast';

export default function PurchaseCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [users, setUsers]= useState([]);
  const [job, setJob]= useState([]);
  const [selecteduser, setSelectedUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([{
    category: '',
    subcategory: '',
    subsubcategory: null,
    subcategories: [],
    subsubcategories: [],
    unit_price: '',
    quantity: 1,
    description: '',
    depreciation: false,
    depreciation_years: '',
    depreciation_aliquota: '',
    depreciation_details: '',
    asset: false
  }]);



  const calculateTotalTaxed = () => {
    
    return products.reduce((sum, product) => sum + (parseFloat(product.unit_price*product.quantity) || 0), 0);
  };
  const [currency, setCurrency] = useState('EUR');

  const banks = ['Vista Fattura', '30 gg D.F.F.M.', '60 gg D.F.F.M.', '50% Anticipato, 50% alla Consegna', '100% Anticipato', 'Frazionato'];
  const [currencies, setCurrencies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const handleCompanyChange = setSelectedCompany;
  const handleBankChange = setSelectedBank;
  const handlePaymentMethodChange = setSelectedPaymentMethod;
  const handleCurrencyChange = setCurrency;
  const handleDateChange = (event) => setSelectedDate(event.target.value);7
  const handleUserChange = setSelectedUser;
  const handleJobChange = setSelectedJob;

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
      .get(`${process.env.REACT_APP_API_URL}/user/read`)
      .then((response) => {
        // Map users to the format expected by react-tailwindcss-select
        const formattedUsers = response.data.users.map(user => ({
          value: user.id_user, // Assuming there's an id_user field
          label: `${user.name} ${user.surname}` // Adjust based on your user object structure
        }));
        setUsers(formattedUsers);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);
  useEffect(() => {
   
      axios
        .get(`${process.env.REACT_APP_API_URL}/job/read`)
        .then((response) => {
          setJob(response.data.jobs || []);
        })
        .catch((error) => {
          console.error('Errore nel caricamento delle commesse:', error);
          toast.error('Errore nel caricamento delle commesse');
        });
  }, []);
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
    const updatedProducts = [...products];
    updatedProducts[index].category = event.target.value;
  
    try {
      const { data: { subcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`);
      updatedProducts[index].subcategories = subcategories;
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };

  const handleSubcategoryChange = async (event, index) => {
    const updatedProducts = [...products];
    updatedProducts[index].subcategory = event.target.value;
  
    try {
      const { data: { subsubcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read/${event.target.value}`);
      updatedProducts[index].subsubcategories = subsubcategories;
      updatedProducts[index].subsubcategory = '';
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error fetching subsubcategory data:', error);
    }
  };

  const addProduct = () => setProducts([...products, { 
    category: '', 
    subcategory: '',  
    subsubcategory: null, 
    unit_price: '', 
    quantity: 1, 
    description: '', 
    subcategories: [],
    subsubcategories: []
  }]);

  const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));
  const updateProduct = (index, updatedProduct) => setProducts(products.map((product, i) => (i === index ? updatedProduct : product)));

  const createPurchaseOrder = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const formDataObject = Object.fromEntries(form.entries());

    const jsonObject = {
      id_company: selectedCompany.value,
      payment: selectedPaymentMethod.value,
      banktransfer: selectedBank.value,
      date: selectedDate,
      referent: selecteduser.value,
      job: selectedJob.value,
      currency: currency.value,
      products: products.map((product) => ({
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        description: product.description || '',
        unit_price: parseFloat(product.unit_price),
        taxed_unit_price: parseFloat(product.taxed_unit_price),
        taxed_totalprice: product.total,
        quantity: parseInt(product.quantity, 10),
        vat: product.vat || 0,
        depreciation: product.depreciation || false,
        depreciation_years: product.depreciation ? parseInt(product.depreciation_years, 10) : null,
        depreciation_aliquota: product.depreciation ? product.depreciation_aliquota : null,
        depreciation_details: product.depreciation ? product.depreciation_details : null,
        asset: product.asset || false
      }))
    };

    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/purchase/create`, jsonObject),
      {
        loading: 'Invio in corso...',
        success: 'ODA creato con successo!',
        error: 'Errore durante la creazione di Ordine di Acquisto',
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
  
  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <Toaster />
      <form onSubmit={createPurchaseOrder} className="space-y-8">
        {/* Informazioni Generali */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Informazioni Ordine di Acquisto</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Compila i campi sottostanti per creare un nuovo ordine di acquisto.
          </p>
          <table className="w-full mt-6 text-[10px]">
            <tbody>
              {/* Fornitore */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Fornitore</td>
                <td>
                  <Select
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    options={(companies).map(({ value, label }) => ({ value, label }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    placeholder="Seleziona Fornitore"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="block text-sm font-medium text-gray-700">Referente</td>
                <td>
                  <Select
                    value={selecteduser}
                    onChange={(selectedOption) => {
                      setSelectedUser(selectedOption);
                    }}
                    options={users}
                    primaryColor="#7fb7d4"
                    isSearchable
                    placeholder="Seleziona Referente"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
              {/* Data */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Data</td>
                <td>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </td>
              </tr>
              {/* Metodo di Pagamento */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Metodo di Pagamento</td>
                <td>
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
              {selectedPaymentMethod && selectedPaymentMethod.value == "1" ? (
              <tr>
                <td className="block text-sm font-medium text-gray-700">Dettagli di Pagamento</td>
                <td>
                  <Select
                    value={selectedBank}
                    onChange={handleBankChange}
                    options={banks.map((b) => ({ value: b , label: b }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    placeholder="Seleziona Metodo di Pagamento"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
            ) : null}


              {/* Valuta */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Valuta</td>
                <td>
                  <Select
                    value={currency}
                    onChange={handleCurrencyChange}
                    options={currencies.map((currency) => ({ value: currency.id_currency, label: currency.name }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    placeholder="Seleziona Valuta"
                    className="block w-full rounded border-gray-300  shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>

              <tr>
                <td className="block text-sm font-medium text-gray-700">Commessa</td>
                <td>
                <Select
                        options={job.map((job) => ({ value: job.id_job, label: job.name }))}
                        id="job"
                        name="job"
                        value={selectedJob}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                        onChange={handleJobChange}
                        isSearchable
                        placeholder="Seleziona una commessa"
                      />
                </td>
              </tr>

            </tbody>
          </table>
        </div>
  
        {/* Prodotti */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Prodotti</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Aggiungi o modifica i prodotti associati all'ordine di acquisto.
          </p>
          <div className="mt-4 space-y-4">
            {products.map((product, index) => (
              <PurchaseRowInput
                key={index}
                product={product}
                onChange={(updatedProduct) => updateProduct(index, updatedProduct)}
                onRemove={() => removeProduct(index)}
                categories={categories}
                subcategories={product.subcategories}
                subsubcategories={product.subsubcategories}
                handleCategoryChange={(e) => handleCategoryChange(e, index)}
                handleSubcategoryChange={(e) => handleSubcategoryChange(e, index)}
                currencies={currencies}
                currency={currency}
                setCurrency={setCurrency}
              />
            ))}
            <button
              type="button"
              onClick={addProduct}
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
                    ? 'Ordine di acquisto creato con successo!'
                    : 'Errore durante la creazione'}
                </h3>
                {!createSuccess && <ul className="list-disc pl-5 space-y-1 text-red-700">{errorMessages}</ul>}
              </div>
            </div>
          </div>
        )}
         <div className="border-t border-gray-200 pt-4 text-right text-sm font-medium text-gray-700">
        Importo Complessivo IVA inclusa: 
        <span className="ml-2 text-lg font-bold text-gray-900">
          {calculateTotalTaxed().toFixed(2)} {currency?.label || 'EUR'}
        </span>
      </div>
  
        {/* Pulsante di Invio */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-[#A7D0EB] px-4 py-2 text-xs font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Crea Ordine di Acquisto
          </button>
        </div>
      </form>
    </div>
  );
}  