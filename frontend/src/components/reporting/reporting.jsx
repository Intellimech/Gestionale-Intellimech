import { useEffect, useState } from 'react';
import { ClockIcon, QueueListIcon, BriefcaseIcon, TrashIcon } from '@heroicons/react/24/outline';
import Select from "react-tailwindcss-select";
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';

import 'react-toastify/dist/ReactToastify.css';
import { use } from 'react';

export default function Reporting() {
  const [job, setJob] = useState([]);
  const [task, setTask] = useState([]);
  const [childTasks, setChildTasks] = useState([]);
  const [reportedHours, setReportedHours] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedChildTask, setSelectedChildTask] = useState(null);
  const [needJobInput, setNeedJobInput] = useState(false);
  const [needEventInput, setNeedEventInput] = useState(false);
  const [needTextInput, setNeedTextInput] = useState(false);
  const [reportingIndirect, setReportingIndirect] = useState([]);
  const [childReportingIndirect, setChildReportingIndirect] = useState([]);
  const [selectedReportingIndirect, setSelectedReportingIndirect] = useState(null);
  const [selectedChildReportingIndirect, setSelectedChildReportingIndirect] = useState(null);
  const [event, setEvent] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/reportingindirect/read`)
      .then((response) => {
        setReportingIndirect(response.data.reportingindirect || []);
      })
      .catch((error) => {
        console.error('Error fetching reporting indirect data:', error);
        toast.error('Errore nel caricamento dei dati di rendicontazione');
      });
  }, []);

  useEffect(() => {
    if (needJobInput) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/job/read`)
        .then((response) => {
          setJob(response.data.jobs || []);
        })
        .catch((error) => {
          console.error('Errore nel caricamento delle commesse:', error);
          toast.error('Errore nel caricamento delle commesse');
        });
    }
  }, [needJobInput]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/event/read`)
      .then((response) => {
        setEvent(response.data.events || []);
      })
      .catch((error) => {
        console.error('Errore nel caricamento degli eventi:', error);
        toast.error('Errore nel caricamento degli eventi');
      });
  }, [needEventInput]);

  const handleJobChange = (value) => {
    setSelectedJob(value);
    setSelectedTask(null);
    setSelectedChildTask(null);

    if (!value) {
      setTask([]);
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/task/read/${value.value}`)
      .then((response) => {
        setTask(response.data.tasks || []);
      })
      .catch((error) => {
        console.error('Error fetching task data:', error);
        toast.error('Errore nel caricamento dei task');
      });
  };

  const handleTaskChange = (value) => {
    const selectedTaskObj = task.find(t => t.id_task === value?.value);
    setSelectedTask(value);
    setSelectedChildTask(null);
    setChildTasks(selectedTaskObj?.children || []);
  };

  const handleChildTaskChange = (value) => {
    setSelectedChildTask(value);
  };

  const handleReportingIndirectChange = (value) => {
    const selectedReportingIndirectObj = reportingIndirect.find(ri => ri.id_reportingindirect === value?.value);
    setSelectedReportingIndirect(value);
    setChildReportingIndirect(selectedReportingIndirectObj?.children || []);

    setNeedJobInput(selectedReportingIndirectObj?.needJobInput || false);
    setNeedEventInput(selectedReportingIndirectObj?.needEventInput || false);
    setNeedTextInput(selectedReportingIndirectObj?.needTextInput || false);
  };

  const handleEventChange = (value) => {
    setSelectedEvent(value);
  };

  const handleChildReportingIndirectChange = (value) => {
    const selectedChildReportingIndirectObj = childReportingIndirect.find(cri => cri.id_reportingindirect === value?.value);
    setSelectedChildReportingIndirect(value);

    setNeedJobInput(selectedChildReportingIndirectObj?.needJobInput || false);
    setNeedEventInput(selectedChildReportingIndirectObj?.needEventInput || false);
    setNeedTextInput(selectedChildReportingIndirectObj?.needTextInput || false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    data.id_task = selectedChildTask?.value || selectedTask?.value;
    data.id_job = selectedJob?.value;
    data.id_reportingindirect = selectedChildReportingIndirect?.value || selectedReportingIndirect?.value;
    data.task_percentage = data.task_percentage || 0;

    console.log(data);
  };

  return (
    <main>
      <Toaster />
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Rendicontazione</h1>
          <p className="mt-2 text-sm text-gray-700">Lista richieste di offerta presenti a sistema</p>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-900">Data</label>
                  <input 
                    type="date" 
                    name="date" 
                    id="date" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring focus:ring-[#7fb7d4] focus:ring-opacity-50" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                  />
                </div>
                <div>
                  <label htmlFor="job" className="block text-sm font-medium text-gray-900">Rendicontabili</label>
                  <Select
                    options={reportingIndirect.map((ri) => ({ value: ri.id_reportingindirect, label: ri.name }))}
                    id="reportingIndirect"
                    name="reportingIndirect"
                    value={selectedReportingIndirect}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                    onChange={handleReportingIndirectChange}
                    isSearchable
                    placeholder="Seleziona un rendicontabile" 
                  />
                </div>
                {childReportingIndirect.length > 0 && (
                <div>
                  <label htmlFor="childReportingIndirect" className="block text-sm font-medium text-gray-900">Sotto Rendicontabile</label>
                  <Select
                    options={(childReportingIndirect.map(cri => ({ value: cri.id_reportingindirect, label: cri.name })) || [])}
                    id="childReportingIndirect"
                    name="childReportingIndirect"
                    value={selectedChildReportingIndirect}
                    onChange={handleChildReportingIndirectChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                    isSearchable
                    placeholder="Seleziona un sotto rendicontabile"
                    disabled={!selectedReportingIndirect}
                  />
                </div>
                )}
                {needJobInput && (
                  <>
                    <div>
                      <label htmlFor="job" className="block text-sm font-medium text-gray-900">Commesse</label>
                      <Select
                        options={job.map((job) => ({ value: job.id_job, label: job.name }))}
                        id="job"
                        name="job"
                        value={selectedJob}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                        onChange={handleJobChange}
                        isSearchable
                        placeholder="Seleziona una commessa"
                      />
                    </div>
                    {selectedJob && (
                    <div>
                      <label htmlFor="task" className="block text-sm font-medium text-gray-900">Task</label>
                      <Select
                        options={task.map((t) => ({ value: t.id_task, label: `${t.name} - ${t.description}` }))}
                        id="task"
                        name="task"
                        value={selectedTask}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                        onChange={handleTaskChange}
                        isSearchable
                        placeholder="Seleziona un task"
                        isDisabled={!selectedJob}
                      />
                    </div>
                    )}
                    {childTasks && childTasks.length > 0 && (
                      <div>
                        <label htmlFor="childTask" className="block text-sm font-medium text-gray-900">Sotto Task</label>
                        <Select
                          options={childTasks.map((t) => ({ value: t.id_task, label: `${t.name} - ${t.description}` }))}
                          id="childTask"
                          name="childTask"
                          value={selectedChildTask}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                          onChange={handleChildTaskChange}
                          isSearchable
                          placeholder="Seleziona un sotto task"
                          isDisabled={!selectedTask}
                        />
                      </div>
                    )}
                    <input type="range" name="task_percentage" id="task_percentage" min={0} max={100} step={5} defaultValue={1} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" />
                  </>
                )}

                {needEventInput && (
                  <div>
                    <label htmlFor="event" className="block text-sm font-medium text-gray-900">Evento</label>
                    <Select
                      options={event.map((event) => ({ value: event.id_event, label: event.name }))}
                      id="event"
                      name="event"
                      value={selectedEvent}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                      onChange={handleEventChange}
                      isSearchable
                      placeholder="Seleziona un evento"
                    />
                  </div>
                )}

                {needTextInput && (
                  <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-900">Descrizione</label>
                    <textarea 
                      name="text" 
                      id="text" 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring focus:ring-[#7fb7d4] focus:ring-opacity-50" 
                      required 
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-900">Ore Lavorate</label>
                  <input 
                    type="number" 
                    name="hours" 
                    id="hours" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring focus:ring-[#7fb7d4] focus:ring-opacity-50" 
                    min={1} 
                    required 
                    defaultValue={1} 
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="block ml-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
                  >
                    Invia
                  </button>
                </div>
              </div>
            </form>
          </div>
          <ol className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
            {reportedHours.length === 0 && (
              <li className="flex justify-center py-6">
                <p className="text-gray-500">Nessuna rendicontazione presente</p>
              </li>
            )}
            {reportedHours.map((report, index) => (
              <li key={index} className="relative flex space-x-6 py-6 xl:static">
                <div className="flex-auto">
                  <h3 className="text-sm font-semibold text-gray-900">{}</h3>
                  <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
                    <div className="flex items-start space-x-3">
                      <dt className="mt-0.5">
                        <span className="sr-only">Ore</span>
                        <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </dt>
                      <dd>{report.hour} ore</dd>
                    </div>
                    <div className="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5">
                      <dt className="mt-0.5">
                        <span className="sr-only">Commessa</span>
                        <BriefcaseIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </dt>
                      <dd>{report.Job.name}</dd>
                    </div>
                    <div className="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5">
                      <dt className="mt-0.5">
                        <span className="sr-only">Task</span>
                        <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </dt>
                      <dd>{report.Task.name} - {report.Task.description}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    className="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                  >
                    <TrashIcon className="h-5 w-4 text-gray-500" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}