import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from 'react-tailwindcss-select';
import TaskForm from './taskinput';
import CommercialOfferForm from './commercialofferinput';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
 
  
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState(null);
  const [tasks, setTasks] = useState([{ 
    description: '', 
    hours: 0, 
    value: 0, 
    assignedTo: '', 
    estimatedstart: new Date().toISOString().split('T')[0],
    estimatedend: new Date().toISOString().split('T')[0],
    children: [] 
  }]);

   
  const [commercialoffers, setCommercialOffers] = useState([{
    linkedTask: null,
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    index: 0
  }]);
  
  const [estimatedStartDate, setEstimatedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleQuotationRequestChange = (value) => setSelectedQuotationRequest(value);
 // Functions to manage commercial offers


  // Add new state for total commercial offer amount
  const [totalCommercialAmount, setTotalCommercialAmount] = useState(0);

  // Update the recalculateTotals function to include commercial offers
  const recalculateTotals = () => {
    // Calculate task totals
    const { totalHours, totalValue } = calculateTotals(tasks);
    setTotalHours(totalHours);
    setTotalValue(totalValue);

    // Calculate commercial offers total
    const commercialTotal = commercialoffers.reduce((sum, offer) => sum + (offer.amount || 0), 0);
    setTotalCommercialAmount(commercialTotal);
  };

  // Update useEffect to watch for changes in both tasks and commercial offers
  useEffect(() => {
    recalculateTotals();
  }, [tasks, commercialoffers]);

  // Update the commercial offer handlers
  const addCommercialOffer = () => {
   
      const newOffer = {
        linkedTask: null,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        index: commercialoffers.length
      };
      setCommercialOffers([...commercialoffers, newOffer]);
    
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


  const updateTask = (index, updatedTask) => {
    const newTasks = tasks.map((task, i) => (i === index ? updatedTask : task));
    setTasks(newTasks);
    recalculateTotalsAndDates(newTasks);
  };
  
  const removeTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    recalculateTotalsAndDates(newTasks);
  };
  
  const recalculateTotalsAndDates = (tasks) => {
    const { totalHours, totalValue } = calculateTotals(tasks);
    const { minDate, maxDate } = calculateDateRange(tasks);
  
    setTotalHours(totalHours);
    setTotalValue(totalValue);
  
    if (minDate) setEstimatedStartDate(minDate.toISOString().split('T')[0]);
    if (maxDate) setEstimatedEndDate(maxDate.toISOString().split('T')[0]);
  };
  
  useEffect(() => {
    recalculateTotalsAndDates(tasks);
  }, [tasks]);
  
  const handleTeamChange = (value) => setSelectedTeam(value);
  
  const calculateTotals = (tasks) => {
    let totalHours = 0;
    let totalValue = 0;
  
    const calculate = (task) => {
      if (task.children && task.children.length > 0) {
        task.hours = 0;
        task.value = 0;
      }
  
      totalHours += task.hours || 0;
      totalValue += task.value || 0;
  
      task?.children.forEach((child) => calculate(child));
    };
  
    tasks.forEach(calculate);
  
    return { totalHours, totalValue };
  };
  
  const calculateDateRange = (tasks) => {
    let minDate = null;
    let maxDate = null;

    const calculate = (task) => {
      if (task.estimatedstart) {
        const startDate = new Date(task.estimatedstart);
        if (!isNaN(startDate.getTime())) {
          if (!minDate || startDate < minDate) {
            minDate = startDate;
          }
        }
      }
      if (task.estimatedend) {
        const endDate = new Date(task.estimatedend);
        if (!isNaN(endDate.getTime())) {
          if (!maxDate || endDate > maxDate) {
            maxDate = endDate;
          }
        }
      }
      if (task.children && task.children.length > 0) {
        task.children.forEach(child => calculate(child));
      }
    };

    tasks.forEach(calculate);

    return { 
      minDate: minDate || new Date(), 
      maxDate: maxDate || new Date() 
    };
  };

  const collectAssignedUsers = (tasks) => {
    const assignedUsers = new Set();

    const collect = (task) => {
      if (task.assignedTo) {
        assignedUsers.add(task.assignedTo.value);
      }
      task.children.forEach((child) => collect(child));
    };

    tasks.forEach(collect);

    return Array.from(assignedUsers).map((userId) => {
      const user = users.find((user) => user.value === userId);
      return user ? { value: user.value, label: user.label } : null;
    }).filter(Boolean);
  };

  useEffect(() => {
    const { minDate, maxDate } = calculateDateRange(tasks);
    if (minDate) setEstimatedStartDate(minDate.toISOString().split('T')[0]);
    if (maxDate) setEstimatedEndDate(maxDate.toISOString().split('T')[0]);

    const assignedUsers = collectAssignedUsers(tasks);
    setSelectedTeam(assignedUsers);
  }, [tasks, users]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          quotationRequestRes,
          technicalAreaRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`),
        ]);

        setQuotationRequest(quotationRequestRes.data.quotationrequest);
        setTechnicalArea(technicalAreaRes.data.technicalareas);
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

  const createOffer = async (event) => {
    event.preventDefault();
  
    const form = document.forms.createoffer;
    const formData = new FormData(form);
    const jsonObject = Object.fromEntries(formData.entries());
    
    // Aggiungi esplicitamente le date al jsonObject
    jsonObject.estimatedstart = estimatedStartDate;
    jsonObject.estimatedend = estimatedEndDate;
    jsonObject.amount=totalCommercialAmount;
    jsonObject.hour=totalHours;
    jsonObject.team = selectedTeam?.map((team) => team.value);
    jsonObject.quotationrequest = selectedQuotationRequest?.value;
  
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
  
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/offer/create`, jsonObject),
      {
        loading: 'Creazione in corso...',
        success: 'Offerta creata con successo!',
        error: 'Errore durante la creazione dell\'offerta',
      }
    ).catch((error) => {
      console.error('Errore nella creazione dell\'offerta:', error);
    });
  };
  
  
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
        <TaskForm
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
        Tabella di Pianificazione
      </h3>
      
      {commercialoffers.map((offer, index) => (
        <CommercialOfferForm
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
