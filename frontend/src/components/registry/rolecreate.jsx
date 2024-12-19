import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckBadgeIcon, XCircleIcon , TrashIcon} from '@heroicons/react/24/solid';
import Select from 'react-tailwindcss-select';
import toast, { Toaster } from 'react-hot-toast';
import { json } from 'react-router-dom';


export default function RoleCreate() {
  const [CreateSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedrole, setSelectedRole] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPermissions, setNewPermissions] = useState([]);
  const [modifiablePermissions, setModifiablePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPermissions, setFilteredPermissions] = useState(modifiablePermissions);
  useEffect(() => {
    setFilteredPermissions(
      modifiablePermissions.filter((perm) =>
        perm.description?.toLowerCase().includes(searchTerm?.toLowerCase())
      )
    );
  }, [searchTerm, modifiablePermissions]);
  
  // Caricamento dei permessi e dei ruoli
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/permission/read`, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => setPermissions(response.data.permissions))
      .catch(console.error);

    axios
      .get(`${process.env.REACT_APP_API_URL}/role/read`, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => setRoles(response.data.roles))
      .catch(console.error);
  }, []);

  const fetchRolePermissions = (roleId) => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/permission/role/${roleId}`)
      .then((response) => {
        
        const data = response.data.permissions[0]?.Permissions || [];
        setFilteredPermissions(data); // Imposta anche i permessi filtrati inizialmente
        console.log(response.data);
  
        setModifiablePermissions(data); // Aggiorna i permessi del ruolo selezionato
      })
      .catch(console.error);
  };
  
  const removePermission = (permissionId) => {
    setModifiablePermissions((prev) =>
      prev.filter((perm) => perm.id_permission !== permissionId)
    );
  };
  
  
  // Gestione della selezione del ruolo
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    console.log(value.value);
    fetchRolePermissions(value.value); // Carica i permessi associati al ruolo selezionato
  };
  const handlePermissionChange = (value) => {
    setSelectedPermissions(value || []);
  };
//nel select metto i permessi aggiunti tramite select  
  

  // Funzione per la creazione dell'utente
  const createUser = async (event) => {
    event.preventDefault();
  
    // Combina i permessi della tabella e del Select
    const finalPermissions = [
      ...modifiablePermissions.map((perm) => perm.id_permission), // ID dalla tabella
      ...selectedPermissions.map((perm) => perm.value), // ID dal Select
    ].filter((value, index, self) => self.indexOf(value) === index); // Elimina duplicati
  
    const form = document.forms.createuser;
    const formData = new FormData(form);
  
    let jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });
  
    jsonObject.permissions = finalPermissions; // Invia i permessi combinati
    console.log("ecco cosa mando a backend", jsonObject)
    setLoading(true);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/role/create`, jsonObject);
      setCreateSuccess(true);
      toast.success('Ruolo creato con successo!');
      window.location.reload();
    } catch (error) {
      console.error('Errore:', error);
      setCreateSuccess(false);
      setErrorMessages(error.response?.data?.message || ['Si è verificato un errore inaspettato']);
      toast.error('Creazione del ruolo fallita.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form name='createuser'>
      <Toaster />
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
              Nome Ruolo
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <br />

         {/* Selezione di un ruolo esistente */}
          <div className="sm:col-span-2">
            <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">
              Ruolo già esistente (usalo come modello)
            </label>
            <div className="mt-2">
              <Select
                value={selectedrole}
                isClearable
                onChange={handleRoleChange}
                options={roles?.map((role) => ({
                  value: role.id_role,
                  label: role.name,
                }))}
                placeholder="Seleziona un ruolo esistente"
              />
            </div>
          </div>

          {/* Permessi precompilati */}
          <div className="sm:col-span-2 mt-6">
            <label htmlFor="permissions" className="block text-sm font-medium leading-6 text-gray-900">
              Permessi (modifica se necessario)
            </label>
            <div className="mt-2">
            <Select
              isMultiple
              isClearable
              value={selectedPermissions} // Valori attuali selezionati
              onChange={(value) => handlePermissionChange(value)} // Gestisce i cambiamenti
              options={permissions.map((permission) => ({
                value: permission.id_permission,
                label: `${permission.module} - ${permission.description}`,
              }))} // Tutti i permessi disponibili
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              placeholder="Seleziona i permessi"
            />



            </div>
          </div>

          

          <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Permessi selezionati:</h3>
          <table className="min-w-full mt-2 divide-y divide-gray-200 bg-white shadow sm:rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modifiablePermissions.map((perm) => (
                <tr key={perm.id_permission}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{perm.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => removePermission(perm.id_permission)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>




        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {CreateSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Utente creato con successo!</h3>
              </div>
            </div>
          </div>
        )}

        {CreateSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{errorMessages}</h3>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={createUser}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Crea'}
        </button>
      </div>
    </form>
  );
}
