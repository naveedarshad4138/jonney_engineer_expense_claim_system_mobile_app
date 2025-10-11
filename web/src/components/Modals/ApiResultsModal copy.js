import React from 'react';

const formatCurrency = (value) => {
  value = parseFloat(value || 0);
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatMonth = (monthStr) => {
  const date = new Date(monthStr + '-01');
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const OcrolusBookResults = ({ data }) => {
  if (!data) return <p>No book data available.</p>;

  const months = Object.keys(data.revenue_by_month || {}).sort();

  const makeRow = (label, mapFn) => (
    <tr>
      <td>{label}</td>
      {months.map((month) => (
        <td key={month}>{mapFn(month)}</td>
      ))}
    </tr>
  );

  return (
    <>
      <h3>📊 Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            {months.map((m) => (
              <th key={m}>{formatMonth(m)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {makeRow('Deposits ($)', (m) => formatCurrency(data.deposits_by_month?.[m]))}
          {makeRow('Revenue ($)', (m) => formatCurrency(data.revenue_by_month?.[m]))}
          {makeRow('Avg Daily Balance ($)', (m) =>
            formatCurrency(data.average_daily_balance_by_month?.[m])
          )}
          {makeRow('Negative Balance Days', (m) => data.negative_balances_by_month?.[m]?.length || 0)}
          {makeRow('NSF Fees', (m) => parseInt(data.nsf_fee_count_by_month?.[m] || 0))}
        </tbody>
      </table>

      <h3>💸 Debt</h3>
      {data.fintech_loan_sources?.length > 0 || data.fintech_mca_sources?.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Deposit Sum ($)</th>
              <th>Payment ($)</th>
              <th>Payment Frequency (Days)</th>
            </tr>
          </thead>
          <tbody>
            {data.fintech_loan_sources.map((l, idx) => (
              <tr key={idx}>
                <td>{l.source || 'N/A'}</td>
                <td>{formatCurrency(l.deposit_sum)}</td>
                <td>{formatCurrency(Math.abs(l.pmt_sum) / l.pmt_count || 0)}</td>
                <td>{l.pmt_frequency_days || 0} Days</td>
              </tr>
            ))}
            {data.fintech_mca_sources.map((l, idx) => (
              <tr key={idx}>
                <td>{l.source || 'N/A'}</td>
                <td>{formatCurrency(l.deposit_sum)}</td>
                <td>{formatCurrency(Math.abs(l.pmt_sum) / l.pmt_count || 0)}</td>
                <td>{l.pmt_frequency_days || 0} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No loan source data found.</p>
      )}
    </>
  );
};
const DataMerchResults = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No DataMerch records found.</p>;
  }

  return data.map((entry, index) => {
    const merchant = entry.merchant || {};
    const notes = merchant.notes || [];

    return (
      <div key={index} className='merchant-results'>
        <h3>🏢 Merchant Information</h3>
        <ul>
          {merchant.fein && (
            <li>
              <strong>Merchant:</strong> Fein: {merchant.fein};
              {merchant.legal_name && ` Legal Name: ${merchant.legal_name}`}
              {merchant.city && ` ; City: ${merchant.city}`}
              {merchant.state && `; State: ${merchant.state}`}
            </li>
          )}
          {merchant.legal_name && (
            <li>
              <strong>Legal Name:</strong> {merchant.legal_name}
            </li>
          )}
          {merchant.city && (
            <li>
              <strong>City:</strong> {merchant.city}
            </li>
          )}
          {merchant.state && (
            <li>
              <strong>State:</strong> {merchant.state}
            </li>
          )}
          {notes.map((n, i) => {
            const note = n.note;
            return (
              <li key={i} className="note-block">
                <strong>Note:</strong> {note.note}; Category: {note.category};
                Added By: {note.added_by}; Created At:{' '}
                {new Date(note.created_at).toLocaleDateString()}
              </li>
            );
          })}
        </ul>
      </div>
    );
  });
};
const StackAIDeepSearchResults = ({ output }) => {
  if (!output) return '';

  return (
    <div className="section">
        <div className="deep-search-results">
        <h3>🧠 Deep Business + Owner Insight</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{output}</pre>
        </div>
    </div>
  );
};

export const ApiResultsModal = ({ isOpen, setIsModalOpen, results }) => {
  const OcrolusbookData = results?.summary?.data; // adjust key if it's named differently


  return (
    <div className={`results-modal ${isOpen ? 'd-flex' : 'd-none'}`} id="results-modal">
      <div className="modal-content">
        <div className="close-modal" id="close-modal" onClick={()=> setIsModalOpen(false)}>
          <i className="material-icons">close</i>
        </div>

        <div className="modal-header">
          <h2>Your Business Analysis Results</h2>
        </div>

        <div className="modal-body" id="api-results">
          <div className="section">
            <h2>🧾 Unicourt Results <span className="api-status status-success">Connected</span></h2>
            {results?.courtRecords?.raw_response?.caseSearchResultArray?.length > 0 ? (
              results.courtRecords.raw_response.caseSearchResultArray.map((caseItem, index) => (
                <div key={index} className="unicourt-case">
                  <ul>
                    <li><strong>Case Name:</strong> {caseItem.caseName}</li>
                    <li><strong>Case Number:</strong> {caseItem.caseNumber}</li>
                    <li><strong>Filed Date:</strong> {new Date(caseItem.filedDate).toLocaleDateString()}</li>
                    <li><strong>Court:</strong> {caseItem.court?.name || 'N/A'}</li>
                    <li><strong>Case Class:</strong> {caseItem.caseType?.caseClass || 'N/A'}</li>
                    <li><strong>Case Status:</strong> {caseItem.caseStatus?.name || 'N/A'}</li>
                  </ul>
                </div>
              ))
            ) : (
              <p className="no-results">There are no case results</p>
            )}
          </div>
          
            <StackAIDeepSearchResults output={results?.deepsearch?.data?.outputs?.['out-0']} />
     
          <div className="section">
            <h2>💼 DataMerch Results
                <span className="api-status status-success">Connected</span>
            </h2>
            <DataMerchResults data={results?.datamerch} />
            </div>

          <div className="section">
            <h2>💼 Book Results</h2>
            <div id="data-section">
              <OcrolusBookResults data={OcrolusbookData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
