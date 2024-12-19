import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, TrashIcon, XCircleIcon } from '@heroicons/react/20/solid';
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
  const [selectedUser, setSelectedUser] = useState(initialPurchase ? { value: initialPurchase.referent, label: initialPurchase?.referentUser?.name + " "+  initialPurchase?.referentUser?.surname } : null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialPurchase ? initialPurchase.payment_method : "Cash");
  const [selectedDate, setSelectedDate] = useState(initialPurchase.date.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState(initialPurchase ? initialPurchase.PurchaseRows : [{ category: '', subcategory: '', subsubcategory: '', unit_price: '', vat: '',quantity: 1, depreciation: '', depreciation_aliquota: '', depreciation_years: '',  depreciation_details: '', description: '', subcategories: [] }]);
  const [selectedJob, setSelectedJob]= useState([]);
  const [jobs, setJobs]= useState([]);
  const [job, setJob]= useState(initialPurchase ? initialPurchase.job : 'EUR');
  const [currencies, setCurrencies] = useState([]);
  const [selectedBank, setSelectedBank] = useState(initialPurchase ? initialPurchase.banktransfer : "");
  const [categoryMap, setCategoryMap] = useState({});
  const [currency, setCurrency] = useState(initialPurchase ? initialPurchase.currency : 'EUR');

  const banks = ['Vista Fattura', '30 gg D.F.F.M.', '60 gg D.F.F.M.', '50% Anticipato, 50% alla Consegna', '100% Anticipato', 'Frazionato'];
  const [paymentMethods, setPaymentMethods] = useState([]);


  
  function findcurrency(id) {
    const currencyfind = currencies.find(curr => curr.id_currency == id);
  
    return currencyfind ? currencyfind.name : "Sconosciuto";
  }
  
  function findJob(id) {
    const jobfind = jobs.find(j => j.id_job == id);
  
    return jobfind ? jobfind.name : "Sconosciuto";
  }
  function findmethod(id) {
    const find = paymentMethods.find(curr => curr.id_paymentmethod == id);
  
    return find ? find.name : "Sconosciuto";
  }
  function findrecurrence(id) {
    const find = recurrences.find(curr => curr.id_recurrence == id);
  console.log("sono il find", id );
  console.log("ehi ciao", initialContract)
    return find ? find.name : "Sconosciuto";
  }

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

  useEffect(() => {
   
    axios
      .get(`${process.env.REACT_APP_API_URL}/job/read`)
      .then((response) => {
        setJobs(response.data.jobs || []);
      })
      .catch((error) => {
        console.error('Errore nel caricamento delle commesse:', error);
        toast.error('Errore nel caricamento delle commesse');
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
      .get(`${process.env.REACT_APP_API_URL}/paymentmethod/read`)
      .then((response) => {
        setPaymentMethods(response.data.paymentmethods);
      })
      .catch((error) => {
        console.error('Error fetching paymentmethods:', error);
      });
  }, []);
  const handleProductChange = (index, updatedProduct) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
    setPurchase({ ...purchase, products: updatedProducts });
  };
console.log("guarda qui", selectedBank)
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
      payment_method: selectedPaymentMethod,
      referent: selectedUser?.value,
      banktransfer: selectedBank,
      date: selectedDate,
      job: job,
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
        depreciation_details: product.depreciation ? product.depreciation_details : null,
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
        
        window.location.reload();
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
                    isClearable
                  />
                </td>
              </tr>
              <tr>
                <td className="block text-sm font-medium text-gray-700">Referente</td>
                <td>
                  <Select
                    value={selectedUser}
                    onChange={(value) => {
                      setSelectedUser(value);
                      setPurchase({ ...purchase, referent: value?.value });
                    }}
                    options={users}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
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
                    id="dateorder"
                    name="dateorder"
                    type="date"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                    
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
                       value={{ value: selectedPaymentMethod, label: findmethod(selectedPaymentMethod) }}
                    onChange={(selectedOption) => {
                      setSelectedPaymentMethod(selectedOption.value);
                      setPurchase({ ...purchase, selectedPaymentMethod: selectedOption.value });
                    }}
                    options={paymentMethods.map((method) => ({ value: method.id_paymentmethod, label: method.name }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                  />
                </td>
              </tr>

              {selectedPaymentMethod && selectedPaymentMethod == "1" ? (
              <tr>
                <td className="block text-sm font-medium text-gray-700">Dettagli di Pagamento</td>
                <td>
                  <Select
                     value={{ value: selectedBank, label: selectedBank }}
                    onChange={(selectedOption) => {
                      setSelectedBank(selectedOption.value);
                      setPurchase({ ...purchase, banktransfer: selectedOption.value });
                    }}
                    options={banks.map((b) => ({ value: b , label: b }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                    placeholder="Seleziona Metodo di Pagamento"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
            ) : null}

              <tr>
                <td className="block text-sm font-medium text-gray-700">Valuta</td>
                <td>
                  <Select
                    id="currency"
                    name="currency"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={{ value: currency, label: findcurrency(currency) }}
                    onChange={(selectedOption) => {
                      setCurrency(selectedOption.value);
                      setPurchase({ ...purchase, currency: selectedOption.value });
                    }}
                    options={currencies.map((curr) => ({ value: curr.id_currency, label: curr.name }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                  />
                </td>
              </tr>
              <tr>
              <td className="block text-sm font-medium text-gray-700">Commessa</td>
              <td >
                <Select
                  options={jobs.map((job) => ({ value: job.id_job, label: job.name }))}
                  id="job"
                  name="job"
                  value={job ? { value: job, label: findJob(job) } : null} // Mostra il valore selezionato o null
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                  onChange={(selectedOption) => {
                    const selectedJob = selectedOption ? selectedOption.value : null; // Verifica se il valore è nullo
                    setJob(selectedJob); // Aggiorna lo stato del job
                    setPurchase({ ...purchase, job: selectedJob }); // Aggiorna lo stato di purchase
                    setSelectedJob(selectedJob); // Assicura che anche selectedJob sia aggiornato
                  }}
                  isSearchable
                  placeholder="Seleziona una commessa"
                />
                <button
                  type="button"
                  onClick={() => {
                    setJob(null); // Imposta job a null
                    setPurchase({ ...purchase, job: nul }); // Aggiorna lo stato di purchase
                    setSelectedJob(null); // Imposta anche selectedJob a null
                  }}
                  className="ml-2 p-2 text-gray-500 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
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