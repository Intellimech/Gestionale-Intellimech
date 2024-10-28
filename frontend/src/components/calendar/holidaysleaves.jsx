import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function HolidaysLeavesManagement({ permissions }) {
  const [calendars, setCalendars] = useState([]);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQueries, setSearchQueries] = useState({
    location: '',
    date: '',
    period: '',
    status: '',
    owner: ''
  });
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchCalendars();
  }, []);

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

  const filteredCalendars = calendars
    .filter((item) => item.status === 'In Attesa di Approvazione')
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

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries({ ...searchQueries, [column]: event.target.value });
  };

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

  const approveGroup = (calendarsGroup) => {
    const ids = calendarsGroup.map(calendar => calendar.id_calendar);
    toast.promise(
      Promise.all(ids.map(id => axios.post(`${process.env.REACT_APP_API_URL}/holidays-leaves/approve/${id}`)))
        .then(() => fetchCalendars())
        .catch((error) => {
          console.log(error);
          throw new Error('Error while approving group');
        }),
      {
        loading: 'Approving group...',
        success: 'Successfully approved group!',
        error: 'Error in approving group',
      }
    );
  };

  const rejectGroup = (calendarsGroup) => {
    const ids = calendarsGroup.map(calendar => calendar.id_calendar);
    toast.promise(
      Promise.all(ids.map(id => axios.post(`${process.env.REACT_APP_API_URL}/holidays-leaves/reject/${id}`)))
        .then(() => fetchCalendars())
        .catch((error) => {
          console.log(error);
          throw new Error('Error while rejecting group');
        }),
      {
        loading: 'Rejecting group...',
        success: 'Successfully rejected group!',
        error: 'Error in rejecting group',
      }
    );
  };

  const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
      const groupKey = currentValue[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(currentValue);
      return result;
    }, {});
  };

  const groupedCalendars = groupBy(sortedCalendars, 'createdAt');

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
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
                            value={searchQueries[key]}
                            onClick={(e) => e.stopPropagation()}
                            onChange={handleSearchInputChange(key)}
                            className="mt-1 px-2 py-1 w-20 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                            placeholder=""
                          />
                        </th>
                      ))}
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {Object.keys(groupedCalendars).map((groupKey) => {
                      const calendarsGroup = groupedCalendars[groupKey];
                      const isExpanded = expandedGroups[groupKey];
                      
                      // Get details from the first request in the group
                      const firstRequest = calendarsGroup[0];
                      const ownerName = firstRequest.ownerUser?.name || '';
                      const ownerSurname = firstRequest.ownerUser?.surname || '';
                      
                      // Get unique request types
                      const uniqueRequestTypes = [...new Set(calendarsGroup.map(cal => cal.Location.name))];
                      const requestTypesString = uniqueRequestTypes.join(', ');

                      return (
                        <Fragment key={groupKey}>
                          <tr className="bg-gray-100">
                            <td colSpan="6" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <button
                                    className="text-[#7fb7d4] hover:text-[#7fb7d4]"
                                    onClick={() => toggleGroup(groupKey)}
                                  >
                                    {isExpanded ? (
                                      <ArrowUpIcon className="h-5 w-5 inline" aria-hidden="true" />
                                    ) : (
                                      <ArrowDownIcon className="h-5 w-5 inline" aria-hidden="true" />
                                    )}
                                  </button>
                                  <span>{new Date(groupKey).toLocaleString()}</span>
                                  <span className="font-medium text-gray-700">
                                    {ownerName} {ownerSurname}
                                  </span>
                                  <span className="text-gray-500">
                                     {requestTypesString}
                                  </span>
                                  <span className="text-gray-500">
                                    {calendarsGroup.length} richieste
                                  </span>
                                </div>
                                <div>
                                  <button
                                    onClick={() => approveGroup(calendarsGroup)}
                                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 mr-2"
                                  >
                                    <CheckIcon className="h-5 w-4 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => rejectGroup(calendarsGroup)}
                                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <XMarkIcon className="h-5 w-4 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                          {isExpanded &&

                            calendarsGroup.map((calendar) => (
                              <tr key={calendar.id_calendar}>
                                <td className="px-3 py-2 text-sm text-gray-500">{calendar.Location.name}</td>
                                <td className="px-3 py-2 text-sm text-gray-500">{new Date(calendar.date).toLocaleDateString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {calendar.period === 'morning' ? 'Mattina' : calendar.period === 'afternoon' ? 'Pomeriggio' : calendar.period}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">{calendar.status}</td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {calendar.ownerUser?.name} {calendar.ownerUser?.surname}
                                </td>
                                <td className="px-3 py-2 text-right text-sm font-medium">
                                  <button
                                    onClick={() => approveCalendar(calendar.id_calendar)}
                                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30">
                                    <CheckIcon className="h-5 w-4 text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => rejectCalendar(calendar.id_calendar)}
                                       className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <XMarkIcon className="h-5 w-4 text-gray-500" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {sortedCalendars.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-8">Nessuna richiesta trovata</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
