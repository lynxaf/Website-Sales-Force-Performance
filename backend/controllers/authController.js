const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  const { nama, email, role, password, password_confirmation } = req.body;

  try {
    if (password !== password_confirmation) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ nama, email, role, password: hashedPassword });
    res.status(201).json({ message: 'Registrasi berhasil, silakan login.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: 'Email atau password salah.' });
//     }
//     const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }
    // Tambahkan 'role' ke dalam payload token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };