import nodemailer from 'nodemailer';
import Logger from './logger.js';
import dotenv from 'dotenv';

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS, // generated ethereal password
  },
});

export default transporter;