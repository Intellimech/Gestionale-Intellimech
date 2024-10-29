import { PaperClipIcon } from '@heroicons/react/20/solid';
import { jsPDF } from 'jspdf';
import logo from '../../images/logo.jpg';
import 'jspdf-autotable';

export default function Example({ offer }) {
 
  console.log(offer?.CommercialOffers);
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const logoPath = '../images/logo.jpg'; 
    const imageWidth = 62; // Increase width
    const imageHeight = 14; // Increase height
    doc.addImage(logo, 'JPEG', 15, 15, imageWidth, imageHeight);
  

    // Dati dell'intestazione
    const headerText = `

CONSORZIO INTELLIMECH
c/o Kilomentro Rosso Innovation District - Via Stezzano, 87 24126 Bergamo
Tel. +39 035 0690366 - C.C.I.A.A. di BG n. 03388700167 C.F. 95160560165
REA N. BG 3713330 - Codice Identificativo SDI: J6URRTW
PEC: intellimech@legalmail.it - www.intellimech.it
    `;
    doc.setFontSize(9); // Riduci la dimensione del font dell'intestazione
    doc.setFont('Aptos', 'normal');

    // Calcola la larghezza della pagina e la larghezza del testo
    const pageWidth = doc.internal.pageSize.width;

    doc.text(headerText, 90, 15);

    doc.setTextColor(0,0,0);

    // Dati dell'offerta
    const offerDetails = [
        ['Offerta', 'OFF24_00001'],
        ['Revisione', 'R0'],
        ['Data', '10/03/2024'],
        ['Cliente', 'Co.Mac. SRL']
    ];

    // Titolo centrato a 30 mm dal margine sinistro
    const marginLeft = 15; // Margine sinistro in mm
    doc.setFontSize(11); // Riduci la dimensione del font del titolo
    doc.setFont('Aptos', 'bold');
    doc.setTextColor(0,0,0);
    
    // Dati dell'offerta
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    
    // Usa autoTable per creare una tabella orizzontale
    
// Usa autoTable per creare una tabella orizzontale
    doc.autoTable({
        startY: 55,
        body: offerDetails,
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

    const descriptionTitle = "Obiettivo";
    const descriptionText = `
        Il progetto nasce dalla necessità da parte di Co.Mac di verticalizzare, in una soluzione applicabile all’interno delle proprie linee di confezionamento fusti.
        `;

    // Imposta il titolo e il testo
    doc.setFontSize(11);
    doc.setFont('Aptos', 'bold');
    doc.text(descriptionTitle, 15, 85);

    doc.setFontSize(11);
    doc.setFont('Aptos', 'normal');
    doc.text(descriptionText, 15, 90, {
        maxWidth: 180 // Imposta una larghezza massima per il testo
    });

    const descriptionTitle2 = "Offerta Tecnica";
    const descriptionText2 = `
    Il sistema deve essere in grado di determinare il verso dei fusti (fusto rivolto verso l’alto, fusto rivolto verso il basso) che passano sotto al sensore. Il sensore comunicherà con un PC industriale tramite un PLC di acquisizione dati. Il PC industriale processerà il segnale per discriminare i fusti e sarà a sua volta collegato al PLC della linea di confezionamento fusti.
    Il sistema deve essere in grado di analizzare le immagini acquisite tramite video camera e discriminare tra fusti con capsula e fusti senza capsula e tra fusti con collare e fusti senza collare. Anche il sistema di visione sarà collegato ad un PC industriale; il PC Industriale processerà le immagini per discriminare la presenza delle capsule e sarà a sua volta collegato al PLC della linea di confezionamento fusti.
    Il sistema deve essere in grado di analizzare le immagini acquisite tramite video camera e determinare la tipologia di fitting presente sul fusto; le tipologie possibili sono in tutto 7 e quindi la discriminazione terrà in considerazione tale variabilità. Il sistema di visione sarà il medesimo previsto per l’assolvimento della funzionalità A2.

    `;

    // Imposta il titolo e il testo
    doc.setFontSize(11);
    doc.setFont('Aptos', 'bold');
    doc.text(descriptionTitle2, 15, 110);
    doc.setFontSize(11);
    doc.setFont('Aptos', 'norma');

    doc.text(descriptionText2, 15, 115, {
        maxWidth: 180 // Imposta una larghezza massima per il testo
    });
        
        const safeFileName =  `${offer.name}.pdf`; 
        doc.save(safeFileName);
    };
    


  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli sull'offerta</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sull'offerta</p>
      </div>
      <div className="mt-6">
        {/* Offer Details Section */}
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Offerta</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.name}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Cliente</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.Company?.name}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Ore stimate</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.hour + 'h'}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Valore</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.amount + ' €'}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Costo Orario</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{(offer?.amount / offer?.hour).toFixed(2)} €</dd>
          </div>
          {/* Additional Offer Details */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Creazione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {new Date(offer?.createdAt).toLocaleDateString() + " " + new Date(offer?.createdAt).toLocaleTimeString()}
            </dd>
          </div>
          {/* More offer fields can be added here */}
        </dl>

        {/* Quotation Request Details Section */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold leading-6 text-gray-900">Dettagli Richiesta di Offerta</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Nome Richiesta</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Descrizione</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.description}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Categoria</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.Category?.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Area Tecnica</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.TechnicalArea?.name}</dd>
            </div>
            
          </dl>
        </div>

     {/* Company Details Section */}
        <div className="mt-6">
        <h4 className="text-lg font-semibold leading-6 text-gray-900">Dettagli Azienda</h4>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Nome Azienda</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer?.QuotationRequest?.Company?.name}</dd>
            </div>
           
        </dl>
        </div>


        <div className="mt-6">
            <h4 className="text-lg font-semibold leading-6 text-gray-900">Offerte Commerciali</h4>
            <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Descrizione</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collegato a Task</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {offer?.CommercialOffers?.length > 0 ? (
                    offer.CommercialOffers.map((comOffer) => (
                    <tr key={comOffer.id_commercialoffer}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comOffer.linkedtask}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comOffer.amount} €</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(comOffer.date).toLocaleDateString()}</td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan="4" className="px-6 py-4 text-sm text-gray-500 text-center">Nessuna offerta commerciale disponibile.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>

           {/* Tasks Section */}
            <div className="mt-6">
            <h4 className="text-lg font-semibold leading-6 text-gray-900">Attività associate</h4>
            <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                {offer?.Tasks && offer.Tasks.length > 0 ? (
                offer.Tasks.map((task) => (
                    <li key={task.id_task} className="flex items-center justify-between py-4 pl-4 pr-5 text-sm">
                    <div className="flex w-0 flex-1 items-center">
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                        <span className="truncate font-medium">{task.name}</span>
                        <span className="truncate font-medium">{task.description}</span>
                        <span className="flex-shrink-0 text-gray-400">{task.hour}h</span>
                        <span className="flex-shrink-0 text-gray-400">Stato: {task.percentage}%</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="relative pt-1 w-1/3">
                        <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-GRAY-600 bg-[#7fb7d4]">
                            {task.percentage}%
                            </span>
                        </div>
                        </div>
                        <div className="flex h-2 overflow-hidden text-xs bg-gray-200 rounded">
                        <div
                            style={{ width: `${task.percentage}%` }}
                            className="flex flex-col text-center text-white bg-[#7fb7d4] rounded"
                        />
                        </div>
                    </div>
                    </li>
                ))
                ) : (
                <li className="py-4 pl-4 pr-5 text-sm text-gray-500">Nessuna attività associata.</li>
                )}
            </ul>
            </div>


      </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Documenti</dt>
                <dd className="mt-2 text-sm text-gray-900">
                    <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />

                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">{offer?.name}.pdf</span>
                        </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button onClick={handleDownloadPdf} className="font-medium text-[#7fb7d4] hover:text-blue-900">
                                Download
                            </button>

                        </div>

                    </li>
                    </ul>
                </dd>



            </div>

    </div>

    
  );
}
