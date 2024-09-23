import React from 'react';
import Select from 'react-tailwindcss-select';

export default function TaskForm({ task, onChange, onAddChild, onRemove, level = 1, users }) {
  // Style for indentation
  const indentStyle = {
    paddingLeft: `${level * 20}px`, // Adjust indentation based on level
    borderLeft: `${level > 0 ? '2px solid #E5E7EB' : 'none'}`, // Indentation border for subtasks
  };

  // Ensure task object is defined and has expected properties to avoid undefined errors
  const handleTaskChange = (updatedTask) => {
    onChange({
      ...task,
      ...updatedTask,
      children: task.children || [], // Ensure children is always an array
    });
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Nome</label>
        <input
          type="text"
          value={task?.name || ''} // Safe access with fallback to empty string
          onChange={(e) => handleTaskChange({ name: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Durata</label>
        <input
          type="text"
          value={task?.duration || ''} // Safe access with fallback to empty string
          onChange={(e) => handleTaskChange({ duration: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Assegnata a</label>
        <Select
          value={users.find(user => user.value === task?.assignedTo) || null} // Safely handle undefined
          onChange={(value) => handleTaskChange({ assignedTo: value })}
          options={users.map((user) => ({ value: user.id, label: user.name }))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={onAddChild}
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Aggiungi Sotto Task
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-[#A7D0EB] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Rimuovi
        </button>
      </div>
      <div className="pl-6">
        {task?.children?.map((child, index) => (
          <TaskForm
            key={index}
            task={child}
            onChange={(newChild) => {
              const newChildren = [...task.children];
              newChildren[index] = newChild;
              handleTaskChange({ children: newChildren });
            }}
            onAddChild={() => {
              const newChildren = [...task.children];
              newChildren[index] = { ...newChildren[index], children: newChildren[index].children || [] }; // Ensure children array exists
              newChildren[index].children.push({ name: '', duration: '', assignedTo: '', children: [] });
              handleTaskChange({ children: newChildren });
            }}
            onRemove={() => {
              const newChildren = [...task.children];
              newChildren.splice(index, 1);
              handleTaskChange({ children: newChildren });
            }}
            level={level + 1} // Increase the level for nested tasks
            users={users}
          />
        ))}
      </div>
    </div>
  );
}
