import React, { Fragment, useState, useMemo, useRef, useEffect } from 'react';
import { useTable } from 'react-table';
import { format, addDays, isSameDay, getDay, subDays } from 'date-fns'; // Aggiunto getDay per ottenere il giorno della settimana
import { it } from 'date-fns/locale'; // Importa la localizzazione italiana
import { XMarkIcon, CheckIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import axios from 'axios'; // Assicurati di importare axios
import { Dialog, Transition } from '@headlessui/react';
import 'tailwindcss/tailwind.css';
import GeneralCreateForm from './generalcreate.jsx';

const Calendario = () => {
  const [showAnagrafica, setShowAnagrafica] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [days, setDays] = useState(30); // Numero iniziale di giorni da mostrare
  const [users, setUsers] = useState([]); // Stato per memorizzare gli utenti
  const [calendarData, setCalendarData] = useState([]); // Stato per memorizzare i dati del calendario
  const scrollRef = useRef(null);
  let [userData, setUserData] = useState([]); // Stato per memorizzare i dati del calendario

  const fetchUsers = async () => {
   
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`, );
      setUsers(response.data.users);
      console.log('Fetched Users:', response.data.users); // Log degli utenti recuperati
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const italianHolidays = [
    '2024-01-01', // Capodanno
    '2024-01-06', // Epifania
    '2024-04-25', // Festa della Liberazione
    '2024-05-01', // Festa dei Lavoratori
    '2024-06-02', // Festa della Repubblica
    '2024-08-15', // Ferragosto
    '2024-11-01', // Ognissanti
    '2024-12-08', // Immacolata Concezione
    '2024-12-25', // Natale
    '2024-12-26', // Santo Stefano
  ''
  ];

  // Nuova funzione per recuperare i dati del calendario
  const fetchAllCalendarData = async () => {
   
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read/all`, );
      console.log('All Calendar Data Response:', response.data); // Log dell'intera risposta
      setCalendarData(response.data); // Imposta lo stato
    } catch (error) {
      console.error('Error fetching all calendar data:', error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Chiama la funzione per ottenere gli utenti al caricamento del componente
    fetchAllCalendarData(); // Chiama la funzione per ottenere i dati del calendario
  }, []);
  const generateDays = (start, end) => {
    const days = [];
    for (let i = start; i <= end; i++) {
      const date = addDays(new Date('2024-10-01'), i - 1); // Data di partenza
  
      const year = format(date, 'yyyy', { locale: it });
      const month = format(date, 'MM', { locale: it });
      const day = format(date, 'dd', { locale: it });
      const weekday = format(date, 'EEE', { locale: it }).charAt(0).toUpperCase() + format(date, 'EEE', { locale: it }).slice(1);
      const formattedDate = format(date, 'yyyy-MM-dd');
  
      // Sottrarre 2 giorni per controllare se è una festività
      const dateMinusTwoDays = subDays(date, 2);
      const formattedDateMinusTwoDays = format(dateMinusTwoDays, 'yyyy-MM-dd');
      
      const isHoliday = italianHolidays.includes(formattedDateMinusTwoDays);
  
      // Ogni colonna ha anno, mese, giorno e giorno della settimana in italiano
      days.push({
        Header: (
          <div className="flex flex-col text-center">
            <span className="text-xs">{year}</span>
            <span className="text-xs">{month}</span>
            <span className="text-xs">{day}</span>
            <span className="text-xs">{weekday}</span>
          </div>
        ),
        accessor: `day${i}`,
        isWeekend: getDay(date) === 1 || getDay(date) === 2, // Controllo per weekend (Domenica e Sabato)
        isHoliday: isHoliday,
      });
    }
    return days;
  };
  
  
  
  const anagraficaColumns = [
    { Header: 'Diretto/Indiretto', accessor: 'Diretto/Indiretto' },
    { Header: 'Area', accessor: 'Area' },
    { Header: 'Reparto/Ufficio', accessor: 'Reparto/Ufficio' },
    { Header: 'gg lavorati / settimana', accessor: 'gg lavorati / settimana ' },
    { Header: 'hh contrattuali / settimana', accessor: 'hh contrattuali / settimana' },
    { Header: 'AT / giorno', accessor: 'AT / giorno' },
    { Header: 'AT / settimana', accessor: 'AT / settimana' },
    { Header: 'TWH / settimana', accessor: 'TWH / settimana' },
    { Header: 'TWH / giorno', accessor: 'TWH / giorno' },
    { Header: 'OT / giorno lavorativo', accessor: 'OT / giorno lavorativo' },
    { Header: 'OT / settimana', accessor: 'OT / settimana' },
    { Header: '%OT', accessor: '%OT' },
    { Header: 'IH / giorno lavorativo', accessor: 'IH / giorno lavorativo' },
    { Header: 'IH / settimana', accessor: 'IH / settimana' },
    { Header: '%IH', accessor: '%IH' },
    { Header: 'Codice', accessor: 'Codice' },
  ];

  const columns = useMemo(
    () => [
      // Blocchiamo le colonne Nome e Cognome con la proprietà sticky
      {
        Header: 'Nome',
        accessor: 'Nome',
        sticky: 'left', // Colonna fissa a sinistra
      },
      {
        Header: 'Cognome',
        accessor: 'Cognome',
        sticky: 'left', // Colonna fissa a sinistra
      },
      ...(showAnagrafica ? anagraficaColumns : []), // Aggiungi altre colonne solo se showAnagrafica è true
      ...generateDays(1, days), // Genera i giorni dinamicamente
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
  const tableData = useMemo(() => {
    return users.map(user => {
       userData = {
        Nome: user.name,
        Cognome: user.surname,
      };
  
      for (let i = 1; i <= days; i++) {
        const date = addDays(new Date(), i);
        const formattedDate = format(date, 'yyyy-MM-dd');
  
        const entries = calendarData.filter(e => {
          const entryDate = format(new Date(e.date), 'yyyy-MM-dd');
          return e.owner === user.id_user && entryDate === formattedDate;
        });
  
        // Default values
        let totalValue = 8.0;
        let morningLocation = '';
        let afternoonLocation = '';
  
        // If there are entries for that day
        if (entries.length > 0) {
          const locations = entries.map(entry => entry.location);
          const zeroValueLocations = [2, 3, 1, 5, 8];
  
          const allZeroValueLocations = locations.every(location => zeroValueLocations.includes(location));
          const hasZeroValueLocation = locations.some(location => zeroValueLocations.includes(location));
  
          if (allZeroValueLocations) {
            totalValue = 0.0; // All locations are non-work related, set totalValue to 0
          } else if (hasZeroValueLocation) {
            totalValue = 4.0; // Some non-work locations exist, set totalValue to 4
          } else {
            totalValue = 8.0; // Default work value
          }
  
          morningLocation = locations[0] || ''; // First location for morning
          afternoonLocation = locations[1] || ''; // Second location for afternoon
  
         // --> QUI INSERISCI I console.log PER IL DEBUG
    console.log(`User: ${user.id_user}, Date: ${formattedDate}`);
    console.log(`Locations: ${locations}`);
    console.log(`Total Value: ${totalValue}, Morning: ${morningLocation}, Afternoon: ${afternoonLocation}`);
 
   }
        // Assign to the current day
        userData[`day${i}`] = { value: totalValue, morningLocation, afternoonLocation };

      console.log("Total Value sono userData:"+ userData[`day${i}`].value );

      }
     setUserData(userData);
     console.log(userData);
      return userData;
    });
  }, [users, days, calendarData]);
  

  // Tabella vuota
  const emptyTableData = useMemo(() => {
    return users.map(user => ({
      Nome: user.name,
      Cognome: user.surname,
      ...Array.from({ length: days }, (_, i) => ({ [`day${i + 1}`]: { value: '' } })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    }));
  }, [users, days]);
  

  const emptyTableInstance = useTable({ columns, data: emptyTableData });
  const {
    getTableProps: getEmptyTableProps,
    getTableBodyProps: getEmptyTableBodyProps,
    headerGroups: emptyHeaderGroups,
    rows: emptyRows,
    prepareRow: prepareEmptyRow,
  } = emptyTableInstance;
  
 const calculateSummary = () => {
  const summary = {
    twhTeoriche: {},
    twhReali: {},
    otTotale: {},
  };

  for (let i = 1; i <= days; i++) {
    // Calcoli per ogni giorno
    const teoriche = 8 * users.length;  // Supponendo 8 ore lavorative teoriche per utente
    const reali = users.reduce((sum, user) => sum + (user[`day${i}`]?.value || 0), 0);
    const overtime = reali > teoriche ? reali - teoriche : 0;

    summary.twhTeoriche[`day${i}`] = teoriche;
    summary.twhReali[`day${i}`] = reali;
    summary.otTotale[`day${i}`] = overtime;
  }

  // Calcolo settimanale
  summary.twhTeoriche.settimana = Object.values(summary.twhTeoriche).reduce((sum, val) => sum + val, 0);
  summary.twhReali.settimana = Object.values(summary.twhReali).reduce((sum, val) => sum + val, 0);
  summary.otTotale.settimana = Object.values(summary.otTotale).reduce((sum, val) => sum + val, 0);

  return summary;
};

const summary = useMemo(() => calculateSummary(), [users, days]);
const calculateTotals = () => {
  const totals = {};
  
  for (let i = 1; i <= days; i++) {
    totals[`day${i}`] = users.reduce((sum, user) => {
      const dayData = user[`day${i}`];
      return sum + (dayData?.value || 0); // Somma i valori di ogni utente per il giorno
    }, 0);
  }

  return totals;
};

const totals = useMemo(() => calculateTotals(), [users, days, calendarData]); // Ricalcola quando utenti, giorni o dati del calendario cambiano

const calculateColumnSums = () => {
  const columnSums = {};

  // Log generale all'inizio per mostrare gli utenti
  console.log("Utenti:", users);

  // Itera sui giorni per sommare i valori delle colonne
  for (let i = 1; i <= days; i++) {
    let sum = 0;

    // Itera sugli utenti e somma i valori per ogni giorno
    users.forEach((user, index) => {
      const value = userData[`day${i}`].value;  // Prende il valore o 0 se non è definito
      
      console.log(`Giorno ${i}, Utente ${index + 1} (${user.name}): Total Value = ${value}`);  // Log per ogni cella

      sum += value;
    });

    columnSums[`day${i}`] = sum;

    // Log della somma finale per la colonna
    console.log(`Somma colonna giorno ${i}: ${sum}`);
  }

  console.log("Somme totali per ogni giorno:", columnSums);
  
  return columnSums;
};


const columnSums = useMemo(() => calculateColumnSums(), [users, days]);

  

  function exportData() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      items.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const download = 'data.csv'
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
  }
  
  const tableInstance = useTable({ columns, data: tableData });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (

   
    <div className="p-6 bg-gray-100 min-h-screen">
       <Transition.Root show={showCreate} as={Fragment}>
    <Dialog className="relative z-50" onClose={setShowCreate}>
      <div className="fixed inset-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-1">
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
                        Crea un nuovo ordine di acquisto
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative rounded-md bg-white text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:ring-offset-2"
                          onClick={() => setShowCreate(false)}
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Chiudi pannello</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4 sm:px-6">
                    <GeneralCreateForm />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
     
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Contenitore principale con Flexbox */}
        <div className="flex items-center justify-between">
          {/* Titolo e descrizione */}
          <div>
            <h1 className="text-base font-semibold leading-6 text-gray-900">Ordini di Acquisto</h1>
            <p className="mt-2 text-sm text-gray-700">Lista degli ordini di acquisto presenti a sistema</p>
          </div>

          {/* Contenitore Bottoni */}
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
            >
              Esporta
            </button>
            <button
        onClick={() => setShowAnagrafica(!showAnagrafica)}
        className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
      >
        {showAnagrafica ? 'Nascondi Anagrafica' : 'Vedi Anagrafica'}
      </button>
      
      <button
                onClick={() => setShowCreate(true)}
                className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              >
                Aggiungi
              </button>

          </div>
        </div>
      </div>

      <div className="flex w-full space-x-4 mt-1">
        <div className="flex-grow bg-white rounded-lg shadow overflow-x-auto" ref={scrollRef}>
          <table {...getTableProps()} className="min-w-full">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200">
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-2 py-1 border-b text-left text-gray-700 font-semibold border border-gray-300"
                      style={{
                        textAlign: 'left',
                        padding: '5px',
                        fontSize: '12px',
                        backgroundColor: column.sticky ? 'white' : '',
                        position: column.sticky ? 'sticky' : 'static',
                        left: column.sticky ? 0 : 'auto',
                        zIndex: column.sticky ? 1 : 'auto',
                      }}
                    >
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
                    {row.cells.map((cell, index) => {
                      const columnId = cell.column.id;
                      const dayColumn = columns[index + 2]; // Indice delle colonne giorni (dopo Nome e Cognome)
                      const isWeekend = dayColumn && dayColumn.isWeekend;
                      const isHoliday = dayColumn && dayColumn.isHoliday;
                      const { value, morningLocation, afternoonLocation } = cell.value || {};

                      const zeroValueLocations = [2, 3, 1, 5, 8];
                      const isZeroValueLocation = zeroValueLocations.includes(morningLocation) || zeroValueLocations.includes(afternoonLocation);

                      const cellClass = isZeroValueLocation ? (
                        morningLocation === 4 ? ''
                        : morningLocation === 5 ? 'bg-[#FFFF00] text-gray-900'
                        : morningLocation === 3 ? 'bg-[#FF9966] text-gray-900'
                        : morningLocation === 2 ? 'bg-[#8ED973] text-gray-900'
                        : morningLocation === 1 ? 'bg-[#8ED973] text-gray-900'
                        : morningLocation === 8 ? 'bg-[#00D5D0] text-gray-900'
                        : afternoonLocation === 5 ? 'bg-[#FFFF00] text-gray-900'
                        : afternoonLocation === 3 ? 'bg-[#FF9966] text-gray-900'
                        : afternoonLocation === 2 ? 'bg-[#8ED973] text-gray-900'
                        : afternoonLocation === 1 ? 'bg-[#8ED973] text-gray-900'
                        : afternoonLocation === 8 ? 'bg-[#00D5D0] text-gray-900'
                        : ''
                      ) : '';

                      return (
                        <td
                          {...cell.getCellProps()}
                          className={`px-2 py-1 border-b text-gray-600 border border-gray-300 ${isWeekend ? 'bg-gray-200' : ''} ${isHoliday ? 'bg-[#FF3399]' : ''} ${cellClass}`}
                          style={{
                            fontSize: '12px',
                            padding: '5px',
                            textAlign: 'right',
                            backgroundColor: cell.column.sticky ? 'white' : '',
                            position: cell.column.sticky ? 'sticky' : 'static',
                            left: cell.column.sticky ? 0 : 'auto',
                            zIndex: cell.column.sticky ? 1 : 'auto',
                          }}
                        >
                          {isHoliday 
                            ? '' // Se è una festività, lascia vuota la cella
                            : (columnId === 'Nome' || columnId === 'Cognome'
                              ? cell.value
                              : (isWeekend
                                ? '' 
                                : (cell.value && cell.value.value !== undefined
                                  ? cell.value.value // Assicurati che cell.value esista
                                  : '')))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

 {/* RIGA TWH TEORICHE */}
<tr className="bg-gray-200 font-bold">
  <td className="px-2 py-1 border-b text-gray-600 border border-gray-300" colSpan={2}>TWH teoriche</td>
  {Array.from({ length: days }).map((_, i) => (
    <td key={`twh-teoriche-${i}`} className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300">
      {columnSums[`day${i + 1}`] } {/* Mostra la somma dei valori di ogni colonna */}
    </td>
  ))}
  <td className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300">
    {Object.values(columnSums).reduce((acc, val) => acc + (val || 0), 0)} {/* Somma totale settimanale */}
  </td>
</tr>


  {/* RIGA TWH REALI */}
  <tr className="bg-gray-200 font-bold">
    <td className="px-2 py-1 border-b text-gray-600 border border-gray-300" colSpan={2}>TWH reali</td>
    {Array.from({ length: days }).map((_, i) => (
      <td key={`twh-reali-${i}`} className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300">
        {summary.twhReali[`day${i + 1}`]}
      </td>
    ))}
    <td className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300">
      {summary.twhReali.settimana}
    </td>
  </tr>

  {/* RIGA OT TOTALE */}
  <tr className="bg-purple-200 font-bold">
    <td className="px-2 py-1 border-b text-gray-600 border border-gray-300" colSpan={2}>OT Totale</td>
    {Array.from({ length: days }).map((_, i) => (
      <td key={`ot-totale-${i}`} className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300 bg-purple-100">
        {summary.otTotale[`day${i + 1}`]}
      </td>
    ))}
    <td className="px-2 py-1 border-b text-right text-gray-600 border border-gray-300 bg-purple-100">
      {summary.otTotale.settimana}
    </td>
  </tr>
</tbody>
          </table>
        </div>
      </div>
      



   
    </div>
  );
};


export default Calendario;
