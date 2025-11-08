const admin = require('firebase-admin');
const User = require('../models/User');

// Middleware to verify Firebase token and attach user to req.user
// Supports DEV_AUTH_BYPASS: if set to 'true', accept header 'x-dev-user' with an email
module.exports = async function (req, res, next) {
  try {
    // Dev bypass mode
    if (process.env.DEV_AUTH_BYPASS === 'true') {
      const devEmail = req.headers['x-dev-user'];
      if (!devEmail) return res.status(401).json({ message: 'DEV_AUTH_BYPASS enabled but no x-dev-user header provided' });
      let user = await User.findOne({ email: devEmail });
      if (!user) {
        user = await User.create({ email: devEmail, name: devEmail.split('@')[0], role: 'ADMIN' });
      }
      req.user = user;
      return next();
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
    const idToken = authHeader.split(' ')[1];
    if (!admin.apps.length) {
      // Firebase Admin not initialized - return 401 so clients can proceed in dev if configured
      return res.status(401).json({ message: 'Server firebase not configured. Set FIREBASE_SERVICE_ACCOUNT in env.' });
    }
    const decoded = await admin.auth().verifyIdToken(idToken);
    // find or create user in DB
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({ email: decoded.email, name: decoded.name || decoded.email, role: 'MEMBER' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ message: 'Invalid auth token' });
  }
};
