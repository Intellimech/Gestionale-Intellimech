import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-tailwindcss-select';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import toast, { Toaster } from 'react-hot-toast';

export default function UserCreateForm() {
  const [company, setCompany] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [technicalArea, setTechnicalArea] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedTechnicalArea, setSelectedTechnicalArea] = useState(null);

  useEffect(() => {
  

    // Fetching company data
    axios
      .get(`${process.env.REACT_APP_API_URL}/company/read`, {
        
        params: { filter: 'client' },
      })
      .then((response) => {
        setCompany(
          response.data.value.map((item) => ({
            value: item.id_company,
            label: item.name,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching company data:', error);
      });

    // Fetching category data
    axios
      .get(`${process.env.REACT_APP_API_URL}/category/read`)
      .then((response) => {
        setCategory(
          response.data.categories.map((item) => ({
            value: item.id_category,
            label: item.name,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching category data:', error);
      });

    // Fetching technical area data
    axios
      .get(`${process.env.REACT_APP_API_URL}/technicalarea/read`)
      .then((response) => {
        setTechnicalArea(
          response.data.technicalareas.map((item) => ({
            value: item.id_technicalarea,
            label: item.name,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching technical area data:', error);
      });
  }, []);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    
    // Fetching subcategories with the selected category
    axios
      .get(`${process.env.REACT_APP_API_URL}/subcategory/read/${value.value}`)
      .then((response) => {
        setSubcategory(
          response.data.subcategories.map((item) => ({
            value: item.id_subcategory,
            label: item.name,
          }))
        );
      })
      .catch((error) => {
        console.error('Error fetching subcategory data:', error);
      });
  };

  const createQuotationRequest = (event) => {
    event.preventDefault();
   
    const form = document.forms.createquotationrequest;
    const formData = new FormData(form);
  
    // Append selected values to formData
    formData.append('company', selectedCompany?.value || '');
    formData.append('category', selectedCategory?.value || '');
    formData.append('subcategory', selectedSubcategory?.value || '');
    formData.append('technicalarea', selectedTechnicalArea?.value || '');
  
    // Converting formData to JSON
    let jsonObject = {};
    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });
  
    // Toast promise to handle loading, success, and error states
    toast.promise(
      axios.post(`${process.env.REACT_APP_API_URL}/quotationrequest/create`, jsonObject),
      {
        loading: 'Invio in corso...',
        success: 'Richiesta di offerta creata con successo!',
        error: 'Errore durante la creazione della richiesta di offerta',
      }
    )
    .then((response) => {
      
      // Refresh the data after a successful post
    })
    .catch((error) => {
   
      throw new Error('Errore durante la creazione della richiesta di offerta');
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
                  value={selectedCompany}
                  onChange={setSelectedCompany}
                  placeholder="Seleziona un cliente"
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                Categoria
              </label>
              <div className="mt-2">
                <Select
                  id="category"
                  name="category"
                  options={category}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  placeholder="Seleziona una categoria"
                  isSearchable
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subcategory" className="block text-sm font-medium leading-6 text-gray-900">
                Sotto Categoria
              </label>
              <div className="mt-2">
                <Select
                  id="subcategory"
                  name="subcategory"
                  options={subcategory}
                  value={selectedSubcategory}
                  onChange={setSelectedSubcategory}
                  placeholder="Seleziona una sotto categoria"
                  isSearchable
                  isDisabled={subcategory.length === 0}
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
                  placeholder="Seleziona un'area tecnica"
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
