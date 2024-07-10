import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

import PrivateRoute from './module/privateRoute';
import { UserProvider } from './module/userContext';

import Layout from './pages/layout';
import Login from './pages/login';
import Lost from './pages/lost';
import Unauthorized from './pages/unauthorized';
import Homepage from './components/homepage';

import Reporting from './components/reporting';
import Calendar from './components/calendar/calendar';

import Quotationrequesttable from './components/quotationrequesttable';
import Offer from './components/offertable';
import Salesorder from './components/salesordertable';
import Job from './components/jobtable';

import Invoicetable from './components/invoicetable';
import Company from './components/company/companytable';

import Purchase from  './components/purchase';
import PurchaseCreate from  './components/purchasecreate';

const Logo = './assets/intellimech.svg'

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/home" />} />
            <Route path="home" element={<PrivateRoute element={<Homepage />} />} />
            <Route path="reporting" element={<PrivateRoute element={<Reporting />} />} />
            
            <Route path="calendar" element={<PrivateRoute element={<Calendar />} />} />
            <Route path="quotation-request" element={<PrivateRoute element={<Quotationrequesttable />} />} />
            <Route path="offer" element={<PrivateRoute element={<Offer />} />} />
            <Route path="sales-order" element={<PrivateRoute element={<Salesorder />} />} />

            <Route path="purchase" element={<PrivateRoute element={<Purchase />} />} />
            

            <Route path="job" element={<PrivateRoute element={<Job />} />} />
            <Route path="invoices">
              <Route path="passive" element={<PrivateRoute element={<Invoicetable invoicetype={"PassivaSdI"}/>} />} />
              <Route path="active" element={<PrivateRoute element={<Invoicetable invoicetype={"AttivaSdI"}/>} />} />
            </Route>
            <Route path="company">
              <Route path="customers" element={<PrivateRoute element={<Company companytype={"Customers"}/>} />} />
              <Route path="suppliers" element={<PrivateRoute element={<Company companytype={"Suppliers"}/>} />} />
            </Route>
          </Route>
          <Route path="*" element={<Lost />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
