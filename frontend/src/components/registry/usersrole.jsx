import { useEffect, useState } from 'react';
import axios from 'axios';

export default function RoleUsersPage({ roleId }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQueries, setSearchQueries] = useState({
    id_user: '',
    name: '',
    surname: '',
    username: '',
  });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Fetch users for the given role
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/role/${roleId}`)
      .then((response) => {
        const data = response.data.users || [];
        setUsers(data);
        setFilteredUsers(data); // Initialize filtered users
        console.log(response.data);
      })
      .catch((err) => console.error(err));
  }, [roleId]);

  // Function to apply filters based on the search queries
  useEffect(() => {
    const filtered = users.filter((user) =>
      Object.keys(searchQueries).every((key) =>
        user[key]?.toString().toLowerCase().includes(searchQueries[key])
      )
    );
    setFilteredUsers(filtered);
  }, [searchQueries, users]);

  // Handle search input changes
  const handleSearchInputChange = (column) => (event) => {
    const value = event.target.value.toLowerCase();
    setSearchQueries((prev) => ({ ...prev, [column]: value }));
  };

  // Handle sorting
  const handleSort = (column) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(sorted);
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              onClick={() => handleSort('id_user')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              ID Utente
              <br />
              <input
                value={searchQueries.id_user}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('id_user')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('name')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Nome
              <br />
              <input
                value={searchQueries.name}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('name')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('surname')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Cognome
              <br />
              <input
                value={searchQueries.surname}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('surname')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
            <th
              onClick={() => handleSort('username')}
              className="px-6 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer"
            >
              Username
              <br />
              <input
                value={searchQueries.username}
                onClick={(e) => e.stopPropagation()}
                onChange={handleSearchInputChange('username')}
                className="mt-1 px-2 py-1 w-28 border border-gray-300 rounded-md shadow-sm focus:ring-[#7fb7d4] focus:border-[#7fb7d4] sm:text-xs"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <tr key={user.id_user}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id_user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.surname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Nessun utente trovato
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
