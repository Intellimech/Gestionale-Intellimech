import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseRowInput from './purchaserowinput.jsx';

export default function PurchaseUpdateForm({ purchase: initialPurchase, onChange }) {
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [products, setProducts] = useState([]);
  const [currency, setCurrency] = useState('EUR');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);

  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal'];

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

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

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

  const confirmRemoveProduct = (index) => {
    setProductToRemove(index);
    setModalIsOpen(true);
  };

  const removeProduct = () => {
    setProducts(products.filter((_, i) => i !== productToRemove));
    setModalIsOpen(false);
    setProductToRemove(null);
  };

  const cancelRemoveProduct = () => {
    setModalIsOpen(false);
    setProductToRemove(null);
  };

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

            <div className="sm:col-span-2">
              <label htmlFor="paymentmethod" className="block text-sm font-medium leading-6 text-gray-900">Metodo di pagamento</label>
              <div className="mt-2">
                <Select
                  id="paymentmethod"
                  name="paymentmethod"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
                  value={selectedPaymentMethod}
                  onChange={setSelectedPaymentMethod}
                  placeholder={purchase.payment_method|| 'Seleziona Metodo di Pagamento'}
                  options={paymentMethods.map(method => ({ value: method, label: method }))}
                  primaryColor='red'
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="currency" className="block text-sm font-medium leading-6 text-gray-900">Valuta</label>
              <div className="mt-2">
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
                >
                  {currencies.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Prodotti</h2>
            <table className="min-w-full divide-y divide-gray-200 block overflow-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sottocategoria</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo Unitario</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantità</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rimuovi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">
                    <Select
                      id="category"
                      name="category"
                      defaultValue={{ value: product.category, label: categories.find(c => c.id_category === product.category)?.name }}
                      onChange={(option) => {
                        handleCategoryChange({ target: { value: option.value } });
                        onChange({ ...product, category: option.value });
                        setSelectedCategory
                      }}
                      value={selectedCategory}
                      options={categories.map(c => ({ value: c.id_category, label: c.name }))}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                      primaryColor='red'
                    />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <select
                        id={`subcategory-${index}`}
                        name={`subcategory-${index}`}
                        value={product.subcategory}
                        onChange={(e) => handleProductChange(index, 'subcategory', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        disabled={!product.subcategories.length}
                      >
                        <option value="">Seleziona Sottocategoria</option>
                        {product.subcategories.map(subcategory => (
                          <option key={subcategory.id_subcategory} value={subcategory.id_subcategory}>{subcategory.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <textarea
                        type="text"
                        name={`description-${index}`}
                        value={product.description}
                        onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                        type="number"
                        name={`unit_price-${index}`}
                        value={product.unit_price}
                        onChange={(e) => handleProductChange(index, 'unit_price', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <input
                      type="number"
                      name={`quantity-${index}`}
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={addProduct}
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Aggiungi Prodotto
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">Annulla</button>
        <button type="submit" className="rounded-md bg-red-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Salva</button>
      </div>

      {createSuccess && <div className="mt-4 text-green-600">Ordine di acquisto creato con successo!</div>}
      {errorMessages && <div className="mt-4 text-red-600">{errorMessages}</div>}
    </form>
  );
}
