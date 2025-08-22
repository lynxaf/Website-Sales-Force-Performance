const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; 
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token kedaluwarsa.' });
      }
      res.status(401).json({ message: 'Tidak diizinkan, token tidak valid.' });
    }
  } else {
    res.status(401).json({ message: 'Tidak diizinkan, tidak ada token.' });
  }
};

const authorize = (roles = []) => {
  // Jika 'roles' adalah string, ubah menjadi array untuk kemudahan
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Periksa apakah peran pengguna (dari token) termasuk dalam peran yang diizinkan
    if (!roles.includes(req.user.role)) {
      // Jika tidak, kirimkan respons 'Forbidden'
      return res.status(403).json({ message: 'Akses ditolak.' });
    }
    // Jika peran cocok, lanjutkan ke middleware atau controller berikutnya
    next();
  };
};

module.exports = { protect, authorize };