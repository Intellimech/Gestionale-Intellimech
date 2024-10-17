import React from 'react';
import Select from "react-tailwindcss-select";

export default function TaskForm({ task, onChange, onAddChild, onRemove, level = 1, users }) {
  const indentStyle = {
    paddingLeft: `${level * 20}px`,
    borderLeft: `${level > 0 ? '2px solid #E5E7EB' : 'none'}`,
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50" style={indentStyle}>
      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Nome</label>
        <input
          type="text"
          value={task?.name}
          onChange={(e) => onChange({ ...task, name: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Durata</label>
        <input
          type="text"
          value={task?.duration}
          onChange={(e) => onChange({ ...task, duration: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Assegnata a</label>
        <Select
          value={task?.assignedTo}
          onChange={(value) => onChange({ ...task, assignedTo: value })}
          options={users.map((user) => ({ value: user.value, label: user.label }))}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </div>

      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={onAddChild}
          className="rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#7fb7d4]"
        >
          Aggiungi Sotto Task
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-[#7fb7d4] px-3 py-2 text-sm font-semibold text-[#7fb7d4]"
        >
          Rimuovi
        </button>
      </div>

      <div className="pl-6">
        {task?.children.map((child, index) => (
          <TaskForm
            key={index}
            task={child}
            onChange={(newChild) => {
              const newChildren = [...task.children];
              newChildren[index] = newChild;
              onChange({ ...task, children: newChildren });
            }}
            onAddChild={() => {
              onAddChild(); // This will add a subtask under the current task
            }}
            onRemove={() => {
              const newChildren = [...task.children];
              newChildren.splice(index, 1);
              onChange({ ...task, children: newChildren });
            }}
            level={level + 1} // Increase the level for nested tasks
            users={users}
          />
        ))}
      </div>
    </div>
  );
}
