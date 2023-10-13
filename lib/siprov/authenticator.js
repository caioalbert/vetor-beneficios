require('dotenv').config();

const axios = require('axios');
const API_URL = process.env.SIPROV_API_URL;
const TOKEN = process.env.SIPROV_API_TOKEN;

const call = () => {
  const config = {
    headers: {
      'Authorization': `Basic ${TOKEN}`
    }
  };

  return axios.post(API_URL + 'ext/autenticacao', {}, config)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      console.error('Erro na solicitação:', error);
      throw error;
    });
};

const SiprovAuthenticator = {
  call
};

module.exports = SiprovAuthenticator;
