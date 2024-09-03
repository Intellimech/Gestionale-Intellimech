import { PaperClipIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Example({ job }) {
  
    const handleDownloadPdf = () => {
        const doc = new jsPDF();

        // Dati dell'intestazione
        const headerText = `
    cid:60e23365-6651-4074-b933-e737d4c5eacf@eurprd03.prod.outlook.com
    CONSORZIO INTELLIMECH
    c/o Kilomentro Rosso Innovation District - Via Stezzano, 87 24126 Bergamo
    Tel. +39 035 0690366 - C.C.I.A.A. di BG n. 03388700167 C.F. 95160560165
    REA N. BG 3713330 - Codice Identificativo SDI: J6URRTW
    PEC: intellimech@legalmail.it - www.intellimech.it
        `;
        doc.setFontSize(6); // Riduci la dimensione del font dell'intestazione
        doc.setFont('Helvetica', 'normal');

        // Calcola la larghezza della pagina e la larghezza del testo
        const pageWidth = doc.internal.pageSize.width;

        doc.text(headerText, 120, 10);

        // Dati dell'jobta
        const jobDetails = [
            ['Job Name', job.name],
            ['Status', job.status],
            ['Created By', `${job.createdByUser.name} ${job.createdByUser.surname}`],
            ['Created At', new Date(job.createdAt).toLocaleDateString()]
        ];

        // Titolo centrato a 30 mm dal margine sinistro
        const marginLeft = 10; // Margine sinistro in mm
        const title = "Job Details";
        doc.setFontSize(12); // Riduci la dimensione del font del titolo
        doc.setFont('Helvetica', 'bold');
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, 15, 50);

        // Dati dell'jobta
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        
        // Usa autoTable per creare una tabella orizzontale
        doc.autoTable({
            startY: 55,
            body: jobDetails,
            headStyles: {
            fillColor: [255, 0, 0], // Colore di sfondo rosso per l'intestazione
            textColor: [255, 255, 255], // Colore del testo bianco
            fontStyle: 'bold'
            },
            styles: {
            cellPadding: 0.5, // Riduci il padding delle celle per meno spazio tra le righe
            fontSize: 10, // Riduci la dimensione del font per più spazio
            fillColor: [255, 255, 255] 
            },
            columnStyles: {
            0: { cellWidth: 50 }, 
            1: { cellWidth: 120 } 
            },
            margin: { top: 10 },
            alternateRowStyles: { fillColor: [255, 255, 255] } 
        });

        // Iterate over Sales Orders
        job.SalesOrders.forEach((salesOrder, index) => {
            const salesOrderDetails = [
                ['Sales Order Name', salesOrder.name],
                ['Offer Name', salesOrder.Offer.name],
                ['Hours', salesOrder.Offer.hour],
                ['Amount', salesOrder.Offer.amount],
                ['Estimated Start', new Date(salesOrder.Offer.estimatedstart).toLocaleDateString()],
                ['Estimated End', new Date(salesOrder.Offer.estimatedend).toLocaleDateString()],
                ['Client', salesOrder.Offer.QuotationRequest.Company.name],
            ];

            // Titolo Sales Order
            const salesOrderTitle = `Sales Order ${index + 1}`;
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'bold');
            doc.text(salesOrderTitle, 15, doc.autoTable.previous.finalY + 10);

            // Dettagli Sales Order
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 15,
                body: salesOrderDetails,
                styles: {
                    cellPadding: 0.5, // Riduci il padding delle celle
                    fontSize: 10, // Riduci la dimensione del font
                    fillColor: [255, 255, 255]
                },
                columnStyles: {
                    0: { cellWidth: 50 },
                    1: { cellWidth: 120 }
                },
                margin: { top: 10 },
                alternateRowStyles: { fillColor: [255, 255, 255] }
            });
        });

        const safeFileName =  `${job.name}.pdf`; 
        doc.save(safeFileName);
    };
    
  useEffect(() => {
    console.log(job);
  }, [job]);
    
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">{job.name}
          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${{
              'Aperta': 'bg-gray-100 text-green-800',
              'Chiusa': 'bg-gray-100 text-red-800',
            }[job?.status] || 'bg-gray-100 text-gray-800'}`}>
              {job?.status || 'Nessuno'}
            </span>
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sul progetto</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice progetto</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{job.name}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Creato da</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{job.createdByUser?.name.slice(0, 2).toUpperCase() + job.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + job.createdByUser.name + " " + job.createdByUser.surname + ")"}</dd>
            </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Creazione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{new Date(job.createdAt).toLocaleDateString()}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Ore Contrattuali</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{job.Reportings.reduce((total, reported) => total + reported.hour, 0)} h</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Valore Contrattuale</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer.amount), 0).toFixed(2) + ' €'}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 lg:col-span-6 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Ordine di vendita</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"></dd>
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Codice Prodotto
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Codice Offerta
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Ore
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Valore
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Azienda
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Data di inizio stimata
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Data di fine stimata
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {job.SalesOrders.length === 0 ? (
                              <tr className='text-center'>
                                <td colSpan="7" className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    Nessun ordine di vendita trovato
                                </td>
                              </tr>
                            ) : (
                                job?.SalesOrders?.map((salesorder) => (
                                    <tr key={salesorder.id_salesorder}>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Offer.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Offer.hour} h
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Offer.amount} €
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Offer.QuotationRequest.Company.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Date(salesorder.Offer.estimatedstart).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {new Date(salesorder.Offer.estimatedend).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                              )}
                            
                            </tbody>
                        </table>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 lg:col-span-6 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Rendicontazione</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"></dd>
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Utente
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Tasks
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Ore
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Percentuale
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {job?.Reportings?.length === 0 ? (
                              <tr className='text-center'>
                                <td colSpan="4" className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    Nessuna rendicontazione trovata
                                </td>
                              </tr>
                            ) : (job?.Reportings?.map((salesorder) => (
                                    <tr key={salesorder.id_salesorder}>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.createdByUser.name + " " + salesorder.createdByUser.surname}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Task.name + " " + "(" + salesorder.Task.description + ")"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Task.hour} h
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {salesorder.Task.percentage} %
                                        </td>
                                        
                                    </tr>
                                ))
                              )}
                            </tbody>
                        </table>
          </div>

        </dl>
      </div>
    </div>
  )
}
