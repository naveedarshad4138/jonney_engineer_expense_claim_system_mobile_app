const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const decodeToken = req.header('x-auth-token');
  if (!decodeToken) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Decode from Base64
    const decodedStr = Buffer.from(decodeToken, 'base64').toString('utf-8');
    // console.log('decodedStr:', decodedS);
    const {token} = JSON.parse(decodedStr);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};