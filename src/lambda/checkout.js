'use strict';

import SquareConnect from 'square-connect';
import uuid from 'uuid';
import querystring from 'querystring';

const defaultClient = SquareConnect.ApiClient.instance;

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = process.env[`${BRANCH_ENV}_APP_ID`];
 
const locationId = process.env[`${BRANCH_ENV}_LOC_ID`];

exports.handler = async function(event, context) {
  
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // When the method is POST, the name will no longer be in the event’s
    // queryStringParameters – it’ll be in the event body encoded as a query string
    const params = querystring.parse(event.body);
    
    return {
        statusCode: 200,
        body: JSON.stringify(params)
    };
  
    const buyerInfo = {
        buyer_email_address: 'thebuyer@example.com',
        billing_address: {
            address_line_1: '500 Electric Ave',
            address_line_2: 'Suite 600',
            administrative_district_level_1: 'NY',
            locality: 'New York',
            postal_code: '20003',
            country: 'US'
        }
    };

    const cardNonce = 'fake-card-nonce-ok';
    var idempotencyKey = uuid();

    const paymentInfo = {
        idempotency_key: idempotencyKey,
        amount_money: {
            amount: 1000,
            currency: 'USD',
        },
        card_nonce: cardNonce
    };

    const referenceInfo = {
        reference_id: 'Ref #12345',
        note: 'Selected a $10 donation'
    };

    const transactionInfo = Object.assign({}, buyerInfo, paymentInfo, referenceInfo);

    const api = new SquareConnect.TransactionsApi();

    return api.charge(locationId, transactionInfo)
        .then((data) => ({statusCode: 200, body: JSON.stringify(data)}))
        .catch((error) => ({statusCode: 500, body: JSON.stringify(error)}));
};
