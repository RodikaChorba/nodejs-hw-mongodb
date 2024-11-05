import nodemailer from 'nodemailer';
import { env } from '../utils/env.js';

const transporter = nodemailer.createTransport({
  host: env('SMTP_HOST'),
  port: Number(env('SMTP_PORT')),
  secure: false,
  auth: {
    user: env('SMTP_USER'),
    pass: env('SMTP_PASSWORD'),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail(options);
    return info;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};
