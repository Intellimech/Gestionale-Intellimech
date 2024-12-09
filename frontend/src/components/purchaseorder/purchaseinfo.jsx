import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../../pages/lost.jsx';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import logo from '../../images/logo.jpg'

import firma from '../../images/firma.png'

import PurchaseUpdateForm from './purchaseupdate.jsx';

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
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState([{ category: '', subcategory: '', unit_price: '', quantity: 1, description: '', subcategories: [] }]);
  const [currency, setCurrency] = useState('EUR');
  const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'];
  const { id } = useParams();

  useEffect(() => {
    if (!initialPurchase) {
      axios.get(`http://localhost:3000/purchase/read/${id}`, )
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
            axios.get(`${process.env.REACT_APP_API_URL}/category/read`,),
            axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`,),
            axios.get(`${process.env.REACT_APP_API_URL}/user/read`, ),
            axios.get(`${process.env.REACT_APP_API_URL}/company/read`,),
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

  useEffect(() => {
    console.log('Purchase:', purchase);
  }, [purchase]);

  const formatCurrency = (amount) => {
    return `${amount} ${purchase?.Currency.symbol}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  
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



  const handleDownloadPdf = () => {
    console.log(Array.isArray(purchase.PurchaseRows)); 
    console.log('PurchaseRows:', purchase.PurchaseRows);
    if (!purchase || !Array.isArray(purchase.PurchaseRows)) {
      console.error('Dati ordine non validi o incompleti.');
      return;
    }
    
    const doc = new jsPDF();
    
      const logoPath = '../images/logo.jpg'; 
      const imageWidth = 49; // Increase width
      const imageHeight = 10; // Increase height
      doc.addImage(logo, 'JPEG', 15, 15, imageWidth, imageHeight);
    
    // Tabella orizzontale per i dettagli dell'ordine
    const orderDetails = [
      ['N° Ordine di Acquisto', `${purchase.name}`],
      ['Data', `${formatDate(purchase.createdAt)}`],
      ['Riferimento Intellimech', `${purchase?.referentUser.name.slice(0, 2).toUpperCase() + purchase?.referentUser?.surname.slice(0, 2).toUpperCase() + " (" + purchase?.referentUser.name + " " + purchase?.referentUser.surname + ")"}`],
      ['Metodo di Pagamento', `${purchase.PaymentMethod.name}`],
      ['', `${purchase?.banktransfer || ''}`], // Aggiungi i dettagli se disponibili
      ['Commessa', `${purchase?.Job.name || ''}`],
     
    ];
    
    // Titolo centrato a 30 mm dal margine sinistro
    const marginLeft = -100; // Margine sinistro in mm
    const pageWidth = doc.internal.pageSize.width;
    const title = "Ordine d'Acquisto";
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    const titleWidth = doc.getTextWidth(title);
    const titleX = marginLeft;
    doc.text(title, titleX, 35);
      
    // Dati dell'ordine
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    console.log(orderDetails);
    // Usa autoTable per creare una tabella orizzontale
    doc.autoTable({
      startY: 45,
      startX: 5,
      body: orderDetails,
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        cellPadding: 0.5, // Riduci il padding delle celle per meno spazio tra le righe
        fontSize: 10, // Riduci la dimensione del font per più spazio
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50 }, 
        1: { cellWidth: 120 } 
      },
      margin: { top: 10, left:15 },
      alternateRowStyles: { fillColor: [255, 255, 255] } 
    });
    
    // Informazioni della compagnia
    const companyInfo = [
      [ `${purchase.Company.name}`],
      [ `${purchase.Company.address || 'N/A'}`],
      [ `${purchase.Company.City || 'N/A'}, ${purchase.Company.Province || 'N/A'}`],
      [ `${purchase.Company.VAT || 'N/A'}`],
      [ `${purchase.Company.Fiscal_Code || 'N/A'}`]
    ];
  
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      body: companyInfo,
      headStyles: {
        fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
        textColor: [255, 255, 255], // Colore del testo bianco
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        cellPadding: 0.5,
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 120 }
      },
      margin: { left: 130, top: 10 },
      alternateRowStyles: { fillColor: [255, 255, 255] } 
    });
    const rows = purchase.PurchaseRows.map((row, index) => {
      if (!row) return []; // Gestisci eventuali righe undefined o null
      return [
        (index + 1) * 10,
        row.description || 'N/A',
        row.quantity || 0,
        formatCurrency(row.unit_price || 0),
        formatCurrency((row.unit_price || 0) * (row.quantity || 0)),
        row.vat,
        formatCurrency(row.taxed_unit_price || 0),
        formatCurrency(row.taxed_totalprice || 0)
      ];
    });
    

    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['#', 'Descrizione', 'Quantità', 'Importo Unitario IVA Esclusa ', 'Importo Totale IVA Esclusa', 'IVA', 'Importo Unitario IVA Inclusa', 'Importo Unitario IVA Inclusa']],
      body: rows,
      columnStyles: {
        0: { cellWidth: 10 }, // Larghezza della colonna "Row Number"
        1: { cellWidth: 50 }, // Riduci la larghezza della colonna "Description"
        2: { cellWidth: 12 }, // Larghezza della colonna "Category"
        3: { cellWidth: 25 }, // Larghezza della colonna "Subcategory"
        4: { cellWidth: 25 }, // Aumenta la larghezza della colonna "Unit Price"
        5: { cellWidth: 10 }, // Larghezza della colonna "Qty"
        6: { cellWidth: 25 }, // Larghezza della colonna "Total Amount"
        7: { cellWidth: 25}  // Riduci la larghezza della colonna "Currency"
      },
      headStyles: {
        fillColor: [255, 255, 255], // Colore di sfondo rosso per l'intestazione
        textColor: [0, 0, 0], // Colore del testo bianco
        fontStyle: 'bold',
        fontSize: 6
      },
      styles: {
        cellPadding: 1, // Aumenta il padding per dare più spazio alle righe
        fontSize: 8, // Riduci la dimensione del font per il corpo
      },
      margin: { left: 15, top: 10 },
      alternateRowStyles: { fillColor: [255, 255, 255] } 
    });
    
    // Aggiungi la tabella con i totali e altre informazioni
    const summaryDetails = [
      ['Importo Totale IVA Inclusa', `${formatCurrency(purchase.total)}`],
      ['Approvato da', 'Stefano Ierace']
    ];
  
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      body: summaryDetails,
      headStyles: {
        fillColor: [255, 255, 255], // Colore di sfondo rosso per l'intestazione
        textColor: [0, 0, 0], // Colore del testo bianco
        fontStyle: 'bold'
      },
      styles: {
        cellPadding: 1,
        fontSize: 10,
        textColor: [0, 0, 0],
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 }
      },
      margin: { left: 15, top: 10 },
      
      alternateRowStyles: { fillColor: [255, 255, 255] } 
    });
    doc.addImage(firma, 'JPEG', 66, doc.autoTable.previous.finalY + 2,20, 11);
    // Aggiungi il piè di pagina
    const footerText = [
      "Sede Legale e Operativa c/o Kilometro Rosso (Gate 4) - Via Stezzano, 87 24126 Bergamo Tel. +39 035 0690366 - C.F. 95160560165",
      "P.I. 03388700167 REA BG 3713330 - Iscrizione CCIAA di BG n° 03388700167 - SDI J6URRTW PEC: intellimech@legalmail.it",
      "Amministrazione: m.innovati@confindustriabergamo.it"
    ];
  
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    
    const pageHeight = doc.internal.pageSize.height;
    let yOffset = pageHeight - 20; // Imposta un margine dal fondo
    
    footerText.forEach(line => {
      doc.text(line, 15, yOffset);
      yOffset += 3; // Spazio tra le righe del piè di pagina
    });
    
    const safeFileName = `${purchase.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`; // Sostituisci i caratteri non validi
    doc.save(safeFileName);
  };
  
  

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(purchase); // Revert to original data
  };

  const handleSaveClick = () => {
    axios.put(`http://localhost:3000/purchase/update/${id}`, formData, )
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
    <div className="max-w-5xl mx-auto p-2">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">Dettagli Ordine di Acquisto</h2>
    <table className="min-w-full divide-y divide-gray-300 text-sm">
      <tbody>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Ordine</td>
          <td className="px-2 py-1">{purchase.name}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Ordine</td>
          <td className="px-2 py-1">{purchase.referentUser.name + " " + purchase.referentUser.surname + ", ("+ purchase.referentUser?.name.slice(0, 2).toUpperCase() + purchase.referentUser?.surname.slice(0, 2).toUpperCase() + ")"}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Fornitore</td>
          <td className="px-2 py-1">{purchase?.Company?.name}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Data di Creazione</td>
          <td className="px-2 py-1">{formatDate(purchase.createdAt)}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Totale IVA Esclusa</td>
          <td className="px-2 py-1">{formatCurrency(purchase.total)}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Totale con IVA</td>
          <td className="px-2 py-1">{formatCurrency(purchase.taxed_total)}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Modalità di Pagamento</td>
          <td className="px-2 py-1">{purchase.PaymentMethod.name}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Riferimento Interno</td>
          <td className="px-2 py-1">{`${purchase.createdByUser?.name || ''} ${purchase.createdByUser?.surname || ''}`}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Stato</td>
          <td className="px-2 py-1">{purchase.status}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">IVA</td>
          <td className="px-2 py-1">{purchase.IVA}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Bonifico Bancario</td>
          <td className="px-2 py-1">{purchase.banktransfer}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Commessa</td>
          <td className="px-2 py-1">{purchase?.Job?.name}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">Codice Progetto Europeo</td>
          <td className="px-2 py-1">{}</td>
        </tr>
        <tr>
          <td className="px-2 py-1 font-medium text-gray-600">CUP</td>
          <td className="px-2 py-1">{}</td>
        </tr>
      </tbody>
    </table>

    <h3 className="text-lg font-semibold text-gray-800 mt-4">Righe d'Ordine</h3>
    {purchase.PurchaseRows.map((row, index) => (
      <div key={row.id_purchaserow} className="border border-gray-300 rounded-md p-2 mt-3 text-sm">
        <h4 className="text-base font-medium text-gray-700 mb-2">Prodotto nr.{index + 1}</h4>
        <table className="min-w-full divide-y divide-gray-300">
          <tbody>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Codice</td>
              <td className="px-2 py-1">{row.name}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Descrizione</td>
              <td className="px-2 py-1">{row.description}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Quantità</td>
              <td className="px-2 py-1">{row.quantity}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Prezzo Unitario</td>
              <td className="px-2 py-1">{formatCurrency(row.unit_price)}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Prezzo Unitario con IVA</td>
              <td className="px-2 py-1">{formatCurrency(row.taxed_unit_price)}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">IVA</td>
              <td className="px-2 py-1">{row.vat}%</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Totale</td>
              <td className="px-2 py-1">{formatCurrency(row.totalprice)}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Totale con IVA</td>
              <td className="px-2 py-1">{formatCurrency(row.taxed_totalprice)}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Ammortamento</td>
              <td className="px-2 py-1">{row.depreciation ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XMarkIcon className="h-4 w-4 text-red-500" />}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Dettagli Ammortamento</td>
              <td className="px-2 py-1">{row.depreciation_details || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Anni di Ammortamento</td>
              <td className="px-2 py-1">{row.depreciation_years || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Aliquota Ammortamento</td>
              <td className="px-2 py-1">{row.depreciation_aliquota || 'N/A'}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600"> Macro Categoria</td>
              <td className="px-2 py-1">{row.Category.name}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Categoria</td>
              <td className="px-2 py-1">{row.Subcategory.name}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Sottocategoria</td>
              <td className="px-2 py-1">{row.Subsubcategory?.name|| "Non specificata"}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 font-medium text-gray-600">Cespite</td>
              <td className="px-2 py-1">{row.asset ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XMarkIcon className="h-4 w-4 text-red-500" />}</td>
            </tr>
          </tbody>
        </table>
      </div>
          ))}
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
        <dt className="text-sm font-medium leading-6 text-gray-900">Ordine di Acquisto</dt>
            <dd className="mt-2 text-sm text-gray-900">
            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                    <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">{purchase?.name}.pdf</span>
                            <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                        </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <a onClick={handleDownloadPdf} className="font-medium text-blue-800 hover:text-blue-900">
                            Download
                        </a>
                    </div>
                </li>
            </ul>
        </dd>
    </div>
    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
        <dt className="text-sm font-medium leading-6 text-gray-900">Fattur{purchase?.invoices?.length > 1 ? "e" : "a"}</dt>
        <dd className="mt-2 text-sm text-gray-900">
            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                {purchase?.invoices?.map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                            <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                <span className="truncate font-medium">{item.number}.pdf</span>
                                <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <a href="#" className="font-medium text-[#7fb7d4] hover:text-[#A7D0EB]">
                                Download
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </dd>
    </div>
    </div>
  );
}