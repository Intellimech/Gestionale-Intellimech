import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseRowInput from './purchaserowinput.jsx';
import toast, { Toaster } from 'react-hot-toast';

export default function PurchaseCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  const [currency, setCurrency] = useState('EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal']; // Payment methods options
 
  const handleTeamChange = setSelectedTeam;
  const handleCompanyChange = setSelectedCompany;
  const handlePaymentMethodChange = setSelectedPaymentMethod;
  const handleCurrencyChange = setCurrency;
  const handleDateChange = (event) => setSelectedDate(event.target.value);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const [
          { data: { quotationrequest } },
          { data: { categories } },
          { data: { technicalareas } },
          { data: { users } },
          { data: { value: companies } },
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read/free`,),
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`, ),
          axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, ),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`, ),
          axios.get(`${process.env.REACT_APP_API_URL}/company/read`),
        ]);

        setQuotationRequests(quotationrequest);
        setCategories(categories);
        setTechnicalAreas(technicalareas);
        setUsers(users.map(({ id_user, name, surname }) => ({ value: id_user, label: `${name} ${surname}` })));
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
      const { data: { subcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`,);
      updatedProducts[index].subcategories = subcategories;
      updatedProducts[index].subcategory = '';
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };  

  const addProduct = () => setProducts([...products, { category: '', subcategory: '',  unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));
  const updateProduct = (index, updatedProduct) => setProducts(products.map((product, i) => (i === index ? updatedProduct : product)));

  const createPurchaseOrder = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const formDataObject = Object.fromEntries(form.entries());
  
    const jsonObject = {
      id_company: selectedCompany.value,
      payment: selectedPaymentMethod.value,
      date: selectedDate,
      currency: currency.value,
      products: products.map((product) => ({
        category: product.category,
        subcategory: product.subcategory,
        description: product.description || '',
        unit_price: parseFloat(product.unit_price),
        quantity: parseInt(product.quantity, 10),
      }))
    };
  
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/purchase/create`, jsonObject), // 
      {
        loading: 'Invio in corso...',
        success: 'Richiesta di acquisto creata con successo!',
        error: 'Errore durante la creazione della richiesta di acquisto',
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
    <form name="createpurchaseorder" onSubmit={createPurchaseOrder}>
      <Toaster/>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Ordine di Acquisto</h2>
          <p className="mt-1 text-sm leading-6 text-gray-700">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare l'ordine di acquisto</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="azienda" className="block text-sm font-medium leading-6 text-gray-900">
                Cliente
              </label>
              <div className="mt-2">
                <Select
                  id="azienda"
                  name="azienda"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  options={(companies || []).map(({ value, label }) => ({ value, label }))}
                  primaryColor='[#7fb7d4]'
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="dateorder" className="block text-sm font-medium leading-6 text-gray-900">
                Data
              </label>
              <div className="mt-2">
                <input
                  id="dateorder"
                  name="dateorder"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="paymentMethod" className="block text-sm font-medium leading-6 text-gray-900">
                Modalità di pagamento
              </label>
              <div className="mt-2">
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                  options={paymentMethods.map((method) => ({ value: method, label: method }))}
                  primaryColor='[#7fb7d4]'
                  isSearchable
                />
              </div>
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="paymentMethod" className="block text-sm font-medium leading-6 text-gray-900">
                Valuta
              </label>
              <div className="mt-2">
                <Select
                  id="currency"
                  name="currency"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  value={currency}
                  onChange={handleCurrencyChange}
                  options={currencies.map((currency) => ({ value: currency, label: currency }))}
                  primaryColor='[#7fb7d4]'
                  isSearchable
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-12 py-8">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Prodotti</h2>
          <p className="mt-1 text-sm leading-6 text-gray-700">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare l'ordine di acquisto</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
            {products.map((product, index) => (
              <PurchaseRowInput
                key={index}
                product={product}
                onChange={(updatedProduct) => updateProduct(index, updatedProduct)}
                onRemove={() => removeProduct(index)}
                categories={categories}
                subcategories={product.subcategories}
                handleCategoryChange={(e) => handleCategoryChange(e, index)}
                currencies={currencies}
                currency={currency}
                setCurrency={setCurrency}
              />
            ))}
              <button
                type="button"
                onClick={addProduct}
               className="block ml-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Aggiungi Prodotto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {createSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-green-800">Ordine di acquisto creato con successo</h3>
            </div>
          </div>
        )}

        {createSuccess === false && (
          <div className="mt-4 rounded-md bg-[#7fb7d4] p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-red-800">{errorMessages}</h3>
            </div>
          </div>
        )}

        <button
          type="submit"
         className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea
        </button>
      </div>
    </form>
  );
}