const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');

console.log('Loading dashboard routes...');


let dashboardController;
try {
  dashboardController = require('../controllers/dashboardController');
  console.log('✅ Dashboard controller loaded successfully');
} catch (error) {
  console.error('❌ Failed to load dashboard controller:', error.message);
  throw error;
}


const reportsDir = path.resolve('./reports');
if (!fs.existsSync(reportsDir)) {
  console.log('Creating reports directory:', reportsDir);
  fs.mkdirSync(reportsDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Multer destination:', reportsDir);
    cb(null, reportsDir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Multer filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('File filter - checking:', file.originalname, file.mimetype);

    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    const allowedExtensions = /\.(xlsx|xls|csv)$/i;

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
      console.log('✅ File accepted');
      cb(null, true);
    } else {
      console.log('❌ File rejected');
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'));
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  console.log('Dashboard test route accessed');
  res.json({
    success: true,
    message: 'Dashboard routes working',
    timestamp: new Date().toISOString(),
    reportsDir: reportsDir
  });
});

// Upload route - using your expected field name
// router.post('/upload', protect, authorize('admin'), (req, res, next) => {
//   console.log('=== UPLOAD ROUTE ACCESSED ===');
//   console.log('Request method:', req.method);
//   console.log('Content-Type:', req.get('Content-Type'));

//   // Apply multer middleware with the field name your frontend uses
//   upload.single('sales_data')(req, res, (uploadError) => {
//     if (uploadError) {
//       console.error('❌ Multer error:', uploadError.message);
//       return res.status(400).json({
//         success: false,
//         msg: 'File upload error: ' + uploadError.message,
//         error: uploadError.code
//       });
//     }

//     console.log('✅ Multer processed file successfully');
//     console.log('File info:', req.file);

//     // Call your existing controller function
//     try {
//       dashboardController.uploadSalesData(req, res);
//     } catch (controllerError) {
//       console.error('❌ Controller error:', controllerError);
//       res.status(500).json({
//         success: false,
//         msg: 'Controller error: ' + controllerError.message
//       });
//     }
//   });
// });

router.post('/upload', (req, res, next) => {
  console.log('=== UPLOAD ROUTE ACCESSED ===');
  console.log('Request method:', req.method);
  console.log('Content-Type:', req.get('Content-Type'));

  // Apply multer middleware with the field name your frontend uses
  upload.single('sales_data')(req, res, (uploadError) => {
    if (uploadError) {
      console.error('❌ Multer error:', uploadError.message);
      return res.status(400).json({
        success: false,
        msg: 'File upload error: ' + uploadError.message,
        error: uploadError.code
      });
    }

    console.log('✅ Multer processed file successfully');
    console.log('File info:', req.file);

    // Call your existing controller function
    try {
      dashboardController.uploadSalesData(req, res);
    } catch (controllerError) {
      console.error('❌ Controller error:', controllerError);
      res.status(500).json({
        success: false,
        msg: 'Controller error: ' + controllerError.message
      });
    }
  });
});

// Overall performance route
// router.get('/overall', protect, authorize(['admin', 'leader', 'sales']), (req, res, next) => {
//   console.log('Overall performance route accessed');
//   try {
//     dashboardController.getOverallPerformance(req, res);
//   } catch (error) {
//     console.error('❌ Overall performance error:', error);
//     next(error);
//   }
// });

router.get('/overall', (req, res, next) => {
  console.log('Overall performance route accessed');
  try {
    dashboardController.getOverallPerformance(req, res);
  } catch (error) {
    console.error('❌ Overall performance error:', error);
    next(error);
  }
});

// router.get('/overall/monthly', protect, authorize(['admin', 'leader', 'sales']), (req, res, next) => {
//   console.log('Overall monthly performance route accessed');
//   try {
//     dashboardController.getMonthlyPerformance(req, res);
//   } catch (error) {
//     console.error('❌ Overall monthly performance error:', error);
//     next(error);
//   }
// });
router.get('/overall/monthly', (req, res, next) => {
  console.log('Overall monthly performance route accessed');
  try {
    dashboardController.getMonthlyPerformance(req, res);
  } catch (error) {
    console.error('❌ Overall monthly performance error:', error);
    next(error);
  }
});

// Total PS per month route
// router.get('/overall/monthly/total', protect, authorize(['admin', 'leader', 'sales']), (req, res, next) => {
//   console.log('Total PS per month route accessed');
//   try {
//     dashboardController.getTotalPsPerMonth(req, res);
//   } catch (error) {
//     console.error('❌ Total PS per month error:', error);
//     next(error);
//   }
// });
router.get('/overall/monthly/total', (req, res, next) => {
  console.log('Total PS per month route accessed');
  try {
    dashboardController.getTotalPsPerMonth(req, res);
  } catch (error) {
    console.error('❌ Total PS per month error:', error);
    next(error);
  }
});

// Metrics route
// router.get('/metrics', protect, authorize(['admin', 'leader', 'sales']), (req, res, next) => {
//   console.log('Metrics route accessed');
//   try {
//     dashboardController.getMetrics(req, res);
//   } catch (error) {
//     console.error('❌ Metrics error:', error);
//     next(error);
//   }
// });
router.get('/metrics', (req, res, next) => {
  console.log('Metrics route accessed');
  try {
    dashboardController.getMetrics(req, res);
  } catch (error) {
    console.error('❌ Metrics error:', error);
    next(error);
  }
});

console.log('✅ Dashboard routes configured successfully');

module.exports = router;