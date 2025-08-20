const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const path = require('path');
const fs = require('fs');

const app = express();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

app.use(cors());
app.use(express.json());

const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// sequelize
//   .sync({ force: true })
//   .then(() => {
//     console.log('Database connected and models synchronized.');
//   })
//   .catch((err) => {
//     console.error('Failed to sync database:', err);
//   });

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});