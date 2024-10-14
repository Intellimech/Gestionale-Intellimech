import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Per ottenere i parametri dell'URL
import OfferInformation from './offerinformation'; // Assicurati che il percorso sia corretto
import axios from 'axios'; // Assicurati di aver installato Axios

const OfferDetails = () => {
  const { id_offer } = useParams(); // Ottieni l'ID del lavoro dall'URL
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfferData = async () => {
      try {
        console.log(`Fetching offer data for ID: ${id_offer}`); // Log ID dell'offerta
  
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/offer/read?id=${id_offer}`); // Usa l'ID per la query
        console.log('Response data detail:', response.data); // Log della risposta
  
        // Verifica se response.data e response.data.offers esistono
        if (response.data ) {
          const offerData = response.data.offer.find(offer => offer.id_offer.toString() === id_offer); // Forza il confronto come stringhe
          console.log('Filtered offer data:', offerData); // Log dell'offerta filtrata
  
          setOffer(offerData);
        } else {
          console.log('Offers data not found in response'); // Log se non ci sono offerte nella risposta
          setError('Nessuna offerta trovata');
        }
      } catch (error) {
        console.error('Fetch error:', error); // Log dell'errore per il debug
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchOfferData();
  }, [id_offer]);
  
  if (loading) {
    console.log('Loading offer data...'); // Log per il caricamento
    return <div>Loading...</div>;
  }


  // Log finale per verificare se il lavoro è stato trovato
  if (!offer) {
    console.log('No offer found'); // Log se nessun lavoro è stato trovato
    return <div>Nessun lavoro trovato</div>;
  }

  // Se il lavoro è trovato, passalo al componente OfferInformation
  return <OfferInformation offer={offer} />;
};

export default OfferDetails;
