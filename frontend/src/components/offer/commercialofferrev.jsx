import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-tailwindcss-select';

export default function CommercialOfferRev  ({
  offer,
  onChange,
  onRemove,
  tasks,
  index,
  onAmountChange
})  {
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


  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
    <table className="w-full text-sm">
      <tbody>
        <tr>
          <td className="w-1/4 p-2 text-left font-medium">
            <span className="font-semibold"></span>
          </td>
        </tr>
        <tr>
            <td className="w-1/4 p-2 text-left font-medium">Task Collegato:</td>
            <td className="w-3/4 p-2">
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
            </td>
          </tr>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">Data:</td>
            <td className="w-3/4 p-2">
              <input
                type="date"
                value={localData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
              />
            </td>
          </tr>
          <tr>
            <td className="w-1/4 p-2 text-left font-medium">Importo:</td>
            <td className="w-3/4 p-2">
              <input
                type="number"
                value={localData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4]"
              />
              <span className="ml-2 text-sm text-gray-500">+ IVA</span>
            </td>
          </tr>
          {onRemove && (
            <tr>
              <td colSpan={2} className="p-2 text-right">
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-4 py-2 text-xs font-semibold text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white"
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
