import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Dialog } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TechnicalAreaTable() {
  const [technicalAreas, setTechnicalAreas] = useState([]);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newTechnicalAreaName, setNewTechnicalAreaName] = useState('');
  const [newTechnicalAreaCode, setNewTechnicalAreaCode] = useState('');
  const tableRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, {
        headers: { authorization: `Bearer ${Cookies.get('token')}` },
      })
      .then((response) => {
        console.log('Fetched technical areas:', response.data.technicalareas);
        setTechnicalAreas(response.data.technicalareas || []);
      })
      .catch((error) => {
        console.error('Error fetching technical areas:', error);
      });
  }, []);

  useEffect(() => {
    if (isModalOpen && tableRef.current) {
      const tableRect = tableRef.current.getBoundingClientRect();
      const modal = document.querySelector('#technical-area-modal');
      if (modal) {
        const modalRect = modal.getBoundingClientRect();
        modal.style.position = 'absolute';
        modal.style.top = `${tableRect.top + window.scrollY + (tableRect.height - modalRect.height) / 2}px`;
        modal.style.left = `${tableRect.left + window.scrollX + (tableRect.width - modalRect.width) / 2}px`;
      }
    }
  }, [isModalOpen]);

  const [searchQueries, setSearchQueries] = useState({
    name: '',
    code:'',
    id_technicalarea: ''
  });

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  const filteredTechnicalAreas = technicalAreas.filter((item) => {
    return (
      (searchQueries.code === '' || item.code.toLowerCase().includes(searchQueries.code.toLowerCase())) &&
      (searchQueries.id_technicalarea === '' || item.id_technicalarea.toString().includes(searchQueries.id_technicalarea.toString())) &&
      (searchQueries.name === '' || item.name.toLowerCase().includes(searchQueries.name.toLowerCase()))
    );
  });


 const compareValues = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b, undefined, { numeric: true });
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return a < b ? -1 : a > b ? 1 : 0;
    }
  };


  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn('');
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const sortedTechnicalAreas = filteredTechnicalAreas.sort((a, b) => {
    if (!sortColumn) {
      
      return a.id_technicalarea - b.id_technicalarea;
    }

    if (sortDirection === 'asc') {
      return compareValues(a[sortColumn], b[sortColumn]);
    } else {
      return compareValues(b[sortColumn], a[sortColumn]);
    }
  });


  const exportTechnicalAreas = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Name,Code'].concat(
        sortedTechnicalAreas.map((technicalArea) =>
          [technicalArea.id_technicalarea, technicalArea.name, technicalArea.code].join(',')
        )
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'technical_areas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTechnicalArea = () => {
    setIsConfirmModalOpen(true); // Show the confirmation modal
  };

  const confirmCreateTechnicalArea = () => {
    axios
      .post(`${process.env.REACT_APP_API_URL}/technicalarea/create`, 
      { name: newTechnicalAreaName, code: newTechnicalAreaCode }, 
      { headers: { authorization: `Bearer ${Cookies.get('token')}` } })
      .then((response) => {
        setTechnicalAreas([...technicalAreas, response.data.technicalarea]);
        setNewTechnicalAreaName('');
        setNewTechnicalAreaCode('');
        setIsModalOpen(false);
        setIsConfirmModalOpen(false); // Close the confirmation modal
      })
      .catch((error) => {
        console.error('Error creating technical area:', error);
      });
  };

  const cancelCreateTechnicalArea = () => {
    setIsConfirmModalOpen(false); // Close the confirmation modal
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Aree Tecniche</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle aree tecniche</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportTechnicalAreas}
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
                      <th
                        scope="col"
                        className="px-0 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('id_technicalarea');
                        }}
                      >
                        ID
                        {sortColumn === 'id_technicalarea' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : sortDirection === 'desc' ? <ArrowDownIcon className="h-5 w-5 inline ml-2" /> : null) : null}
                        <br />
                        <input
                          value={searchQueries.id_technicalarea}
                          onChange={handleSearchInputChange('id_technicalarea')}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('name');
                        }}
                      >
                        Nome
                        {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : sortDirection === 'desc' ? <ArrowDownIcon className="h-5 w-5 inline ml-2" /> : null) : null}
                        <br />
                        <input
                          value={searchQueries.name}
                          onChange={handleSearchInputChange('name')}
                          className="mt-1 px-2 py-1 w-36 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-1.5 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT') handleSort('code');
                        }}
                      >
                        Codice
                        {sortColumn === 'code' ? (sortDirection === 'asc' ? <ArrowUpIcon className="h-5 w-5 inline ml-2" /> : sortDirection === 'desc' ? <ArrowDownIcon className="h-5 w-5 inline ml-2" /> : null) : null}
                        <br />
                        <input
                          value={searchQueries.code}
                          onChange={handleSearchInputChange('code')}
                          className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                          rows={1}
                        />
                      </th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedTechnicalAreas.map((technicalArea) => (
                    <tr key={technicalArea.id_technicalarea}>
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0 w-20">{technicalArea.id_technicalarea}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea.name}</td>
                      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 w-64">{technicalArea.code}</td>
                    </tr>
                  ))}
                 </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Technical Area Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Crea una nuova Area Tecnica</Dialog.Title>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Nome di Area Tecnica"
                value={newTechnicalAreaName}
                onChange={(e) => setNewTechnicalAreaName(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
              <input
                type="text"
                placeholder="Codice Area Tecnica"
                value={newTechnicalAreaCode}
                onChange={(e) => setNewTechnicalAreaCode(e.target.value)}
                className="w-full mt-4 p-2 border border-gray-300 rounded-md focus:ring-[#7fb7d4] focus:border-[#7fb7d4]"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={handleCreateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Crea
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Confirm Creation Modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Conferma di creazione</Dialog.Title>
            <div className="mt-4">
              <p className="text-sm text-gray-700">Sicuro di voler creare questa nuova area tecnica?</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelCreateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Cancella
              </button>
              <button
                onClick={confirmCreateTechnicalArea}
                className="rounded-md bg-[#A7D0EB] px-3 py-2 text-sm font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Conferma
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
