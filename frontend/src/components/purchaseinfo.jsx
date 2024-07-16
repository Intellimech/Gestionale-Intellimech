import { PaperClipIcon } from '@heroicons/react/20/solid'
import { useEffect } from 'react';

export default function Example({ purchase }) {
    useEffect(() => {
        console.log(purchase);
    }, [purchase]);
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli sull'ordine di Acquisto</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sull'ordine di Acquisto</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Codice Ordine</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Fornitore</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase.Company.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Data di creazione</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{new Date(purchase.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Totale IVA Esclusa</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase.total + " " + purchase.currency}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Riferimento Interno</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase.createdByUser?.name.slice(0, 2).toUpperCase() + purchase.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + purchase.createdByUser.name + " " + purchase.createdByUser.surname + ")"}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-5 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Righe d'ordine</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"></dd>
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                N° Riga
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Descrizione
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Quantità
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                Prezzo Unitario
                            </th>
                            <th
                                scope="col"
                                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                            >
                                IVA
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {purchase.products?.map((item, index) => (
                            <tr key={item.id} className="bg-gray-50">
                                <td className="py-3.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
                                <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">{item.description}</td>
                                <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">{item.quantity + " pz."}</td>
                                <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">{item.unit_price + " " + purchase.currency}</td>
                                <td className="hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell">{item.VAT}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
                <dt className="text-sm font-medium leading-6 text-gray-900">Ordine di Acquisto</dt>
                <dd className="mt-2 text-sm text-gray-900">
                    <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">{purchase.name}.pdf</span>
                            <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                        </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                        <a href="#" className="font-medium text-red-600 hover:text-red-500">
                            Download
                        </a>
                        </div>
                    </li>
                    </ul>
                </dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3">
                <dt className="text-sm font-medium leading-6 text-gray-900">Fattur{purchase.invoices?.length > 1 ? "e" : "a" }</dt>
                <dd className="mt-2 text-sm text-gray-900">
                    <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                        {purchase.invoices?.map((item, index) => (
                            <li key={item.id} className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                <div className="flex w-0 flex-1 items-center">
                                    <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                        <span className="truncate font-medium">{item.number}.pdf</span>
                                        <span className="flex-shrink-0 text-gray-400">2.4mb</span>
                                    </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                    <a href="#" className="font-medium text-red-600 hover:text-red-500">
                                        Download
                                    </a>
                                </div>
                            </li>
                        ))    
                        }
                    </ul>
                </dd>
            </div>
        </dl>
      </div>
    </div>
  )
}
