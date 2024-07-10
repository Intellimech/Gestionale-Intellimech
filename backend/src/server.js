// main.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import https from 'https';
import sequelize from './utils/db.js';
import Logger from './utils/logger.js';
import mail from './utils/smtp.js';
import { Doceasy } from './scheduler/doceasy.js';

import Role from './models/role.js';
import User from './models/user.js';
import Permissions from './models/permissions.js';
import rolepermissions from './models/rolepermissions.js';
import Associations from './models/associations.js';

// Caricamento delle variabili d'ambiente
dotenv.config();
const port = process.env.PORT || 3000;

// Inizializzazione di Doceasy
const doceasy = new Doceasy();
doceasy.checkServer();

// Inizializzazione dell'applicazione
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
import router from './routes/router.js';

app.use('/', router);

app.get('/', (req, res) => {
    res.send('Hello World!');
})

// Server
const httpServer = http.createServer(app);
const httpsServer = https.createServer(app);

// Database connection
sequelize.authenticate()
.then(() => {
    Logger('success','Database connection has been established successfully', null, 'sql');
    return true;
})
.catch(err => {
    Logger('error','Unable to connect to the database:', err, 'sql');
})

// Mail connection
mail.verify()
    .then(() => {
        Logger('success','Mail server connection has been established successfully', null, 'smtp');
        return true;
    })
    .catch(err => {
        Logger('error','Unable to connect to the mail server:', null, 'smtp');
    })

// Start server
if(process.env.ssl === 'true') {
    httpsServer.listen(port, () => {
        Logger('success', 'Server running on port ' + port, 'https');
        })
} else {
    httpServer.listen(port, () => {
        Logger('success', 'Server running on port ' + port, null, 'http');
        Logger('warning', 'SSL is disabled', null, 'http');
        })        
}

// doceasy.start();
doceasy.getActiveInvoices();
doceasy.getPassiveInvoices();