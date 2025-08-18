const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenId = null;

const listAllTokens = async () => {
  const res = await axios.put(`${process.env.UNICOURT_BASE}/listAllTokenIds`, {
    clientId: process.env.UNICOURT_CLIENT_ID,
    clientSecret: process.env.UNICOURT_CLIENT_SECRET,
  });

  return res.data.AccessTokenIdArray;
};

const invalidateToken = async (id) => {
  return axios.put(`${process.env.UNICOURT_BASE}/invalidateToken`, {
    clientId: process.env.UNICOURT_CLIENT_ID,
    clientSecret: process.env.UNICOURT_CLIENT_SECRET,
    tokenId: id,
  });
};

const getToken = async () => {
  if (cachedToken) return cachedToken;

  try {
    const res = await axios.post(`${process.env.UNICOURT_BASE}/generateNewToken`, {
      clientId: process.env.UNICOURT_CLIENT_ID,
      clientSecret: process.env.UNICOURT_CLIENT_SECRET,
    });

    cachedToken = res.data.accessToken;
    tokenId = res.data.tokenId;
    return cachedToken;
  } catch (error) {
    if (error.response?.data?.message === 'LIMIT_REACHED') {
      console.warn('⚠️ Token limit reached. Cleaning up old tokens...');

      const tokens = await listAllTokens();
      for (const t of tokens) {
        await invalidateToken(t.tokenId);
        console.log(`🔁 Invalidated token: ${t.tokenId}`);
      }

      return getToken(); // Retry after cleanup
    }

    console.error('❌ Failed to get UniCourt token:', error.message);
    throw error;
  }
};

module.exports = {
  getToken,
};
