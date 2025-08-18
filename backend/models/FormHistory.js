const mongoose = require('mongoose');

const formHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  business_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  ein: { type: String, required: true },
  name: { type: String, required: true }, // Person filling the form?
  email: { type: String, required: true },
  submitted_at: { type: Date, default: Date.now },
  domain: { type: String },
  ocrolus_book_uuid: { type: String }
});

module.exports = mongoose.model('FormHistory', formHistorySchema);
