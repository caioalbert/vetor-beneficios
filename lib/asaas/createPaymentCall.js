const axios = require('axios');
const API_URL = process.env.ASAAS_API_URL;
const TOKEN = process.env.ASAAS_API_TOKEN;

const call = (payload) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'access_token': TOKEN
    }
  };

  console.log(payload)

  return axios.post(API_URL + 'payments', payload, config)
    .then(response => {
      return response.data
    })
    .catch(error => {
      throw error;
    });
};

const AsaasCreatePaymentCall = {
  call
};

module.exports = AsaasCreatePaymentCall;