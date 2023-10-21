const axios = require('axios');
const API_URL = process.env.SIPROV_API_URL;

function call(requestPayload, token) {
  return new Promise((resolve, reject) => {
    let payload = JSON.stringify(requestPayload);

    const config = {
      headers: {
        Authorization: 'Bearer ' + token,
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };

    axios.post(API_URL + 'ext/associado', payload, config)
      .then(response => {
        console.log('Resposta da solicitação:', response.data);
        resolve(response.data);
      })
      .catch(error => {
        console.error('Erro na solicitação.' + error.message);
        console.error('Erro na solicitação.' + error.response.data);
        reject(error);
      });
  });
}

const SiprovCreateCustomerCall = {
  call,
};

module.exports = SiprovCreateCustomerCall;
