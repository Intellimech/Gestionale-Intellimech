import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import sequelize from '../utils/db.js';

const __dirname = path.resolve();

const publicKey = fs.readFileSync(
    path.resolve(__dirname, "./src/keys/public.key")
);

// Setup the express router
const router = express.Router();

import auth from './auth/authrouter.js';
import user from './user/userrouter.js';
import company from './company/companyrouter.js';
import invoices from './invoices/invoicerouter.js';
import roles from './role/rolerouter.js';
import group from './group/grouprouter.js';
import subgroup from './subgroup/subgrouprouter.js';
import quotationrequest from './quotationrequest/quotationrequestrouter.js';
import permission from './permission/permissionrouter.js';
import offer from './offer/offerrouter.js';
import purchase from './purchase/purchaserouter.js';
import subcategory from './subcategory/subcategoryrouter.js';
import locations from './locations/locationsrouter.js';
import category from './category/categoryrouter.js';
import technicalarea from './technicalarea/technicalarearouter.js';
import salesorder from './salesorder/salesorderrouter.js';
import job from './job/jobrouter.js';
import workingsite from './workingsite/workingsiterouter.js'
import reporting from './reporting/reportingrouter.js';
import task from './tasks/taskrouter.js';
// import product from './product/productrouter.js';
import notification from './notification/notificationrouter.js';
import contracttype from './contracttype/contracttyperouter.js'
import assignment from './assignment/assignmentrouter.js'
import clienttype from './clienttype/clienttyperouter.js';
import calendar from './calendar/calendarrouter.js';
import projecttype from './projecttype/projecttyperouter.js';
import holidaysleaves from './holidays-leaves/holidaysleavesrouter.js';
import contract from './contract/contractrouter.js';
import paymentmethod from './paymentmethod/paymentmethodrouter.js';
import currency from './currency/currencyrouter.js';
import purchaserow from './purchaserow/purchaserowrouter.js';
import subsubcategory from './subsubcategory/subsubcategoryrouter.js'
import recurrence from './recurrence/recurrencerouter.js'
import mailinglist from './mailinglist/mailinglistrouter.js';
import reportingindirect from './reportingindirect/reportingindirectrouter.js';
import eventrouter from './event/eventrouter.js';
import contractrow from './contractrow/contractrowrouter.js'
router.use((req, res, next) => {
    logger('debug', `Request: ${req.method} ${req.originalUrl} | From: ${(req.ip == '::1') ? 'localhost' : req.ip}`, req, 'mainrouter');
    next();
});

router.use('/', auth);
router.use('/', locations);
router.use('/', user);
router.use('/', company);
router.use('/', invoices);
router.use('/', roles);
router.use('/', assignment);
router.use('/', subgroup);
router.use('/', group);
router.use('/', quotationrequest);
router.use('/', permission);
router.use('/', purchase);
router.use('/', offer);
router.use('/', subcategory);
router.use('/', category);
router.use('/', technicalarea);
router.use('/', salesorder);
router.use('/', workingsite);
router.use('/', job);
router.use('/', contracttype);
router.use('/', clienttype);
router.use('/', projecttype);
router.use('/', paymentmethod);
// router.use('/', reporting);
router.use('/', currency);
router.use('/', reporting);
router.use('/', task);
// router.use('/', product);
router.use('/', notification);
router.use('/', calendar);
router.use('/', holidaysleaves);
router.use('/', contract);
router.use('/', purchaserow);
router.use('/', subsubcategory);
router.use('/', recurrence);
router.use('/', mailinglist);
router.use('/', eventrouter);
router.use('/', reportingindirect);
router.use('/', contractrow);

export default router;
