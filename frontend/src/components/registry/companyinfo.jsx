import React from 'react';
import { Fragment, useState, useRef, useEffect, useContext } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { XMarkIcon, CheckIcon, PaperAirplaneIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import Lost from '../../pages/lost.jsx';
import { useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import CompanyUpdateForm from './companyupdate.jsx'

const CompanyDetails = ({ company }) => {
const [showUpdate, setShowUpdate] = useState(false);
  return (
    <div className="p-6 max-w-7xl mx-auto">


<Transition.Root show={showUpdate} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowUpdate(false)}>
            <div className="fixed inset-0" aria-hidden="true" />

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-screen max-w-7xl">
                      <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                        <div className="px-4 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              Modifica le informazioni dell'azienda
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => setShowUpdate(false)}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Chiudi pannello</span>
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                          {/* Passa 'company' come prop */}
                          <CompanyUpdateForm company={company} />
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{company?.name}</h1>
        <div className="flex gap-2">
          {company?.isClient && (
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
              Cliente
            </span>
          )}
          {company?.isSuppliers && (
            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
              Fornitore
            </span>
          )}
          {company?.isPartner && (
            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              Partner
            </span>
          )}
        </div>
      </div>
      
    
      <div className="px-4 sm:px-0 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Dettagli sull'ordine di Acquisto
            
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          
            <button
            type="button"
            onClick={() => setShowUpdate(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Modifica
          </button>
          
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informazioni Base */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Informazioni Base</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Codice Azienda</p>
              <p className="font-medium">{company?.Code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Partita IVA</p>
              <p className="font-medium">{company?.VAT || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Codice Fiscale</p>
              <p className="font-medium">{company?.Fiscal_Code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Codice SDI</p>
              <p className="font-medium">{company?.SDI || '-'}</p>
            </div>
          </div>
        </div>

        {/* Indirizzo */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Indirizzo</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Indirizzo</p>
              <p className="font-medium">{company?.Address || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">CAP</p>
                <p className="font-medium">{company?.ZIP || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Città</p>
                <p className="font-medium">{company?.City || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Provincia</p>
                <p className="font-medium">{company?.Province || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paese</p>
                <p className="font-medium">{company?.Country || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Contatti</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">PEC</p>
              <p className="font-medium break-all">{company?.PEC || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tipo Azienda */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Tipo Azienda</h2>
          <div className="space-y-3">
            <div>
              <p className="font-medium">{company?.ClientType?.description || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;