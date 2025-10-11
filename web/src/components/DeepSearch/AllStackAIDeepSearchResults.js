import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import useApi from "../../hooks/useApi";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

export const AllStackAIDeepSearchResults = ({ businessName, ownerName, domain, formId }) => {
  const { postData } = useApi(); 
  const [deepSearch, setDeepSearch] = useState({ result: '', loading: false, error: null });
  const [websiteSearch, setWebsiteSearch] = useState({ result: '', loading: false, error: null });

  useEffect(() => {
    const fetchDeepSearch = async () => {
      if (!businessName || !ownerName) return;
      
      setDeepSearch({ result: '', loading: true, error: null });

      try {
        const response = await axios.post(
          "https://api.stack-ai.com/inference/v0/run/d83dhj41-72b0-4fd7-65ce-90ef9bd681b7/685c9fad1e4c036587e9a648",
          {
            "in-0": businessName,
            "in-1": ownerName,
            user_id: "123"
          },
          {
            headers: {
              Authorization: "Bearer 6302a599-d9eb-416b-8df7-31da557f0415",
              "Content-Type": "application/json"
            }
          }
        );
        setDeepSearch({ result: response.data.outputs["out-0"], loading: false, error: null });
        try {
          await postData('/form/history-results', {
            form_id: formId,
            deepsearch: response || []
          });
          console.log('✅ WebsiteSearch saved');
        } catch (err) {
          console.error('❌ Error saving websiteSearch:', err.message);
        }
      } catch (err) {
        setDeepSearch({ result: '', loading: false, error: "Failed to fetch deep search" });
      }
    };

    const fetchWebsiteSearch = async () => {
      if (!domain) return;

      setWebsiteSearch({ result: '', loading: true, error: null });

      try {
        const response = await axios.post(
          "https://api.stack-ai.com/inference/v0/run/d83dhj41-72b0-4fd7-65ce-90ef9bd681b7/68558c13d43dd0fd85aebab8",
          {
            "in-0": domain
          },
          {
            headers: {
              Authorization: "Bearer 6302a599-d9eb-416b-8df7-31da557f0415",
              "Content-Type": "application/json"
            }
          }
        );

        const cleaned = response.data.outputs["out-0"]
          .replace(/'/g, '"')
          .replace(/\bNone\b/g, 'null');

        const parsed = JSON.parse(cleaned);
        setWebsiteSearch({ result: parsed, loading: false, error: null });
        try {
          await postData('/form/history-results', {
            form_id: formId,
            websiteSearch: response || []
          });
        } catch (err) {
          console.error('❌ Error saving websiteSearch:', err.message);
        }
      } catch (err) {
        setWebsiteSearch({ result: '', loading: false, error: "Failed to fetch website search" });
      }
    };

    fetchDeepSearch();
    fetchWebsiteSearch();
  }, [businessName, ownerName, domain]);



  return (
    <div className="ai-results-container">
      <div className="ai-section section">
        <h3>🧠 Deep Business + Owner Insight</h3>
        {deepSearch.loading && <p>Loading deep search...</p>}
        {deepSearch.error && <p className="error-text">{deepSearch.error}</p>}
        {!deepSearch.loading && !deepSearch.result && !deepSearch.error && (
          <p>No deep insight found.</p>
        )}
        {!deepSearch.loading && deepSearch.result && (
          <ReactMarkdown>{deepSearch.result}</ReactMarkdown>
        )}
      </div>

      <div className="ai-section section">
        <h3>🌐 Website Search Analysis</h3>
        {websiteSearch.loading && <p>Loading website analysis...</p>}
        {websiteSearch.error && <p className="error-text">{websiteSearch.error}</p>}
        {!websiteSearch.loading && !websiteSearch.result && !websiteSearch.error && (
          <p>No website data found.</p>
        )}
        {!websiteSearch.loading && websiteSearch.result && (
          <>
            {websiteSearch?.result?.domain && (
              <p><strong>Domain:</strong> {websiteSearch.result.domain}</p>
            )}
            {websiteSearch?.result?.events?.registration && (
              <p><strong>Registered Date:</strong> {formatDate(websiteSearch.result.events.registration)}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
