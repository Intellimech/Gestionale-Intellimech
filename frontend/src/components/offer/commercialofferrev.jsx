import React, { useEffect, useState, useMemo } from 'react';
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
  
  const flattenTasks = (tasksArray) => {
    let flat = [];
    if (Array.isArray(tasksArray)) {
      tasksArray.forEach(task => {
        if  (task.description || task.name) {
          flat.push({
            value: task.name,
            label: task.description || task.name,
            estimatedend: task.estimatedend ? formatDate(task.estimatedend) : null,
          });
        }
        if (Array.isArray(task.children) && task.children.length > 0) {
          flat = flat.concat(flattenTasks(task.children));
        }
      });
    }
    return flat;
  };
  
  const [allTasks, setAllTasks] = useState([]);

useEffect(() => {
  const flattened = flattenTasks(tasks || []);
  console.log("Flattened tasks:", flattened);
  setAllTasks(flattened);
}, [tasks]);

useEffect(() => {
  console.log("Tasks updated:", tasks);
  console.log("All tasks recalculated:", allTasks);
}, [tasks, allTasks]);

  const [localData, setLocalData] = useState({
    linkedtask: offer.linkedtask,
    date: formatDate(offer?.date || new Date()),
    amount: offer?.amount || 0,
    
  });
console.log(localData);


  useEffect(() => {
    if (offer) {
      const newLocalData = {
        linkedtask: offer?.linkedtask ,
        date: formatDate(offer?.date || new Date()),
        amount: offer?.amount || 0
      };

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
      linkedtask: selectedOption.label,
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
          <div className="font-medium">Accettazione Offerta</div>
        ) : isLastRow ? (
          <div className="font-medium">Fine Attività</div>
        ) : (
          <Select
            onChange={handleTaskSelection}
            options={allTasks}
            value={localData?.linkedtask ? {
              value: localData?.linkedtask, label: allTasks.find(t=> t?.label === localData?.linkedtask)?.label
             }
              : null
            }
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
          readOnly={localData.linkedtask != null}
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
