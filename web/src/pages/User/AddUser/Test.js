import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

// DeepSearch Component
const DeepSearch = ({ businessName, ownerName }) => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeepResearch = async () => {
    setLoading(true);
    setError(null);

    const API_URL =
      "https://api.stack-ai.com/inference/v0/run/d83dhj41-72b0-4fd7-65ce-90ef9bd681b7/685c9fad1e4c036587e9a648";

    const headers = {
      Authorization: "Bearer 6302a599-d9eb-416b-8df7-31da557f0415", // don't expose in prod
      "Content-Type": "application/json",
    };

    const payload = {
      "in-0": businessName,
      "in-1": ownerName,
      user_id: "123",
    };

    try {
      const response = await axios.post(API_URL, payload, { headers });
      const data = response.data["out-0"];

      if (data && data.trim() !== "") {
        setResult(data);
      } else {
        setError("No data found");
      }
    } catch (err) {
      setError("Failed to fetch Deep Research: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeepResearch();
  }, []);

  if (loading) return <p>Loading Deep Research results...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!result) return <p>No Deep Research data found.</p>;

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        padding: "1rem",
        borderRadius: "8px",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
        <div className="section">
        <div className="deep-search-results">
        <h3>🧠 Deep Business + Owner Insight</h3>
        <ReactMarkdown>{result}</ReactMarkdown>
        </div>
    </div>
      
    </div>
  );
};

// WebsiteSearch Component (Placeholder for now)
const WebsiteSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Placeholder effect simulating fetch
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate async fetch with timeout
    setTimeout(() => {
      // Example: No results found, or set error here
      setResult(null);
      // setError("Website search failed"); // uncomment to test error
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) return <p>Loading Website Search results...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!result) return <p>No Website Search data found.</p>;

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        padding: "1rem",
        borderRadius: "8px",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      {/* Render actual website search result here */}
      <div className="section">
        <div className="deep-search-results">
        <h3>🧠 Website Analysis</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
    </div>
      <p>{result}</p>
    </div>
  );
};

// Main Component
export const Test = () => {
  const businessName = "The Vibration Guys LLC";
  const ownerName = "Kathy Staudt";

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Business Research</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Deep Research</h2>
        <DeepSearch businessName={businessName} ownerName={ownerName} />
      </section>

      <section>
        <h2>Website Search</h2>
        <WebsiteSearch />
      </section>
    </div>
  );
};
