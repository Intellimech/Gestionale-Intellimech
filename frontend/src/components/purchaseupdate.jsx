import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseUpdateRow from './purchaseupdaterow.jsx';

export default function PurchaseUpdateForm({ purchase: initialPurchase, onChange }) {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchase, setPurchase] = useState(initialPurchase || {});
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(initialPurchase ? { value: initialPurchase.id_company, label: initialPurchase.Company.name } : null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialPurchase ? initialPurchase.payment_method : "Cash" );
  const [selectedDate, setSelectedDate] = useState(initialPurchase.date || new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(initialPurchase ? initialPurchase.PurchaseRows : [{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  const [currency, setCurrency] = useState(initialPurchase ? initialPurchase.currency : 'EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token');
        const [
          { data: { quotationrequest } },
          { data: { categories } },
          { data: { technicalareas } },
          { data: { users } },
          { data: { value: companies } },
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read/free`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/company/read`, { headers: { authorization: `Bearer ${token}` }, params: { filter: "Suppliers" } }),
        ]);

        setQuotationRequests(quotationrequest);
        setCategories(categories);
        setTechnicalAreas(technicalareas);
        setUsers(users.map(({ id_user, name, surname }) => ({ value: id_user, label: `${name} ${surname}` })));
        setCompanies(companies.map(({ id_company, name }) => ({ value: id_company, label: name })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   if (initialPurchase) {

  //   console.log('Initial Purchase:', initialPurchase);
  //     setSelectedCompany({ value: initialPurchase.id_company, label: initialPurchase.Company.name });
  //     setSelectedPaymentMethod(initialPurchase.payment_method);
  //     setSelectedDate(initialPurchase.date || new Date().toISOString().split('T')[0]);
  //     setProducts(initialPurchase.products || [{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  //     setCurrency(initialPurchase.currency || 'EUR');
  //   }
  // }, [initialPurchase]);

  console.log(initialPurchase)
  
  const handleProductChange = (index, updatedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
    setPurchase({ ...purchase, products: updatedProducts });
  };

  const handleCategoryChange = async (index, categoryId) => {
    try {
      const token = Cookies.get('token');
      const { data: { subcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${categoryId}`, { headers: { authorization: `Bearer ${token}` } });
      const updatedProducts = [...products];
      updatedProducts[index].subcategories = subcategories;
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };

  const addProduct = () => setProducts([...products, { category: '', subcategory: '', description: '', unit_price: '', quantity: 1, subcategories: [] }]);

  const confirmRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    setPurchase({ ...purchase, products: updatedProducts });
  };

  const updatePurchaseOrder = async (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    
    const jsonObject = {
      id_company: selectedCompany?.value,
      payment: selectedPaymentMethod,
      date: selectedDate,
      currency: currency,
      products: products.map((product) => ({
        category: product.category,
        subcategory: product.subcategory,
        description: product.description || '',
        unit_price: parseFloat(product.unit_price),
        quantity: parseInt(product.quantity, 10),
      }))
    };
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/purchase/update`, jsonObject, { headers: { authorization: `Bearer ${token}` } });
      setCreateSuccess(true);
    } catch (error) {
      setErrorMessages(error.response?.data?.message || 'An error occurred');
      setCreateSuccess(false);
    }
  };

  return (
    <form name="updatepurchaseorder" onSubmit={updatePurchaseOrder}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Ordine di Acquisto</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per modificare l'ordine di acquisto</p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="azienda" className="block text-sm font-medium leading-6 text-gray-900">Azienda</label>
              <div className="mt-2">
                <Select
                  id="azienda"
                  name="azienda"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={selectedCompany} // Assicurati che selectedCompany sia { value: ..., label: ... }
                  onChange={(value) => {
                    setSelectedCompany(value);
                    setPurchase({ ...purchase, id_company: value?.value });
                  }}
                  placeholder="Seleziona Azienda"
                  options={companies} // Assicurati che companies sia formattato come [{ value: ..., label: ... }]
                  primaryColor='red'
                  isSearchable
                />

              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="dateorder" className="block text-sm font-medium leading-6 text-gray-900">Data</label>
              <div className="mt-2">
                <input
                  id="dateorder"
                  name="dateorder"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setPurchase({ ...purchase, date: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="paymentmethod" className="block text-sm font-medium leading-6 text-gray-900">Metodo di Pagamento</label>
              <div className="mt-2">
               <Select
                  id="paymentmethod"
                  name="paymentmethod"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={{value: selectedPaymentMethod, label : selectedPaymentMethod}} 
                  onChange={(selectedOption) => {
                    setSelectedPaymentMethod(selectedOption.value);
                    setPurchase({ ...purchase, selectedPaymentMethod: selectedOption.value });
                  }}
                  options={paymentMethods.map(method => ({ value: method, label: method }))} // Format correct
                  primaryColor='red'
                  isSearchable
                />

              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">Valuta</label>
              <div className="mt-2">
                <Select
                  id="currency"
                  name="currency"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={{ value: currency, label: currency }}
                  onChange={(selectedOption) => {
                    setCurrency(selectedOption.value);
                    setPurchase({ ...purchase, currency: selectedOption.value });
                  }}
                  options={currencies.map(curr => ({ value: curr, label: curr }))}
                  primaryColor='red'
                  isSearchable
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Prodotti</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Questi sono i prodotti associati all'ordine di acquisto.</p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-6">
              {products && products.length > 0 && products.map((product, index) => (
                <PurchaseUpdateRow
                  key={index}
                  product={product}
                  onChange={(updatedProduct) => handleProductChange(index, updatedProduct)}
                  onRemove={() => confirmRemoveProduct(index)}
                  categories={categories}
                  subcategories={subcategories}
                  handleCategoryChange={(e) => handleCategoryChange(index, e.target.value)}
                  currencies={currencies}
                  currency={currency}
                  setCurrency={setCurrency}
                />
              ))}
              <button
                type="button"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={addProduct}
              >
                Aggiungi Prodotto
              </button>
            </div>
          </div>
        </div>
        {createSuccess === false && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Errore durante la creazione</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul role="list" className="list-disc pl-5 space-y-1">
                    <li>{errorMessages}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {createSuccess === true && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Ordine di acquisto aggiornato con successo!</h3>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Aggiorna Ordine di Acquisto
          </button>
        </div>
      </div>
    </form>
  );
}
