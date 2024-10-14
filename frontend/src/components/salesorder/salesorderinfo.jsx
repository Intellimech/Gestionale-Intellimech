import { PaperClipIcon } from '@heroicons/react/20/solid';
import { jsPDF } from 'jspdf';
import logo from '../../images/logo.jpg';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SalesOrderInfo( id_saleorder ) {
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sales order details from the backend
    const fetchSalesOrder = async () => {
      try {
        console.log("Ecco cosa ricevo: " + JSON.stringify(id_saleorder, null, 2));
        // Supponiamo che questa sia la stringa che ricevi
        let responseString = '{"salesorder": 1}'; // Stringa che ricevi

        // Converti la stringa in un oggetto
        let responseObject = JSON.parse(responseString);

        // Accedi all'ID
        let salesOrderId = responseObject.salesorder; // Questo sarà 1

        console.log("ID Sales Order: " + salesOrderId); // Stampa: ID Sales Order: 1

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read/${salesOrderId}`); 
        setSalesOrder(response.data.salesorder);
      } catch (error) {
        console.error('Error fetching sales order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrder();
  }, [id_saleorder]);

  // Render loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Check if salesOrder is null after loading
  if (!salesOrder) {
    return <p>No sales order found.</p>;
  }

  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli dell'Ordine di Vendita</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sull'ordine di vendita</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Codice Ordine di Vendita</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder.name}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Stato</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder.status}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Creazione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {new Date(salesOrder.createdAt).toLocaleDateString() + ' ' + new Date(salesOrder.createdAt).toLocaleTimeString()}
            </dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Data di Aggiornamento</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
              {new Date(salesOrder.updatedAt).toLocaleDateString() + ' ' + new Date(salesOrder.updatedAt).toLocaleTimeString()}
            </dd>
          </div>
          {/* Additional fields as needed */}
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Descrizione</dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{salesOrder.description || 'N/A'}</dd>
          </div>
          <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">Documenti</dt>
            <dd className="mt-2 text-sm text-gray-900">
              <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">{salesOrder.name}.pdf</span>
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
          </div>
        </dl>
      </div>
    </div>
  );
}
