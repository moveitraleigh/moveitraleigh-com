'use strict';

import SquareConnect from 'square-connect';
import uuid from 'uuid';
import Emailer from '../svc/email.js';

const defaultClient = SquareConnect.ApiClient.instance;
const emailer = new Emailer();

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env[`${BRANCH_ENV}_SQUARE_ACCESS_TOKEN`];
 
const locationId = process.env[`${BRANCH_ENV}_SQUARE_LOC_ID`];

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

    const referenceInfo = {
        note: `${params.viptix} VIP tickets requested`
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
      <p>If you have questions.  Please reach out.</p>
      <p></p>
      <p>Thank you,<br>
      Move It Raleigh<br>
      <a href="https://moveitraleigh.com/">https://moveitraleigh.com</a><br>
      <a href="mailto:info@moveitraleigh.com">info@moveitraleigh.com</a></p>`
    }

    const mirEmailOptions = {
      to: 'brett.lewis@gmail.com',
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
        VIP Tickets Requested: ${params.viptix}
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
