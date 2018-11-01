'use strict';

import SquareConnect from 'square-connect';
const defaultClient = SquareConnect.ApiClient.instance;

const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = 'sandbox-sq0atb-pJTU388CMPQMom5c4FozdA';

const locationId = 'CBASEN7nTi_Fev1nNBLJ_jtM0I0gAQ';

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
var idempotencyKey = 'oncnweiuniwuniniuwndudinq';

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

exports.handler = async function(event, context, callback) {
    return api.charge(locationId, transactionInfo)
        .then((data) => callback(null, {statusCode: 200, body: JSON.stringify(data)}))
        .catch((error) => callback({status: 500, body: JSON.stringify(error)}));
};
