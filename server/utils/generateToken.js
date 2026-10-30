const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

module.exports = generateToken;
