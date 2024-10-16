import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuotationRequestInfo from './quotationrequestinfo';
import axios from 'axios';

const QuotationrequestDetails = () => {
  const { id_quotationrequest } = useParams();
  const [quotationrequest, setQuotationrequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchQuotationrequestData = async () => {
    try {
      console.log(`Fetching quotationrequest data for ID: ${id_quotationrequest}`);
  
      // Fetch a specific quotation request by ID
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/quotationrequest/read/${id_quotationrequest}`);
      console.log('Response data:', response.data);
  
      // Directly access the quotation request data
      const quotationrequestData = response.data.quotationrequest;
      console.log('Quotation request data:', quotationrequestData);
  
      setQuotationrequest(quotationrequestData);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Call the function inside useEffect or wherever appropriate
  useEffect(() => {
    fetchQuotationrequestData();
  }, [id_quotationrequest]);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!quotationrequest) {
    return <div>Nessuna richiesta di offerta trovata</div>;
  }

  return <QuotationRequestInfo quotationrequest={quotationrequest} />;
};

export default QuotationrequestDetails;
