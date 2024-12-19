import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Lost from '../../pages/lost.jsx';
import { useParams } from 'react-router-dom';

export default function ContractDetail({ contract: initialContract }) {
  const [contract, setContract] = useState(initialContract);
  const { id } = useParams();

  useEffect(() => {
    if (!initialContract) {
      axios.get(`http://localhost:3000/contract/read/${id}`)
        .then(response => {
          setContract(response.data.contracts);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [id, initialContract]);

  const formatCurrency = (amount) => {
    if (!amount) return `0 ${contract?.Currency?.code || ''}`;
    return `${parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${contract?.Currency?.code || ''}`;
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  if (!contract) {
    return <Lost />;
  }

  return (
    <div className="max-w-5xl mx-auto p-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Dettagli Contratto</h2>
      <table className="min-w-full divide-y divide-gray-300 text-sm">
        <tbody>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Nome Contratto</td>
            <td className="px-2 py-1">{contract.name}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Referente</td>
            <td className="px-2 py-1">{contract.referentUser?.name + " " + contract.referentUser?.surname}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Azienda</td>
            <td className="px-2 py-1">{contract?.Company?.name}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Data di Inizio</td>
            <td className="px-2 py-1">{formatDate(contract.contract_start_date)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Data di Fine</td>
            <td className="px-2 py-1">{formatDate(contract.contract_end_date)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Totale IVA Esclusa</td>
            <td className="px-2 py-1">{formatCurrency(contract.total)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Totale con IVA</td>
            <td className="px-2 py-1">{formatCurrency(contract.taxed_total)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Modalità di Pagamento</td>
            <td className="px-2 py-1">{contract.payment_method}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Stato</td>
            <td className="px-2 py-1">{contract.status}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">IVA</td>
            <td className="px-2 py-1">{contract.IVA}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Bonifico Bancario</td>
            <td className="px-2 py-1">{contract.banktransfer}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Commessa</td>
            <td className="px-2 py-1">{contract?.Job?.name}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Ricorrenza</td>
            <td className="px-2 py-1">{contract.recurrence || 'N/A'}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Numero Ricorrenze</td>
            <td className="px-2 py-1">{contract.recurrence_number || 'N/A'}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Acconto</td>
            <td className="px-2 py-1">{formatCurrency(contract.deposit)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Data di Creazione</td>
            <td className="px-2 py-1">{formatDate(contract.createdAt)}</td>
          </tr>
          <tr>
            <td className="px-2 py-1 font-medium text-gray-600">Ultimo Aggiornamento</td>
            <td className="px-2 py-1">{formatDate(contract.updatedAt)}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-lg font-semibold text-gray-800 mt-4">Righe Contratto</h3>
      {contract.ContractRows?.map((row, index) => (
        <div key={row.id_contractrow} className="border border-gray-300 rounded-md p-2 mt-3 text-sm">
          <h4 className="text-base font-medium text-gray-700 mb-2">Servizio nr.{index + 1}</h4>
          <table className="min-w-full divide-y divide-gray-300">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-medium text-gray-600">ID</td>
                <td className="px-2 py-1">{row.id_contractrow}</td>
              </tr>
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
                <td className="px-2 py-1 font-medium text-gray-600">IVA (%)</td>
                <td className="px-2 py-1">{row.vat}</td>
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
                <td className="px-2 py-1 font-medium text-gray-600">Macro Categoria</td>
                <td className="px-2 py-1">{row.Category?.name}</td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium text-gray-600">Categoria</td>
                <td className="px-2 py-1">{row.Subcategory?.name}</td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium text-gray-600">Sottocategoria</td>
                <td className="px-2 py-1">{row.Subsubcategory?.name || 'Non specificata'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {contract?.status === 'Approvato' && (
        <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
          <dt className="text-sm font-medium leading-6 text-gray-900">Contratto</dt>
          <dd className="mt-2 text-sm text-gray-900">
            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
              <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                <div className="flex w-0 flex-1 items-center">
                  <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  <div className="ml-4 flex min-w-0 flex-1 gap-2">
                    <span className="truncate font-medium">{contract?.name}.pdf</span>
                    <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a className="font-medium text-blue-800 hover:text-blue-900 cursor-pointer">
                    Download
                  </a>
                </div>
              </li>
            </ul>
          </dd>
        </div>
      )}
    </div>
  );
}