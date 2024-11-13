import { PaperClipIcon } from '@heroicons/react/20/solid';
import { jsPDF } from 'jspdf';
import logo from '../../images/logo.jpg';
import 'jspdf-autotable';

export default function Example({ quotationrequest }) {
    console.log("ecco qua cosa mi arriva"+quotationrequest)
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli sulla richiesta di offerta</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sulla richiesta di offerta</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* Codice Richiesta */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Richiesta</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.name}</dd>
          </div>

          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Esterno</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.externalcode}</dd>
          </div>

          {/* Descrizione */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Descrizione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.description}</dd>
          </div>

          {/* Cliente */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Cliente</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.Company?.name}</dd>
          </div>

          {/* Categoria */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Tipo Progetto</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.ProjectType?.description}</dd>
          </div>

          {/* Sottocategoria */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Incarico</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.Assignment?.description}</dd>
          </div>

          {/* Area Tecnica */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Area Tecnica</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.TechnicalArea?.name}</dd>
          </div>

          {/* Data di Creazione */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Creazione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {new Date(quotationrequest?.createdAt).toLocaleDateString()} {new Date(quotationrequest?.createdAt).toLocaleTimeString()}
            </dd>
          </div>

          {/* Data di Aggiornamento */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Aggiornamento</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {quotationrequest?.updatedAt
                ? new Date(quotationrequest?.updatedAt).toLocaleDateString() +
                  ' ' +
                  new Date(quotationrequest?.updatedAt).toLocaleTimeString()
                : 'N/A'}
            </dd>
          </div>

          {/* Project Manager */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Project Manager</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {quotationrequest?.createdByUser?.name.slice(0, 2).toUpperCase() +
                quotationrequest?.createdByUser?.surname.slice(0, 2).toUpperCase() +
                ' (' +
                quotationrequest?.createdByUser?.name +
                ' ' +
                quotationrequest?.createdByUser?.surname +
                ')'}
            </dd>
          </div>

          {/* Stato della Richiesta */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Stato della Richiesta</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{quotationrequest?.status}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
