import React, { useMemo, useEffect, useState } from 'react';
import Select from 'react-tailwindcss-select';

const TaskRevision = ({ task, users, assignedTo, onChange, onAddChild, onRemove, level = 1 }) => {
  console.log(`Rendering TaskRevision at level ${level} with task:`, task);

  if (!task) {
    console.error('Task is undefined');
    return null;
  } else {
    console.log("Sono la task ", assignedTo);
  }

  const [selectedUser, setSelectedUser] = useState(null);

  const indentStyle = {
    paddingLeft: `${level * 10}px`,
    borderLeft: level > 0 ? '2px solid #E5E7EB' : 'none',
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
      hour: acc.hour + parseFloat(child.hour || 0),
      value: acc.value + parseFloat(child.value || 0),
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
    }), { hour: 0, value: 0, startDate: null, endDate: null });
  }, [task?.children]);
  
  useEffect(() => {
    if (task.assignedTo) {
      const userFound = users.find((user) => user.id === task.assignedTo.value);
      setSelectedUser(userFound || null);
    } else {
      setSelectedUser(null);
    }
  }, [task.assignedTo, users]);

  const handleInputChange = (field, value) => {
    const updatedTask = { ...task, [field]: field === 'assignedTo' ? value : value };
    onChange(updatedTask);
  };

  // const selectOptions = useMemo(() => {
  //   return users.map((user) => ({
  //     value: user.id,
  //     label: `${user.name} ${user.surname}`,
  //   }));
  // }, [users]);


  return (
    <div className="border p-2 mb-2 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="flex flex-wrap items-center space-x-2 text-sm">
        <textarea
          value={task?.description }
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Descrizione"
          className="flex-grow max-w-[400px] px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
        <input
          type="number"
          value={hasChildren ? calculatedValues?.hour : task?.hour || 0}
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
          value={selectedUser}
          onChange={(value) => handleInputChange('assignedTo', value)}
          options={users}
          classNames={{
            menuButton: () =>
              'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]',
          }}
          primaryColor="[#7fb7d4]"
          isSearchable
          placeholder="Select a user"
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
    </div>
  );
};

export default TaskRevision;