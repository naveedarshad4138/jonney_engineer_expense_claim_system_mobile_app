import React from "react";
import ReactMarkdown from "react-markdown";

const StackAIDeepSearchResults = ({ loading, error, output }) => {
  return (
    <div className="section">
      <h2>🧠 Deep Search</h2>
      {loading && <p>Loading Deep Search...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && output && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "1rem",
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
          }}
        >
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default StackAIDeepSearchResults;
