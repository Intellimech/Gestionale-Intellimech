import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseRowInput from './purchaserowinput.jsx';

export default function PurchaseUpdateForm({ purchase: initialPurchase, onChange}) {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchase, setPurchase] = useState(initialPurchase);
  const [subcategories, setSubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState(null);
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [products, setProducts] = useState([]);
  const [currency, setCurrency] = useState('EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal']; // Payment methods options

  useEffect(() => {
    const token = Cookies.get('token');
    const fetchData = async () => {
      try {
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

        if (initialPurchase) {
          setFormData(initialPurchase); 
          setPurchase(initialPurchase);
          setSelectedCompany(initialPurchase.selectedCompany || null);
          setSelectedPaymentMethod(initialPurchase.selectedPaymentMethod || null);
          setSelectedDate(initialPurchase.selectedDate || new Date().toISOString().split('T')[0]);
          setCurrency(initialPurchase.currency || 'EUR');
          setProducts(initialPurchase.products || [{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
        }
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
  }, [initialPurchase]);

  // Nel componente principale
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  // Nel componente PurchaseRowInput
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...product,
      [name]: value
    });
  };


  const handleCategoryChange = async (event, index) => {
    const token = Cookies.get('token');
    const updatedProducts = [...products];
    updatedProducts[index].category = event.target.value;

    try {
      const { data: { subcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`, { headers: { authorization: `Bearer ${token}` } });
      updatedProducts[index].subcategories = subcategories;
      updatedProducts[index].subcategory = '';
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };

  const addProduct = () => setProducts([...products, { category: '', subcategory: '', description: '', unit_price: '', quantity: 1, subcategories: [] }]);
  const removeProduct = (index) => setProducts(products.filter((_, i) => i !== index));
  const updateProduct = (index, updatedProduct) => setProducts(products.map((product, i) => (i === index ? updatedProduct : product)));

  const updatePurchaseOrder = async (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    const form = new FormData(event.target);
    const formDataObject = Object.fromEntries(form.entries());

    const jsonObject = {
      id_company: selectedCompany?.value,
      payment: selectedPaymentMethod?.value,
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
      setErrorMessages(error.response.data.message);
      setCreateSuccess(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${amount} ${purchase?.currency}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  

  return (
    <form name="updatepurchaseorder" onSubmit={updatePurchaseOrder}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni Ordine di Acquisto</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare l'ordine di acquisto</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="azienda" className="block text-sm font-medium leading-6 text-gray-900">Azienda</label>
              <div className="mt-2">
                <Select
                  id="azienda"
                  name="azienda"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  placeholder={purchase.Company?.name || 'Seleziona Azienda'}
                  options={(companies || []).map(({ value, label }) => ({ value, label }))}
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
                  placeholder={purchase.selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="paymentMethod" className="block text-sm font-medium leading-6 text-gray-900">Modalità di pagamento</label>
              <div className="mt-2">
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={selectedPaymentMethod}
                  placeholder={purchase.payment_method}
                  onChange={setSelectedPaymentMethod}
                  options={paymentMethods.map((method) => ({ value: method, label: method }))}
                  primaryColor='red'
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">Valuta</label>
              <div className="mt-2">
                <Select
                  id="currency"
                  name="currency"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  value={{ value: currency, label: currency }}
                  onChange={(option) => setCurrency(option.value)}
                  options={currencies.map((cur) => ({ value: cur, label: cur }))}
                  primaryColor='red'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 py-8">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Prodotti</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare l'ordine di acquisto</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">

              {/* Tabella dei prodotti */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Numero Ordine</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoria</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sottocategoria</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Descrizione</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantità</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prezzo Unitario</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">IVA</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Totale</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {purchase?.PurchaseRows?.map((product) => (
                      <tr key={product.id_product}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Select
                          id="category"
                          name="category"
                          value={{ value: product.category, label: categories.find(c => c.id_category === product.category)?.name }}
                          onChange={(option) => {
                            handleCategoryChange({ target: { value: option.value } });
                            onChange({ ...product, category: option.value });
                          }}
                          options={categories.map(c => ({ value: c.id_category, label: c.name }))}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                          primaryColor='red'
                        />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Select
                          id="subcategory"
                          name="subcategory"
                          value={{ value: product.subcategory, label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name }}
                          onChange={(option) => onChange({ ...product, subcategory: option.value })}
                          options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                          isDisabled={subcategories.length === 0}
                          primaryColor='red'
                        />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <input
                            type="text"
                            name={`PurchaseRows[${product.id_product}].description`}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"s
                            value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.description || ''}
                            onChange={(e) => onChange({ ...product, description: e.target.value })}
                            
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <input
                          type="number"
                          step="0.01"
                          defaultValue={0.00}
                          name="unit_price"
                          id={`unit_price`}
                          value={product.unit_price}
                          onChange={(e) => handleFieldChange({ ...product, unit_price: e.target.value })}
                          className="block w-full rounded-md border-gray-300 left-0 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                          placeholder="0.00"
                          aria-describedby="price-currency"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min={1}
                          value={product.quantity || 1}
                          onChange={(e) => onChange({ ...product, quantity: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
                        />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <input
                            type="number"
                            name={`PurchaseRows[${product.id_product}].VAT`}
                            value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.VAT || ''}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatCurrency(product.unit_price * product.quantity)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                  handleFieldChange={handleFieldChange} // Passa la funzione
                />
              ))}

              {/* Aggiungi prodotto */}
              <button
                type="button"
                onClick={addProduct}
                className="mt-4 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
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
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-red-800">{errorMessages}</h3>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          Aggiorna Ordine di Acquisto
        </button>
      </div>
    </form>
  );
}
