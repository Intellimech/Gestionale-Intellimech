import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon , PencilIcon} from '@heroicons/react/20/solid';
import Select from 'react-tailwindcss-select';
// import TaskUpdate from './taskupdate';
import toast, { Toaster } from 'react-hot-toast';

export default function UpdateForm({offer}) {
  const [formData, setFormData] = useState(offer);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState({
    value: offer?.quotationrequest,
    label:`${ offer?.quotationRequest?.name} - ${ offer?.quotationRequest?.Company?.name}`,
  });
  const [tasks, setTasks] = useState(offer?.tasks || [{ name: '', hours: 0, value: 0, assignedTo: '', children: [] }]);
  const [estimatedStartDate, setEstimatedStartDate] = useState(offer?.estimatedstart || new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(offer?.estimatedend || new Date().toISOString().split('T')[0]);
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [amount, setAmount] = useState(offer?.amount || '');
  const [hour, setHour] = useState(offer?.hour || '');
  const [users, setUsers] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

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
          
          
      
          setCategories(categories);
          setTechnicalAreas(technicalareas);
          setUsers(users.map(({ id_user, name, surname }) => ({
            value: id_user,
            label: `${name} ${surname}`
          })));
          
          setCompanies(companies.map(({ id_company, name }) => ({
            value: id_company,
            label: name
          })));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      
    fetchData();
  }, []);
  
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
    const newTask = { name: '', hours: 0, value: 0, assignedTo: '', children: [] };
    if (parentIndex !== null) {
      const newTasks = [...tasks];
      newTasks[parentIndex].children.push(newTask);
      setTasks(newTasks);
    } else {
      setTasks([...tasks, newTask]);
    }
  };

  useEffect(() => {
    // Function to calculate totals
    const calculateTotals = () => {
      let totalHours = 0;
      let totalValue = 0;

      const calculate = (task) => {
        totalHours += task.hours || 0;
        totalValue += task.value || 0;
        if (task.children) {
          task.children.forEach(calculate);
        }
      };

      tasks.forEach(calculate);
      setTotalHours(totalHours);
      setTotalValue(totalValue);
    };

    // Recalculate totals whenever tasks change
    calculateTotals();
  }, [tasks]);

  const createOffer = async (event) => {
    event.preventDefault();
  
    // Verifica se sono stati modificati i valori o meno
    const finalHour = hour !== offer.hour ? hour : offer.hour;
    const finalAmount = amount !== offer.amount ? amount : offer.amount;
    const finalTasks = tasks.map((task, index) => ({
      name: task.name,
      hours: task.hours || task.hour,
      value: task.value,
      startDate: task.estimatedstart || task.startDate,
      endDate: task.estimatedend || task.endDate,
      assignedTo: task.assignedTo?.value || task.assignedTo,
      children: (task.children || []).map((child) => ({
        name: child.name,
        hours: child.hours || child.hour,
        value: child.value,
        startDate: child.estimatedstart || child.startDate,
        endDate: child.estimatedend || child.endDate,
        assignedTo: child.assignedTo?.value || child.assignedTo,
      })),
    }));
  
    const jsonObject = {
      amount: finalAmount,
      hour: finalHour,
      name: offer?.name,
      estimatedstart: estimatedStartDate,
      estimatedend: estimatedEndDate,
      quotationrequest: selectedQuotationRequest?.value || null,
      revision: (offer.revision + 1),
      team: selectedTeam?.map((team) => team.value) || [],
      tasks: finalTasks,
    };
  
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
    
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('Offer ID:', offer.id_offer);
   
      if (offer.id_offer) {
        await toast.promise(
          axios.post(`${process.env.REACT_APP_API_URL}/offer/updaterev`, {
            id: offer.id_offer // Invia l'ID come oggetto
          }),
          {
            loading: 'Updating current offer status...',
            success: 'Current offer status updated successfully!',
            error: 'Error updating current offer status',
          }
        );
      }
    } catch (error) {
      console.error('Error in offer revision process:', error);
      toast.error('Error occurred during the revision process');
    }
  };

  function FunselectedQuotationRequest(){
    let valueRight = selectedQuotationRequest;
   
        console.log("val:" +selectedQuotationRequest.name);
    
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
    <form name="createoffer" className="max-w-7xl mx-auto" onSubmit={createOffer}>
      <Toaster />
      
      <div className="space-y-4">
        <div className="border-b border-gray-900/10 pb-4">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Crea una nuova offerta</p>
          
           
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="quotationrequest" className="block text-sm font-medium text-gray-700">
                Richiesta di offerta
              </label>
              <div className="mt-2">
              <Select
                id="quotationrequest"
                name="quotationrequest"
                className="mt-1"
                value={FunselectedQuotationRequest()}
                onChange={handleQuotationRequestChange}
                options={quotationRequest
                  .filter((item) => item.status === "Approvata")
                  .map((item) => ({
                    value: item.id_quotationrequest,
                    label: `${item.name} - ${item.Company?.name}`
                  }))}
               
                isClearable
                isSearchable
              />
                  </div>
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
            {/* {tasks.map((task, index) => (
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
                    { name: '', hours: 0, value: 0, assignedTo: '', children: [] }
                  ];
                  setTasks(newTasks);
                }}
                users={users}
              />
            ))} */}
            <button
              type="button"
              onClick={() => setTasks([...tasks, { name: '', hours: 0, value: 0, assignedTo: '', children: [] }])}
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-[#7fb7d4] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#62a0bc] focus:outline-none focus:ring-2 focus:ring-[#62a0bc] focus:ring-offset-2"
            >
              Aggiungi Task
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-[#7fb7d4] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#62a0bc] focus:outline-none focus:ring-2 focus:ring-[#62a0bc] focus:ring-offset-2"
          >
            Modifica Offerta
          </button>
        </div>
      </div>
    </form>
  );
}
