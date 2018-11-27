function buildForm(form) {
  if (SqPaymentForm.isSupportedBrowser()) {
    form.build();
    form.recalculateSize();
  }
}

var isCalled = false;
var gaEnabled = !!(window.ga);

if (gaEnabled) {
  ga('require', 'ecommerce');
}
/*
 * function: requestCardNonce
 *
 * requestCardNonce is triggered when the "Pay with credit card" button is
 * clicked
 *
 * Modifying this function is not required, but can be customized if you
 * wish to take additional action when the form button is clicked.
 */
function requestCardNonce(event) {

  // Don't submit the form until SqPaymentForm returns with a nonce
  event.preventDefault();

  // Request a nonce from the SqPaymentForm object
  if (!isCalled) {
    paymentForm.requestCardNonce();    
  }
}

// Create and initialize a payment form object
var paymentForm = new SqPaymentForm({

  // Initialize the payment form elements
  applicationId: applicationId,
  locationId: locationId,
  inputClass: 'sq-input',
  autoBuild: false,

  // Customize the CSS for SqPaymentForm iframe elements
  inputStyles: [{
    fontSize: '18px',
    fontFamily: 'Helvetica Neue',
    padding: '0',
    color: '#373F4A',
    backgroundColor: 'transparent',
    lineHeight: '20px',
    placeholderColor: '#CCC',
    _webkitFontSmoothing: 'antialiased',
    _mozOsxFontSmoothing: 'grayscale'
  }],

  // Initialize Apple Pay placeholder ID
  applePay: false,

  // Initialize Masterpass placeholder ID
  masterpass: false,

  // Initialize the credit card placeholders
  cardNumber: {
    elementId: 'sq-card-number',
    placeholder: '• • • •  • • • •  • • • •  • • • •'
  },
  cvv: {
    elementId: 'sq-cvv',
    placeholder: 'CVV'
  },
  expirationDate: {
    elementId: 'sq-expiration-date',
    placeholder: 'MM/YY'
  },
  postalCode: {
    elementId: 'sq-postal-code',
    placeholder: '12345'
  },

  // SqPaymentForm callback functions
  callbacks: {
    /*
     * callback function: createPaymentRequest
     * Triggered when: a digital wallet payment button is clicked.
     * Replace the JSON object declaration with a function that creates
     * a JSON object with Digital Wallet payment details
     */
    createPaymentRequest: function () {

      return {
        requestShippingAddress: false,
        requestBillingInfo: true,
        currencyCode: "USD",
        countryCode: "US",
        total: {
          label: "MERCHANT NAME",
          amount: "100",
          pending: false
        },
        lineItems: [
          {
            label: "Subtotal",
            amount: "100",
            pending: false
          }
        ]
      }
    },

    /*
     * callback function: cardNonceResponseReceived
     * Triggered when: SqPaymentForm completes a card nonce request
     */
    cardNonceResponseReceived: function (errors, nonce, cardData) {
      isCalled = true;
      const alert = document.getElementById('notification');   
      const formFields = {
        donorName: document.getElementById('donorName'),
        business: document.getElementById('business'),
        email: document.getElementById('email'),
        addr1: document.getElementById('addr1'),
        addr2: document.getElementById('addr2'),
        city: document.getElementById('city'),
        state: document.getElementById('state'),
        zip: document.getElementById('zip'),
        amount: document.getElementById('amount-other'),
        amountDropdown: document.getElementById('amount'),
        nonce: document.getElementById('card-nonce')
      };

      // Assign the nonce value to the hidden form field
      formFields.nonce.value = nonce;
      fetch('/checkout', {
        method: 'post',
        body: JSON.stringify({
          donorName: formFields.donorName.value,
          business: formFields.business.value,
          email: formFields.email.value,
          addr1: formFields.addr1.value,
          addr2: formFields.addr2.value,
          city: formFields.city.value,
          state: formFields.state.value,
          zip: formFields.zip.value,
          amount: (formFields.amountDropdown.value === 'other') ? formFields.amount.value : formFields.amountDropdown.value,
          nonce: formFields.nonce.value
        })
      })
      .then(data => data.json())
      .then(data => {
        if (gaEnabled) {
          const options = {
            'id': data.transaction.id,
            'affiliation': 'Move It Raleigh Website',
            'revenue': (data.transaction.tenders[0].amount_money.amount/100).toFixed(2),
            'currency': 'USD'
          };
          ga('ecommerce:addTransaction', options);
          ga('ecommerce:send');
        }
        donorName.value = business.value = email.value = addr1.value = addr2.value = city.value = state.value = zip.value = amount.value = amountDropdown.value = '';
        window.location.replace('/sponsor/thankyou');
      })
      .catch(error => {
        isCalled = false;
        alert.innerHTML = 'Something went wrong. Please try again.';
        alert.classList.add('alert-danger');
        alert.classList.add('fade-in-out');
        alert.classList.remove('hidden');
      });
    },

    /*
     * callback function: unsupportedBrowserDetected
     * Triggered when: the page loads and an unsupported browser is detected
     */
    unsupportedBrowserDetected: function () {
      /* PROVIDE FEEDBACK TO SITE VISITORS */
    },

    /*
     * callback function: inputEventReceived
     * Triggered when: visitors interact with SqPaymentForm iframe elements.
     */
    inputEventReceived: function (inputEvent) {
      switch (inputEvent.eventType) {
        case 'focusClassAdded':
          /* HANDLE AS DESIRED */
          break;
        case 'focusClassRemoved':
          /* HANDLE AS DESIRED */
          break;
        case 'errorClassAdded':
          document.getElementById("error").innerHTML = "Please fix card information errors before continuing.";
          break;
        case 'errorClassRemoved':
          /* HANDLE AS DESIRED */
          document.getElementById("error").style.display = "none";
          break;
        case 'cardBrandChanged':
          /* HANDLE AS DESIRED */
          break;
        case 'postalCodeChanged':
          /* HANDLE AS DESIRED */
          break;
      }
    },

    /*
     * callback function: paymentFormLoaded
     * Triggered when: SqPaymentForm is fully loaded
     */
    paymentFormLoaded: function () {
      /* HANDLE AS DESIRED */
    }
  }
});