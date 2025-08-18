const axios = require('axios');

async function fetchDeepResearch(businessName, ownerName) {
  const apiUrl = "https://api.stack-ai.com/inference/v0/run/d83dhj41-72b0-4fd7-65ce-90ef9bd681b7/685c9fad1e4c036587e9a648";
  const apiKey = "6302a599-d9eb-416b-8df7-31da557f0415";

  const payload = {
    "in-0": businessName,
    "in-1": ownerName
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const output = response?.data;
    console.log(output)
    if (!output) {
      return { error: "No output returned from Stack AI", raw: response.data };
    }

    return { data: output };

  } catch (error) {
    if (error.response) {
      return {
        error: `API Error: ${error.response.status}`,
        details: error.response.data
      };
    } else {
      return { error: `Request failed: ${error.message}` };
    }
  }
}

module.exports = fetchDeepResearch;
