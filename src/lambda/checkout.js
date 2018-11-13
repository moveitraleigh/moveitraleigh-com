'use strict';

import SquareConnect from 'square-connect';
import uuid from 'uuid';
import Emailer from '../svc/email.js';

const defaultClient = SquareConnect.ApiClient.instance;
const emailer = new Emailer();

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env[`${BRANCH_ENV}_SQUARE_ACCESS_TOKEN`];
 
const locationId = process.env[`${BRANCH_ENV}_SQUARE_LOC_ID`];
const notifyEmail = process.env[`${BRANCH_ENV}_NOTIFY_EMAIL`] || 'brett.lewis@gmail.com';

exports.handler = function(event, context, callback) {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        callback({ statusCode: 405, body: 'Method Not Allowed' }, null);
    }

    // When the method is POST, the name will no longer be in the event’s
    // queryStringParameters – it’ll be in the event body encoded as a query string
    const params = JSON.parse(event.body);
    
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

    let noteSuffix;

    if (params.amount >= 500) {
      noteSuffix = `${params.viptix} VIP tickets requested`;
    } else if (params.amount >= 100) {
      noteSuffix = '4 tickets included';
    } else if (params.amount >= 50) {
      noteSuffix = '2 tickets included';
    } else {
      noteSuffix = 'no tickets included';
    }

    const referenceInfo = {
        note: `${params.donorName} - ${noteSuffix}`
    };

    const transactionInfo = Object.assign({}, buyerInfo, paymentInfo, referenceInfo);
    const api = new SquareConnect.TransactionsApi();

    const sponsorEmailOptions = {
      to: params.email,
      subject: 'Thank You from Move It Raleigh!',
      html: `
      <p>Thank you for the sponsoring the Move It Raleigh Benefit Concert.  All proceeds will be donated to Helping Hand Mission of Raleigh and dance studios impacted by Hurricane Florence.</p>
      <p>This is a tax deductible donation.</p>
      <p>We appreciate your support.  We hope to see you at the Benefit Concert on December 2nd from 6pm to 8pm at Rolesville High School.</p>
      <p>If you have questions, please reach out.</p>
      <p></p>
      <p>Thank you,<br>
      Move It Raleigh<br>
      <a href="https://moveitraleigh.com/">https://moveitraleigh.com</a><br>
      <a href="mailto:info@moveitraleigh.com">info@moveitraleigh.com</a></p>`
    }

    const mirEmailOptions = {
      to: notifyEmail,
      subject: 'New Sponsor for Move It Raleigh',
      text: `
        Name: ${params.donorName}
        Business: ${params.business}
        Email: ${params.email}
        Address 1: ${params.addr1}
        Address 2: ${params.addr2}
        City: ${params.city}
        State: ${params.state}
        ZIP: ${params.zip}
        Amount: ${params.amount}
        Tickets: ${noteSuffix}
      `
    }

    api.charge(locationId, transactionInfo)
        .then((data) => {
          console.log(data);
          emailer.send(sponsorEmailOptions);
          emailer.send(mirEmailOptions);
          callback(null, {
            statusCode: 200, 
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true"
            },
            body: JSON.stringify(data)});
        })
        .catch((error) => {
          callback({statusCode: 500, body: JSON.stringify(error)}, null);
        });
};
