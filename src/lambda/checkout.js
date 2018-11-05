'use strict';

import SquareConnect from 'square-connect';
import uuid from 'uuid';
import querystring from 'querystring';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const defaultClient = SquareConnect.ApiClient.instance;

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env[`${BRANCH_ENV}_SQUARE_ACCESS_TOKEN`];
 
const locationId = process.env[`${BRANCH_ENV}_SQUARE_LOC_ID`];

// const clientEmail = process.env[`${BRANCH_ENV}_GMAIL_WSLOGIN`];
const fromEmail = process.env[`${BRANCH_ENV}_GMAIL_LOGIN`];
const clientId = process.env[`${BRANCH_ENV}_GMAIL_CLIENT_ID`];
const privateKey = process.env[`${BRANCH_ENV}_GMAIL_PRIVATE_KEY`].replace(/\\n/g, "\n");

// const jwtClient = new google.auth.JWT(
//   clientEmail,
//   null,
//   privateKey,
//   ['https://www.googleapis.com/auth/gmail.compose'],
//   fromEmail
// );

function sendMail (toEmail, subject, body) {
    // jwtClient.authorize(function(error, token) {
    //   if (error) {
    //     console.log(error);
    //     return Promise.reject(error);
    //   }
    // 
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: fromEmail,
          serviceClient: clientId,
          privateKey: privateKey
        }
      });
      
      transporter.verify(function(error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log('Server is ready to take our messages');
        }
      });
      
      return transporter.sendMail({
          from: fromEmail,
          to: toEmail,
          subject: subject,
          text: body
      });
    // })
}

exports.handler = async function(event, context) {
  
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // When the method is POST, the name will no longer be in the event’s
    // queryStringParameters – it’ll be in the event body encoded as a query string
    const params = querystring.parse(event.body);
    
    const sponsorBody = 'Hey man, thank you!';
    return sendMail(params.email, 'Thank you from Move It Raleigh!', sponsorBody)
      .then(() => ({ statusCode: 200, body: 'Hey there!' }))
      .catch(error => ({ statusCode: 500, body: JSON.stringify(error) }));

    const buyerInfo = {
        buyer_email_address: params.email,
        billing_address: {
            address_line_1: params.addr1,
            address_line_2: params.addr2,
            administrative_district_level_1: params.state,
            locality: params.city,
            postal_code: params.zip,
            country: 'US'
        }
    };

    const cardNonce = params.nonce;
    var idempotencyKey = uuid();

    const paymentInfo = {
        idempotency_key: idempotencyKey,
        amount_money: {
            amount: params.amount * 100,
            currency: 'USD',
        },
        card_nonce: cardNonce
    };

    const referenceInfo = {
        note: `${params.viptix} VIP tickets requested`
    };

    const transactionInfo = Object.assign({}, buyerInfo, paymentInfo, referenceInfo);

    const api = new SquareConnect.TransactionsApi();

    return api.charge(locationId, transactionInfo)
        .then((data) => {
          const sponsorBody = 'Hey man, thank you!';
          sendMail(params.email, 'Thank you from Move It Raleigh!', sponsorBody);
          return {statusCode: 200, body: JSON.stringify(data)};
        })
        .catch((error) => {
          const sponsorBody = 'Hey man, did not work!';
          sendMail(params.email, 'Thank you from Move It Raleigh!', sponsorBody);
          return {statusCode: 500, body: JSON.stringify(error)}
        });
};
