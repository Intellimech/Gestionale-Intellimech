import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTable } from 'react-table';
import { format, addDays, isSameDay, getDay } from 'date-fns'; // Aggiunto getDay per ottenere il giorno della settimana
import { it } from 'date-fns/locale'; // Importa la localizzazione italiana
import axios from 'axios'; // Assicurati di importare axios
import Cookies from 'js-cookie';
import 'tailwindcss/tailwind.css';

const Calendario = () => {
  const [showAnagrafica, setShowAnagrafica] = useState(false);
  const [days, setDays] = useState(30); // Numero iniziale di giorni da mostrare
  const [users, setUsers] = useState([]); // Stato per memorizzare gli utenti
  const [calendarData, setCalendarData] = useState([]); // Stato per memorizzare i dati del calendario
  const scrollRef = useRef(null);

  const fetchUsers = async () => {
    const token = Cookies.get('token'); // Ottieni il token
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.users);
      console.log('Fetched Users:', response.data.users); // Log degli utenti recuperati
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Nuova funzione per recuperare i dati del calendario
  const fetchAllCalendarData = async () => {
    const token = Cookies.get('token'); // Ottieni il token
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/calendar/read/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // Funzione per generare colonne di giorni
  const generateDays = (start, end) => {
    const days = [];
    for (let i = start; i <= end; i++) {
      const date = addDays(new Date(), i);
      const year = format(date, 'yyyy', { locale: it });
      const month = format(date, 'MMMM', { locale: it }).charAt(0).toUpperCase() + format(date, 'MMMM', { locale: it }).slice(1); // Mese con prima lettera maiuscola
      const day = format(date, 'dd', { locale: it });
      const weekday = format(date, 'EEE', { locale: it }).charAt(0).toUpperCase() + format(date, 'EEE', { locale: it }).slice(1); // Giorno della settimana con prima lettera maiuscola

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
        isWeekend: getDay(date) === 2 || getDay(date) === 1, // Aggiunto campo per controllare se è weekend
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
        const userData = {
            Nome: user.name,
            Cognome: user.surname,
        };

        console.log(`Elaborazione per l'utente: ${user.name} ${user.surname}`); // Log utente corrente

        // Aggiungi i valori dei giorni
        for (let i = 1; i <= days; i++) {
            const date = addDays(new Date(), i);
            const formattedDate = format(date, 'yyyy-MM-dd'); // Formatta la data per confronti

            console.log(`Controllo la data: ${formattedDate} per l'utente: ${user.name}`); // Log per la data corrente

            // Trova le entries corrispondenti nel calendarData
            const entries = calendarData.filter(e => {
                const entryDate = format(new Date(e.date), 'yyyy-MM-dd');
                const isOwner = e.owner === user.id_user;
                const isSameDate = entryDate === formattedDate;
                return isOwner && isSameDate;
            });

            console.log(`Entries trovate per la data ${formattedDate}:`, entries); // Log per entries trovate

            // Calcola il valore totale per il giorno
            let totalValue = 8.0; // Valore di default

            if (entries.length > 0) {
                const locations = entries.map(entry => entry.location);
                console.log(`Locations trovate:`, locations); // Log per le locations trovate

                const zeroValueLocations = ["Permesso", "Malattia", "Ferie", "Trasferta", "Non Lavorativo"];
                
                // Verifica se TUTTE le location valgono 0
                const allZeroValueLocations = locations.every(location => zeroValueLocations.includes(location));

                // Verifica se ALMENO UNA location vale 0
                const hasZeroValueLocation = locations.some(location => zeroValueLocations.includes(location));
                if (allZeroValueLocations) {
                    // Se tutte le location hanno un valore 0, imposta il totale a 0
                    totalValue = 0.0;
                } else if (hasZeroValueLocation) {
                    // Se almeno una location ha un valore zero, imposta il totale a 4
                    totalValue = 4.0;
                 }
            } else {
                console.log(`Nessuna entry trovata per la data ${formattedDate}. Imposto il valore predefinito di 8.0`);
            }

            console.log(`Valore totale per il giorno ${formattedDate}: ${totalValue}`); // Log per il valore totale del giorno

            userData[`day${i}`] = totalValue;
            
        }

        return userData;
    });
}, [users, days, calendarData]);


  
  const tableInstance = useTable({ columns, data: tableData });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => setShowAnagrafica(!showAnagrafica)}
        className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
      >
        {showAnagrafica ? 'Nascondi Anagrafica' : 'Vedi Anagrafica'}
      </button>
      <div className="flex w-full space-x-4 mt-1">
        <div className="flex-grow bg-white rounded-lg shadow overflow-x-auto" ref={scrollRef}>
          <table {...getTableProps()} className="min-w-full">
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200">
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-2 py-1 border-b text-left text-gray-700 font-semibold border border-gray-300" // Aggiunto bordo grigio per griglia
                      style={{
                        textAlign: 'left', // Allinea a sinistra
                        padding: '5px', // Ridotto padding
                        fontSize: '12px', // Rimpicciolito il font
                        backgroundColor: column.sticky ? 'white' : '', // Sfondo bianco per colonne sticky
                        position: column.sticky ? 'sticky' : 'static', // Sticky per le colonne Nome e Cognome
                        left: column.sticky ? 0 : 'auto', // Blocco a sinistra
                        zIndex: column.sticky ? 1 : 'auto', // Z-index per sovrapporre
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
                      const dayColumn = columns[index + 2]; // Indice delle colonne giorni (dopo Nome e Cognome)
                      const isWeekend = dayColumn && dayColumn.isWeekend;

                      return (
                        <td
                          {...cell.getCellProps()}
                          className={`px-2 py-1 border-b text-gray-600 border border-gray-300 ${isWeekend ? 'bg-gray-200' : ''}`}
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
                          {isWeekend ? '' : (cell.value !== undefined ? cell.value : '8.0')} {/* Usa undefined per verificare la presenza di un valore */}
                        </td>
                      );
                    })}
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
