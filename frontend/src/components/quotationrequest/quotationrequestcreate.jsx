import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [company, setCompany] = useState([]);
  const [projecttype, setProjecttype] = useState([]);
  const [assignment, setAssignment] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedProjecttype, setSelectedProjecttype] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTechnicalArea, setSelectedTechnicalArea] = useState(null);
  const [externalCode, setExternalCode] = useState('');

  useEffect(() => {
    // Fetch data for companies, project types, assignments, and technical areas
    axios.get(`${process.env.REACT_APP_API_URL}/company/read`, { params: { filter: 'client' } })
      .then((response) => {
        setCompany(response.data.value.map((item) => ({
          value: item.id_company,
          label: item.name,
        })));
      })
      .catch((error) => console.error('Error fetching company data:', error));

    axios.get(`${process.env.REACT_APP_API_URL}/projecttype/read`)
      .then((response) => {
        setProjecttype(response.data.projectypes.map((item) => ({
          value: item.id_projecttype,
          label: item.description,
        })));
      })
      .catch((error) => console.error('Error fetching projecttype data:', error));

    axios.get(`${process.env.REACT_APP_API_URL}/assignment/read`)
      .then((response) => {
        setAssignment(response.data.assignments.map((item) => ({
          value: item.id_assignment,
          label: item.description,
        })));
      })
      .catch((error) => console.error('Error fetching assignments data:', error));

    axios.get(`${process.env.REACT_APP_API_URL}/technicalarea/read`)
      .then((response) => {
        setTechnicalArea(response.data.technicalareas.map((item) => ({
          value: item.id_technicalarea,
          label: item.name,
        })));
      })
      .catch((error) => console.error('Error fetching technical area data:', error));
  }, []);

  const createQuotationRequest = (event) => {
    event.preventDefault();

    const form = document.forms.createquotationrequest;
    const formData = new FormData(form);

    // Set the project type to 'Cluster' if multiple companies are selected
    if (selectedCompanies?.length > 1) {
      formData.set('projecttype', '2'); // Assuming 'Cluster' has id_projecttype = 2
      setSelectedProjecttype(projecttype.find((pt) => pt.value === '2'));
    } else {
      formData.set('projecttype', selectedProjecttype?.value || '');
    }

    if (selectedProjecttype?.value === '5') { 
      formData.set('externalcode', externalCode);
    }

    formData.set('assignment', selectedAssignment?.value || '');
    formData.set('technicalarea', selectedTechnicalArea?.value || '');
    formData.set('description', form.description.value || '');

    const jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });

    // Send separate requests for each selected company
    selectedCompanies.forEach((company) => {
      jsonObject.company = company.value;
      toast.promise(
        axios.post(`${process.env.REACT_APP_API_URL}/quotationrequest/create`, jsonObject),
        {
          loading: `Creating request for ${company.label}...`,
          success: `Request for ${company.label} created successfully!`,
          error: `Error creating request for ${company.label}`,
        }
      ).catch((error) => console.error(error));
    });
  };

  return (
    <form name="createquotationrequest">
      {/* Account Information */}
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Informazioni</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per creare poi l'offerta
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              <label htmlFor="company" className="block text-sm font-medium leading-6 text-gray-900">
                Cliente
              </label>
              <div className="mt-2">
                <Select
                  id="company"
                  name="company"
                  options={company}
                  value={selectedCompanies}
                  onChange={setSelectedCompanies}
                  placeholder="Seleziona uno o più clienti"
                  isMultiple
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="projecttype" className="block text-sm font-medium leading-6 text-gray-900">
                Tipo Progetto
              </label>
              <div className="mt-2">
                <Select
                  id="projecttype"
                  name="projecttype"
                  options={projecttype}
                  value={selectedCompanies?.length > 1 ? projecttype.find((pt) => pt.value === '2') : selectedProjecttype}
                  onChange={setSelectedProjecttype}
                  placeholder={selectedCompanies?.length > 1 ? 'CLUSTER' : 'Seleziona tipo progetto'}
                  isSearchable
                  isDisabled={selectedCompanies?.length > 1}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="assignment" className="block text-sm font-medium leading-6 text-gray-900">
                Tipo Incarico
              </label>
              <div className="mt-2">
                <Select
                  id="assignment"
                  name="assignment"
                  options={assignment}
                  value={selectedAssignment}
                  onChange={setSelectedAssignment}
                  placeholder="Seleziona tipo incarico"
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="technicalarea" className="block text-sm font-medium leading-6 text-gray-900">
                Area Tecnica
              </label>
              <div className="mt-2">
                <Select
                  id="technicalarea"
                  name="technicalarea"
                  options={technicalArea}
                  value={selectedTechnicalArea}
                  onChange={setSelectedTechnicalArea}
                  placeholder="Seleziona area tecnica"
                  isSearchable
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
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4]  sm:text-sm sm:leading-6"
                  defaultValue=""
                />
                <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
              </div>
            </div>

           
            {selectedProjecttype?.value == '5' && (
              <div className="col-span-full">
                <label htmlFor="externalcode" className="block text-sm font-medium leading-6 text-gray-900">
                  Codice Progetto
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="externalcode"
                    id="externalcode"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                    value={externalCode}
                    onChange={(e) => setExternalCode(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Create Quotation Request Button */}
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          onClick={createQuotationRequest}
          type="submit"
          className="block rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
        >
          Crea
        </button>
      </div>
    </form>
  );
}