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
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState(null);
  const [tasks, setTasks] = useState([{ name: '', duration: '', assignedTo: '', children: [] }]);

  // Handle changes for the quotation request selection
  const handleQuotationRequestChange = (value) => setSelectedQuotationRequest(value);

  // Handle changes for the team selection
  const handleTeamChange = (value) => setSelectedTeam(value);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const [
          quotationRequestRes,
          technicalAreaRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read/free`,),
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

  // Handles offer creation
  const createOffer = async (event) => {
    event.preventDefault();
    
    const form = document.forms.createoffer;
    const formData = new FormData(form);
    const jsonObject = Object.fromEntries(formData.entries());
    jsonObject.team = selectedTeam?.map((team) => team.value);
    jsonObject.quotationrequest = selectedQuotationRequest?.value; // Set the selected quotation request
    jsonObject.tasks = tasks;

    console.log('Create offer payload:', jsonObject);
    
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/offer/create`, jsonObject,),
      {
        loading: 'Creazione in corso...',
        success: 'Offerta creata con successo!',
        error: 'Errore durante la creazione dell\'offerta',
      }
    )
    .then((response) => {
      console.log('Offerta creata:', response);
    })
    .catch((error) => {
      console.error('Errore nella creazione dell\'offerta:', error);
    });
  };

  return (
    <form name="createoffer">
      <Toaster/>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="quotationrequest" className="block text-sm font-medium leading-6 text-gray-900">
                Richiesta di offerta
              </label>
              <div className="mt-2">
                <Select
                  id="quotationrequest"
                  name="quotationrequest"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
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
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="hour" className="block text-sm font-medium leading-6 text-gray-900">
                Ore
              </label>
              <div className="mt-2">
                <input
                  id="hour"
                  name="hour"
                  type="number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                Valore
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  placeholder="0.00"
                  aria-describedby="price-currency"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm" id="price-currency">
                    EUR
                  </span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="team" className="block text-sm font-medium leading-6 text-gray-900">
                Team
              </label>
              <div className="mt-2">
                <Select
                  id="team"
                  name="team"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                  value={selectedTeam}
                  onChange={handleTeamChange}
                  isMultiple={true}
                  options={users}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="estimatedstart" className="block text-sm font-medium leading-6 text-gray-900">
                Data di inizio stimata
              </label>
              <div className="mt-2">
                <input
                  id="estimatedstart"
                  name="estimatedstart"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const endDateInput = document.getElementById('estimatedend');
                    if (endDateInput.value < e.target.value) {
                      endDateInput.value = e.target.value;
                    }
                    endDateInput.min = e.target.value;
                  }}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="estimatedend" className="block text-sm font-medium leading-6 text-gray-900">
                Data di fine stimata
              </label>
              <div className="mt-2">
                <input
                  id="estimatedend"
                  name="estimatedend"
                  type="date"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Descrizione
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
                />
              </div>
            </div>

            <div className="col-span-full">
              <TaskForm tasks={tasks} setTasks={setTasks} users={users} />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        {createSuccess === false && (
          <span className="flex items-center text-red-600">
            <XCircleIcon className="h-6 w-6" aria-hidden="true" />
            <span className="ml-2 text-sm">{errorMessages}</span>
          </span>
        )}
        {createSuccess === true && (
          <span className="flex items-center text-green-600">
            <CheckBadgeIcon className="h-6 w-6" aria-hidden="true" />
            <span className="ml-2 text-sm">Offer created successfully!</span>
          </span>
        )}
        <button
          type="submit"
          className="rounded-md bg-[#70b4e0] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3b82aa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#66a2bc]"
          onClick={createOffer}
        >
          Crea Offerta
        </button>
      </div>
    </form>
  );
}
