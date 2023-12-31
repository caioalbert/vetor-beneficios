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

  return axios.post(API_URL + 'customers', payload, config)
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
};

const AsaasCreateCustomerCall = {
  call
};

module.exports = AsaasCreateCustomerCall;