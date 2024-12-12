import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Select from 'react-tailwindcss-select';
import TaskUpdate from './taskupdate';
import CommercialOfferRev from './commercialofferrev';

export default function UpdateForm({ offer }) {
  // State Initialization
  const [formData, setFormData] = useState(offer || {});
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState(null);
  const [tasks, setTasks] = useState([{ 
    name: '', 
    hour: 0, 
    value: 0, 
    assignedTo: null, 
    children: [] 
  }]);
  const [estimatedStartDate, setEstimatedStartDate] = useState(
    offer?.estimatedstart 
      ? offer.estimatedstart.split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [estimatedEndDate, setEstimatedEndDate] = useState(
    offer?.estimatedend 
      ? offer.estimatedend.split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [quotationRequestDescri, setQuotationRequestDescri] = useState('');
  const [amount, setAmount] = useState(0);
  const [hour, setHour] = useState(0);
  const [users, setUsers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [commercialoffers, setCommercialOffers] = useState([{
    linkedTask: null,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    index: 0
  }]);
  const [totalCommercialAmount, setTotalCommercialAmount] = useState(0);

  // Utility Functions
  const calculateTotals = (tasks) => {
    let totalHours = 0;
    let totalValue = 0;

    const calculate = (task) => {
      if (!task.children || task.children.length === 0) {
        totalHours += Number(task.hour || 0);
        totalValue += parseFloat(task.value || 0);
      }

      if (task.children) {
        task.children.forEach(child => {
          totalHours += Number(child.hour || 0);
          totalValue += parseFloat(child.value || 0);
        });
      }
    };

    tasks.forEach(calculate);
    return { totalHours, totalValue };
  };

  // Initialization UseEffects
  useEffect(() => {
    if (offer) {
      // Comprehensive initialization from offer object
      initializeFromOffer(offer);
    }
  }, [offer]);

  const initializeFromOffer = (offer) => {
    // Initialize Quotation Request
    if (offer.QuotationRequest) {
      const quotationRequestInitial = {
        value: offer.QuotationRequest.id_quotationrequest,
        label: `${offer.QuotationRequest.name} - ${offer.QuotationRequest.Company?.name}`
      };
      setSelectedQuotationRequest(quotationRequestInitial);
      setQuotationRequestDescri(offer.QuotationRequest.description || '');
    }

    // Initialize Team
    if (offer.team) {
      const teamMembers = offer.team.map(user => ({
        value: user.id_user,
        label: `${user.name} ${user.surname}`
      }));
      setSelectedTeam(teamMembers);
    }

    // Initialize Hours and Amount
    setHour(offer.hour || 0);
    setAmount(offer.amount || 0);

    // Initialize Dates
    setEstimatedStartDate(
      offer.estimatedstart 
        ? offer.estimatedstart.split('T')[0] 
        : new Date().toISOString().split('T')[0]
    );
    setEstimatedEndDate(
      offer.estimatedend 
        ? offer.estimatedend.split('T')[0] 
        : new Date().toISOString().split('T')[0]
    );

    // Initialize Tasks
    if (offer.Tasks && offer.Tasks.length > 0) {
      const formattedTasks = offer.Tasks.map(task => ({
        ...task,
        name: task.name || '',
        hour: task.hour || 0,
        value: task.value || 0,
        estimatedstart: task.estimatedstart 
          ? task.estimatedstart.split('T')[0] 
          : estimatedStartDate,
        estimatedend: task.estimatedend 
          ? task.estimatedend.split('T')[0] 
          : estimatedEndDate,
        assignedTo: task.assignedTo 
          ? {
              value: task.assignedTo.id_user,
              label: `${task.assignedTo.name} ${task.assignedTo.surname}`
            } 
          : null,
        children: (task.children || []).map(child => ({
          ...child,
          name: child.name || '',
          hour: child.hour || 0,
          value: child.value || 0,
          estimatedstart: child.estimatedstart 
            ? child.estimatedstart.split('T')[0] 
            : task.estimatedstart?.split('T')[0] || estimatedStartDate,
          estimatedend: child.estimatedend 
            ? child.estimatedend.split('T')[0] 
            : task.estimatedend?.split('T')[0] || estimatedEndDate,
          assignedTo: child.assignedTo 
            ? {
                value: child.assignedTo.id_user,
                label: `${child.assignedTo.name} ${child.assignedTo.surname}`
              } 
            : null
        }))
      }));
      setTasks(formattedTasks);
    }

    // Initialize Commercial Offers
    if (offer.CommercialOffers && offer.CommercialOffers.length > 0) {
      const initialCommercialOffers = offer.CommercialOffers.map((offerItem, index) => ({
        ...offerItem,
        index,
        linkedTask: offerItem.linkedTask 
          ? {
              value: offerItem.linkedTask.name,
              label: offerItem.linkedTask.name,
              estimatedend: offerItem.linkedTask.estimatedend
            } 
          : null,
        date: offerItem.date 
          ? offerItem.date.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        amount: offerItem.amount || 0,
      }));
      setCommercialOffers(initialCommercialOffers);
    }
  };

  // Data Fetching UseEffects
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

        // Filter approved quotation requests
        const filteredRequests = quotationRequestRes.data.quotationrequest
          .filter(item => item.status === "Approvata")
          .map(item => ({
            value: item.id_quotationrequest,
            label: `${item.name} - ${item.Company?.name}`,
          }));

        setQuotationRequest(filteredRequests);
        setUsers(usersRes.data.users.map((user) => ({
          value: user.id_user,
          label: `${user.name} ${user.surname}`,
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Errore nel caricamento dei dati');
      }
    };

    fetchData();
  }, []);

  // Totals Calculation UseEffects
  useEffect(() => {
    const { totalHours, totalValue } = calculateTotals(tasks);
    setTotalHours(totalHours);
    setTotalValue(totalValue);

    const commercialTotal = commercialoffers.reduce(
      (sum, offer) => sum + (offer.amount || 0), 
      0
    );
    setTotalCommercialAmount(commercialTotal);
  }, [tasks, commercialoffers]);

  // Commercial Offers Management
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

  // Form Submission Handler
  const createOffer = async (event) => {
    event.preventDefault();

    const jsonObject = {
      estimatedstart: estimatedStartDate,
      estimatedend: estimatedEndDate,
      amount: totalCommercialAmount,
      team: selectedTeam?.map((team) => team.value),
      quotationrequest: offer?.QuotationRequest?.id_quotationrequest,
      name: offer?.name,
      revision: (offer.revision + 1),
      quotationrequestdescription: quotationRequestDescri,
      
      // Commercial Offers
      commercialoffers: commercialoffers.map(offer => ({
        linkedTask: offer.linkedTask?.value || null,
        date: offer.date,
        amount: offer.amount
      })),

      // Tasks with comprehensive mapping
      tasks: tasks.map((task) => ({
        ...task,
        assignedTo: task.assignedTo?.value || null,
        estimatedstart: task.estimatedstart || estimatedStartDate,
        estimatedend: task.estimatedend || estimatedEndDate,
        children: task?.children?.map((child) => ({
          ...child,
          assignedTo: child.assignedTo?.value || null,
          estimatedstart: child.estimatedstart || task.estimatedstart || estimatedStartDate,
          estimatedend: child.estimatedend || task.estimatedend || estimatedEndDate,
        })),
      })),
    };

    try {
      await toast.promise(
        axios.post(`${process.env.REACT_APP_API_URL}/offer/update`, jsonObject),
        {
          loading: 'Creazione offerta in corso...',
          success: 'Offerta creata con successo!',
          error: 'Errore nella creazione dell\'offerta',
        }
      );
    } catch (error) {
      console.error('Errore nella creazione dell\'offerta:', error);
      toast.error('Impossibile creare l\'offerta');
    }
  };

  // Render
  return (
    <form 
      name="createoffer" 
      className="max-w-7xl mx-auto" 
      onSubmit={createOffer}
    >
      <Toaster />
      
      <div className="space-y-4">
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
                value={selectedQuotationRequest?.label || ''}
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

        {/* Commercial Details Section */}
        <div className="border-b border-gray-900/10 pb-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Dettagli Commerciali
          </h2>
          
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="hour" className="block text-sm font-medium text-gray-700">
                Ore Totali
              </label>
              <input
                id="hour"
                name="hour"
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={totalHours}
                readOnly
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Valore Totale
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  value={totalValue.toFixed(2)}
                  readOnly
                />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
                    </div>
                    </div>


                </div>
                    
            <div className="sm:col-span-3">
              <label htmlFor="estimatedstart" className="block text-sm font-medium text-gray-700">
                Data di inizio stimata
              </label>
              <input
                id="estimatedstart"
                name="estimatedstart"
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={estimatedStartDate}
                onChange={(e) => setEstimatedStartDate(e.target.value)}
              />
            </div>
    
            <div className="sm:col-span-3">
              <label htmlFor="estimatedend" className="block text-sm font-medium text-gray-700">
                Data di fine stimata
              </label>
              <input
                id="estimatedend"
                name="estimatedend"
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                value={estimatedEndDate}
                onChange={(e) => setEstimatedEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-900/10 pb-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Attività</h2>
          <div>
            { tasks.map((task, index) => (
              <TaskUpdate
                key={index}
                task={task}
                onChange={(updatedTask) => {
                  const newTasks = [...tasks];
                  newTasks[index] = updatedTask;
                  setTasks(newTasks);
                }}
                onRemove={() => {
                  const newTasks = tasks.filter((_, i) => i !== index);
                  setTasks(newTasks);
                }}
                onAddChild={() => {
                  const newTasks = [...tasks];
                  newTasks[index].children = [
                    ...(newTasks[index].children || []),
                    { name: '', hour: 0, value: 0, assignedTo: 0, children: [] }
                  ];
                  setTasks(newTasks);
                }}
                users={users}
              />
            ))} 
            <button
              type="button"
              onClick={() => setTasks([...tasks, { description: '', hour: 0, value: 0, assignedTo: '', children: [] }])}
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-[#7fb7d4] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#62a0bc] focus:outline-none focus:ring-2 focus:ring-[#62a0bc] focus:ring-offset-2"
            >
              Aggiungi Task
            </button>
          </div>
        </div>
         
       <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
            Tabella di Pianificazione
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


          {commercialoffers.length < 6 && (
            <button
              type="button"
              onClick={() => {
                addCommercialOffer();
                stampa();
              }}
              className="mt-2 rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6ca7c4]"
            >
              Aggiungi CommercialOffer
            </button>
          )}

        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-[#7fb7d4] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#62a0bc] focus:outline-none focus:ring-2 focus:ring-[#62a0bc] focus:ring-offset-2"
          >
            Revisiona Offerta
          </button>
        </div>
      </div>
    </form>
  );
}
