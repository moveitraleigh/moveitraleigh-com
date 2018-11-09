import nodemailer from 'nodemailer';

const user =process.env[`${BRANCH_ENV}_GMAIL_LOGIN`];
const serviceClient = process.env.GMAIL_CLIENT_ID;
const privateKey = process.env.GMAIL_PRIVATE_KEY.replace(/\\n/g, "\n");

export default class {
  constructor () {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user,
        serviceClient,
        privateKey
      }
    });
  }
  
  send (mailOptions) {
    mailOptions.from = user;
    return this.transporter.sendMail(mailOptions);
  }
};