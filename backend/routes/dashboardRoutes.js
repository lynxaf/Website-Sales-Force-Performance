const express = require('express');
const router = express.Router();
const { uploadSalesData, getOverallPerformance, getMetrics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'reports/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// router.post('/upload', protect, upload.single('sales_data'), uploadSalesData);
// router.get('/overall', protect, getOverallPerformance);
// router.get('/metrics', protect, getMetrics);

router.post('/upload', upload.single('sales_data'), uploadSalesData);
router.get('/overall', getOverallPerformance);
router.get('/metrics', getMetrics);

module.exports = router;
