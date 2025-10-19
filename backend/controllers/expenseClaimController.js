const axios = require('axios');
const FormData = require('form-data');


const Claims = require('../models/Claims');

// POST: Create a new expense claim
const User = require('../models/User');  // Make sure you require the User model

  exports.createExpenseClaim = async (req, res) => {
    try {
        const userId = req.user.id;
        const { generalInfo, jobs, total } = req.body;

        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // Fetch user to access float values
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const claimTotal = parseFloat(total?.subtotal || 0);

        // Check if user has enough float
        if (user.currentFloat < claimTotal) {
            return res.status(400).json({
            message: `Insufficient float. Available: £${user.currentFloat.toFixed(2)}, Required: £${claimTotal.toFixed(2)}.`,
          });
        }

        // Deduct claim amount from currentFloat
        user.currentFloat -= claimTotal;
        await user.save();

        // Create the claim
        const claim = new Claims({
          userId,
          generalInfo,
          jobs,
          total,
        });

        await claim.save();

        res.status(201).json({
          message: 'Expense claim submitted & float deducted.',
          results: claim,
          updatedFloat: user.currentFloat,
        });

    } catch (error) {
      console.error('Claim submission error:', error);
      res.status(500).json({ error: 'Failed to submit claim' });
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
exports.getAllExpenseHistory = async (req, res) => {
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

// DELETE: Delete a specific expense claim by ID
exports.deleteExpenseClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing claim ID" });
    }

    const deletedClaim = await Claims.findByIdAndDelete(id);

    if (!deletedClaim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json({
      message: "Claim deleted successfully",
      results: deletedClaim,
    });

  } catch (error) {
    console.error("❌ Error deleting claim by ID:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid claim ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.editForm = async (req, res) => {
//   try {
//     const formId = req.params.id;

//     const {
//       business_name,
//       owner_name,
//       ein,
//       domain
//     } = req.body;

//     const form = await FormHistory.findById(formId);

//     if (!form) {
//       return res.status(404).json({ message: 'Form not found' });
//     }

//     // 🔒 Optional: Only allow the owner to edit
//     if (form.user_id.toString() !== req.user.id) {
//       return res.status(403).json({ message: 'Unauthorized to edit this form' });
//     }

//     // ✅ Update fields
//     if (business_name) form.business_name = business_name;
//     if (owner_name) form.owner_name = owner_name;
//     if (ein) form.ein = ein;
//     if (domain) form.domain = domain;

//     // Optional: If EIN or business name changed, you might want to trigger new Ocrolus processing
//     // (Only if needed; otherwise skip this)
//     // const updatedBook = await addOcrolusBook(form, business_name, ein, [], res);
//     // form.ocrolus_book_uuid = updatedBook.book_uuid;

//     await form.save();

//     res.status(200).json({
//       message: 'Record updated successfully',
//       results: form
//     });
//   } catch (err) {
//     console.error('Edit form error:', err.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// };
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
// GET: Fetch a specific expense claim by ID
exports.getExpenseClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing claim ID" });
    }

    const claim = await Claims.findById(id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json({
      message: '',
      results: claim
    });

  } catch (error) {
    console.error("❌ Error fetching claim by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// PATCH: Cancel claim and restore float (soft delete)
exports.cancelExpenseClaimById = async (req, res) => {
  try {
    const { id } = req.params;
console.log(id)
    if (!id) return res.status(400).json({ message: "Missing claim ID" });

    // 1. Find the claim
    const claim = await Claims.findById(id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const userId = claim.userId;
    const refundAmount = Number(claim.total?.subtotal || 0);

    // Prevent cancel if already canceled or approved
    if (claim.status === 'Rejected') {
      return res.status(400).json({ message: "Claim already canceled" });
    }
    if (claim.status === 'Approved') {
      return res.status(400).json({ message: "Approved claims cannot be canceled" });
    }
    console.log(userId)
    // 2. Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Restore float
    user.currentFloat += refundAmount;
    await user.save();

    // 4. Mark claim as canceled
    claim.status = "Rejected";
    await claim.save();

    res.status(200).json({
      message: "Claim canceled and float restored",
      results: {
        claimId: claim._id,
        newClaimStatus: claim.status,
        newUserFloat: user.currentFloat,
        refundedAmount: refundAmount
      }
    });

  } catch (error) {
    console.error("❌ Error canceling claim:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
// PATCH: Approve claim and set approvedBy field
exports.approveExpenseClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (!id) return res.status(400).json({ message: "Missing claim ID" });

    // 1. Fetch claim
    const claim = await Claims.findById(id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot approve a claim that is already ${claim.status}` });
    }

    // 2. Fetch admin user (approver)
    const adminUser = await User.findById(adminId);
    if (!adminUser) return res.status(404).json({ message: "Approver not found" });

    // 3. Update claim's status and approver
    claim.status = "Approved";
    claim.generalInfo = {
      ...claim.generalInfo,
      approvedBy: adminUser.username
    };

    // 4. Prepare FormData for QuickBooks PHP API
    const form = new FormData();
    form.append("customerName", claim.generalInfo?.name || "Unknown");
    form.append("amount", Number(claim.total?.subtotal || 0));
    form.append("date", claim.generalInfo?.toDate || new Date().toISOString().split('T')[0]);
    form.append("creditCardAccountId", "42");
    form.append("expenseAccountId", "58");

    // 5. Append PDF file if uploaded
    if (req.file) {
      form.append('pdf', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      console.log("✅ File received:", req.file.originalname);
    } else {
      console.warn("⚠️ No file received in req.file");
    }

    // 6. Send to QuickBooks PHP API
    const qbResponse = await axios.post(
      'https://advancedbml.engineering/api/quickbook/add_expense.php',
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    );

    console.log("✅ QuickBooks PHP sync result:", qbResponse.data);

    // 7. Save QuickBooks data into claim
    const purchase = qbResponse.data?.purchase;
    const attachment = qbResponse.data?.attachment?.AttachableResponse?.[0]?.Attachable;

    if (qbResponse.data.success && purchase && attachment) {
      claim.quickbooks = {
        purchaseId: purchase.Id,
        attachmentId: attachment.Id,
        attachmentUrl: attachment.TempDownloadUri || attachment.FileAccessUri,
        syncedAt: new Date(),
        fullResponse: qbResponse.data
      };
    }

    // 8. Save claim
    await claim.save();

    // 9. Respond
    res.status(200).json({
      message: "Claim approved and QuickBooks sync triggered",
      results: {
        claimId: claim._id,
        status: claim.status,
        approvedBy: adminUser.username,
        quickbooksResponse: qbResponse.data
      }
    });

  } catch (error) {
    console.error("❌ Error approving claim:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


