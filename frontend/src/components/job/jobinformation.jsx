import { PaperClipIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function Example({ job }) {
  if (!job) return null;

  const getStatusColor = (status) => {
    const colors = {
      'Aperta': 'bg-green-100 text-green-800',
      'Chiusa': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 px-4 py-5 sm:p-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {job.name}
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
              {job?.status || 'Nessuno'}
            </span>
          </h3>
        </div>
      </div>

      {/* Summary Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creato da</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Creazione</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore Totali</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valore Totale</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-sm text-gray-900">{job.name}</td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {`${job.createdByUser?.name.slice(0, 2).toUpperCase()}${job.createdByUser?.surname.slice(0, 2).toUpperCase()} (${job.createdByUser?.name} ${job.createdByUser?.surname})`}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {new Date(job.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {job.Reportings.reduce((total, reported) => total + reported.hour, 0)} h
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer?.amount || 0), 0).toFixed(2)} €
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sales Orders Section */}
      <div className="rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Ordini di Vendita</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Offerta</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valore</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azienda</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Inizio</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {job.SalesOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-sm text-gray-500 text-center">
                    Nessun ordine di vendita trovato
                  </td>
                </tr>
              ) : (
                job.SalesOrders.map((salesorder) => (
                  <tr key={salesorder.id_salesorder} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm text-gray-500">{salesorder.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{salesorder.Offer?.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{salesorder.Offer?.hour} h</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{salesorder.Offer?.amount} €</td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {salesorder.Offer?.QuotationRequest?.Company?.name}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {new Date(salesorder.Offer?.estimatedstart).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">
                      {new Date(salesorder.Offer?.estimatedend).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reportings Section */}
      <div className="rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Rendicontazione</h4>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utente</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ore</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentuale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {job.Reportings.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-3 py-4 text-sm text-gray-500 text-center">
                  Nessuna rendicontazione trovata
                </td>
              </tr>
            ) : (
              job.Reportings.map((reporting) => (
                <tr key={reporting.id_reporting} className="hover:bg-gray-50">
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {`${reporting.createdByUser?.name} ${reporting.createdByUser?.surname || ''}`}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {reporting.task || 'No Task Assigned'}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {reporting.hour || 0} h
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {reporting.Task?.percentage ? `${reporting.Task.percentage} %` : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}