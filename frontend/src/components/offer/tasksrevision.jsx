import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';

export default function TaskRevision({ task, onChange, onAddChild, onRemove, level = 1 }) {
  console.log(`Rendering TaskRevision at level ${level} with task:`, task);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(
    task?.assignedToUser
      ? { value: task.assignedToUser.id_user, label: `${task.assignedToUser.name} ${task.assignedToUser.surname}` }
      : null
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/read`);
        const usersData = response.data.users.map(({ id_user, name, surname }) => ({
          value: id_user,
          label: `${name} ${surname}`,
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const indentStyle = {
    paddingLeft: `${level * 10}px`,
    borderLeft: level > 0 ? '2px solid #E5E7EB' : 'none',
  };

  const hasChildren = Array.isArray(task?.children) && task.children.length > 0;

  const calculatedValues = useMemo(() => {
    if (!hasChildren) return null;
    return task.children.reduce(
      (acc, child) => ({
        hours: acc.hours + (parseFloat(child.hour) || 0),
        value: acc.value + (parseFloat(child.value) || 0),
        estimatedstart: acc.estimatedstart
          ? child.estimatedstart && child.estimatedstart < acc.estimatedstart
            ? child.estimatedstart
            : acc.estimatedstart
          : child.estimatedstart,
        estimatedend: acc.estimatedend
          ? child.estimatedend && child.estimatedend > acc.estimatedend
            ? child.estimatedend
            : acc.estimatedend
          : child.estimatedend,
      }),
      { hours: 0, value: 0, estimatedstart: null, estimatedend: null }
    );
  }, [task?.children]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const handleInputChange = (field, value) => {
    if (hasChildren && ['hours', 'value', 'estimatedstart', 'estimatedend'].includes(field)) return;
    const updatedTask = { ...task, [field]: value };
    onChange(updatedTask);
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">Descrizione:</td>
            <td className="w-2/3 p-2">
              <textarea
                value={task?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrizione"
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">Ore:</td>
            <td className="w-2/3 p-2">
              <input
                type="number"
                value={hasChildren ? calculatedValues?.hours : task?.hour || ''}
                onChange={(e) => handleInputChange('hour', e.target.value)}
                placeholder="Ore"
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
                readOnly={hasChildren}
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">Data Inizio:</td>
            <td className="w-2/3 p-2">
              <input
                type="date"
                value={hasChildren ? formatDate(calculatedValues?.estimatedstart) : formatDate(task?.estimatedstart)}
                onChange={(e) => handleInputChange('estimatedstart', e.target.value)}
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
                readOnly={hasChildren}
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">Data Fine:</td>
            <td className="w-2/3 p-2">
              <input
                type="date"
                value={hasChildren ? formatDate(calculatedValues?.estimatedend) : formatDate(task?.estimatedend)}
                onChange={(e) => handleInputChange('estimatedend', e.target.value)}
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
                readOnly={hasChildren}
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">Assegnato a:</td>
            <td className="w-2/3 p-2">
            <Select
              value={selectedUser}
              onChange={(option) => {
                setSelectedUser(option);
                handleInputChange('assignedTo', option?.value || null);
              }}
              options={users}
              classNames={{
                menuButton: () =>
                  'text-sm text-gray-500 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4] inline-flex items-center space-x-2 px-2 py-1', // Aggiunto inline-flex
              }}
              primaryColor="[#7fb7d4]"
              isSearchable
              placeholder="Seleziona un utente"
            />

            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex justify-end mt-4 space-x-2">
        {level === 1 || hasChildren ? (
          <button
            type="button"
            onClick={onAddChild}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7fb7d4] rounded hover:bg-[#6ca7c4]"
          >
            + Sotto Task
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 text-xs font-semibold text-[#7fb7d4] border border-[#7fb7d4] rounded hover:bg-[#7fb7d4] hover:text-white"
        >
          -
        </button>
      </div>
      <div className="mt-4">
        {task?.children?.map((child, index) => (
          <TaskRevision
            key={index}
            task={child}
            onChange={(newChild) => {
              const newChildren = [...(task.children || [])];
              newChildren[index] = newChild;
              onChange({ ...task, children: newChildren });
            }}
            onAddChild={onAddChild}
            onRemove={() => {
              const newChildren = [...(task.children || [])];
              newChildren.splice(index, 1);
              onChange({ ...task, children: newChildren });
            }}
            level={level + 1}
          />
        ))}
      </div>
    </div>
  );
}
