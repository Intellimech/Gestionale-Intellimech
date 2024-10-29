import React, { useEffect, useState } from 'react';
import Select from 'react-tailwindcss-select';

const CommercialOfferRev = ({
  offer,
  onChange,
  onRemove,
  tasks,
  index,
  onAmountChange
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [localData, setLocalData] = useState({
    linkedTask: offer?.CommercialOffer?.linkedTask,
    date: formatDate(new Date()),
    amount: 0
  });

  const flattenTasks = (tasksArray) => {
    let flat = [];
    tasksArray.forEach(task => {
      if (task.id_task && (task.description || task.name)) {
        flat.push({
          value: task.name,
          label: task.description || task.name,
          estimatedend: task.estimatedend ? formatDate(task.estimatedend) : null
        });
      }
      if (task.children && task.children.length > 0) {
        flat = flat.concat(flattenTasks(task.children));
      }
    });
    return flat;
  };

  const allTasks = flattenTasks(tasks);

  useEffect(() => {
    if (offer) {
      const newLocalData = {
        linkedTask: null,
        date: formatDate(offer.date || new Date()),
        amount: offer.amount || 0
      };

      if (offer.linkedTask) {
        const taskOption = {
          value: offer.linkedTask.id_task,
          label: offer.linkedTask.description || offer.linkedTask.name,
          estimatedend: formatDate(offer.linkedTask.estimatedend)
        };
        newLocalData.linkedTask = taskOption;
      }

      setLocalData(newLocalData);
    }
  }, [offer]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onChange(updatedData);

    if (field === 'amount' && onAmountChange) {
      onAmountChange(index, value);
    }
  };

  const handleTaskSelection = (selectedOption) => {
    const updatedData = {
      ...localData,
      linkedTask: selectedOption,
      date: selectedOption?.estimatedend || formatDate(new Date())
    };
    setLocalData(updatedData);
    onChange(updatedData);
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
          <div className="font-medium">Accettazione Offerta
          </div>
        ) : isLastRow ? (
          <div className="font-medium">Fine Attività</div>
        ) : (
          <Select
            
            onChange={handleTaskSelection}
            options={allTasks}
            placeholder="Seleziona un task..."
            isSearchable
            isClearable
            primaryColor="blue"
            classNames={{
              menuButton: () => 'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7fb7d4] focus:border-[#7fb7d4]'
            }}
          />
        )}
      </div>

      <div>
        <input
          type="date"
          value={localData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="w-32 px-2 py-1 rounded border border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
          readOnly={localData.linkedTask != null}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={localData.amount}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          placeholder="Importo"
          className="w-32 px-2 py-1 rounded border border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
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
};

export default CommercialOfferRev;