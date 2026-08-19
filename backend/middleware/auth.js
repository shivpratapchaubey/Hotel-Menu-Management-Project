const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  let token = req.header('x-auth-token') || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorisation denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforhotelmenuapp');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
