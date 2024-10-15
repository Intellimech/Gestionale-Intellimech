import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Per ottenere i parametri dell'URL
import SaleOrderInformation from './salesorderinfo'; // Assicurati che il percorso sia corretto
import axios from 'axios'; // Assicurati di aver installato Axios

const SaleOrderDetails = () => {
  const { id_salesorder } = useParams(); // Ottieni l'ID del lavoro dall'URL
  const [salesorder, setSaleOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleOrderData = async () => {
      try {
        console.log(`Fetching salesorder data for ID: ${id_salesorder}`); // Log ID dell'salesorderta
  
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/salesorder/read/${id_salesorder}`); // Usa l'ID per la query
        console.log('Response data detail:', response.data); // Log della risposta
  
        // Verifica se response.data.salesorder esiste
        if (response.data && response.data.salesorder) {
          console.log('Filtered salesorder data:', response.data.salesorder); // Log dell'salesorderta filtrata
          setSaleOrder(response.data.salesorder);
        } else {
          console.log('SaleOrder data not found in response'); // Log se non ci sono salesorderte nella risposta
          setError('Nessuna salesorderta trovata');
        }
      } catch (error) {
        console.error('Fetch error:', error); // Log dell'errore per il debug
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSaleOrderData();
  }, [id_salesorder]);
  
  if (loading) {
    console.log('Loading salesorder data...'); // Log per il caricamento
    return <div>Loading...</div>;
  }

  // Log finale per verificare se il lavoro è stato trovato
  if (error) {
    console.log('Error:', error); // Log dell'errore
    return <div>{error}</div>;
  }

  if (!salesorder) {
    console.log('No salesorder found'); // Log se nessun lavoro è stato trovato
    return <div>Nessun lavoro trovato</div>;
  }

  // Se il lavoro è trovato, passalo al componente SaleOrderInformation
  return <SaleOrderInformation salesOrder={salesorder} />;
};

export default SaleOrderDetails;
