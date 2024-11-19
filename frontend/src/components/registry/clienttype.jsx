import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { XMarkIcon, TrashIcon ,PencilSquareIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/20/solid'
import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes?.filter(Boolean).join(' ');
}

export default function ClientTypeTable() {
  const [clienttypes, setClientTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newClientTypeName, setNewClientTypeName] = useState('');
  const [newClientTypeCode, setNewClientTypeCode] = useState('');
  const [update, setUpdate] = useState(false);
  const [ClientTypeName, setClientTypeName] = useState('');
  const [ClientTypeCode, setClientTypeCode] = useState('');
  const [ClientTypeID, setClientTypeID] = useState('');
  const tableRef = useRef(null);

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    id_clienttype: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/clienttype/read`)
      .then((response) => {
        setClientTypes(response.data.clients);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching clienttypes:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#clienttype-modal');
      if (modal) {
        const modalRect = modal.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${tableRect.top + window.scrollY + (tableRect.height - modalRect.height) / 2}px`;
        modal.style.left = `${tableRect.left + window.scrollX + (tableRect.width - modalRect.width) / 2}px`;
      }
    }
  }, [isModalOpen]);

  
  
  const deleteItem = async (ClientTypeID) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/clienttype/delete/${ClientTypeID}`
      );
  
      // Mostra una notifica di successo
      toast.success('Tipo progetto cancellato');
      console.log('Deleted:', response.data);
  
      // Aggiorna la lista locale (se gestita in stato)
      setClientTypes((prevsubs) =>
        prevsubs.filter((sub) => sub.id !== ClientTypeID)
      );
    } catch (error) {
      console.error('Errore nella cancellazione: ', error.response?.data || error.message);
  
      // Mostra una notifica di errore
      toast.error('Fallimento');
    }
    
  };
  
  const handleUpdateClientType = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/clienttype/update`, 
        { id: ClientTypeID, description: ClientTypeName, code: ClientTypeCode }
      )
      .then((response) => {
        setClientTypes([...clienttypes, response.data.clienttypes]);
        setClientTypeName('');
        setClientTypeCode('');
        setUpdate(false);
  
        // Mostra la notifica di successo
        toast.success('Nuovo tipo modificato con successo!');
      })
      .catch((error) => {
        console.error('Errore durante la modifica del tipo progetto:', error);
        
        // Mostra la notifica di errore
        toast.error('Modifica del tipo progetto fallita.');
      });
  };

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

  const filteredClientTypes = clienttypes?.filter((item) => {
    return (
      (searchQueries?.id_clienttype === '' || item.id_clienttype?.toString().includes(searchQueries?.id_clienttype?.toString())) &&
      (searchQueries?.name === '' || item.description.toLowerCase().includes(searchQueries?.name.toLowerCase())) &&
      (searchQueries?.code === '' || item.code.toLowerCase().includes(searchQueries?.code.toLowerCase()))
    );
  });

  const sortedClientTypes = filteredClientTypes?.sort((a, b) => {
    if (sortColumn) {
      if (sortDirection === 'asc') {
        return compareValues(a[sortColumn], b[sortColumn]);
      } else {
        return compareValues(b[sortColumn], a[sortColumn]);
      }
    }
    // Default sorting by id_clienttype
    return a.id_clienttype - b.id_clienttype;
  });

  const exportClientTypes = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name'].concat(
        sortedClientTypes?.map((clienttype) =>
          [clienttype?.id_clienttype, clienttype?.name].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'clienttypes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateClientType = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmCreateClientType = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/clienttype/create`, 
        { description: newClientTypeName,
        code: newClientTypeCode,
         }, 
      
      )
      .then((response) => {
        setClientTypes([...clienttypes, response.data.clienttype]);
        setNewClientTypeName('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        
        // Notifica di successo
        toast.success('Categoria creata con successo!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        console.error('Error creating clienttype:', error);
        
        // Notifica di errore
        toast.error('Errore durante la creazione della categoria!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };
  

  const cancelCreateClientType = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
      <ToastContainer />
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Tipo Clienti</h1>
            <p className="mt-2 text-sm text-gray-700">Lista dei tipi di clienti</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportClientTypes}
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
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('id_clienttype')}>
                        ID
                        {sortColumn === 'id_clienttype' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.id_clienttype}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('id_clienttype')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th scope="col" className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('code')}>
                        Codice
                        {sortColumn === 'code' && sortDirection !== '' ? (sortDirection === 'asc' ? null : null) : null}
                        <br />
                        <input
                          value={searchQueries?.code}
                          onClick={(e) => e.stopPropagation()} // Stop click propagation
                          onChange={handleSearchInputChange('code')}
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
                          value={searchQueries?.name}
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
                    {sortedClientTypes?.map((clienttype) => (
                      <tr key={clienttype?.id_clienttype}>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{clienttype?.id_clienttype}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{clienttype?.code}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{clienttype?.description}</td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                        <div className="flex items-center space-x-2">
                          
                          <button 
                            type="button" 
                            className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                            onClick={() => {
                              setUpdate(true);
                              setClientTypeCode(clienttype?.code);
                              setClientTypeName(clienttype?.description);
                              setClientTypeID(clienttype?.id_clienttype);
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
                              deleteItem(clienttype?.id_clienttype);
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
      
<Dialog open={update} onClose={() => setUpdate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Modifica un Tipo Cliente</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Tipo Cliente"
                value={ClientTypeName}
                onChange={(e) => setClientTypeName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice Tipo Cliente"
                value={ClientTypeCode}
                onChange={(e) => setClientTypeCode(e.target.value)}
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
                onClick={handleUpdateClientType}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Modifica
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isModalOpen && (
  <Dialog id="clienttype-modal" as="div" open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Dialog.Panel className="max-w-md bg-white rounded shadow-lg p-6" style={{ width: '800px', height: '300px' }}>
        <Dialog.Title className="text-lg font-bold mb-4">Crea Tipo Cliente</Dialog.Title>
        <input
          type="text"
          value={newClientTypeName}
          onChange={(e) => setNewClientTypeName(e.target.value)}
          placeholder="Nome Tipo Cliente"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
        <input
          type="text"
          value={newClientTypeCode}
          onChange={(e) => setNewClientTypeCode(e.target.value)}
          placeholder="Codice"
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:border-[#A7D0EB] focus:ring-[#A7D0EB] sm:text-sm"
        />
          <button
            onClick={handleCreateClientType}
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
                <button onClick={confirmCreateClientType} className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
                Conferma</button>
                <button onClick={cancelCreateClientType} cclassName="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >Annulla</button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
}
