import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'

import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PaymentMethodTable() {
  const [paymentmethods, setPaymentMethods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmUpdateModalOpen, setIsConfirmUpdateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');
  const [newPaymentMethodCode, setNewPaymentMethodCode] = useState('');
  const tableRef = useRef(null);
  const [update, setUpdate] = useState(false);
  const [PaymentMethodName, setPaymentMethodName] = useState('');
  const [PaymentMethodCode, setPaymentMethodCode] = useState('');
  const [PaymentMethodID, setPaymentMethodID] = useState('');
  const [deletedItem, setDeleteItem] = useState('');
  
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_paymentmethod: '',
    code: ''
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/paymentmethod/read`)
      .then((response) => {
        setPaymentMethods(response.data.paymentmethods);
      })
      .catch((error) => {
        console.error('Error fetching paymentmethods:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#paymentmethod-modal');
      if (modal) {
        const modalRect = modal.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${tableRect.top + window.scrollY + (tableRect.height - modalRect.height) / 2}px`;
        modal.style.left = `${tableRect.left + window.scrollX + (tableRect.width - modalRect.width) / 2}px`;
      }
    }
  }, [isModalOpen]);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Reset to default
        setSortColumn('');
        setSortDirection('asc');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };
  
  
  const handleDeletePaymentMethod =  (

  ) => {
    setIsConfirmDeleteModalOpen(false);
    try {
      const response =  axios.delete(
        `${process.env.REACT_APP_API_URL}/paymentmethod/delete/${deletedItem}`
      );
  
      // Mostra una notifica di successo
      toast.success('Incarico cancellato');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setPaymentMethods((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== deletedItem)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
    }
    
  };
  
  const confirmUpdatePaymentMethod = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/paymentmethod/update`, 
        { id: PaymentMethodID, name: PaymentMethodName, code: PaymentMethodCode }
      )
      .then((response) => {
        setPaymentMethods([...paymentmethods, response.data.paymentmethods]);
        setPaymentMethodName('');
        setPaymentMethodCode('');
        setUpdate(false);
        setIsConfirmModalOpen(false); // Chiude la modale di conferma
  
        // Mostra la notifica di successo
        toast.success('Incarico modficato con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica di incarico:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica di incarico fallita.');
      });
  };


  const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };

  const handleSearchInputChange = (column) => (event) => {
    event.stopPropagation(); // Prevent click propagation to handleSort
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredPaymentMethods = paymentmethods.filter((item) => {
    return (
      (searchQueries.id_paymentmethod === '' || item.id_paymentmethod.toString().includes(searchQueries.id_paymentmethod.toString())) &&
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))  &&
      (searchQueries.code === '' || item.code.toLowerCase().includes(searchQueries.code.toLowerCase()))
    );
  });

  const sortedPaymentMethods = filteredPaymentMethods.sort((a, b) => {
    if (sortColumn) {
      if (sortDirection === 'asc') {
        return compareValues(a[sortColumn], b[sortColumn]);
      } else {
        return compareValues(b[sortColumn], a[sortColumn]);
      }
    }
    // Default sorting by id_paymentmethod
    return a.id_paymentmethod - b.id_paymentmethod;
  });

  const exportPaymentMethods = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name'].concat(
        sortedPaymentMethods.map((paymentmethod) =>
          [paymentmethod.id_paymentmethod, paymentmethod.name].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'paymentmethods.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePaymentMethod = () => {
    setIsConfirmModalOpen(true);
  };

  const handleUpdatePaymentMethod = () => {
    setIsConfirmUpdateModalOpen(true);
  };

  const confirmCreatePaymentMethod = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/paymentmethod/create`, 
        { description: newPaymentMethodName,
        code: newPaymentMethodCode,
         }, 
      
      )
      .then((response) => {
        setPaymentMethods([...paymentmethods, response.data.paymentmethod]);
        setNewPaymentMethodName('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        
        // Notifica di successo
        toast.success('Incarico creata con successo!', );
      })
      .catch((error) => {
        console.error('Error creating paymentmethod:', error);
        
        // Notifica di errore
        toast.error('Errore durante la creazione di incarico!', );
      });
  };
  

  const cancelCreatePaymentMethod = () => {
    setIsConfirmModalOpen(false);
  };
  const cancelUpdatePaymentMethod = () => {
    setIsConfirmUpdateModalOpen(false);
  };

  const cancelDeletePaymentMethod = () => {
    setIsConfirmDeleteModalOpen(false);
  };

     
  const deleteItem = async (PaymentMethodID) => {
    setDeleteItem(PaymentMethodID);
   setIsConfirmDeleteModalOpen(true);
   };
 

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
      <Toaster />
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Metodi di pagamento</h1>
            <p className="mt-2 text-sm text-gray-700">Lista dei metodi di pagamento</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportPaymentMethods}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Crea
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="relative">
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="px-2 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_paymentmethod')}>
                        ID
                        {sortColumn === 'id_paymentmethod' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.id_paymentmethod}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('id_paymentmethod')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                     
                      <th scope="col" className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('name')}>
                        Nome
                        {sortColumn === 'name' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries.name}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedPaymentMethods.map((paymentmethod) => (
                      <tr key={paymentmethod?.id_paymentmethod}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{paymentmethod?.id_paymentmethod}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{paymentmethod?.name}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setPaymentMethodCode(paymentmethod?.code);
                              setPaymentMethodName(paymentmethod?.description);
                              setPaymentMethodID(paymentmethod?.id_paymentmethod);
                            }}
                          >
            
                            <PencilSquareIcon className="h-5 w-4 text-gray-500" />
                          </button>
                         
                          
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-2 pl-3 pr-4 text-left text-sm font-medium sm:pr-3">
                        <div className="flex items-right space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-right rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              deleteItem(paymentmethod.id_paymentmethod);
                            }}
                          >
            
                            <TrashIcon className="h-5 w-4 text-gray-500" />
                          </button>
                         
                          
                        </div>
                      </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>


