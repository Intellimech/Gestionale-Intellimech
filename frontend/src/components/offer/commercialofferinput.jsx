import Select from 'react-tailwindcss-select';
export default function CommercialOfferForm({
  commercialOffer,
  onChange,
  onRemove,
  tasks = [],
  index,
  onAmountChange // Nuovo prop per gestire il cambiamento dell'importo
}) {
  const handleInputChange = (field, value) => {
    const updatedOffer = { ...commercialOffer, [field]: value };
    onChange(updatedOffer);
    
    // Se il campo modificato è l'importo, notifica il componente padre
    if (field === 'amount') {
      onAmountChange(index, value);
    }
  };

  // Flatten tasks array and their children into a single array
  const flattenTasks = (tasksArray) => {
    let flat = [];
    tasksArray.forEach(task => {
      flat.push({
        value: task.name,
        label: task.name,
        estimatedend: task.estimatedend
      });
      if (task.children && task.children.length > 0) {
        flat = flat.concat(flattenTasks(task.children));
      }
    });
    return flat;
  };

  const allTasks = flattenTasks(tasks);

  // Update date automatically when a task is selected
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
        linkedTask: selectedTask,
        date: selectedTask.estimatedend || commercialOffer.date
      });
    }
  };

  const getRowLabel = () => {
    const labels = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    return labels[index] || '';
  };

  const isFirstRow = index === 0;
  const isLastRow = index === 5;

  return (
    <div className="flex items-center space-x-4 mb-4 p-4 bg-white rounded-lg shadow">
      <div className="w-16 font-semibold">
        {getRowLabel()}
      </div>
      
      <div className="flex-1">
        {isFirstRow ? (
          <div className="font-medium">Accettazione Offerta</div>
        ) : isLastRow ? (
          <div className="font-medium">Fine Attività</div>
        ) : (
          <Select
            value={commercialOffer?.linkedTask}
            onChange={handleTaskSelection}
            options={allTasks}
            placeholder="Seleziona un task..."
            isSearchable={true}
            isClearable={true}
            classNames={{
              menuButton: () => 'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]'
            }}
          />
        )}
      </div>

      <div>
        <input
          type="date"
          value={commercialOffer?.linkedTask?.estimatedend}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-32 px-2 py-1 rounded border border-gray-300 
                   focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={commercialOffer?.linkedTask != null}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={commercialOffer?.amount || ''}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          placeholder="Importo"
          className="w-32 px-2 py-1 rounded border border-gray-300 
                   focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
        <span className="text-sm text-gray-500">+ IVA</span>
      </div>

      {!isFirstRow && !isLastRow && (
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
