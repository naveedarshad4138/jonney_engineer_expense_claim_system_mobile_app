// models/HistoryResults.js
const mongoose = require('mongoose');

const HistoryResultsSchema = new mongoose.Schema({
  form_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FormHistory', required: true },
  book: { type: mongoose.Schema.Types.Mixed },
  summary: { type: mongoose.Schema.Types.Mixed },
  courtRecords: { type: Array, default: [] },
  datamerch: { type: Array, default: [] },
  deepsearch: { type: mongoose.Schema.Types.Mixed },
  websiteSearch: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HistoryResults', HistoryResultsSchema);
