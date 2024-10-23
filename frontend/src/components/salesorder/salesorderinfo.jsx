import { PaperClipIcon } from '@heroicons/react/20/solid';

export default function SalesOrderInfo({ salesOrder }) {
  console.log(salesOrder); // Aggiungi questo per vedere i dati ricevuti
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli dell'Ordine di Vendita</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sull'ordine di vendita</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* Codice Ordine di Vendita */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Ordine di Vendita</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder?.name || 'N/A'}</dd>
          </div>

          {/* Stato Ordine */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Stato</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder?.status || 'N/A'}</dd>
          </div>

          {/* Descrizione Ordine */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Descrizione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder?.description || 'N/A'}</dd>
          </div>

          {/* Dettagli Offerta */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Offerta</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              Codice Offerta: {salesOrder?.Offer?.name || 'N/A'}<br />
              Stato Offerta: {salesOrder?.Offer?.status || 'N/A'}<br/>
              Descrizione Offerta: {salesOrder?.Offer?.description || 'N/A'}
            </dd>
          </div>

          {/* Dettagli Richiesta di Quotazione */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Richiesta di Offerta</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              Codice Richiesta: {salesOrder?.Offer?.QuotationRequest?.name || 'N/A'}<br />
              Stato Richiesta: {salesOrder?.Offer?.QuotationRequest?.status || 'N/A'}<br />
              Descrizione Richiesta: {salesOrder?.Offer?.QuotationRequest?.description || 'N/A'}
            </dd>
          </div>

          {/* Dettagli Azienda */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Azienda</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              Nome Azienda: {salesOrder?.Offer?.QuotationRequest?.Company?.name || 'N/A'}<br />
            </dd>
          </div>

          {/* Creato da */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Creato da</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              Nome: {salesOrder?.createdByUser?.name || 'N/A'}<br />
              Cognome: {salesOrder?.createdByUser?.surname || 'N/A'}
            </dd>
          </div>

          {/* Stato Documento */}
          {/* <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Documenti</dt>
            <dd className="mt-2 text-sm text-gray-900">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">{salesOrder?.name}.pdf</span>
                      <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="font-medium text-[#7fb7d4] hover:text-blue-900">
                      Download
                    </button>
                  </div>
                </li>
              </ul>
            </dd>
          </div> */}
        </dl>
      </div>
    </div>
  );
}
