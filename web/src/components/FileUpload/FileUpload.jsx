import React, { useRef, useState } from 'react';

const FileUpload = ({ setIsLoading }) => {
  const [fileNames, setFileNames] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileNames(files.map(f => f.name));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setFileNames(files.map(f => f.name));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
   
    <div className="form-group">
       <label htmlFor="uploadfile">Upload file</label>
      <div
        id="fileDropArea"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #ccc',
          padding: '30px',
          borderRadius: '10px',
          cursor: 'pointer',
          textAlign: 'center',
          marginBottom: '20px'
        }}
      >
        Drag & Drop or Click to Upload PDF Files
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="application/pdf"
        style={{ display: 'none' }}
      />

      <ul>
        {fileNames.map((name, idx) => (
          <li key={idx}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
