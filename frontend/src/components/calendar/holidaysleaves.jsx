import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HolidaysLeavesManagement({ permissions }) {
  const [calendars, setCalendars] = useState([]);
  const [sortColumn, setSortColumn] = useState(''); // Default empty
  const [sortDirection, setSortDirection] = useState('asc'); // Default ascending
  const [searchQueries, setSearchQueries] = useState({
    location: '',
    date: '',
    period: '',
    status: '',
    owner: ''
  });

  useEffect(() => {
    fetchCalendars();
  }, []);

  // Fetch data from the API
  const fetchCalendars = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/holidays-leaves/read/`)
      .then((response) => {
        setCalendars(response.data.calendars);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Approve request
  const approveCalendar = (id) => {
    toast.promise(
      axios
        .post(`${process.env.REACT_APP_API_URL}/holidays-leaves/approve/${id}`)
        .then(() => fetchCalendars())
        .catch((error) => {
          console.log(error);
          throw new Error('Error while approving');
        }),
      {
        loading: 'Approving...',
        success: 'Successfully approved!',
        error: 'Error in approving',
      }
    );
  };

  // Reject request
  const rejectCalendar = (id) => {
    toast.promise(
      axios
        .post(`${process.env.REACT_APP_API_URL}/holidays-leaves/reject/${id}`)
        .then(() => fetchCalendars())
        .catch((error) => {
          console.log(error);
          throw new Error('Error while rejecting');
        }),
      {
        loading: 'Rejecting...',
        success: 'Successfully rejected!',
        error: 'Error in rejecting',
      }
    );
  };

  // Sorting logic
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
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

  // Filtering and sorting the data
  const filteredCalendars = calendars
    .filter((item) => item.status === 'In Attesa di Approvazione') // Show only "In Attesa di Approvazione"
    .filter((item) => {
      return (
        (searchQueries.location === '' || item.Location.name.toLowerCase().includes(searchQueries.location.toLowerCase())) &&
        (searchQueries.date === '' || item.date.includes(searchQueries.date)) &&
        (searchQueries.period === '' || item.period.toLowerCase().includes(searchQueries.period.toLowerCase())) &&
        (searchQueries.status === '' || item.status.toLowerCase().includes(searchQueries.status.toLowerCase())) &&
        (searchQueries.owner === '' || (item.ownerUser?.name + ' ' + item.ownerUser?.surname).toLowerCase().includes(searchQueries.owner.toLowerCase()))
      );
    });

  const sortedCalendars = filteredCalendars.sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (sortDirection === 'asc') {
      return compareValues(valueA, valueB);
    } else {
      return compareValues(valueB, valueA);
    }
  });

  // Handle search input changes
  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

  // Export data to CSV
  const exportData = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      calendars.map((item) => Object.values(item).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'holidays_leaves_data.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Ferie e Permessi</h1>
            <p className="mt-2 text-sm text-gray-700">Lista delle richieste di ferie e permessi</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportData}
                className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4]"
              >
                Export
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="relative">
                <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    {/* Mappatura dei nomi delle colonne */}
                    {[
                      { key: 'location', label: 'Tipo di Richiesta' },
                      { key: 'date', label: 'Data' },
                      { key: 'period', label: 'Periodo' },
                      { key: 'status', label: 'Stato' },
                      { key: 'owner', label: 'Richiedente' }
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        onClick={() => handleSort(key)}
                      >
                        {label}
                        {sortColumn === key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-5 w-5 inline ml-2" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5 inline ml-2" />
                          )
                        ) : null}
                        <br />
                        <input
                          value={searchQueries[key]} // Usare le chiavi corrette per le query di ricerca
                          onClick={(e) => e.stopPropagation()} // Impedisce l'ordinamento quando si digita
                          onChange={handleSearchInputChange(key)}
                          className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                          placeholder=""
                        />
                      </th>
                    ))}
                    <th scope="col" className="relative py-3.5 pl-3 pr-3 sm:pr-3">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {sortedCalendars.map((calendar) => (
                      <tr key={calendar.id_calendar}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{calendar.Location.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{calendar.date}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {calendar.period === 'morning' ? 'Mattina' : calendar.period === 'afternoon' ? 'Pomeriggio' : calendar.period}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={classNames(
                            'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                            calendar.status === 'In Attesa di Approvazione'
                              ? 'bg-yellow-100 text-yellow-800'
                              : calendar.status === 'Approvata'
                              ? 'bg-green-100 text-green-800'
                              : calendar.status === 'Rifiutata'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {calendar.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {calendar.ownerUser?.name.slice(0, 2).toUpperCase() + calendar.ownerUser?.surname.slice(0, 2).toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-right text-sm font-medium sm:pr-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                              onClick={() => approveCalendar(calendar.id_calendar)}
                              disabled={calendar.status !== 'In Attesa di Approvazione'}
                            >
                              <CheckIcon className="h-5 w-4 text-gray-500" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                              onClick={() => rejectCalendar(calendar.id_calendar)}
                              disabled={calendar.status !== 'In Attesa di Approvazione'}
                            >
                              <XMarkIcon className="h-5 w-4 text-gray-500" />
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
    </>
  );
}
