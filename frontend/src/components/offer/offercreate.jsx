import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from 'react-tailwindcss-select';
import TaskForm from './taskinput';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState(null);
  const [tasks, setTasks] = useState([{ name: '', hours: 0, value: 0, assignedTo: '', children: [] }]);
  const [estimatedStartDate, setEstimatedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle changes for the quotation request selection
  const handleQuotationRequestChange = (value) => setSelectedQuotationRequest(value);

  const addTask = (parentIndex = null) => {
    if (parentIndex !== null) {
      const newTasks = [...tasks];
      newTasks[parentIndex].children.push({ name: '', hours: 0, value: 0, assignedTo: '', children: [] });
      setTasks(newTasks);
    } else {
      setTasks([...tasks, { name: '', hours: 0, value: 0, assignedTo: '', children: [] }]);
    }
  };

  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  const updateTask = (index, updatedTask) => setTasks(tasks.map((task, i) => (i === index ? updatedTask : task)));

  const handleTeamChange = (value) => setSelectedTeam(value);

  // Recursive function to calculate total hours and value for tasks and subtasks
  const calculateTotals = (tasks) => {
    let totalHours = 0;
    let totalValue = 0;

    const calculate = (task) => {
      totalHours += task.hours || 0;
      totalValue += task.value || 0;
      task.children.forEach((child) => calculate(child));
    };

    tasks.forEach(calculate);

    return { totalHours, totalValue };
  };

  const { totalHours, totalValue } = calculateTotals(tasks);

  // Function to calculate the minimum start date and maximum end date from tasks
  const calculateDateRange = (tasks) => {
    let minDate = null;
    let maxDate = null;

    const calculate = (task) => {
      if (task.estimatedstart) {
        const estimatedstart = new Date(task.estimatedstart);
        if (!minDate || estimatedstart < minDate) {
          minDate = estimatedstart;
        }
      }
      if (task.estimatedend) {
        const estimatedend = new Date(task.estimatedend);
        if (!maxDate || estimatedend > maxDate) {
          maxDate = estimatedend;
        }
      }
      task.children.forEach((child) => calculate(child));
    };

    tasks.forEach(calculate);

    return { minDate, maxDate };
  };

  // Function to collect all assigned users from tasks and subtasks
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
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`,),
          axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, ),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`, ),
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
    jsonObject.team = selectedTeam?.map((team) => team.value);
    jsonObject.quotationrequest = selectedQuotationRequest?.value;
    jsonObject.tasks = tasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo?.value || null,
      children: task.children.map((child) => ({
        ...child,
        assignedTo: child.assignedTo?.value || null,
      })),
    }));
  
    console.log("Sending data:", jsonObject); // Aggiungi questo log
  
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/offer/create`, jsonObject,),
      {
        loading: 'Modifica in corso...',
        success: 'Offerta modificata con successo!',
        error: 'Errore durante la modifica dell\'offerta',
      }
    ).catch((error) => {
      console.error('Errore nella creazione dell\'offerta:', error);
    });
  };
  
  return (
    <form name="createoffer" className="max-w-7xl mx-auto">
    <Toaster />
    
    <div className="space-y-4">
      <div className="border-b border-gray-900/10 pb-4">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Crea una nuova offerta</p>
        
        <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6"> {/* Griglia su 6 colonne */}
  
          {/* Richiesta di offerta */}
          <div className="sm:col-span-3"> {/* Larghezza 3 colonne su 6 */}
            <label htmlFor="quotationrequest" className="block text-sm font-medium text-gray-700">
              Richiesta di offerta
            </label>
            <Select
              id="quotationrequest"
              name="quotationrequest"
              className="mt-1"
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
          </div>
  
          {/* Ore */}
          <div className="sm:col-span-1"> {/* Larghezza 1 colonna */}
            <label htmlFor="hour" className="block text-sm font-medium text-gray-700">Ore</label>
            <input
              id="hour"
              name="hour"
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              value={totalHours}
              readOnly
            />
          </div>
  
          {/* Valore */}
          <div className="sm:col-span-2"> {/* Larghezza 2 colonne */}
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valore</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">€</span>
              </div>
              <input
                type="text"
                name="amount"
                id="amount"
                className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                placeholder="0.00"
                value={totalValue}
                readOnly
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
              </div>
            </div>
          </div>
  
          {/* Data di inizio stimata */}
          <div className="sm:col-span-3"> {/* Larghezza 3 colonne */}
            <label htmlFor="estimatedstart" className="block text-sm font-medium text-gray-700">
              Data di inizio stimata
            </label>
            <input
              id="estimatedstart"
              name="estimatedstart"
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              value={estimatedStartDate}
              readOnly
            />
          </div>
  
          {/* Data di fine stimata */}
          <div className="sm:col-span-3"> {/* Larghezza 3 colonne */}
            <label htmlFor="estimatedend" className="block text-sm font-medium text-gray-700">
              Data di fine stimata
            </label>
            <input
              id="estimatedend"
              name="estimatedend"
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
              value={estimatedEndDate}
              readOnly
            />
          </div>
  
          {/* Descrizione - Occupare tutte le colonne */}
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrizione</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
            />
          </div>
        </div>
      </div>
  
      {/* Tasks Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Tasks</h3>
        {tasks.map((task, index) => (
          <TaskForm
            key={index}
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
  
      <div className="flex justify-end mt-4">
        <button 
          type="submit" 
          onClick={createOffer} 
          className="rounded-md bg-[#7fb7d4] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6ca7c4]"
        >
          Crea
        </button>
      </div>
    </div>
  </form>
  
  );
}
