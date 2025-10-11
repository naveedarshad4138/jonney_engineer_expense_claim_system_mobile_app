import React from "react";
import ReactMarkdown from "react-markdown";

const StackAIWebsiteAnalysisResults = ({ loading, error, output }) => {
  return (
    <div className="section">
      <h2>🌐 Website Analysis</h2>
      {loading && <p>Loading Website Analysis...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && output && (
        <div
          style={{
            background: "#eef3f7",
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

export default StackAIWebsiteAnalysisResults;
