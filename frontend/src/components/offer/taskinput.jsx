import React, { useMemo } from 'react';
import Select from 'react-tailwindcss-select';

export default function TaskForm({ key, task, name, onChange, onAddChild, onRemove, level = 1, users }) {
  const indentStyle = {
    paddingLeft: `${level * 10}px`,
    borderLeft: level > 0 ? '2px solid #E5E7EB' : 'none'
  };

  const hasChildren = task.children && task.children.length > 0;

  const calculatedValues = useMemo(() => {
    if (!hasChildren) return null;

    return task?.children.reduce((acc, child) => ({
      hours: acc.hours + (child.hours || 0),
      value: acc.value + (child.value || 0),
      estimatedstart: acc.estimatedstart
        ? (child.estimatedstart && child.estimatedstart < acc.estimatedstart ? child.estimatedstart : acc.estimatedstart)
        : child.estimatedstart,
      estimatedend: acc.estimatedend
        ? (child.estimatedend && child.estimatedend > acc.estimatedend ? child.estimatedend : acc.estimatedend)
        : child.estimatedend,
    }), { hours: 0, value: 0, estimatedstart: null, estimatedend: null });
  }, [task.children]);

  const handleInputChange = (field, value) => {
    if (hasChildren && (field === 'hours' || field === 'value' || field === 'estimatedstart' || field === 'estimatedend')) {
      return;
    }
    onChange({ ...task, [field]: value });
  };

  const showAddSubtaskButton = level === 1 || hasChildren;
  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="w-1/3 p-2 text-left font-medium">{name}</td>
            <td className="w-2/3 p-2">
              <span className="font-semibold"></span>
            </td>
          </tr>
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
                value={hasChildren ? calculatedValues?.hours : (task?.hours || '')}
                onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
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
                value={hasChildren ? calculatedValues?.estimatedstart : (task?.estimatedstart || '')}
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
                value={hasChildren ? calculatedValues?.estimatedend : (task?.estimatedend || '')}
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
                value={task?.assignedTo}
                onChange={(value) => handleInputChange('assignedTo', value)}
                options={users.map((user) => ({ value: user.value, label: user.label }))}
                classNames={{
                  menuButton: () =>
                    'text-sm text-gray-500 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4] inline-flex items-center space-x-2 px-2 py-1', // Aggiunto inline-flex
                }}
                primaryColor="[#7fb7d4]"
                isSearchable
                isClearable
                placeholder="Seleziona un utente"
              />
            </td>
          </tr>
        </tbody>
      </table>
  
      <div className="flex justify-end mt-4 space-x-2">
        {showAddSubtaskButton && (
          <button
            type="button"
            onClick={onAddChild}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#7fb7d4] rounded hover:bg-[#6ca7c4]"
          >
            + Sotto Task
          </button>
        )}
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
          <TaskForm
            key={index}
            name={`${name}.${index + 1}`}
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