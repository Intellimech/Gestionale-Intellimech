import { useEffect, useState, useContext } from 'react';
import { ClockIcon, QueueListIcon, BriefcaseIcon, TrashIcon } from '@heroicons/react/24/outline';
import Select from "react-tailwindcss-select";
import axios from 'axios';
import Cookies from 'js-cookie';
import toast, { Toaster } from 'react-hot-toast';
import { UserContext } from '../../module/userContext'

import 'react-toastify/dist/ReactToastify.css';

export default function Reporting() {
  const [job, setJob] = useState([]);
  const [task, setTask] = useState([]);
  const [childTasks, setChildTasks] = useState([]);
  const [reportedHours, setReportedHours] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedChildTask, setSelectedChildTask] = useState(null);
  const [reportingIndirect, setReportingIndirect] = useState([]);
  const [childReportingIndirect, setChildReportingIndirect] = useState([]);
  const [selectedReportingIndirect, setSelectedReportingIndirect] = useState(null);
  const [selectedChildReportingIndirect, setSelectedChildReportingIndirect] = useState(null);
  const [event, setEvent] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [company, setCompany] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [certification, setCertification] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState(null);

  const [percentage, setPercentage] = useState(0);

  const [needJobInput, setNeedJobInput] = useState(false);
  const [needEventInput, setNeedEventInput] = useState(false);
  const [needTextInput, setNeedTextInput] = useState(false);
  const [textInputPlaceholder, setTextInputPlaceholder] = useState('');
  const [needCompanyInput, setNeedCompanyInput] = useState(false);
  const [needCertificationInput, setNeedCertificationInput] = useState(false);

  const user = useContext(UserContext)?.user;
  const fetchReportedHours = (selectedDate) => {
    const formattedDate = selectedDate 
      ? (selectedDate instanceof Date 
        ? selectedDate.toISOString().split('T')[0] 
        : selectedDate) 
      : new Date().toISOString().split('T')[0];

    axios
      .get(`${process.env.REACT_APP_API_URL}/reporting/read`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
        params: {
          date: formattedDate,
        },
      })
      .then((response) => {
        setReportedHours(response.data.reporting || []);
      })
      .catch((error) => {
        console.error('Error fetching reported hours:', error);
        
        if (error.response) {
          if (error.response.status === 404) {
            toast.info('Nessuna rendicontazione trovata per la data selezionata');
            setReportedHours([]); 
          } else {
            toast.error('Errore nel caricamento delle ore rendicontate');
          }
        } else if (error.request) {
          toast.error('Nessuna risposta dal server');
        } else {
          toast.error('Errore nella richiesta');
        }
      });
  };

  useEffect(() => {
    
    fetchReportedHours(); // Fetch today's reported hours by default

    // if (!user.location.canReport) {
    //   console.log('User is not allowed to report hours');
    //   toast.error('Non sei autorizzato a rendicontare le ore');
    // }

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
        setEvent(response.data.events.filter((event) => event.eventtype == selectedChildReportingIndirect?.label) || []);
      })
      .catch((error) => {
        console.error('Errore nel caricamento degli eventi:', error);
        toast.error('Errore nel caricamento degli eventi');
      });
  }, [needEventInput, selectedChildReportingIndirect]);  

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/company/read`, { params: { filter: 'client' } })
    .then((response) => {
      setCompany(response.data.value.map((item) => ({
        value: item.id_company,
        label:  `${item.name} `,
      })));
    })
    .catch((error) => console.error('Error fetching company data:', error));
  }, [needCompanyInput]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/certification/read`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
      .then((response) => {
        setCertification(response.data.certifications || []);
      })
      .catch((error) => {
        console.error('Error fetching certification data:', error);
        toast.error('Errore nel caricamento delle certificazioni');
      });
  }, [needCertificationInput]);

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

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
  };

  const handleTaskChange = (value) => {
    const selectedTaskObj = task.find(t => t.id_task === value?.value);
    setSelectedTask(value);
    setPercentage(selectedTaskObj?.percentage || 0);
    setSelectedChildTask(null);
    setChildTasks(selectedTaskObj?.children || []);
  };

  const handleChildTaskChange = (value) => {
    const selectedChildTaskObj = childTasks.find(t => t.id_task === value?.value);
    setSelectedChildTask(value);
    setPercentage(selectedChildTaskObj?.percentage || 0);
  };

  const handleReportingIndirectChange = (value) => {
    const selectedReportingIndirectObj = reportingIndirect.find(ri => ri.id_reportingindirect === value?.value);
    setSelectedReportingIndirect(value);

    setChildReportingIndirect(selectedReportingIndirectObj?.children || []);

    setNeedJobInput(selectedReportingIndirectObj?.needJobInput || false);
    setNeedEventInput(selectedReportingIndirectObj?.needEventInput || false);
    setNeedTextInput(selectedReportingIndirectObj?.needTextInput || false);
    setTextInputPlaceholder(selectedReportingIndirectObj?.TextInputName || '');
    setNeedCompanyInput(selectedReportingIndirectObj?.needCompanyInput || false);
    setNeedCertificationInput(selectedReportingIndirectObj?.needCertificationInput || false);
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
    setTextInputPlaceholder(selectedChildReportingIndirectObj?.TextInputName || '');
    setNeedCompanyInput(selectedChildReportingIndirectObj?.needCompanyInput || false);
    setNeedCertificationInput(selectedChildReportingIndirectObj?.needCertificationInput || false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    data.date = date;
    data.id_task = selectedChildTask?.value || selectedTask?.value;
    data.id_job = selectedJob?.value;
    data.id_reportingindirect = selectedChildReportingIndirect?.value || selectedReportingIndirect?.value;
    data.task_percentage = data.task_percentage || 0;
    data.id_event = selectedEvent?.value;
    data.id_company = selectedCompany?.value;
    data.hours = parseFloat(data.hours);
    data.id_certification = selectedCertification?.value;

    axios
      .post(`${process.env.REACT_APP_API_URL}/reporting/create`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
      .then((response) => {
        toast.success('Rendicontazione inviata con successo');
        fetchReportedHours(date); // Refresh reported hours after submission
      })
      .catch((error) => {
        console.error('Error creating reporting:', error);
        toast.error('Errore nell\'invio della rendicontazione');
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/reporting/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      })
      .then((response) => {
        toast.success('Rendicontazione eliminata con successo');
        fetchReportedHours(date); // Refresh reported hours after deletion
      })
      .catch((error) => {
        console.error('Error deleting reporting:', error);
        toast.error('Errore nell\'eliminazione della rendicontazione');
      });
  };
  return (
    <main>
      <Toaster />
      {user.location.canReport ? (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Rendicontazione</h1>
          <p className="mt-2 text-sm text-gray-700">Lista richieste di offerta presenti a sistema</p>
        </div>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                <div className="col-span-1">
                  <label htmlFor="date" className="block text-left text-sm font-medium text-gray-900 mb-1">Data</label>
                  <input 
                    type="date" 
                    name="date" 
                    id="date" 
                    value={date}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      setDate(selectedDate);
                      setReportedHours([]);
                      fetchReportedHours(selectedDate);
                    }}
                    className="w-full rounded-md border-gray-300 text-left shadow-sm focus:border-[#7fb7d4] focus:ring focus:ring-[#7fb7d4] focus:ring-opacity-50" 
                    required 
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="job" className="block text-left text-sm font-medium text-gray-900 mb-1">Reparto / Attività</label>
                  <Select
                    options={reportingIndirect.map((ri) => ({ value: ri.id_reportingindirect, label: ri.name }))}
                    id="reportingIndirect"
                    name="reportingIndirect"
                    value={selectedReportingIndirect}
                    className="w-full text-left"
                    onChange={handleReportingIndirectChange}
                    isSearchable
                    placeholder="Seleziona un rendicontabile" 
                  />
                </div>{childReportingIndirect.length > 0 && (
                <div>
                  <label htmlFor="childReportingIndirect" className="block text-sm font-medium text-gray-900">Attività di Dettaglio</label>
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
                {needCompanyInput && (
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-900">Azienda</label>
                    <Select
                      options={company}
                      id="company"
                      name="company"
                      value={selectedCompany}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                      onChange={handleCompanyChange}
                      isSearchable
                      placeholder="Seleziona un'azienda"
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
                      options={task.map((t) => ({ 
                        value: t.id_task, 
                        label: `${t.name} - ${t.description.length >= 60 ? t.description.substring(0, 60) + '...' : t.description}`
                      }))}
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
                          options={childTasks.map((t) => ({ 
                            value: t.id_task, 
                            label: `${t.name} - ${t.description.length >= 60 ? t.description.substring(0, 60) + '...' : t.description}`
                          }))}
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
                    {selectedTask && (
                      <div>
                      <label htmlFor="task_percentage" className="block text-sm font-medium text-gray-900">Percentuale di completamento {percentage}%</label>
                        <input 
                          type="range" 
                          name="task_percentage" 
                          id="task_percentage" 
                          value={percentage}
                          min={0} 
                          max={100} 
                          step={5} 
                          defaultValue={percentage} 
                          onChange={(e) => setPercentage(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" 
                        /> 
                      </div>      
                    )}           
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
                      id="textinput" 
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                      placeholder={textInputPlaceholder}
                      required 
                    />
                  </div>
                )}

                {needCertificationInput && (
                  <div>
                    <label htmlFor="certification" className="block text-sm font-medium text-gray-900">Certificazione</label>
                    <Select
                      options={certification.map((cert) => ({ value: cert.id_certification, label: cert.name }))}
                      id="certification"
                      name="certification"
                      value={selectedCertification}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                      onChange={(value) => setSelectedCertification(value)}
                      isSearchable
                      placeholder="Seleziona una certificazione"
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
                    max={8}
                    step={0.5}
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
                  <dl className="grid grid-cols-6 gap-x-4 text-gray-500 border-l border-gray-300">
                    {/* Always have 6 columns, even if some are empty */}
                    <div className="col-span-1 flex items-start space-x-3 px-3 first:border-none border-l border-gray-300">
                      <dt className="mt-0.5">
                        <span className="sr-only">Ore</span>
                        <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </dt>
                      <dd>{report.hour} ore</dd>
                    </div>
                    {report.indirectReporting?.ParentIndirect && (
                      <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                        <dt className="mt-0.5">
                          <span className="sr-only">Sotto Attività</span>
                          <BriefcaseIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd>{report.indirectReporting?.ParentIndirect?.name || '-'}</dd>
                      </div>
                    )}
                    {report.indirectReporting && (
                      <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                        <dt className="mt-0.5">
                          <span className="sr-only">Attività</span>
                          <BriefcaseIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd>{report.indirectReporting?.name || '-'}</dd>
                      </div>
                    )}
                    {report.associatedEvent && (
                    <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                      <dt className="mt-0.5">
                        <span className="sr-only">Evento</span>
                        <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </dt>
                      <dd>{report.associatedEvent?.name || '-'}</dd>
                    </div>
                    )}
                    {report.associatedJob && (
                      <>
                        <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                          <dt className="mt-0.5">
                            <span className="sr-only">Task</span>
                            <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </dt>
                          <dd>{report.associatedTask ? `${report.associatedTask.Offer.SalesOrders[0].Jobs[0].name} - ${report.associatedTask.name}` : '-'}</dd>
                        </div>
                        <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                          <dt className="mt-0.5">
                            <span className="sr-only">Percentuale</span>
                            <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </dt>
                          <dd>{report.associatedTask?.percentage ? `${report.associatedTask.percentage}%` : '-'}</dd>
                        </div>
                      </>
                    )}
                    {report.associatedCompany && (
                      <div className="col-span-1 flex items-start space-x-3 px-3 border-l border-gray-300">
                        <dt className="mt-0.5">
                          <span className="sr-only">Azienda</span>
                          <QueueListIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </dt>
                        <dd>{report.associatedCompany?.name || '-'}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => handleDelete(report.id_reporting)}
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
      ) : (
        <body className="h-full">
          <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Rendicontazione non disponibile</h1>
              <p className="mt-6 text-base leading-7 text-gray-600" aria-hidden="true">
                Durante il periodo di {user.location.name} non è necessario rendicontare le ore.
              </p>
            </div>
          </main>
        </body>
      )}
    </main>
  );
}