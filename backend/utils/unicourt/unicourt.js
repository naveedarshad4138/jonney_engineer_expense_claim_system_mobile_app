const axios = require('axios');
const { getToken } = require('./unicourtAuth'); // Auth method

const searchUnicourtCases = async (ownerName = '', businessName = '', type = 'business') => {
  try {
    const token = await getToken();

    const queryParts = [];

    if (ownerName?.trim()) {
      queryParts.push(`(Party:(name:(${ownerName.trim()})))`);
    }

    if (businessName?.trim()) {
      queryParts.push(`(Party:(name:(${businessName.trim()})))`);
    }

    if (queryParts.length === 0) {
      return {
        debug_info: 'No search terms provided',
        cases: [],
        raw_response: null,
      };
    }

    const query = queryParts.length > 1 ? `(${queryParts.join(' OR ')})` : queryParts[0];

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    let pageNumber = 1;
    let hasMorePages = true;
    let totalPages = 1;
    let allCasesRaw = [];
    const result = {
      debug_info: {
        owner_name: ownerName,
        business_name: businessName,
        generated_url: '',
        http_code: 200,
      },
      cases: [],
      raw_response: null, // Will populate at the end
    };

    let rawTemplate = null;

    while (hasMorePages) {
      const url = `https://enterpriseapi.unicourt.com/caseSearch?q=${encodeURIComponent(query)}&sort=filedDate&order=desc&pageNumber=${pageNumber}`;

      if (pageNumber === 1) {
        result.debug_info.generated_url = url;
      }

      const response = await axios.get(url, { headers });
      const data = response.data;

      if (pageNumber === 1) {
        rawTemplate = { ...data }; // base raw_response from first page
        totalPages = data.totalPages || 1;
      }

      const cases = data.caseSearchResultArray || [];
      allCasesRaw.push(...cases);

      for (const caseData of cases) {
        result.cases.push({
          caseName: caseData.caseName || 'N/A',
          caseNumber: caseData.caseNumber || 'N/A',
          filedDate: caseData.filedDate || 'N/A',
          courtName: caseData.court?.name || 'N/A',
          caseClass: caseData.caseType?.caseClass || caseData.caseClass || 'N/A',
        });
      }

      pageNumber++;
      if (pageNumber > totalPages) {
        hasMorePages = false;
      }
    }

    // Modify raw_response to include all cases
    result.raw_response = {
      ...rawTemplate,
      caseSearchResultArray: allCasesRaw,
    };

    return result;

  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || err.message;

    return {
      debug_info: {
        error: err.message,
        http_code: status,
      },
      cases: [],
      raw_response: data,
      error: status === 401
        ? 'Unauthorized. Token might be expired.'
        : `UniCourt API failed (HTTP ${status})`,
    };
  }
};

module.exports = {
  searchUnicourtCases,
};
