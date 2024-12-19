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
        value: task.id_task || '', // Use description instead of name
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
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">{getRowLabel()}</td>
            <td className="w-3/4 p-2">
              <span className="font-semibold"></span>
            </td>
          </tr>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">Accettazione Offerta</td>
            <td className="w-3/4 p-2">
              {isFirstRow ? (
                <div className="font-medium">Accettazione Offerta</div>
              ) : (
                <Select
                  value={commercialOffer?.linkedTask}
                  onChange={handleTaskSelection}
                  options={allTasks}
                  placeholder="Seleziona un task..."
                  isSearchable={true}
                  isClearable={true}
                  className="w-full"
                  
                />
              )}
            </td>
          </tr>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">Data</td>
            <td className="w-3/4 p-2">
              <input
                type="date"
                value={commercialOffer?.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm ${
                  commercialOffer?.linkedTask != null ? 'bg-gray-100 text-gray-500' : ''
                }`}
                readOnly={commercialOffer?.linkedTask != null}
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">Importo</td>
            <td className="w-3/4 p-2 flex items-center space-x-2">
              <input
                type="number"
                value={commercialOffer?.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="Importo"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              />
              <span className="text-gray-500">+ IVA</span>
            </td>
          </tr>
          {!isFirstRow && (
            <tr>
              <td className="w-1/4 p-2"></td>
              <td className="w-3/4 p-2">
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Rimuovi
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
}