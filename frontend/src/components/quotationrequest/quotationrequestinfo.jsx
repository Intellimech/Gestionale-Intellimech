import React from 'react';

export default function QuotationDetails({ quotationrequest }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPM = (user) => {
    if (!user) return 'N/A';
    return `${user.name.slice(0, 2).toUpperCase()}${user.surname.slice(0, 2).toUpperCase()} (${user.name} ${user.surname})`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Dettagli Richiesta di Offerta
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {quotationrequest?.Company?.name}
        </p>
      </div>

      {/* Informazioni Generali */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Informazioni Generali
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            <TableRow label="Codice Richiesta" value={quotationrequest?.name} />
            <TableRow label="Codice Progetto" value={quotationrequest?.externalcode} />
            <TableRow label="Cliente" value={quotationrequest?.Company?.name} />
            <TableRow label="Descrizione" value={quotationrequest?.description} />
          </div>
        </div>
      </div>

      {/* Dettagli Tecnici */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Dettagli Tecnici
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            <TableRow label="Tipo Progetto" value={quotationrequest?.ProjectType?.description} />
            <TableRow label="Incarico" value={quotationrequest?.Assignment?.description} />
            <TableRow label="Area Tecnica" value={quotationrequest?.TechnicalArea?.name} />
          </div>
        </div>
      </div>

      {/* Date e Stato */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Date e Stato
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            <TableRow label="Data di Creazione" value={formatDate(quotationrequest?.createdAt)} />
            <TableRow label="Data di Aggiornamento" value={formatDate(quotationrequest?.updatedAt)} />
            <TableRow label="Project Manager" value={formatPM(quotationrequest?.createdByUser)} />
            <TableRow 
              label="Stato della Richiesta" 
              value={quotationrequest?.status}
              valueClass={`font-medium ${
                quotationrequest?.status === 'Approvata' ? 'text-green-600' : 
                quotationrequest?.status === 'In approvazione' ? 'text-yellow-600' : 
                quotationrequest?.status === 'Rifiutata' ? 'text-red-600' : 
                'text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TableRow = ({ label, value, valueClass = "text-gray-900" }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors duration-150 flex flex-col sm:flex-row sm:items-center">
    <dt className="text-sm font-medium text-gray-500 w-1/3">{label}</dt>
    <dd className={`mt-1 sm:mt-0 text-sm ${valueClass} w-2/3`}>
      {value || 'N/A'}
    </dd>
  </div>
);