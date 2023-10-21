require('dotenv').config();

const axios = require('axios');
const API_URL = process.env.SIPROV_API_URL;
const TOKEN = process.env.SIPROV_API_TOKEN;

const call = async () => {
  const config = {
    headers: {
      'Authorization': `Basic ${TOKEN}`
    }
  };

  try {
    const response = await axios.post(API_URL + 'ext/autenticacao', {}, config);
    return response.data;
  } catch (error) {
    console.error('Erro na solicitação:', error);
    throw error;
  }
};

const SiprovAuthenticator = {
  call,
};

module.exports = SiprovAuthenticator;
