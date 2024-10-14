import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Per ottenere i parametri dell'URL
import JobInformation from './jobinformation'; // Assicurati che il percorso sia corretto
import axios from 'axios'; // Assicurati di aver installato Axios

const JobDetails = () => {
  const { id_job } = useParams(); // Ottieni l'ID del lavoro dall'URL
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        console.log(`Fetching job data for ID: ${id_job}`); // Log ID del lavoro

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/job/read?id=${id_job}`); // Usa l'ID per la query
        console.log('Response data:', response.data); // Log della risposta

        // Assicurati di confrontare gli ID come stringhe
        const jobData = response.data.jobs.find(job => job.id_job.toString() === id_job); // Modificato per forzare il confronto come stringhe
        console.log('Filtered job data:', jobData); // Log del lavoro filtrato

        setJob(jobData);
      } catch (error) {
        console.error('Fetch error:', error); // Log dell'errore per il debug
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id_job]);

  if (loading) {
    console.log('Loading job data...'); // Log per il caricamento
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error occurred:', error); // Log dell'errore
    return <div>Error: {error}</div>;
  }

  // Log finale per verificare se il lavoro è stato trovato
  if (!job) {
    console.log('No job found'); // Log se nessun lavoro è stato trovato
    return <div>Nessun lavoro trovato</div>;
  }

  // Se il lavoro è trovato, passalo al componente JobInformation
  return <JobInformation job={job} />;
};

export default JobDetails;
