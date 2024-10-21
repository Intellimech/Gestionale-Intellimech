import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Per ottenere i parametri dell'URL
import PurchaseInfo from './purchaseinfo'; // Assicurati che il percorso sia corretto
import axios from 'axios'; // Assicurati di aver installato Axios

const PurchaseDetails = () => {
  const { id_purchase } = useParams(); // Ottieni l'ID del lavoro dall'URL
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
      
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/purchase/read?id=${id_purchase}`); // Usa l'ID per la query
      

        // Assicurati di confrontare gli ID come stringhe
        const purchaseData = response.data.purchases.find(purchase => purchase.id_purchase.toString() === id_purchase); // Modificato per forzare il confronto come stringhe

        setPurchase(purchaseData);
      } catch (error) {
        console.error('Fetch error:', error); // Log dell'errore per il debug
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseData();
  }, [id_purchase]);

  
  // Log finale per verificare se il lavoro è stato trovato
  if (!purchase) {
  
    return <div>Nessun lavoro trovato</div>;
  }

  // Se il lavoro è trovato, passalo al componente PurchaseInformation
  return <PurchaseInfo purchase={purchase} />;
};

export default PurchaseDetails;
