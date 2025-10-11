import React, { useState, useRef } from 'react';
import './Dashboard.css';
import useApi from '../../hooks/useApi';
import Loader from '../../components/Loader/Loader';
import { ApiResultsModal } from '../../components/Modals/ApiResultsModal';
import {Layout} from '../../pages/Layout/Layout';
export const Dashboard = () => {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    ein: '',
    domain: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const { postData, loading, data } = useApi();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const nonDuplicateFiles = newFiles.filter(
      (newFile) =>
        !files.some((existingFile) =>
          existingFile.name === newFile.name && existingFile.size === newFile.size
    )
    );
    setFiles((prev) => [...prev, ...nonDuplicateFiles]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const nonDuplicateFiles = droppedFiles.filter(
      (newFile) =>
        !files.some((existingFile) =>
          existingFile.name === newFile.name && existingFile.size === newFile.size
        )
    );
    setFiles((prev) => [...prev, ...nonDuplicateFiles]);
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (search_type) => {
    formData.search_type = search_type;
    const formPayload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      formPayload.append(key, value);
    });

    files.forEach((file) => {
      formPayload.append('attachments', file); // 'files' key must match backend
    });

    try {
      await postData(
        '/form/add',
        formPayload,
        'Form submitted successfully!',
        'Form submission failed.',
        true // isMultipart = true
      );
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout page='Dashboard'>
        <h2>Welcome to dashboard</h2>
    {/* <div className="application-form">
      <div className="form-header">
        {/* <p>Please verify the information below for an AI-powered analysis</p> */}
      {/* </div> */}

      {/* <form id="business-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-section">
          <div className="section-title">🏢 Business Details</div>

          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              name="business_name"
              onChange={handleInputChange}
              required
              placeholder="Your Business LLC"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerName">Owner Name *</label>
            <input
              type="text"
              id="ownerName"
              name="owner_name"
              onChange={handleInputChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ein">EIN *</label>
            <input
              type="text"
              id="ein"
              name="ein"
              onChange={handleInputChange}
              required
              placeholder="12-3456789"
            />
          </div>

          <div className="form-group">
            <label htmlFor="domain">Website</label>
            <input
              type="text"
              id="domain"
              name="domain"
              onChange={handleInputChange}
              placeholder="example.com"
              />
          </div>

          <div className="form-group">
            <label htmlFor="uploadfile">Upload Files</label>
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

            <ul id='fileList'>
              {files.map((file, idx) => (
                <li key={idx}>
                  {file.name}
                  <button type="button" onClick={() => removeFile(idx)} style={{ marginLeft: '10px' }}>
                    ✖ Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="button-group">
          <button type="button" className="submit-btn" onClick={() => handleSubmit('app')} disabled={loading}>
            {loading ? 'Submitting...' : '🚀 Submit Application'}
          </button>
          <button type="button" className="submit-btn deep-search" onClick={() => handleSubmit('deep')} disabled={loading}>
            {loading ? 'Submitting...' : '🔍 Submit With Deep Search'}
          </button>
        </div>
      </form> 
      {loading && <Loader />}
      <ApiResultsModal setIsModalOpen={setIsModalOpen} results={data} isOpen={isModalOpen} formData={formData}/>
    </div> */}
    </Layout>
  );
};
