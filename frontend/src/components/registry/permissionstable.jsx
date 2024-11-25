import { useState, useEffect } from 'react';
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [permission, setPermissions] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    description: '',
    module: '',
    route: '',
    actionType: '',
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/permission/read`, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => setPermissions(response.data.permissions))
      .catch(console.error);
  }, []);

  const handleSearchInputChange = (column) => (event) => {
    setSearchQueries((prevQueries) => ({
      ...prevQueries,
      [column]: event.target.value,
    }));
  };

  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sortedPermission = [...permission].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setPermissions(sortedPermission);
  };

  // Filtro dei permessi in base alle query di ricerca per ogni colonna
  const filteredPermission = permission.filter((perm) => {
    return (
      perm.description?.toLowerCase().includes(searchQueries.description.toLowerCase()) &&
      perm.module?.toLowerCase().includes(searchQueries.module.toLowerCase()) &&
      perm.route?.toLowerCase().includes(searchQueries.route.toLowerCase()) &&
      perm.actionType?.toLowerCase().includes(searchQueries.actionType.toLowerCase())
    );
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900">Permessi</h1>
        <p className="mt-2 text-sm text-gray-700">Lista dei permessi</p>
      </div>

      <div className="mt-4">
        <table className="min-w-full table-fixed divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-1 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('description')}
              >
                Descrizione
                {sortColumn === 'description' && sortDirection !== '' ? (
                  sortDirection === 'asc' ? null : null) : null}
                <br />
                <input
                  value={searchQueries.description}
                  onClick={(e) => e.stopPropagation()} // Stop click propagation to prevent sorting
                  onChange={handleSearchInputChange('description')}
                  className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                  rows={1}
                />
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('module')}
              >
                Modulo
                {sortColumn === 'module' && sortDirection !== '' ? (
                  sortDirection === 'asc'  ? null : null) : null}
                <br />
                <input
                  value={searchQueries.module}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleSearchInputChange('module')}
                  className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                  rows={1}
                />
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('route')}
              >
                Route
                {sortColumn === 'route' && sortDirection !== '' ? (
                  sortDirection === 'asc' ? null : null) : null}
                <br />
                <input
                  value={searchQueries.route}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleSearchInputChange('route')}
                  className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                  rows={1}
                />
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleSort('actionType')}
              >
                CRUD
                {sortColumn === 'actionType' && sortDirection !== '' ? (
                  sortDirection === 'asc' ? null : null) : null}
                <br />
                <input
                  value={searchQueries.actionType}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleSearchInputChange('actionType')}
                  className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
                  rows={1}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredPermission.map((permission) => (
              <tr key={permission.id_user}>
                <td className="whitespace-nowrap py-4 text-sm text-gray-500">{permission.description}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{permission.module}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{permission.route}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{permission.actionType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
