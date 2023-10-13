const axios = require('axios');
const SiprovAuthenticator = require('./authenticator');
const API_URL = process.env.SIPROV_API_URL;


function call(requestPayload) {
  let payload = JSON.stringify(requestPayload);

  SiprovAuthenticator.call()
    .then(authData => {
      let config = {
        headers: {
          Authorization: 'Bearer ' + authData.authorizationToken,
          accept: 'application/json',
          'Content-Type': 'application/json'
        }
      };
    
      console.log(config)
      console.log(payload)

      axios.post(API_URL + 'ext/associado', payload, config)
        .then(response => {
          console.log('Resposta da solicitação:', response.data);
          return response.data;
        })
        .catch(error => {
          console.error('Erro na solicitação.' + error.message);
          console.error('Erro na solicitação.' + error.response.data);
        });
    })
    .catch(err => {
      console.error(err.message);
    });
}

const SiprovCreateCustomerCall = {
  call,
};

module.exports = SiprovCreateCustomerCall;
