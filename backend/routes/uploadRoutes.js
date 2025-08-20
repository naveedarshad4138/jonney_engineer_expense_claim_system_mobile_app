// routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

router.post('/upload-file', upload.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  return res.status(200).json({
    message: 'Upload successful',
    results: {fileUrl: `${req.file.filename}`},
  });
});
//  DELETE uploaded file
router.delete('/delete-file', (req, res) => {
  const { fileUrl } = req.query;
  console.log(fileUrl)

  if (!fileUrl) {
    return res.status(400).json({ message: 'Missing fileUrl' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', fileUrl);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('File deletion failed:', err);
      return res.status(500).json({ message: 'Failed to delete file' });
    }

    return res.status(200).json({ message: 'File deleted successfully' });
  });
});


module.exports = router;
