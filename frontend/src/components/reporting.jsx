import { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ClockIcon, QueueListIcon, BriefcaseIcon, TrashIcon } from '@heroicons/react/24/outline'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Select from "react-tailwindcss-select";
import axios from 'axios'
import Cookies from 'js-cookie'

export default function Reporting() {
  const [job, setJob] = useState([])
  const [task, setTask] = useState([])
  const [reportedHours, setReportedHours] = useState([])
  const [selectedJob, setSelectedJob] = useState(null);
  const [taskPercentage, setTaskPercentage] = useState(0)
  
  //get the job list
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/job/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setJob(response.data.jobs);
        console.log(response.data.jobs);
      })
      .catch((error) => {
        console.log(error);
      });

      axios
      .get(`${process.env.REACT_APP_API_URL}/reporting/read`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        setReportedHours(response.data.reporting);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []); // Empty dependency array

  const handleSubmit = (event) => {     
    event.preventDefault()
    const formData = new FormData(event.target)
    if (!formData.get('date') || !formData.get('hours') || !selectedJob.value || !formData.get('task')) {
      return
    } else {
      const newReport = {
        date: formData.get('date'),
        hours: formData.get('hours'),
        job: selectedJob.value,
        task: formData.get('task'),
      }
    
      axios.post(`${process.env.REACT_APP_API_URL}/reporting/create`, newReport, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + Cookies.get('token'),
        },
      })
      .then((response) => {
        console.log(response.data);
        //trow the use effect to refresh the data
        axios
        .get(`${process.env.REACT_APP_API_URL}/reporting/read`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Cookies.get('token'),
          },
        })
      })
      .catch((error) => {
        console.error('Error creating new report:', error);
      });
    }
  }


  const handleJobChange = (value) => {
    setSelectedJob(value)
    console.log(value.value)
    const token = Cookies.get('token');
    if (value.value == '') {
      setTask([]);
      return;
    }
    // Fetching subcategories with the selected category
      axios.get(`${process.env.REACT_APP_API_URL}/task/read/${value.value}`, { headers: { authorization: `Bearer ${token}` } })
      .then((response) => {
          setTask(response.data.tasks);
      })
      .catch((error) => {
        console.error('Error fetching task data:', error);
      });
  };

  return (
    <main className="">
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
                  <input type="date" name="date" id="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label htmlFor="job" className="block text-sm font-medium text-gray-900">Commesse e Centri di costo</label>
                  <Select
                    options={job.map((job) => ({ value: job.id_job, label: job.name }))}
                    id="job"
                    name="job"
                    value={selectedJob}
                    onChange={handleJobChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-900">Ore Lavorate</label>
                  <input type="number" name="hours" id="hours" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" min={1} required defaultValue={1}/>
                </div>
                    {
                      task.length > 0 && (
                        <>
                          <div>
                            <label htmlFor="task" className="block text-sm font-medium text-gray-900">Task</label>
                            <select id="task" name="task" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50" required>
                              <option value="">Seleziona la tua task</option>
                              {
                                task.map((task) => (
                                  <option key={task.id_task} value={task.id_task}>{task.name}</option>
                                ))
                              }
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="percentage" className="block text-sm font-medium text-gray-900">Percentuale</label>
                            <value>{taskPercentage}%</value>
                            <Slider range defaultValue={[0]} min={0} max={100} step={10} onChange={(value) => setTaskPercentage(value)} />
                          </div>
                        </>
                      )
                    }
                <div className="flex justify-end">
                  <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                    Invia
                  </button>
                </div>
              </div>
            </form>
          </div>
          <ol className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
            { /* Show the report days from the date selector */
              reportedHours.length === 0 && (
                <li className="flex justify-center py-6">
                  <p className="text-gray-500">Nessuna rendicontazione presente</p>
                </li>
              )
            }
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
                {/* Buttons Container */}
                <div className="flex space-x-3">
                  {/* Button 1 */}
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
  )
}
