import { PaperClipIcon } from '@heroicons/react/20/solid';

export default function SalesOrderInfo({ salesOrder }) {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="pb-2 border-b mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Dettagli dell'Ordine di Vendita</h3>
        <p className="mt-1 text-gray-500 text-sm">Informazioni dettagliate sull'ordine di vendita</p>
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Dettaglio</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Informazione</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Codice Ordine di Vendita */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Codice Ordine di Vendita</td>
            <td className="px-4 py-2 text-xs text-gray-900">{salesOrder?.name || 'N/A'}</td>
          </tr>
          
          {/* Stato Ordine */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Stato</td>
            <td className="px-4 py-2 text-xs text-gray-900">{salesOrder?.status || 'N/A'}</td>
          </tr>

          {/* Descrizione Ordine */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Descrizione</td>
            <td className="px-4 py-2 text-xs text-gray-900">{salesOrder?.Offer?.description || salesOrder?.Offer?.QuotationRequest?.description}</td>
          </tr>

          {/* Offerta */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Offerta</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              Codice: {salesOrder?.Offer?.name || 'N/A'}, Stato: {salesOrder?.Offer?.status || 'N/A'}<br />
              Descrizione: {salesOrder?.Offer?.description || 'N/A'}
            </td>
          </tr>

          {/* Richiesta di Quotazione */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Richiesta di Offerta</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              Codice: <a className="font-medium" href={'/app/offer/' + salesOrder?.Offer?.QuotationRequest?.id_QuotationRequest}>{salesOrder?.Offer?.QuotationRequest?.name || 'N/A'}</a>
            </td>
          </tr>

          {/* Ore Offerta */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Ore Offerta</td>
            <td className="px-4 py-2 text-xs text-gray-900">{salesOrder?.Offer?.hour || 'N/A'} h</td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Importo Offerta</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.Offer?.amount 
                ? `${Number(salesOrder.Offer.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` 
                : 'N/A'}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Data Inizio Stimata</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.Offer?.estimatedstart 
                ? new Date(salesOrder.Offer.estimatedstart).toLocaleDateString() 
                : 'N/A'}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Data Fine Stimata</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.Offer?.estimatedend 
                ? new Date(salesOrder.Offer.estimatedend).toLocaleDateString() 
                : 'N/A'}
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Data di Creazione</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.createdAt
                ? new Date(salesOrder.createdAt).toLocaleDateString()
                : 'N/A'}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Tipo Progetto</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.Offer?.QuotationRequest?.ProjectType?.code || 'N/A'}
            </td>
          </tr>

          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Area Tecnica</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.Offer?.QuotationRequest?.TechnicalArea?.code || 'N/A'}
            </td>
          </tr>

          {/* Azienda */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Azienda</td>
            <td className="px-4 py-2 text-xs text-gray-900">{salesOrder?.Offer?.QuotationRequest?.Company?.name || 'N/A'}</td>
          </tr>

          {/* Creato da */}
          <tr className="hover:bg-gray-50">
            <td className="px-4 py-2 text-xs font-medium text-gray-700">Creato da</td>
            <td className="px-4 py-2 text-xs text-gray-900">
              {salesOrder?.createdByUser?.name || 'N/A'} {salesOrder?.createdByUser?.surname || 'N/A'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
