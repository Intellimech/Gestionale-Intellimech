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
import quotationrequest from './quotationrequest/quotationrequestrouter.js';
import permission from './permission/permissionrouter.js';
import offer from './offer/offerrouter.js';
import subcategory from './subcategory/subcategoryrouter.js';
import category from './category/categoryrouter.js';
import technicalarea from './technicalarea/technicalarearouter.js';
import salesorder from './salesorder/salesorderrouter.js';
import job from './job/jobrouter.js';
import reporting from './reporting/reportingrouter.js';
import task from './tasks/taskrouter.js';
import notification from './notification/notificationrouter.js';

router.use((req, res, next) => {
    // Log the request
    logger('debug', `Request: ${req.method} ${req.originalUrl} | From: ${(req.ip == '::1') ? 'localhost' : req.ip}`, req, 'mainrouter');
    
    // get the token from the header if present
    const token = req.headers['authorization']?.split(' ')[1];

    // // if no token found, return response (without going to the next middleware)
    // if (token && !['/auth/login', '/auth/register', '/auth/verify', '/auth/forgotpassword', '/auth/resetpassword'].includes(req.path)) {
    //     jwt.verify(token, publicKey)
    //     .then(user => {
    //         const User = sequelize.models.User;
    //         return User.findOne({ where: { id_user: user.id_user } });
    //     })
    //     .then(foundUser => {
    //         if (!foundUser) {
    //             return res.status(401).json({ message: 'User not found' });
    //         }
    //         req.user = foundUser;
    //         next();
    //     })
    //     .catch(error => {
    //         if (error instanceof jwt.TokenExpiredError) {
    //             return res.status(403).json({ message: 'Token expired' });
    //         } else if (error instanceof jwt.JsonWebTokenError) {
    //             return res.status(403).json({ message: 'Invalid token' });
    //         } else {
    //             return res.status(500).json({ message: 'Internal server error' });
    //         }
    //     });
    // } else {
    //     next();
    // }

    next();
});


router.use('/', auth);
router.use('/', user);
router.use('/', company);
router.use('/', invoices);
router.use('/', roles);
router.use('/', group);
router.use('/', quotationrequest);  
router.use('/', permission);
router.use('/', offer);
router.use('/', subcategory);
router.use('/', category);
router.use('/', technicalarea);
router.use('/', salesorder);
router.use('/', job);
router.use('/', reporting);
router.use('/', task);
router.use('/', notification);


export default router;