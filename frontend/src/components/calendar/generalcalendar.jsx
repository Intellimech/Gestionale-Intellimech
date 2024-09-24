import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTable } from 'react-table';
import { format, addDays } from 'date-fns';
import 'tailwindcss/tailwind.css';

const Calendario = () => {
  const [showAnagrafica, setShowAnagrafica] = useState(false);
  const [days, setDays] = useState(30); // Numero iniziale di giorni da mostrare
  const scrollRef = useRef(null);

  const data = [
    { Nome: 'Alessandra', Cognome: 'Duz', Ruolo: 'Manager', Reparto: 'Produzione', Email: 'alessandra@example.com', Telefono: '1234567890', Indirizzo: 'Via Roma 1', Città: 'Milano', Provincia: 'MI', CAP: '20100', day1: '8', day2: '8' },
    { Nome: 'Alissa', Cognome: 'Zaccaria', Ruolo: 'Developer', Reparto: 'IT', Email: 'alissa@example.com', Telefono: '0987654321', Indirizzo: 'Via Milano 2', Città: 'Roma', Provincia: 'RM', CAP: '00100', day1: '8', day2: '8' },
    { Nome: 'Angelo', Cognome: 'Iapichino', Ruolo: 'Designer', Reparto: 'Marketing', Email: 'angelo@example.com', Telefono: '1122334455', Indirizzo: 'Via Napoli 3', Città: 'Napoli', Provincia: 'NA', CAP: '80100', day1: '8', day2: '8' },
    // Aggiungi altri dati necessari
  ];

  const generateDays = (start, end) => {
    const days = [];
    for (let i = start; i <= end; i++) {
      const date = format(addDays(new Date(), i), 'dd/MM/yyyy');
      days.push({ Header: date, accessor: `day${i}` });
    }
    return days;
  };

  const anagraficaColumns = [
    { Header: 'Ruolo', accessor: 'Ruolo' },
    { Header: 'Reparto', accessor: 'Reparto' },
    { Header: 'Email', accessor: 'Email' },
    { Header: 'Telefono', accessor: 'Telefono' },
    { Header: 'Indirizzo', accessor: 'Indirizzo' },
    { Header: 'Città', accessor: 'Città' },
    { Header: 'Provincia', accessor: 'Provincia' },
    { Header: 'CAP', accessor: 'CAP' },
  ];

  const columns = useMemo(
    () => [
      {
        Header: 'Anagrafica',
        columns: [
          { Header: 'Nome', accessor: 'Nome' },
          { Header: 'Cognome', accessor: 'Cognome' },
          ...(showAnagrafica ? anagraficaColumns : []), // Aggiungi altre colonne solo se showAnagrafica è true
        ],
      },
      {
        Header: 'Calendario',
        columns: generateDays(1, days), // Genera i giorni dinamicamente
      },
    ],
    [days, showAnagrafica] // Aggiungi showAnagrafica come dipendenza per ricalcolare le colonne
  );

  const loadMoreDays = () => {
    setDays(prevDays => prevDays + 30); // Carica altri 30 giorni
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        loadMoreDays();
      }
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => setShowAnagrafica(!showAnagrafica)}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        {showAnagrafica ? 'Nascondi Anagrafica' : 'Vedi Anagrafica'}
      </button>
      <div className="flex w-full space-x-4">
        <div className="flex-grow bg-white rounded-lg shadow overflow-x-auto" ref={scrollRef}>
          <table {...getTableProps()} className="min-w-full">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200">
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps()} className="px-4 py-2 border-b text-left text-gray-700 font-semibold">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-300">
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-100">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-4 py-2 border-b text-gray-600">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calendario;
