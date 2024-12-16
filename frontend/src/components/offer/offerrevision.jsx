import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon , PencilIcon} from '@heroicons/react/20/solid';
import Select from 'react-tailwindcss-select';
import TaskRevision from './tasksrevision';
import CommercialOfferRev from './commercialofferrev'
import toast, { Toaster } from 'react-hot-toast';

function capitalizeAfterPeriodAndFirstLetter(str) {
  if (!str) return ""; // Handle empty or undefined strings
  return str
      .trim() // Remove leading/trailing spaces
      .replace(/(^|\.\s+)(\w+)/g, (match, prefix, word) => {
          // Prefix is the character(s) before the word (e.g., a period and space)
          // Word is the actual word to capitalize
          return prefix + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
}

export default function RevisionForm({offer : initialoffer}) {
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState({
    value: initialoffer?.quotationrequest,
    label:`${ initialoffer?.QuotationRequest?.name} - ${capitalizeAfterPeriodAndFirstLetter(initialoffer?.QuotationRequest?.Company?.name)}`,
  });
  console.log(initialoffer);
  const [offer, setOffer] = useState(initialoffer || {});
  const [tasks, setTasks] = useState(initialoffer?.Tasks || [{ name: '', hour: 0, estimatedend:new Date().toISOString().split('T')[0], estimatedstart: new Date().toISOString().split('T')[0],  value: 0, assignedTo: '', children: [] }]);
  const [estimatedStartDate, setEstimatedStartDate] = useState(initialoffer?.estimatedstart || new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(initialoffer?.estimatedend || new Date().toISOString().split('T')[0]);
  const [quotationRequest, setQuotationRequest] = useState(initialoffer?.QuotationRequest?.name);
  console.log("sono la richiesta di offertsa", initialoffer);
  const [description, setDescription] = useState(initialoffer?.description || null);
  const [quotationRequestDescri, setQuotationRequestDescri] = useState(initialoffer?.QuotationRequest?.description);
  
  const [amount, setAmount] = useState(initialoffer?.amount || '');
  const [hour, setHour] = useState(initialoffer?.hour || '');
  const [users, setUsers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  
const [commercialoffers, setCommercialOffers] = useState(() => {
  if (initialoffer?.CommercialOffers?.length > 0) {
    return offer.CommercialOffers.map((offerItem, index) => ({
      ...offerItem,
      index,
      linkedTask: offerItem.linkedTask ? {
        value: offerItem.linkedTask.description,
        label: offerItem.linkedTask.description,
        estimatedend: offerItem.linkedTask.estimatedend
      } : null,
      date: offerItem.date || new Date().toISOString().split('T')[0],
      amount: offerItem.amount || 0,
    }));
  }
  
  return [{
    linkedTask: null,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    index: 0
  }];
});

  const [totalCommercialAmount, setTotalCommercialAmount] = useState(0);

  const recalculateTotals = () => {
    
    const { totalHours, totalValue } = calculateTotals(tasks);
    setTotalHours(totalHours);
    setTotalValue(totalValue);

    const commercialTotal = commercialoffers.reduce((sum, offer) => sum + (offer.amount || 0), 0);
    setTotalCommercialAmount(commercialTotal);
  };

 
  useEffect(() => {
    recalculateTotals();
  }, [tasks, commercialoffers]);

  const addCommercialOffer = () => {
    if (commercialoffers.length < 6) {
      const newOffer = {
        linkedTask: null,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        index: commercialoffers.length
      };
      setCommercialOffers([...commercialoffers, newOffer]);
    }
  };

  useEffect(() => {
    console.log('Tasks updated:', tasks);
  }, [tasks]);
  
  useEffect(() => {
    console.log('Commercial Offers updated:', commercialoffers);
  }, [commercialoffers]);
  
  const updateCommercialOffer = (index, updatedOffer) => {
    const newCommercialOffers = commercialoffers.map((offer, i) => 
      i === index ? { ...updatedOffer, index } : offer
    );
    setCommercialOffers(newCommercialOffers);
  };

  const removeCommercialOffer = (index) => {
    const newCommercialOffers = commercialoffers.filter((_, i) => i !== index);
    setCommercialOffers(newCommercialOffers);
  };

 // Example: Accessing the label for logging
 useEffect(() => {
    if (selectedQuotationRequest) {
      console.log("Selected Quotation Request Label:", selectedQuotationRequest.label);
    }
  }, [selectedQuotationRequest]);
  useEffect(() => {
    if (initialoffer) {
      setOffer(initialoffer);
      

      // Inizializza Team
      if (initialoffer.team) {
        const teamMembers = offer.team.map(user => ({
          value: user.id_user,
          label: `${user.name} ${user.surname}`
        }));
        setSelectedTeam(teamMembers);
      }
      
      // Inizializza ore e importo
      setHour(initialoffer.hour || '');
      setAmount(initialoffer.amount || '');

      // Inizializza Date
      if (initialoffer.estimatedstart) {
        setEstimatedStartDate(initialoffer.estimatedstart.split('T')[0]);
      }
      if (initialoffer.estimatedend) {
        setEstimatedEndDate(initialoffer.estimatedend.split('T')[0]);
      }

      // Inizializza Tasks
      if (initialoffer.tasks && initialoffer.tasks.length > 0) {
        const formattedTasks = initialoffer.tasks.map(task => ({
          ...task,
          assignedTo: task.assignedTo ? {
            value: task.assignedTo.id_user,
            label: `${task.assignedTo.name} ${task.assignedTo.surname}`
          } : null,
          children: task.children ? task.children.map(child => ({
            ...child,
            assignedTo: child.assignedTo ? {
              value: child.assignedTo.id_user,
              label: `${child.assignedTo.name} ${child.assignedTo.surname}`
            } : null
          })) : []
        }));
        setTasks(formattedTasks);
      }
    }
  }, [initialoffer]);

  
  useEffect(() => {
    const fetchData = async () => {
        try {
          const [
            { data: { quotationrequest } },
            { data: { categories } },
            { data: { technicalareas } },
            { data: { users } },
            { data: { value: companies } },
          ] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`),
            axios.get(`${process.env.REACT_APP_API_URL}/category/read`),
            axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`),
            axios.get(`${process.env.REACT_APP_API_URL}/user/read`),
            axios.get(`${process.env.REACT_APP_API_URL}/company/read`),
          ]);
      
      
          setUsers(users.map(({ id_user, name, surname }) => ({
            value: id_user,
            label: `${name} ${surname}`
          })));
          
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      
    fetchData();
  }, []);
  
  const stampa= ()=>{
    console.log("PANICO"+ tasks)
   };

   const updateTask = (index, updatedTask) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = updatedTask;
    setTasks(updatedTasks);
    setOffer({ ...offer, task: updatedTasks });
  };




  const handleInputChange = (name, value) => {
    if (offer[name] !== value) {
      setOffer((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  

  const handleQuotationRequestChange = (value) => {
    setSelectedQuotationRequest(value);
    handleInputChange('quotationrequest', value);
  };


  const handleTeamChange = (value) => {
    setSelectedTeam(value);
    handleInputChange('team', value);
  };

  
  const addTask = (parentIndex = null) => {
    if (parentIndex !== null) {
      const newTasks = [...tasks];
      newTasks[parentIndex].children.push({ 
        description: '', 
        hours: 0, 
        value: 0, 
        assignedTo: '', 
        estimatedstart: new Date().toISOString().split('T')[0],
        estimatedend: new Date().toISOString().split('T')[0],
        children: [] 
      });
      setTasks(newTasks);
      recalculateTotalsAndDates(newTasks);
    } else {
      const newTasks = [...tasks, { 
        description: '', 
        hours: 0, 
        value: 0, 
        assignedTo: '', 
        estimatedstart: new Date().toISOString().split('T')[0],
        estimatedend: new Date().toISOString().split('T')[0],
        children: [] 
      }];
      setTasks(newTasks);
      recalculateTotalsAndDates(newTasks);
    }
  };

  
const calculateTotals = (tasks) => {
  let totalHours = 0;
  let totalValue = 0;

  const calculateTaskTotal = (task) => {
    // Se il task ha figli, non sommare i suoi valori diretti
    if (!task.children || task.children.length === 0) {
      totalHours += Number(task.hour || 0);
      totalValue += Number(task.value || 0);
    }

    // Calcola ricorsivamente i totali per i figli
    if (task.children && task.children.length > 0) {
      task.children.forEach(child => {
        totalHours += Number(child.hour || 0);
        totalValue += Number(child.value || 0);
      });
    }
  };

  tasks.forEach(calculateTaskTotal);
  return { totalHours, totalValue };
};

// Aggiungi questa funzione useEffect per aggiornare i totali
useEffect(() => {
  const { totalHours: hour, totalValue: value } = calculateTotals(tasks);
  setTotalHours(hour);
  setTotalValue(value);
}, [tasks]);

// const createOffer = async (event) => {
//   event.preventDefault();

//   // Verifica se sono stati modificati i valori o meno
//   const finalHour = hour !== offer.hour ? hour : offer.hour;
//   const finalAmount = amount !== offer.amount ? amount : offer.amount;
//   const finalTasks = tasks.map((task, index) => ({
//     name: task.name,
//     hour: task.hour || task.hour,
//     value: task.value,
//     startDate: task.estimatedstart || task.startDate,
//     endDate: task.estimatedend || task.endDate,
//     assignedTo: task.assignedTo?.value || task.assignedTo,
//     children: (task.children || []).map((child) => ({
//       name: child.name,
//       hour: child.hour || child.hour,
//       value: child.value,
//       startDate: child.estimatedstart || child.startDate,
//       endDate: child.estimatedend || child.endDate,
//       assignedTo: child.assignedTo?.value || child.assignedTo,
//     })),
//   }));

//   const jsonObject = {
//     amount: finalAmount,
//     hour: finalHour,
//     name: offer?.name,
//     description: description,
//     estimatedstart: estimatedStartDate,
//     estimatedend: estimatedEndDate,
//     quotationrequest: selectedQuotationRequest?.value || null,
//     revision: (offer.revision + 1),
//     team: selectedTeam?.map((team) => team.value) || [],
//     tasks: finalTasks,
//   };


//   console.log("Sending data:", jsonObject);
const createOffer = async (event) => {
  console.log("qua cerchiamo di fare update ", tasks)
  event.preventDefault();

  // Crea un oggetto che mantiene tutti i valori iniziali dell'offerta
  const jsonObject = {
    ...initialoffer, // Spread dell'offerta iniziale
    description: description !== initialoffer.description ? description : initialoffer.description,
    // Sovrascrive solo i campi che sono stati effettivamente modificati
    estimatedstart: estimatedStartDate !== initialoffer.estimatedstart ? estimatedStartDate : initialoffer.estimatedstart,
    estimatedend: estimatedEndDate !== initialoffer.estimatedend ? estimatedEndDate : initialoffer.estimatedend,
    amount: totalCommercialAmount !== initialoffer.amount ? totalCommercialAmount : initialoffer.amount,
    hour: totalHours !== initialoffer.hour ? totalHours : initialoffer.hour, 
    team: selectedTeam?.length > 0 ? selectedTeam.map((team) => team.value) : initialoffer.team?.map(t => t.id_user),
    quotationrequest: selectedQuotationRequest?.value || initialoffer.quotationrequest,
    quotationrequestdescription: quotationRequestDescri !== initialoffer.QuotationRequest?.description 
      ? quotationRequestDescri 
      : initialoffer.QuotationRequest?.description,
    name: initialoffer?.name,
    id_offer: initialoffer?.id_offer,
    revision: initialoffer.revision + 1
  };

  // Gestione dei tasks
  jsonObject.tasks = tasks.map((task, index) => {
    const originalTask = initialoffer.tasks?.[index] || {};
    
    return {
      ...originalTask, // Mantiene i valori originali
      
      // Sovrascrive solo i campi modificati
      description: task.description !== originalTask.description ? task.description : originalTask.description,
      hour: task.hour !== originalTask.hour ? task.hour : originalTask.hour,
      value: task.value !== originalTask.value ? task.value : originalTask.value,
      estimatedstart: task.estimatedstart !== originalTask.estimatedstart ? task.estimatedstart : originalTask.estimatedstart,
      estimatedend: task.estimatedend !== originalTask.estimatedend ? task.estimatedend : originalTask.estimatedend,
      assignedTo: task.assignedTo || originalTask.assignedTo?.id_user,
      
      // Gestione ricorsiva dei sottocompiti (children)
      children: task?.children?.map((child, childIndex) => {
        const originalChild = originalTask.children?.[childIndex] || {};
        
        return {
          ...originalChild,
          description: child.description !== originalChild.description ? child.description : originalChild.description,
          hour: child.hour !== originalChild.hour ? child.hour : originalChild.hour,
          value: child.value !== originalChild.value ? child.value : originalChild.value,
          estimatedstart: child.estimatedstart !== originalChild.estimatedstart ? child.estimatedstart : originalChild.estimatedstart,
          estimatedend: child.estimatedend !== originalChild.estimatedend ? child.estimatedend : originalChild.estimatedend,
          assignedTo: child.assignedTo?.value || originalChild.assignedTo?.id_user,
        };
      })
    };
  });

  // Gestione delle commercial offers
  jsonObject.commercialoffers = commercialoffers.map((offer, index) => {
    const originalOffer = initialoffer.CommercialOffers?.[index] || {};
    console.log("io sono linkedtaks", offer)
    console.log("io sono linkedtaks,value", offer?.linkedTask?.value)

    return {
      ...originalOffer,
      linkedTask: offer.linkedtask || originalOffer.linkedTask?.value,
      date: offer.date !== originalOffer.date ? offer.date : originalOffer.date,
      amount: offer.amount !== originalOffer.amount ? offer.amount : originalOffer.amount
    };
  });

  console.log("Sending data:", jsonObject);

  try {
    await toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/offer/create/rev`, jsonObject),
      {
        loading: 'Creating offer...',
        success: 'Offer created successfully!',
        error: 'Error creating offer',
      }
    );

    await toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/offer/updaterev`, {
        id: initialoffer.id_offer
      }),
      {
        loading: 'Updating offer status...',
        success: 'Offer status updated!',
        error: 'Error updating offer status',
      }
    );
  } catch (error) {
    console.error('Errore nella creazione/modifica dell\'offerta:', error);
  }
};

  function FunselectedQuotationRequest(){
    let valueRight = selectedQuotationRequest?.label;
   
    
    return valueRight;
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          quotationRequestRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`),
        ]);

        //setQuotationRequest(quotationRequestRes.data.quotationrequest);
        setUsers(usersRes.data.users.map((user) => ({
          value: user.id_user,
          label: `${user.name} ${user.surname}`,
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

 
  

  return (
    <form name="createoffer" className="max-w-7xl mx-auto p-4 bg-white  rounded-lg">
    <Toaster />
    {/* Quotation Request Section */}
    <div className="border-b border-gray-900/10 pb-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Informazioni Richiesta
          </h2>
          
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
            {/* Quotation Request Inputs */}
            <div className="sm:col-span-3">
              <label htmlFor="quotationrequest" className="block text-sm font-medium text-gray-700">
                Richiesta di offerta
              </label>
              <input
                id="quotationrequest"
                name="quotationrequest"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={quotationRequest || ''}
                readOnly
              />
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="quotationrequestdescription" className="block text-sm font-medium text-gray-700">
                Descrizione RDO
              </label>
              <textarea
                id="quotationrequestdescription"
                name="quotationrequestdescription"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={quotationRequestDescri}
                onChange={(e) => setQuotationRequestDescri(e.target.value)}
              />
            </div>
          </div>
        </div>
    <table className="w-full mb-4">
      <tbody>
     
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Ore</td>
          <td className="w-2/3 p-2">
          <input
                id="hour"
                name="hour"
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={totalHours}
                readOnly
              />
          </td>
        </tr>
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Valore Totale Offerte Commerciali</td>
          <td className="w-2/3 p-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="text"
                className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={totalCommercialAmount.toFixed(2)}
                readOnly
              />
            
            </div>
          </td>
        </tr>
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Data di inizio stimata</td>
          <td className="w-2/3 p-2">
            <input
              type="date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              value={estimatedStartDate}
              readOnly
            />
          </td>
        </tr>
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Data di fine stimata</td>
          <td className="w-2/3 p-2">
            <input
              type="date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              value={estimatedEndDate}
              readOnly
            />
          </td>
        </tr>
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Descrizione</td>
          <td className="w-2/3 p-2">
            <textarea
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              rows={3}
              value= {description}
              
              onChange={(e) => setDescription(e.target.value)} 
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Tasks</h3>
      {tasks.map((task, index) => (
        <TaskRevision
          key={index}
          name={`${index + 1}`}
          task={task}
          onChange={(updatedTask) => updateTask(index, updatedTask)}

          onAddChild={() => addTask(index)}
          onRemove={() => removeTask(index)}
        />
      ))}
      <button
        type="button"
        onClick={() => addTask()}
        className="mt-2 rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6ca7c4]"
      >
        Aggiungi Task
      </button>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mt-3 leading-6 text-gray-900 mb-2">
        Offerta Commerciale
      </h3>
      
      {commercialoffers.map((offer, index) => (
        <CommercialOfferRev
          key={index}
          offer={offer}
          onChange={(updatedOffer) => updateCommercialOffer(index, updatedOffer)}
          onRemove={() => removeCommercialOffer(index)}
          tasks={tasks}
          index={index}
        />
      ))}
        <button
          type="button"
          onClick={addCommercialOffer}
          className="mt-2 rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6ca7c4]"
        >
          Aggiungi 
        </button>
      
    </div>

    <div className="flex justify-end mt-4">
      <button 
        type="submit" 
        onClick={createOffer} 
        className="rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6ca7c4]"
      >
        Crea
      </button>
    </div>
  </form>
  );
}
