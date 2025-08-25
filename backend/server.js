const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
// const basePath = '/API/naveed/2025/steddy_web/backend';
const basePath = '';

dotenv.config();
const app = express();

// 🔌 Increase request/response timeout to 30 minutes (1800000 ms)
app.use((req, res, next) => {
  req.setTimeout(1800000);  // 30 mins
  res.setTimeout(1800000);  // 30 mins
  next();
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(basePath + '/api/auth', require('./routes/auth'));
app.use(basePath + '/api/form', require('./routes/expenseClaimRoutes'));
//////////// For upload file ///////////////////
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Uploads path:', path.join(__dirname, 'uploads'));
app.use('/api', require('./routes/uploadRoutes'));

app.get(basePath + '/', (req, res) => {
  res.send('✅ Hello API is working!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
