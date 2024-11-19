import React from 'react';
import Select from 'react-tailwindcss-select';

export default function CommercialOfferForm({
  commercialOffer,
  onChange,
  onRemove,
  tasks = [],
  index
}) {
  const handleInputChange = (field, value) => {
    const updatedOffer = { ...commercialOffer, [field]: value };
    onChange(updatedOffer);
  };

  // Flatten tasks array and their children into a single array
  const flattenTasks = (tasksArray) => {
    let flat = [];
    tasksArray.forEach(task => {
      // Ensure we're creating a valid option object with string values
      flat.push({
        value: task.description || '', // Use description instead of name
        label: task.description || '', // Use description instead of name
        estimatedend: task.estimatedend
      });
      if (task.children && task.children.length > 0) {
        flat = flat.concat(flattenTasks(task.children));
      }
    });
    return flat;
  };

  const allTasks = flattenTasks(tasks);

  const handleTaskSelection = (selectedOption) => {
    if (!selectedOption) {
      handleInputChange('linkedTask', null);
      handleInputChange('date', '');
      return;
    }

    const selectedTask = allTasks.find(t => t.value === selectedOption.value);
    if (selectedTask) {
      onChange({
        ...commercialOffer,
        linkedTask: selectedOption,
        date: selectedTask.estimatedend
      });
    }
  };

  const getRowLabel = () => {
    const labels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return labels[index] || '';
  };

  const isFirstRow = index === 0;

  return (
    <div className="flex items-center space-x-4 mb-4 p-4 bg-white rounded-lg shadow">
      <div className="w-16 font-semibold">
        {getRowLabel()}
      </div>

      <div className="flex-1">
        {isFirstRow ? (
          <div className="font-medium">Accettazione Offerta</div>
        )  : (
          <Select
            value={commercialOffer?.linkedTask}
            onChange={handleTaskSelection}
            options={allTasks}
            placeholder="Seleziona un task..."
            isSearchable={true}
            isClearable={true}
          />
        )}
      </div>

      <div>
        <input
          type="date"
          value={commercialOffer?.date || ''}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-32 px-2 py-1 rounded border border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={commercialOffer?.linkedTask != null}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={commercialOffer?.amount || ''}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          placeholder="Importo"
          className="w-32 px-2 py-1 rounded border border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
        <span className="text-sm text-gray-500">+ IVA</span>
      </div>

      {!isFirstRow && (
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <span className="sr-only">Rimuovi</span>
          -
        </button>
      )}
    </div>
  );
}