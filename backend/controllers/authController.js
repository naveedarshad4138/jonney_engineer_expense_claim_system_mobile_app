const User = require('../models/User');
const FormHistory = require('../models/FormHistory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail, saveOtpGetLink, sendEmail } = require('../utils/sendmail');

// Register User
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({status:'400',message: 'User already exists',results:[]  });
    }

    user = new User({ username, email, password, role });
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      
      res.status(200).json({status:'200',token,expiresIn:'3600',results:[]  });
    });
     const token = await saveOtpGetLink(email, 60); // 60 minutes expiry
    const resetLink = `${process.env.CLIENT_URL}/reset_password?token=${encodeURIComponent(token)}`;
    
      const html = `
      <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h1>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px;">Hi,</p>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    You requested to reset your password. Click the button below to reset it:
                                </p>
                                <table role="presentation" style="margin: 0 auto;">
                                    <tr>
                                        <td style="border-radius: 5px; background: #667eea;">
                                            <a href="${resetLink}" style="display: inline-block; padding: 15px 30px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px;">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin: 30px 0 10px 0; color: #999999; font-size: 14px;">This link will expire in 1 hour.</p>
                                <p style="margin: 0; color: #999999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
      `;
    
      await sendEmail(email, "Reset Your Steddy Password", html);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: ' Incorrect password. Please try again.' });
    }

    const payload = { user: { id: user.id, role:user?.role, username: user?.username } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({status:'200',token,expiresIn:'3600',results:[]  });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get User Data (Protected Route)
exports.getUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId).select('-password');
    res.status(200).json({status:200, results: user});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
//Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow if user is updating their own info OR is an admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fields allowed to be updated
    const allowedUpdates = ['username', 'email', 'role'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
  // await sendOtpEmail(req.body.email);
    return res.status(200).json({
      status: 200,
      message: 'User updated successfully',
      results: updatedUser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
// Delete User 
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // 1. Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Delete all form history associated with the user
    await FormHistory.deleteMany({ user_id: userId });

    res.status(200).json({
      status: 200,
      message: 'User and related form history deleted successfully',
      results: [],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
// GEt all users Data
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.status(200).json({
      status: 200,
      type:true,
      count: users.length,
      results: users,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ type:false, status:false, message: 'Server Error' });
  }
};
////////////////// Send otp /////////////////
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    const token = await saveOtpGetLink(email, 60); // 60 minutes expiry
    const resetLink = `${process.env.CLIENT_URL}/reset_password?token=${encodeURIComponent(token)}`;
    
      const html = `
      <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 40px; text-align: center;">
                                <h1 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h1>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px;">Hi,</p>
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                                    You requested to reset your password. Click the button below to reset it:
                                </p>
                                <table role="presentation" style="margin: 0 auto;">
                                    <tr>
                                        <td style="border-radius: 5px; background: #667eea;">
                                            <a href="${resetLink}" style="display: inline-block; padding: 15px 30px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 5px;">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin: 30px 0 10px 0; color: #999999; font-size: 14px;">This link will expire in 1 hour.</p>
                                <p style="margin: 0; color: #999999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
      `;
    
      await sendEmail(email, "Reset Your Steddy Password", html);
      res.status(200).json({
        status: 200,
        message: 'Email sent successfully! Please check your inbox.',
        results: [],
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.verifyOtp = async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  res.status(200).json({ status:200, message: 'Password reset successful', results:[]  });
};

// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: ' Incorrect password. Please try again.' });
    }

    user.password = await newPassword;
    await user.save();

    res.status(200).json({ data:{status:200, message: 'Password updated successfully.', type: true} });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

