import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';
import Select from "react-tailwindcss-select";
import ContractUpdateRow from './contractupdaterow.jsx';
import toast, { Toaster } from 'react-hot-toast';


export default function ContractUpdateForm({ contract: initialContract, onChange }) {
  const [createSuccess, setCreateSuccess] = useState(null);
  const [errorMessages, setErrorMessages] = useState('');
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contract, setContract] = useState(initialContract || {});
  const [subcategories, setSubcategories] = useState([]);
  const [subsubcategories, setSubsubcategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(initialContract ? { value: initialContract.id_company, label: initialContract?.Company?.name } : null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialContract ? initialContract.payment_method : "Cash");
  const [selectedDatestart, setSelectedDatestart] = useState(initialContract.contract_start_date || new Date().toISOString().split('T')[0]);
  const [selectedDateend, setSelectedDateend] = useState(initialContract.contract_end_date || new Date().toISOString().split('T')[0]);
  const [selectedBank, setSelectedBank] = useState(initialContract ? initialContract?.banktransfer : "");
  const banks = ['Vista Fattura', '30 gg D.F.F.M.', '60 gg D.F.F.M.', '50% Anticipato, 50% alla Consegna', '100% Anticipato', 'Frazionato'];
  
  const [contractrows, setContractRows] = useState(initialContract ? initialContract.ContractRows : [{ category: '', subcategory: '', subsubcategory: '', unit_price: '', vat: '',quantity: 1, recurrence: '', recurrence_number: '', depreciation_years: '', description: '', subcategories: [] }]);
  const [recurrence_number, setRecurrenceNumber] = useState(initialContract ? initialContract.recurrence_number : '');
  const [categoryMap, setCategoryMap] = useState({});
  const [currency, setCurrency] = useState(initialContract ? initialContract.currency : '');
  const [selectedUser, setSelectedUser] = useState(initialContract ? { value: initialContract.referent, label: initialContract?.referentUser?.name + " "+  initialContract?.referentUser?.surname } : null);
  const [recurrence, setRecurrence] = useState(initialContract ? initialContract.recurrence : '');
  const [currencies, setCurrencies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recurrences, setRecurrences] = useState([]);
  const [jobs, setJobs]= useState([]);
  const [job, setJob]= useState(initialContract ? initialContract.job : '');
  const [deposit, setDeposit]= useState(initialContract ? initialContract.deposit : '')
 
console.log("sono initial contract",initialContract);



  function findcurrency(id) {
  const currencyfind = currencies.find(curr => curr.id_currency == id);

  return currencyfind ? currencyfind.name : "Sconosciuto";
}
function findmethod(id) {
  const find = paymentMethods.find(curr => curr.id_paymentmethod == id);

  return find ? find.name : "Sconosciuto";
}

function findJob(id) {
  const jobfind = jobs.find(j => j.id_job == id);

  return jobfind ? jobfind.name : "Sconosciuto";
}
function findrecurrence(id) {
  const find = recurrences.find(curr => curr.id_recurrence == id);
console.log("sono il find", id );
console.log("ehi ciao", initialContract)
  return find ? find.name : "Sconosciuto";
}
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/currency/read`)
      .then((response) => {
        setCurrencies(response.data.currencies);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching currencies:', error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/paymentmethod/read`)
      .then((response) => {
        setPaymentMethods(response.data.paymentmethods);
      })
      .catch((error) => {
        console.error('Error fetching paymentmethods:', error);
      });
  }, []);
  
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/read`)
      .then((response) => {
        // Map users to the format expected by react-tailwindcss-select
        const formattedUsers = response.data.users.map(user => ({
          value: user.id_user, // Assuming there's an id_user field
          label: `${user.name} ${user.surname}` // Adjust based on your user object structure
        }));
        setUsers(formattedUsers);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);
  useEffect(() => {
   
      axios
        .get(`${process.env.REACT_APP_API_URL}/job/read`)
        .then((response) => {
          setJobs(response.data.jobs || []);
        })
        .catch((error) => {
          console.error('Errore nel caricamento delle commesse:', error);
          toast.error('Errore nel caricamento delle commesse');
        });
  }, []);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/recurrence/read`)
      .then((response) => {
        setRecurrences(response.data.recurrences);
        console.log(response.data)
        
      })
      .catch((error) => {
        console.error('Error fetching recurrences:', error);
      });
  }, []);
  useEffect(() => {
    console.log("miao sono qua", initialContract)
    const fetchData = async () => {
      try {
        const [
          { data: { quotationrequest } },
          { data: { categories } },
          { data: { subcategories } },
          { data: { subsubcategories } },
          { data: { users } },
          { data: { value: companies } },
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/category/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/subcategory/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/user/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/company/read`),
        ]);

        setQuotationRequests(quotationrequest);
        setCategories(categories);
        setSubcategories(subcategories);
        setSubsubcategories(subsubcategories);
        setUsers(users.map(({ id_user, name, surname }) => ({ value: id_user, label: `${name} ${surname}` })));
        setCompanies(companies.map(({ id_company, name }) => ({ value: id_company, label: name })));

        const map = categories.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});
        setCategoryMap(map);

        const updatedContractRows = (initialContract?.ContractRows || []).map(row => ({
          ...row,
          categoryName: map[row.category] || 'Unknown',
        }));
        setContractRows(updatedContractRows);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  const handleContractRowChange = (index, updatedContractRow) => {
    const updatedContractRows = [...contractrows];
    updatedContractRows[index] = updatedContractRow;
    setContractRows(updatedContractRows);
    setContract({ ...contract, contractrows: updatedContractRows });
  };

  const handleCategoryChange = async (index, categoryId) => {
    try {
      const { data: { subcategories: filteredSubcategories } } = await axios.get(
        `${process.env.REACT_APP_API_URL}/subcategory/read/${categoryId}`
      );
      
      const updatedContractRow = { 
        ...contractrows[index], 
        category: categoryId, 
        subcategory: '', 
        subsubcategory: '', 
      };
      
      const updatedContractRows = [...contractrows];
      updatedContractRows[index] = updatedContractRow;
      
      setContractRows(updatedContractRows);
      
      // Create a new state for filtered subcategories specifically for this row
      const newSubcategoriesState = [...subcategories];
      newSubcategoriesState[index] = filteredSubcategories;
      
      setSubcategories(newSubcategoriesState);
    } catch (error) {
      console.error('Errore durante il caricamento delle sottocategorie:', error);
    }
  };

  const handleSubcategoryChange = async (index, subcategoryId) => {
    try {
      const { data: { subsubcategories } } = await axios.get(`${process.env.REACT_APP_API_URL}/subsubcategory/read/${subcategoryId}`);
      const updatedContractRow = { ...contractrows[index], subcategory: subcategoryId, subsubcategory: '', subsubcategories };
      const updatedContractRows = [...contractrows];
      updatedContractRows[index] = updatedContractRow;
      setContractRows(updatedContractRows);
    } catch (error) {
      console.error('Errore durante il caricamento delle sotto-sottocategorie:', error);
    }
  };
  

  const addContractRow = () => setContractRows([...contractrows, { category: '', 
    subcategory: '',  
    subsubcategory: null, 
    description: '',
    quantity: 1,
    unit_price: '',
    total: '',
    taxedtotal: '',
    vat: '',
    unit_price_excl_vat: '',
    
    total_excl_vat: '',
    recurrence: '',
    recurrence_number: '', 
    subcategories: [],
    subsubcategories: []}]);

  const confirmRemoveContractRow = (index) => {
    const updatedContractRows = contractrows.filter((_, i) => i !== index);
    setContractRows(updatedContractRows);
    setContract({ ...contract, contractrows: updatedContractRows });
  };
  useEffect(() => {
    if (recurrence && recurrence_number && selectedDatestart) {
      const start = new Date(selectedDatestart);
      const end = new Date(start);
  
      switch (recurrence.label) {  // Usa recurrence.value se è un oggetto di Select
        case 'Mensile':
          end.setMonth(start.getMonth() + parseInt(recurrence_number));
          break;
        case 'Bimestrale':
          end.setMonth(start.getMonth() + (parseInt(recurrence_number) * 2));
          break;
        case 'Trimestrale':
          end.setMonth(start.getMonth() + (parseInt(recurrence_number) * 3));
          break;
        case 'Annuale':
          end.setFullYear(start.getFullYear() + parseInt(recurrence_number));
          break;
        case 'Biannuale':
          end.setFullYear(start.getFullYear() + (parseInt(recurrence_number) * 2));
          break;
        default:
          return;
      }
      
      // Sottrae un giorno per essere l'ultimo giorno del periodo
      end.setDate(end.getDate() - 1);
  
      // Imposta direttamente la data di fine
      setSelectedDatestart(end.toISOString().split('T')[0]);
    }
  }, [selectedDatestart, recurrence, recurrence_number]);

  const updateContractOrder = async (event) => {
    event.preventDefault();

    const jsonObject = {
      id_contract: contract.id_contract,
      id_company: selectedCompany?.value,
      payment: selectedPaymentMethod,
      date_start: selectedDatestart,
      deposit: deposit,
      recurrence: recurrence,
      recurrence_number: recurrence_number,
      banktransfer: selectedBank,
      referent: selectedUser.value,
      job: job,
      currency: currency,
      contractrows: contractrows.map((contractrow) => ({
        name: contractrow.name ,
        category: contractrow.category,
        subcategory: contractrow.subcategory,
        subsubcategory: contractrow.subsubcategory,
        description: contractrow.description || '',
        unit_price: parseFloat(contractrow.unit_price),
        taxed_unit_price: parseFloat(contractrow.unit_price) * 1.22,
        vat: parseFloat(contractrow.vat),
        quantity: parseInt(contractrow.quantity, 10),
        totalprice: parseFloat(contractrow.unit_price) * parseInt(contractrow.quantity, 10),
        taxed_totalprice: (parseFloat(contractrow.unit_price) * 1.22) * parseInt(contractrow.quantity, 10),
        
       
      }))
    };
    
    console.log(jsonObject);

    toast.promise(
      axios.put(`${process.env.REACT_APP_API_URL}/contract/update`, jsonObject),
      {
        loading: 'Invio in corso...',
        success: 'ODA aggiornato con successo!',
        error: 'Errore durante la modifica della richiesta di acquisto',
      }
    )
       .then((response) => {
         window.location.reload();
         console.log("sto modificando", jsonObject);
         setCreateSuccess(true);
       })
      .catch((error) => {
        console.log(jsonObject);
        console.error('Error details:', error.response ? error.response.data : error.message);
        
        setErrorMessages(error.response?.data?.message || 'An error occurred');
        setCreateSuccess(false);
      });
  };
  return (
    <form name="updatecontractorder" onSubmit={updateContractOrder}>
      <Toaster />
      <div className="space-y-8">
        {/* Informazioni Ordine di Acquisto */}
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Informazioni Contratti</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Ricorda, i dati inseriti ora saranno quelli che verranno utilizzati per modificare il contratto.
          </p>
          <table className="w-full mt-6 text-[10px]">
            <tbody>
              {/* Cliente */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Cliente</td>
                <td>
                  <Select
                    id="azienda"
                    name="azienda"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={selectedCompany}
                    onChange={(value) => {
                      setSelectedCompany(value);
                      setContract({ ...contract, id_company: value?.value });
                    }}
                    placeholder="Seleziona Cliente"
                    options={companies}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                  />
                </td>
              </tr>

              <tr>
                <td className="block text-sm font-medium text-gray-700">Referente</td>
                <td>
                  <Select
                    value={selectedUser}
                    onChange={(value) => {
                      setSelectedUser(value);
                      setContract({ ...contract, referent: value?.value });
                    }}
                    options={users}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                    placeholder="Seleziona Referente"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
              {/* Data */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Data</td>
                <td>
                  <input
                    id="dateorder"
                    name="dateorder"
                    type="date"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                  
                    value={selectedDatestart}
                    onChange={(e) => {
                      setSelectedDatestart(e.target.value);
                      setContract({ ...contract, contract_start_date: e.target.value });
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="block text-sm font-medium text-gray-700">Data</td>
                <td>
                  <input
                    id="dateorder"
                    name="dateorder"
                    type="date"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[12px]"
                  
                    value={selectedDateend}
                    onChange={(e) => {
                      setSelectedDateend(e.target.value);
                      setContract({ ...contract, contract_end_date: e.target.value });
                    }}
                  />
                </td>
              </tr>
              {/* Metodo di Pagamento */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Metodo di Pagamento</td>
                <td>
                  <Select
                    id="paymentmethod"
                    name="paymentmethod"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={{ value: selectedPaymentMethod, label: findmethod(selectedPaymentMethod) }}
                    onChange={(selectedOption) => {
                      setSelectedPaymentMethod(selectedOption.value);
                      setContract({ ...contract, selectedPaymentMethod: selectedOption.value });
                    }}
                    options={paymentMethods.map((method) => ({ value: method.id_paymentmethod, label: method.name }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                  />
                </td>
              </tr>
              {selectedPaymentMethod && selectedPaymentMethod == "1" ? (
              <tr>
                <td className="block text-sm font-medium text-gray-700">Dettagli di Pagamento</td>
                <td>
                  <Select
                     value={{ value: selectedBank, label: selectedBank }}
                    onChange={(selectedOption) => {
                      setSelectedBank(selectedOption.value);
                      setContract({ ...contract, banktransfer: selectedOption.value });
                    }}
                    options={banks.map((b) => ({ value: b , label: b }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                    placeholder="Seleziona Metodo di Pagamento"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
            ) : null}

              {/* Valuta */}
              <tr>
                <td className="block text-sm font-medium text-gray-700">Valuta</td>
                <td>
                  <Select
                    id="currency"
                    name="currency"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                    value={{ value: currency, label: findcurrency(currency) }}
                    onChange={(selectedOption) => {
                      setCurrency(selectedOption.value);
                      setContract({ ...contract, currency: selectedOption.value });
                    }}
                    options={currencies.map((curr) => ({ value: curr.id_currency, label: curr.name }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                  />
                </td>
              </tr>
              <tr>
            <td className="w-1/3 text-sm font-medium text-gray-700 align-middle">Ricorrenza</td>
            <td className="w-2/3">
              <div className="flex space-x-4">
                <div className="flex-grow">
                  <Select
                     value={{ value: recurrence, label: findrecurrence(recurrence) }}
                    onChange={(selectedOption) => {
                     
                      setContract({ ...contract, recurrence: selectedOption.value });
                      setRecurrence(selectedOption.value);
                    }}
                    options={recurrences.map((recurrence) => ({
                      value: recurrence.id_recurrence,
                      label: recurrence.name,
                    }))}
                    primaryColor="#7fb7d4"
                    isSearchable
                    isClearable
                    placeholder="Seleziona Ricorrenza"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </div>
                <div className="w-1/4">
                  <input
                    type="number"
                    value={recurrence_number}
                    onChange={(selectedOption) => {
                     
                      setContract({ ...contract, recurrence_number: selectedOption.target.value });
                      setRecurrenceNumber(selectedOption.target.value);
                      console.log("miao" , selectedOption.target.value)
                    }}
                    min="1"
                    placeholder="N. di ricorrenze"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
                <td className="block text-sm font-medium text-gray-700">Acconto</td>
                <td>
                <input
                    type="number"
                    value={deposit}
                    onChange={(selectedOption) => {
                     
                      setContract({ ...contract, deposit: selectedOption.target.value });
                      setDeposit(selectedOption.target.value);
                    }}
                    min="1"
                    placeholder="Acconto"
                    className="block w-full rounded border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] text-[10px]"
                  />
                </td>
              </tr>
          <tr>
                <td className="block text-sm font-medium text-gray-700">Commessa</td>
                <td>
                <Select
                        options={jobs.map((job) => ({ value: job.id_job, label: job.name }))}
                        id="job"
                        name="job"
                        value={{ value: job, label: findJob(job) }}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:text-sm sm:leading-6"
                        onChange={(selectedOption) => {
                          setJob(selectedOption.value);
                          setContract({ ...contract, job: selectedOption.value });
                        }}
                        isSearchable
                        isClearable
                        placeholder="Seleziona una commessa"
                      />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div className="border border-gray-200 rounded p-4 text-xs">
          <h2 className="text-[15px] font-semibold text-gray-900">Servizi</h2>
          <p className="text-[11px] text-gray-600 mt-1">
            Questi sono i servizi associati al contratto.
          </p>
          <div className="mt-4">
            {contractrows && contractrows.length > 0 && contractrows.map((contractrow, index) => (
              <ContractUpdateRow
                key={index}
                contractrow={{
                  ...contractrow,
                  categoryName: categoryMap[contractrow.category] || 'Unknown',
                }}
                onChange={(updatedContractRow) => handleContractRowChange(index, updatedContractRow)}
                onRemove={() => confirmRemoveContractRow(index)}
                
                
                categories={categories}
                subcategories={subcategories}
                subsubcategories={subsubcategories}
                handleCategoryChange={(e) => handleCategoryChange(index, e.target.value)}
                handleSubcategoryChange={(e) => handleSubcategoryChange(index, e.target.value)}
               
               
                recurrence_number= {recurrence_number}
                currencies={currencies}
                currency={currency}
                setCurrency={setCurrency}
              />
            ))}
            <button
              type="button"
              className="block mt-4 rounded-md bg-[#A7D0EB] px-2 py-1 text-center text-xs font-bold leading-5 text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
              onClick={addContractRow}
            >
              Aggiungi Servizio
            </button>
          </div>
        </div>
  
        {/* Messaggi di Feedback */}
        {createSuccess === false && (
          <div className="mt-4 rounded-md bg-red-50 p-3">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3 text-[10px]">
                <h3 className="font-medium text-red-800">Errore durante la creazione</h3>
                <ul className="list-disc pl-5 space-y-1 text-red-700">
                  <li>{errorMessages}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {createSuccess === true && (
          <div className="mt-4 rounded-md bg-green-50 p-3">
            <div className="flex">
              <CheckBadgeIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <div className="ml-3 text-[10px]">
                <h3 className="font-medium text-green-800">Contratto aggiornato con successo!</h3>
              </div>
            </div>
          </div>
        )}
  
        {/* Pulsante di Invio */}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-[#A7D0EB] px-4 py-2 text-xs font-bold text-black shadow-sm hover:bg-[#7fb7d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7fb7d4]"
          >
            Aggiorna Contratto
          </button>
        </div>
      </div>
    </form>
  );
}  