import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../pages/lost';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
    
    // Aggiungi il logo
    const logoPath = '../../../logo.jpg'; // Percorso del logo
    doc.addImage(logoPath, 'JPEG', 10, 10, 50, 20); // Posizione e dimensioni del logo
    
    // Tabella orizzontale per i dettagli dell'ordine
    const orderDetails = [
      ['N° Ordine di Acquisto', `${purchase.name}`],
      ['Data', `${formatDate(purchase.createdAt)}`],
      ['Riferimento Intellimech', `${purchase.Company.name}`],
      ['Metodo di Pagamento', `${purchase.payment_method}`],
      ['Dettagli', `${purchase.details || 'N/A'}`], // Aggiungi i dettagli se disponibili
      ['Commessa', `${purchase.jobNumber || 'N/A'}`] // Aggiungi il numero di commessa se disponibile
    ];
    
      // Titolo centrato a 30 mm dal margine sinistro
    const marginLeft = -100; // Margine sinistro in mm
    const pageWidth = doc.internal.pageSize.width;
    const title = "Ordine d'Acquisto";
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titleX = marginLeft + (pageWidth - marginLeft - titleWidth) / 2;
    doc.text(title, titleX, 35);
      
    // Dati dell'ordine
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    
    // Usa autoTable per creare una tabella orizzontale
    doc.autoTable({
      startY: 45,
      body: orderDetails,
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 0.5, // Riduci il padding delle celle per meno spazio tra le righe
        fontSize: 10 // Riduci la dimensione del font per più spazio
      },
      columnStyles: {
        0: { cellWidth: 50 }, 
        1: { cellWidth: 120 } 
      },
      margin: { top: 10 }
    });
    
    // Informazioni della compagnia
    const companyInfo = [
      ['Ragione Sociale Fornitore', `${purchase.Company.name}`],
      ['Via, numero civico', `${purchase.Company.address || 'N/A'}`],
      ['Cap Comune – Provincia', `${purchase.Company.city || 'N/A'}, ${purchase.Company.province || 'N/A'}`],
      ['PIVA', `${purchase.Company.VAT || 'N/A'}`],
      ['CF', `${purchase.Company.fiscal_Code || 'N/A'}`]
    ];
  
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      body: companyInfo,
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 0.5,
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 120 }
      },
      margin: { left: 105, top: 10 }
    });
    
    // Tabelle delle righe d'ordine
    doc.text("Righe d'ordine", 10, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['Description', 'Category', 'Subcategory', 'Unit Price', 'Qty', 'Total Amount', 'Currency']],
      body: purchase.PurchaseRows.map(row => [
        row.description,
        row.category,
        row.subcategory,
        formatCurrency(row.unit_price),
        row.quantity,
        formatCurrency(row.unit_price * row.quantity),
        purchase.currency // Aggiungi la valuta per ogni riga
      ]),
      columnStyles: {
        0: { cellWidth: 55 }, // Riduci la larghezza della colonna "Description"
        1: { cellWidth: 20 }, // Larghezza della colonna "Category"
        2: { cellWidth: 25 }, // Larghezza della colonna "Subcategory"
        3: { cellWidth: 22 }, // Aumenta la larghezza della colonna "Unit Price"
        4: { cellWidth: 10 }, // Larghezza della colonna "Qty"
        5: { cellWidth: 30 }, // Larghezza della colonna "Total Amount"
        6: { cellWidth: 20 }  // Riduci la larghezza della colonna "Currency"
      },
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold'
      },
      margin: { top: 10 }
    });
    
    // Aggiungi la tabella con i totali e altre informazioni
    const summaryDetails = [
      ['Total Amount', `${formatCurrency(purchase.total)}`],
      ['IVA', `${formatCurrency(purchase.VAT || 0)}`],
      ['Approved by', 'Stefano Ierace']
      
    ];
  
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      body: summaryDetails,
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 1,
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 }
      },
      margin: { top: 10 }
    });
    
    // Aggiungi il piè di pagina
    const footerText = [
      "Sede Legale e Operativa c/o Kilometro Rosso (Gate 4) - Via Stezzano, 87 24126 Bergamo",
      "Tel. +39 035 0690366 - C.F. 95160560165 - P.I. 03388700167",
      "REA BG 3713330 - Iscrizione CCIAA di BG n° 03388700167 - SDI J6URRTW",
      "PEC: intellimech@legalmail.it - Amministrazione: m.innovati@confindustriabergamo.it"
    ];
  
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    
    const pageHeight = doc.internal.pageSize.height;
    let yOffset = pageHeight - 20; // Imposta un margine dal fondo
    
    footerText.forEach(line => {
      doc.text(line, 10, yOffset);
      yOffset += 3; // Spazio tra le righe del piè di pagina
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
