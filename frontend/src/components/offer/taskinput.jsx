import React, { useMemo } from 'react';
import Select from 'react-tailwindcss-select';

export default function TaskForm({ task, onChange, onAddChild, onRemove, level = 1, users }) {
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
      estimatedstart: acc.estimatedstart ? (child.estimatedstart && child.estimatedstart < acc.estimatedstart ? child.estimatedstart : acc.estimatedstart) : child.estimatedstart,
      estimatedend: acc.estimatedend ? (child.estimatedend && child.estimatedend > acc.estimatedend ? child.estimatedend : acc.estimatedend) : child.estimatedend,
    }), { hours: 0, value: 0, estimatedstart: null, estimatedend: null });
  }, [task.children]);

  const handleInputChange = (field, value) => {
    if (hasChildren && (field === 'hours' || field === 'value' || field === 'estimatedstart' || field === 'estimatedend')) {
      // If there are children, don't allow direct changes to these fields
      return;
    }
    onChange({ ...task, [field]: value });
  };

  // Determine if the "Aggiungi Sotto Task" button should be shown
  const showAddSubtaskButton = level === 1 || hasChildren;

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
          value={hasChildren ? calculatedValues?.hours : (task?.hours || '')}
          onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
          placeholder="Ore"
          className="w-20 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? calculatedValues?.estimatedstart : (task?.estimatedstart || '')}
          onChange={(e) => handleInputChange('estimatedstart', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <input
          type="date"
          value={hasChildren ? calculatedValues?.estimatedend : (task?.estimatedend || '')}
          onChange={(e) => handleInputChange('estimatedend', e.target.value)}
          className="w-32 px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={hasChildren}
        />
        <div className="w-40">
          <Select
            value={task?.assignedTo}
            onChange={(value) => handleInputChange('assignedTo', value)}
            options={users.map((user) => ({ value: user.value, label: user.label }))}
            classNames={{
              menuButton: () => 'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]'
            }}
          />
        </div>
        {showAddSubtaskButton && (
          <button 
            type="button" 
            onClick={onAddChild}
            className="px-2 py-1 text-xs font-semibold text-white bg-[#7fb7d4] rounded hover:bg-[#6ca7c4]"
          >
            +Sotto Task
          </button>
        )}
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