// datamerch.js

const axios = require('axios');
require('dotenv').config();

/**
 * Get access token from DataMerch
 */
async function getAccessToken() {
  const payload = {
    auth: {
      authentication_token: process.env.DATAMERCH_AUTH_TOKEN,
      authentication_key: process.env.DATAMERCH_AUTH_KEY,
    },
  };

  try {
    const response = await axios.post(process.env.DATAMERCH_MERCHANT_URL+'/api/v2/token', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
// console.log('✅ DataMerch token retrieved successfully', response.data);
    if (response.data && response.data?.token) {
      return response.data.token;
    } else {
      throw new Error('No token returned from DataMerch');
    }
  } catch (error) {
    console.error('❌ Error getting token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Search merchant by EIN
 * @param {string} ein - 9-digit EIN (e.g. "123456789")
 */
async function searchMerchantByEIN(ein) {
//   if (!/^\d{9}$/.test(ein)) {
//     throw new Error('EIN must be a 9-digit number.');
//   }

  const token = await getAccessToken();

  const url = `${process.env.DATAMERCH_MERCHANT_URL}/api/v2/merchants/${ein}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: token,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error searching merchant:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { searchMerchantByEIN };
