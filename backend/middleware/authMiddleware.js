const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      res.status(401).json({ message: 'Tidak diizinkan, token gagal.' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Tidak diizinkan, tidak ada token.' });
  }
};
module.exports = { protect };