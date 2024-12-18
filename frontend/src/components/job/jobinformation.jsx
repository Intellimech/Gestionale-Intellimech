import { PaperClipIcon } from '@heroicons/react/20/solid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function JobDetails({ job }) {
  if (!job) return null;
 console.log(job);
  function capitalizeAfterPeriodAndFirstLetter(str) {
    if (!str) return ""; 
    return str
        .trim()
        .replace(/(^|\.\s+)(\w+)/g, (match, prefix, word) => {
            return prefix + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
  }

  const handleDownloadPdf = () => {
    // Implement PDF download logic if needed
    console.log('PDF download for job', job.name);
  };

  const getRowLabel = (index) => {
    const labels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return labels[index] || '';
  };

  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli del Lavoro</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sul progetto</p>
      </div>

      {/* Main Details Table */}
      <div className="mt-4">
        <div className="overflow-hidden border border-gray-200 rounded-lg mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900 w-1/4">Codice Lavoro</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">{job?.name}</td>
              </tr>
              <tr className="bg-white-50">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Stato</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium 
                    ${job.status === 'Aperta' ? 'bg-green-100 text-green-800' : 
                      job.status === 'Chiusa' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {job?.status || 'Nessuno'}
                  </span>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Creato da</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                  {`${job.createdByUser?.name} ${job.createdByUser?.surname}`}
                </td>
              </tr>
              <tr className="bg-white-50">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Data di Creazione</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job?.createdAt).toLocaleDateString() + " " + new Date(job?.createdAt).toLocaleTimeString()}
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Ore Totali</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">{job.totalHours} h</td>
              </tr>
              <tr className="bg-white-50">
                <td className="px-6 py-1 whitespace-nowrap text-sm font-medium text-gray-900">Valore Totale</td>
                <td className="px-6 py-1 whitespace-nowrap text-sm text-gray-500">
                  {job.SalesOrders.reduce((total, order) => total + parseFloat(order.Offer?.amount || 0), 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sales Orders Section */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Ordini di Vendita</h4>
          <div className="overflow-hidden border border-gray-200 rounded-lg mb-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Prodotto</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Offerta</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Ore</th>
                  <th className="px-3 py-1 text-right text-sm font-medium text-gray-900">Valore</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Azienda</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {job.SalesOrders.length > 0 ? (
                  job.SalesOrders.map((salesorder, index) => (
                    <tr key={salesorder.id_salesorder}>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">{salesorder.name}</td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">{salesorder.Offer?.name}</td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">{salesorder.Offer?.hour} h</td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900 text-right">
                        {Number(salesorder.Offer?.amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {salesorder.Offer?.QuotationRequest?.Company?.name}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {new Date(salesorder.Offer?.estimatedstart).toLocaleDateString()} - 
                        {new Date(salesorder.Offer?.estimatedend).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-1 text-sm text-gray-500 text-center">Nessun ordine di vendita disponibile.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reportings Section */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Rendicontazione</h4>
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Utente</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Tasks</th>
                  <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Ore</th>
                  {/* <th className="px-3 py-1 text-left text-sm font-medium text-gray-900">Percentuale</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {job.allReportings.length > 0 ? (
                  job.allReportings.map((reporting) => (
                    <tr key={reporting.id_reporting}>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {`${reporting.createdByUser?.name} ${reporting.createdByUser?.surname || ''}`}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {reporting?.associatedTask?.description || 'Nessun Task Assegnato'}
                      </td>
                      <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {reporting.hour || 0} h
                      </td>
                      {/* <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-900">
                        {reporting.Task?.percentage ? `${reporting.Task.percentage} %` : 'N/A'}
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 py-1 text-sm text-gray-500 text-center">Nessuna rendicontazione disponibile.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents Section */}
        
      </div>
    </div>
  );
}