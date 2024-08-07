import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseUpdateRow from './purchaseupdaterow.jsx';

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
  const [selectedCompany, setSelectedCompany] = useState(purchase ? { value: purchase.id_company, label: purchase.company_name } : null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(purchase ? { value: purchase.payment, label: purchase.payment } : null);
  const [selectedDate, setSelectedDate] = useState(purchase ? purchase.date : new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(purchase ? purchase.products : [{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  const [currency, setCurrency] = useState(purchase ? purchase.currency : 'EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal']; // Payment methods options


  useEffect(() => {
    if (!initialPurchase) {
      axios.get(`http://localhost:3000/purchase/read/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`
        }
      })
      .then(response => {
        setPurchase(response.data.purchases);
        setFormData(response.data.purchases); 
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      setFormData(initialPurchase); 
    }
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

  const handleProductChange = (index, updatedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
  };

  const handleCategoryChange = async (index, categoryId) => {
    const token = Cookies.get('token');
    try {
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

  const formatCurrency = (amount) => `${amount} ${currency}`;

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
                  placeholder={purchase.payment_method || 'Seleziona Metodo di Pagamento'}
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
        </div>
      </div>

      <div className="space-y-12 py-8">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Prodotti</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare l'ordine di acquisto</p>

          <div className="mt-10">
            {products.map((product, index) => (
              <PurchaseUpdateRow
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
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
            >
              Aggiungi Prodotto
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {createSuccess && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-green-800">Ordine di acquisto aggiornato con successo</h3>
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
          Crea
        </button>
      </div>
    </form>
  );
}
