const Claims = require('../models/Claims');

// POST: Create a new expense claim
exports.createExpenseClaim = async (req, res) => {
  try {
    // Assuming the full expense claim data is sent in req.body, including expenses array with fileurl

    const {
      fromDate,
      toDate,
      name,
      approvedBy,
      notes,
      expenses,    // this contains your array with each object having fileurl already
      totalAmount,
    } = req.body;

    // Validate data here if needed...

    // Save to DB (replace with your DB model logic)
    const newClaim = new Claims({
      userId: req.user.id,  // from auth middleware
      fromDate,
      toDate,
      name,
      approvedBy,
      notes,
      expenses,        // save the whole array as-is, including fileurl for each expense
      totalAmount,
    });

    await newClaim.save();

    res.status(201).json({ message: "Expense claim created successfully", claim: newClaim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create expense claim" });
  }


};




exports.getExpenseClaim = async (req, res) => {
  try {
    console.log(req.user.id)
    const allClaims = await Claims.find({ userId: req.user.id }).sort({ createdAt: -1 }).select('-userId'); // latest first

    res.status(200).json({
      status: 200,
      counts: allClaims.length,
      results:allClaims,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getAllFormHistory = async (req, res) => {
  try {
    const forms = await Claims.find()
      .sort({ createdAt: -1 }) // Sort by most recent first
      .select('-__v'); // Optional: exclude unwanted fields like __v

    res.status(200).json({
      status: 200,
      counts: forms.length,
      results: forms,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


exports.deleteForm = async (req, res) => {
  try {
    const form = await FormHistory.findById(req.params.id);

    // If form not found
    if (!form) {
      return res.status(404).json({ status: 404, message: 'Form not found' });
    }

    // Check if the user is the owner
    if (form.user_id.toString() !== req.user.id) {
      return res.status(403).json({ status: 403, message: 'Unauthorized to delete this form' });
    }

    await form.deleteOne(); // or form.remove()

    res.status(200).json({
      status: 200,
      message: 'Form deleted successfully',
      results: [],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.editForm = async (req, res) => {
  try {
    const formId = req.params.id;

    const {
      business_name,
      owner_name,
      ein,
      domain
    } = req.body;

    const form = await FormHistory.findById(formId);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // 🔒 Optional: Only allow the owner to edit
    if (form.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to edit this form' });
    }

    // ✅ Update fields
    if (business_name) form.business_name = business_name;
    if (owner_name) form.owner_name = owner_name;
    if (ein) form.ein = ein;
    if (domain) form.domain = domain;

    // Optional: If EIN or business name changed, you might want to trigger new Ocrolus processing
    // (Only if needed; otherwise skip this)
    // const updatedBook = await addOcrolusBook(form, business_name, ein, [], res);
    // form.ocrolus_book_uuid = updatedBook.book_uuid;

    await form.save();

    res.status(200).json({
      message: 'Record updated successfully',
      results: form
    });
  } catch (err) {
    console.error('Edit form error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
//////////////// add deep search and website analysis in database ///////////////////////


// POST /api/history-results/update
exports.updateHistoryResults = async (req, res) => {
  try {
    const { form_id, deepsearch, websiteSearch } = req.body;

    if (!form_id) {
      return res.status(400).json({ message: 'Missing form_id' });
    }

    // 🔍 Look for existing record
    const existing = await HistoryResults.findOne({ form_id });

    if (!existing) {
      return res.status(404).json({ message: 'HistoryResults not found for this form_id' });
    }

    // ✅ Update fields only if provided
    if (typeof deepsearch !== 'undefined') {
      existing.deepsearch = deepsearch;
    }

    if (typeof websiteSearch !== 'undefined') {
      existing.websiteSearch = websiteSearch;
    }

    await existing.save();

    return res.status(200).json({
      message: 'HistoryResults updated successfully',
      results: existing
    });

  } catch (err) {
    console.error('❌ Error updating HistoryResults:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
///////////// get history record by from id ///////////////////////
exports.getHistoryByFormId = async (req, res) => {
  try {
    const { form_id } = req.params;

    if (!form_id) {
      return res.status(400).json({ message: "Missing form_id" });
    }

    const history = await HistoryResults.findOne({ form_id });

    if (!history) {
      return res.status(404).json({ message: "No history found for this form_id" });
    }

    res.status(200).json({
      message: '',
      results: history
    })
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};