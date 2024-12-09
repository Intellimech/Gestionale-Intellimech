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

export default function RevisionForm({offer}) {
  const [formData, setFormData] = useState(offer);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState({
    value: offer?.quotationrequest,
    label:`${ offer?.QuotationRequest?.name} - ${capitalizeAfterPeriodAndFirstLetter(offer?.QuotationRequest?.Company?.name)}`,
  });
  const [tasks, setTasks] = useState(offer?.tasks || [{ name: '', hour: 0, value: 0, assignedTo: '', children: [] }]);
  const [estimatedStartDate, setEstimatedStartDate] = useState(offer?.estimatedstart || new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(offer?.estimatedend || new Date().toISOString().split('T')[0]);
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [amount, setAmount] = useState(offer?.amount || '');
  const [quotationRequestDescri, setQuotationRequestDescri] = useState(offer?.QuotationRequest?.description);
  const [hour, setHour] = useState(offer?.hour || '');
  const [users, setUsers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  
const [commercialoffers, setCommercialOffers] = useState(() => {
  if (offer?.CommercialOffers?.length > 0) {
    return offer.CommercialOffers.map((offerItem, index) => ({
      ...offerItem,
      index,
      linkedTask: offerItem.linkedTask ? {
        value: offerItem.linkedTask.name,
        label: offerItem.linkedTask.name,
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
    if (offer) {
      setFormData(offer);
      

      // Inizializza Team
      if (offer.team) {
        const teamMembers = offer.team.map(user => ({
          value: user.id_user,
          label: `${user.name} ${user.surname}`
        }));
        setSelectedTeam(teamMembers);
      }
      
      // Inizializza ore e importo
      setHour(offer.hour || '');
      setAmount(offer.amount || '');

      // Inizializza Date
      if (offer.estimatedstart) {
        setEstimatedStartDate(offer.estimatedstart.split('T')[0]);
      }
      if (offer.estimatedend) {
        setEstimatedEndDate(offer.estimatedend.split('T')[0]);
      }

      // Inizializza Tasks
      if (offer.Tasks && offer.Tasks.length > 0) {
        const formattedTasks = offer.Tasks.map(task => ({
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
  }, [offer]);

  
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
      
          // Check the structure of the data
          console.log('Quotation Requests:', quotationrequest);
          console.log('Users:', users);

            try {
              const response = await axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`);
              const filteredRequests = response.data.quotationrequest.filter(item => item.status === "Approvata");
              setQuotationRequest(filteredRequests.map(item => ({
                value: item.id_quotationrequest,
                label: `${item.name} - ${item.Company?.name}`,
              })));
            } catch (error) {
              console.error('Error fetching data:', error);
            }
          
          
      
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

  useEffect(() => {
    const fetchQuotationRequests = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`);
            const filteredRequests = response.data.quotationrequest.filter(item => item.status === "Approvata");
            
            // Set the filtered quotation requests
            const formattedRequests = filteredRequests.map(item => ({
                value: item.id_quotationrequest,
                label: `${item.name} - ${item.Company?.name}`,
            }));
            setQuotationRequest(formattedRequests);

            // Check if selectedQuotationRequest's value matches any fetched request
            if (selectedQuotationRequest) {
                const matchingRequest = formattedRequests.find(request => request.value === selectedQuotationRequest.value);
                if (matchingRequest) {
                    // Update selectedQuotationRequest with the correct label
                    setSelectedQuotationRequest(matchingRequest);
                } else {
                    // If no match found, set selectedQuotationRequest to null
                    setSelectedQuotationRequest(null);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchQuotationRequests();
}, []); // Ensure this runs only once on mount


  const handleInputChange = (name, value) => {
    // Confronta il valore nuovo con quello nel formData
    if (formData[name] !== value) {
      setFormData((prev) => ({
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
    const newTask = { description: '', hour: 0, value: 0, assignedTo: '', children: [] };
    if (parentIndex !== null) {
      const newTasks = [...tasks];
      newTasks[parentIndex].children.push(newTask);
      setTasks(newTasks);
    } else {
      setTasks([...tasks, newTask]);
    }
  };
// Modifica la funzione calculateTotals
const calculateTotals = (tasks) => {
  let totalHours = 0;
  let totalValue = 0;

  const calculate = (task) => {
    // Se il task ha dei figli, non sommare i suoi valori diretti
    if (!task.children || task.children.length === 0) {
      totalHours += Number(task.hour || task.hour || 0);
      // Assicurati che il valore sia convertito in numero e gestisci i valori null/undefined
      totalValue += parseFloat(task.value || 0);
    }

    // Somma ricorsivamente i valori dei figli
    if (task.children) {
      task.children.forEach(child => {
        totalHours += Number(child.hour || child.hour || 0);
        totalValue += parseFloat(child.value || 0);
      });
    }
  };

  tasks.forEach(calculate);
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
  event.preventDefault();

  const form = document.forms.createoffer;
  const formData = new FormData(form);
  const jsonObject = Object.fromEntries(formData.entries());
  
  // Aggiungi esplicitamente le date al jsonObject
  jsonObject.estimatedstart = estimatedStartDate;
  jsonObject.estimatedend = estimatedEndDate;
  jsonObject.amount=totalCommercialAmount;
  jsonObject.team = selectedTeam?.map((team) => team.value);
  jsonObject.quotationrequest = selectedQuotationRequest?.value;
  jsonObject.quotationrequestdescription= quotationRequestDescri;
  jsonObject.name= offer?.name;
  jsonObject.revision = (offer.revision + 1)
  // Aggiungi i dati delle commercial offers
  jsonObject.commercialoffers = commercialoffers.map(offer => ({
    linkedTask: offer.linkedTask?.value || null,
    date: offer.date,
    amount: offer.amount
  }));

  // Aggiungi i tasks come prima, con le date
  jsonObject.tasks = tasks.map((task) => ({
    ...task,
    assignedTo: task.assignedTo?.value || null,
    estimatedstart: task.estimatedstart || estimatedStartDate,
    estimatedend: task.estimatedend || estimatedEndDate,
    children: task.children.map((child) => ({
      ...child,
      assignedTo: child.assignedTo?.value || null,
      estimatedstart: child.estimatedstart || task.estimatedstart || estimatedStartDate,
      estimatedend: child.estimatedend || task.estimatedend || task.estimatedEndDate,
    })),
  }));

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
  } catch (error) {
    console.error('Errore nella creazione dell\'offerta:', error);
  }

  try {
      await toast.promise(
        axios.post(`${process.env.REACT_APP_API_URL}/offer/updaterev`, {
          id: offer.id_offer // Invia l'ID come oggetto
        }),
        {
          loading: 'Creating offer...',
          success: 'Offer created successfully!',
          error: 'Error creating offer',
        }
      );
    } catch (error) {
      console.error('Errore nella modifica dell\'offerta:', error);
    } console.log(offer.id_offer);
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

        setQuotationRequest(quotationRequestRes.data.quotationrequest);
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
    
    <table className="w-full mb-4">
      <tbody>
        <tr>
          <td className="w-1/3 p-2 text-left font-medium">Richiesta di offerta</td>
          <td className="w-2/3 p-2">
            <Select
              id="quotationrequest"
              name="quotationrequest"
              value={selectedQuotationRequest}
              onChange={handleQuotationRequestChange}
              options={quotationRequest
                .filter((item) => item.status === "Approvata")
                .map((item) => ({
                  value: item.id_quotationrequest,
                  label: `${item.name} - ${item.Company.name}`,
                }))}
              placeholder="Select..."
              isClearable
            />
          </td>
        </tr>
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
          users={users}
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
          commercialOffer={offer}
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
