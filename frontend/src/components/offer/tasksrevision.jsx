import React, { useMemo, useEffect } from 'react';
import Select from 'react-tailwindcss-select';

export default function TaskRevision({ task, onChange, onAddChild, onRemove, level = 1, users }) {
  if (!task) {
    console.error('Task is undefined');
    return null;
  }

  const indentStyle = {
    paddingLeft: `${level * 10}px`,
    borderLeft: level > 0 ? '2px solid #E5E7EB' : 'none'
  };

  const hasChildren = Array.isArray(task?.children) && task?.children.length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const calculatedValues = useMemo(() => {
    if (!hasChildren) return null;

    return task?.children.reduce((acc, child) => ({
      hour: acc.hour + (parseFloat(child.hour) ), 
      value: acc.value + (parseFloat(child.value) ),
      startDate: acc.startDate ? (child.startDate && child.startDate < acc.startDate ? child.startDate : acc.startDate) : child.startDate,
      endDate: acc.endDate ? (child.endDate && child.endDate > acc.endDate ? child.endDate : acc.endDate) : child.endDate,
    }), { hour: 0, value: 0, startDate: null, endDate: null }); 
  }, [task?.children]);


  const getAssignedToValue = useMemo(() => {
    // If there's no assigned user, return null
    if (!task?.assignedTo) return null;

    // If it's already a properly formatted object
    if (typeof task.assignedTo === 'object' && task.assignedTo.value && task.assignedTo.label) {
        return task.assignedTo; // Already in the correct format
    }

    // If it's an object representing the user, convert it to the Select format
    if (typeof task.assignedTo === 'object' && task.assignedTo.id_user) {
        return {
            value: task.assignedTo.id_user, // Ensure it’s a string
            label: `${task.assignedTo.name} ${task.assignedTo.surname}` // Combine name and surname
        };
    }

    // If it's just the ID, find the corresponding user in the users array
    const userFound = users.find(user => user.value === task.assignedTo.toString());
    if (userFound) {
        return userFound; // Ensure this user is properly formatted
    }

    return null; // Default case
}, [task?.assignedTo, users]);

  
  const handleInputChange = (field, value) => {
    // Ensure assignedTo is updated as an object, not just the value
    if (field === 'assignedTo') {
      onChange({
        ...task,
        assignedTo: value // Value will be the selected object (with value and label)
      });
    } else {
      onChange({
        ...task,
        [field]: value
      });
    }
  };
  const fetchUsers = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/read`); // Assicurati di avere l'endpoint corretto
        const formattedUsers = response.data.map(user => ({
            value: user.id_user.toString(), // Assicurati che sia una stringa
            label: `${user.name} ${user.surname}`, // Assicurati di concatenare il nome e il cognome
        }));
        setUsers(formattedUsers);

        // Verifica se selectedUser corrisponde a uno degli utenti caricati
        if (assignedUser) {
            const matchingUser = formattedUsers.find(u => u.value === assignedUser.value);
            if (matchingUser) {
                setAssignedUser(matchingUser); // Imposta l'utente selezionato
            } else {
                setAssignedUser(null); // Nessuna corrispondenza
            }
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

// Chiama la funzione al montaggio del componente
useEffect(() => {
    fetchUsers();
}, []);

  

  return (
    <div className="border p-2 mb-2 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="flex flex-wrap items-center space-x-2 text-sm">
        <textarea
          value={task?.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Descrizione"
          className="flex-grow max-w-[400px] px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
        <input
          type="number"
          value={hasChildren ? (calculatedValues?.hour) : (task?.hour )} 
          onChange={(e) => handleInputChange('hour', parseFloat(e.target.value))}   
          placeholder="Ore"
          className="w-20 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? formatDate(calculatedValues?.startDate) : formatDate(task?.estimatedstart)}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? formatDate(calculatedValues?.endDate) : formatDate(task?.estimatedend)}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
          <div className="w-40">
          <Select
            value={task?.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)} // Pass the selected object
            options={users}
            classNames={{
                menuButton: () => 'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]'
            }}
            primaryColor='[#7fb7d4]'
            isSearchable
            placeholder="Seleziona utente"
            />

        </div>
        <button 
          type="button" 
          onClick={onAddChild}
          className="px-2 py-1 text-xs font-semibold text-white bg-[#7fb7d4] rounded hover:bg-[#6ca7c4]"
        >
          +Sotto Task
        </button>
        <button 
          type="button" 
          onClick={onRemove}
          className="px-2 py-1 text-xs font-semibold text-[#7fb7d4] border border-[#7fb7d4] rounded hover:bg-[#7fb7d4] hover:text-white"
        >
          -
        </button>
      </div>
      <div className="mt-2">
        {hasChildren && task?.children.map((child, index) => (
          <TaskRevision
            key={index}
            task={child}
            onChange={(newChild) => {
              const newChildren = [...task?.children];
              newChildren[index] = newChild;
              onChange({ ...task, children: newChildren });
            }}
            onAddChild={() => {
              const newChildren = [...task?.children];
              newChildren.splice(index + 1, 0, { name: '', hour: 0, value: 0, assignedTo: '', children: [] });  // Cambiato hours in hour
              onChange({ ...task, children: newChildren });
            }}
            onRemove={() => {
              const newChildren = [...task?.children];
              newChildren.splice(index, 1);
              onChange({ ...task, children: newChildren });
            }}
            level={level + 1}
            users={users}
          />
        ))}
      </div>
    </div>
  );
}