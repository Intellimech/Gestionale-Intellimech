import { PaperClipIcon } from '@heroicons/react/20/solid'

export default function Example({ offer }) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">Dettagli sull'offerta</h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Informazioni dettagliate sull'offerta</p>
      </div>
      <div className="mt-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Codice Offerta</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Azienda</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.QuotationRequest.Company.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Ore stimate</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.hour + 'h'}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Valore</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.amount + ' €'}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Costo Orario</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{(offer.amount / offer.hour).toFixed(2)} €</dd>
            </div> 
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Categoria</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.QuotationRequest.Category.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Sotto Categoria</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.QuotationRequest.Subcategory.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Area Tecnica</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.QuotationRequest.TechnicalArea.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Data di inizio stimata</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.estimatedstart ? new Date(offer.estimatedstart).toLocaleDateString() : ''}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Data di fine stimata</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.estimatedend ? new Date(offer.estimatedstart).toLocaleDateString() : ''}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Project Manager</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.createdByUser?.name.slice(0, 2).toUpperCase() + offer.createdByUser?.surname.slice(0, 2).toUpperCase() + " (" + offer.createdByUser.name + " " + offer.createdByUser.surname + ")"}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Team</dt>
                <dd 
                className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2"
                dangerouslySetInnerHTML={{
                    __html: offer.team.map((user) => {
                    const userInfo = `${user.name.slice(0, 2).toUpperCase()}${user.surname.slice(0, 2).toUpperCase()} (${user.name} ${user.surname})`;
                    if (user.id_user === offer.createdByUser.id_user) {
                        return `<strong>${userInfo}</strong>`;
                    }
                    return userInfo;
                    }).join('<br />')
                }}
                ></dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Data di Creazione</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{new Date(offer.createdAt).toLocaleDateString() + " " + new Date(offer.createdAt).toLocaleTimeString()}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Data di Aggiornamento</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{new Date(offer.updatedAt).toLocaleDateString() + " " + new Date(offer.updatedAt).toLocaleTimeString()}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-1 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Richiesta di offerta</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">{offer.QuotationRequest.name}</dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-2 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">About</dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">
                    {offer.description ? offer.description : offer.QuotationRequest.description}
                </dd>
            </div>
            <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 lg:col-span-3 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">Documenti</dt>
                <dd className="mt-2 text-sm text-gray-900">
                    <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">{offer.name}.pdf</span>
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
        </dl>
      </div>
    </div>
  )
}
