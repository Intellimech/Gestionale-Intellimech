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
import Homepage from './components/dashboard/homepage.jsx';

import Reporting from './components/reporting/reporting.jsx';
import Calendar from './components/calendar/calendar';

import GeneralCalendar from './components/calendar/generalcalendar.jsx';
import Locations from './components/registry/locationstable.jsx'

import Quotationrequesttable from './components/quotationrequest/quotationrequesttable';
import Offer from './components/offer/offertable';
import Salesorder from './components/salesorder/salesordertable.jsx';
import Job from './components/job/jobtable';


import Invoicetable from './components/invoices/invoicetable.jsx';
import Company from './components/registry/companytable';

import Profile from './components/registry/userinfo.jsx';
import Permissions from './components/registry/permissionstable.jsx'
import Purchase from  './components/purchaseorder/purchase.jsx';
import PurchaseDetail from './components/purchaseorder/purchasedetail.jsx';
import UsersTable from './components/registry/userstable';
import EmployeesConsultant from './components/registry/peopletable';
import CategoriesPage from './components/registry/categoriespage';
import SubcategoriesPage from './components/registry/subcategoriespage';
import TechnicalAreaPage from './components/registry/technicalareapage';
import HolidaysLeaves from './components/calendar/holidaysleaves.jsx';
import JobInfo from './components/job/jobdetail.jsx'
import ForgotPasswordPage from './components/system/forgotpassword';
import OfferInfo from './components/offer/offerdetail.jsx';
import SettingsPage from './components/system/settings.jsx';
import SalesOrderDetail from './components/salesorder/salesorderdetail.jsx';
import QuotationrequestDetail from './components/quotationrequest/quotationrequestdetail.jsx';


const Logo = './assets/intellimech.svg'

const App = () => {

  useEffect(() => {
    // 
  }, []);

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Navigate to="/app/home" />} />
            <Route path="home" element={<PrivateRoute element={<Homepage />} />} />
            <Route path="reporting" element={<PrivateRoute element={<Reporting />} />} />
            
            <Route path="calendar" element={<PrivateRoute element={<Calendar />} />} />
            <Route path="generalcalendar" element={<PrivateRoute element={<GeneralCalendar />} />} />
            <Route path="quotation-request" element={<PrivateRoute element={<Quotationrequesttable />} />} />
            <Route path="quotation-request/:id_quotationrequest" element={<PrivateRoute element={<QuotationrequestDetail />} />} />
            
            <Route path="offer" element={<PrivateRoute element={<Offer />} />} />
            <Route path="offer/:id_offer" element={<PrivateRoute element={<OfferInfo />} />} />
            <Route path="sales-order" element={<PrivateRoute element={<Salesorder />} />} />
            <Route path="profile">
              <Route index element={<PrivateRoute element={<Profile />} />} />
              <Route path=":id" element={<PrivateRoute element={<Profile />} />} />
            </Route>
            <Route path="sales-order/:id_salesorder" element={<PrivateRoute element={<SalesOrderDetail/>} />} /> 
           
            <Route path="purchase" element={<PrivateRoute element={<Purchase />} />} />
            <Route path="purchase/:id_purchase" element={<PrivateRoute element={<PurchaseDetail />} />} />
            <Route path="profile" element={<PrivateRoute element={<Profile />} />} />
            <Route path="job" element={<PrivateRoute element={<Job />} />} />
            <Route path="job/:id_job" element={<PrivateRoute element={<JobInfo />} />} />
            <Route path="holidays-leaves" element={<PrivateRoute element={<HolidaysLeaves />} />} />
            <Route path="invoices">
              <Route path="passive" element={<PrivateRoute element={<Invoicetable invoicetype={"PassivaSdI"}/>} />} />
              <Route path="active" element={<PrivateRoute element={<Invoicetable invoicetype={"AttivaSdI"}/>} />} />
            </Route>
            <Route path="company">
              <Route path="customers" element={<PrivateRoute element={<Company companytype={"Customers"}/>} />} />
              <Route path="suppliers" element={<PrivateRoute element={<Company companytype={"Suppliers"}/>} />} />
            </Route>
            <Route path="users" element={<PrivateRoute element={<UsersTable />} />} />
            <Route path="roles" element={<PrivateRoute element={<UsersTable />} />} />
            <Route path="employees-consultants" element={<PrivateRoute element={<EmployeesConsultant />} />} />
            <Route path="category" element={<PrivateRoute element={<CategoriesPage />} />} />
            <Route path="subcategory" element={<PrivateRoute element={<SubcategoriesPage />} />} />
            <Route path="technicalarea" element={<PrivateRoute element={<TechnicalAreaPage />} />} />
            <Route path="locations" element={<PrivateRoute element={<Locations />} />} />
            <Route path="permissions" element={<PrivateRoute element={<Permissions />} />} />
            <Route path="settings" element={<PrivateRoute element={<SettingsPage />} />} />
          </Route>
          <Route path="*" element={<Lost />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
