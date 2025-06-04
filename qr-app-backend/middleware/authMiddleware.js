const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from header
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log(decoded);
      // Check if the user's role is allowed
      console.log('Decoded role:', decoded.role);
      console.log(decoded.role);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access denied. You do not have permission.' });
      }

      // Attach the decoded user information to the request object
      req.user = decoded;
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid token.' });
    }
  };
};

module.exports = { authorize };