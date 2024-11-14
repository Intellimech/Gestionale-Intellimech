import { PaperClipIcon } from '@heroicons/react/20/solid';

export default function SalesOrderInfo({ salesOrder }) {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="pb-4 border-b mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Dettagli dell'Ordine di Vendita</h3>
        <p className="mt-1 text-gray-500">Informazioni dettagliate sull'ordine di vendita</p>
      </div>
      
      <table className="min-w-[600px] divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dettaglio</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Informazione</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Codice Ordine di Vendita */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Codice Ordine di Vendita</td>
            <td className="px-6 py-4 text-sm text-gray-900">{salesOrder?.name || 'N/A'}</td>
          </tr>
          
          {/* Stato Ordine */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Stato</td>
            <td className="px-6 py-4 text-sm text-gray-900">{salesOrder?.status || 'N/A'}</td>
          </tr>

          {/* Descrizione Ordine */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Descrizione</td>
            <td className="px-6 py-4 text-sm text-gray-900">{salesOrder?.description || 'N/A'}</td>
          </tr>

          {/* Offerta */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Offerta</td>
            <td className="px-6 py-4 text-sm text-gray-900">
              Codice: {salesOrder?.Offer?.name || 'N/A'}, Stato: {salesOrder?.Offer?.status || 'N/A'}<br />
              Descrizione: {salesOrder?.Offer?.description || 'N/A'}
            </td>
          </tr>

          {/* Richiesta di Quotazione */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Richiesta di Offerta</td>
            <td className="px-6 py-4 text-sm text-gray-900">
              Codice: {salesOrder?.Offer?.QuotationRequest?.name || 'N/A'}, Stato: {salesOrder?.Offer?.QuotationRequest?.status || 'N/A'}<br />
              Descrizione: {salesOrder?.Offer?.QuotationRequest?.description || 'N/A'}
            </td>
          </tr>

          {/* Azienda */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Azienda</td>
            <td className="px-6 py-4 text-sm text-gray-900">{salesOrder?.Offer?.QuotationRequest?.Company?.name || 'N/A'}</td>
          </tr>

          {/* Creato da */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">Creato da</td>
            <td className="px-6 py-4 text-sm text-gray-900">
              {salesOrder?.createdByUser?.name || 'N/A'} {salesOrder?.createdByUser?.surname || 'N/A'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
