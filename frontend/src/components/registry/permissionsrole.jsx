import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RolePermissionsPage({ roleId }) {
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    module: '',
    description: '',
    route: '',
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Ottieni i permessi per il ruolo
    axios
      .get(`${process.env.REACT_APP_API_URL}/permission/role/${roleId}`)
      .then((response) => {
        const data = response.data.permissions[0]?.Permissions || [];
        setPermissions(data);
        setFilteredPermissions(data); // Imposta anche i permessi filtrati inizialmente
        console.log(response.data);
      })
      .catch((err) => console.error(err));
  }, [roleId]);

  // Gestione dei cambiamenti nei campi di ricerca
  const handleSearchInputChange = (column) => (event) => {
    const value = event.target.value.toLowerCase();
    setSearchQueries((prev) => ({ ...prev, [column]: value }));

    const filtered = permissions.filter((perm) =>
      Object.keys(searchQueries).every((key) =>
        key === column
          ? perm[key]?.toLowerCase().includes(value)
          : perm[key]?.toLowerCase().includes(searchQueries[key])
      )
    );
    setFilteredPermissions(filtered);
  };

  // Funzione per ordinare la tabella
  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...filteredPermissions].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPermissions(sorted);
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              onClick={() => handleSort('id_permission')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              ID Permesso
              <br />
              <input
                value={searchQueries.id_permission}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('id_permission')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('module')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Modulo
              <br />
              <input
                value={searchQueries.module}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('module')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('route')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Rotta
              <br />
              <input
                value={searchQueries.route}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('route')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('description')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Descrizione
              <br />
              <input
                value={searchQueries.description}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('description')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredPermissions.map((permission) => (
            <tr key={permission.id_permission}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.id_permission}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.module}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.route}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permission.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
