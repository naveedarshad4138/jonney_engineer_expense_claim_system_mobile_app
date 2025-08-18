const FormHistory = require('../models/FormHistory');
const HistoryResults = require('../models/HistoryResults');
const { addOcrolusBook } = require('../utils/ocrolus/ocrolus');
const { searchUnicourtCases } = require('../utils/unicourt/unicourt');
const { searchMerchantByEIN } = require('../utils/datamerch/datamerch');

const multer = require('multer');
const User = require('../models/User');
const upload = multer({ storage: multer.memoryStorage() });

exports.addForm = [
  upload.array('attachments'),

  async (req, res) => {
    try {
      const {
        business_name,
        owner_name,
        ein,
        domain,
        search_type
      } = req.body;
      const user = await User.findById(req.user.id).select('username email');
      console.log(user)
      if (!business_name || !owner_name || !ein ) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      const attachments = req.files || [];
      /////////////////////////// Ocrolus api //////////////////////////////////
      // 🔍 Step 1: Find most recent form for this business
      let existingForm = await FormHistory
      .findOne({ business_name })
      .sort({ submitted_at: -1 });
      
      // 📘 Step 2: Handle Ocrolus Book (create or reuse)

      const { summary, book_uuid, bookResult } = await addOcrolusBook(existingForm, business_name, ein, attachments, res);
      /////////////////////////// Ocrolus api //////////////////////////////////
      // Optional: Fetch UniCourt cases
        let courtRecords = [];
          try {

            courtRecords = await searchUnicourtCases(business_name, owner_name, 'business');


          } catch (err) {
            console.error("UniCourt fetch error:", err);
          }
      /////////////////////////// Datamerch api //////////////////////////////////
      let datamerch=[];
        try {
          datamerch = await searchMerchantByEIN(ein);
        } catch (err) {
          console.error('❌ Failed to get merchant:', err.message);
        }
      ///////////////////////////Deapsearch api //////////////////////////////////
      let deepsearch = [];
    //   if(search_type === 'deep') {
    //       try {

    //           const result = await fetchDeepResearch(business_name, owner_name);

    //           if (result.error) {
    //             // API returned an error (but not a crash)
    //             console.error("Deep Research Error:", result.error);
    //             deepsearch =  result.error ;
    //           }

    //           // ✅ Successful response from Stack AI
    //           deepsearch =  result ;

    //       } catch (err) {
    //         // ❌ Unhandled exception (e.g., code bug, axios crashed, etc.)
    //         console.error("Unexpected error:", err);
    //       }
    //     }
      ///////////////////////////Deapsearch api //////////////////////////////////
      
      // 📄 Step 3: Save or update form record
      // if (!existingForm) {
        existingForm = new FormHistory({
          user_id: req.user.id,
          business_name,
          owner_name,
          ein,
          name: user.username,     // snapshot of name
          email: user.email,    // snapshot of email
          domain,
          ocrolus_book_uuid: book_uuid,
        });
      // } else {
      //   existingForm.ocrolus_book_uuid = book_uuid;
      // }

      await existingForm.save();
      ///////////////// save history //////////////////////////
      // 📦 Save results to HistoryResults
      const historyResult = new HistoryResults({
        form_id: existingForm._id,
        book: bookResult,
        summary,
        courtRecords,
        datamerch,
        deepsearch
      });

      await historyResult.save();

      return res.status(201).json({
        message: 'Form submitted successfully',
        form: existingForm,
        formId: existingForm._id,
        book: bookResult,
        summary,
        courtRecords,
        datamerch,
        deepsearch
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server Error', error: err.message });
    }
  }
];


// exports.addForm = async (req, res) => {
//   try {
//     const {
//       business_name,
//       owner_name,
//       ein,
//       name,
//       email,
//       domain,
//     } = req.body;

//     const form = new FormHistory({
//       user_id: req.user.id, // user from token
//       business_name,
//       owner_name,
//       ein,
//       name,
//       email,
//       domain,
//     });

//     await form.save();

//     res.status(201).json({
//       status: 201,
//       message: 'Form submitted successfully',
//       results:form,
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
exports.getFormHistory = async (req, res) => {
  try {
    const forms = await FormHistory.find({ user_id: req.user.id }).sort({ submitted_at: -1 }).select('-user_id'); // latest first

    res.status(200).json({
      status: 200,
      counts: forms.length,
      results:forms,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.getAllFormHistory = async (req, res) => {
  try {
    const forms = await FormHistory.find()
      .sort({ submitted_at: -1 }) // Sort by most recent first
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