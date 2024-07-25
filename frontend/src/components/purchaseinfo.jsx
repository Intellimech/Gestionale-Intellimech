import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../pages/lost';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PaperClipIcon } from '@heroicons/react/20/solid';

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

      // Margini
      const marginLeft = 15; // Margine sinistro
      const marginRight = 15; // Margine destro
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Imposta i margini nella pagina
      doc.internal.pageSize.width = pageWidth - marginLeft - marginRight;
      
      // Aggiungi il logo
      const logoPath = '../../images/logo.jpg'; 
      doc.addImage(logoPath, 'JPEG', marginLeft, 10, 10, 10); // Modifica la posizione del logo se necessario
      
      // Titolo
      doc.setFontSize(15);
      doc.setFont('Aptos', 'bold');
      doc.text('Ordine di acquisto', marginLeft, 40);
      
      // Dettagli dell'ordine
      const orderDetails = [
          ['N° Ordine di Acquisto', `${purchase.name}`],
          ['Data', `${formatDate(purchase.createdAt)}`],
          ['Riferimento Intellimech', `${purchase?.createdByUser?.name.slice(0, 2).toUpperCase() + purchase?.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + purchase?.createdByUser.name + " " + purchase?.createdByUser.surname + ")"}`],
          ['Metodo di Pagamento', `${purchase.payment_method}`],
          ['Dettagli', `${purchase.details || 'N/A'}`], 
          ['Commessa', `${purchase.jobNumber || 'N/A'}`] 
      ];
      
      // Usa autoTable per creare una tabella orizzontale
      doc.autoTable({
          startY: 45,
          body: orderDetails,
          headStyles: {
              fillColor: [255, 255, 255], 
              textColor: [0, 0, 0], 
              fontStyle: 'Aptos',
              fontSize: 10,
              lineWidth: 0.5,
              lineColor: [0, 0, 0]
          },
          styles: {
              cellPadding: 0.5,
              fontSize: 10,
              fontStyle: 'Aptos',
              textColor: [0, 0, 0]
          },
          columnStyles: {
              0: { cellWidth: 50 }, 
              1: { cellWidth: pageWidth - 2 * marginLeft - 50 - 10 } // Calcola la larghezza della colonna
          },
          margin: { left: marginLeft, right: marginRight },
          alternateRowStyles: { fillColor: [255, 255, 255] } 
      });

      // Informazioni sulla compagnia
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
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              fontStyle: 'italic',
              lineWidth: 0.5,
              lineColor: [0, 0, 0]
          },
          styles: {
              cellPadding: 0.5,
              fontSize: 10,
              fontStyle: 'italic',
              textColor: [0, 0, 0]
          },
          columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: pageWidth - 2 * marginLeft - 50 - 10 }
          },
          margin: { left: 90, right: marginRight },
          alternateRowStyles: { fillColor: [255, 255, 255] } 
      });

      // Righe d'ordine
      const rows = purchase.PurchaseRows.map((row, index) => [
          (index + 1) * 10,
          row.description,
          row.Category.name,
          row.Subcategory.name,
          row.unit_price,
          row.quantity,
          row.unit_price * row.quantity,
          purchase.currency
      ]);

      
      
      doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          head: [['#', 'Description', 'Category', 'Subcategory', 'Unit Price', 'Qty', 'Total Amount', 'Currency']],
          body: rows,
          columnStyles: {
              0: { cellWidth: 7 },
              1: { cellWidth: 40 },
              2: { cellWidth: 29 },
              3: { cellWidth: 29 },
              4: { cellWidth: 12 },
              5: { cellWidth: 7 },
              6: { cellWidth: 15 },
              7: { cellWidth: 10 }
          },
          headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              fontStyle: 'italic',
              fontSize: 6,
              lineWidth: 0.5,
              lineColor: [255, 255, 255],
              minCellHeight: 5  // Aggiungi questa linea per aumentare la distanza
          },
          styles: {
              cellPadding: 0.5,
              fontSize: 8,
              textColor: [0, 0, 0]
          },
          margin: { left: marginLeft, right: marginRight },
          alternateRowStyles: { fillColor: [255, 255, 255] }
      });

      // Aggiungi tabella con totali e altre informazioni
      const summaryDetails = [
          ['Total Amount', `${formatCurrency(purchase.total)}`],
          ['IVA', purchase.VAT + "%" || "22%"],
          ['Approved by', 'Stefano Ierace']
      ];
      
      doc.autoTable({
          startY: doc.autoTable.previous.finalY + 15,
          body: summaryDetails,
          headStyles: {
              fillColor: [255, 255, 255],
              textColor: [0, 0, 0],
              fontStyle: 'italic',
              fontSize: 3,
              lineWidth: 0.5,
              lineColor: [200, 200, 200],
              borderStyle: 'bottom'
          },
          styles: {
              cellPadding: 1,
              fontSize: 10,
              fontStyle: "Aptos",
              textColor: [0, 0, 0]
          },
          columnStyles: {
              0: { cellWidth: 50},
              1: { cellWidth: pageWidth - 2 * marginLeft - 60 - 10 }
          },
          margin: { left: marginLeft, right: marginRight }
      });

      // Aggiungi il footer
      const footerText = [
          "Sede Legale e Operativa c/o Kilometro Rosso (Gate 4) - Via Stezzano, 87 24126 Bergamo - Tel. +39 035 0690366 - C.F. 95160560165",
          "P.I. 03388700167 - REA BG 3713330 - Iscrizione CCIAA di BG n° 03388700167 - SDI J6URRTW - PEC: intellimech@legalmail.it",
          "Amministrazione: m.innovati@confindustriabergamo.it"
      ];

      doc.setFontSize(6);
      doc.setFont('Aptos', 'normal');

      let yOffset = pageHeight - 20;
      footerText.forEach(line => {
          doc.text(line, marginLeft, yOffset);
          yOffset += 3;
      });

      // Nome del file
      const fileName = `${purchase.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        let yOffset = pageHeight - 20;

        // Aggiungi il testo del footer
        footerText.forEach(line => {
            doc.text(line, marginLeft, yOffset);
            yOffset += 3;
        });

        // Aggiungi il nome del file e il numero di pagina
        doc.text(`File: ${fileName}`, marginLeft, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginRight - 40, pageHeight - 10, { align: 'right' });
    }

      // Salva il documento
      
      doc.save(fileName);
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
        <Transition.Root show={showUpdate} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowUpdate(false)}>
            <div className="fixed inset-0" aria-hidden="true" />

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                      <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                        <div className="px-4 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              Modifica l'ordine di acquisto
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => setShowUpdate(false)}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Chiudi pannello</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                          {/* Passa 'purchase' come prop */}
                          <PurchaseUpdateForm purchase={purchase} />
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>


    
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
            onClick={() => setShowUpdate(true)}
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
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.name}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Fornitore</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.Company.name}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Data di creazione</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{formatDate(purchase?.createdAt)}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Totale IVA Esclusa</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{formatCurrency(purchase?.total)}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Modalita di Pagamento</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.payment_method}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Riferimento Interno</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.createdByUser?.name.slice(0, 2).toUpperCase() + purchase?.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + purchase?.createdByUser.name + " " + purchase?.createdByUser.surname + ")"}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 lg:col-span-6 sm:px-0">
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
                                            {product.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.description}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.quantity}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {formatCurrency(product.unit_price)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.VAT}
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
                                            <span className="truncate font-medium">{purchase?.name}.pdf</span>
                                            <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <a onClick={handleDownloadPdf} className="font-medium text-red-600 hover:text-red-500">
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
                                            <a href="#" className="font-medium text-red-600 hover:text-red-500">
                                                Download
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </dd>
                    </div>
        </dl>
      </div>
    </div>
  );
}