{/*       
      {isModalOpen && (
  <Dialog id="paymentmethod-modal" as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md bg-white rounded shadow-lg p-6" style={{ width: '800px', height: '300px' }}>
        <Dialog.Title className="text-lg font-bold mb-4">Crea Metodo di Pagamento</Dialog.Title>
        <input
          type="text"
          value={newPaymentMethodName}
          onChange={(e) => setNewPaymentMethodName(e.target.value)}
          placeholder="Nome Incarico"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
        <input
          type="text"
          value={newPaymentMethodCode}
          onChange={(e) => setNewPaymentMethodCode(e.target.value)}
          placeholder="Codice"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
          <button
            onClick={handleCreatePaymentMethod}
            className="block w-full mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4]"
            >
            Crea
          </button>
          <button
              type="submit"
              onClick={() => setIsModalOpen(false)}
              className="block w-full mt-4 rounded-md bg-white px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-white"
            >
              Annulla
            </button>
      </Dialog.Panel>
    </div>
  </Dialog>
)}
<Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica Incarico</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome Incarico"
                value={PaymentMethodName}
                onChange={(e) => setPaymentMethodName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice"
                value={PaymentMethodCode}
                onChange={(e) => setPaymentMethodCode(e.target.value)}
                className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
           
              <button
                onClick={() => setUpdate(false)}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={handleUpdatePaymentMethod}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Modifica
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isModalOpen && (
  <Dialog id="paymentmethod-modal" as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md bg-white rounded shadow-lg p-6" style={{ width: '800px', height: '300px' }}>
        <Dialog.Title className="text-lg font-bold mb-4">Crea Incarico</Dialog.Title>
        <input
          type="text"
          value={newPaymentMethodName}
          onChange={(e) => setNewPaymentMethodName(e.target.value)}
          placeholder="Nome Incarico"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
        <input
          type="text"
          value={newPaymentMethodCode}
          onChange={(e) => setNewPaymentMethodCode(e.target.value)}
          placeholder="Codice"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
          <button
            onClick={handleCreatePaymentMethod}
            className="block w-full mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4]"
            >
            Crea
          </button>
          <button
              type="submit"
              onClick={() => setIsModalOpen(false)}
              className="block w-full mt-4 rounded-md bg-white px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-white"
            >
              Annulla
            </button>
      </Dialog.Panel>
    </div>
  </Dialog>
)}

      {isConfirmModalOpen && (
        <Dialog as="div" open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Creazione</Dialog.Title>
              <p>Sei sicuro di voler creare questo incarico?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmCreatePaymentMethod} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelCreatePaymentMethod} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      
{isConfirmDeleteModalOpen && (
        <Dialog as="div" open={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Eliminazione</Dialog.Title>
              <p>Sei sicuro di voler eliminare questo elemento?</p>
              <div className="flex justify-end mt-4">
                <button onClick={handleDeletePaymentMethod} className="block mr-2 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelDeletePaymentMethod} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

{isConfirmUpdateModalOpen && (
        <Dialog as="div" open={isConfirmUpdateModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-sm mx-auto bg-white rounded shadow-lg p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">Conferma Modifica</Dialog.Title>
              <p>Sei sicuro di voler modificare questo incarico?</p>
              <div className="flex justify-end mt-4">
                <button onClick={confirmUpdatePaymentMethod} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelUpdatePaymentMethod} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )} */}
    </>
  );
}
