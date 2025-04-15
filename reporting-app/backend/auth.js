const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key_here'; // Change to a secure key in production

// Hardcoded users for demo
const users = [
  { username: 'user', password: 'user', role: 'user' },
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'teknisi', password: 'teknisi', role: 'teknisi' }
];

// Authenticate user and return JWT token
function authenticate(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;
  const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '8h' });
  return token;
}

// Middleware to verify token and set req.user
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token required' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Middleware for role-based access
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

module.exports = {
  authenticate,
  verifyToken,
  authorizeRoles
};
