import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import PurchaseUpdateRow from './purchaseupdaterow.jsx';
import toast, { Toaster } from 'react-hot-toast';

export default function PurchaseUpdateForm({ purchase: initialPurchase, onChange }) {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchase, setPurchase] = useState(initialPurchase || {});
  const [subcategories, setSubcategories] = useState([]);
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(initialPurchase ? { value: initialPurchase.id_company, label: initialPurchase?.Company?.name } : null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialPurchase ? initialPurchase.payment_method : "Cash");
  const [selectedDate, setSelectedDate] = useState(initialPurchase.date || new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(initialPurchase ? initialPurchase.PurchaseRows : [{ category: '', subcategory: '', subsubcategory: '', unit_price: '', vat: '',quantity: 1, depreciation: '', depreciation_aliquota: '', depreciation_years: '', description: '', subcategories: [] }]);

  const [categoryMap, setCategoryMap] = useState({});
  const [currency, setCurrency] = useState(initialPurchase ? initialPurchase.currency : 'EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const paymentMethods = ['Bank Transfer', 'Cash', 'Credit Card Floreani', 'Credit Card Fasanotti', 'Credit Card Ierace', 'Paypal'];

  useEffect(() => {
    console.log("miao sono qua", initialPurchase)
    const fetchData = async () => {
      try {
        const [
          { data: { quotationrequest } },
          { data: { categories } },
          { data: { subcategories } },
          { data: { subsubcategories } },
          { data: { users } },
          { data: { value: companies } },
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/company/read`),
        ]);

        setQuotationRequests(quotationrequest);
        setCategories(categories);
        setSubcategories(subcategories);
        setSubsubcategories(subsubcategories);
        setUsers(users.map(({ id_user, name, surname }) => ({ value: id_user, label: `${name} ${surname}` })));
        setCompanies(companies.map(({ id_company, name }) => ({ value: id_company, label: name })));

        const map = categories.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});
        setCategoryMap(map);

        const updatedProducts = (initialPurchase?.PurchaseRows || []).map(row => ({
          ...row,
          categoryName: map[row.category] || 'Unknown',
        }));
        setProducts(updatedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleProductChange = (index, updatedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
    setPurchase({ ...purchase, products: updatedProducts });
  };

  const handleCategoryChange = async (index, categoryId) => {
    try {
      const { data: { subcategories: filteredSubcategories } } = await axios.get(
        `${process.env.REACT_APP_API_URL}/subcategory/read/${categoryId}`
      );
      
      const updatedProduct = { 
        ...products[index], 
        category: categoryId, 
        subcategory: '', 
        subsubcategory: '', 
      };
      
      const updatedProducts = [...products];
      updatedProducts[index] = updatedProduct;
      
      setProducts(updatedProducts);
      
      // Create a new state for filtered subcategories specifically for this row
      const newSubcategoriesState = [...subcategories];
      newSubcategoriesState[index] = filteredSubcategories;
      
      setSubcategories(newSubcategoriesState);
    } catch (error) {
      console.error('Errore durante il caricamento delle sottocategorie:', error);
    }
  };

  const handleSubcategoryChange = async (index, subcategoryId) => {
    try {
      const { data: { subsubcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read/${subcategoryId}`);
      const updatedProduct = { ...products[index], subcategory: subcategoryId, subsubcategory: '', subsubcategories };
      const updatedProducts = [...products];
      updatedProducts[index] = updatedProduct;
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Errore durante il caricamento delle sotto-sottocategorie:', error);
    }
  };
  

  const addProduct = () => setProducts([...products, { category: '', subcategory: '', subsubcategory: '', description: '', unit_price: '', quantity: 1, subcategories: [], subsubcategories: [] }]);

  const confirmRemoveProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    setPurchase({ ...purchase, products: updatedProducts });
  };

  const updatePurchaseOrder = async (event) => {
    event.preventDefault();

    const jsonObject = {
      id_purchase: purchase.id_purchase,
      id_company: selectedCompany?.value,
      payment: selectedPaymentMethod,
      date: selectedDate,
      currency: currency,
      products: products.map((product) => ({
        name: product.name ,
        category: product.category,
        subcategory: product.subcategory,
        subsubcategory: product.subsubcategory,
        description: product.description || '',
        unit_price: parseFloat(product.unit_price),
        taxed_unit_price: parseFloat(product.unit_price) * 1.22,
        vat: parseFloat(product.vat),
        quantity: parseInt(product.quantity, 10),
        totalprice: parseFloat(product.unit_price) * parseInt(product.quantity, 10),
        taxed_totalprice: (parseFloat(product.unit_price) * 1.22) * parseInt(product.quantity, 10),
        
        depreciation: product.depreciation || false,
        depreciation_years: product.depreciation ? parseInt(product.depreciation_years, 10) : null,
        depreciation_aliquota: product.depreciation ? product.depreciation_aliquota : null,
        asset: product.asset || false
      }))
    };

    toast.promise(
      axios.put(`${process.env.REACT_APP_API_URL}/purchase/update`, jsonObject),
      {
        loading: 'Invio in corso...',
        success: 'ODA aggiornato con successo!',
        error: 'Errore durante la modifica della richiesta di acquisto',
      }
    )
      .then((response) => {
        
        console.log("sto modificando", jsonObject);
        setCreateSuccess(true);
      })
      .catch((error) => {
        console.log(jsonObject);
        console.error('Error details:', error.response ? error.response.data : error.message);
        
        setErrorMessages(error.response?.data?.message || 'An error occurred');
        setCreateSuccess(false);
      });
  };
  return (
    <form name="updatepurchaseorder" onSubmit={updatePurchaseOrder}>
      <Toaster />
      <div className="space-y-8">
        {/* Informazioni Ordine di Acquisto */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Informazioni Ordine di Acquisto</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per modificare l'ordine di acquisto.
          </p>
          <table className="w-full mt-6 text-[10px]">
            <tbody>
              {/* Fornitore */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Fornitore</td>
                <td>
                  <Select
                    id="azienda"
                    name="azienda"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={selectedCompany}
                    onChange={(value) => {
                      setSelectedCompany(value);
                      setPurchase({ ...purchase, id_company: value?.value });
                    }}
                    placeholder="Seleziona Fornitore"
                    options={companies}
                    primaryColor="#7fb7d4"
                    isSearchable
                  />
                </td>
              </tr>
              {/* Data */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Data</td>
                <td>
                  <input
                    id="dateorder"
                    name="dateorder"
                    type="date"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setPurchase({ ...purchase, date: e.target.value });
                    }}
                  />
                </td>
              </tr>
              {/* Metodo di Pagamento */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Metodo di Pagamento</td>
                <td>
                  <Select
                    id="paymentmethod"
                    name="paymentmethod"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={{ value: selectedPaymentMethod, label: selectedPaymentMethod }}
                    onChange={(selectedOption) => {
                      setSelectedPaymentMethod(selectedOption.value);
                      setPurchase({ ...purchase, selectedPaymentMethod: selectedOption.value });
                    }}
                    options={paymentMethods.map((method) => ({ value: method, label: method }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                  />
                </td>
              </tr>
              {/* Valuta */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Valuta</td>
                <td>
                  <Select
                    id="currency"
                    name="currency"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={{ value: currency, label: currency }}
                    onChange={(selectedOption) => {
                      setCurrency(selectedOption.value);
                      setPurchase({ ...purchase, currency: selectedOption.value });
                    }}
                    options={currencies.map((curr) => ({ value: curr, label: curr }))}
                    primaryColor="#7fb7d4"
                    isSearchable
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
            Questi sono i prodotti associati all'ordine di acquisto.
          </p>
          <div className="mt-4">
            {products && products.length > 0 && products.map((product, index) => (
              <PurchaseUpdateRow
                key={index}
                product={{
                  ...product,
                  categoryName: categoryMap[product.category] || 'Unknown',
                }}
                onChange={(updatedProduct) => handleProductChange(index, updatedProduct)}
                onRemove={() => confirmRemoveProduct(index)}
                categories={categories}
                subcategories={subcategories}
                subsubcategories={subsubcategories}
                handleCategoryChange={(e) => handleCategoryChange(index, e.target.value)}
                handleSubcategoryChange={(e) => handleSubcategoryChange(index, e.target.value)}
                currencies={currencies}
                currency={currency}
                setCurrency={setCurrency}
              />
            ))}
            <button
              type="button"
              className="block mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              onClick={addProduct}
            >
              Aggiungi Prodotto
            </button>
          </div>
        </div>
  
        {/* Messaggi di Feedback */}
        {createSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-3">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3 text-[10px]">
                <h3 className="font-medium text-red-800">Errore durante la creazione</h3>
                <ul className="list-disc pl-5 space-y-1 text-red-700">
                  <li>{errorMessages}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {createSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-3">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <div className="ml-3 text-[10px]">
                <h3 className="font-medium text-green-800">Ordine di acquisto aggiornato con successo!</h3>
              </div>
            </div>
          </div>
        )}
  
        {/* Pulsante di Invio */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-[#A7D0EB] px-4 py-2 text-xs font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Aggiorna Ordine di Acquisto
          </button>
        </div>
      </div>
    </form>
  );
}  