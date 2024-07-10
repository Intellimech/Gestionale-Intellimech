import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import TaskForm from './taskinput';

export default function UserCreateForm() {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequest, setQuotationRequest] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [chips, setChips] = useState([]);
  const [tasks, setTasks] = useState([{ name: '', duration: '', assignedTo: '', children: [] }]);

  const handleChange = (newChips) => setChips(newChips);

  const handleTeamChange = (value) => setSelectedTeam(value);

  useEffect(() => {
    const token = Cookies.get('token');
    const fetchData = async () => {
      try {
        const [
          quotationRequestRes,
          categoryRes,
          technicalAreaRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read/free`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`, { headers: { authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`, { headers: { authorization: `Bearer ${token}` } }),
        ]);

        setQuotationRequest(quotationRequestRes.data.quotationrequest);
        setCategory(categoryRes.data.categories);
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

  const handleCategoryChange = async (event) => {
    const token = Cookies.get('token');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read/${event.target.value}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      setSubcategory(response.data.subcategories);
    } catch (error) {
      console.error('Error fetching subcategory data:', error);
    }
  };

  const createOffer = async (event) => {
    event.preventDefault();
    const token = Cookies.get('token');
    const form = document.forms.createoffer;
    const formData = new FormData(form);
    const jsonObject = Object.fromEntries(formData.entries());
    jsonObject.team = selectedTeam?.map((team) => team.value);
    jsonObject.tasks = tasks; // Add tasks to the payload

    console.log('Create offer payload:', jsonObject);
    // try {
    //   await axios.post(`${process.env.REACT_APP_API_URL}/offer/create`, jsonObject, { headers: { authorization: `Bearer ${token}` } });
    //   setCreateSuccess(true);
    // } catch (error) {
    //   setErrorMessages(error.response?.data?.message || 'An error occurred');
    //   setCreateSuccess(false);
    // }
  };

  return (
    <form name="createoffer">
      {/* Account Information */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="quotationrequest" className="block text-sm font-medium leading-6 text-gray-900">
                Richiesta di offerta
              </label>
              <div className="mt-2">
                <select
                  id="quotationrequest"
                  name="quotationrequest"
                  autoComplete="company-name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                >
                  {quotationRequest.map((item) =>
                    item.status === "Approvata" && (
                      <option key={item.id_quotationrequest} value={item.id_quotationrequest}>
                        {`${item.name} - ${item.Company.name}`}
                      </option>
                    )
                  )}
                </select>
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:max-w-xs sm:text-sm"
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
                  rows={4}
                  maxLength={150}
                  name="description"
                  id="description"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Information */}
      <div className="space-y-12 py-8">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Task</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta</p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              {tasks.map((task, index) => (
                <TaskForm
                  users={users}
                  key={index}
                  task={task}
                  onChange={(newTask) => {
                    const newTasks = [...tasks];
                    newTasks[index] = newTask;
                    setTasks(newTasks);
                  }}
                  onAddChild={() => {
                    const newTasks = [...tasks];
                    newTasks[index].children.push({ name: '', duration: '', assignedTo: '', children: [] });
                    setTasks(newTasks);
                  }}
                  onRemove={() => {
                    setTasks(tasks.filter((_, i) => i !== index));
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => setTasks([...tasks, { name: '', duration: '', assignedTo: '', children: [] }])}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Quotation Request Button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        {createSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-green-800">Richiesta di offerta creata con successo</h3>
            </div>
          </div>
        )}

        {createSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <h3 className="ml-3 text-sm font-medium text-red-800">{errorMessages}</h3>
            </div>
          </div>
        )}

        <button
          onClick={createOffer}
          type="submit"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
        >
          Crea
        </button>
      </div>
    </form>
  );
}
