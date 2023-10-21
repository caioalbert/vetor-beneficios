const axios = require('axios');
const SiprovAuthenticator = require('./authenticator');
const API_URL = process.env.SIPROV_API_URL;

async function call(requestPayload, token) {
  try {
    let payload = JSON.stringify(requestPayload);
    let config = {
      headers: {
        Authorization: 'Bearer ' + token,
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
    const response = await axios.post(API_URL + 'ext/beneficio', payload, config);
    console.log('Resposta da solicitação:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro na solicitação.' + error.message);
    console.error('Erro na solicitação.' + error.response.data);
    throw error;
  }
}

const SiprovCreateBenefitCall = {
  call,
};

module.exports = SiprovCreateBenefitCall;
