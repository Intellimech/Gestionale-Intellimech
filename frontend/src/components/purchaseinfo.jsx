import { PaperClipIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../pages/lost';
import { useParams } from 'react-router-dom';

export default function Example({ purchase: initialpurchase }) {
    const [purchase, setpurchase] = useState(initialpurchase);
    const { id } = useParams();

    useEffect(() => {
        console.log(id);
        if (!initialpurchase) {
            axios.get(`http://localhost:3000/purchase/read/${id}`, {
                headers: {
                    Authorization: `Bearer ${Cookies.get('token')}`
                }
            })
            .then(response => {
                setpurchase(response.data.purchases);
            })
            .catch(error => {
                console.error(error);
            });
        }
    }, []);

    useEffect(() => {
        if (!purchase) {
            return <Lost />;
        }
    }, [purchase]);

    return (
        <div>
            <div className="px-4 sm:px-0 flex items-center justify-between">
                <div className="flex items-center">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">
                        Dettagli sull'ordine di Acquisto 
                        {purchase?.status === 'In Approvazione' ? (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                In Approvazione
                            </span>
                        ) : purchase?.status === 'Approvata' ? (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Approvata
                            </span>
                        ) : purchase?.status === 'Rifiutata' ? (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Rifiutata
                            </span>
                        ) : (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Nessuno
                            </span>
                        )}
                    </h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Modifica
                    </button>
                    {/* <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Scarica
                    </button> */}
                </div>
            </div>
            <div className="mt-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Codice Ordine</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.name}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Fornitore</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.Company.name}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Data di creazione</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{new Date(purchase?.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Totale IVA Esclusa</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.total + " " + purchase?.currency}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Modalita di Pagamento</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.payment_method}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Riferimento Interno</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{purchase?.createdByUser?.name.slice(0, 2).toUpperCase() + purchase?.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + purchase?.createdByUser.name + " " + purchase?.createdByUser.surname + ")"}</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-6 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Righe d'ordine</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"></dd>
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Codice Prodotto
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Descrizione
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Quantità
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Prezzo Unitario
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        IVA
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Totale
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Stato
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {purchase?.PurchaseRows?.map((product, index) => (
                                    <tr key={product.id_product}>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.description}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.quantity}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.unit_price.toFixed(2) + " " + purchase?.currency}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.VAT}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {(product.unit_price * product.quantity).toFixed(2) + " " + purchase?.currency}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {product.status}
                                        </td>
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
                                    <span className="truncate font-medium">{purchase?.name}.pdf</span>
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
                        <dt className="text-sm font-medium leading-6 text-gray-900">Fattur{purchase?.invoices?.length > 1 ? "e" : "a" }</dt>
                        <dd className="mt-2 text-sm text-gray-900">
                            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                {purchase?.invoices?.map((item, index) => (
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
    );
}
