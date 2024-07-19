import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../pages/lost';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { PaperClipIcon } from '@heroicons/react/20/solid';

export default function Example({ purchase: initialPurchase }) {
  const [purchase, setPurchase] = useState(initialPurchase);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
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
  const { id } = useParams();

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
            { data: { categories } },
            { data: { technicalareas } },
            { data: { users } },
            { data: { value: companies } },
          ] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/category/read`, { headers: { authorization: `Bearer ${token}` } }),
            axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, { headers: { authorization: `Bearer ${token}` } }),
            axios.get(`${process.env.REACT_APP_API_URL}/user/read`, { headers: { authorization: `Bearer ${token}` } }),
            axios.get(`${process.env.REACT_APP_API_URL}/company/read`, { headers: { authorization: `Bearer ${token}` }, params: { filter: "Suppliers" } }),
          ]);
  
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

  }, [id, initialPurchase]);

  const formatCurrency = (amount) => {
    return `${amount} ${purchase?.currency}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
  
    // const logoUrl = '/images/logo.png'; // Percorso del file PNG
    //doc.addImage(logoUrl, 'PNG', 10, 10, 50, 20);  Posizione (x, y) e dimensioni (larghezza, altezza) dell'immagine
  
    // Titolo
    doc.setFontSize(16);
    doc.text("Dettagli dell'ordine", 10, 35);
  
    // Dati dell'ordine
    doc.setFontSize(12);
    doc.text(`Codice Ordine: ${purchase.name}`, 10, 50);
    doc.text(`Fornitore: ${purchase.Company.name}`, 10, 60);
    doc.text(`Data di creazione: ${formatDate(purchase.createdAt)}`, 10, 70);
    doc.text(`Totale IVA Esclusa: ${formatCurrency(purchase.total)}`, 10, 80);
  
    // Aggiungi intestazione della tabella
    doc.text("Righe d'ordine", 10, 100);
    doc.line(10, 105, 200, 105); // Linea sotto l'intestazione della tabella
  
    // Aggiungi righe della tabella
    const startY = 110;
    const rowHeight = 10;
    purchase.PurchaseRows.forEach((row, index) => {
      const y = startY + (index * rowHeight);
      doc.text(`${row.name}`, 10, y);
      //doc.text(`${row.description}`, 50, y);
      doc.text(`${row.quantity}`, 100, y);
      doc.text(`${formatCurrency(row.unit_price)}`, 150, y);
      //doc.text(`${row.VAT}`, 180, y);
    });
  
    // Salva il PDF
    doc.save("fattura.pdf");
  };
  

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(purchase); // Revert to original data
  };

  const handleSaveClick = () => {
    axios.put(`http://localhost:3000/purchase/update/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${Cookies.get('token')}`
      }
    })
    .then(response => {
      setPurchase(response.data.purchases);
      setIsEditing(false);
    })
    .catch(error => {
      console.error(error);
    });
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  if (!purchase) {
    return <Lost />;
  }

  return (
    <div>
      <div className="px-4 sm:px-0 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Dettagli sull'ordine di Acquisto
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${{
              'In Approvazione': 'bg-yellow-100 text-yellow-800',
              'Approvata': 'bg-green-100 text-green-800',
              'Rifiutata': 'bg-red-100 text-red-800',
            }[purchase?.status] || 'bg-gray-100 text-gray-800'}`}>
              {purchase?.status || 'Nessuno'}
            </span>
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSaveClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Salva
              </button>
              <button
                type="button"
                onClick={handleCancelClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Annulla
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Modifica
            </button>
          )}
        </div>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Ordine</dt>
            {
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.name}</dd>
            }
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Fornitore</dt>
            {isEditing ? (
              <input
                type="text"
                name="Company.name"
                value={formData?.Company?.name || ''}
                onChange={handleInputChange}
                className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"
              />
            ) : (
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.Company.name}</dd>
            )}
          </div>
        
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-6 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Righe d'ordine</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"></dd>
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Codice Prodotto
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Descrizione
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Quantità
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Prezzo Unitario
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    IVA
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Totale
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stato
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {purchase?.PurchaseRows?.map((product) => (
                  <tr key={product.id_product}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {
                        product.name
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="text"
                          name={`PurchaseRows[${product.id_product}].description`}
                          value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.description || ''}
                          onChange={handleInputChange}
                          className="text-sm text-gray-500"
                        />
                      ) : (
                        product.description
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="number"
                          name={`PurchaseRows[${product.id_product}].quantity`}
                          value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.quantity || ''}
                          onChange={handleInputChange}
                          className="text-sm text-gray-500"
                        />
                      ) : (
                        product.quantity
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          name={`PurchaseRows[${product.id_product}].unit_price`}
                          value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.unit_price || ''}
                          onChange={handleInputChange}
                          className="text-sm text-gray-500"
                        />
                      ) : (
                        formatCurrency(product.unit_price)
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="number"
                          name={`PurchaseRows[${product.id_product}].VAT`}
                          value={formData?.PurchaseRows.find(row => row.id_product === product.id_product)?.VAT || ''}
                          onChange={handleInputChange}
                          className="text-sm text-gray-500"
                        />
                      ) : (
                        product.VAT
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatCurrency(product.unit_price * product.quantity)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
            <dt className="text-sm font-medium leading-6 text-gray-900">Ordine di Acquisto</dt>
            <dd className="mt-2 text-sm text-gray-900">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">{purchase.name}.pdf</span>
                      <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button onClick={handleDownloadPdf} className="font-medium text-red-600 hover:text-red-500">
                      Download
                    </button>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
