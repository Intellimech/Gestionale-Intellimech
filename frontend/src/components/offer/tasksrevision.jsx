import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-tailwindcss-select';
import axios from 'axios';

export default function TaskRevision({ task, onChange, onAddChild, onRemove, level = 1 }) {
  console.log(`Rendering TaskRevision at level ${level} with task:`, task);

  const [users, setUsers] = useState([]);
  console.log( "tomm", task?.assignedTo);
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
        hour: acc.hour + (parseFloat(child.hour) || 0),
        value: acc.value + (parseFloat(child.value) || 0),
        startDate: acc.startDate
          ? child.startDate && child.startDate < acc.startDate
            ? child.startDate
            : acc.startDate
          : child.startDate,
        endDate: acc.endDate
          ? child.endDate && child.endDate > acc.endDate
            ? child.endDate
            : acc.endDate
          : child.endDate,
      }),
      { hour: 0, value: 0, startDate: null, endDate: null }
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
    const updatedTask = { ...task, [field]: value };
    onChange(updatedTask);
  };

  return (
    <div className="border p-2 mb-2 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="flex flex-wrap items-center space-x-2 text-sm">
        <textarea
          value={task?.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrizione"
          className="flex-grow max-w-[400px] px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
        <input
          type="number"
          value={hasChildren ? calculatedValues?.hour : task?.hour || ''}
          onChange={(e) => handleInputChange('hour', e.target.value)}
          placeholder="Ore"
          className="w-20 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? formatDate(calculatedValues?.startDate) : formatDate(task?.estimatedstart)}
          onChange={(e) => handleInputChange('estimatedstart', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? formatDate(calculatedValues?.endDate) : formatDate(task?.estimatedend)}
          onChange={(e) => handleInputChange('estimatedend', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <div className="w-40">
          <Select
            value={selectedUser}
            onChange={(option) => {
              setSelectedUser(option);
              handleInputChange('assignedTo', option?.value || null);
            }}
            options={users}
            classNames={{
              menuButton: () =>
                'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]',
            }}
            primaryColor="[#7fb7d4]"
            isSearchable
            placeholder="Seleziona un utente"
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
        {task?.children?.map((child, index) => (
          <TaskForm
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
            users={users}
          />
        ))}
      </div>
    </div>
  );
}
